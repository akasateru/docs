# 1. OpenClaw（オープンクロー）の使い方

OpenClawを導入した後のセットアップと基本的な使い方をまとめます。

## 1.1. 推奨セットアップ (Onboarding)

最も簡単で推奨される方法は、ターミナルで以下のコマンドを実行することです。
これによって、ゲートウェイ、ワークスペース、チャンネル、スキルの設定がステップバイステップで行われます。

```bash
# Node.js 24以上推奨
openclaw onboard --install-daemon
```

## 1.2. ゲートウェイの起動

OpenClawの「脳」となるゲートウェイサーバーを起動します。

```bash
# デフォルトポート 18789 で起動
openclaw gateway --port 18789 --verbose
```

## 1.3. 基本的な操作コマンド

ターミナルから直接アシスタントに指示を出したり、メッセージを送ったりできます。

- **アシスタントと会話する**:

  ```bash
  openclaw agent --message "今日のタスクをまとめて" --thinking high
  ```

- **特定の宛先にメッセージを送る**:

  ```bash
  openclaw message send --to +1234567890 --message "Hello from OpenClaw"
  ```

- **診断と修復**:

  ```bash
  openclaw doctor
  ```

## 1.4. チャットアプリからの操作コマンド

WhatsApp, Telegram, Slack などの連携したチャンネルから、以下のコマンドを送ることでOpenClawを操作できます。

- `/status`: 現在の状態（モデル、トークン、コスト等）を表示。
- `/new` または `/reset`: セッションをリセット。
- `/think <level>`: 思考レベルの変更 (off|minimal|low|medium|high|xhigh)。
- `/verbose on|off`: 詳細ログの表示切り替え。
- `/restart`: ゲートウェイを再起動（管理者のみ）。

## 1.5. 設定とファイル構成

- **設定ファイル**: `~/.openclaw/openclaw.json`
- **ワークスペース**: `~/.openclaw/workspace`
- **プロンプトファイル**: `AGENTS.md`, `SOUL.md`, `TOOLS.md` (ワークスペース内に配置)

## 1.6. セキュリティとプライバシー

- **DMペアリング**: 知らないユーザーからのメッセージはデフォルトで制限されます。
  - 承認する場合: `openclaw pairing approve <channel> <code>`
- **サンドボックス**: `openclaw.json` で設定することで、Dockerなどのサンドボックス環境で安全にコードを実行させることが可能です。

---

※ 詳細なドキュメントは [docs.openclaw.ai](https://docs.openclaw.ai) で確認できます。
