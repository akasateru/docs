# deepeval

## 1. 概要

deepevalは、LLMアプリケーション（RAG・チャットボット・エージェントなど）の出力品質を自動評価するPythonフレームワーク。`pytest` に近い書き方でメトリクスベースの評価をコード化でき、CIパイプラインへの組み込みもしやすい。評価の多くは「LLM-as-a-judge」方式（内部でLLMを呼び出して採点させる）で行われる。

関連: [RAG](RAG.md)、[Testing.md の「RAG評価」節](../Testing/Testing.md)

## 2. LLMTestCase

評価の最小単位となるデータクラス。1回のLLM呼び出しの入出力を構造化して保持する。

```python
from deepeval.test_case import LLMTestCase

test_case = LLMTestCase(
    input="日本の首都はどこですか？",
    actual_output="日本の首都は東京です。",
    expected_output="東京",                    # 任意: 正解ラベルとの比較用
    context=["日本の首都は東京都である。"],        # 任意: RAGの正解ソース(ground truth)
    retrieval_context=["東京は日本の首都..."],    # 任意: 実際にRAGが検索してきた文脈
)
```

主なフィールド:

- `input`: ユーザーからの入力プロンプト
- `actual_output`: LLM/アプリが実際に返した出力
- `expected_output`: 期待される正解（Answer Correctness系メトリクスで使用）
- `context`: 正解を導出するための「本来あるべき」参照情報（Faithfulness/Contextual系メトリクスで使用）
- `retrieval_context`: RAGが実際に取得した文脈（Contextual Precision/Recallなどで使用）
- `tools_called` / `expected_tools`: エージェントのツール呼び出し検証用

## 3. 基本的な実装フロー

```python
from deepeval import evaluate
from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric

test_case = LLMTestCase(
    input="フランスの首都はどこですか？",
    actual_output="フランスの首都はパリです。"
)
metric = AnswerRelevancyMetric(threshold=0.5)

evaluate(test_cases=[test_case], metrics=[metric])
```

`input` と `actual_output` だけあれば動く。メトリクスが内部でLLM（デフォルトはOpenAI、`model` 引数で他プロバイダに差し替え可）を呼び出し、スコアリングして合否を返す。

pytest統合（CI向け）:

```python
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import FaithfulnessMetric

def test_rag_response():
    test_case = LLMTestCase(
        input="...",
        actual_output=my_rag_app.query("..."),
        retrieval_context=my_rag_app.get_retrieved_docs(),
    )
    assert_test(test_case, [FaithfulnessMetric(threshold=0.8)])
```

`deepeval test run test_xxx.py` で実行する。

## 4. 代表的なメトリクス

| メトリクス | 用途 |
|---|---|
| `AnswerRelevancyMetric` | 出力が入力に関連しているか |
| `FaithfulnessMetric` | 出力がcontextに忠実か（ハルシネーション検知） |
| `ContextualPrecisionMetric` / `ContextualRecallMetric` | RAGの検索精度 |
| `GEval` | 自由記述のカスタム基準をLLM-as-judgeで評価 |
| `HallucinationMetric` | 事実との矛盾検知 |
| `ToolCorrectnessMetric` | エージェントのツール呼び出しの正しさ |

`GEval` の例:

```python
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCaseParams

correctness_metric = GEval(
    name="Correctness",
    criteria="実際の出力が期待される出力と意味的に一致しているか評価する",
    evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.EXPECTED_OUTPUT],
    threshold=0.7,
)
```

## 5. RAG評価とエージェント評価の観点整理

どちらも「選択」と「出力」の両方を評価する必要があり、片方だけでは片手落ちになる。

### 5.1. RAG評価

| 観点 | 評価対象 | 代表メトリクス |
|---|---|---|
| 検索（Retrieval） | 正しい文書/チャンクを選択できたか | `ContextualPrecisionMetric`（関連度の高い順に並んでいるか）、`ContextualRecallMetric`（必要な情報を漏れなく拾えたか）、`ContextualRelevancyMetric`（無関係なノイズを含んでいないか） |
| 生成（Generation） | 選んだ文脈をもとに正しい文章を書けたか | `FaithfulnessMetric`（`retrieval_context`に忠実か）、`AnswerRelevancyMetric`（質問に的確に答えているか） |

「検索がズレている」のか「検索は合っているが文章化でハルシネーションしている」のかを切り分けるため、両方セットで見るのが基本。

### 5.2. エージェント評価

| 観点 | 評価対象 | 代表メトリクス |
|---|---|---|
| 行動選択（Tool Use） | 正しいツールを正しい引数で呼んだか | `ToolCorrectnessMetric`（`tools_called` vs `expected_tools`を比較） |
| 最終出力 | ユーザーへ返す文章が正しいか | `AnswerRelevancyMetric`、`GEval`によるカスタム基準評価 |
| タスク完遂 | マルチステップの一連の行動が目的を達成したか | `TaskCompletionMetric`（ゴールに対する軌跡全体を評価） |

「正しいツールを呼んだのに結果の要約を誤る」ケースもあるため、ツール選択の正しさと最終文章の正しさは別々に評価する。

## 6. 実務上の注意点

- **コストと速度:** ほぼ全メトリクスがLLM APIを1〜数回呼ぶため、テストケース数×メトリクス数だけAPIコールが発生する。大量データセットではコスト・時間に注意。
- **Confident AI連携はオプトイン:** `deepeval login` すると結果がdeepeval運営元のSaaS（Confident AI）にアップロードされる。プロプライエタリなデータを扱う場合はログインしない選択も可能（ログインなしでもローカル評価・pytest実行は動く）。
- **データセット管理:** `EvaluationDataset` でGolden（正解データ）とTestCaseをまとめて管理でき、CSV/JSON読み込みにも対応。
- **非同期実行:** `evaluate()` はデフォルトで並列実行。`run_async=False` で逐次実行に切り替え可能。
- **閾値（threshold）のチューニング:** デフォルト値は厳しすぎ/緩すぎることが多く、少数サンプルで手動確認しながら決めるのが安全。
- **CI組み込み時のflaky対策:** LLM-as-judge自体が非決定的なため、CIでflaky testになりやすい。閾値に余裕を持たせるか、リトライ設定を検討する。
- **カスタムメトリクス:** 既製メトリクスで足りない場合は `BaseMetric` を継承して自作できる。厳密な条件分岐が必要な場合に有効（多くは `GEval` で足りる）。
- **会話・エージェント評価:** マルチターン会話には `ConversationalTestCase` を使う。
