# 更新过滤器 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

更新过滤器的描述、添加条目或移除条目。

## 请求

```bash
POST _ml/filters/<filter_id>/_update
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 路径参数

- `<filter_id>`

  （必需，字符串）唯一标识过滤器的字符串。

## 请求体

- `add_items`

  （可选，字符串数组）要添加到过滤器的条目。

- `description`

  （可选，字符串）过滤器的描述。

- `remove_items`

  （可选，字符串数组）要从过滤器中移除的条目。

## 示例

```json
POST _ml/filters/safe_domains/_update
{
  "description": "Updated list of domains",
  "add_items": ["*.myorg.com"],
  "remove_items": ["wikipedia.org"]
}
```

API 返回以下结果：

```json
{
  "filter_id": "safe_domains",
  "description": "Updated list of domains",
  "items": ["*.google.com", "*.myorg.com"]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-update-filter.html)
