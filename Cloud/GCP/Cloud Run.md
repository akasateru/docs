
## 1. 概要

- Cloud Runは、コンテナ化されたアプリをサーバー管理不要で実行できるフルマネージドなサーバレス環境

## 2. Cloud Run 手元からデプロイする方法

### 2.1. Cloud Runにそのままデプロイする場合

(WIP)

### 2.2. Cloud Build を経由させる場合

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
