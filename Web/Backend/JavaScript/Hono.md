# Hono

軽量・高速・マルチランタイム対応が特徴のTypeScript製Webフレームワーク。

## 1. 概要

- 作者は米国在住の日本人エンジニア Yusuke Wada 氏。名前は日本語の「炎」に由来
- コアはゼロ依存で超軽量
- Web標準API（Fetch, Request, Response等）をベースに設計されているため、特定ランタイムに依存しない
- TypeScriptファーストで型推論が強力。RPC機能（`hc`クライアント）によりサーバーの型をクライアントにそのまま共有できる（tRPCに近い体験）

```typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))

app.get('/users/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ id })
})

export default app
```

- 公開APIやSPA/モバイル向けのBFF、Cloudflare WorkersなどエッジでAPIを組みたい場合、Next.js API Routesやexpress + tRPCの代替として使われるケースが多い

## 2. 対応ランタイム

Web標準APIのみに依存する設計のため、以下のようにほぼ全てのJSランタイムで同じコードが動く（Node.js/AWS Lambda等はアダプタ経由）。

### 2.1. Cloudflare Workers

- Cloudflareのエッジネットワーク上で動くサーバーレス実行環境
- V8のIsolateベースで動作し、コンテナ/VM起動が不要なため**起動が数msと極めて高速**（コールドスタートがほぼ無い）
- Node.js APIは使えずWeb標準APIのみに依存する制約があり、Honoは元々この制約に最適化されている
- KV・D1（SQLite）・R2・Durable Objects等独自エコシステムを持つ
- 用途: 低レイテンシ必須なAPI、リダイレクト処理、A/Bテスト、認証チェック等

### 2.2. Deno

- Node.jsの作者Ryan Dahlが「Node.jsの反省を活かして」開発したランタイム
- TypeScriptをネイティブサポート（トランスパイル不要）
- セキュリティがデフォルトで厳格（ファイル/ネットワークアクセスは明示的な許可が必要）
- Web標準APIに準拠しており、Cloudflare Workersとの親和性が高い
- `Deno Deploy`というエッジホスティングサービスも提供

### 2.3. Bun

- Zig製の超高速JSランタイム。Node.js/Denoの競合として登場
- パッケージマネージャ・バンドラ・テストランナーを内包したオールインワンツール
- Node.js APIとの互換性を重視しており、既存npmパッケージがそのまま動きやすい
- 起動速度・実行速度ともにNode.jsより高速なことが多い

### 2.4. Vercel

- Next.js開発元が提供するホスティング/デプロイプラットフォーム
- フロントエンド（静的/SSR）とサーバーレス関数（Edge Functions / Serverless Functions）を統合デプロイできる
- Edge Functions部分はWeb標準APIベースで動くため、Honoと相性が良い
- Gitプッシュで自動デプロイ、プレビュー環境が容易に作れる

### 2.5. Node.js

- V8ベースのサーバーサイドJS実行環境の事実上の標準。npmエコシステムが最大規模
- CommonJS由来の独自API（`fs`, `http`等）を持つため、Web標準APIのみに依存するランタイムとは互換性の壁がある
- Honoは`@hono/node-server`アダプタ経由でNode.jsに対応
- 歴史が長く安定しており、既存インフラ（VPS、コンテナ、PM2運用等）との親和性が高い

### 2.6. AWS Lambda

- AWSのサーバーレスコンピューティングサービス。イベント駆動（API Gateway、S3、SQS等トリガー）で関数実行、使った分だけ課金
- コールドスタートはCloudflare Workersより遅い傾向（特にVPC内Lambdaやパッケージサイズが大きい場合）
- Honoは専用アダプタでAPI Gatewayのイベント/レスポンス形式とHonoのRequest/Responseを変換して動作する

## 3. ルーティング

### 3.1. RegExpRouter（Honoのデフォルトルーター）

- Honoが持つ複数のルーター実装のうち、デフォルトで使われる最速のもの
- ルート定義時に全パターンを1つの巨大な正規表現にコンパイルし、リクエスト時は1回の正規表現マッチだけでルートを特定する
- 「登録順に1つずつパターンを試す線形探索」方式と違い、ルート数が増えてもパフォーマンスがほぼ劣化しない
- 静的ルート・パラメータ付きルート双方を高速に扱えるが、ワイルドカード等一部複雑なパターンは別ルーター`TrieRouter`にフォールバックする

### 3.2. Express（比較対象）

- Node.js向けWebフレームワークの事実上の標準（2010年〜）
- ミドルウェアチェーン方式（`app.use()`）を広めた立役者で、Honoを含む後発フレームワークの多くがこの思想を継承
- ルーティングは登録順の線形探索。内部的に正規表現ベースだがルートごとに逐次評価するため、大規模になるとオーバーヘッドが出やすい
- Node.js専用（Web標準APIベースでない）のため、Cloudflare Workers等のエッジ環境ではそのままでは動かない
- Honoは「使いやすさ」を踏襲しつつ、マルチランタイム対応と速度を両立させた後継的な立ち位置

## 4. 認証ミドルウェア

### 4.1. JWT認証（`hono/jwt`）

JSON Web Token（ヘッダー.ペイロード.署名の3パーツ構成）を使ったステートレスな認証方式。

```typescript
import { jwt } from 'hono/jwt'

app.use('/api/*', jwt({ secret: 'your-secret-key' }))

app.get('/api/protected', (c) => {
  const payload = c.get('jwtPayload')
  return c.json({ message: 'Authenticated!', user: payload })
})
```

- クライアントは`Authorization: Bearer <token>`ヘッダーでトークンを送信
- サーバー側でセッションを保持する必要がなくスケールしやすい（特にエッジ環境と相性が良い）
- 署名検証（HMACやRSA）で改ざんを検知できるが、トークン自体は失効管理がしづらい（有効期限で対応するのが一般的）
- JWT検証の一般的なセキュリティ観点は[認証認可](../../Auth/認証認可.md)を参照

### 4.2. Basic認証（`hono/basic-auth`）

HTTPの標準的な認証方式で、`Authorization: Basic <base64(username:password)>`ヘッダーを使う。

```typescript
import { basicAuth } from 'hono/basic-auth'

app.use('/admin/*', basicAuth({
  username: 'admin',
  password: 'secret',
}))
```

- シンプルで実装コストが最も低いが、Base64は暗号化ではなくエンコードのため**必ずHTTPS通信と組み合わせる**必要がある
- 管理画面や内部ツール、簡易的なアクセス制限等の軽量な用途向け
- ユーザーごとの複雑な権限管理には向かず、本格的なユーザー認証にはJWTやセッション認証の方が適している

### 4.3. 使い分けの目安

公開APIやSPA/モバイルアプリ向けにはJWT、社内ツールや簡易的な保護にはBasic認証、というのが一般的な選択基準。