
## 1. 概要

- Cloud Runは、コンテナ化されたアプリをサーバー管理不要で実行できるフルマネージドなサーバレス環境
- コンテナさえ作れば、言語を問わず動かせます。スケーリングが非常に速く、**「リクエストが来た時だけ課金」**されるため、コスパが非常に高い
- ステートレス（リクエストが終わるとデータが消える）な設計が必須な点に注意
- GCEであればOSの設定でいくらでも伸ばせますが、Cloud RunやGAEのようなマネージドサービスは、デフォルトのタイムアウト設定が厳格

## 2. 類似のサービスとの違い

## 3. Cloud Run 手元からデプロイする方法

### 3.1. Cloud Runにそのままデプロイする場合

(WIP)

### 3.2. Cloud Build を経由させる場合

```bash
gcloud config set project {プロジェクト名}

gcloud builds submit --config=infra/cloudbuild/cloud_run_api.yaml --substitutions=TAG_NAME=latest .

cd infra/run_specs

ytt -f agent_api_load_test_job_spec.yaml \
  -f value_templates/test/agent_api_load_test_job_values.yaml \
  --data-value TAG_NAME=${TAG_NAME:-latest} \
  > output.yaml

gcloud run jobs replace output.yaml --region=asia-northeast1
```

## 4. 段階的リリース（カナリア / Blue-Green）

新旧バージョンで挙動が異なる変更をリリースする際、旧バージョンと新バージョンを一定期間同時に稼働させ、トラフィックを徐々に新側へ寄せていく手法。大規模プロダクト（Twitter/Instagram等）でも一般的に採られているアプローチで、Cloud Runの「トラフィック分割」機能で同等のことができる。

### 4.1. Cloud Runでのトラフィック分割

```bash
# 新リビジョンをトラフィック0%でデプロイ（安全にビルド・確認だけ先に済ませる）
gcloud run deploy --no-traffic

# 旧90% / 新10%のように割合を指定して段階的に移行
gcloud run services update-traffic SERVICE --to-revisions=NEW=10,OLD=90

# 問題なければ徐々に引き上げ、最終的に100%へ。異常時は即座に旧側へ戻せる（ロールバック）
```

### 4.2. 一般的な段階的リリースの構成要素

- **カナリアリリース**: 1% → 5% → 25% → 100%のように少しずつトラフィック比率を上げながらエラー率・レイテンシを監視する。Kubernetes環境ではIstio/Envoyなどのサービスメッシュで実現されることが多い。
- **Feature Flag（機能フラグ）**: 「デプロイ（コードを配る）」と「リリース（機能を有効化する）」を分離する考え方。新旧コードは両方とも本番に存在し、ユーザーセグメントやランダムサンプリングでどちらの挙動を見せるか制御する（LaunchDarkly, Statsigなど）。ユーザーIDのハッシュ値で振り分けると、同一ユーザーに一貫した体験を保ちやすい。
- **後方互換性の担保**: 新旧が同時稼働する時間帯がある以上、APIやDBスキーマは両バージョンからアクセス可能な状態を維持する必要がある。例えばDBカラム追加は「nullableで追加 → 新旧両方が書き込み対応 → 旧バージョン退役後にNOT NULL化」のような多段階マイグレーションにする。
- **セッションアフィニティ**: 同一ユーザーが新旧を行き来すると体験が壊れやすいため、一度新バージョンに割り当てたユーザーはCookieやヘッダーで固定し、そのセッション中は同じバージョンで完走させる設計が一般的。

## 5. Cloud Run Jobs

- 常時稼働してリクエストを待ち受ける「サービス」とは別に、一度実行して終了するバッチ処理用のリソース
- 実行のたびに `Execution` が作成され、その中で指定したタスク数分の `Task`（コンテナインスタンス）が並列実行される

### 5.1. `gcloud run jobs describe` コマンド

ジョブの設定内容（コンテナイメージ、環境変数、CPU/メモリ、タスク数、リトライ回数、タイムアウトなど）や直近の実行状況を確認するコマンド。

```bash
gcloud run jobs describe JOB_NAME --region=REGION
```

- `--region`: ジョブが存在するリージョンを指定（未指定だとデフォルト設定を参照）
- `--format`: 出力形式（`yaml`, `json`, `value(...)` など）を指定でき、特定フィールドだけ抽出することも可能

```bash
# JSON形式で出力
gcloud run jobs describe my-job --region=asia-northeast1 --format=json

# コンテナイメージだけ抽出
gcloud run jobs describe my-job --region=asia-northeast1 \
  --format="value(spec.template.spec.template.spec.containers[0].image)"
```

似たコマンドに `gcloud run services describe`（サービス用）があるが、ジョブとサービスは別リソースなので混同しないよう注意する。

### 5.2. Job の YAML構造と `vpcAccess`

Cloud Run Job の spec は入れ子になっており、`spec.template`（ExecutionTemplate：ジョブ実行全体のテンプレート）の中に、さらに `spec.template.spec.template`（TaskTemplate：個々のタスクのテンプレート）が存在する。

```yaml
apiVersion: run.googleapis.com/v1
kind: Job
spec:
  template:              # ExecutionTemplate
    spec:
      template:           # TaskTemplate
        spec:
          containers:
            - image: ...
          vpcAccess:       # VPCネットワークへのアクセス設定
            connector: projects/PROJECT_ID/locations/REGION/connectors/CONNECTOR_NAME
            egress: ALL_TRAFFIC   # または PRIVATE_RANGES_ONLY
```

- `vpcAccess` は TaskTemplate 配下、つまり `template.template.vpcAccess` のパスに位置する（`gcloud run jobs describe --format` で特定フィールドを抽出する際もこのパス表記になる）
- `vpcAccess` の設定内容（コネクタ / Direct VPC egress / egressの選択肢）については [Cloud VPC](Cloud%20VPC.md) を参照
