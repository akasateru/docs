# git

## 1. 概要

gitは「ファイルの変更履歴を記録・管理するための分散型バージョン管理システム」

開発者：リーナス・トーバルズ（Linuxカーネル開発者）

目的

- ソースコードの変更履歴を管理する
- 複数人での共同開発を円滑に進める
- ブランチ（作業の分岐）とマージ（統合）を簡単にできる

## 2. Gitの概念

### 2.1. 良く使うコマンド

| コマンド     | 説明                                           | 使用例                                                                 |
| ------------ | ---------------------------------------------- | ---------------------------------------------------------------------- |
| git clone    | リモートリポジトリをコピーしてくる             | git clone <https://github.com/user/repo.git>                           |
| git add      | ステージングエリアに追加（コミット対象にする） | git add index.html または git add .                                    |
| git commit   | ローカルリポジトリに記録（スナップショット）   | git commit -m "Fix typo in header"                                     |
| git push     | ローカルの変更をリモートに送信                 | git push origin main                                                   |
| git pull     | リモートの変更をローカルに取り込む             | git pull origin main                                                   |
| git branch   | ブランチの一覧表示や作成                       | git branch（一覧）<br/>git branch feature/login（新規作成）            |
| git checkout | 指定したブランチやコミットに切り替え           | git checkout feature/login                                             |
| git merge    | 他のブランチを現在のブランチに統合             | git merge feature/login                                                |
| git status   | 現在の変更状況・ステージング状態を確認         | git status                                                             |
| git blame    | 誰が修正を入れたかを終える                     | git blame                                                   ファイル名 |

## 3. git checkout とgit switchの違い

- git switchの方が安全(git checkoutは、多機能であるが，誤用のリスクがやや高い)
<https://qiita.com/JavaLangRuntimeException/items/33c75bec144040c9b0bc>

## 4. pre-commit

コミット前にチェックしてくれるツール

### 4.1. pre-commitインストール方法

<https://pre-commit.com/#install>

```bash
pip install pre-commit

# インストールできたことを確認
pre-commit --version

# 設定ファイルを作成
pre-commit sample-config > .pre-commit-config.yaml

# 設定を読み込み
pre-commit install

pre-commit run --all-files ## 動かなかった
```

※Windowsで動かない場合は、インストール先のパスを通す

- 一般的なパスの例:

```md
C:\Users\（ユーザー名）\AppData\Roaming\Python\Python3x\Scripts
または
C:\Users\（ユーザー名）\AppData\Local\Programs\Python\Python3x\Scripts
```

手順

1. Windowsキーを押して「環境変数」と入力し、「システム環境変数の編集」を開く。
2. 「環境変数」ボタンをクリック。
3. 「ユーザー環境変数」の「Path」を選択して「編集」。
4. pip show pre-commit で表示される Location の末尾を Scripts に変えたパスを追加する。

## 5. git workflows

### 5.1. worktree（同一リポジトリで複数ブランチを同時に作業）

通常 `git checkout`/`switch` でブランチを切り替えると作業ディレクトリは1つしか存在しないが、`git worktree` を使うと同じリポジトリに対して**複数の作業ディレクトリ**を同時に持てる。ブランチごとに別ディレクトリなので、ファイルの競合なく並行作業できる。

用途:

- 独立したタスクを並行して進めたいとき（レビュー待ちのPRを触らずに別機能を実装する、など）
- 緊急のhotfixを、今の作業を止めずに別ディレクトリで対応する

コマンド:

| コマンド | 説明 |
| --- | --- |
| `git worktree add <path> <branch>` | 既存ブランチを指定パスにチェックアウトして worktree を作る |
| `git worktree add -b <new-branch> <path> <base-branch>` | 新規ブランチを切りつつ worktree を作る |
| `git worktree list` | 存在する worktree の一覧（パス・ブランチ・HEAD）を表示 |
| `git worktree remove <path>` | worktree を削除（未コミットの変更があると拒否される） |
| `git worktree remove --force <path>` | 未コミットの変更を破棄して強制削除 |
| `git worktree prune` | ディレクトリを `rm -rf` 等で直接消した場合の管理情報を掃除 |
| `git worktree lock <path>` / `unlock <path>` | 外部ドライブなど一時的にアクセスできない場所の worktree を誤削除から保護 |

Claude Code にはこの仕組みをラップした `EnterWorktree`/`ExitWorktree` というツールがあり、セッションの作業ディレクトリごと worktree に切り替えられる。詳細は [Claude Code.md](../AI%20Integration/Claude%20Code.md) を参照。

## 6. Gitの裏側

### 6.1. git init

- .git/ ディレクトリ（Gitの中枢管理フォルダ）が作成される
- 中には以下のようなファイル/ディレクトリができる：
  - `HEAD`: 現在のブランチの参照
  - `objects/`: 履歴情報（コミット、ファイルの中身）を保持
  - `refs/`: ブランチやタグの情報

### 6.2. git add

- 「ファイルを記録する準備（ステージング）」
- .git/index という「仮の記録台帳（ステージングエリア）」にファイルの差分が登録される
- ファイルそのものではなく、内容（中身）をSHA-1でハッシュ化したBlobオブジェクトが objects/ に作成される

### 6.3. git commit

- .git/objects/ に下記3つのオブジェクトが作成される
  - Blob（ファイルの中身）
  - Tree（ディレクトリ構造）
  - Commit（メタ情報含む履歴）
- HEAD → 最新のコミットを指すように更新
- すべての履歴は「一意なID（SHA-1）」で管理

### 6.4. git push

- ローカルの refs/heads/ブランチ名 の状態を、リモート（origin）に同期
- pushされるのはコミットオブジェクトの差分
- Gitはローカルとリモートで差分のオブジェクトを突き合わせて送信

### 6.5. git pull（実態は fetch + merge）

- fetch: リモートの変更をローカルに取得（.git/FETCH_HEAD に記録）
- merge: 取得した変更を現在のブランチに取り込む

## 7. リモート操作

### 7.1. git remote -v

登録されているリモートリポジトリの一覧を、URL付きで表示。

```bash
git remote -v
```

```txt
origin  https://github.com/user/repo.git (fetch)
origin  https://github.com/user/repo.git (push)
```

- `-v` は verbose の略。無指定だとリモート名（`origin` など）のみ表示
- fetch用・push用のURLは別々に表示される（通常は同一だが、個別設定も可能）

### 7.2. git fetch -p（prune）

リモートの最新情報取得と同時に、リモート側で削除済みのブランチに対応するローカルの追跡ブランチ（remote-tracking branch）を掃除する。

```bash
git fetch -p
# git fetch --prune と同義
```

- 通常の `git fetch` はリモートで削除されたブランチの参照（例: `origin/feature-x`）をローカルに残したまま
- `-p` を付けると、リモートに存在しなくなった参照を自動削除
- `git branch -r` / `git branch -a` の出力が整理される

### 7.3. git fetch --all

登録されている**すべてのリモート**から最新情報を取得する。

```bash
git fetch --all
```

- リモートが `origin` のみの場合は通常の `git fetch` と実質同じ
- `origin`（自分のfork）と `upstream`（元リポジトリ）など複数リモートを登録している場合に、まとめて更新できる
- `-p` と組み合わせた `git fetch --all -p` は、全リモートに対するfetch+pruneとして実務でよく使われる

## 8. forkとブランチの違い

同じ「分岐」でも、branchとforkは全く別レイヤーの概念。

| | ブランチ (branch) | fork |
| --- | --- | --- |
| スコープ | 1つのリポジトリ内 | リポジトリ全体の複製（別リポジトリ） |
| 目的 | 並行して機能開発するため | 書き込み権限のないリポジトリへ変更を提案するため |
| 権限 | 書き込み権限を持つメンバー向け | 誰でも作成可能（自分のコピーなので自由） |
| Gitのネイティブ機能か | Yes（`git branch`） | No（GitHub/GitLab等ホスティングサービスの機能） |

- **branch**: 同じ `.git` の中でコミット履歴を共有しつつ開発の流れを分岐させる仕組み。軽量で作成・切替が一瞬。
- **fork**: リポジトリ自体を自分のアカウント配下に丸ごと複製する仕組み。OSSへのコントリビュートなど、元リポジトリへの直接push権限がない場合に使う。forkした自分のリポジトリでは自由にブランチを切ってpushでき、元リポジトリへの取り込みはPull Requestで依頼する。

fork運用では、元リポジトリを `upstream` という名前でリモート登録し、その更新を追いかけるのが一般的（[7. リモート操作](#7-リモート操作)の `git fetch --all` 参照）。

```bash
git remote add upstream https://github.com/original-owner/project.git
git fetch upstream
```

## 9. オブジェクト調査コマンド

### 9.1. git ls-tree

ツリーオブジェクト（ある時点のディレクトリ構造）の中身を、作業ディレクトリに展開せずに表示するコマンド。

```bash
git ls-tree <tree-ish> [path...]
```

```bash
git ls-tree HEAD              # 現在のコミットのルート直下を表示
git ls-tree HEAD src/         # 特定ディレクトリの中身を表示
git ls-tree -r HEAD           # 再帰的に全ファイルを表示
git ls-tree -r --name-only HEAD  # ファイルパスのみ表示
```

出力例:

```txt
100644 blob a1b2c3d4...    README.md
040000 tree 9c8d7e6f...    src
```

各列は「モード（`100644`=通常ファイル、`040000`=ディレクトリ）」「タイプ（`blob`/`tree`/`commit`）」「SHA-1」「パス」。`ls` がファイルシステムを見るのに対し、`ls-tree` は Git オブジェクトDB内のスナップショットを見るイメージ。

### 9.2. git rev-list

指定条件に一致するコミットのハッシュを列挙するコマンド。`git log` の内部処理で使われる低レベルコマンドで、機械的処理・スクリプト向け。

```bash
git rev-list HEAD                    # HEADから辿れる全コミットのハッシュ
git rev-list --count HEAD            # コミット数をカウント
git rev-list -n 5 HEAD               # 直近5件のハッシュ
git rev-list main..feature           # mainにはないがfeatureにはあるコミット
git rev-list --all                   # 全ブランチ・タグから辿れる全コミット
```

`git log` はコミットメッセージや差分など人間向けの詳細情報を表示するのに対し、`git rev-list` はデフォルトでハッシュのみを出力する。`git ls-tree` が「ある1時点でのファイル構造」を見るのに対し、`git rev-list` は「コミット履歴（時間軸）の集合」を扱う点が対照的。

## 10. 低レベルコマンド（plumbing）一覧

`git log`・`git commit`・`git branch`・`git merge` などの「高レベルコマンド（porcelain）」は、内部でこれらの低レベルコマンド（plumbing）を組み合わせて実装されている。出力がスクリプト処理向けに安定しているのが特徴。

### 10.1. オブジェクトの調査・読み取り系

| コマンド | 役割 |
| --- | --- |
| `git cat-file` | オブジェクトの内容・タイプ・サイズを表示 |
| `git ls-tree` | ツリーオブジェクトの中身を表示（[9.1](#91-git-ls-tree)） |
| `git rev-list` | 到達可能なコミットの一覧を出力（[9.2](#92-git-rev-list)） |
| `git rev-parse` | ブランチ名やタグをSHA-1ハッシュに解決 |
| `git ls-files` | インデックス上のファイル一覧を表示 |
| `git show-ref` | 全参照（ref）の一覧を表示 |
| `git diff-tree` | 2つのツリー（コミット）間の差分を表示 |
| `git diff-index` | ツリーとインデックスの差分を表示 |
| `git diff-files` | 作業ディレクトリとインデックスの差分を表示 |
| `git name-rev` | SHA-1からブランチ+相対位置の可読な名前を逆引き |
| `git merge-base` | 2つのコミットの共通祖先を探す |

### 10.2. オブジェクトの作成・書き込み系

| コマンド | 役割 |
| --- | --- |
| `git hash-object` | ファイル内容からblobオブジェクトを作成しハッシュを返す |
| `git mktree` | 標準入力からツリーオブジェクトを作成 |
| `git commit-tree` | ツリーオブジェクトから直接コミットオブジェクトを作成 |
| `git write-tree` | 現在のインデックスからツリーオブジェクトを作成 |
| `git update-index` | インデックス（ステージ領域）を直接操作 |
| `git mktag` | タグオブジェクトを作成 |

### 10.3. 参照（ref）の操作系

| コマンド | 役割 |
| --- | --- |
| `git update-ref` | ブランチなどの参照を直接更新 |
| `git symbolic-ref` | HEADなどのシンボリック参照を操作 |
| `git pack-refs` | 参照をパックして`.git/packed-refs`にまとめる |

### 10.4. パック・リポジトリメンテナンス系

| コマンド | 役割 |
| --- | --- |
| `git pack-objects` | オブジェクトをパックファイルにまとめる |
| `git unpack-objects` | パックファイルを個別オブジェクトに展開 |
| `git index-pack` | パックファイルからインデックスを作成 |
| `git verify-pack` | パックファイルの整合性を検証 |
| `git fsck` | オブジェクトDBの破損・孤立オブジェクトをチェック |
| `git prune` | 到達不能なオブジェクトを削除 |
| `git count-objects` | 未パックのオブジェクト数・サイズを表示 |

公式の一覧は `git help -a` の "low-level commands" セクションでも確認できる。

## 11. --quiet / -q オプション

多くのgitサブコマンドに共通するオプションで、成功時の進捗表示・詳細メッセージを抑制する。エラー発生時は通常どおり表示され、終了コード（`$?`）も通常どおり返るため、成否判定には使える。CI/CDやスクリプト内でログを簡潔にしたい場合に使う。

```bash
git clone -q <url>          # クローン進捗を非表示
git fetch -q                # フェッチの進捗表示を抑制
git checkout -q <branch>    # "Switched to..."等を抑制
git commit -q                # コミット後のサマリーを抑制（コミット自体は行われる）
```

コマンドによって対応状況・挙動が異なる（例: `git diff` は `-q` 非対応で代わりに `--exit-code` を使う）ので、迷ったら `git <command> -h` で確認する。完全に出力を消したい場合は `-q` に加えて標準エラー出力も `2>/dev/null` で捨てることもある。

## 12. タグとリリース

**タグ（tag）はGitそのものの概念**であり、Bitbucket固有の概念ではない。コミットに固定の名前を付ける仕組み（`git tag`）で、SVNやMercurialなど他のバージョン管理システムにも同様の概念がある。

- 実体は `refs/` 配下に保存される参照の一種（[6.1. git init](#61-git-init)、[10.3. 参照（ref）の操作系](#103-参照refの操作系)参照）。
- ブランチと違い、タグは基本的に動かない（特定コミットへの固定ラベル）。
- 軽量タグ（commitへの単純な参照）と注釈付きタグ（`git tag -a`、作成者・日付・メッセージ等のメタ情報を持つタグオブジェクト）の2種類がある。

**Bitbucket/GitHubの「Releases」機能**は、このGitのタグ機能の上に、リリースノートや添付ファイルなどのUI・メタデータを乗せたホスティングサービス側の付加機能。「タグリリース」と言う場合は多くの場合「あるタグに紐づけてリリースを作成する」という、Bitbucket/GitHub側の運用フローを指す。

```bash
git tag v1.0.0                        # 軽量タグ
git tag -a v1.0.0 -m "First release"  # 注釈付きタグ
git push origin v1.0.0                # タグをリモートにpush（タグはデフォルトでpushされない）
```

## 13. 参考

- <https://dev.classmethod.jp/articles/introduce-pre-commit/>
- <https://qiita.com/raki/items/5374a91dca4a3039094b>
