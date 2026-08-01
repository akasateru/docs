## 1. pytest

- 標準ライブラリの unittest より書きやすい

- **ボイラープレート（定型文）が少ない**: `unittest` のようにクラスを作ったり、`self.assertEqual()` と書く必要がない。
- **標準の `assert` が使える**: 特別なメソッドを覚えなくても、Python 標準の `assert a == b` だけで詳細なエラーレポート（どこが違ったか）を出してくれる。
- **フィクスチャ（Fixtures）**: テストの準備（DB接続、データの作成など）と後片付けを非常にスマートに共通化できる。
- **エコシステム**: `pytest-cov`（カバレッジ測定）や `pytest-xdist`（並列実行）など、便利なプラグインが豊富。

## 2. 動かし方

- ファイル名を test_*.py にし、関数名を test_* で始めるだけで、pytest コマンドが自動で探し出して実行してる

```python
# func.py
def add(a, b):
    return a + b

# test_func.py
from func import add

def test_add():
    assert add(1, 2) == 3  # これだけでOK！
    assert add(1, 2) == 5  # 失敗すると親切な差分が出る
```

## 3. フィクスチャ

```python
import pytest

@pytest.fixture
def sample_data():
    return {"key": "value"}

def test_with_data(sample_data):
    assert sample_data["key"] == "value"
```

## 4. よく使う実行コマンド

| コマンド                  | 説明                                                 |
| ------------------------- | ---------------------------------------------------- |
| **`pytest`**              | カレントディレクトリ以下の全てのテストを実行。       |
| **`pytest -v`**           | 詳細ログを表示（どのテストが通ったか分かりやすい）。 |
| **`pytest -s`**           | テスト内の `print()` 出力をコンソールに表示する。    |
| **`pytest -k "pattern"`** | 特定の名前を含むテストだけを実行する。               |
| **`pytest --lf`**         | 前回失敗（Last Failed）したテストだけを実行する。    |

Google スプレッドシートにエクスポート
