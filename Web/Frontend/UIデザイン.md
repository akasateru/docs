# 1. UIデザインの学び方

UIデザインは言語化できる原則が多い分野。読書だけでなく、既存の良いUIを模写（写経）しながら学ぶと定着しやすい。

## 1.1. 学習アプローチ

- **模写から入る**: Dribbble/MobbinなどでUIを見つけ、Figmaやコードでピクセル単位で再現する。「なぜこの余白・配色なのか」を手を動かして体感する。
- **原則を1冊で押さえる**: 『Refactoring UI』（Adam Wathan / Steve Schoger）が、コントラスト・余白・階層などの原則を具体例つきで解説していて実践しやすい。
- **小さく作って晒す**: 自分のプロダクトの1画面だけを作り替え、フィードバックをもらうところまでを1セットにすると学びが定着しやすい。

## 1.2. インスピレーション・パターン収集サイト

| サイト | 特徴 |
| --- | --- |
| [Mobbin](https://mobbin.com/) | 実サービスの画面をオンボーディング・フォーム・空状態などパターン別に検索できる。模写教材として実用的 |
| [Awwwards](https://www.awwwards.com/) | 審査員選出の凝ったWebデザイン集。トレンド把握向き（プロダクトUIというより表現寄り） |
| [Dribbble](https://dribbble.com/) / [Behance](https://www.behance.net/) | ビジュアル重視の投稿型。アイデア出しに向く |
| [Collect UI](https://collectui.com/) | ボタン・フォームなどパーツ単位の日常UIパターン集。模写しやすい粒度 |

## 1.3. デザインガイドライン

- **Material Design**: Androidユーザーに馴染みのある設計思想。
- **Apple Human Interface Guidelines (HIG)**: iOSアプリの厳格なデザイン哲学。視覚的な美しさと機能性の両立を学べる。

## 1.4. ShadCNベースのプロダクト向けリソース

プロダクトでshadcn/uiを使っている場合、以下が特に実装に直結する（詳細は [Shadcn UI](Shadcn%20UI.md) 参照）。

| サイト | 特徴 |
| --- | --- |
| [shadcn/ui 公式](https://ui.shadcn.com/) | コンポーネントのデフォルト実装自体が「良いUIの基準」。まず写経する対象として最適 |
| [shadcn/ui Blocks](https://ui.shadcn.com/blocks) | ダッシュボード・ログイン画面などページ単位のレイアウト例 |
| [TweakCN](https://tweakcn.com/) | テーマ（カラー・角丸・シャドウ）をGUIで調整・比較できるツール |
| [shadcnblocks.com](https://www.shadcnblocks.com/) | サードパーティ製のプロダクションレベルなShadCNブロック集 |

## 1.5. 2026年のトレンド傾向

- 「Bento UI」（情報を升目状に整理するレイアウト）が引き続き進化。
- ダークモード・大胆なタイポグラフィ・マイクロインタラクションが主流。
- AIによるパーソナライズ・動的コンテンツが一般化しつつある。
