# Playwright

E2Eテスト用ブラウザ自動化フレームワーク。要素操作・アサーションが自動待機（オートウェイト）されるのが特徴で、明示的な `sleep` がほぼ不要。TypeScript/JavaScript版とPython版で思想・API名がほぼ共通している。

## 1. セットアップ

```bash
npm init playwright@latest
```

`playwright.config.ts` にブラウザ種別・ベースURL・タイムアウトなどのグローバル設定を書く。

## 2. テストの基本構造

```typescript
import { test, expect } from '@playwright/test';

test('タイトルが正しいこと', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});
```

- `test(name, callback)` がテスト単位。
- `{ page }` は**フィクスチャ**（テスト関数の引数として自動注入される）。他に `context`, `browser`, `request` なども利用可能。
- `test.describe()` でグルーピング、`test.beforeEach()` / `test.afterEach()` で前後処理を書く。
- `test.extend()` でカスタムフィクスチャを定義できる。

```typescript
import { test as base } from '@playwright/test';
export const test = base.extend({
  myFixture: async ({ page }, use) => {
    await use(someValue);
  },
});
```

## 3. ロケーター（要素の指定）

Playwrightは「要素を探して即操作」ではなく、**遅延評価のロケーター**オブジェクトを介して操作する。ロケーターは実際に操作・アサーションされるまで要素を検索しない。

```typescript
page.getByRole('button', { name: '送信' })
page.getByText('ログイン')
page.getByLabel('メールアドレス')
page.getByPlaceholder('検索')
page.getByTestId('submit-btn')
page.locator('.some-class')       // CSSセレクタ
page.locator('xpath=//div')       // XPath
```

公式には `getByRole` などの**ユーザー視点のロケーター**（画面の見た目・アクセシビリティツリーに基づく指定）が推奨されている。CSS/XPathセレクタはDOM構造の変更に弱く壊れやすい。

## 4. アクション

```typescript
await page.getByRole('textbox').fill('hello');
await page.getByRole('button').click();
await page.getByLabel('チェック').check();
await page.getByRole('combobox').selectOption('value1');
await page.keyboard.press('Enter');
```

要素が操作可能な状態（表示・有効・アニメーション完了など）になるまで自動的に待機する。

## 5. アサーション（`expect`）

```typescript
await expect(page.getByText('成功')).toBeVisible();
await expect(page.getByRole('button')).toBeEnabled();
await expect(page).toHaveURL(/dashboard/);
await expect(locator).toHaveText('exact text');
await expect(locator).toHaveCount(3);
```

`expect` を使ったアサーションも、既定タイムアウトまで**自動リトライ（ポーリング）**される。これが `pytest` の単純な `assert` との大きな違いで、非同期に描画されるUIのテストに向いている。

## 6. その他よく使う機能

```typescript
// 複数要素の扱い
const items = page.locator('li');
await expect(items).toHaveCount(5);
await items.nth(0).click();

// ネットワークのモック
await page.route('**/api/users', route => route.fulfill({ json: [...] }));

// スクリーンショット
await page.screenshot({ path: 'screen.png' });
```

## 7. Python版との対応

```python
from playwright.sync_api import Page, expect

def test_title(page: Page):
    page.goto("https://example.com")
    expect(page).to_have_title("Example")
```

命名がキャメルケース（`getByRole`）→スネークケース（`get_by_role`）になる程度で、API構造・思想はTypeScript版とほぼ共通。

## 関連

- [Testing.md](Testing.md)（AI時代のテスト技法）
- [pytest.md](../Backend/Python/pytest.md)
