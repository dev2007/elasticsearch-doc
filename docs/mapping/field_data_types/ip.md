# ip 字段类型

`ip` 字段可以索引/存储 IPv4 或 IPv6 地址。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "ip_addr": {
        "type": "ip"
      }
    }
  }
}

PUT my-index-000001/_doc/1
{
  "ip_addr": "192.168.1.1"
}

GET my-index-000001/_search
{
  "query": {
    "term": {
      "ip_addr": "192.168.0.0/16"
    }
  }
}
```

你也可以使用 `ip_range` 数据类型在单个字段中存储 IP 范围。

## ip 字段的参数

`ip` 字段接受以下参数：

- `doc_values`
  （可选，Boolean）是否应该将该字段以列式方式存储在磁盘上，以便之后可用于排序、聚合或脚本？接受 `true`（默认）或 `false`。
- `ignore_malformed`
  （可选，Boolean）如果为 `true`，则忽略格式错误的 IP 地址。如果为 `false`（默认），格式错误的 IP 地址会抛出异常并拒绝整个文档。注意，如果使用了 `script` 参数，则无法设置此项。
- `index`
  （可选，Boolean）该字段是否应该可以快速搜索？接受 `true`（默认）和 `false`。只启用 `doc_values` 的字段仍然可以通过 `term` 或基于范围的查询进行查询，只是速度较慢。
- `null_value`
  （可选，字符串）接受一个 IPv4 或 IPv6 值，用于替换任何显式的 `null` 值。默认为 `null`，表示该字段被视为缺失。注意，如果使用了 `script` 参数，则无法设置此项。
- `on_script_error`
  （可选，枚举）定义当 `script` 参数定义的脚本在索引时抛出错误时该怎么办。接受 `reject`（默认），它会导致整个文档被拒绝；以及 `ignore`，它会将该字段记录到文档的 `_ignored` 元数据字段中并继续索引。只有同时设置了 `script` 字段时才能设置此参数。
- `script`
  （可选，字符串）如果设置了此参数，则该字段将索引由此脚本生成的值，而不是直接从源中读取值。如果输入文档中为该字段设置了值，文档将被拒绝并返回错误。脚本的格式与其运行时字段等效格式相同，并且应输出包含 IPv4 或 IPv6 格式地址的字符串。
- `store`
  （可选，Boolean）是否应该单独存储字段值，使其可以独立于 `_source` 字段检索。接受 `true` 或 `false`（默认）。
- `time_series_dimension`
  （可选，Boolean）将字段标记为时序维度。默认为 `false`。

  `index.mapping.dimension_fields.limit` 索引设置限制索引中的维度数量。

  维度字段具有以下约束：

  - `doc_values` 和 `index` 映射参数必须为 `true`。

## 查询 ip 字段

查询 IP 地址最常见的方式是使用 CIDR 表示法：[ip_address]/[prefix_length]。例如：

```bash
GET my-index-000001/_search
{
  "query": {
    "term": {
      "ip_addr": "192.168.0.0/16"
    }
  }
}
```

或：

```bash
GET my-index-000001/_search
{
  "query": {
    "term": {
      "ip_addr": "2001:db8::/48"
    }
  }
}
```

另请注意，冒号是 `query_string` 查询中的特殊字符，因此 IPv6 地址需要转义。最简单的方法是给搜索值加上引号：

```bash
GET my-index-000001/_search
{
  "query": {
    "query_string" : {
      "query": "ip_addr:\"2001:db8::/48\""
    }
  }
}
```

## 合成 _source

合成 source 可能会对 `ip` 字段的值进行排序并删除重复项。例如：

```bash
PUT idx
{
  "settings": {
    "index": {
      "mapping": {
        "source": {
          "mode": "synthetic"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "ip": { "type": "ip" }
    }
  }
}

PUT idx/_doc/1
{
  "ip": ["192.168.0.1", "192.168.0.1", "10.10.12.123",
         "2001:db8::1:0:0:1", "::afff:4567:890a"]
}
```

将变为：

```json
{
  "ip": ["::afff:4567:890a", "10.10.12.123", "192.168.0.1", "2001:db8::1:0:0:1"]
}
```

根据 rfc6144 的规定，IPv4 地址的排序方式相当于它们是带有 `::ffff:0:0:0/96` 前缀的 IPv6 地址。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ip.html)
