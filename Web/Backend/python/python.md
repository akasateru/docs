## 1. 環境構築

### 1.1. 仮想環境

プロジェクトごとにパッケージを分離するための仕組み。

#### 1.1.1. venv（標準）

```bash
# 作成
python -m venv .venv

# 有効化
source .venv/bin/activate       # Mac/Linux
.venv\Scripts\activate          # Windows

# 無効化
deactivate
```

#### 1.1.2. uv（高速・推奨）

Rust 製の高速パッケージ・プロジェクト管理ツール。

```bash
# インストール
curl -LsSf https://astral.sh/uv/install.sh | sh

# プロジェクト初期化（pyproject.toml が生成される）
uv init

# 仮想環境作成 & パッケージ追加
uv add requests
uv add --dev pytest   # 開発依存

# 依存関係をインストール（uv.lock から）
uv sync

# スクリプト実行
uv run python main.py
```

#### 1.1.3. pyenv（Pythonバージョン管理）

```bash
# インストール可能なバージョン一覧
pyenv install --list

# インストール
pyenv install 3.12.3

# バージョン切り替え
pyenv global 3.12.3     # グローバル
pyenv local 3.12.3      # カレントディレクトリ配下
```

---

### 1.2. pip

Python 標準のパッケージマネージャ。

```bash
pip install requests            # インストール
pip install requests==2.31.0    # バージョン指定
pip uninstall requests          # アンインストール
pip list                        # インストール済み一覧
pip show requests               # パッケージ情報
pip freeze > requirements.txt   # 依存関係を書き出し
pip install -r requirements.txt # requirements.txt からインストール
```

---

### 1.3. pyproject.toml（プロジェクト設定）

現代的な Python プロジェクトの設定ファイル。

```toml
[project]
name = "myapp"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "requests>=2.31",
    "fastapi>=0.110",
]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]

[tool.ruff]
line-length = 88

[tool.mypy]
strict = true
```

---

## 2. エラー一覧

```bash
BaseException
 ├── BaseExceptionGroup
 ├── GeneratorExit
 ├── KeyboardInterrupt
 ├── SystemExit
 └── Exception
      ├── ArithmeticError
      │    ├── FloatingPointError
      │    ├── OverflowError
      │    └── ZeroDivisionError
      ├── AssertionError
      ├── AttributeError
      ├── BufferError
      ├── EOFError
      ├── ExceptionGroup [BaseExceptionGroup]
      ├── ImportError
      │    └── ModuleNotFoundError
      ├── LookupError
      │    ├── IndexError
      │    └── KeyError
      ├── MemoryError
      ├── NameError
      │    └── UnboundLocalError
      ├── OSError
      │    ├── BlockingIOError
      │    ├── ChildProcessError
      │    ├── ConnectionError
      │    │    ├── BrokenPipeError
      │    │    ├── ConnectionAbortedError
      │    │    ├── ConnectionRefusedError
      │    │    └── ConnectionResetError
      │    ├── FileExistsError
      │    ├── FileNotFoundError
      │    ├── InterruptedError
      │    ├── IsADirectoryError
      │    ├── NotADirectoryError
      │    ├── PermissionError
      │    ├── ProcessLookupError
      │    └── TimeoutError
      ├── ReferenceError
      ├── RuntimeError
      │    ├── NotImplementedError
      │    ├── PythonFinalizationError
      │    └── RecursionError
      ├── StopAsyncIteration
      ├── StopIteration
      ├── SyntaxError
      │    └── IndentationError
      │         └── TabError
      ├── SystemError
      ├── TypeError
      ├── ValueError
      │    └── UnicodeError
      │         ├── UnicodeDecodeError
      │         ├── UnicodeEncodeError
      │         └── UnicodeTranslateError
      └── Warning
           ├── BytesWarning
           ├── DeprecationWarning
           ├── EncodingWarning
           ├── FutureWarning
           ├── ImportWarning
           ├── PendingDeprecationWarning
           ├── ResourceWarning
           ├── RuntimeWarning
           ├── SyntaxWarning
           ├── UnicodeWarning
           └── UserWarning
```

[組み込み例外](https://docs.python.org/ja/3/library/exceptions.html)

## 3. io

### 3.1. ファイル読み書き

```python
# 読み込み
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()       # 全体を文字列で
    lines = f.readlines()    # 行ごとにリストで

# 書き込み
with open("file.txt", "w", encoding="utf-8") as f:
    f.write("hello\n")

# 追記
with open("file.txt", "a", encoding="utf-8") as f:
    f.write("world\n")
```

### 3.2. モード一覧

| モード | 説明                                   |
| ------ | -------------------------------------- |
| `r`    | 読み込み（デフォルト）                 |
| `w`    | 書き込み（上書き）                     |
| `a`    | 追記                                   |
| `b`    | バイナリモード（`rb`, `wb` など）      |
| `x`    | 新規作成（既存ファイルがあるとエラー） |

---

## 4. 基本データ型

| 型      | 例             | 説明               |
| ------- | -------------- | ------------------ |
| `int`   | `42`           | 整数               |
| `float` | `3.14`         | 浮動小数点         |
| `str`   | `"hello"`      | 文字列             |
| `bool`  | `True / False` | 真偽値             |
| `list`  | `[1, 2, 3]`    | 可変リスト         |
| `tuple` | `(1, 2, 3)`    | 不変リスト         |
| `dict`  | `{"k": "v"}`   | キーバリューマップ |
| `set`   | `{1, 2, 3}`    | 重複なし集合       |
| `None`  | `None`         | 値なし             |

```python
# 型確認
type(42)          # <class 'int'>
isinstance(42, int)  # True
```

---

## 5. 制御フロー

```python
# if
if x > 0:
    print("positive")
elif x == 0:
    print("zero")
else:
    print("negative")

# for
for i in range(5):       # 0〜4
    print(i)

for k, v in d.items():   # dict のイテレート
    print(k, v)

# while
while condition:
    ...

# 内包表記
squares = [x**2 for x in range(10)]
evens   = [x for x in range(10) if x % 2 == 0]
d       = {k: v for k, v in pairs}
```

---

## 6. 関数

```python
# 基本
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

# *args / **kwargs
def func(*args, **kwargs):
    print(args)    # tuple
    print(kwargs)  # dict

# ラムダ
square = lambda x: x ** 2

# デコレータ
def decorator(func):
    def wrapper(*args, **kwargs):
        print("before")
        result = func(*args, **kwargs)
        print("after")
        return result
    return wrapper

@decorator
def say_hello():
    print("hello")
```

---

## 7. クラス

```python
class Animal:
    class_var = "animal"  # クラス変数

    def __init__(self, name: str):
        self.name = name   # インスタンス変数

    def speak(self) -> str:
        raise NotImplementedError

    def __repr__(self) -> str:
        return f"Animal(name={self.name!r})"


class Dog(Animal):
    def speak(self) -> str:
        return "Woof!"


dog = Dog("Rex")
print(dog.speak())  # Woof!
```

### 7.1. ダンダーメソッド（よく使うもの）

| メソッド                 | 用途                                                   |
| ------------------------ | ------------------------------------------------------ |
| `__init__`               | コンストラクタ                                         |
| `__repr__`               | デバッグ用文字列表現                                   |
| `__str__`                | `print()` 用文字列表現                                 |
| `__len__`                | `len()`                                                |
| `__eq__`                 | `==`                                                   |
| `__lt__`                 | `<`（`functools.total_ordering` と組み合わせると便利） |
| `__enter__` / `__exit__` | コンテキストマネージャ（`with` 文）                    |

---

## 8. 例外処理

```python
try:
    result = 1 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
except (TypeError, ValueError):
    print("型か値のエラー")
else:
    print("例外なし")  # try が成功したときのみ実行
finally:
    print("常に実行")

# 独自例外
class MyError(Exception):
    pass

raise MyError("something went wrong")
```

---

## 9. ジェネレータ・イテレータ

```python
# ジェネレータ関数
def count_up(n):
    for i in range(n):
        yield i

# ジェネレータ式
gen = (x**2 for x in range(10))

# イテレータプロトコル
class Counter:
    def __init__(self, limit):
        self.limit = limit
        self.current = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.current >= self.limit:
            raise StopIteration
        self.current += 1
        return self.current
```

---

## 10. 型ヒント

```python
from typing import Optional, Union, Any
from collections.abc import Callable, Iterator, Generator

def greet(name: str) -> str: ...

def maybe(x: Optional[int]) -> None: ...        # int | None と同義（Python 3.10+）

def either(x: Union[int, str]) -> None: ...     # int | str と同義（Python 3.10+）

items: list[int] = [1, 2, 3]
mapping: dict[str, int] = {"a": 1}
pair: tuple[int, str] = (1, "a")
```

---

## 11. 非同期処理（async/await）

```python
import asyncio

async def fetch(url: str) -> str:
    await asyncio.sleep(1)  # I/O 待ちのシミュレーション
    return f"data from {url}"

async def main():
    # 順次実行
    result = await fetch("https://example.com")

    # 並列実行
    results = await asyncio.gather(
        fetch("https://example.com"),
        fetch("https://example.org"),
    )

asyncio.run(main())
```

---

## 12. よく使う標準ライブラリ

| モジュール                      | 用途                                   |
| ------------------------------- | -------------------------------------- |
| `os` / `pathlib`                | ファイル・パス操作                     |
| `sys`                           | インタプリタ情報、引数                 |
| `re`                            | 正規表現                               |
| `json`                          | JSON の読み書き                        |
| `datetime`                      | 日時処理                               |
| `collections`                   | `Counter`, `defaultdict`, `deque` など |
| `itertools`                     | イテレータ操作                         |
| `functools`                     | `lru_cache`, `partial`, `reduce` など  |
| `dataclasses`                   | データクラス                           |
| `typing`                        | 型ヒント                               |
| `logging`                       | ログ出力                               |
| `unittest` / `pytest`           | テスト                                 |
| `argparse`                      | CLI 引数パース                         |
| `subprocess`                    | 外部プロセス実行                       |
| `threading` / `multiprocessing` | 並列処理                               |
| `asyncio`                       | 非同期 I/O                             |

---

## 13. dataclasses

```python
from dataclasses import dataclass, field

@dataclass
class Point:
    x: float
    y: float
    label: str = "point"
    tags: list[str] = field(default_factory=list)

p = Point(1.0, 2.0)
print(p)  # Point(x=1.0, y=2.0, label='point', tags=[])
```

---

## 14. pathlib

```python
from pathlib import Path

p = Path("dir/file.txt")

p.exists()          # ファイル存在確認
p.read_text()       # テキスト読み込み
p.write_text("hi")  # テキスト書き込み
p.parent            # 親ディレクトリ
p.stem              # 拡張子なしファイル名
p.suffix            # 拡張子（".txt"）
p.with_suffix(".md")  # 拡張子変更

for f in Path(".").glob("**/*.py"):
    print(f)
```

Annotated
