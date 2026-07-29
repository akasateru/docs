
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
