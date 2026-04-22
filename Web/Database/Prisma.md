# Prisma

## 概要

Prisma は Node.js / TypeScript 向けの ORM（Object-Relational Mapper）。
スキーマファイルから型安全なクライアントを自動生成するのが特徴。

主要コンポーネント:

- **Prisma Client** — 型安全なクエリを発行する自動生成クライアント
- **Prisma Migrate** — スキーマ変更をマイグレーションファイルで管理
- **Prisma Studio** — ブラウザ上でデータを確認・編集できる GUI

---

## セットアップ

```bash
npm install prisma @prisma/client
npx prisma init          # prisma/schema.prisma と .env を生成
```

`.env` にデータベース URL を設定:

```text
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

---

## スキーマ定義 (schema.prisma)

```prisma
datasource db {
  provider = "postgresql"   // postgresql / mysql / sqlite / sqlserver / mongodb
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### よく使うフィールド属性

| 属性 | 意味 |
| --- | --- |
| `@id` | 主キー |
| `@default(autoincrement())` | 自動採番 |
| `@default(cuid())` | CUID を自動生成 |
| `@default(uuid())` | UUID を自動生成 |
| `@default(now())` | 現在時刻 |
| `@unique` | 一意制約 |
| `@updatedAt` | 更新時に自動で現在時刻をセット |
| `@relation` | リレーション定義 |
| `?` (末尾) | NULL 許容 |

---

## マイグレーション

```bash
# 開発環境: マイグレーションファイル生成 & 適用
npx prisma migrate dev --name add_user_table

# 本番環境: 未適用のマイグレーションを適用
npx prisma migrate deploy

# スキーマに合わせて DB を強制同期 (マイグレーション履歴なし、開発用)
npx prisma db push

# 既存 DB からスキーマを逆生成
npx prisma db pull

# Prisma Client を再生成
npx prisma generate
```

---

## Prisma Client の使い方

### 初期化

```ts
// lib/prisma.ts (Next.js ではシングルトン化が必要)
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### CRUD 操作

```ts
import { prisma } from '@/lib/prisma'

// 作成
const user = await prisma.user.create({
  data: { email: 'alice@example.com', name: 'Alice' },
})

// 一件取得 (見つからなければ null)
const user = await prisma.user.findUnique({
  where: { email: 'alice@example.com' },
})

// 一件取得 (見つからなければ例外)
const user = await prisma.user.findFirstOrThrow({
  where: { id: 1 },
})

// 一覧取得
const users = await prisma.user.findMany({
  where: { name: { contains: 'alice' } },
  orderBy: { createdAt: 'desc' },
  skip: 0,
  take: 10,
})

// 更新
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Bob' },
})

// Upsert (なければ作成、あれば更新)
const upserted = await prisma.user.upsert({
  where: { email: 'carol@example.com' },
  create: { email: 'carol@example.com', name: 'Carol' },
  update: { name: 'Carol Updated' },
})

// 削除
await prisma.user.delete({ where: { id: 1 } })

// 件数取得
const count = await prisma.user.count({ where: { published: true } })
```

### リレーション

```ts
// リレーション先を一緒に取得 (include)
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
})

// 特定フィールドのみ取得 (select)
const userNames = await prisma.user.findMany({
  select: { id: true, name: true },
})

// ネストした作成
const user = await prisma.user.create({
  data: {
    email: 'dave@example.com',
    posts: {
      create: [{ title: 'Hello World' }],
    },
  },
  include: { posts: true },
})
```

### トランザクション

```ts
// Sequential transaction (前の結果を次で使う)
const [user, post] = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'eve@example.com' } })
  const post = await tx.post.create({
    data: { title: 'First Post', authorId: user.id },
  })
  return [user, post]
})

// Batch transaction (独立した操作を一括実行)
await prisma.$transaction([
  prisma.user.update({ where: { id: 1 }, data: { name: 'Frank' } }),
  prisma.post.delete({ where: { id: 10 } }),
])
```

### 生 SQL

```ts
// 生クエリ (型はそのまま)
const result = await prisma.$queryRaw`SELECT * FROM "User" WHERE id = ${1}`

// 生クエリ (型を指定)
import { Prisma } from '@prisma/client'
const users = await prisma.$queryRaw<User[]>(
  Prisma.sql`SELECT * FROM "User"`
)

// 生の更新系クエリ
await prisma.$executeRaw`UPDATE "User" SET name = 'Grace' WHERE id = ${1}`
```

---

## フィルタ演算子

```ts
await prisma.user.findMany({
  where: {
    name: { contains: 'alice', mode: 'insensitive' }, // ILIKE '%alice%'
    email: { endsWith: '@example.com' },
    createdAt: { gte: new Date('2024-01-01') },
    id: { in: [1, 2, 3] },
    NOT: { published: false },
    OR: [{ name: 'Alice' }, { name: 'Bob' }],
  },
})
```

---

## よく使うコマンド

```bash
npx prisma studio          # GUI を起動 (localhost:5555)
npx prisma format          # schema.prisma をフォーマット
npx prisma validate        # スキーマの検証
npx prisma migrate status  # マイグレーション状態確認
```
