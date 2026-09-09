# 停止数据帧分析作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习数据帧分析 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-dfa)。

:::::

停止一个或多个数据帧分析作业。

## 请求

```bash
POST _ml/data_frame/analytics/<data_frame_analytics_id>/_stop
```

```bash
POST _ml/data_frame/analytics/<data_frame_analytics_id>,<data_frame_analytics_id>/_stop
```

```bash
POST _ml/data_frame/analytics/_all/_stop
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

数据帧分析作业在其生命周期中可以被多次启动和停止。

你可以通过使用逗号分隔的数据帧分析作业列表或通配符表达式在单个 API 请求中停止多个数据帧分析作业。你可以通过使用 `_all` 或将 `*` 指定为 `<data_frame_analytics_id>` 来停止所有数据帧分析作业。

## 路径参数

- `<data_frame_analytics_id>`

  （必需，字符串）数据帧分析作业的标识符。此标识符可以包含小写字母数字字符（a-z 和 0-9）、短横线和下划线。必须以字母数字字符开头和结尾。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的数据帧分析作业。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空 `data_frame_analytics` 数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `force`

  （可选，布尔值）如果为 `true`，强制停止数据帧分析作业。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待数据帧分析作业停止的时间。默认为 20 秒。

## 示例

以下示例停止 `loganalytics` 数据帧分析作业：

```bash
POST _ml/data_frame/analytics/loganalytics/_stop
```

数据帧分析作业停止后，你收到以下结果：

```json
{
  "stopped" : true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/stop-dfanalytics.html)
