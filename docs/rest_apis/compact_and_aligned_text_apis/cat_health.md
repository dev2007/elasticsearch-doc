# cat 健康 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[集群健康 API](/rest_apis/cluster_apis/cluster_health)。

::::

返回集群的健康状态，类似于集群健康 API。

## 请求

```json
GET /_cat/health
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

你可以使用 cat 健康 API 获取集群的健康状态。

此 API 通常用于检查故障集群。为了帮助你将集群健康状况与日志文件和告警系统一起跟踪，API 以两种格式返回时间戳：

- `HH:MM:SS`，人类可读但不包含日期信息。
- Unix 纪元时间，机器可排序且包含日期信息。这对于跨越多天的集群恢复很有用。

你可以使用 cat 健康 API 验证多个节点间的集群健康状况。参见[跨节点示例](#跨节点示例)。

你还可以使用此 API 在较长时间内跟踪大型集群的恢复过程。参见[大型集群示例](#大型集群示例)。

## 查询参数

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `time`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  用于显示时间值的单位。

- `ts`（timestamps）（可选，布尔值）

  如果为 `true`，返回 `HH:MM:SS` 和 Unix 纪元时间戳。默认为 `true`。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 示例

### 带时间戳示例

默认情况下，cat 健康 API 返回 `HH:MM:SS` 和 Unix 纪元时间戳。例如：

```json
GET /_cat/health?v=true
```

API 返回以下响应：

```text
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign unassign.pri pending_tasks max_task_wait_time active_shards_percent
1475871424 16:17:04  elasticsearch green           1         1      1   1    0    0        0            0             0                  -                100.0%
```

### 不带时间戳示例

你可以使用 `ts`（timestamps）参数禁用时间戳。例如：

```json
GET /_cat/health?v=true&ts=false
```

API 返回以下响应：

```text
cluster       status node.total node.data shards pri relo init unassign unassign.pri pending_tasks max_task_wait_time active_shards_percent
elasticsearch green           1         1      1   1    0    0        0            0             0                  -                100.0%
```

:::note 注意
如果你的集群包含运行 8.16 以下版本的节点，报告的未分配主分片数量可能低于实际值。在这种情况下，如需获取更准确的计数，请使用[集群健康 API](/rest_apis/cluster_apis/cluster_health)。
:::

### 跨节点示例

你可以使用 cat 健康 API 验证集群在多个节点间的健康状况。例如：

```text
% pssh -i -h list.of.cluster.hosts curl -s localhost:9200/_cat/health
[1] 20:20:52 [SUCCESS] es3.vm
1384309218 18:20:18 foo green 3 3 3 3 0 0 0 0 0
[2] 20:20:52 [SUCCESS] es1.vm
1384309218 18:20:18 foo green 3 3 3 3 0 0 0 0 0
[3] 20:20:52 [SUCCESS] es2.vm
1384309218 18:20:18 foo green 3 3 3 3 0 0 0 0 0
```

### 大型集群示例

你可以使用 cat 健康 API 在较长时间内跟踪大型集群的恢复过程。你可以通过将 cat 健康 API 请求包含在一个延迟循环中来实现。例如：

```text
% while true; do curl localhost:9200/_cat/health; sleep 120; done
1384309446 18:24:06 foo red 3 3 20 20 0 0 1812 1121 0
1384309566 18:26:06 foo yellow 3 3 950 916 0 12 870 421 0
1384309686 18:28:06 foo yellow 3 3 1328 916 0 12 492 301 0
1384309806 18:30:06 foo green 3 3 1832 916 4 0 0 0
^C
```

在此示例中，恢复大约耗时六分钟，从 18:24:06 到 18:30:06。如果此恢复过程耗时数小时，你可以继续监控 UNASSIGNED 分片的数量，该数量应逐渐下降。如果 UNASSIGNED 分片数量保持不变，则表明集群恢复存在问题。


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-health.html)
