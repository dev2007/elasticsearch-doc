# 搜索应用搜索 API

:::warning Beta

此功能处于 Beta 阶段，可能会发生更改。其设计和代码不如正式 GA 功能成熟，按「原样」提供，不提供任何担保。Beta 功能不受正式 GA 功能的支持 SLA 约束。

:::

根据指定的查询参数，使用与搜索应用关联的搜索模板（或未指定时的默认模板）生成并执行 Elasticsearch 查询。未指定的模板参数将被赋予默认值（如果适用）。

```txt
POST _application/search_application/<name>/_search
```

## 前置条件

- 需要对搜索应用的后备别名具有**读取**[索引权限](../security_privileges/index_privileges)。

## 路径参数

`<name>`

（必需，字符串）搜索应用的名称。

`typed_keys`

（可选，布尔值）如果为 `true`，响应中聚合和建议器名称会以其各自的类型作为前缀。默认为 `false`。

## 请求体

`params`

（可选，字符串到对象的映射）用于根据与搜索应用关联的搜索模板生成 Elasticsearch 查询的查询参数。如果搜索模板中使用的参数未在 `params` 中指定，将使用该参数的默认值。

:::note 提示

搜索应用可以配置为验证搜索模板参数。有关更多信息，请参阅[创建或更新搜索应用 API](./put_search_application)中的 `dictionary` 参数。

:::

## 响应码

- `400`

  传递给搜索模板的参数无效。示例包括：

  - 缺少必需参数
  - 参数数据类型无效
  - 参数值无效

- `404`

  搜索应用 `<name>` 不存在。

## 示例

以下示例对名为 `my-app` 的搜索应用执行搜索，该应用使用文本搜索示例中的搜索模板。

```json
POST _application/search_application/my-app/_search
{
  "params": {
    "query_string": "my first query",
    "text_fields": [
      {
        "name": "title",
        "boost": 5
      },
      {
        "name": "description",
        "boost": 1
      }
    ]
  }
}
```

生成的 Elasticsearch 查询：

```json
{
  "from": 0,
  "size": 10,
  "query": {
    "multi_match": {
      "query": "my first query",
      "fields": [
        "description^1.0",
        "title^5.0"
      ]
    }
  },
  "explain": false
}
```

由于请求中未指定 `from`、`size` 和 `explain`，因此使用搜索模板中指定的默认值。

## 响应体

响应包含生成并执行的 Elasticsearch 查询的搜索结果。响应格式与 Elasticsearch 搜索 API 相同：

```json
{
  "took": 5,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.8630463,
    "hits": ...
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-application-search.html)
