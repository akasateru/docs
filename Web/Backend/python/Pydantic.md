## 1. Pydantic

- 型アノテーションをつけるだけでバリデーションとシリアライゼーションができる
- 独自のバリデーションとシリアライゼーションが定義できる
- Rustで実装されているため高速

## 2. dataclasses+jsonと比較

dataclasses+jsonの場合

```python
import json
from dataclasses import asdict, dataclass
from datetime import date
from typing import Any

class DateEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, date):
            return obj.strftime("%Y-%m-%d")
        return super().default(obj)

@dataclass
class User:
    name: str
    age: int
    birthday: date

    def __post_init__(self):
        if not instance(self.name, str):
            raise TypeError("name must be str")
        if len(self.name) < 4 or len(self.name) > 16:
            raise ValueError("name must be between 4 and 16 chars")
        if not isinstance(self.age, int):
            raise TypeError("age must be int")
        if self.age < 18 or self.age > 99:
            raise ValueError("age must be between 18 and 99")
        if not isinstance(self.birthday, date):
            raise TypeError("birthday must be date")

    def to_json(self) -> str:
        return json.dumps(asdict(self), cls=DateEncoder, indent=2)

if __name__ == "__main__":
    user = User(name="John", age=18, birthday=date(2000, 1, 1))
    print(user.to_json())
```

pydanticを使用した場合

```python
from datetime import date

from pydantic import BaseModel, Field


class User(BaseModel):
    name: str = Field(..., min_length=4, max_length=16)  # 4~16文字のstr型
    age: int = Field(..., ge=18, le=99)  # 18~99のint型
    birthday: date


if __name__ == "__main__":
    user = User(name="John", age=18, birthday=date(2000, 1, 1))
    print(user.model_dump_json(indent=2))
```

## 3. カスタムバリデーション

- field_validator():フィールドを指定してバリデーションを定義する
  - before: インスタンス生成前に入力のdictをバリデーション
  - after: インスタンス生成後にインスタンスをバリデーション

## 4. シリアライゼーション

- 基本的には、BaseModel から継承した model_dump_json()を呼ぶ

## 5. カスタムシリアライゼーション

- field_serializer():フィールドごとにシリアライゼーションを定義する

```python
class Task(BaseModel):
    name: str
    due_date: date

    @field_serializer("due_date")
    def serialize_date(self, d: date) -> str:
        return d.strftime("%B %d %Y")
```

## 6. 非プリミティブな型のバリデーションとシリアライゼーション

- 非プリミティブな型をPydanticで扱えるようにするために、Annotated と PlainValidator を使用してカスタム型を定義
- PlainValidatorを使用するとPydanticのデフォルトのバリデーションは実行されなくなり、PlainValidatorに渡したバリデーションロジックだけが実行される

## 7. 参考

- <https://zenn.dev/taka256/articles/c7213c359dd2cf>
