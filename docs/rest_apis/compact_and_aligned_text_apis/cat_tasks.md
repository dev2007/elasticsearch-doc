# cat 任务管理 API

:::warning 警告
cat 任务管理 API 是新功能，仍应被视为测试版（beta）。API 可能会以不向后兼容的方式更改。有关功能状态，请参见 [#51628](https://github.com/elastic/elasticsearch/issues/51628)。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[任务管理 API](/rest_apis/cluster_apis/task_management)。

::::

返回集群中当前正在执行的任务信息，类似于任务管理 API。

## 请求

```json
GET /_cat/tasks
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

cat 任务管理 API 返回集群中一个或多个节点上当前正在执行的任务信息。它是 JSON 任务管理 API 的更紧凑视图。

## 查询参数

- `detailed`（可选，布尔值）

  如果为 `true`，响应将包含分片恢复的详细信息。默认为 `false`。

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `nodes`（可选，字符串）

  用于限制响应的节点 ID 或名称的逗号分隔列表。支持通配符（`*`）表达式。

- `parent_task_id`（可选，字符串）

  用于限制响应的父任务 ID。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `time`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  用于显示时间值的单位。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 响应码

- `404`（缺少资源）：如果指定了 `<task_id>` 但未找到，此代码表示没有匹配请求的资源。

## 示例

```json
GET _cat/tasks?v=true
```

API 返回以下响应：

```text
action                         task_id                    parent_task_id             type      start_time    timestamp running_time ip             node
cluster:monitor/tasks/lists[n] oTUltX4IQMOUUVeiohTt8A:124 oTUltX4IQMOUUVeiohTt8A:123 direct    1458585884904 01:48:24  44.1micros   127.0.0.1:9300 oTUltX4IQMOUUVeiohTt8A
cluster:monitor/tasks/lists    oTUltX4IQMOUUVeiohTt8A:123 -                          transport 1458585884904 01:48:24  186.2micros  127.0.0.1:9300 oTUltX4IQMOUUVeiohTt8A
```
