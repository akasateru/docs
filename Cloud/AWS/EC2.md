# 1. EC2(Amazon Elastic Compute Cloud)

AWSが提供する仮想サーバー(インスタンス)をオンデマンドで借りられるサービス。物理サーバーを自前で用意せず、必要な分だけ計算リソースを使える。

## 1.1. 主要な構成要素

- **[AMI(Amazon Machine Image)](AMI.md)**: OSやミドルウェアを含むインスタンスの雛形。起動時にこれを指定する
- **インスタンスタイプ**: CPU/メモリ/ネットワーク性能の組み合わせ(例: t3.micro, m5.large)
  - t系: バースト可能な汎用(小規模・低負荷向け)
  - m系: 汎用バランス型
  - c系: コンピューティング最適化(CPU負荷が高い処理)
  - r系: メモリ最適化(DB・キャッシュなど)
- **EBS(Elastic Block Store)**: インスタンスにアタッチする永続ストレージ。インスタンス停止/削除してもデータを残せる
- **セキュリティグループ**: インスタンス単位のファイアウォール([1.4](#14-セキュリティグループ設計)で詳述)
- **キーペア**: SSH接続用の公開鍵/秘密鍵ペア
- **VPC/サブネット**: インスタンスが所属するネットワーク空間

## 1.2. 料金モデル

- **オンデマンド**: 使った分だけ課金(柔軟だが単価は高め)
- **リザーブド/Savings Plans**: 1〜3年の利用コミットで割引
- **スポットインスタンス**: 余剰キャパシティを安価に使う。中断されるリスクあり
- **専有ホスト**: 物理サーバーを専有(ライセンス要件対応など)

## 1.3. 状態遷移

起動中(pending) → 実行中(running) → 停止(stopped、EBSは残る) → 終了(terminated、原則削除)

「停止」と「終了」の違いが重要。停止は課金停止(EBS分は除く)、終了はインスタンス自体が消える。

## 1.4. セキュリティグループ設計

### 1.4.1. 基本的な性質

- **ステートフル**: インバウンドを許可すると、対応するレスポンスのアウトバウンドは自動許可される(逆も同様)。TCPの戻りルールを個別に書く必要はない
- **許可ルールのみ**: 拒否(Deny)ルールは書けない。デフォルトはすべて拒否で、許可を積み上げる方式
- **インスタンス(ENI)単位で複数アタッチ可能**: 複数SGを付けると、ルールは論理和(OR)で合算される
- **VPCスコープ**: SG自体はVPC内で有効

### 1.4.2. 設計の基本原則

1. **最小権限**: 必要なポート・送信元だけを開ける。`0.0.0.0/0`(全世界)からのアクセス許可は極力避ける
2. **送信元は「IPアドレス」より「SG参照」を使う**: IPが変わる(スケールアウト/インなど)たびにルール修正が不要になり、構成変更に強くなる
3. **層ごとにSGを分ける**: ALB用/Web用/DB用のように役割ごとに分離し、下位層には上位層のSG経由でのみアクセスを許可する
4. **管理アクセス(SSH/RDP)は別枠で絞る**: `0.0.0.0/0`にせず、固定IPや踏み台経由に限定する([1.5](#15-踏み台サーバーbastion)参照)
5. **命名規則を決める**: 例 `sg-{env}-{role}-{layer}`。Descriptionフィールドも埋めて用途を残す

### 1.4.3. 具体例: 3層構成(ALB → Web → DB)

```
Internet → ALB(SG: alb) → EC2 Web(SG: web) → RDS(SG: db)
                                ↑
                         踏み台(SG: bastion) ← 管理者IP
```

Terraformでの実装例:

```hcl
# ALB用SG: インターネットからの443/80のみ許可
resource "aws_security_group" "alb" {
  name   = "sg-prod-alb"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Web用SG: ALBからの80番、踏み台からの22番のみ許可(いずれもSG参照)
resource "aws_security_group" "web" {
  name   = "sg-prod-web"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }
}

# DB用SG: Webサーバーからの3306番のみ許可(CIDRは一切使わない)
resource "aws_security_group" "db" {
  name   = "sg-prod-db"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }
}
```

ポイント: DBのingressはWebのSG ID参照のみで、CIDRブロックを一切使わない。インターネットはもちろん、Web以外の層からも直接到達できない構成になる。

### 1.4.4. よくある落とし穴

- デバッグ用に`All traffic / 0.0.0.0/0`のSGを一時的に作って、そのまま放置してしまう
- 1つのSGに全インスタンスをまとめてしまい、層による権限分離ができず侵害時の被害範囲が広がる
- NACL(ネットワークACL)との役割混同: SGはインスタンス単位・ステートフル、NACLはサブネット単位・ステートレスで明示的Deny可。多くの場合SGだけで十分で、NACLは追加の防御層として使う

## 1.5. 踏み台サーバー(bastion)

**bastion(踏み台サーバー)**とは、プライベートサブネットなど直接インターネットから入れない場所にあるサーバーへ、管理者が安全にアクセスするための中継サーバーのこと。

- 語源は城塞の「稜堡」。本丸(内部ネットワーク)を守るための最前線の防御拠点、というメタファー
- **AWS固有の用語ではなく、クラウド/インフラ業界全般の一般的な概念(アーキテクチャパターン名)**。オンプレ時代から使われている
- 同義語: jump server / jump box / jump host(踏み台の英語表現)

### 1.5.1. 仕組み

```
管理者PC → (SSH) → bastion(パブリックサブネット) → (SSH) → Web(プライベートサブネット)
```

1. bastionはパブリックサブネットに置く(唯一インターネットから到達できる入口)
2. bastionのSGは管理者の固定IPからの22番だけを許可
3. プライベートサブネット側のSGはbastionのSGからの22番だけを許可
4. 管理者はbastionにSSHログインし、そこから更にWebサーバーへSSHする

### 1.5.2. デメリット

- bastion自体が単一障害点/攻撃対象になりやすく、乗っ取られると全サーバーへの足がかりになる
- bastion用のEC2インスタンスを常時起動しておく必要があり、料金・パッチ管理・鍵管理の手間が発生

## 1.6. マネージド代替: ポートを開けないアクセス方式

近年はbastionを使わず、ID認証ベースでプライベートリソースにアクセスする方式が推奨されている。SSH/RDPのポート自体を一切開放しなくて済むのが利点。

| クラウド | サービス名 | 認証の仕組み |
|---|---|---|
| AWS | Systems Manager Session Manager | IAMロール + SSMエージェント |
| Azure | Azure Bastion | マネージドのbastion(そのままの製品名) |
| GCP | Identity-Aware Proxy (IAP) | Googleアカウント + IAM |

- **Session Manager**: EC2にSSMエージェント(Amazon Linux等はデフォルト搭載)とIAMロール(`AmazonSSMManagedInstanceCore`)を付与するだけで、22番ポートの開放が不要になる。bastion用インスタンス自体も不要にでき、接続ログはCloudTrailに残る
- **GCPのIAP**: `gcloud compute ssh --tunnel-through-iap`のようにIDベースでVMへのSSHを中継する。加えて社内向けWebアプリの認証プロキシとしても使え、Googleが提唱する**BeyondCorp**(ゼロトラストセキュリティモデル)の実装の一つに位置づけられる
- 用語整理: bastionは一般的な概念・パターン名。Session Manager/Azure Bastion/IAPはそれを実現する各社のマネージドサービス(製品名)

## 1.7. 参考

- 会話ログ(2026-08-01): EC2基礎、セキュリティグループ設計、bastion/Session Manager/IAPの比較