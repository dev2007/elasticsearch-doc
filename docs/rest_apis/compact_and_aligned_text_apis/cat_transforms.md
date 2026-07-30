# cat 转换 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[获取转换 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-transforms.html)。

::::

返回有关转换的配置和使用信息。

## 请求

```json
GET /_cat/transforms/<transform_id>
```

```json
GET /_cat/transforms/_all
```

```json
GET /_cat/transforms/*
```

```json
GET /_cat/transforms
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor_transform` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。内置的 `transform_user` 角色拥有这些权限。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)和[内置角色](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/built-in-roles.html)。

## 路径参数

- `<transform_id>`（可选，字符串）

  转换的标识符。可以是转换标识符或通配符表达式。如果不指定这些选项之一，API 将返回所有转换的信息。

## 查询参数

- `allow_no_match`（可选，布尔值）

  指定当请求出现以下情况时的处理方式：

  - 包含通配符表达式且没有匹配的转换。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且仅有部分匹配。

  默认值为 `true`，当没有匹配项时返回空的转换数组，当有部分匹配项时返回结果的子集。

  如果此参数为 `false`，当没有匹配项或仅有部分匹配项时，请求返回 `404` 状态码。

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `from`（可选，整数）

  跳过指定数量的转换。默认值为 `0`。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果未指定要包含的列，API 将返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列包括：

  - `changes_last_detection_time`、`cldt`：（默认）上次在源索引中检测到更改的时间戳。
  - `checkpoint`、`cp`：（默认）检查点的序列号。
  - `checkpoint_duration_time_exp_avg`、`cdtea`、`checkpointTimeExpAvg`：检查点持续时间的指数移动平均值，以毫秒为单位。
  - `checkpoint_progress`、`c`、`checkpointProgress`：（默认）当前正在进行的下一个检查点的进度。
  - `create_time`、`ct`、`createTime`：转换创建的时间。
  - `delete_time`、`dtime`：删除操作花费的时间，以毫秒为单位。
  - `description`、`d`：转换的描述。
  - `dest_index`、`di`、`destIndex`：转换的目标索引。

    对于透视转换，目标索引的映射会尽可能根据源字段推导。如果需要替代映射，请在启动转换之前使用创建索引 API。

    对于最新转换，映射永远不会被推导。如果不希望目标索引使用动态映射，请在启动转换之前使用创建索引 API。

  - `documents_deleted`、`docd`：由于此转换的保留策略而从目标索引中删除的文档数。
  - `documents_indexed`、`doci`：为转换索引到目标索引的文档数。
  - `docs_per_second`、`dps`：指定每秒输入文档数的限制。此设置通过在搜索请求之间添加等待时间来限制转换。默认值为 `null`，表示禁用限制。
  - `documents_processed`、`docp`：（默认）已从转换的源索引处理的文档数。
  - `frequency`、`f`：当转换连续运行时，检查源索引中更改的间隔。最小值为 `1s`，最大值为 `1h`。默认值为 `1m`。
  - `id`：（默认）转换的标识符。
  - `index_failure`、`if`：索引失败次数。
  - `index_time`、`itime`：索引操作花费的时间，以毫秒为单位。
  - `index_total`、`it`：索引操作数。
  - `indexed_documents_exp_avg`、`idea`：已索引新文档数量的指数移动平均值。
  - `last_search_time`、`lst`、`lastSearchTime`：（默认）源索引中上次搜索的时间戳。此字段仅在转换正在运行时显示。
  - `max_page_search_size`、`mpsz`：定义每个检查点的复合聚合使用的初始页面大小。如果发生断路器异常，页面大小会动态调整为较小的值。最小值为 `10`，最大值为 `65536`。默认值为 `500`。
  - `pages_processed`、`pp`：已处理的搜索或批量索引操作数。文档以批次而非逐个处理。
  - `pipeline`、`p`：接入管道的唯一标识符。
  - `processed_documents_exp_avg`、`pdea`：已处理文档数量的指数移动平均值。
  - `processing_time`、`pt`：处理结果花费的时间，以毫秒为单位。
  - `reason`、`r`：如果转换处于失败状态，此属性提供有关失败原因的详细信息。
  - `search_failure`、`sf`：搜索失败次数。
  - `search_time`、`stime`：搜索操作花费的时间，以毫秒为单位。
  - `search_total`、`st`：转换源索引上的搜索操作数。
  - `source_index`、`si`、`sourceIndex`：（默认）转换的源索引。可以是单个索引、索引模式（例如 `"my-index-*"`）、索引数组（例如 `["my-index-000001", "my-index-000002"]`）或索引模式数组（例如 `["my-index-*", "my-other-index-*"]`）。对于远程索引，使用语法 `"remote_name:index_name"`。

    如果任何索引位于远程集群中，则主节点和至少一个转换节点必须具有 `remote_cluster_client` 节点角色。

  - `state`、`s`：（默认）转换的状态，可以是以下值之一：
    - `aborting`：转换正在中止。
    - `failed`：转换失败。有关失败的更多信息，请检查 `reason` 字段。
    - `indexing`：转换正在主动处理数据并创建新文档。
    - `started`：转换正在运行但未主动索引数据。
    - `stopped`：转换已停止。
    - `stopping`：转换正在停止。
  - `transform_type`、`tt`：指示转换的类型：`batch` 或 `continuous`。
  - `trigger_count`、`tc`：转换被调度器触发的次数。例如，调度器按 `frequency` 属性指定的间隔触发转换索引器检查更新或接入新数据。
  - `version`、`v`：创建转换时节点上存在的 Elasticsearch 版本。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `size`（可选，整数）

  指定要获取的最大转换数。默认值为 `100`。

- `time`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  用于显示时间值的单位。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 示例

```json
GET /_cat/transforms?v=true&format=json
```

API 返回以下响应：

```json
[
  {
    "id" : "ecommerce_transform",
    "state" : "started",
    "checkpoint" : "1",
    "documents_processed" : "705",
    "checkpoint_progress" : "100.00",
    "changes_last_detection_time" : null
  }
]
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-transforms.html)
