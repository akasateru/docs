# Bitbucket

## 1. 認証: API tokens with scopes への移行

2025年9月9日から、Bitbucket Cloudでは新しいApp passwordの作成ができなくなり、既存のものも2026年6月9日に完全廃止される。新しい統合にはAPI tokens with scopesを使う必要がある。

### 1.1. API トークンの作成

1. 右上のプロフィールアイコン → **Account settings**
2. Atlassianアカウントページの **Security** タブを選択
3. **Create and manage API tokens** → **Create API token with scopes**
4. トークン名・有効期限を設定 → アプリとして **Bitbucket** を選択
5. 必要なスコープ（権限）を選択

PRのコメントを閲覧するには `read:pullrequest:bitbucket` スコープが必要。ただしこのスコープは `read:repository:bitbucket` を含まないため、リポジトリ情報も必要な場合は別途追加する。

### 1.2. 認証時の注意点（用途で必要な識別子が違う）

| 用途 | 必要な識別子 | 確認場所 |
| --- | --- | --- |
| Git操作 | Bitbucketの**username** | Profile settings |
| REST API | Atlassianの**メールアドレス** | Personal settings → Email Aliases |

REST APIはBasic認証（`email:token` をBase64エンコード）を使う。App passwordの時と同じ形式。

```bash
curl --request GET \
  --url 'https://api.bitbucket.org/2.0/repositories/{workspace}/{repo}/pullrequests/{pr_id}/comments' \
  --user '{your_email@example.com}:{api_token}'
```

## 2. Claude Code から接続する

**公式Atlassian MCPサーバー**を使う方法が最もシンプル。API トークンを直接スクリプトに書く必要がなく、OAuth認証でそのまま使える。

プロジェクトルートに `.mcp.json` を作成:

```json
{
  "mcpServers": {
    "Atlassian": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://mcp.atlassian.com/v1/sse"]
    }
  }
}
```

または CLI で直接追加:

```bash
claude mcp add -s user atlassian npx -- -y mcp-remote@latest https://mcp.atlassian.com/v1/sse
```

`claude` コマンドをそのディレクトリで起動すると、Atlassianサイトへの認証を求めるプロンプトが自動で表示され、認証が完了すればBitbucket・Jira・Confluenceに接続できる。

接続確認: `claude mcp list`、またはセッション内で `/mcp`。

接続後はセッション内で自然言語のまま操作できる（例:「workspace/repoのPR #42のコメントを全部見せて」）。

## 3. 参考

- [Claude Code.md](../AI%20Integration/Claude%20Code.md)（MCP全般については§7を参照）
