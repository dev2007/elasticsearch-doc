# 创建富化策略 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[富化 API](/rest_apis/enrich_apis/enrich_apis)。

::::

使用创建富化策略 API 创建富化策略。创建后，你**不能**更新或更改富化策略。相反，你必须：

1. 创建并[执行](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/execute-enrich-policy-api.html)一个新的富化策略。
2. 在任何使用中的富化处理器或 ES|QL 查询中，用新的富化策略替换之前的富化策略。
3. 使用[删除富化策略](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-enrich-policy-api.html) API 或 Kibana 中的索引管理来删除之前的富化策略。

## 请求

```json
PUT /_enrich/policy/<enrich-policy>
```

## 前置条件

要使用富化策略，你必须拥有：

- 任何使用的索引的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)
- 内置的 `enrich_user` 角色

## 路径参数

- `<enrich-policy>`（必需，字符串）

  要创建或更新的富化策略的名称。

## 请求体

- `<policy-type>`（必需，对象）

  配置富化策略。字段键是富化策略类型。有效的键值为：

  - `geo_match`：基于 `geo_shape` 查询将富化数据与传入文档匹配。
  - `match`：基于 `term` 查询将富化数据与传入文档匹配。
  - `range`：基于 `term` 查询将传入文档中的数字、日期或 IP 地址与富化索引中的范围匹配。

  `<policy-type>` 的属性：

  - `indices`（必需，字符串或字符串数组）

    用于创建富化索引的一个或多个源索引。如果指定多个索引，它们必须共享一个公共的 `match_field`。

  - `match_field`（必需，字符串）

    源索引中用于匹配传入文档的字段。

  - `enrich_fields`（必需，字符串数组）

    要添加到匹配的传入文档中的字段。这些字段必须存在于源索引中。

  - `query`（可选，查询 DSL 查询对象）

    用于过滤富化索引中文档的查询。策略仅使用匹配此查询的文档来富化传入文档。默认为 `match_all` 查询。

## 示例

```json
PUT /_enrich/policy/my-policy
{
  "match": {
    "indices": "users",
    "match_field": "email",
    "enrich_fields": ["first_name", "last_name", "city", "zip", "state"]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-enrich-policy-api.html)
