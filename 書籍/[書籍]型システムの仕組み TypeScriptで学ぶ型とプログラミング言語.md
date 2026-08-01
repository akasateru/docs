- [GitHub - 『TypeScriptではじめる型システム』サポートサイト](https://github.com/LambdaNote/support-ts-tapl)

## 1. 第5章 オブジェクト型

### 1.1. 型検査器の仕様

オブジェクト型を扱えるように型検査器を拡張するためには、対象言語への構文の追加と、型検査器で保証すべきことを明らかにする必要がある

#### 1.1.1. 対象言語

対象言語の構文（項）として、前章までの定義に以下2つを追加

- オブジェクト生成の構文(例:「{ foo: 1, bar: true }」)
- プロパティ読み出しの構文(例:「x.foo」)

#### 1.1.2. 判定基準

### 1.2. 構造木

### 1.3. 型の定義

### 1.4. 型検査器の実装

#### 1.4.1. typecheck関数の改造 ― オブジェクト生成

#### 1.4.2. typecheck関数の改造 ― プロパティ読み出し

### 1.5. 型検査器を動かしてみる

### 1.6. まとめ

## 2. 6章 再帰関数

## 3. 部分型・構造的型付け・変性

オブジェクト型の章に続く発展的なトピックとして、「型同士の互換性がどう判定されるか」を整理する。TypeScriptを例に用いる。

### 3.1. 部分型 (Subtyping)

- 型Aが型Bの**部分型**（`A <: B`）であるとは、「Aの値はBの値が要求される場所ならどこでも安全に使える」という関係（**置換可能性**、Liskov substitution principle）。
- オブジェクト型では、フィールドが多い方（＝より制約が強い方）が部分型になる。

```typescript
type Animal = { name: string };
type Dog = { name: string; breed: string };

function greet(a: Animal) { console.log(a.name); }
const dog: Dog = { name: "Pochi", breed: "Shiba" };
greet(dog); // OK — Dog <: Animal
```

### 3.2. 構造的型付け (Structural Typing)

- 型の互換性を**名前ではなく構造（形）**で判定する方式。TypeScriptが採用。
- 対義語は**名前的型付け (Nominal Typing)**（Java, C#など）で、`implements` などの明示的な宣言が必要。
- 構造的型付けの下では、部分型関係は構造の包含関係（フィールドの包含）によって自動的に決まる。

```typescript
type Point = { x: number; y: number };
const p = { x: 1, y: 2, z: 3 }; // Point を明示的に実装していないが…

function distance(pt: Point) { /* ... */ }
distance(p); // OK — 構造的に Point とみなされる
```

### 3.3. 変性 (Variance)

型パラメータを持つ型（配列・関数・ジェネリクスなど）の間で、`A <: B` のときに部分型関係がどう伝播するかを表す概念。

| 種類 | `A <: B` のとき | 例 |
| --- | --- | --- |
| 共変 (Covariant) | `F<A> <: F<B>` | 関数の戻り値、配列の読み取り |
| 反変 (Contravariant) | `F<B> <: F<A>`（逆転） | 関数の引数 |
| 不変 (Invariant) | どちらでもない | 本来は可変な配列 |

```typescript
// 戻り値は共変：より具体的な型を返すのはOK
type AnimalFactory = () => Animal;
const dogFactory: () => Dog = () => ({ name: "Pochi", breed: "Shiba" });
const f: AnimalFactory = dogFactory; // OK

// 引数は反変：より広い型を受け取る関数の方が安全＝部分型
type DogHandler = (d: Dog) => void;
const animalHandler: (a: Animal) => void = (a) => console.log(a.name);
const h: DogHandler = animalHandler; // OK
```

直感：**戻り値**は「約束するもの」なので狭い方が安全＝共変、**引数**は「受け取るもの」なので広い方が安全＝反変。

- TypeScriptの配列は実用性のため共変として扱われるが、`push` などのミューテーションを考えると型理論上は健全ではない（unsound）妥協。Java・C#の配列も同様の問題を持つ。

### 3.4. まとめ

- **構造的型付け**＝型が何によって区別されるか（名前 vs 構造）の話。
- **部分型**＝どの型がどの型の代わりに使えるかの話。
- **変性**＝型パラメータ付きの型（関数・配列・ジェネリクス）における部分型関係の伝わり方の話。
