## 1. Claude Code とは

Anthropic が開発したターミナル完結型の AI 開発アシスタント。コードの読み書き・実行・Git 操作などをエージェントが自律的に行う。

### 1.1. 特徴

- ローカルファイルへの直接アクセス（読み取り・編集・実行）
- 自律的なタスク実行（agentic ループ）
- Git 連携（コミット・PR 作成）
- MCP（Model Context Protocol）で外部サービスと接続
- Hooks でワークフローを自動化
- Skills で機能を拡張
- API 従量課金

### 1.2. 仕組み

Claude Code は Claude モデルの周りの **agentic ハーネス** として動く。
Claude Code におけるハーネスとは、エージェントが動作する環境全体 Skills, Hooks, Commands, Agents, Rules, MCP設定を指す

```text
ユーザー入力
   ↓
コンテキスト収集（ファイル読み取り・検索）
   ↓
アクション実行（編集・コマンド実行）
   ↓
結果の検証
   ↓ (繰り返し)
完了
```

---

## 2. 起動・基本操作

```bash
# プロジェクトルートで起動
claude

# 1回だけ実行して終了（非対話モード）
claude -p "テストを実行して結果を教えて"
```

---

## 3. スラッシュコマンド

| コマンド       | 説明                                          |
| -------------- | --------------------------------------------- |
| `/help`        | コマンド一覧を表示                            |
| `/clear`       | セッション履歴をクリア                        |
| `/compact`     | コンテキストを自動要約（長いセッション向け）  |
| `/cost`        | 現在のセッションのトークン使用量・費用を表示  |
| `/init`        | プロジェクトを分析して CLAUDE.md を自動生成   |
| `/memory`      | CLAUDE.md・auto memory の内容を確認・編集     |
| `/commit`      | 変更内容を分析してコミットメッセージを生成    |
| `/review`      | プルリクエストをレビュー                      |
| `/model`       | 使用モデルを切り替え（Opus / Sonnet / Haiku） |
| `/permissions` | ツール実行権限を確認・管理                    |
| `/add-dir`     | 追加ディレクトリへのアクセス権を付与          |

---

## 4. CLAUDE.md

セッション開始時に自動で読み込まれる**永続的な指示ファイル**。プロジェクトの規約やコマンドを記述しておくことで毎回同じ説明をする必要がなくなる。

### 4.1. 配置場所

| ファイル              | 適用範囲           | 用途                                     |
| --------------------- | ------------------ | ---------------------------------------- |
| `./CLAUDE.md`         | プロジェクト共通   | ビルドコマンド・規約・アーキテクチャ     |
| `~/.claude/CLAUDE.md` | 全プロジェクト共通 | 個人設定・好みのスタイル                 |
| `./CLAUDE.local.md`   | 個人用（非共有）   | ローカル URL など（`.gitignore` に追加） |

### 4.2. 書き方

- 200行以下で簡潔にまとめる
- 具体的なコマンドやルールを記述（曖昧な表現は避ける）
- `@path/to/file` で他ファイルをインポート可能

```markdown
## ビルドコマンド
- 起動: `npm run dev`
- テスト: `npm test`
- ビルド: `npm run build`

## コーディング規約
- インデント: 2スペース
- コンポーネントは関数型で書く
- テストファイルは `__tests__/` に置く
```

---

## 5. 権限モード

### 5.1. モード一覧

| モード        | 動作                                                           |
| ------------- | -------------------------------------------------------------- |
| `default`     | 初回ツール使用時のみ確認ダイアログを表示                       |
| `acceptEdits` | ファイル編集・基本操作を自動承認                               |
| `plan`        | 分析のみ（修正・実行不可）。読み取り専用で確認したいときに使う |

### 5.2. 許可・拒否ルール

`.claude/settings.json` で事前に設定できる。

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Read(./src/**/*.ts)"
    ],
    "deny": [
      "Bash(rm -rf *)"
    ]
  }
}
```

---

## 6. Hooks（フック）

ツール実行の前後など、特定タイミングにシェルコマンドや処理を自動実行する仕組み。

### 6.1. 主なイベント

| イベント       | 発火タイミング               |
| -------------- | ---------------------------- |
| `PreToolUse`   | ツール実行前（ブロック可能） |
| `PostToolUse`  | ツール実行後                 |
| `Stop`         | Claude の応答完了時          |
| `SessionStart` | セッション開始直後           |

### 6.2. 設定例

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"完了\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

---

## 7. MCP（Model Context Protocol）

Claude Code が外部サービスに接続するためのプロトコル。MCP サーバーを登録すると、Claude がそのサービスをツールとして使えるようになる。

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"]
    }
  }
}
```

主な用途：

- データベース操作
- Slack / GitHub など外部 API 連携
- ブラウザ操作（Puppeteer など）

---

## 8. Skills（スキル）

`/commit` や `/review` のように、スラッシュコマンドとして呼び出せる拡張機能。チームや個人で独自スキルを作成できる。

### 8.1. 作成方法

```bash
mkdir -p ~/.claude/skills/my-skill
```

`~/.claude/skills/my-skill/skill.md` にプロンプトを記述する。ネストされたディレクトリからも自動検出される。

---

## 9. Tips

- **コンテキストが長くなったら** `/compact` で要約する
- **読み取り専用で確認したいとき** は `plan` モードを使う
- **繰り返し作業** は Hooks や Skills で自動化する
- **重い調査タスク** はサブエージェントに投げるとメインのコンテキストを汚さない
- **チーム共有** は CLAUDE.md に書き、個人設定は CLAUDE.local.md に分ける

---

## 10. 参考

- [Claude Code ドキュメント（日本語）](https://code.claude.com/docs/ja/overview)
- [Claude Code の使用量上限とうまく付き合う方法](https://zenn.dev/long910/articles/2026-02-21-claude-code-usage-limit)
- [Claude Code で日常業務を爆速化する方法 - Qiita](https://qiita.com/minorun365/articles/114f53def8cb0db60f47)
