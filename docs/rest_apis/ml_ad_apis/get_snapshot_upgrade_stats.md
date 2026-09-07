# 获取模型快照升级统计 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索异常检测作业模型快照升级的使用信息。

## 请求

```bash
GET _ml/anomaly_detectors/<job_id>/model_snapshots/<snapshot_id>/_upgrade/_stats
```

```bash
GET _ml/anomaly_detectors/<job_id>,<job_id>/model_snapshots/_all/_upgrade/_stats
```

```bash
GET _ml/anomaly_detectors/_all/model_snapshots/_all/_upgrade/_stats
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

异常检测作业模型快照升级是临时的。只有在调用此 API 时正在进行中的升级才会返回。

## 路径参数

- `<job_id>`

  （字符串）异常检测作业的标识符。可以是作业标识符、组名称或通配符表达式。

- `<snapshot_id>`

  （字符串）模型快照的标识符。

  你可以通过使用逗号分隔的快照 ID 列表在单个 API 请求中获取多个异常检测作业模型快照升级的统计信息。你也可以使用通配符表达式或 `_all`。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的作业。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空作业数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

## 响应体

API 返回异常检测作业模型快照升级状态对象数组。所有这些属性仅供参考，你无法更新它们的值。

- `assignment_explanation`

  （字符串）对于已启动的数据源，包含与选择运行升级任务的节点相关的消息。

- `job_id`

  （字符串）异常检测作业的标识符。

- `node`

  （对象）包含运行升级任务的节点的属性。此信息仅适用于已分配到节点的升级任务。

  `node` 的属性：

  - `attributes`（对象）列出节点属性，如 `ml.machine_memory` 或 `ml.max_open_jobs` 设置。
  - `ephemeral_id`（字符串）节点的临时 ID。
  - `id`（字符串）节点的唯一标识符。
  - `name`（字符串）节点名称。
  - `transport_address`（字符串）接受传输 HTTP 连接的主机和端口。

- `snapshot_id`

  （字符串）唯一标识模型快照的数字字符串。例如：`1575402236000`。

- `state`

  （字符串）升级任务的状态。可能值：

  - `loading_old_state`：正在加载旧的模型状态。
  - `saving_new_state`：正在保存新的模型状态。
  - `stopped`：升级已停止。
  - `failed`：升级失败。

## 响应码

- 404（缺少资源）：如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源或只有部分匹配。

## 示例

```bash
GET _ml/anomaly_detectors/low_request_rate/model_snapshots/_all/_upgrade/_stats
```

API 返回以下结果：

```json
{
  "count" : 1,
  "model_snapshot_upgrades" : [
    {
      "job_id" : "low_request_rate",
      "snapshot_id" : "1828371",
      "state" : "saving_new_state",
      "node" : {
        "id" : "7bmMXyWCRs-TuPfGJJ_yMw",
        "name" : "node-0",
        "ephemeral_id" : "hoXMLZB0RWKfR9UPPUCxXX",
        "transport_address" : "127.0.0.1:9300",
        "attributes" : {
          "ml.machine_memory" : "17179869184",
          "ml.max_open_jobs" : "512"
        }
      },
      "assignment_explanation" : ""
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-job-model-snapshot-upgrade-stats.html)
