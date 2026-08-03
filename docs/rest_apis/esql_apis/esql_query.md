# ES|QL 查询 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [ES|QL 查询 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-esql-query)。

:::::

返回 ES|QL（Elasticsearch 查询语言）查询的搜索结果。

## 请求

```bash
POST /_query
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对所搜索的数据流、索引或别名拥有**读取索引**[权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 示例

```json
POST /_query
{
  "query": """
    FROM library
    | EVAL year = DATE_TRUNC(1 YEARS, release_date)
    | STATS MAX(page_count) BY year
    | SORT year
    | LIMIT 5
  """
}
```

## 查询参数

- `delimiter`

  （可选，字符串）CSV 结果的分隔符。默认为 `,`。此 API 仅对 CSV 响应支持此参数。

- `drop_null_columns`

  （可选，布尔值）如果为 `true`，则从结果的 `columns` 和 `values` 部分中移除完全为 null 的列。默认为 `false`。如果为 `true`，响应将包含一个名为 `all_columns` 的额外部分，其中包含所有列的名称。

- `format`

  （可选，字符串）响应的格式。有效值请参阅[响应格式](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-rest.html#esql-rest-format)。你也可以使用 `Accept` HTTP 头指定格式。如果同时指定了此参数和 `Accept` 头，则此参数优先。

## 请求体

- `columnar`

  （可选，布尔值）如果为 `true`，则以列式格式返回结果。默认为 `false`。仅支持 CBOR、JSON、SMILE 和 YAML 响应。请参阅[列式结果](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-rest.html#esql-rest-columnar)。

- `include_ccs_metadata`

  （可选，布尔值）如果为 `true`，跨集群搜索将包含每个集群上查询的元数据。默认为 `false`。仅支持 CBOR、JSON、SMILE 和 YAML 响应。请参阅[跨集群元数据](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-rest.html#esql-rest-ccs-metadata)。

- `locale`

  （可选，字符串）按照区域设置的约定返回结果（尤其是日期）格式。有关语法，请参阅[返回本地化结果](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-rest.html#esql-rest-locale)。

- `params`

  （可选，数组）查询中参数的值。有关语法，请参阅[向查询传递参数](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-rest.html#esql-rest-params)。

- `profile`

  （可选，布尔值）如果为 `true`，响应将包含一个额外的 `profile` 对象，其中包含有关查询如何执行的信息。提供对查询各部分性能的洞察。用于人工调试——该对象的格式可能随时更改。类似于 `EXPLAIN ANALYZE` 或 `EXPLAIN PLAN`。

- `query`

  （必需，字符串）要运行的 ES|QL 查询。有关语法，请参阅[语法参考](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-syntax.html)。

## 响应体

- `columns`

  （对象数组）`values` 中返回的每一列的列名和类型。每个对象代表一列。

- `all_columns`

  （对象数组）每个查询列的列名和类型。每个对象代表一列。仅在请求中发送了 `drop_null_columns` 时返回。

- `values`

  （数组的数组）搜索结果的值。

- `_clusters`

  （对象）有关参与跨集群查询执行的集群的元数据。仅在以下条件同时满足时返回：（1）是跨集群搜索，（2）请求体中发送了 `include_ccs_metadata` 并设置为 `true`，（3）响应格式设置为 JSON（默认）、CBOR、SMILE 或 YAML。有关更多信息，请参阅[跨集群元数据](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-rest.html#esql-rest-ccs-metadata)。

- `profile`

  （对象）描述查询执行情况的分析信息。仅在请求体中发送了 `profile` 时返回。该对象用于人工调试，可能随时更改。类似于 `EXPLAIN ANALYZE` 或 `EXPLAIN PLAN`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-query-api.html)
