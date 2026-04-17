## 1. Terraform

Terraformは、クラウド上のリソースを管理するためのIaCツール。

## 2. インストール方法

## 3. コマンド一覧

### 3.1. 初期化・準備

プロジェクトを開始する際や、構成を変更した直後に実行。

| コマンド                            | 説明                                                                                           |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| **`terraform init`**                | プロバイダー（GCP等）やモジュールのダウンロード、バックエンドの初期化。                        |
| **`terraform init -backend=false`** | **【重要】** バックエンド（GCS等）に接続せず、プラグインのロードと構文チェックの準備のみ行う。 |
| **`terraform get -update`**         | 外部モジュールの最新版をダウンロード（更新）する。                                             |

### 3.2. 2\. 検証・整形

コードを綺麗に保ち、デプロイ前にミスを見つけるためのコマンド。**CI/CD や PR 出し前には必須**。

| コマンド                   | 説明                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| **`terraform validate`**   | 構文や変数定義、リソースの整合性をチェックする。                  |
| **`terraform fmt`**        | コードのインデントや整形を Terraform 推奨スタイルに自動修正する。 |
| **`terraform fmt -check`** | 整形が必要なファイルがあるか確認のみ行う（CIでよく使う）。        |

### 3.3. 計画・実行

実際のクラウド環境に変更を加えるためのメインコマンドです。

| コマンド                         | 説明                                                                     |
| -------------------------------- | ------------------------------------------------------------------------ |
| **`terraform plan`**             | 現在の環境とコードの差分を表示し、実行計画を作成する（変更はされない）。 |
| **`terraform plan -out=tfplan`** | 計画をファイルに保存する。確実なデプロイのために推奨。                   |
| **`terraform apply`**            | **【注意】** 実際にクラウド上のリソースを作成・修正する。                |
| **`terraform apply "tfplan"`**   | 事前に作成した `plan` ファイルを元に実行する（安全）。                   |
| **`terraform destroy`**          | **【危険】** 定義されているすべてのリソースを削除する。                  |

### 3.4. 状態管理（State 操作）

「コードと実環境の紐付け」が狂ったときに使う、少し高度なコマンドです。

| コマンド                               | 説明                                                       |
| -------------------------------------- | ---------------------------------------------------------- |
| **`terraform state list`**             | 現在 Terraform が管理しているリソースの一覧を表示する。    |
| **`terraform state show [アドレス]`**  | 特定のリソースの詳細な現在の状態を表示する。               |
| **`terraform refresh`**                | クラウド上の最新状態を読み込み、State ファイルを更新する。 |
| **`terraform import [アドレス] [ID]`** | 手動で作った既存リソースを Terraform の管理下に置く。      |

### 3.5. 5\. デバッグ・その他

困ったときや情報を抽出したいときに使う。

| コマンド                  | 説明                                                 |
| ------------------------- | ---------------------------------------------------- |
| **`terraform output`**    | 設定した `output` の値を表示する。                   |
| **`terraform console`**   | 変数や関数の挙動をリアルタイムで試せる対話型シェル。 |
| **`terraform providers`** | 使用しているプロバイダーの依存関係を表示する。       |

### 3.6. おすすめの作業フロー（PR作成時）

今回の「数珠つなぎ PR」の整理中であれば、以下の順で叩いておくと安心。

1. `terraform fmt` （見た目を整える）
2. `terraform init -backend=false` （プラグインを揃える）
3. **`terraform validate`** （設定ミスがないか最終確認）
4. （もし認証が通る環境なら） `terraform plan` （意図しない削除がないか確認）

## 4. 構文

### 4.1. Providers

- 特定のクラウドプロバイダやサービスとの連携に必要な設定
- リージョン、AWSプロファイルなどの設定

```terraform
provider "aws" {
  region  = "ap-northeast-1"
  version = "~> 3.0"
}
```

### 4.2. Resources

- インフラの構成要素（例：EC2インスタンスやS3バケット）を定義する

### 4.3. Variables

- インフラ構成のカスタマイズを可能にするパラメータ

### 4.4. Outputs

- Terraform設定の実行結果として得られるデータを表示するための方法

### 4.5. Module

ディレクトリ階層

```bash
.
├── main.tf
└── modules
    └── network
        ├── main.tf
        ├── outputs.tf
        └── variables.tf

```

### 4.6. Functions

- 便利な組み込み関数や制御構造を設定

```terraform
# for_eachを使用して複数のサブネットを作成
resource "aws_subnet" "main" {
  for_each = {
    "a" = "10.0.1.0/24",
    "b" = "10.0.2.0/24"
  }

  vpc_id     = aws_vpc.main.id
  cidr_block = each.value
  tags = {
    Name = "Subnet-${each.key}"
  }
}
```

### 4.7. depend_on

- デプロイ順序の制御
- 暗黙的な依存関係の補完
- インフラストラクチャの整合性確保

```terraform
# 1. VPCの定義
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "main"
  }
}
# 2. RDSインスタンスの定義
resource "aws_db_instance" "example" {
  # 3. ... other configurations ...
  # 4. VPCが作成されてから実行されることを明示
  depends_on = [aws_vpc.main]
}
```

## 5. 参考

- [GitHub - hashicorp/terraform](https://github.com/hashicorp/terraform)
- [【Terraform】の基本構文](https://zenn.dev/t_oishi/articles/191bac17622130)
- [【随時更新】実務でTerraformを使う人は"最低限"抑えておきたい構文をサクッとまとめてみた #AWS - Qiita](https://qiita.com/WebEngrChild/items/e5e3031d93158507cd5d)
