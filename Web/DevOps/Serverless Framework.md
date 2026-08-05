## 1. Serverless Framework

Serverless Frameworkは、AWS Lambda等のサーバーレスコンピューティング環境へのデプロイを自動化するOSSのIaCツール。`serverless.yml` に宣言的にリソースを書き、CLIでデプロイする。npmパッケージ名は `serverless`。

「Serverless」という語自体はサービス名ではなく、サーバーの管理をクラウド事業者に任せ、リクエスト単位で実行・課金される**コンピューティングモデル**を指す一般名詞でもある点に注意（例: Vercel Functions、AWS Lambda、Cloudflare Workersなど）。本ノートは、その名を冠した具体的なプロダクト・企業について扱う。

## 2. 提供元: Serverless, Inc.

| 項目             | 内容                                                             |
| ---------------- | ------------------------------------------------------------------ |
| 創業             | 2015年、Austen Collins が設立                                     |
| 本社             | サンフランシスコ                                                   |
| 累計調達額       | 約$32.1M（2016年シード$3M → 2018年シリーズA $10M、Lightspeed主導） |
| 主な投資家       | Lightspeed Venture Partners、Trinity Ventures、Heavybit             |
| 事業規模の目安   | 22人規模・年商$1.5M程度（2024年時点の報告）                        |

OSSコミュニティ発の中堅スタートアップ規模で、AWSやHashiCorpのような大企業ではない。

## 3. プロダクトラインナップ

### 3.1. Serverless Framework（CLI）

無料・OSS。`serverless.yml` の記述例:

```yaml
service: my-api
provider:
  name: aws
  runtime: nodejs20.x
functions:
  hello:
    handler: handler.hello
    events:
      - httpApi: 'GET /hello'
```

```bash
serverless deploy
```

これでAPI Gateway + Lambdaが自動デプロイされる。YAML＋プラグイン方式で、歴史が長くエコシステムが豊富。

### 3.2. Serverless Framework Dashboard / Platform（SaaS）

CLIに加えて以下を統合的に提供する有料SaaS。

- 複数AWSアカウント横断のデプロイ管理
- モニタリング・アラート
- シークレット管理
- CI/CDパイプライン連携
- チーム開発フローの管理

### 3.3. V.4の新機能（2026年時点）

- **Sandboxes**: AWS Lambda上の隔離された一時実行環境
- **Amazon Bedrock AgentCore対応**: AIエージェント系ワークロードへの拡張
- **Managed Instances / Durable Functions**
- **AWS Login & SSO** 組み込み対応

### 3.4. 料金

CLIは年商$2M未満の個人・組織は無料。それ以上の組織はクレジット制（標準$4/クレジット、割引で最安$1/クレジット）。

## 4. 類似ツールとの比較

| ツール                     | 特徴                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| **Serverless Framework**   | YAML＋プラグイン方式。最も歴史が長い。近年は有料プラットフォームへの舵取りでコミュニティに不安の声も |
| **AWS SAM**                | AWS公式。CloudFormationのマクロとして展開される、最もAWS純正に近い選択肢                           |
| **[Terraform](Terraform.md)** | HashiCorp製の汎用IaC。サーバーレスに限らずクラウド全般のリソースを管理                            |
| **AWS CDK**                | 汎用IaC。TypeScript/Pythonなどのコードでインフラを組む。サーバーレス専用ではない                   |
| **SST**                    | CDK上に構築された高レベル抽象化（`Api`, `Bucket`, `Table`等）。TypeScript寄りの開発者に人気         |

判断の目安: 既にServerless FrameworkやSAMで困っていなければ移行不要。TypeScriptでコードとしてインフラを書きたいなら CDK / SST / Pulumi の方が今どき。

## 5. 参考

- [Serverless Framework 公式](https://www.serverless.com/)
- [Serverless Framework Dashboard](https://www.serverless.com/dashboard)
- [About Serverless, Inc.](https://www.serverless.com/about)
- [GitHub - serverless/serverless](https://github.com/serverless/serverless)
- [Serverless Framework vs SAM vs AWS CDK](https://blog.sebastianbille.com/serverless-framework-vs-sam-vs-aws-cdk)
