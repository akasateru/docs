# 1. ast（Abstract Syntax Tree）

Pythonソースコードを構文木（AST）として解析・操作するための標準ライブラリ。Lintツールやコード自動変換、DSL実装などに使われる。

## 1.1. 基本的な使い方

### コードをASTに変換する

`ast.parse(source)` でソースコード文字列をASTに変換できる。`ast.dump(node, indent=2)` で人間可読な形で構造を表示できる。

```python
import ast

code = "x = 1 + 2"
tree = ast.parse(code)
print(ast.dump(tree, indent=2))
```

```
Module(
  body=[
    Assign(
      targets=[Name(id='x', ctx=Store())],
      value=BinOp(
        left=Constant(value=1),
        op=Add(),
        right=Constant(value=2)))],
  type_ignores=[])
```

### AST を再びソースコードに戻す

`ast.unparse(node)`（Python 3.9+）でASTからソースコード文字列を復元できる。

## 1.2. 主要なクラス・関数

| 名前 | 用途 |
|---|---|
| `ast.parse(source)` | ソースコード→ASTに変換 |
| `ast.dump(node)` | ASTを人間可読な文字列で表示 |
| `ast.unparse(node)` | AST→ソースコードに戻す（3.9+） |
| `ast.walk(node)` | ノードを再帰的に全走査（順不同） |
| `ast.iter_child_nodes(node)` | 直接の子ノードを走査 |
| `ast.NodeVisitor` | 読み取り専用の訪問（`visit_XXX` メソッドを定義） |
| `ast.NodeTransformer` | ノードを書き換え可能な訪問 |
| `ast.literal_eval(s)` | 安全にリテラルだけを評価する（`eval()` の安全版） |
| `ast.fix_missing_locations()` | 変換後のノードに行番号等を補完する |

## 1.3. NodeVisitor によるコード解析

`ast.NodeVisitor` を継承し、`visit_<ノード種別名>` メソッドを定義すると、該当ノードを訪問したタイミングで処理を差し込める。読み取り専用の解析（Lint的なチェック）に使う。

```python
import ast

code = """
def foo():
    x = 1
    y = 2
    return x
"""

tree = ast.parse(code)

class UnusedVarChecker(ast.NodeVisitor):
    def visit_FunctionDef(self, node):
        assigned = set()
        used = set()
        for n in ast.walk(node):
            if isinstance(n, ast.Name):
                if isinstance(n.ctx, ast.Store):
                    assigned.add(n.id)
                elif isinstance(n.ctx, ast.Load):
                    used.add(n.id)
        unused = assigned - used
        if unused:
            print(f"{node.name}: 未使用変数 {unused}")

UnusedVarChecker().visit(tree)
# 出力: foo: 未使用変数 {'y'}
```

## 1.4. NodeTransformer によるコード変換

`ast.NodeTransformer` はノードを書き換えて返せる点が `NodeVisitor` と異なる。`visit_XXX` の戻り値でノードを置換・削除できる。変換後は `ast.fix_missing_locations()` で行番号情報を補完してから `ast.unparse()` する。

```python
class ConstantFolder(ast.NodeTransformer):
    def visit_BinOp(self, node):
        self.generic_visit(node)
        if isinstance(node.left, ast.Constant) and isinstance(node.right, ast.Constant):
            if isinstance(node.op, ast.Add):
                return ast.Constant(value=node.left.value + node.right.value)
        return node

tree = ast.parse("x = 1 + 2")
new_tree = ConstantFolder().visit(tree)
ast.fix_missing_locations(new_tree)
print(ast.unparse(new_tree))  # x = 3
```

## 1.5. 危険なコードの検出

`eval()` などで動的にコードを実行する前に、AST上で `import` や関数呼び出しなど危険な構文が含まれていないかを事前チェックする用途にも使える。

```python
tree = ast.parse("import os; os.system('rm -rf /')")
for node in ast.walk(tree):
    if isinstance(node, (ast.Import, ast.Call)):
        print("危険な可能性:", ast.dump(node))
```

## 1.6. 代表的な活用例

- **Linter/フォーマッタ**: flake8、black、isort などの内部実装で使われている
- **コード自動リファクタリング**: 特定パターンのノードを検出して書き換える
- **DSL（独自言語）の実装**: 独自構文をASTレベルで解釈・変換する
- **`ast.literal_eval`**: `eval()` の代わりに、辞書・リストなどのPythonリテラルを文字列から安全にパースする
