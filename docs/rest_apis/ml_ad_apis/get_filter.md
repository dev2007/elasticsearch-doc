# 获取过滤器 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索过滤器。

## 请求

```bash
GET _ml/filters/<filter_id>
```

```bash
GET _ml/filters/
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

你可以获取单个过滤器或所有过滤器。有关更多信息，请参阅[自定义规则](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-custom-rules.html)。

## 路径参数

- `<filter_id>`

  （可选，字符串）唯一标识过滤器的字符串。

## 查询参数

- `from`

  （可选，整数）跳过指定数量的过滤器。默认为 0。

- `size`

  （可选，整数）指定获取的过滤器的最大数量。默认为 100。

## 响应体

API 返回过滤器资源数组，每个资源具有以下属性：

- `description`

  （字符串）过滤器的描述。

- `filter_id`

  （字符串）唯一标识过滤器的字符串。

- `items`

  （字符串数组）过滤器条目列表的字符串数组。

## 示例

```bash
GET _ml/filters/safe_domains
```

API 返回以下结果：

```json
{
  "count": 1,
  "filters": [
    {
      "filter_id": "safe_domains",
      "description": "A list of safe domains",
      "items": [
        "*.google.com",
        "wikipedia.org"
      ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-filter.html)
