# 批量 API

在一次 API 调用中执行多个索引或删除操作。这样可以减少开销，并大大提高索引速度。

```bash
POST _bulk
{ "index" : { "_index" : "test", "_id" : "1" } }
{ "field1" : "value1" }
{ "delete" : { "_index" : "test", "_id" : "2" } }
{ "create" : { "_index" : "test", "_id" : "3" } }
{ "field1" : "value3" }
{ "update" : {"_id" : "1", "_index" : "test"} }
{ "doc" : {"field2" : "value2"} }
```

## 请求

`POST /_bulk`

`POST /<target>/_bulk`

## 前置条件

- 如果启用了 Elasticsearch 安全功能，则必须拥有以下的 [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)用于数据流、索引或索引别名：

    - 要使用 `create` 操作，必须拥有 `create_doc`、`create`、`index` 或 `write` 权限。数据流只支持 `create` 操作。
    - 要使用 `index` 操作，必须拥有 `create`、`index` 或 `write` 索引权限。
    - 要使用 `delete` 操作，必须拥有 `delete` 或 `write` 索引权限。
    - 要使用更 `update` 操作，必须拥有 `index` 或 `write` 索引权限。
    - 要通过批量 API 请求自动创建数据流或索引，必须拥有 `auto_configure`、`create_index` 或 `manage` 索引权限。
    - 要使用 `refresh` 参数使批量操作的结果在搜索时可见，必须拥有 `maintenance` 或 `manage` 索引权限。

- 自动创建数据流需要启用数据流的匹配索引模板。参阅[设置数据流](/data_streams/set_up_a_data_stream)。

## 描述

提供了一种在单个请求中执行多个 `index`、`create`、`delete` 和 `update` 操作的方法。

这些操作使用换行分隔的 JSON（NDJSON）结构在请求正文中指定：

```bash
action_and_meta_data\n
optional_source\n
action_and_meta_data\n
optional_source\n
....
action_and_meta_data\n
optional_source\n
```

`index` 和 `create` 操作需要在下一行输入来源，其语义与标准索引 API 中的 `op_type` 参数相同：如果目标中已经存在具有相同 ID 的文档，则 `create` 失败；`index` 则根据需要添加或替换文档。

:::note 提示
[数据流](/data_streams)只支持 `create` 操作。要更新或删除数据流中的文档，必须以包含该文档的备用索引为目标。参阅[在备用索引中更新或删除文档](/data_streams/use_a_data_stream#更新或删除备份索引中的文档)。
:::

`update` 希望在下一行指定部分 doc、upsert 和脚本及其选项。

`delete` 不需要在下一行指定来源，其语义与标准删除 API 相同。

:::tip 注意
最后一行数据必须以换行符 `\n` 结束。每个换行符前都可以有一个 `\r`（回车符）。向 `_bulk` 端点发送 NDJSON 数据时，请使用一个值为 `application/json` 或 `application/x-ndjson` 的 `Content-Type` 请求头。
:::

由于这种格式使用字面 `\n` 作为分隔符，因此要确保 JSON 操作和源代码没有优化打印。

如果在请求路径中提供了 `<target>`，它将用于任何未明确指定 `_index` 参数的操作。

格式说明：这里的目的是使处理速度尽可能快。由于某些操作会被重定向到其他节点上的其他分片，因此在接收节点端只对 `action_meta_data` 进行解析。

使用此协议的客户端库应尽量在客户端做类似的事情，并尽可能减少缓冲。

在单个批量请求中，没有"正确"的操作数。请尝试使用不同的设置，以找到适合你特定工作负载的最佳大小。请注意，Elasticsearch 默认将 HTTP 请求的最大大小限制为 `100mb`，因此客户必须确保任何请求都不会超过这一大小。无法索引超过大小限制的单个文档，因此必须在将此类文档发送到 Elasticsearch 之前将其预处理成更小的片。例如，在编制索引前将文档分割成页面或章节，或在 Elasticsearch 以外的系统中存储原始二进制数据，并在发送到 Elasticsearch 的文档中用指向外部系统的链接替换原始数据。

### 批量请求的客户端支持

一些官方支持的客户端提供了帮助程序，以协助批量请求和重新索引：

- GO

    参阅 [esutil.BulkIndexer](https://github.com/elastic/go-elasticsearch/tree/master/_examples/bulk#indexergo)

- Perl

    参阅 [Search::Elasticsearch::Client::5_0::Bulk](https://metacpan.org/pod/Search::Elasticsearch::Client::5_0::Bulk) 和 [Search::Elasticsearch::Client::5_0::Scroll](https://metacpan.org/pod/Search::Elasticsearch::Client::5_0::Scroll)

- Python

    参阅 [elasticsearch.helpers.*](https://elasticsearch-py.readthedocs.org/en/master/helpers.html)

- JavaScript

    参阅 [client.helpers.*](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-helpers.html)

- .NET

    参阅 [BulkAllObservable](https://www.elastic.co/guide/en/elasticsearch/client/net-api/current/indexing-documents.html)

- PHP

    参阅 [Bulk indexing](https://www.elastic.co/guide/en/elasticsearch/client/php-api/current/indexing_documents.html#_bulk_indexing)

### 使用 cURL 提交批量请求

如果向 `curl` 提供文本文件输入，**必须**使用 `--data-binary` 标志，而不是简单的 `-d`。后者不会保留换行符。示例：

```bash
$ cat requests
{ "index" : { "_index" : "test", "_id" : "1" } }
{ "field1" : "value1" }
$ curl -s -H "Content-Type: application/x-ndjson" -XPOST localhost:9200/_bulk --data-binary "@requests"; echo
{"took":7, "errors": false, "items":[{"index":{"_index":"test","_id":"1","_version":1,"result":"created","forced_refresh":false}}]}
```

### 乐观并发控制

批量 API 调用中的每个 `index` 和 `delete` 操作都可以在各自的操作和元数据行中包含 `if_seq_no` 和 `if_primary_term` 参数。`if_seq_no` 和 `if_primary_term` 参数根据对现有文档的最后一次修改来控制操作的执行方式。详情参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。

### 版本控制

每个批量项目都可以使用 `version` 字段包含版本值。它会根据 `_version` 映射自动遵循索引/删除操作的行为。它还支持 `version_type`（参阅[版本控制](/rest_apis/document_apis/docs_index.html#版本控制)）。

### 路由

每个批量项目都可以使用 `routing` 字段包含路由值。它会根据 `_routing` 映射自动遵循索引/删除操作的行为。

:::note 提示
数据流不支持自定义路由，除非在创建数据流时启用了模板中的 [allow_custom_routing](/rest_apis/index_apis/create_or_update_index_template.html#请求体) 设置。
:::

### 等待活动分片

在进行批量调用时，可以设置 `wait_for_active_shards` 参数，要求在开始处理批量请求之前，至少要有一定数量的分片副本处于活动状态。详情和使用示例参阅[此处](/rest_apis/document_apis/docs_index#活动分片)。

### 刷新

控制搜索何时可以看到该请求所做的更改。参阅[刷新](/rest_apis/document_apis/refresh)。

:::note 提示
只有收到批量请求的分片才会受到 `refresh` 的影响。试想一下，一个 `_bulk?refresh=wait_for` 请求中包含三个文档，而这三个文档恰好被路由到一个有五个分区的索引中的不同分区。该请求只会等待这三个分区刷新。组成索引的其他两个分区完全不参与 `_bulk` 请求。
:::

### 安全

参阅[基于 URL 的访问控制](/rest_apis/api_convention/url_based_access_control)。

## 路径参数

- `<target>`

    (可选，字符串） 要执行批量操作的数据流、索引或索引别名的名称。

## 查询参数

- `list_executed_pipelines`

    (可选，布尔值）如果为 `true`，响应将包括为每个索引器创建时执行的摄取管道。默认为 `false`。

- `pipeline`

    (可选，字符串）用于预处理传入文档的管道 ID。如果索引指定了默认摄取管道，则将该值设为 `_none` 会禁用此请求的默认摄取管道。如果配置了最终管道，无论此参数的值如何，它都将始终运行。

- `refresh`

    (可选，布尔值）如果为 `true`，Elasticsearch 会刷新受影响的分片，使操作在搜索中可见。默认为 `false`。

- `require_alias`

    （可选，布尔值）如果为 `true`，则目标必须是[索引别名](/aliases)。默认为`false`。

- `routing`

    (可选，字符串） 用于将操作路由到特定分区的自定义值。

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

- `timeout`

    (可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)） 每个更新请求等待以下操作的周期：

    - [自动创建索引](/rest_apis/document_apis/docs_index#自动创建数据流和索引)
    - [动态映射](/mapping/dynamic_mapping)更新
    - [等待活动分片](/rest_apis/document_apis/docs_index#活动分片)

    默认为 `1m`（一分钟）。这保证 Elasticsearch 在失败前至少等待超时时间。实际等待时间可能会更长，尤其是发生多次等待时。

- `wait_for_active_shards`
    (可选，字符串） 进行操作前必须激活的分片副本数量。设置为 `all` 或任何正整数，最多不超过索引中的分片总数（`number_of_replicas+1`）。默认值：`1`，主分区。

    参阅[活动分片](/rest_apis/document_apis/docs_index#活动分片)。

## 请求体

请求正文包含以新行分隔的创建、删除、索引和更新操作及其相关源数据的列表。

- `create`

    (可选，字符串） 如果指定文档还不存在，则对其进行索引。下面一行必须包含要索引的源数据。

    - `_index`
    
        (可选，字符串）要执行操作的数据流、索引或索引别名的名称。如果请求路径中未指明 `<target>`，则必须使用此参数。

    - `_id`

        (可选，字符串） 文档 ID。如果未指定 ID，文件 ID 将自动生成。

    - `list_executed_pipelines`

        (可选，布尔值）如果为 `true`，响应将包括已执行的摄取管道。默认为 `false`。

    - `require_alias`

        (可选，布尔） 如果为 `true`，则操作必须以[索引别名](/aliases)为目标。默认为 `false`。

    - `dynamic_templates`

        (可选，映射）从字段全名到[动态模板](/mapping/dynamic_template)名称的映射。默认为空映射。如果某个名称与动态模板相匹配，那么无论模板中是否定义了其他匹配谓词，都将应用该模板。如果某个字段已在映射中定义，则不会使用此参数。

- `delete`

    (可选，字符串） 从索引中删除指定文档。

    - `_index`

        (可选，字符串）要执行操作的索引或索引别名的名称。如果未在请求路径中指定 `<target>`，则必须使用此参数。

    - `_id`

        (必填，字符串） 文档 ID。

    - `require_alias`

        (可选，布尔） 如果为 `true`，则操作必须以索引别名为目标。默认为 `false`。

- `index`

    (可选，字符串）索引指定的文档。如果文档存在，则替换文档并递增版本。下面一行必须包含要索引的源数据。

    - `_index`

        (可选，字符串）要执行操作的索引或索引别名的名称。如果未在请求路径中指定 `<target>`，则必须使用此参数。

    - `_id`

        (可选，字符串） 文档 ID。如果未指定 ID，文件 ID 将自动生成。

    - `list_executed_pipelines`

        (可选，布尔值）如果为 `true`，响应将包括已执行的摄取管道。默认为 `false`。
    
    - `require_alias`

        (可选，布尔值） 如果为 `true`，则操作必须以索引别名为目标。默认为 `false`。

    - `dynamic_templates`

        (可选，映射）从字段全名到动态模板名称的映射。默认为空映射。如果某个名称与[动态模板](/mapping/dynamic_template)相匹配，那么无论模板中是否定义了其他匹配谓词，都将应用该模板。如果某个字段已在映射中定义，则不会使用此参数。

- `update`

    (可选，字符串） 执行部分文档更新。下面一行必须包含部分文档和更新选项。

    - `_index`

        (可选，字符串）要执行操作的索引或索引别名的名称。如果未在请求路径中指定 `<target>`，则必须使用此参数。

    - `_id`

        (必填，字符串） 文档 ID。
    
    - `require_alias`

        (可选，布尔） 如果为 `true`，则操作必须以索引别名为目标。默认为 `false`。

- `doc`

    (可选，对象）要索引的部分文档。`update` 操作必需。

- `<fields>`

    (可选，对象）要索引的文档源。`create` 和 `index` 操作必需。

## 响应体

批量 API 的响应包含请求中每个操作的单独结果，并按照提交的顺序返回。单个操作的成功或失败不会影响请求中的其他操作。

- `took`

    (整数）批量请求的处理时间（毫秒）。

- `errors`

    (布尔值）如果为 `true`，则批量请求中的一个或多个操作未成功完成。

- `items`

    (对象数组） 包含批量请求中每个操作的结果，按提交顺序排列。

    - `items` 对象属性

        - `<action>`

            (对象）参数名称是与操作相关的操作。可能的值包括创建、删除、索引和更新。

            参数值是一个包含相关操作信息的对象。

            - `<action>` 属性

                - `_index`

                    (字符串）与操作相关联的索引名称。如果操作以数据流为目标，则该索引是写入文档的后备索引。

                - `_id`

                    (整数）与操作相关的文档 ID。

                - `_version`

                    (整数）与操作相关的文档版本。每次更新文档时，文档版本都会递增。

                    该参数仅在操作成功时返回。

                - `result`

                    (字符串）操作结果。成功的值包括 `created`、`deleted` 和 `updated`。其他有效值为 `noop` 和 `not_found`。

                - `_shards`

                    (对象） 包含操作的分片信息。
                    
                    只有操作成功才会返回该参数。

                    - `_shards` 属性

                        - `total`
                        
                            (整数）操作尝试执行的分片数。

                        - `successful`

                            (整数）操作成功的分片数。

                        - `failed`

                            (整数）操作尝试执行但失败的分片数量。

                    - `_seq_no`

                        (整数）为操作分配给文档的序列号。序列号用于确保文档的旧版本不会覆盖新版本。参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。

                        只有成功的操作才会返回此参数。

                    - `_primary_term`

                        (整数）为操作分配给文档的主要术语。参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。

                        该参数仅在操作成功时返回。

                    - `status`

                        (整数）操作返回的 HTTP 状态代码。

                    - `error`

                        (对象）包含有关操作失败的附加信息。

                        只有操作失败时才会返回该参数。

                        - `error` 属性

                            - `type`

                                (字符串）操作的错误类型。

                            - `reason`

                                (字符串）操作失败的原因。

                            - `index_uuid`

                                (字符串）与失败操作相关的索引的通用唯一标识符 (UUID)。

                            - `shard`

                                (字符串）与失败操作相关的分区的 ID。

                            - `index`

                                (字符串）与失败操作相关联的索引名称。如果操作以数据流为目标，则这是试图将文档写入的后备索引。

## 示例

```bash
POST _bulk
{ "index" : { "_index" : "test", "_id" : "1" } }
{ "field1" : "value1" }
{ "delete" : { "_index" : "test", "_id" : "2" } }
{ "create" : { "_index" : "test", "_id" : "3" } }
{ "field1" : "value3" }
{ "update" : {"_id" : "1", "_index" : "test"} }
{ "doc" : {"field2" : "value2"} }
```

API 返回以下结果：

```json
{
   "took": 30,
   "errors": false,
   "items": [
      {
         "index": {
            "_index": "test",
            "_id": "1",
            "_version": 1,
            "result": "created",
            "_shards": {
               "total": 2,
               "successful": 1,
               "failed": 0
            },
            "status": 201,
            "_seq_no" : 0,
            "_primary_term": 1
         }
      },
      {
         "delete": {
            "_index": "test",
            "_id": "2",
            "_version": 1,
            "result": "not_found",
            "_shards": {
               "total": 2,
               "successful": 1,
               "failed": 0
            },
            "status": 404,
            "_seq_no" : 1,
            "_primary_term" : 2
         }
      },
      {
         "create": {
            "_index": "test",
            "_id": "3",
            "_version": 1,
            "result": "created",
            "_shards": {
               "total": 2,
               "successful": 1,
               "failed": 0
            },
            "status": 201,
            "_seq_no" : 2,
            "_primary_term" : 3
         }
      },
      {
         "update": {
            "_index": "test",
            "_id": "1",
            "_version": 2,
            "result": "updated",
            "_shards": {
                "total": 2,
                "successful": 1,
                "failed": 0
            },
            "status": 200,
            "_seq_no" : 3,
            "_primary_term" : 4
         }
      }
   ]
}
```

### 批量更新示例

使用 `update` 操作时，`retry_on_conflict` 可作为操作本身的一个字段（而不是额外的有效载荷行），用于指定在版本冲突的情况下应重试多少次更新。

`update` 操作有效载荷支持以下选项：`doc`（部分文档）、`upsert`、`doc_as_upsert`、`script`、`params`（用于脚本）、`lang`（用于脚本）和 `_source`。有关选项的详细信息，参阅更新文档。更新操作示例：

```bash
POST _bulk
{ "update" : {"_id" : "1", "_index" : "index1", "retry_on_conflict" : 3} }
{ "doc" : {"field" : "value"} }
{ "update" : { "_id" : "0", "_index" : "index1", "retry_on_conflict" : 3} }
{ "script" : { "source": "ctx._source.counter += params.param1", "lang" : "painless", "params" : {"param1" : 1}}, "upsert" : {"counter" : 1}}
{ "update" : {"_id" : "2", "_index" : "index1", "retry_on_conflict" : 3} }
{ "doc" : {"field" : "value"}, "doc_as_upsert" : true }
{ "update" : {"_id" : "3", "_index" : "index1", "_source" : true} }
{ "doc" : {"field" : "value"} }
{ "update" : {"_id" : "4", "_index" : "index1"} }
{ "doc" : {"field" : "value"}, "_source": true}
```

### 操作失败的示例

以下批量 API 请求包含更新不存在文档的操作。

```bash
POST /_bulk
{ "update": {"_id": "5", "_index": "index1"} }
{ "doc": {"my_field": "foo"} }
{ "update": {"_id": "6", "_index": "index1"} }
{ "doc": {"my_field": "foo"} }
{ "create": {"_id": "7", "_index": "index1"} }
{ "my_field": "foo" }
```

由于这些操作无法成功完成，API 会返回一个 `errors` 标志为 `true` 的响应。

对于任何失败的操作，响应中还包含一个 `error` 对象。`error` 对象包含有关失败的附加信息，如错误类型和原因。

```json
{
  "took": 486,
  "errors": true,
  "items": [
    {
      "update": {
        "_index": "index1",
        "_id": "5",
        "status": 404,
        "error": {
          "type": "document_missing_exception",
          "reason": "[5]: document missing",
          "index_uuid": "aAsFqTI0Tc2W0LCWgPNrOA",
          "shard": "0",
          "index": "index1"
        }
      }
    },
    {
      "update": {
        "_index": "index1",
        "_id": "6",
        "status": 404,
        "error": {
          "type": "document_missing_exception",
          "reason": "[6]: document missing",
          "index_uuid": "aAsFqTI0Tc2W0LCWgPNrOA",
          "shard": "0",
          "index": "index1"
        }
      }
    },
    {
      "create": {
        "_index": "index1",
        "_id": "7",
        "_version": 1,
        "result": "created",
        "_shards": {
          "total": 2,
          "successful": 1,
          "failed": 0
        },
        "_seq_no": 0,
        "_primary_term": 1,
        "status": 201
      }
    }
  ]
}
```

要只返回操作失败的信息，请使用参数为 `items.*.error` 的 [filter_path](/rest_apis/api_convention/common_options.html#响应过滤) 查询参数。

```bash
POST /_bulk?filter_path=items.*.error
{ "update": {"_id": "5", "_index": "index1"} }
{ "doc": {"my_field": "baz"} }
{ "update": {"_id": "6", "_index": "index1"} }
{ "doc": {"my_field": "baz"} }
{ "update": {"_id": "7", "_index": "index1"} }
{ "doc": {"my_field": "baz"} }
```

API 返回以下结果：

```json
{
  "items": [
    {
      "update": {
        "error": {
          "type": "document_missing_exception",
          "reason": "[5]: document missing",
          "index_uuid": "aAsFqTI0Tc2W0LCWgPNrOA",
          "shard": "0",
          "index": "index1"
        }
      }
    },
    {
      "update": {
        "error": {
          "type": "document_missing_exception",
          "reason": "[6]: document missing",
          "index_uuid": "aAsFqTI0Tc2W0LCWgPNrOA",
          "shard": "0",
          "index": "index1"
        }
      }
    }
  ]
}
```

### 使用动态模板参数的示例

下面的示例创建了一个动态模板，然后使用 `dynamic_templates` 参数执行由索引/创建请求组成的批量请求。

```bash
PUT my-index/
{
  "mappings": {
    "dynamic_templates": [
      {
        "geo_point": {
             "mapping": {
                "type" : "geo_point"
             }
        }
      }
    ]
  }
}

POST /_bulk
{ "index" : { "_index" : "my_index", "_id" : "1", "dynamic_templates": {"work_location": "geo_point"}} }
{ "field" : "value1", "work_location": "41.12,-71.34", "raw_location": "41.12,-71.34"}
{ "create" : { "_index" : "my_index", "_id" : "2", "dynamic_templates": {"home_location": "geo_point"}} }
{ "field" : "value2", "home_location": "41.12,-71.34"}
```

批量请求根据 `dynamic_templates` 参数创建了两个新字段 `work_location` 和 `home_location`，其类型为 `geo_point`；但 `raw_location` 字段是使用默认动态映射规则创建的，在这种情况下是 `text` 字段，因为它在 JSON 文档中是以字符串形式提供的。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html)
