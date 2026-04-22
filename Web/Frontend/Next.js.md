# 1. Next.js

## 1.1. 概要

Next.js は React ベースのフルスタック Web フレームワーク。Vercel が開発・メンテナンスしている。
SSR・SSG・ISR・CSR を柔軟に組み合わせられるのが特徴。

---

## 1.2. App Router vs Pages Router

| 項目           | App Router (v13.4〜)          | Pages Router (従来)                     |
| -------------- | ----------------------------- | --------------------------------------- |
| ディレクトリ   | `app/`                        | `pages/`                                |
| コンポーネント | Server Component がデフォルト | 全て Client Component                   |
| データ取得     | `async/await` で直接 fetch    | `getServerSideProps` / `getStaticProps` |
| レイアウト     | `layout.tsx` でネスト可       | `_app.tsx` / `_document.tsx`            |
| ストリーミング | 対応                          | 非対応                                  |

現在は **App Router** が推奨。

---

## 1.3. ルーティング (App Router)

```text
app/
├── layout.tsx          # ルートレイアウト
├── page.tsx            # / のページ
├── about/
│   └── page.tsx        # /about
├── blog/
│   ├── page.tsx        # /blog
│   └── [slug]/
│       └── page.tsx    # /blog/:slug (動的ルート)
└── api/
    └── hello/
        └── route.ts    # API Route
```

### 1.3.1. 特殊ファイル

| ファイル        | 役割                       |
| --------------- | -------------------------- |
| `page.tsx`      | ルートに対応するUI         |
| `layout.tsx`    | 子ページに共通のレイアウト |
| `loading.tsx`   | Suspense フォールバック    |
| `error.tsx`     | エラーバウンダリ           |
| `not-found.tsx` | 404 ページ                 |
| `route.ts`      | API エンドポイント         |

---

## 1.4. Server Component と Client Component

### 1.4.1. Server Component (デフォルト)

- サーバーで実行される。バンドルサイズに影響しない
- DB・ファイルシステムへの直接アクセスが可能
- `useState` / `useEffect` などのフックは使えない

```tsx
// app/users/page.tsx
async function UsersPage() {
  const users = await fetch('https://api.example.com/users').then(r => r.json())
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### 1.4.2. Client Component

- `'use client'` ディレクティブが必要
- インタラクション・状態管理が必要な場合に使う

```tsx
'use client'
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

---

## 1.5. データ取得

### 1.5.1. fetch のキャッシュ制御

```ts
// キャッシュあり (デフォルト、SSG相当)
fetch('https://api.example.com/data')

// キャッシュなし (SSR相当)
fetch('https://api.example.com/data', { cache: 'no-store' })

// ISR (revalidate 秒ごとに再生成)
fetch('https://api.example.com/data', { next: { revalidate: 60 } })
```

### 1.5.2. Route Segment Config

```ts
// page.tsx または layout.tsx で設定
export const dynamic = 'force-dynamic'   // SSR
export const revalidate = 3600           // ISR (秒)
```

---

## 1.6. API Routes (route.ts)

```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const users = await db.user.findMany()
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const user = await db.user.create({ data: body })
  return NextResponse.json(user, { status: 201 })
}
```

---

## 1.7. Server Actions

フォームやボタンからサーバー処理を直接呼び出せる機能。

```tsx
// app/actions.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  await db.user.create({ data: { name } })
  revalidatePath('/users')
}

// app/users/new/page.tsx
import { createUser } from '../actions'

export default function NewUserPage() {
  return (
    <form action={createUser}>
      <input name="name" />
      <button type="submit">作成</button>
    </form>
  )
}
```

---

## 1.8. Middleware

```ts
// middleware.ts (プロジェクトルート)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

---

## 1.9. 画像最適化

```tsx
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // LCP 画像に付ける
/>
```

---

## 1.10. よく使う next.config.ts の設定

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [{ hostname: 'example.com' }],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
}

export default config
```

---

## 1.11. よく使うコマンド

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
npm run dev       # 開発サーバー起動
npm run build     # プロダクションビルド
npm run start     # プロダクションサーバー起動
npm run lint      # ESLint 実行
```
