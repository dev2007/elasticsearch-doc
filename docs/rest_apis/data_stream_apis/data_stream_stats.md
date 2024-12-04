# 数据流统计 API

检索一个或多个[数据流](/data_streams)的统计数据。

```bash
GET /_data_stream/my-data-stream/_stats
```

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `monitor` 或 `manage` 的[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 请求

`GET /_data_stream/<data-stream>/_stats`

## 路径参数

- `<data-stream>`

    (可选，字符串） 用于限制请求的数据流的逗号分隔列表。支持通配符表达式 (`*`)。

    要以集群中的所有数据流为目标，请省略此参数或使用 `*`。

## 查询参数

- `expand_wildcards`

    （可选，字符串）通配符模式可以匹配的数据流类型。支持逗号分隔值，例如 `open,hidden`。有效值为：

    - `all`，`hidden`

        匹配任何数据流或索引，包括[隐藏的](/rest_apis/api_conventions/multi_target_syntax#隐藏数据流和索引)。

    - `open`，`closed`

        匹配任何非隐藏的数据流。无法关闭 Data Streams。

    - `none`

        不接受通配符模式。

    默认为 `open`。

- `human`

    (可选，布尔值） 如果为 `true`，则响应会包含以人类可读[字节值](/rest_apis/api_conventions#字节大小单位)表示的统计数据。默认为 `false`。

## 响应体

- `_shards`

    (对象）包含试图执行请求的分片的信息。

    - `_shards` 属性

        - `total`

            (整数）尝试执行请求的分片总数。

        - `successful`

            (整数）成功执行请求的分片数。

        - `failed`

            (整数）未能执行请求的分片数量。

- `data_stream_count`

    (整数）所选数据流的总数。

- `backing_indices`

    (整数）所选数据流的备份索引总数。

- `total_store_size`

    ([字节值](/rest_apis/api_conventions#字节大小单位)）所选数据流的所有分块的总大小。只有当 `human` 查询参数为 `true` 时，才会包含此属性。

- `total_store_size_bytes`

    (整数）所选数据流所有分块的总大小（字节）。

- `data_streams`

    (对象数组） 包含所选数据流的统计数据。

    - `data_streams` 对象属性

        - `data_stream`

            (字符串） 数据流的名称。

        - `backing_indices`

            (整数）数据流的当前后备索引数。

        - `store_size`

            ([字节值](/rest_apis/api_conventions#字节大小单位)）数据流后备索引所有分片的总大小。只有当 `human` 查询参数为 `true` 时，才会返回该参数。

        - `store_size_bytes`

            (整数）数据流后备索引所有分片的总大小（以字节为单位）。

        - `maximum_timestamp`

        (整数) 数据流的最高 `@timestamp` 值，转换为 [Unix epoch](https://en.wikipedia.org/wiki/Unix_time)以来的毫秒数。

        :::note 提示
        如果满足以下一个或多个条件，数据流中的 `@timestamp` 值可能高于此值：
          - 数据流包含已关闭的后备索引。
          - 生成时间较短的备份索引包含较高的 `@timestamp` 值。
        :::

## 示例

```bash
GET /_data_stream/my-data-stream*/_stats?human=true
```

API 返回以下响应。

```json
{
  "_shards": {
    "total": 10,
    "successful": 5,
    "failed": 0
  },
  "data_stream_count": 2,
  "backing_indices": 5,
  "total_store_size": "7kb",
  "total_store_size_bytes": 7268,
  "data_streams": [
    {
      "data_stream": "my-data-stream",
      "backing_indices": 3,
      "store_size": "3.7kb",
      "store_size_bytes": 3772,
      "maximum_timestamp": 1607512028000
    },
    {
      "data_stream": "my-data-stream-two",
      "backing_indices": 2,
      "store_size": "3.4kb",
      "store_size_bytes": 3496,
      "maximum_timestamp": 1607425567000
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/data-stream-stats-api.html)
