# MCP（Model Context Protocol）

AIアプリケーションが外部のツール・データソースに接続するための、標準化された通信プロトコル。[Claude Code.md](./Claude%20Code.md) 7節でも触れているが、仕組み自体をここにまとめる。

## 1. 位置付け（APIとの違い）

MCPも広義にはAPIの一種だが、正確には**「AI向けに標準化されたAPI」**という位置付け。

- **普通のAPI（REST/GraphQLなど）**: サービスごとに仕様がバラバラ（エンドポイント名・認証方式・レスポンス形式が全部違う）。AIにそのAPIを使わせたい場合、「このAPIはこう呼ぶんだよ」という説明・変換コードを毎回人間が書く必要がある
- **MCP**: 「AIがツールを見つけて呼び出す手順そのもの」を統一規格にしたもの。MCPサーバーは中身では既存のAPI（REST APIやDB接続など）をラップし、`tools/list`（何ができるか教えて）→`tools/call`（これを実行して）という決まった形式で応答する。結果としてAIクライアント側は接続先が何のサービスか知らなくても、同じ手順で自動的に使い方を発見して呼び出せる

例えるなら、普通のAPIが「機器ごとに違う充電ケーブル」だとすると、MCPは「USB-Cのような統一規格」。中でつながっている先（既存API）はバラバラでも、差し込み口（呼び出し方）を統一することで、どのAIクライアントからでも同じやり方で使えるようにしている。

## 2. プロトコルの実体

- 通信形式は **JSON-RPC 2.0**（リクエスト/レスポンスをJSONでやり取りする古典的な規格）がベース
- 実体は仕様書（mdファイルなど）ではなく、**その仕様に従って実際に動くSDK・サーバー・クライアントのコード一式**
- サーバー（ツール提供側）が公開できるものは3種類の「プリミティブ」に標準化されている

| プリミティブ | 内容 |
|---|---|
| **Tools** | 実行可能な関数（例: ファイル検索、DB問い合わせ） |
| **Resources** | 参照用データ（例: ファイル内容、ドキュメント） |
| **Prompts** | 再利用可能なプロンプトテンプレート |

クライアント（Claude Code, Cursor, Codexなど）がサーバーに接続すると、まずお互い何ができるかをネゴシエーションし、その後 discovery（`*/list`）→ call（`tools/call`）という決まった手順でやり取りする。

## 3. 具体的なやり取りの例

GitHubのMCPサーバーで「issueを検索する」場合の4往復。

**① クライアント→サーバー: 何ができるか聞く（discovery）**

```json
{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }
```

**② サーバー→クライアント: 使えるツールの一覧と仕様を返す**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "search_issues",
        "description": "GitHubリポジトリのissueを検索する",
        "inputSchema": {
          "type": "object",
          "properties": {
            "repo": { "type": "string" },
            "query": { "type": "string" },
            "state": { "type": "string", "enum": ["open", "closed"] }
          },
          "required": ["repo", "query"]
        }
      }
    ]
  }
}
```

ここでAI側は「`search_issues`というツールがあって、`repo`と`query`を渡せば呼べる」ということをその場で学習する。事前にハードコードして覚えているわけではない。

**③ クライアント→サーバー: 実際にツールを呼ぶ**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "search_issues",
    "arguments": { "repo": "anthropics/claude-code", "query": "MCP timeout", "state": "open" }
  }
}
```

**④ サーバー→クライアント: 実行結果を返す**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      { "type": "text", "text": "issue #4821: MCP server connection timeout after 30s" }
    ]
  }
}
```

①②のdiscoveryにより、**どのAIクライアントも接続先ごとの個別実装なしに**同じ手順でツールを使える。もしMCPがなければ、Cursor用のGitHub連携コード、Claude Code用のGitHub連携コード…とツールの数×AIクライアントの数だけ個別実装が必要になっていたはず。「サーバー側を1回作れば、どのAIからでも繋がる」状態にしたのがMCPの本質的な価値。

## 4. 代表的なMCPサーバーの例

- **GitHub**: issue検索、PR作成、コードレビューコメント投稿
- **Filesystem**: ローカルのファイル読み書き（Claude CodeやCursorが裏で使っているのもこの系統）
- **Postgres/SQLite**: DBに直接SQLを投げて結果を取得
- **Slack**: チャンネル検索、メッセージ投稿
- **Gmail / Googleカレンダー / Googleドライブ**: メール検索・下書き作成、予定管理、ファイル検索など（各社のAPIをMCP形式でラップしたもの）
- **Puppeteer/Playwright**: ブラウザの自動操作

## 5. ガバナンス・エコシステム規模（2026年時点）

- 元々Anthropicが策定したが、2025年12月にLinux Foundation傘下のAgentic AI Foundationへ寄贈され、ベンダー中立の標準規格になった
- OpenAI・Google DeepMind・Microsoftも採用し、事実上のデファクトスタンダード
- SDKの月間ダウンロード数は約9,700万、公開サーバー登録数は約9,600件（2026年5月時点）
- コーディングエージェント（Claude Code, Gemini CLI, Codex, Cline, Aiderなど）がMCPの主要な利用先であり、同時にプロンプトインジェクションなどのセキュリティ攻撃の主要な標的にもなっている（[LLM.md](../LLM/LLM.md) 9節参照）
