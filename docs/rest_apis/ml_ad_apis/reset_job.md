# 重置异常检测作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

重置一个已存在的异常检测作业。

## 请求

```bash
POST _ml/anomaly_detectors/<job_id>/_reset
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。
- 重置作业之前必须先关闭作业。关闭作业时可以设置 `force` 为 `true` 以避免等待作业完成。请参阅[关闭异常检测作业 API](./close_job)。

## 描述

所有模型状态和结果都将被删除。作业准备好重新开始，就像刚创建一样。

目前无法使用通配符或逗号分隔列表重置多个作业。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

## 查询参数

- `wait_for_completion`

  （可选，布尔值）指定请求是立即返回还是等待作业重置完成。默认为 `true`。

- `delete_user_annotations`

  （可选，布尔值）指定在作业重置时是否连同自动生成的注释一起删除用户添加的注释。默认为 `false`。

## 示例

```bash
POST _ml/anomaly_detectors/total-requests/_reset
```

作业重置后，你收到以下结果：

```json
{
  "acknowledged": true
}
```

以下示例异步重置 `total-requests` 作业：

```bash
POST _ml/anomaly_detectors/total-requests/_reset?wait_for_completion=false
```

当 `wait_for_completion` 设置为 `false` 时，响应包含作业重置任务的 ID：

```json
{
  "task": "oTUltX4IQMOUUVeiohTt8A:39"
}
```

如果要检查重置任务的状态，请使用任务管理 API 并引用任务 ID。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-reset-job.html)
