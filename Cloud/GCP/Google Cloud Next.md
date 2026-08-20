# 1. Google Cloud Next

Googleが毎年開催するクラウド関連の年次カンファレンス。新製品・サービスの発表の場であり、その年のGoogle Cloudの戦略の方向性を掴む最速の情報源になる。

## 1.1. 効率的な追い方

- 基調講演（キーノート）だけ視聴すれば主要発表は把握できる。YouTubeにアーカイブされる。
- 発表直後の[Google Cloud公式ブログ](https://cloud.google.com/blog/topics/google-cloud-next)のまとめ記事が最速の一次情報源。
- 発表数が多い（数百件規模）ため、まとめ記事で拾うのが現実的。詳細を追うのは自分の業務領域（GenAI開発）に関係する部分に絞るとよい。
- 参考: [[技術トレンドのキャッチアップ]]

## 1.2. Google Cloud Next '26（2026年4月22日〜24日 ラスベガス開催）

32,000人以上が参加し、260件の発表。テーマは「**Agentic Enterprise**」— AIが受動的なアシスタントから自律的に思考・行動する**AIエージェント**へ進化するというもの。Google Cloud CEO Thomas Kurian氏は「試験運用（パイロット）の時代は終わり、エージェントの時代が来た」と宣言。

### 1.2.1. Gemini Enterprise Agent Platform（目玉発表）

エージェントを構築・拡張・ガバナンス・最適化するための統合プラットフォーム。

- **Agent Development Kit（ADK）**: サブエージェントのネットワークで複雑な問題を解決
- **Agent Studio / Agent Designer**: ノーコード→フルコード開発への移行をサポート
- **Agent Sandbox**: 生成コードの安全な実行環境（一般提供中）
- **Agent Memory Bank**: 長期記憶の動的生成・選別
- **Agent Identity**: 各エージェントに検証可能な暗号IDを割り当て
- **Agent Registry / Agent Gateway**: 承認済みツールの一元管理、エージェントフリート管理の単一制御ポイント
- **Agent Anomaly Detection / Agent Evaluation**: 不審動作のリアルタイム検出、マルチターン自動評価

Gemini Enterpriseアプリ側にはProjects（チーム専用スペース、Drive/NotebookLM連携）、Skills（「@」メンションで反復タスクを短縮）、Canvas、Deep Researchエージェント、BYO-MCPインテグレーションなどが追加。パートナー各社が構築した70以上のエージェントを揃える「Agent Gallery」も公開（Accenture、Adobe、Salesforce、Workdayなど）。

### 1.2.2. 新モデル

Gemini 3.1 Pro、Gemini 3.1 Flash Image（Nano Banana 2）、Veo 3.1 Lite、Lyria 3 Pro。

### 1.2.3. AIインフラ

- **第8世代TPU**: TPU 8t（トレーニング用、前世代比3倍性能）、TPU 8i（推論・強化学習用、コスト効率最大80%改善、超低レイテンシ）
- NVIDIA Blackwell GPU対応の新VM「C4N」「M4N」、Google Distributed CloudでのBlackwell GPUサポート
- Google Axion（Armベース）N4A/C4A.metal、Intel Xeon 6搭載C4インスタンス
- ストレージ: Hyperdisk ML（総スループット2 TiB/秒）、Cloud Storage Rapid Bucket（15TB/秒超帯域幅）

### 1.2.4. Agentic Data Cloud

- **Cross-Cloud Lakehouse**: AWSやAzure（対応予定）などマルチクラウドに分散するデータを、移動させずに直接クエリできるApache Icebergベースのデータレイクハウス
- **Knowledge Catalog**: ビジネス意味論のユニバーサルコンテキストエンジン
- BigQuery拡張（BigQuery Graph、AI.PARSE_DOCUMENT、TabularFM等）、Spanner Omni（マルチクラウド・オンプレ対応）

### 1.2.5. セキュリティ

Wizの買収完了に伴い「**Agentic Defense**」を発表。Googleの脅威インテリジェンス／セキュリティオペレーションとWizのクラウド・AIセキュリティプラットフォームを統合し、エージェント時代の脅威（プロンプトインジェクション、ツールポイズニング等）に対応。Model Armorでインラインポリシー適用・サニタイゼーションを実施。

### 1.2.6. その他

- 顧客導入事例14社（Capcom、Citi、Home Depot、Macy's、Merck、Unileverなど）が紹介され、実運用フェーズへの移行が強調された
- 7.5億ドルのイノベーション基金、70以上のビルト済みエージェントを揃えたAgent Marketplace
- SAP・Oracle・Palantirとの戦略統合

## 1.3. 参考

- [Google Cloud Next '26 で行われた260の発表のまとめ（Google Cloud公式ブログ）](https://cloud.google.com/blog/ja/topics/google-cloud-next/google-cloud-next-2026-wrap-up?hl=ja)
- [Google Cloud Next 2026での発表内容まとめ（ITmedia AI+）](https://www.itmedia.co.jp/aiplus/article/2604/23/1260423061/)
- [Google Cloud Next 2026 現地レポート（NRI SecureTechnologies）](https://www.nri-secure.co.jp/blog/google-cloud-next-2026-01)
- [Google Cloud Next 2026: AI agents, A2A protocol, Workspace Studio（TheNextWeb）](https://thenextweb.com/news/google-cloud-next-ai-agents-agentic-era)
