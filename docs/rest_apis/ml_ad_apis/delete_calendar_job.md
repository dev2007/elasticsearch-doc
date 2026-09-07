# 从日历删除异常检测作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

从日历中删除异常检测作业。

## 请求

```bash
DELETE _ml/calendars/<calendar_id>/jobs/<job_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 路径参数

- `<calendar_id>`

  （必需，字符串）唯一标识日历的字符串。

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。可以是作业标识符、组名称，或作业或组的逗号分隔列表。

## 示例

```bash
DELETE _ml/calendars/planned-outages/jobs/total-requests
```

作业从日历中移除后，你收到以下结果：

```json
{
  "calendar_id": "planned-outages",
  "job_ids": []
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-delete-calendar-job.html)
