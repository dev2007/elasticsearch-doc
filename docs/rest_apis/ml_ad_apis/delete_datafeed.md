# 删除数据源 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

删除一个已存在的数据源。

## 请求

```bash
DELETE _ml/datafeeds/<feed_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。
- 除非使用 `force` 参数，否则必须先停止数据源才能删除。

## 路径参数

- `<feed_id>`

  （必需，字符串）唯一标识数据源的数字字符串。此标识符可以包含小写字母数字字符（a-z 和 0-9）、短横线和下划线。必须以字母数字字符开头和结尾。

## 查询参数

- `force`

  （可选，布尔值）用于强制删除已启动的数据源；此方法比停止再删除数据源更快。

## 示例

```bash
DELETE _ml/datafeeds/datafeed-total-requests
```

数据源删除后，你收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-delete-datafeed.html)
