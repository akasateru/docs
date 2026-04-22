## 1. NuxtJS

## 2. 概要

- Vue.jsをベースにした強力なオープンソースのフロントエンドフレームワーク
- SSR（サーバーサイドレンダリング）やSSG（静的サイト生成）を標準でサポート

## 3. 主な特徴

| 機能                              | 説明                                                              |
| --------------------------------- | ----------------------------------------------------------------- |
| ファイルベースルーティング        | `pages/` ディレクトリにファイルを作るだけで URL が自動設定される  |
| SSR（サーバーサイドレンダリング） | 初期表示が速く、SEO に強い                                        |
| SSG（静的サイト生成）             | `nuxt generate` でビルド時にHTMLを生成。CDN配信に向く             |
| API Routes（Server Routes）       | `server/api/` にファイルを置くだけでAPIエンドポイントを作成できる |
| 自動インポート                    | コンポーネントやComposablesを明示的にimportせず使える             |
| モジュールエコシステム            | `@nuxtjs/tailwindcss` などのモジュールで機能を簡単に追加できる    |

## 4. レンダリングモード

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,        // SSR（デフォルト）
  // ssr: false,    // SPA（クライアントサイドのみ）
})
```

- **SSR**: リクエストのたびにサーバーでHTMLを生成
- **SSG**: ビルド時にHTMLを生成（`nuxt generate`）
- **SPA**: すべてクライアントで描画（`ssr: false`）
- **Hybrid**: ページごとにSSR/SSGを混在させることも可能（Nuxt 3）

## 5. ディレクトリ構成

```text
.
├── pages/          # ファイルベースルーティング
├── components/     # Vueコンポーネント（自動インポート）
├── composables/    # Composables（自動インポート）
├── layouts/        # レイアウトコンポーネント
├── middleware/     # ルートミドルウェア
├── server/
│   ├── api/        # APIエンドポイント
│   └── middleware/ # サーバーミドルウェア
├── plugins/        # プラグイン
├── assets/         # CSS・画像などの静的ファイル（Viteで処理）
├── public/         # そのまま配信される静的ファイル
└── nuxt.config.ts  # Nuxt設定ファイル
```

## 6. データフェッチ

```ts
// useFetch: SSR/CSR両対応、キャッシュあり
const { data, pending, error } = await useFetch('/api/items')

// useAsyncData: より柔軟なデータ取得
const { data } = await useAsyncData('key', () => $fetch('/api/items'))

// $fetch: キャッシュなし、クライアント/サーバー両方で使える
const data = await $fetch('/api/items')
```

## 7. Server Routes（API）

```ts
// server/api/hello.get.ts
export default defineEventHandler((event) => {
  return { message: 'Hello, Nuxt!' }
})
// → GET /api/hello でアクセス可能
```

## 8. Nuxt Modules

| モジュール            | 用途                           |
| --------------------- | ------------------------------ |
| `@nuxtjs/tailwindcss` | Tailwind CSS の統合            |
| `@pinia/nuxt`         | Pinia（状態管理）の統合        |
| `@nuxt/image`         | 画像最適化                     |
| `@nuxtjs/i18n`        | 多言語対応                     |
| `@nuxt/content`       | Markdownベースのコンテンツ管理 |

## 9. 注意事項・Tips

### 9.1. メモリ制限

Nuxtがメモリを大量消費し、FastAPIなどと同居している場合にスワップが発生することがある。

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

### 9.2. SSR時の注意

- `window` や `document` などブラウザAPIはSSR時に使えないため、`process.client` で分岐するか `onMounted` 内で使う
- Cookieやセッション情報はSSR時に `useRequestHeaders` で取得する

### 9.3. Nuxt 2 vs Nuxt 3

| 項目             | Nuxt 2     | Nuxt 3                   |
| ---------------- | ---------- | ------------------------ |
| Vue バージョン   | Vue 2      | Vue 3                    |
| ビルドツール     | Webpack    | Vite（デフォルト）       |
| TypeScript       | オプション | ファーストクラスサポート |
| Composition API  | オプション | 標準                     |
| サーバーエンジン | Express    | Nitro                    |
