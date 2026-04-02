## 1. Tailwind CSS

- CSSフレームワークの一つ

### 1.1. Tailwind CSSの特徴

- 汎用的なクラスを組み合わせる（ユーティリティーファースト）
- CSSを書く必要がなくなる
- パフォーマンスが良い

overflow-hidden

break-words（CSSの overflow-wrap: break-word; または word-break: break-word;）: 「長すぎる英単語やURLが枠を突き抜けないように、途中で強制的に改行させる」ためのプロパティ。

## 2. クラス一覧

### 2.1. レイアウト (Layout)

要素の配置や表示形式を制御します。

| カテゴリー       | クラス例                                            | 説明                   |
| ---------------- | --------------------------------------------------- | ---------------------- |
| **Display**      | `block`, `inline-block`, `flex`, `grid`, `hidden`   | 要素の表示タイプ       |
| **Position**     | `static`, `relative`, `absolute`, `fixed`, `sticky` | 配置方法               |
| **Top/Right...** | `top-0`, `left-4`, `-bottom-2`                      | 距離（マイナス値も可） |
| **Z-Index**      | `z-0`, `z-10`, `z-50`, `z-auto`                     | 重なり順               |

### 2.2. ボックスモデル (Spacing & Sizing)

余白やサイズを指定します。数値の `1` は `0.25rem (4px)` 相当です。

#### 2.2.1. 余白 (Spacing)

- **Padding:** `p-{n}` (全方向), `px-{n}` (左右), `py-{n}` (上下), `pt-{n}` (上)
- **Margin:** `m-{n}`, `mx-{n}`, `my-{n}`, `mt-{n}`, `ml-{n}`
- **Space Between:** `space-x-4` (子要素間の横間隔)

#### 2.2.2. サイズ (Sizing)

- **Width:** `w-full` (100%), `w-screen` (100vw), `w-1/2` (50%), `w-64` (16rem)
- **Height:** `h-full`, `h-screen`, `h-auto`, `h-10`

### 2.3. フレックスボックス & グリッド (Flexbox & Grid)

モダンなレイアウト構築に必須のクラス。

#### 2.3.1. Flexbox

- **Direction:** `flex-row`, `flex-col`
- **Wrap:** `flex-wrap`, `flex-nowrap`
- **Alignment:** `items-center` (上下中央), `justify-between` (両端揃え)
- **Grow/Shrink:** `flex-grow`, `flex-shrink-0`

#### 2.3.2. Grid

- **Columns:** `grid-cols-1`, `grid-cols-3`, `grid-cols-12`
- **Gap:** `gap-4` (要素間の溝)
- **Span:** `col-span-2` (2列分占有)

### 2.4. タイポグラフィ (Typography)

テキストの装飾やフォント設定。

| カテゴリー      | クラス例                                       | 説明         |
| --------------- | ---------------------------------------------- | ------------ |
| **Font Size**   | `text-xs`, `text-base`, `text-xl`, `text-5xl`  | 文字の大きさ |
| **Font Weight** | `font-light`, `font-normal`, `font-bold`       | 文字の太さ   |
| **Align**       | `text-left`, `text-center`, `text-right`       | 文字の揃え   |
| **Color**       | `text-blue-500`, `text-white`, `text-gray-800` | 文字色       |
| **Decoration**  | `underline`, `line-through`, `no-underline`    | 下線など     |

#### 2.4.1. 背景・ボーダー・装飾 (Backgrounds, Borders & Effects)

見た目を整える仕上げのクラス。

- **Background Color:** `bg-red-500`, `bg-opacity-50`, `bg-transparent`
- **Border Radius:** `rounded-sm`, `rounded-md`, `rounded-full` (丸)
- **Border Width:** `border`, `border-2`, `border-t-4` (上の枠線のみ)
- **Border Color:** `border-gray-300`
- **Box Shadow:** `shadow-sm`, `shadow-lg`, `shadow-inner`

### 2.5. レスポンシブ & 状態変化 (States)

Tailwindの真骨頂であるプレフィックス機能。

- **レスポンシブ:** `md:w-1/2` (768px以上で幅50%), `lg:grid` (1024px以上でGrid)
- **ホバー/フォーカス:** `hover:bg-blue-700`, `focus:outline-none`
- **ダークモード:** `dark:bg-slate-900`

## 3. 参考

- [Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.](https://tailwindcss.com/)
- [Tailwind CSS 入門と実践](https://zenn.dev/yohei_watanabe/books/c0b573713734b9)
