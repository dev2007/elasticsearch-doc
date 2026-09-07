# 删除模型快照 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

删除一个已存在的模型快照。

## 请求

```bash
DELETE _ml/anomaly_detectors/<job_id>/model_snapshots/<snapshot_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

你无法删除活动模型快照。要删除该快照，必须先回滚到其他快照。要识别活动模型快照，请参阅获取作业 API 结果中的 `model_snapshot_id`。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

- `<snapshot_id>`

  （必需，字符串）模型快照的标识符。

## 示例

```bash
DELETE _ml/anomaly_detectors/farequote/model_snapshots/1491948163
```

快照删除后，你收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-delete-snapshot.html)
