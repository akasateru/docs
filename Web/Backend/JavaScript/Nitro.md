# Nitro

unjs（Nuxtチーム）が開発したマルチランタイム対応のサーバーエンジン。Nuxt 3のデフォルトサーバーとして採用されている。

## 1. 概要

- 「サーバーエンジン」という位置づけで、Express（フレームワーク）とは階層が異なる
  - Express: HTTPフレームワーク。Node.js専用で、開発者が直接ルーティング/ミドルウェアを書く対象
  - Nitro: サーバーコードを異なるプラットフォーム向けにビルド出力する**ビルド/ランタイム層**。Nuxt等の裏側で動く
- ファイルベースルーティング、自動インポート、ビルド時最適化（tree-shaking）を内蔵
- Nuxt 3以外にSolidStartなど他フレームワークでも採用されている

## 2. ルーティング

`routes/`（単体利用時）または`server/api/`（Nuxt利用時）配下にファイルを置くだけでエンドポイントになる。

```typescript
// routes/index.ts
export default defineEventHandler((event) => {
  return { message: 'Hello World' }
})
```

## 3. マルチランタイムビルド（preset）

最大の特徴は、同じソースコードを**ビルド時に指定したターゲット環境向けの形式にコンパイル**できること。

```bash
npm run build                            # デフォルト(Node.js)向け
NITRO_PRESET=cloudflare npm run build    # Cloudflare Workers向け
NITRO_PRESET=vercel npm run build        # Vercel向け
NITRO_PRESET=deno npm run build          # Deno向け
```

Nuxt経由で使う場合は`nuxt.config.ts`で指定する。

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare',
  },
})
```

対応ランタイムの詳細（Cloudflare Workers/Deno/Bun/Vercel/AWS Lambda等の特徴比較）は[Hono.md](Hono.md)の「対応ランタイム」セクションを参照（Nitroも同種のマルチランタイム設計思想）。

## 4. Nuxtとの関係

Nuxt 3は「フロントエンド（Vueコンポーネント）」と「サーバー部分」を両方持つが、そのサーバー部分の実行エンジンとしてNitroが使われている。

- `server/api/`配下のファイルがNitroのルーティング機構でAPIエンドポイントになる
- SSR（サーバーサイドレンダリング。詳細は[レンダリング方式.md](../../Frontend/レンダリング方式.md)）のリクエスト処理もNitroが担当
- `nuxt build`すると内部でNitroが「どの環境にデプロイするか」に応じたサーバーコードを生成する

普段Nuxtを使うだけならNitroを意識することは少ないが、`nitro.preset`の設定やビルド出力の仕組みを触るときに存在が表に出てくる。詳細は[NuxtJS.md](../../Frontend/NuxtJS.md)を参照。

## 5. バックエンド（FastAPI等）の代替になるか

**部分的にはYesだが、得意分野が違う。**

Nitro（Nuxtのサーバー部分）が担うのは主に、

1. SSR用のレンダリング処理（Vueコンポーネントを実行してHTML文字列を組み立てる）
2. 簡易的なAPIエンドポイント（プロジェクト内で完結する軽量API）

これは**BFF（Backend For Frontend）**、つまり「フロントエンドのために整形したデータを返す薄い層」として使うのに向いている。

一方、FastAPIのような本格的なバックエンドが担う領域——

- DBとの複雑なやり取り（ORM、マイグレーション管理）
- 認証・認可の本格的な実装
- 重い計算処理、機械学習モデルの推論
- Pythonエコシステム（pandas, numpy, PyTorch等）への依存
- 型安全なバリデーション（Pydanticのような強力な仕組み）

はNode.js/Nitro側では素朴に作ると弱くなりがち。

実務でよくある構成は、Nuxtの`server/api`は「フロント専用の薄いAPI・SSRレンダリング」に限定し、本格的なビジネスロジック・DB操作・AI推論は別途FastAPI等のバックエンドに任せて、NuxtからそのAPIを呼び出すという**フロントエンド/バックエンド分離構成**。Nitroは「完全なバックエンド代替」というより「フロントエンドに一番近いところの軽量サーバー」と捉えると実態に近い。

## 6. TypeScriptでバックエンドを丸ごと書く選択肢

上記の分離構成が一般的ではあるが、Node.js/Deno/Bunなどのランタイム上でバックエンドを丸ごとTypeScriptで書く選択肢もある。

- フロント: Vue/React (TypeScript)
- バックエンド: 同じTypeScriptで書かれたAPIサーバー（Express/Hono/NestJS等）
- DB操作もTS用ORM（Prisma、Drizzleなど）

この構成にすればフロント/バックで言語・型定義を共有できる。この文脈で軽量・型安全・マルチランタイムなバックエンドフレームワークとして選ばれることが多いのが[Hono.md](Hono.md)。特にCloudflare Workers上でAPIサーバーを丸ごと動かしたい場合や、フロントと型を共有したい（tRPCと組み合わせるケース）で採用される。ただしPythonの機械学習・データ処理エコシステムに依存する場合は、その部分だけFastAPI側に残す混在構成もよくある。
