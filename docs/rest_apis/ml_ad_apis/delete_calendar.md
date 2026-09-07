# 删除日历 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

删除一个日历。

## 请求

```bash
DELETE _ml/calendars/<calendar_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

此 API 先移除日历中的所有计划事件，然后删除日历。

## 路径参数

- `<calendar_id>`

  （必需，字符串）唯一标识日历的字符串。

## 示例

```bash
DELETE _ml/calendars/planned-outages
```

日历删除后，你收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-delete-calendar.html)
