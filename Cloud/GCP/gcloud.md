## 1. gcloudコマンド

gcloud は 「何に対して（Group）」「何を（Command）」 するかを指定する、非常に規則正しい構造

`gcloud [Group / Subgroup] [Command] [Project/Resource ID] --flags`

- **Group:** `compute`, `container`, `sql`, `auth` など（サービス名）
- **Subgroup:** `instances`, `clusters`, `databases` など（リソース種別）
- **Command:** `list`, `describe`, `create`, `delete` など（アクション）

### 1.1. 初期設定・管理コマンド

| コマンド                                 | 内容                                               |
| ---------------------------------------- | -------------------------------------------------- |
| `gcloud init`                            | 初期設定（ログイン、プロジェクト選択、ゾーン選択） |
| `gcloud auth login`                      | Googleアカウントへのログイン（認証のみ）           |
| `gcloud config list`                     | 現在のアクティブな設定（プロジェクト等）を確認     |
| `gcloud config set project [PROJECT_ID]` | 操作対象のプロジェクトを切り替える                 |
| `gcloud components update`               | gcloud SDKを最新版にアップデート                   |

Google スプレッドシートにエクスポート
