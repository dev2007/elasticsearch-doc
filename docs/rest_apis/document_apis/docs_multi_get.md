# 多重获取（mget） API

按 ID 检索多个 JSON 文档。

```bash
GET /_mget
{
  "docs": [
    {
      "_index": "my-index-000001",
      "_id": "1"
    },
    {
      "_index": "my-index-000001",
      "_id": "2"
    }
  ]
}
```

## 请求

`GET /_mget`

`GET /<index>/_mget`

## 前置条件

- 如果启用了 Elasticsearch 安全功能，则必须拥有目标索引或索引别名的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述


使用 `mget` 可以从一个或多个索引中检索多个文档。如果在请求 URI 中指定了索引，则只需在请求正文中指定文档 ID。

### 安全

参阅[基于 URL 的访问控制](/rest_apis/api_convention/url-based_access_control)。

### 部分响应

为确保快速响应，如果一个或多个分片出现故障，多重获取 API 会响应部分结果。更多信息，参阅[分片失败](/rest_apis/document_apis/docs_replication)。

## 路径参数

- `<index>`
    (可选，字符串） 当指定 `ids` 时或 `docs` 数组中的文档未指定索引时，用于检索文档的索引名称。

## 查询参数

- `preference`
    (可选，字符串） 指定应在哪个节点或分片上执行操作。默认为随机。
- `realtime`
    (可选，布尔） 如果为 `true`，则表示请求是实时的，而不是近实时的。默认为 `true`。参阅[实时](/rest_apis/document_apis/docs_get.html#实时)。
- `refresh`
    (可选，布尔） 如果为 `true`，请求会在检索文档前刷新相关分区。默认为 `false`。
- `routing`
    (可选，字符串） 用于将操作路由到特定分区的自定义值。
- `stored_fields`
    (可选，布尔） 如果为 `true`，则检索存储在索引中的文档字段，而不是文档 `_source`。默认为 `false`。
- `_source`
    (可选，字符串）返回 `_source` 字段与否的真或假，或者要返回的字段列表。
- `_source_excludes`
    (可选，字符串）以逗号分隔的[源字段](/mapping/metadata_fields/_source_field)列表，用于从响应中排除。

    也可以使用该参数从 `_source_includes` 查询参数指定的子集中排除字段。

    如果 `_source` 参数为 `false`，该参数将被忽略。
- `_source_includes`
    (可选，字符串）以逗号分隔的[源字段](/mapping/metadata_fields/_source_field)列表，包含在响应中。

    如果指定了该参数，则只返回这些源字段。你可以使用 `_source_excludes` 查询参数从该子集中排除字段。

    如果 `_source` 参数为 `false`，该参数将被忽略。

## 请求体

- `docs`
  (可选，数组）要检索的文档。如果请求 URI 中未指明索引，则为必填项。您可以为每个文档指定以下属性：

  - `_id`
    (必填，字符串）唯一的文档 ID。
  - `_index`
    (可选，字符串）包含文档的索引。如果请求 URI 中未指明索引，则为必填项。
  - `routing`
    (可选，字符串） 文档所在主分区的密钥。如果在索引过程中使用路由，则为必填项。
  - `_source`
    (可选，布尔） 如果为 `false`，则排除所有 `_source` 字段。默认为 `true`。
    - `source_include`
      (可选，数组）从 `_source` 字段中提取并返回的字段。
    - `source_exclude`
      (可选，数组）要从返回的 `_source` 字段中排除的字段。
  - `_stored_fields`
    (可选，数组）要检索的存储字段。

- `ids`
  (可选，数组）要检索的文档的 ID。在请求 URI 中指定索引时允许使用。

## 响应体

响应包括一个 `docs` 数组，其中包含按请求中指定的顺序排列的文档。返回的文档结构与 [获取](/rest_apis/document_apis/docs_get) API 返回的结构类似。如果获取某个文档失败，错误信息将代替该文档。

## 示例

### 按 ID 获取文档

如果在请求 URI 中指定了索引，则请求正文中只需要文档 ID：

```bash
GET /my-index-000001/_mget
{
  "docs": [
    {
      "_id": "1"
    },
    {
      "_id": "2"
    }
  ]
}
```

你可以使用 `ids` 元素来简化请求：

```bash
GET /my-index-000001/_mget
{
  "ids" : ["1", "2"]
}
```

### 过滤源字段

默认情况下，每个文档（如果已存储）都会返回 `_source` 字段。使用 `_source` 和 `_source_include` 或 `source_exclude` 属性可过滤为特定文档返回的字段。你可以在请求 URI 中包含 `_source`、`_source_includes` 和 `_source_excludes` 查询参数，以指定在没有每个文档说明时使用的默认值。

例如，下面的请求将文档 1 的 `_source` 设置为 `false`，以完全排除源，从文档 2 中检索 `field3` 和 `field4`，从文档 3 中检索 `user` 字段，但过滤掉 `user.location` 字段。

```bash
GET /_mget
{
  "docs": [
    {
      "_index": "test",
      "_id": "1",
      "_source": false
    },
    {
      "_index": "test",
      "_id": "2",
      "_source": [ "field3", "field4" ]
    },
    {
      "_index": "test",
      "_id": "3",
      "_source": {
        "include": [ "user" ],
        "exclude": [ "user.location" ]
      }
    }
  ]
}
```

### 获取存储字段

使用 `stored_fields` 属性指定要检索的存储字段集。任何未存储的请求字段都将被忽略。可以在请求 URI 中包含 `stored_fields` 查询参数，以指定在没有每个文档说明时使用的默认值。

例如，以下请求从文档 1 检索 `field1` 和 `field2`，从文档 2 检索 `field3` 和 `field4`：

```bash
GET /_mget
{
  "docs": [
    {
      "_index": "test",
      "_id": "1",
      "stored_fields": [ "field1", "field2" ]
    },
    {
      "_index": "test",
      "_id": "2",
      "stored_fields": [ "field3", "field4" ]
    }
  ]
}
```

以下请求默认从所有文档中检索 `field1` 和 `field2`。文档 1 将返回这些默认字段，但文档 2 将覆盖返回 `field3` 和 `field4`。

```bash
GET /test/_mget?stored_fields=field1,field2
{
  "docs": [
    {
      "_id": "1"
    },
    {
      "_id": "2",
      "stored_fields": [ "field3", "field4" ]
    }
  ]
}
```

### 指定文档路由

如果在索引编制过程中使用了路由，则需要指定检索文档的路由值。例如，下面的请求从路由键 `key1` 对应的分区获取 `test/_doc/2`，并从路由键 `key2` 对应的分区获取 `test/_doc/1`。

```bash
GET /_mget?routing=key1
{
  "docs": [
    {
      "_index": "test",
      "_id": "1",
      "routing": "key2"
    },
    {
      "_index": "test",
      "_id": "2"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-multi-get.html)
