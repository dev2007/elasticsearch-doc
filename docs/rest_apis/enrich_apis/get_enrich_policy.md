# 获取富化策略 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[富化 API](/rest_apis/enrich_apis/enrich_apis)。

::::

返回有关富化策略的信息。

## 请求

```json
GET /_enrich/policy/<name>
```

```json
GET /_enrich/policy
```

```json
GET /_enrich/policy/policy1,policy2
```

## 前置条件

要使用富化策略，你必须拥有：

- 任何使用的索引的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)
- 内置的 `enrich_user` 角色

## 路径参数

- `<name>`（可选，字符串）

  用于限制请求的富化策略名称的逗号分隔列表。要返回所有富化策略的信息，请省略此参数。

## 示例

### 获取单个策略

```json
GET /_enrich/policy/my-policy
```

API 返回以下结果：

```json
{
  "policies": [
    {
      "config": {
        "match": {
          "name": "my-policy",
          "indices": [ "users" ],
          "match_field": "email",
          "enrich_fields": [
            "first_name",
            "last_name",
            "city",
            "zip",
            "state"
          ]
        }
      }
    }
  ]
}
```

### 获取多个策略

```json
GET /_enrich/policy/my-policy,other-policy
```

API 返回以下结果：

```json
{
  "policies": [
    {
      "config": {
        "match": {
          "name": "my-policy",
          "indices": [ "users" ],
          "match_field": "email",
          "enrich_fields": [
            "first_name",
            "last_name",
            "city",
            "zip",
            "state"
          ]
        }
      }
    },
    {
      "config": {
        "match": {
          "name": "other-policy",
          "indices": [ "users" ],
          "match_field": "email",
          "enrich_fields": [
            "first_name",
            "last_name",
            "city",
            "zip",
            "state"
          ]
        }
      }
    }
  ]
}
```

### 获取所有策略

```json
GET /_enrich/policy
```

API 返回以下结果：

```json
{
  "policies": [
    {
      "config": {
        "match": {
          "name": "my-policy",
          "indices": [ "users" ],
          "match_field": "email",
          "enrich_fields": [
            "first_name",
            "last_name",
            "city",
            "zip",
            "state"
          ]
        }
      }
    },
    {
      "config": {
        "match": {
          "name": "other-policy",
          "indices": [ "users" ],
          "match_field": "email",
          "enrich_fields": [
            "first_name",
            "last_name",
            "city",
            "zip",
            "state"
          ]
        }
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-enrich-policy-api.html)
