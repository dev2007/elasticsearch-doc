# 获取 API

从索引中读取指定的 JSON 文档。

```bash
GET my-index-000001/_doc/0
```

## 请求

`GET <index>/_doc/<_id>`

`HEAD <index>/_doc/<_id>`

`GET <index>/_source/<_id>`

`HEAD <index>/_source/<_id>`

## 前置条件

- 开启 Elasticsearch 安全功能后，您必须拥有目标索引或索引别名的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

使用 GET 可从特定索引中检索文档及其源字段或存储字段。使用 HEAD 可验证文档是否存在。您可以使用 `_source` 资源检索文档源或验证其是否存在。

### 实时
编辑
默认情况下，get API 是实时的，不受索引刷新率的影响（数据何时可见以供搜索）。如果请求的是存储字段（参见 `stored_fields` 参数），且文档已更新但尚未刷新，则 get API 必须解析和分析源以提取存储字段。要禁用实时 GET，可将 `realtime` 参数设置为 `false`。

### 源过滤

默认情况下，除非使用了 `stored_fields` 参数或禁用了 `_source` 字段，否则 get 操作将返回 `_source` 字段的内容。您可以使用 `_source` 参数关闭 `_source` 检索：

```bash
GET my-index-000001/_doc/0?_source=false
```

如果只需要 `_source` 中的一个或两个字段，可以使用 `_source_includes` 或 `_source_excludes` 参数来包含或过滤掉特定字段。这对大型文档尤其有用，因为部分检索可以节省网络开销。这两个参数都使用逗号分隔的字段列表或通配符表达式。例如：

```bash
GET my-index-000001/_doc/0?_source_includes=*.id&_source_excludes=entities
```

如果只想指定包含内容，可以使用更短的符号：

```bash
GET my-index-000001/_doc/0?_source=*.id
```

### 路由（Routing）

如果在索引编制过程中使用了路由，则在检索文档时也需要指定路由值。例如：

```bash
GET my-index-000001/_doc/2?routing=user1
```

该请求获取 id 为 `2` 的文档，但其路由基于用户。如果未指定正确的路由，则不会获取文档。

### 偏好（Preference）

控制在哪个分片副本上执行获取请求的偏好。默认情况下，操作会在分片副本之间随机进行。

`preference` 可设置为：

- `_local`
    如果可能，操作将优先在本地分配的分块上执行。
### 自定义（字符串）值

自定义值将用于保证相同的分区将用于相同的自定义值。这有助于解决在不同刷新状态下访问不同分区时出现的“跳值”问题。示例值可以是网络会话 ID 或用户名。

### 刷新（Refreshe）

可以将 `refresh` 参数设置为 `true`，以便在获取操作之前刷新相关分片，使其可以被搜索。将该参数设置为 `true` 之前，应仔细考虑并验证这样做不会给系统带来沉重负担（降低索引速度）。

### 分布式

获取操作会被散列到一个特定的分片 ID 中。然后，它会被重定向到该分区 id 中的一个副本，并返回结果。副本是指主分区及其在该分区 ID 组内的副本。这意味着，我们拥有的副本越多，GET 扩展性就越好。

### 版本支持

只有当文档的当前版本等于指定版本时，才能使用 `version` 参数检索文档。

在内部，Elasticsearch 已将旧文档标记为已删除，并添加了一个全新的文档。旧版本的文档不会立即消失，不过你将无法访问它。当你继续索引更多数据时，Elasticsearch 会在后台清理已删除的文档。

## 路径参数

- `<index>`
    (必填，字符串）包含文档的索引的名称。
- `<_id>`
    (必填，字符串）文档的唯一标识符。

## 查询参数

- `preference`
    (可选，字符串） 指定应在哪个节点或分片上执行操作。默认为随机。
- `realtime`
    (可选，布尔） 如果为 `true`，则表示请求是实时的，而不是近实时的。默认为 `true`。参阅[实时](#实时)。
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
- `version`
    (可选，整数）用于并发控制的明确版本号。指定的版本必须与文档的当前版本一致，请求才能成功。
- `version_type`
    (可选，枚举） 特定版本类型：`external`、`external_gte`。

## 响应体

- `_index`
    文档所属索引的名称。
- `_id`
    文档的唯一标识符。
- `_version`
    文档版本。文档每次更新时都会递增。
- `_seq_no`
    为索引操作分配给文档的序列号。序列号用于确保文档的旧版本不会覆盖新版本。参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。
- `_primary_term`
    为索引操作分配给文档的主要术语。参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。
- `found`
    表示文档是否存在：`true` 或 `false`。
- `_routing`
    显式路由（如果已设置）。
- `_source`
    如果 `found` 为 `true`，则包含 JSON 格式的文档数据。如果 `_source` 参数设置为 `false` 或 `stored_fields` 参数设置为 `true`，则排除在外。
- `_fields`
    如果 `stored_fields` 参数设置为 `true` 且 `found` 为 `true`，则包含存储在索引中的文档字段。

## 示例

从 `my-index-000001` 索引中读取 `_id` 为 0 的 JSON 文档：

```bash
GET my-index-000001/_doc/0
```

API 返回以下结果：

```json
{
  "_index": "my-index-000001",
  "_id": "0",
  "_version": 1,
  "_seq_no": 0,
  "_primary_term": 1,
  "found": true,
  "_source": {
    "@timestamp": "2099-11-15T14:12:12",
    "http": {
      "request": {
        "method": "get"
      },
      "response": {
        "status_code": 200,
        "bytes": 1070000
      },
      "version": "1.1"
    },
    "source": {
      "ip": "127.0.0.1"
    },
    "message": "GET /search HTTP/1.1 200 1070000",
    "user": {
      "id": "kimchy"
    }
  }
}
```

检查是否存在 `_id` 为 0 的文档：

```bash
HEAD my-index-000001/_doc/0
```

如果文档存在，Elasticsearch 返回状态代码 `200 - OK`；如果不存在，则返回 `404 - Not Found`。

### 仅获取源字段

使用 `<index>/_source/<id>` 资源只获取文档的 `_source` 字段。例如：

```bash
GET my-index-000001/_source/1
```

您可以使用源过滤参数来控制 `_source` 的哪些部分会被返回：

```bash
GET my-index-000001/_source/1/?_source_includes=*.id&_source_excludes=entities
```

您可以使用 HEAD 和 `_source` 端点来有效地测试文档 `_source` 是否存在。如果在[映射](/mapping/metadata_fields/_source_field)中禁用了文档源，则文档源不可用。

```bash
HEAD my-index-000001/_source/1
```

### 获取存储字段

使用 `stored_fields` 参数指定要检索的存储字段集。任何未存储的请求字段都将被忽略。例如，请考虑以下映射：

```bash
PUT my-index-000001
{
   "mappings": {
       "properties": {
          "counter": {
             "type": "integer",
             "store": false
          },
          "tags": {
             "type": "keyword",
             "store": true
          }
       }
   }
}
```

现在我们可以添加一个文件：

```bash
PUT my-index-000001/_doc/1
{
  "counter": 1,
  "tags": [ "production" ]
}
```

然后再试着找回它：

```bash
GET my-index-000001/_doc/1?stored_fields=tags,counter
```

API 返回以下结果：

```json
{
   "_index": "my-index-000001",
   "_id": "1",
   "_version": 1,
   "_seq_no" : 22,
   "_primary_term" : 1,
   "found": true,
   "fields": {
      "tags": [
         "production"
      ]
   }
}
```

从文档本身获取的字段值总是以数组形式返回。由于 `counter` 字段没有存储，因此获取请求会忽略它。

您还可以检索 `_routing` 字段等元数据字段：

```bash
PUT my-index-000001/_doc/2?routing=user1
{
  "counter" : 1,
  "tags" : ["env2"]
}
```

```bash
GET my-index-000001/_doc/2?routing=user1&stored_fields=tags,counter
```

API 返回以下结果：

```json
{
   "_index": "my-index-000001",
   "_id": "2",
   "_version": 1,
   "_seq_no" : 13,
   "_primary_term" : 1,
   "_routing": "user1",
   "found": true,
   "fields": {
      "tags": [
         "env2"
      ]
   }
}
```

使用 `stored_field` 选项只能检索叶字段。如果指定了对象字段，则请求失败。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-get.html)
