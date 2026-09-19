# gh (GitHub CLI)

GitHub公式のCLIツール。ターミナルからブラウザを開かずにPR・Issue・リポジトリ・CI操作を完結できる。

## 1. 概要

- **正式名称**: GitHub CLI
- **目的**: PR作成・レビュー、Issue管理、リポジトリ操作、CI結果確認などをコマンドラインで行う
- **インストール**: `brew install gh`（macOS）
- **認証**: `gh auth login` でGitHubアカウントと連携すれば、以降のAPI呼び出しは自動認証される
- [git.md](git.md) がバージョン管理（コミット・ブランチ・履歴）を担当するのに対し、`gh` はGitHubというホスティングサービス固有の機能（PR・Issue・Actions等）を扱うという住み分け

## 2. よく使うコマンド

### 2.1. リポジトリ操作

```bash
gh repo clone owner/repo        # クローン
gh repo create                  # 新規リポジトリ作成（対話式）
gh repo view --web              # ブラウザでリポジトリを開く
```

### 2.2. Pull Request 操作

```bash
gh pr create                    # PR作成（対話式）
gh pr create --title "..." --body "..."  # 非対話でPR作成
gh pr list                      # PR一覧
gh pr list --head <branch>      # 特定ブランチが起点のPRを検索
gh pr view <番号>                # PR詳細表示
gh pr view <番号> --web          # ブラウザでPRを開く
gh pr checkout <番号>            # PRのブランチをローカルにチェックアウト
gh pr diff <番号>                # PRの差分を表示
gh pr merge <番号>               # PRをマージ
gh pr review <番号> --approve    # PRを承認
```

### 2.3. Issue 操作

```bash
gh issue list                   # Issue一覧
gh issue create                 # Issue作成
gh issue view <番号>             # Issue詳細
```

### 2.4. CI/Actions

```bash
gh run list                     # ワークフロー実行履歴
gh run view <ID> --log          # 実行ログを表示
gh workflow run <name>          # ワークフローを手動実行
```

### 2.5. API 直接呼び出し

```bash
gh api repos/owner/repo/pulls/123/comments   # 低レベルAPI呼び出し
```

## 3. --json オプション

多くのサブコマンドは `--json` で結果を機械可読な形式（JSON）に絞り込める。スクリプトやAI連携で特に有用。

```bash
gh pr list --head reorg-and-updates --json number,url,state
```

`--head` で特定ブランチ起点のPRを絞り込みつつ、`--json` で必要なフィールドだけを取得。`jq` と組み合わせて後処理するのが定番。

## 4. 使いどころ

- ブランチをpushした後、そのままターミナルでPR作成まで完結できる
- CI結果やPRレビュー状況を、ブラウザを開かずに確認できる
- `--json` + `jq` の組み合わせで、GitHub上の情報をスクリプトで自動処理できる
