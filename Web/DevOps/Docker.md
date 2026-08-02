# 1. Docker

Dockerは、アプリケーションを「コンテナ」という軽量で独立した環境にパッケージ化して実行するためのプラットフォーム。

## 1.1. 主要な概念

- **コンテナ (Container)**: アプリケーションとその実行に必要なライブラリや設定を一つにまとめた実行環境。ホストOSのリソースを論理的に分離して使用。
- **イメージ (Image)**: コンテナの雛形となる読み取り専用のファイル。Dockerfileからビルドされます。
- **Dockerfile**: イメージを作成するための手順を記述したテキストファイル。
- **Docker Hub / Registry**: 作成したイメージを共有・保存するための場所。

## 1.2. Dockerfile の主要な命令

イメージのビルド手順を記述する際の主要な命令です。

- **`FROM`**: ベースとなるイメージを指定（例: `FROM python:3.9-slim`）
- **`WORKDIR`**: コンテナ内の作業ディレクトリを設定
- **`COPY` / `ADD`**: ホストのファイルをコンテナ内にコピー
- **`RUN`**: イメージのビルド時に実行するコマンド（パッケージのインストールなど）
- **`CMD`**: コンテナ起動時に実行するデフォルトのコマンド（1つのDockerfileに1つのみ）
- **`ENTRYPOINT`**: コンテナ起動時に必ず実行されるコマンドを指定
- **`ENV`**: 環境変数を設定
- **`EXPOSE`**: コンテナが公開するポートを指定

## 1.3. 基本コマンド

### 1.3.1. イメージ操作

- `docker build -t [イメージ名]:[タグ] .`: Dockerfileからイメージをビルド
- `docker images`: ローカルにあるイメージ一覧を表示
- `docker pull [イメージ名]`: レジストリからイメージを取得
- `docker push [イメージ名]`: レジストリにイメージを送信
- `docker tag [元イメージ] [新イメージ名]`: イメージにタグ付け
- `docker rmi [イメージID]`: イメージを削除

### 1.3.2. コンテナ操作

- `docker run [オプション] [イメージ名]`: コンテナを作成して起動
  - `-d`: バックグラウンドで実行
  - `-p [ホストポート]:[コンテナポート]`: ポートフォワーディング
  - `--name [名前]`: コンテナに名前をつける
- `docker ps`: 実行中のコンテナ一覧を表示 (`-a` で停止中も含む)
- `docker start` / `docker restart [コンテナID/名]`: 停止中のコンテナを起動・再起動
- `docker stop [コンテナID/名]`: コンテナを停止
- `docker rm [コンテナID/名]`: コンテナを削除
- `docker exec -it [コンテナID/名] bash`: 起動中のコンテナ内でコマンドを実行
- `docker logs [コンテナID/名]`: コンテナのログを表示 (`-f` でフォロー表示)
- `docker attach [コンテナID/名]`: コンテナの標準入出力に接続

## 1.4. Docker Compose

複数のコンテナを定義・管理するためのツールです。`docker-compose.yml` ファイルに構成を記述します。

- `docker compose up -d`: 定義された全サービスをバックグラウンドで起動
- `docker compose down`: 全サービスを停止・削除
- `docker compose ps`: サービスの状態を確認
- `docker compose build`: イメージを再ビルド
- `docker compose logs -f`: ログを表示

## 1.5. 脆弱性診断

- `docker scout`: docker imageの脆弱性診断などを行うコマンド

## 1.6. トラブルシューティング・メモ

### 1.6.1. Docker Desktop

- Docker Desktopがたまに開けなくなることがある。
  - 再起動や、タスクトレイからのリスタートを試す。
  - WSL2との連携設定を確認する。

### 1.6.2. クリーンアップ

- `docker system prune`: 使用されていないコンテナ、ネットワーク、イメージ（ダングリング）を一括削除

## 1.7. ボリューム・ネットワーク管理

- **ボリューム (Volume)**: コンテナのデータを永続化するための仕組み。コンテナを削除してもデータが残る。
  - `docker volume ls` / `create` / `rm`: ボリュームの一覧・作成・削除
  - `docker run -v [ホストパス]:[コンテナパス] [イメージ名]`: ボリュームをマウントしてコンテナを起動
- **ネットワーク (Network)**: コンテナ間の通信を管理する仕組み。
  - `docker network ls` / `create` / `rm`: ネットワークの一覧・作成・削除
  - `docker run --network [ネットワーク名] [イメージ名]`: 指定ネットワークでコンテナを起動

## 1.8. システム管理・情報確認

- `docker system df`: ディスク使用量を確認
- `docker inspect [コンテナ/イメージID]`: 詳細情報をJSON形式で確認
- `docker stats`: コンテナのリソース使用状況をリアルタイム表示

## 1.9. 全体像（概念図）

```text
Dockerfile → build → Image → run → Container
                                 ├─ Volume（永続化データ）
                                 └─ Network（通信）
複数コンテナをまとめて管理 → docker-compose.yml → Compose
```

## 1.10. Docker Desktop の WSL2 連携アーキテクチャ

Windows + WSL2 環境で「Docker Desktop から見えるコンテナ」と「WSL内のCLIから見えるコンテナ」が同じか、という疑問への整理。

### 1.10.1. daemon はどちらも共通

- Docker Desktop の WSL2 バックエンドでは、daemon（`dockerd`）は `docker-desktop` という隠しWSL2ディストロ（実質的な軽量Linux VM）の中で1つだけ動いている。
- WSL Integration を有効にした各ディストロ（Ubuntuなど）には `docker` CLI と、`docker-desktop` 内の同じ daemon への接続経路（ソケットのフォワーディング）が仕込まれる。
- そのため Windows 側でも WSL 側でも `docker ps` の結果は完全に同一（イメージ・ボリュームも共通）。「別々のDockerが同期している」のではなく「実体は1つ」。
- 昔の Hyper-V バックエンドは別VMだったが、WSL2バックエンド移行でこの構成に統一された。
- `docker context ls` で接続先contextを確認できる（通常は `desktop-linux` の1つのみ）。

### 1.10.2. WSLのCLIを使うのに Docker Desktop 本体は必要か

- **Docker Desktop連携を使う場合**: GUIウィンドウは閉じてよいが、アプリ自体（バックグラウンドプロセス）は常駐している必要がある。完全終了（Quit）すると `docker-desktop` VMごとdaemonが落ち、WSL側の `docker` コマンドも接続エラーになる。
- **Docker Desktopを使わない場合**: WSLディストロに Docker Engine を直接インストール（`docker-ce` を apt導入等）すれば、Docker Desktopは不要になり完全に独立する。`sudo service docker start`（またはsystemd）でdaemonを起動。
  - メリット: Docker Desktopのライセンス（企業利用での有償化）を回避できる。
  - デメリット: Windows側GUIや複数ディストロ間のシームレスな共有が失われる。
