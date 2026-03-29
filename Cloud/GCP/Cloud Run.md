
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
