## 1. Protocol Buffers

- Protocol Buffersは、Googleが開発した、構造化データを効率的にシリアライズ（データ変換）するための仕組み
- スキーマ言語

## 2. 使い方

protoファイルからコードを生成する

```bash
protoc --python_out=. chat.proto
```

成功するとchat_pb2.pyのようなファイルが生成される。

## 3. 参考

- [今さらProtocol Buffersと、手に馴染む道具の話 #JSON - Qiita](https://qiita.com/yugui/items/160737021d25d761b353)
