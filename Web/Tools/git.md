
## 1. 概要

gitは「ファイルの変更履歴を記録・管理するための分散型バージョン管理システム」

開発者：リーナス・トーバルズ（Linuxカーネル開発者）

目的

- ソースコードの変更履歴を管理する
- 複数人での共同開発を円滑に進める
- ブランチ（作業の分岐）とマージ（統合）を簡単にできる

### 1.1. 良く使うコマンド

| コマンド     | 説明                                           | 使用例                                                      |
| ------------ | ---------------------------------------------- | ----------------------------------------------------------- |
| git clone    | リモートリポジトリをコピーしてくる             | git clone <https://github.com/user/repo.git>                |
| git add      | ステージングエリアに追加（コミット対象にする） | git add index.html または git add .                         |
| git commit   | ローカルリポジトリに記録（スナップショット）   | git commit -m "Fix typo in header"                          |
| git push     | ローカルの変更をリモートに送信                 | git push origin main                                        |
| git pull     | リモートの変更をローカルに取り込む             | git pull origin main                                        |
| git branch   | ブランチの一覧表示や作成                       | git branch（一覧）<br/>git branch feature/login（新規作成） |
| git checkout | 指定したブランチやコミットに切り替え           | git checkout feature/login                                  |
| git merge    | 他のブランチを現在のブランチに統合             | git merge feature/login                                     |
| git status   | 現在の変更状況・ステージング状態を確認         | git status                                                  |

## 2. git checkout とgit switchの違い

- git switchの方が安全(git checkoutは、多機能であるが，誤用のリスクがやや高い)
<https://qiita.com/JavaLangRuntimeException/items/33c75bec144040c9b0bc>

## 3. pre-commit

コミット前にチェックしてくれるツール

### 3.1. pre-commitインストール方法

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

## 4. git workflows

## 5. Gitの裏側

### 5.1. git init

- .git/ ディレクトリ（Gitの中枢管理フォルダ）が作成される
- 中には以下のようなファイル/ディレクトリができる：
  - `HEAD`: 現在のブランチの参照
  - `objects/`: 履歴情報（コミット、ファイルの中身）を保持
  - `refs/`: ブランチやタグの情報

### 5.2. git add

- 「ファイルを記録する準備（ステージング）」
- .git/index という「仮の記録台帳（ステージングエリア）」にファイルの差分が登録される
- ファイルそのものではなく、内容（中身）をSHA-1でハッシュ化したBlobオブジェクトが objects/ に作成される

### 5.3. git commit

- .git/objects/ に下記3つのオブジェクトが作成される
  - Blob（ファイルの中身）
  - Tree（ディレクトリ構造）
  - Commit（メタ情報含む履歴）
- HEAD → 最新のコミットを指すように更新
- すべての履歴は「一意なID（SHA-1）」で管理

### 5.4. git push

- ローカルの refs/heads/ブランチ名 の状態を、リモート（origin）に同期
- pushされるのはコミットオブジェクトの差分
- Gitはローカルとリモートで差分のオブジェクトを突き合わせて送信

### 5.5. git pull（実態は fetch + merge）

- fetch: リモートの変更をローカルに取得（.git/FETCH_HEAD に記録）
- merge: 取得した変更を現在のブランチに取り込む

## 6. 参考

- <https://dev.classmethod.jp/articles/introduce-pre-commit/>
- <https://qiita.com/raki/items/5374a91dca4a3039094b>
