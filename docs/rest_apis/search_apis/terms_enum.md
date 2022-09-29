# 词语枚举 API

词语枚举 API 可用于发现索引中与部分字符串匹配的词语。支持的字段类型有[`keyword`](/mapping/field_data_types/keyword#关键字字段类型)、[`constant_keyword`](/mapping/field_data_types/keyword#常量关键字字段类型) 和 [`flattened`](/mapping/field_data_types/flattened) 字段。这用于自动完成：

```bash
POST stackoverflow/_terms_enum
{
    "field" : "tags",
    "string" : "kiba"
}
```

API 返回以下响应：

```bash
{
  "_shards": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "terms": [
    "kibana"
  ],
  "complete" : true
}
```

如果 `complete` 标志为 `false`，则返回的 `terms` 集可能不完整，应视为近似值。这可能是由于一些原因造成的，例如请求超时或节点错误。

## 请求

`GET /<target>/_terms_enum`

## 描述

词语枚举 API 可用于发现索引中以提供的字符串开头的词语。它是为自动完成场景中使用的低延迟查找而设计的。

## 路径参数

- `<target>`
  （可选，字符串）用于限制请求的，逗号分隔的数据流、索引。也支持通配符表达式（*）。为了搜索所有数据流和索引，忽略此参数或使用 `*` 或 `_all`。

## 请求体

- `field`
  （强制，字符串）要匹配的字段

- `string`
  （可选，字符串）要在索引项开头匹配的字符串。如果未提供，所有字段中的词语都要考虑。

- `size`
  （可选，整数）返回的匹配词语数量。默认为 10。

- `timeout`
  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）用于收集结果的最长时间。默认为“1s”（一秒）。如果超过超时，则响应中的 `complete` 标志设置为 `false`，结果可能是部分或空的。

- `case_insensitive`
  （可选，布尔值）如果为 `true`，则提供的搜索字符串与索引项匹配，不区分大小写。默认为 `false`。

- `index_filter`
  （可选，[查询对象](/query_dsl)）如果所提供的查询被重写为不匹配，则允许过滤索引碎片。

- `search_after`
  （可选，字符串）在索引中的词语之后返回的字符串。如果一个请求的最后一个结果作为后续请求的 `search_after` 参数传递，则允许一种分页形式。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-terms-enum.html)
