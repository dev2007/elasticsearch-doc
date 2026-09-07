# 停止数据源 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

停止一个或多个数据源。

## 请求

```bash
POST _ml/datafeeds/<feed_id>/_stop
```

```bash
POST _ml/datafeeds/<feed_id>,<feed_id>/_stop
```

```bash
POST _ml/datafeeds/_all/_stop
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

已停止的数据源不再从 Elasticsearch 检索数据。数据源在其生命周期中可以被多次启动和停止。

## 路径参数

- `<feed_id>`

  （必需，字符串）数据源的标识符。你可以通过使用逗号分隔的数据源列表或通配符表达式在单个 API 请求中停止多个数据源。你可以通过使用 `_all` 或将 `*` 指定为数据源标识符来停止所有数据源。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的数据源。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空数据源数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `force`

  （可选，布尔值）如果为 `true`，强制停止数据源。

- `timeout`

  （可选，时间值）指定等待数据源停止的时间。默认值为 20 秒。

## 请求体

你也可以在请求体中指定查询参数（如 `allow_no_match` 和 `force`）。

## 响应码

- 404（缺少资源）：如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源或只有部分匹配。

## 示例

```json
POST _ml/datafeeds/datafeed-low_request_rate/_stop
{
  "timeout": "30s"
}
```

数据源停止后，你收到以下结果：

```json
{
  "stopped": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-stop-datafeed.html)
