# 渲染搜索应用查询 API

:::warning 技术预览

此功能处于技术预览阶段，可能会在未来版本中更改或删除。Elastic 将努力修复任何问题，但技术预览中的功能不受正式 GA 功能的支持 SLA 约束。

:::

根据指定的查询参数，使用与搜索应用关联的搜索模板（或未指定时的默认模板）生成 Elasticsearch 查询。未指定的模板参数将被赋予默认值（如果适用）。返回调用[搜索应用搜索 API](./search) 时将生成并执行的具体 Elasticsearch 查询。

```txt
POST _application/search_application/<name>/_render_query
```

## 前置条件

- 需要对搜索应用的后备别名具有**读取**[索引权限](../security_privileges/index_privileges)。

## 请求体

`params`

（可选，字符串到对象的映射）用于根据与搜索应用关联的搜索模板生成 Elasticsearch 查询的查询参数。如果搜索模板中使用的参数未在 `params` 中指定，将使用该参数的默认值。

搜索应用可以配置为验证搜索模板参数。有关更多信息，请参阅[创建或更新搜索应用 API](./put_search_application)中的 `dictionary` 参数。

## 响应码

- `400`

  传递给搜索模板的参数无效。示例包括：

  - 缺少必需参数
  - 参数数据类型无效
  - 参数值无效

- `404`

  搜索应用 `<name>` 不存在。

## 示例

以下示例为名为 `my-app` 的搜索应用生成查询，该应用使用文本搜索示例中的搜索模板。

```json
POST _application/search_application/my-app/_render_query
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

响应示例：

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

在此示例中，请求中未指定 `from`、`size` 和 `explain` 参数，因此使用搜索模板中指定的默认值。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-application-render-query.html)
