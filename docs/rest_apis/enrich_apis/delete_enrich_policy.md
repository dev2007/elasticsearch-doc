# 删除富化策略 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[富化 API](/rest_apis/enrich_apis/enrich_apis)。

::::

使用删除富化策略 API **删除现有富化策略及其富化索引**。

在删除之前，你必须先从任何使用中的接入管道中移除富化策略。你**不能**删除正在使用中的富化策略。

## 请求

```json
DELETE /_enrich/policy/<enrich-policy>
```

## 前置条件

要使用富化策略，你必须拥有：

- 任何使用的索引的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)
- 内置的 `enrich_user` 角色

## 路径参数

- `<enrich-policy>`（必需，字符串）

  要删除的富化策略。

## 示例

```json
DELETE /_enrich/policy/my-policy
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-enrich-policy-api.html)
