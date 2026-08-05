# 1. Amazon EventBridge

AWSのイベント駆動型ルーティングサービス。AWSサービスやカスタムアプリのイベントを受け取り、ルールに基づいて他のサービス(Lambda, SQS, SNSなど)にルーティングする。旧称 CloudWatch Events。

## 1.1. 主な使い方

1. **イベントバス**: AWSサービス間・カスタムアプリからのイベントをルールでフィルタし、ターゲットへ配送する(疎結合な連携基盤)
2. **スケジューラ**: cron式/rate式で定期的にターゲットを呼び出す(旧CloudWatch Eventsのスケジュールルール機能を統合したもの)

## 1.2. スケジュールルールの例: cron起動でEC2を立ち上げる

EventBridgeのスケジュールルールは直接EC2アクションをターゲットにできないため、間にLambda(またはSSM Automation)を挟むのが一般的。

```
EventBridge Scheduled Rule (cron式)
        ↓ 定期実行
    Lambda関数
        ↓ boto3で ec2.start_instances() を呼ぶ
    EC2インスタンス起動
```

### 1.2.1. cron式

```
cron(0 9 * * ? *)   # 毎日9:00 UTC に実行
```

UTC基準の点に注意。JST 9:00にしたい場合は `cron(0 0 * * ? *)`。

### 1.2.2. Lambda関数(Python例)

```python
import boto3

INSTANCE_ID = "i-xxxxxxxxxxxxxxxxx"

def handler(event, context):
    ec2 = boto3.client("ec2", region_name="ap-northeast-1")
    ec2.start_instances(InstanceIds=[INSTANCE_ID])
    return {"status": "started", "instance": INSTANCE_ID}
```

### 1.2.3. 必要な権限

- Lambda実行ロールに `ec2:StartInstances` / `ec2:DescribeInstances` を対象インスタンスARN限定で付与
- EventBridge→Lambdaの呼び出しはLambda側のリソースベースポリシーで許可(コンソールでルールにLambdaをターゲット追加すると自動付与されることが多い)

### 1.2.4. Lambdaレスの代替案

**AWS Systems Manager (SSM) Automation** をEventBridgeターゲットに直接指定すれば、Lambdaを介さずEC2操作を実行できる。

### 1.2.5. 起動/停止をセットで運用する

平日9時起動・19時停止のようなコスト削減運用では、起動用・停止用の2つのEventBridgeルール+Lambda(またはSSM Automation)を用意するのが典型パターン。起動時に毎回セットアップし直す手間を省くには、事前に必要なソフトを入れたカスタム[AMI](AMI.md)から起動するとよい。

## 1.3. 参考

- 会話ログ(2026-08-05): EventBridgeの概要、cron+Lambda+EC2起動パターンの実装
