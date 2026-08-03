# Security Command Center

GCPの中核的なセキュリティ・リスク管理プラットフォーム。環境内のリソースを可視化し、誤設定・脆弱性・脅威を検出して一元的なダッシュボードで管理する。

## 1. 主な機能

- **資産インベントリ**: GCP環境内のリソース（VM、ストレージ、IAMなど）を可視化・棚卸し
- **脆弱性検出**: 誤設定（公開バケット、緩すぎるIAM権限など）や既知の脆弱性を検出
- **脅威検出**: Event Threat Detectionなどにより、不審なアクティビティ（マルウェア通信、権限昇格の兆候など）を検知
- **コンプライアンス監視**: CIS Benchmark、PCI-DSSなどの標準に対する準拠状況をチェック
- **統合ダッシュボード**: 上記の検出結果を一元的なダッシュボードで確認・優先順位付け

## 2. ティア

Standard / Premium / Enterprise の3段階があり、上位ティアほど検出ルールや自動化（[SOAR](../../Web/Security/SOAR.md)的機能）が充実する。

## 3. 他クラウドの類似サービス

- **AWS**: Security Hub（GuardDuty、Inspectorなどと連携）
- **Azure**: Microsoft Defender for Cloud

## 4. 参考

- [Cloud Armor.md](Cloud%20Armor.md)
- [SOAR.md](../../Web/Security/SOAR.md)