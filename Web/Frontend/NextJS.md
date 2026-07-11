# 1. Next.js

## 1.1. 概要

Next.jsはReactベースのフルスタックフレームワーク。ルーティング、レンダリング戦略、APIエンドポイント、最適化機能などを標準で備え、Vercelが開発を主導している。

## 1.2. App RouterとPages Router

| 項目           | App Router（`app/`）                  | Pages Router（`pages/`）      |
| -------------- | ---------------------------------------- | -------------------------------- |
| コンポーネント | デフォルトでServer Component            | 常にClient Component相当        |
| データ取得     | コンポーネント内で直接async/await       | `getServerSideProps` などの専用関数 |
| レイアウト     | `layout.tsx` でネスト可能               | `_app.tsx` で共通化              |
| 現在の位置づけ | 推奨・新規開発の標準                    | 従来方式（レガシー扱い）         |

## 1.3. レンダリング方式

- **SSG（Static Site Generation）**: ビルド時にHTMLを生成。ブログ記事など更新頻度の低いページ向け。
- **SSR（Server-Side Rendering）**: リクエストごとにサーバーでHTMLを生成。パーソナライズされたページ向け。
- **ISR（Incremental Static Regeneration）**: 指定した間隔でバックグラウンド再生成し、SSGの速さとデータの鮮度を両立。
- **CSR（Client-Side Rendering）**: ブラウザ側でデータ取得・描画。インタラクションが多い部分向け。

## 1.4. Server ComponentsとClient Components

- Server Componentはサーバー側でのみ実行され、JSがクライアントに送られないため初期表示が軽い。
- `useState` や `onClick` などブラウザAPI・状態を使う部分は `"use client"` を宣言してClient Componentにする。
- データ取得はできるだけServer Component側に寄せ、インタラクティブな末端部分だけをClient Componentに切り出すのが基本方針。

## 1.5. 主な最適化機能

- `next/image`: 画像の自動最適化・遅延読み込み。
- `next/font`: フォントの自動ホスティングでレイアウトシフトを抑制。
- Route Segment単位のコード分割による初期バンドルサイズの削減。

## 1.6. 参考

- [Next.js公式ドキュメント](https://nextjs.org/docs)
