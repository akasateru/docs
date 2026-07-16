## 1. このノートについて

「他の人は Claude Code をどう使っているか」を公式ドキュメント・Anthropic 社内事例・コミュニティ記事から収集したベストプラクティス集（2026年7月時点）。機能そのものの説明は [Claude Code.md](./Claude%20Code.md) を参照。

---

## 2. 大前提：コンテキストウィンドウが最重要リソース

ほぼすべてのベストプラクティスは「**コンテキストウィンドウはすぐ埋まり、埋まるほど性能が落ちる**」という制約から導かれる。

- 会話・読んだファイル・コマンド出力のすべてがコンテキストを消費する。1回のデバッグセッションで数万トークン消費することも普通
- コンテキストが埋まると、初期の指示を「忘れ」たりミスが増えたりする
- したがって「コンテキストに何を入れ、何を入れないか」を管理することが上級者と初心者の一番の違い

---

## 3. 公式が推奨するコアワークフロー

### 3.1. 探索 → 計画 → 実装 → コミット の4フェーズ

いきなりコードを書かせると「間違った問題を解く」コードができがち。Plan モード（Shift+Tab）で調査・計画を実装から分離する。

1. **探索**: Plan モードでファイルを読ませ、既存実装を理解させる（変更はさせない）
2. **計画**: 実装計画を作らせる。`Ctrl+G` でプランをエディタで直接編集してから進められる
3. **実装**: Plan モードを抜けて実装させ、テストを書かせて検証させる
4. **コミット**: 説明的なメッセージでコミット・PR 作成

ただし Plan モードにはオーバーヘッドがある。**diff を一文で説明できるような小さな修正なら計画は不要**。複数ファイルにまたがる変更・アプローチに迷いがある場合・不慣れなコードのときに使う。

大きな機能では「ステップ1だけやって止まって見せて」→レビュー→「続けて」と刻むと、6手目ではなく1手目で誤りに気づける。

### 3.2. 検証手段（フィードバックループ）を必ず与える

Claude は「できたように見えた」時点で止まる。**pass/fail を返すチェックを与えると、自分で回して直すループが閉じる**。

- テストスイート、ビルドの exit code、linter、fixture との diff スクリプト、スクリーンショット比較など
- 「成功した」と主張させるのではなく**証拠を出させる**：テスト出力、実行したコマンドと結果、スクリーンショット
- ゲートの強さは段階的に選べる：プロンプト内で「テストを回して直して」→ `/goal` 条件 → Stop フック（スクリプトが通るまでターン終了をブロック）→ 別コンテキストの検証サブエージェント

### 3.3. プロンプトは具体的に

| 悪い例 | 良い例 |
| --- | --- |
| 「foo.py にテスト追加して」 | 「foo.py のログアウト済みユーザーのエッジケースをカバーするテストを書いて。モックは使わない」 |
| 「ログインバグを直して」 | 「セッションタイムアウト後にログインが失敗する。src/auth/ のトークンリフレッシュを確認し、再現する失敗テストを書いてから直して」 |
| 「カレンダーウィジェット追加して」 | 「既存ウィジェットの実装パターン（HotDogWidget.php が良い例）に従って実装して」 |

- `@` でファイル参照、画像はペースト、`cat error.log \| claude` でパイプ入力
- 曖昧なプロンプトは探索フェーズ（「このファイルで改善するなら何？」）でのみ有効

### 3.4. 大きめの機能は「インタビューさせる」

最小限のプロンプトから始めて「AskUserQuestion ツールで自分にインタビューして、仕様を SPEC.md に書き出して」と頼むパターン。エッジケースやトレードオフなど自分が考えていなかった点を聞き出してくれる。仕様が固まったら**新しいセッションで**実装させる（実装専用のクリーンなコンテキストになる）。

---

## 4. 環境整備のベストプラクティス

### 4.1. CLAUDE.md は「短く・削る」

- `/init` で生成して育てる。**200行以下、短いほど良い**
- 判断基準：「この行を消したら Claude はミスをするか？」→ No なら削除
- **肥大化した CLAUDE.md は逆に指示が無視される原因になる**。ルールを守らないときはファイルが長すぎる疑いが強い
- 書くべき：推測できないビルドコマンド、デフォルトと異なるスタイル規約、ブランチ命名などのリポジトリ作法、環境の癖
- 書かない：コードを読めば分かること、言語の標準的な慣習、頻繁に変わる情報
- たまにしか使わない知識・手順は CLAUDE.md ではなく **Skills** に逃がす（オンデマンドで読み込まれる）

### 4.2. 権限まわり

毎回の承認クリックは10回目には形骸化する。3つの緩和策：

- **auto モード**: 分類器モデルが危険な操作だけブロックし、それ以外は自動承認
- **allowlist**: `/permissions` で `npm run lint` など安全と分かっているコマンドを事前許可
- **サンドボックス**: `/sandbox` で OS レベルの分離をかけた上で自由に動かす

### 4.3. 外部連携は CLI ツール優先、次に MCP

- `gh`, `aws`, `gcloud`, `sentry-cli` などの CLI が最もコンテキスト効率が良い
- 知らない CLI も「`foo --help` で学んでから使って」で使いこなせる
- Notion / Figma / DB などは MCP サーバーで接続

### 4.4. Hooks / Skills / Subagents の使い分けと導入順

- **Skills**: 知識・再利用ワークフロー。会話と同じコンテキストで動く。一番作りやすく効果が早い → **最初に手を入れる**
- **Hooks**: CLAUDE.md は「助言」だが hooks は「**決定論的で必ず実行される**」。編集後の lint 自動実行、`rm -rf` や `git push --force` の PreToolUse ブロックなど、例外なく毎回起きてほしいことに使う → 2番目
- **Subagents**: 隔離コンテキストで調査・レビューを行い要約だけ返す。コンテキスト・権限の隔離が欲しくなったら → 3番目
- hooks は Claude 自身に書かせられる：「編集のたびに eslint を走らせる hook を書いて」

---

## 5. セッション管理のベストプラクティス

- **早く・頻繁に軌道修正する**: `Esc` で中断して方向転換、`Esc Esc` / `/rewind` でチェックポイントに巻き戻し
- **同じ修正を2回して直らなければ `/clear`**: 失敗したアプローチでコンテキストが汚れている。学んだことを盛り込んだ良いプロンプトで新規セッションを始める方がほぼ常に速い
- 無関係なタスクの間は `/clear`、部分要約は `/compact <指示>` や「ここから要約」
- コンテキストに残す必要のない一問一答は `/btw`
- チェックポイントがあるので「リスキーな変更をまず試して、ダメなら巻き戻す」という戦略が取れる
- セッションは `/rename` で命名してブランチのように扱う（`claude --resume` で再開）

---

## 6. スケールさせる使い方（並列・自動化）

### 6.1. git worktree による並列セッション

`claude --worktree feature-auth` で worktree 作成＋起動を一括実行。フロントエンド・バックエンド・テストを別エージェントに割り当てて並列に進める使い方が広まっている。サブエージェントも `isolation: worktree` で独立 worktree 上で動かせるため編集が衝突しない。

### 6.2. Writer / Reviewer パターン

セッションA が実装 → **別セッションB**（自分の書いたコードにバイアスがないフレッシュなコンテキスト）がレビュー → A がフィードバックを反映。テストを書く役とテストを通す役を分ける変種もある。

### 6.3. 非対話モード（headless）と fan-out

- `claude -p "プロンプト"` で CI・pre-commit・スクリプトに組み込める。`--output-format json` でパース可能
- 大規模移行は「対象ファイル一覧を作らせる → ループで `claude -p "Migrate $file ..." --allowedTools "Edit,Bash(git commit *)"` を回す → 2〜3ファイルで試してプロンプトを直してから全量実行」

### 6.4. Routines（クラウド定期実行）

プロンプト＋リポジトリ＋コネクタを保存した設定を Anthropic 管理のクラウドで cron 実行する仕組み。**ラップトップを閉じていても動く**。条件分岐が多すぎてノーコードツールで表現しづらい「文脈を読んで判断・起草する」タスクに向く。

### 6.5. 自律実行時のレビュー

長く放置するほど独立チェックが重要。`/code-review` や「サブエージェントで diff を PLAN.md と突き合わせてギャップだけ報告して」パターン。ただし**レビュアーは頼めば必ず何か指摘する**ので、正しさに影響するものだけ直し、残りは無視しないと過剰設計になる。

---

## 7. 他の人の実際の使い方（事例）

### 7.1. Anthropic 社内チーム

- **データサイエンス**: JavaScript を知らないメンバーが React/TypeScript のダッシュボードを構築・複雑な可視化を作成
- **セキュリティ**: 「設計書→雑なコード→リファクタ→テスト断念」だった流れを「擬似コードを求める→TDD で誘導→定期チェック」に変えて信頼性向上。Terraform plan を貼って「これは何をする？後悔しない？」と平文で聞く
- **グロースマーケ**: 広告 CSV（実績値つき数百件）を読ませ、低パフォーマンス広告を特定して文字数制限を守った新バリエーションを2つのサブエージェントで数分で数百件生成
- **共通パターン**: auto-accept ＋「コード書く→テスト実行→修正」の自律ループでプロトタイピング

### 7.2. 非エンジニア・日常タスクの自動化

- CSV の整形：列の正規化・重複除去・サマリテーブル作成（リード一覧、アンケート出力、イベント登録者など）
- コンテンツ監査：記事の URL・メタデータ・トラフィックをフォルダに出力し、トピック分類・重複した切り口の特定・リフレッシュ提案を起草
- 経費トラッカー：複数クレカの出張支出を自動分類
- チャット UI との違いは「**ファイルが永続するコンテキストになり、成果物もチャットに消えずファイルとして残る**」こと。初心者向けはローカル・可逆・自己完結なタスク（リサーチフォルダ、レポート、データ整理、ドキュメント）から

### 7.3. 業界全体の動向（2026年7月時点）

- **急速な普及**: Claude Code は 2025年5月のリリースから8ヶ月ほどで GitHub Copilot・Cursor を抜いて最も使われる AI コーディングツールに。調査では 95% のエンジニアが週1回以上 AI ツールを使用、56% がエンジニアリング業務の70%以上を AI で行っていると回答
- **「Loop Engineering」への移行**: Anthropic 社内でも80%以上のエンジニアが「プロンプトを直接打つ」のではなく「Claude を走らせるループを書く」働き方に移行しつつある（Claude Code 開発者 Boris Cherny の発言）。プロンプトエンジニアリングより一段抽象化された、検証ループ自体を設計する働き方
- **チーム構成の変化**: 従来4〜5人必要だったプロジェクトが2人で回せるようになったという証言が複数。少人数チームがより速く・より遠くまで到達できるという構造変化
- **注意点**: これらは業界メディア・カンファレンス報道ベースの定性的な証言であり、自社の状況にそのまま当てはまるとは限らない。導入判断の参考情報として捉える

---

## 8. よくある失敗パターン

| 失敗 | 対策 |
| --- | --- |
| キッチンシンク・セッション（無関係なタスクを混ぜる） | タスク間で `/clear` |
| 修正の繰り返し（直らないのに同じセッションで粘る） | 2回失敗したら `/clear` して学びを盛り込んだプロンプトで再開 |
| 過剰指定の CLAUDE.md（ルールがノイズに埋もれる） | 容赦なく削る。指示なしでも正しくできることは消す。強制したいことは hook 化 |
| 検証なしの信頼（もっともらしいが穴のある実装） | テスト・スクリプト・スクショで必ず検証。検証できないものは出荷しない |
| 無限探索（スコープなしの「調査して」） | 調査を狭くスコープするか、サブエージェントに投げてメインを守る |

---

## 9. 参考リンク

- [公式: Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)（[日本語版](https://code.claude.com/docs/ja/best-practices)）
- [公式: How Anthropic teams use Claude Code](https://claude.com/blog/how-anthropic-teams-use-claude-code)
- [公式: Steering Claude Code — CLAUDE.md / skills / hooks / subagents の使い分け](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)
- [公式: worktree を使用して並列セッションを実行する](https://code.claude.com/docs/ja/worktrees)
- [公式: Automate work with routines](https://code.claude.com/docs/en/routines)
- [Claude Code Tips I Wish I'd Had From Day One（marmelab）](https://marmelab.com/blog/2026/04/24/claude-code-tips-i-wish-id-had-from-day-one.html)
- [Effective Claude Code Workflows in 2026（Medium）](https://medium.com/data-science-collective/effective-claude-code-workflows-in-2026-what-changed-and-what-works-now-c93ebc6f8f50)
- [Claude Codeベストプラクティス2026（Qiita）](https://qiita.com/dai_chi/items/63b15050cc1280c45f86)
- [Claude Code 大規模コードベース運用のベストプラクティス（サーバーワークス）](https://blog.serverworks.co.jp/2026/05/24/190000)
- [Claude Code を使いこなすためのベストプラクティス 実践検証付き（ENECHANGE）](https://tech.enechange.co.jp/entry/2026/02/16/195000)
- [Claude Code 固有機能の使い分け — Skills / Subagents / Hooks / Auto Mode（Qiita）](https://qiita.com/teppei19980914/items/95b9bf08087bef026855)
- [git worktree × claude code で並列開発を実践する（RAKSUL）](https://techblog.raksul.com/entry/2025/12/07/000000)
- [複数の AI エージェントを並列実行する開発手法（Zenn）](https://zenn.dev/d_kuro/articles/6321fa66b9180f)
- [How to Use Claude Code for Everyday Tasks — No Programming Required（Every）](https://every.to/source-code/how-to-use-claude-code-for-everyday-tasks-no-programming-required)
- [These 4 Claude automations save me hours every week（How-To Geek）](https://www.howtogeek.com/claude-automations-save-me-hours-every-week/)
- [AI Tooling for Software Engineers in 2026（Pragmatic Engineer）](https://newsletter.pragmaticengineer.com/p/ai-tooling-2026)
- [Prompt engineering declines as loop engineering gains momentum in Silicon Valley（KuCoin News）](https://www.kucoin.com/news/flash/prompt-engineering-declines-as-loop-engineering-gains-momentum-in-silicon-valley)
- [AI writes the code now. What's left for software engineers?（SF Standard）](https://sfstandard.com/2026/02/19/ai-writes-code-now-s-left-software-engineers/)
