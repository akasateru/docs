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

## 2. `gcloud auth login` の内部動作

`gcloud auth login` は OAuth 2.0 の Authorization Code Flow（installed application 版）を使ってGoogleアカウントの認証情報を取得している。

### 2.1. 認証フローの流れ

1. **ローカルサーバー起動 + ブラウザ起動**: gcloud が `localhost` の空いているポートに一時的なHTTPサーバーを立ち上げ、その `redirect_uri` を使ってGoogleの認可エンドポイント（`accounts.google.com/o/oauth2/v2/auth`）へのURLをデフォルトブラウザで開く
   - `client_id` / `client_secret` は Google Cloud SDK 自体に埋め込まれたOAuthクライアントのもの（ユーザー個別のものではない）
   - デフォルトスコープは `cloud-platform`, `userinfo.email` など
2. **ユーザー認証・同意**: ブラウザ上でGoogleアカウントにログインし、「Google Cloud SDK がアカウントへのアクセスを求めています」という同意画面を承認する
3. **認可コードの受け取り**: 承認後、Googleがブラウザを `http://localhost:<port>/...?code=XXXX` にリダイレクトし、待ち受けていたgcloudのローカルHTTPサーバーが認可コード（`code`）を受け取る
4. **トークン交換**: gcloudが認可コードをGoogleのトークンエンドポイント（`oauth2.googleapis.com/token`）に送信し、アクセストークン（短命、~1時間）とリフレッシュトークン（長命）を取得する
5. **認証情報の保存**: 取得した資格情報は `~/.config/gcloud/credentials.db`（SQLite DB）に保存され、`~/.config/gcloud/active_config` でアクティブアカウントが管理される。以降のgcloudコマンドはリフレッシュトークンで自動的にアクセストークンを更新しながら利用する

### 2.2. `gcloud auth login` と `gcloud auth application-default login` の違い

- **`gcloud auth login`**: gcloud CLI自身が使う認証情報を取得する
- **`gcloud auth application-default login`**: ADC（Application Default Credentials）として `~/.config/gcloud/application_default_credentials.json` に保存され、クライアントライブラリ（Python/Node等のSDK）がデフォルトで参照する認証情報を取得する。client_id/secretも別のもの（ADC用OAuthクライアント）を使う

### 2.3. headless環境での認証

ブラウザが使えないheadless環境では `--no-launch-browser` オプションでOOB（out-of-band）風の手動コピペフローになる。
