# 获取计划事件 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索日历中计划事件的信息。

## 请求

```bash
GET _ml/calendars/<calendar_id>/events
```

```bash
GET _ml/calendars/_all/events
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

有关更多信息，请参阅[日历和计划事件](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-calendars.html)。

## 路径参数

- `<calendar_id>`

  （必需，字符串）唯一标识日历的字符串。

  你可以通过使用逗号分隔的 ID 列表或通配符表达式在单个 API 请求中获取多个日历的计划事件信息。你可以通过使用 `_all` 或将 `*` 指定为日历标识符来获取所有日历的计划事件信息。

## 查询参数

- `end`

  （可选，字符串）返回时间戳早于此时间的计划事件。

- `from`

  （可选，整数）跳过指定数量的计划事件。默认为 0。

- `job_id`

  （可选，字符串）返回特定异常检测作业标识符或作业组的计划事件。必须与 `_all` 或 `*` 的日历标识符一起使用。

- `size`

  （可选，整数）指定获取的计划事件的最大数量。默认为 100。

- `start`

  （可选，字符串）返回时间戳晚于此时间的计划事件。

## 请求体

你也可以在请求体中指定查询参数；但 `from` 和 `size` 例外，请改用 `page`：

- `page`

  （可选，对象）

  `page` 的属性：

  - `from`

    （可选，整数）跳过指定数量的计划事件。默认为 0。

  - `size`

    （可选，整数）指定获取的计划事件的最大数量。默认为 100。

## 响应体

API 返回计划事件资源数组，每个资源具有以下属性：

- `calendar_id`

  （字符串）唯一标识日历的字符串。

- `description`

  （字符串）计划事件的描述。

- `end_time`

  （日期）计划事件结束的时间戳，以自纪元以来的毫秒数或 ISO 8601 格式表示。

- `event_id`

  （字符串）计划事件的自动生成标识符。

- `start_time`

  （日期）计划事件开始的时间戳，以自纪元以来的毫秒数或 ISO 8601 格式表示。

## 示例

```bash
GET _ml/calendars/planned-outages/events
```

API 返回以下结果：

```json
{
  "count": 3,
  "events": [
    {
      "description": "event 1",
      "start_time": 1513641600000,
      "end_time": 1513728000000,
      "calendar_id": "planned-outages",
      "event_id": "LS8LJGEBMTCMA-qz49st"
    },
    {
      "description": "event 2",
      "start_time": 1513814400000,
      "end_time": 1513900800000,
      "calendar_id": "planned-outages",
      "event_id": "Li8LJGEBMTCMA-qz49st"
    },
    {
      "description": "event 3",
      "start_time": 1514160000000,
      "end_time": 1514246400000,
      "calendar_id": "planned-outages",
      "event_id": "Ly8LJGEBMTCMA-qz49st"
    }
  ]
}
```

以下示例检索在特定时间段内发生的计划事件：

```bash
GET _ml/calendars/planned-outages/events?start=1635638400000&end=1635724800000
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-calendar-event.html)
