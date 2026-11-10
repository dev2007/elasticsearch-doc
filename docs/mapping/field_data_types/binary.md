# binary 字段类型

`binary` 类型接受以 Base64 编码字符串表示的二进制值。该字段默认不存储，也不可搜索：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "blob": {
        "type": "binary"
      }
    }
  }
}

PUT my-index-000001/_doc/1
{
  "name": "Some binary blob",
  "blob": "U29tZSBiaW5hcnkgYmxvYg=="
}
```

Base64 编码的二进制值不能包含嵌入的换行符 `\n`。

## binary 字段的参数

binary 字段接受以下参数：

- `doc_values`
  （可选，Boolean）是否将该字段以列式方式存储在磁盘上，以便之后可用于排序、聚合或脚本？接受 `true` 或 `false`（默认）。对于 TSDB 索引（`index.mode` 设置为 `time_series` 的索引），此参数会自动设置为 `true`。
- `store`
  （可选，Boolean）是否应该单独存储字段值，使其可以独立于 `_source` 字段检索。接受 `true` 或 `false`（默认）。

## 合成 _source

合成 _source 可能会按二进制值的字节表示顺序对其进行排序。例如：

```bash
PUT idx
{
  "mappings": {
    "_source": { "mode": "synthetic" },
    "properties": {
      "binary": { "type": "binary", "doc_values": true }
    }
  }
}

PUT idx/_doc/1
{
  "binary": ["IAA=", "EAA="]
}
```

将变为：

```json
{
  "binary": ["EAA=", "IAA="]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/binary.html)
