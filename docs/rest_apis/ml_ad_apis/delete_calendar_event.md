# 从日历删除计划事件 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

从日历中删除计划事件。

## 请求

```bash
DELETE _ml/calendars/<calendar_id>/events/<event_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

此 API 从日历中移除单个事件。要移除所有计划事件并删除日历，请参阅[删除日历 API](./delete_calendar)。

## 路径参数

- `<calendar_id>`

  （必需，字符串）唯一标识日历的字符串。

- `<event_id>`

  （必需，字符串）计划事件的标识符。你可以通过获取日历事件 API 获取此标识符。

## 示例

```bash
DELETE _ml/calendars/planned-outages/events/LS8LJGEBMTCMA-qz49st
```

事件移除后，你收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-delete-calendar-event.html)
