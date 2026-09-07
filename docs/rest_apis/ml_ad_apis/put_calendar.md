# 创建日历 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

实例化一个日历。

## 请求

```bash
PUT _ml/calendars/<calendar_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

有关更多信息，请参阅[日历和计划事件](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-calendars.html)。

## 路径参数

- `<calendar_id>`

  （必需，字符串）唯一标识日历的字符串。

## 请求体

- `description`

  （可选，字符串）日历的描述。

## 示例

以下示例创建名为 `planned-outages` 的日历：

```bash
PUT _ml/calendars/planned-outages
```

当日历创建后，你收到以下结果：

```json
{
  "calendar_id": "planned-outages",
  "job_ids": []
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-put-calendar.html)
