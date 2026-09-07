# 删除异常检测作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

删除一个已存在的异常检测作业。

## 请求

```bash
DELETE _ml/anomaly_detectors/<job_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。
- 删除作业之前必须先关闭作业（除非指定 `force` 参数）。请参阅[关闭异常检测作业 API](./close_job)。

## 描述

所有作业配置、模型状态和结果都将被删除。

删除异常检测作业必须仅通过此 API 完成。不要使用 Elasticsearch 删除文档 API 直接从 `.ml-*` 索引删除作业。当启用了 Elasticsearch 安全功能时，确保没有人获得 `.ml-*` 索引的写入权限。

目前无法使用通配符或逗号分隔列表删除多个作业。

如果删除的作业关联了数据源，请求会先尝试删除数据源。此行为等效于使用与删除作业请求相同的 `timeout` 和 `force` 参数调用删除数据源 API。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

## 查询参数

- `force`

  （可选，布尔值）用于强制删除已打开的作业；此方法比先关闭再删除作业更快。

- `wait_for_completion`

  （可选，布尔值）指定请求是立即返回还是等待作业删除完成。默认为 `true`。

- `delete_user_annotations`

  （可选，布尔值）指定在作业重置时是否连同自动生成的注释一起删除用户添加的注释。默认为 `false`。

## 示例

```bash
DELETE _ml/anomaly_detectors/total-requests
```

作业删除后，你收到以下结果：

```json
{
  "acknowledged": true
}
```

以下示例异步删除 `total-requests` 作业：

```bash
DELETE _ml/anomaly_detectors/total-requests?wait_for_completion=false
```

当 `wait_for_completion` 设置为 `false` 时，响应包含作业删除任务的 ID：

```json
{
  "task": "oTUltX4IQMOUUVeiohTt8A:39"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-delete-job.html)
