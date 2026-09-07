# 创建过滤器 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

实例化一个过滤器。

## 请求

```bash
PUT _ml/filters/<filter_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

过滤器包含一个字符串列表。它可以被一个或多个作业使用。具体来说，过滤器在检测器配置对象的 `custom_rules` 属性中引用。有关更多信息，请参阅[自定义规则](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-custom-rules.html)。

## 路径参数

- `<filter_id>`

  （必需，字符串）唯一标识过滤器的字符串。

## 请求体

- `description`

  （可选，字符串）过滤器的描述。

- `items`

  （必需，字符串数组）过滤器的条目。可以在条目的开头或结尾使用通配符 `*`。每个过滤器最多允许 10000 个条目。

## 示例

```json
PUT _ml/filters/safe_domains
{
  "description": "A list of safe domains",
  "items": ["*.google.com", "wikipedia.org"]
}
```

过滤器创建后，你收到以下结果：

```json
{
  "filter_id": "safe_domains",
  "description": "A list of safe domains",
  "items": ["*.google.com", "wikipedia.org"]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-put-filter.html)
