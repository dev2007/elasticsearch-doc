# 获取日历 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索日历的配置信息。

## 请求

```bash
GET _ml/calendars/<calendar_id>
```

```bash
GET _ml/calendars/_all
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

有关更多信息，请参阅[日历和计划事件](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-calendars.html)。

## 路径参数

- `<calendar_id>`

  （必需，字符串）唯一标识日历的字符串。

  你可以通过使用逗号分隔的 ID 列表或通配符表达式在单个 API 请求中获取多个日历的信息。你可以通过使用 `_all`、将 `*` 指定为日历标识符，或省略标识符来获取所有日历的信息。

## 查询参数

- `from`

  （可选，整数）跳过指定数量的日历。此参数仅在省略 `<calendar_id>` 时支持。默认为 0。

- `size`

  （可选，整数）指定获取的日历的最大数量。此参数仅在省略 `<calendar_id>` 时支持。默认为 100。

## 请求体

- `page`

  （可选，对象）

  `page` 的属性：

  - `from`

    （可选，整数）跳过指定数量的日历。此对象仅在省略 `<calendar_id>` 时支持。默认为 0。

  - `size`

    （可选，整数）指定获取的日历的最大数量。此对象仅在省略 `<calendar_id>` 时支持。默认为 100。

## 响应体

API 返回日历资源数组，每个资源具有以下属性：

- `calendar_id`

  （字符串）唯一标识日历的字符串。

- `job_ids`

  （数组）异常检测作业标识符的数组。例如：`["total-requests"]`。

## 示例

```bash
GET _ml/calendars/planned-outages
```

API 返回以下结果：

```json
{
  "count": 1,
  "calendars": [
    {
      "calendar_id": "planned-outages",
      "job_ids": [
        "total-requests"
      ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-calendar.html)
