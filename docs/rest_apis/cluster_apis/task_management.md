# 任务管理 API

任务管理 API 是新功能，仍应被视为 beta 版本。该 API 可能会以不向后兼容的方式更改。有关功能状态，请参阅 [#51628](https://github.com/elastic/elasticsearch/issues/51628)。

:::info 新版 API 参考
有关最新的 API 详细信息，请参阅[任务管理 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-tasks)。
:::

返回集群中当前正在执行的任务信息。

## 请求

```bash
GET /_tasks/<task_id>
```

```bash
GET /_tasks
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

任务管理 API 返回集群中一个或多个节点上当前正在执行的任务信息。

## 路径参数

- `<task_id>`

  （可选，字符串）要返回的任务 ID（`node_id:task_number`）。

## 查询参数

- `actions`

  （可选，字符串）用于限制请求的操作的逗号分隔列表或通配符表达式。

  省略此参数将返回所有操作。

- `detailed`

  （可选，布尔值）如果为 `true`，响应包含分片恢复的详细信息。默认为 `false`。

- `group_by`

  （可选，字符串）用于在响应中对任务进行分组的键。

  可能的值为：

  - `nodes`

    （默认）节点 ID

  - `parents`

    父任务 ID

  - `none`

    不对任务分组。

- `nodes`

  （可选，字符串）用于限制返回信息的节点 ID 或名称的逗号分隔列表。

- `parent_task_id`

  （可选，字符串）用于限制返回信息的父任务 ID。

  要返回所有任务，请省略此参数或使用值 `-1`。

- `timeout`（[时间值](/rest_apis/api_convention/common_options#时间单位)）

  （可选）等待每个节点响应的时间。如果节点在其超时到期之前未响应，则响应不包含其信息。但是，超时的节点会包含在响应的 `node_failures` 属性中。默认为 `30s`。

- `wait_for_completion`

  （可选，布尔值）如果为 `true`，请求将阻塞直到所有找到的任务完成。默认为 `false`。

## 响应码

- `404`（缺少资源）

  如果指定了 `<task_id>` 但未找到，此代码表示没有与请求匹配的资源。

## 示例

```bash
# 检索集群中所有节点上当前运行的所有任务
GET /_tasks
# 检索节点 nodeId1 和 nodeId2 上运行的所有任务
GET /_tasks?nodes=nodeId1,nodeId2
# 检索节点 nodeId1 和 nodeId2 上运行的所有集群相关任务
GET /_tasks?nodes=nodeId1,nodeId2&actions=cluster:*
```

API 返回以下结果：

```json
{
  "nodes": {
    "oTUltX4IQMOUUVeiohTt8A": {
      "name": "H5dfFeA",
      "transport_address": "127.0.0.1:9300",
      "host": "127.0.0.1",
      "ip": "127.0.0.1:9300",
      "tasks": {
        "oTUltX4IQMOUUVeiohTt8A:124": {
          "node": "oTUltX4IQMOUUVeiohTt8A",
          "id": 124,
          "type": "direct",
          "action": "cluster:monitor/tasks/lists[n]",
          "start_time_in_millis": 1458585884904,
          "running_time_in_nanos": 47402,
          "cancellable": false,
          "parent_task_id": "oTUltX4IQMOUUVeiohTt8A:123"
        },
        "oTUltX4IQMOUUVeiohTt8A:123": {
          "node": "oTUltX4IQMOUUVeiohTt8A",
          "id": 123,
          "type": "transport",
          "action": "cluster:monitor/tasks/lists",
          "start_time_in_millis": 1458585884904,
          "running_time_in_nanos": 236042,
          "cancellable": false
        }
      }
    }
  }
}
```

### 检索特定任务的信息

也可以检索特定任务的信息。以下示例检索任务 `oTUltX4IQMOUUVeiohTt8A:124` 的信息：

```bash
GET /_tasks/oTUltX4IQMOUUVeiohTt8A:124
```

如果未找到任务，API 返回 404。

要检索特定任务的所有子任务：

```bash
GET /_tasks?parent_task_id=oTUltX4IQMOUUVeiohTt8A:123
```

如果未找到父任务，API 不会返回 404。

### 获取更多任务信息

还可以使用 `detailed` 请求参数获取有关运行任务的更多信息。这对于区分任务很有用，但执行成本更高。例如，使用 `detailed` 请求参数获取所有搜索：

```bash
GET /_tasks?actions=*search&detailed
```

API 返回以下结果：

```json
{
  "nodes": {
    "oTUltX4IQMOUUVeiohTt8A": {
      "name": "H5dfFeA",
      "transport_address": "127.0.0.1:9300",
      "host": "127.0.0.1",
      "ip": "127.0.0.1:9300",
      "tasks": {
        "oTUltX4IQMOUUVeiohTt8A:464": {
          "node": "oTUltX4IQMOUUVeiohTt8A",
          "id": 464,
          "type": "transport",
          "action": "indices:data/read/search",
          "description": "indices[test], types[test], search_type[QUERY_THEN_FETCH], source[{\"query\":...}]",
          "start_time_in_millis": 1483478610008,
          "running_time_in_nanos": 13991383,
          "cancellable": true,
          "cancelled": false
        }
      }
    }
  }
}
```

新的 `description` 字段包含可读文本，用于标识任务正在执行的特定请求，例如标识搜索任务正在执行的搜索请求（如上例所示）。其他类型的任务有不同的描述，例如 [`_reindex`](/rest_apis/document_apis/reindex) 包含源和目标，或 [`_bulk`](/rest_apis/document_apis/bulk) 仅包含请求数量和目标索引。许多请求只会有一个空描述，因为有关请求的更详细信息不容易获得，或者对于标识请求没有特别帮助。

::::note 提示
带有 `detailed` 的 `_tasks` 请求还可能返回 `status`。这是任务内部状态的报告。因此，其格式因任务而异。虽然我们尝试保持特定任务的 `status` 在版本之间一致，但这并不总是可能的，因为我们有时会更改实现。在这种情况下，我们可能会从特定请求的 `status` 中删除字段，因此你对状态所做的任何解析都可能在次要版本中中断。
::::

### 等待完成

任务 API 还可用于等待特定任务完成。以下调用将阻塞 10 秒，或直到 ID 为 `oTUltX4IQMOUUVeiohTt8A:12345` 的任务完成。

```bash
GET /_tasks/oTUltX4IQMOUUVeiohTt8A:12345?wait_for_completion=true&timeout=10s
```

也可以等待特定操作类型的所有任务完成。此命令将等待所有 `reindex` 任务完成：

```bash
GET /_tasks?actions=*reindex&wait_for_completion=true&timeout=10s
```

### 任务取消

如果长时间运行的任务支持取消，可以使用取消任务 API 取消。以下示例取消任务 `oTUltX4IQMOUUVeiohTt8A:12345`：

```bash
POST /_tasks/oTUltX4IQMOUUVeiohTt8A:12345/_cancel
```

任务取消命令支持与列出任务命令相同的任务选择参数，因此可以同时取消多个任务。例如，以下命令将取消在节点 `nodeId1` 和 `nodeId2` 上运行的所有 reindex 任务。

```bash
POST /_tasks/_cancel?nodes=nodeId1,nodeId2&actions=*reindex
```

::::note 提示
任务在被取消后可能还会继续运行一段时间，因为它可能无法立即安全地停止当前活动，或者因为 Elasticsearch 必须先完成其他任务的工作才能处理取消。列出任务 API 将继续列出这些已取消的任务，直到它们完成。列出任务 API 响应中的 `cancelled` 标志表示取消命令已被处理，任务将尽快停止。要排查已取消任务为何没有及时完成的问题，请使用带有 `?detailed` 参数的列出任务 API 来识别系统正在运行的其他任务，同时使用[节点热线程](/rest_apis/cluster_apis/nodes_hot_threads) API 获取系统正在执行的工作的详细信息，而不是完成已取消的任务。
::::

### 任务分组

任务 API 命令返回的任务列表可以使用 `group_by` 参数按节点（默认）或按父任务分组。以下命令将分组更改为按父任务：

```bash
GET /_tasks?group_by=parents
```

可以通过指定 `none` 作为 `group_by` 参数来禁用分组：

```bash
GET /_tasks?group_by=none
```

### 识别运行中的任务

`X-Opaque-Id` 请求头在 HTTP 请求头中提供时，也会作为响应头返回，并出现在任务信息的 `headers` 字段中。这允许跟踪某些调用，或将某些任务与启动它们的客户端关联起来：

```bash
curl -i -H "X-Opaque-Id: 123456" "http://localhost:9200/_tasks?group_by=parents"
```

API 返回以下结果：

```
HTTP/1.1 200 OK
X-Opaque-Id: 123456
content-type: application/json; charset=UTF-8
content-length: 831

{"tasks":{"u5lcZHqcQhu-rUoFaqDphA:45":{"node":"u5lcZHqcQhu-rUoFaqDphA","id":45,"type":"transport","action":"cluster:monitor/tasks/lists","start_time_in_millis":1513823752749,"running_time_in_nanos":293139,"cancellable":false,"headers":{"X-Opaque-Id":"123456"},"children":[{"node":"u5lcZHqcQhu-rUoFaqDphA","id":46,"type":"direct","action":"cluster:monitor/tasks/lists[n]","start_time_in_millis":1513823752750,"running_time_in_nanos":92133,"cancellable":false,"parent_task_id":"u5lcZHqcQhu-rUoFaqDphA:45","headers":{"X-Opaque-Id":"123456"}}]}}}
```

1. `X-Opaque-Id` 作为响应头返回
2. `X-Opaque-Id` 出现在由 REST 请求启动的任务信息中
3. REST 请求启动的任务的子任务也携带 `X-Opaque-Id`

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/tasks.html)
