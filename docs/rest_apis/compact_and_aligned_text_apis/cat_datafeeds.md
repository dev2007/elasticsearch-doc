# cat 数据馈送 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[获取数据馈送统计信息 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-datafeed-stats.html)。

::::

返回有关数据馈送的配置和使用信息。

## 请求

```json
GET /_cat/ml/datafeeds/<feed_id>
```

```json
GET /_cat/ml/datafeeds
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor_ml`、`monitor`、`manage_ml` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)和[机器学习安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-settings.html#ml-security-privileges)。

## 描述

数据馈送从 Elasticsearch 检索数据，供异常检测作业分析。有关更多信息，请参阅[数据馈送](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-datafeeds.html)。

此 API 最多返回 10000 个作业。

## 路径参数

- `<feed_id>`（可选，字符串）

  唯一标识数据馈送的数字字符串。此标识符可以包含小写字母数字字符（a-z 和 0-9）、连字符和下划线。它必须以字母数字字符开头和结尾。

## 查询参数

- `allow_no_match`（可选，布尔值）

  指定当请求出现以下情况时的处理方式：

  - 包含通配符表达式且没有匹配的数据馈送。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且仅有部分匹配。

  默认值为 `true`，当没有匹配项时返回空的数据馈送数组，当有部分匹配项时返回结果的子集。如果此参数为 `false`，当没有匹配项或仅有部分匹配项时，请求返回 `404` 状态码。

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果未指定要包含的列，API 将返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列包括：

  - `assignment_explanation`、`ae`：仅对于已启动的数据馈送，包含与节点选择相关的消息。
  - `buckets.count`、`bc`、`bucketsCount`：（默认）已处理的桶数量。
  - `id`：（默认）唯一标识数据馈送的数字字符串。此标识符可以包含小写字母数字字符（a-z 和 0-9）、连字符和下划线。它必须以字母数字字符开头和结尾。
  - `node.address`、`na`、`nodeAddress`：节点的网络地址。仅对于已启动的数据馈送，此信息与数据馈送启动所在的节点相关。
  - `node.ephemeral_id`、`ne`、`nodeEphemeralId`：节点的临时 ID。仅对于已启动的数据馈送，此信息与数据馈送启动所在的节点相关。
  - `node.id`、`ni`、`nodeId`：节点的唯一标识符。仅对于已启动的数据馈送，此信息与数据馈送启动所在的节点相关。
  - `node.name`、`nn`、`nodeName`：节点名称。仅对于已启动的数据馈送，此信息与数据馈送启动所在的节点相关。
  - `search.bucket_avg`、`sba`、`searchBucketAvg`：每个桶的平均搜索时间，以毫秒为单位。
  - `search.count`、`sc`、`searchCount`：（默认）数据馈送运行的搜索次数。
  - `search.exp_avg_hour`、`seah`、`searchExpAvgHour`：每小时的指数平均搜索时间，以毫秒为单位。
  - `search.time`、`st`、`searchTime`：数据馈送用于搜索的总时间，以毫秒为单位。
  - `state`、`s`：（默认）数据馈送的状态，可以是以下值之一：
    - `starting`：数据馈送已被请求启动但尚未启动。
    - `started`：数据馈送正在主动接收数据。
    - `stopping`：数据馈送已被请求优雅停止，正在完成其最终操作。
    - `stopped`：数据馈送已停止，在重新启动之前不会接收数据。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `time`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  用于显示时间值的单位。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 示例

```json
GET _cat/ml/datafeeds?v=true
```

API 返回以下响应：

```text
id                              state buckets.count search.count
datafeed-high_sum_total_sales stopped 743          7
datafeed-low_request_rate     stopped 1457         3
datafeed-response_code_rates  stopped 1460         18
datafeed-url_scanning         stopped 1460         18
```
