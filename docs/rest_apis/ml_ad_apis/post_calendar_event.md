# 向日历添加计划事件 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

向日历添加计划事件。

## 请求

```bash
POST _ml/calendars/<calendar_id>/events
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

此 API 接受计划事件列表，每个事件必须包含开始时间、结束时间和描述。

## 路径参数

- `<calendar_id>`

  （必需，字符串）唯一标识日历的字符串。

## 请求体

- `events`

  （必需，数组）一个或多个计划事件的列表。事件的开始和结束时间可以指定为自纪元以来的整数毫秒数，或采用 ISO 8601 格式的字符串。

  `events` 的属性：

  - `description`

    （可选，字符串）计划事件的描述。

  - `end_time`

    （必需，日期）计划事件结束的时间戳，以自纪元以来的毫秒数或 ISO 8601 格式表示。

  - `start_time`

    （必需，日期）计划事件开始的时间戳，以自纪元以来的毫秒数或 ISO 8601 格式表示。

## 示例

```json
POST _ml/calendars/planned-outages/events
{
  "events" : [
    {"description": "event 1", "start_time": 1513641600000, "end_time": 1513728000000},
    {"description": "event 2", "start_time": 1513814400000, "end_time": 1513900800000},
    {"description": "event 3", "start_time": 1514160000000, "end_time": 1514246400000}
  ]
}
```

API 返回以下结果：

```json
{
  "events": [
    {
      "description": "event 1",
      "start_time": 1513641600000,
      "end_time": 1513728000000,
      "calendar_id": "planned-outages"
    },
    {
      "description": "event 2",
      "start_time": 1513814400000,
      "end_time": 1513900800000,
      "calendar_id": "planned-outages"
    },
    {
      "description": "event 3",
      "start_time": 1514160000000,
      "end_time": 1514246400000,
      "calendar_id": "planned-outages"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-post-calendar-event.html)
