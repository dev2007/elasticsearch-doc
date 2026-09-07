# 升级模型快照 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

将异常检测模型快照升级到最新主要版本。

从 Elasticsearch 8.10.0 开始，使用新的版本号来跟踪机器学习插件中的配置和状态变更。此新版本号与产品版本解耦，将独立递增。

## 请求

```bash
POST _ml/anomaly_detectors/<job_id>/model_snapshots/<snapshot_id>/_upgrade
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。
- 升级的快照必须具有与上一个主要版本匹配的版本。
- 升级的快照不能是当前异常检测作业的快照。

## 描述

随着时间推移，旧快照格式会被弃用和移除。异常检测作业仅支持当前或上一个主要版本的快照。

此 API 提供了一种将快照升级到当前主要版本的方法。这有助于为集群升级到下一个主要版本做准备。

每个异常检测作业一次只能升级一个快照，且升级的快照不能是异常检测作业的当前快照。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

- `<snapshot_id>`

  （必需，字符串）模型快照的标识符。

## 查询参数

- `timeout`

  （可选，时间值）控制等待请求完成的时间。默认值为 30 分钟。

- `wait_for_completion`

  （可选，布尔值）如果为 `true`，API 在升级完成前不会响应。否则，升级任务分配到节点后立即响应。默认为 `false`。

## 响应体

- `node`

  （字符串）如果升级任务仍在运行，分配的节点 ID。

- `completed`

  （布尔值）如果为 `true`，表示任务已完成。如果为 `false`，任务仍在运行。

## 示例

```bash
POST _ml/anomaly_detectors/low_request_rate/model_snapshots/1828371/_upgrade?timeout=45m&wait_for_completion=true
```

快照升级开始后，你收到以下结果：

```json
{
  "completed" : false,
  "node" : "node-1"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-upgrade-job-model-snapshot.html)
