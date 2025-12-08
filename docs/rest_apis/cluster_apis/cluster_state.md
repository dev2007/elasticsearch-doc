# 集群状态 API

:::info 新 API 参考
有关最新的 API 详情，请参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

返回集群状态的内部表示，用于调试或诊断目的。

## 请求

```bash
GET /_cluster/state/<metrics>/<target>
```

## 前置条件

- 如果启用了 Elasticsearch 安全特性，你必须具有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)以使用此 API。

## 描述

集群状态是一个内部数据结构，用于跟踪每个节点所需的各种信息，包括：

- 集群中其他节点的身份和属性
- 集群范围的设置
- 索引元数据，包括每个索引的映射和设置
- 集群中每个分片副本的位置和状态

当选主节点确保集群中的每个节点都拥有相同的集群状态副本。集群状态 API 允许你检索此内部状态的表示形式，用于调试或诊断目的。你可能需要查阅 Elasticsearch 源代码来确定响应的确切含义。

默认情况下，集群状态 API 会将请求路由到当选主节点，因为该节点是集群状态的权威来源。你还可以通过添加查询参数 `?local=true` 来检索处理 API 请求的节点上所持有的集群状态。

在大型集群中，Elasticsearch 可能需要耗费大量资源来计算此 API 的响应，且响应可能包含大量数据。如果你重复使用此 API，可能会导致集群不稳定。

:::warning 警告
响应是内部数据结构的表示。其格式不享有与其他更稳定 API 相同的兼容性保证，并且可能因版本而异。**请勿使用外部监控工具查询此 API。** 相反，请使用其他更稳定的[集群 API](/rest_apis/cluster_apis) 获取所需信息。
:::

## 路径参数

集群状态有时可能非常庞大，Elasticsearch 在计算此 API 的响应时可能消耗大量资源。为了减小响应的大小，你可以仅请求你感兴趣的那部分集群状态：

- `<metrics>`

  （可选，字符串）逗号分隔的以下选项列表：

  - `_all`

    显示所有指标。

  - `blocks`

    显示响应的 `blocks` 部分。

  - `master_node`

    显示响应的 `master_node` 部分。

  - `metadata`

    显示响应的 `metadata` 部分。如果你提供逗号分隔的索引列表，则返回的输出将仅包含这些索引的元数据。

  - `nodes`

    显示响应的 `nodes` 部分。

  - `routing_nodes`

    显示响应的 `routing_nodes` 部分。

  - `routing_table`

    显示响应的 `routing_table` 部分。如果你提供逗号分隔的索引列表，则返回的输出将仅包含这些索引的路由表。

  - `version`

    显示集群状态版本。

- `<target>`

  （可选，字符串）用于限制请求的数据流、索引和别名的逗号分隔列表。支持通配符 (`*`)。若要针对所有数据流和索引，请忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`

  （可选，布尔值）如果为 `true`，则解析为无具体索引的通配符索引表达式将被忽略。（这包括 `_all` 字符串或未指定任何索引的情况）。默认为 `true`。

- `expand_wildcards`

  （可选，字符串）是否将通配符表达式扩展为打开的、关闭的或两者兼有的具体索引。可用选项：`open`、`closed`、`none`、`all`。

- `flat_settings`

  （可选，布尔值）如果为 `true`，则以扁平格式返回设置。默认为 `false`。

- `ignore_unavailable`

  （可选，布尔值）如果为 `true`，则不可用索引（缺失或关闭）将被忽略。

- `local`

  （可选，布尔值）如果为 `true`，则请求仅从本地节点检索信息。默认为 `false`，表示从主节点检索信息。

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的时间段。如果主节点在超时到期前不可用，则请求失败并返回错误。默认为 `30s`。也可以设置为 `-1` 以表示请求永不超时。

- `wait_for_metadata_version`

  （可选，整数）等待元数据版本等于或大于指定的元数据版本。

- `wait_for_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）指定等待 `wait_for_metadata_version` 的最大超时时间。

## 示例

以下示例仅返回 `foo` 和 `bar` 数据流或索引的 `metadata` 和 `routing_table` 数据：

```bash
GET /_cluster/state/metadata,routing_table/foo,bar
```

下一个示例返回 `foo` 和 `bar` 的所有可用元数据：

```bash
GET /_cluster/state/_all/foo,bar
```

此示例仅返回 `blocks` 元数据：

```bash
GET /_cluster/state/blocks
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-state.html)
