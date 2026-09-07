# 删除过期数据 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

删除过期和未使用的机器学习数据。

## 请求

```bash
DELETE _ml/_delete_expired_data
```

```bash
DELETE _ml/_delete_expired_data/<job_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

删除所有超过保留期限的作业结果、模型快照和预测数据。同时删除不与任何作业关联的机器学习状态文档。

你可以通过使用作业标识符、组名称、逗号分隔的作业列表或通配符表达式将请求限制为单个或一组异常检测作业。可以使用 `_all`、将 `*` 指定为 `<job_id>` 或省略 `<job_id>` 来删除所有异常检测作业的过期数据。

## 路径参数

- `<job_id>`

  （可选，字符串）异常检测作业的标识符。可以是作业标识符、组名称或通配符表达式。

## 查询参数

- `requests_per_second`

  （可选，浮点数）删除过程的期望每秒请求数。默认行为为不限制。

- `timeout`

  （可选，字符串）底层删除进程在被取消前可以运行的时间。默认值为 8h（8 小时）。

## 请求体

你也可以在请求体中指定查询参数（`requests_per_second` 和 `timeout`）。

## 示例

```bash
DELETE _ml/_delete_expired_data?timeout=1h
```

过期数据删除后，你收到以下结果：

```json
{
  "deleted": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-delete-expired-data.html)
