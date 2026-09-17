# Cursor

AI機能を統合したコードエディタ（IDE）製品。[Codex CLI.md](./Codex%20CLI.md) や [Claude Code.md](./Claude%20Code.md) のような「基盤モデルを提供する会社」ではなく、**基盤モデルを使う側のツール**という別レイヤーの製品である点に注意（GPT/Claude/Grokと並べて比較するのは本来レイヤーが違う比較）。

## 1. モデルの扱い方

Cursorはモデル非依存（model-agnostic）で、エディタ内でモデルを切り替えて使える。

- GPT-5.6 Sol、Claude Opus、Gemini 3 Proなど他社の frontier モデルを状況に応じて選択可能
- 加えて自社開発の低遅延コーディング特化モデル **Composer** を持つ

## 2. Composer（自社モデル）

- Cursor（Anysphere社）が完全に自社開発したモデルで、他社モデルの再利用ではない
- コードベース全体のセマンティック検索と深く統合されており、多数のファイルにまたがる編集・長時間のツール多用セッションを想定した設計
- 現行のComposer 2.5はSWE-Bench MultilingualでClaude Opus 4.7と同水準、Cursor独自のCursorBenchではやや上回りつつ、コストは標準ティアで約1/10とされる
- 速度は同等の知能を持つモデル比で4倍速いとされ、インタラクティブな編集体験に効いている

## 3. 使い分けの考え方

- **Composer**: タイトな複数ファイル編集、diffレビューを伴う高速な反復作業向け
- **Agent Mode**: コードベース読み取り→編集→ターミナル実行→結果確認、を自律的に繰り返す長時間ループ向け。GPT-5.6 SolやClaude Opusなど、より重いモデルを充てることが多い

Cursorは「自社の速いモデルで軽い作業をこなしつつ、重い判断が要る場面では他社のフロンティアモデルに切り替える」というハイブリッド運用が前提の製品設計になっている。

## 4. 参考

- [Codex CLI.md](./Codex%20CLI.md)（同じくAIコーディングエージェント、ただしCLI専業でモデルはOpenAI製のみ）
- [MCP.md](./MCP.md)（CursorもMCP経由で外部ツールに接続する）
- [LLM.md](../LLM/LLM.md) 8節（GPT-5.6・Claude Fable 5などモデル面の位置付け）
