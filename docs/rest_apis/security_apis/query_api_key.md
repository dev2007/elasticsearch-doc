# 查询 REST API 密钥 API

以分页方式检索使用创建 REST API 密钥 API 创建的 API 密钥的信息。

```txt
GET /_security/_query/api_key
POST /_security/_query/api_key
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_own_api_key` 或 `read_security` 集群权限。
- 如果仅具有 `manage_own_api_key` 权限，则只能检索你拥有的 API 密钥的信息。
- 如果具有 `read_security`、`manage_api_key` 或更大的权限（包括 `manage_security`），则无论所有权如何，都可以检索所有 API 密钥的信息。

## 查询参数

`with_limited_by`

（可选，布尔值）返回与 API 密钥关联的属主用户角色描述符的快照。API 密钥的实际权限是其分配的角色描述符与属主的角色描述符（即"受限"角色描述符）的交集。除非 API 密钥具有 `manage_api_key` 或更高的权限，否则它无法检索任何 API 密钥（包括其自身）的受限角色描述符。

`with_profile_uid`

（可选，布尔值）默认为 `false`。确定是否同时检索 API 密钥属主的用户档案 UID。如果存在，将在响应的 `profile_uid` 字段中返回。

`typed_keys`

（可选，布尔值）默认为 `false`。如果为 `true`，则聚合名称在响应中以其各自的类型作为前缀。

## 请求体

`query`

（可选，对象）用于筛选要返回的 API 密钥的查询。如果省略，等同于 `match_all`。支持的查询类型包括：`match_all`、`bool`、`term`、`terms`、`match`、`ids`、`prefix`、`wildcard`、`exists`、`range` 和 `simple_query_string`。

`aggs`

（可选，对象，别名 `aggregations`）在返回的 API 密钥语料库上运行的聚合。仅针对与查询匹配的密钥进行计算。支持的聚合类型包括：`terms`、`range`、`date_range`、`missing`、`cardinality`、`value_count`、`composite`、`filter` 和 `filters`。聚合仅支持与查询相同的字段子集。

`from`

（可选，整数）起始文档偏移量。非负值，默认为 `0`。默认情况下，无法通过 `from` 和 `size` 参数翻页超过 10,000 条命中，如需更多，请使用 `search_after`。

`size`

（可选，整数）要返回的命中数量。非负值，默认为 `10`。可以为 `0` — 此时返回的 API 密钥匹配为零个，仅返回聚合结果。同样适用上述 10,000 条命中的分页限制。

`sort`

（可选，对象）排序定义。API 密钥的所有公共字段都可排序，`id` 除外。也可以按 `_doc`（索引顺序）排序。

`search_after`

（可选，数组）用于深度分页的 search-after 定义。

:::note 注意

可查询的字符串值在内部被映射为 `keyword` 类型。在不带 `analyzer` 参数的情况下，`match` 查询字符串会被解释为单个关键字（等同于 `term` 查询）。

:::

### 可查询的字段

`id`

API 密钥 ID。必须使用 `ids` 查询进行查询。

`type`

API 密钥的类型：`rest`（通过创建 REST API 密钥 API 或授予 REST API 密钥 API 创建）或 `cross_cluster`（通过创建跨集群 REST API 密钥 API 创建）。

`name`

API 密钥的名称。

`creation`

创建时间（以毫秒为单位）。

`expiration`

过期时间（以毫秒为单位）；如果密钥永不过期则为 `null`。

`invalidated`

密钥是否已失效（`true` 表示已失效）。默认为 `false`。

`invalidation`

失效时间（以毫秒为单位）；仅为已失效的密钥设置。

`username`

API 密钥属主的用户名。

`realm`

API 密钥属主的 realm 名称。

`metadata`

元数据字段，例如 `metadata.my_field`。在内部被索引为 `flattened` 字段类型（对于查询和排序，所有字段的作用都类似于关键字）。不允许使用通配符模式，例如 `metadata.field*`。查询裸 `metadata` 字段会一起搜索所有元数据字段。

:::note 注意

不能查询 API 密钥的角色描述符。

:::

## 响应体

`total`

找到的 API 密钥总数。

`count`

响应中返回的 API 密钥数量。

`api_keys`

API 密钥信息对象列表，每个对象包含 `id`、`name`、`creation`、`expiration`、`invalidated`、`username`、`realm`、`realm_type`、`metadata`、`role_descriptors`，以及可选的 `limited_by` 和 `profile_uid`。使用排序时，结果中可能包含 `_sort` 数组。

:::note 注意

`role_descriptors` 是在创建时或最近一次更新时分配的角色描述符。有效权限是所分配权限与属主用户权限的时间点快照的交集。空的 `role_descriptors` 表示 API 密钥继承属主用户的权限。

:::

## 示例

以下示例检索所有 API 密钥的信息（需要 `manage_api_key` 权限）：

```txt
GET /_security/_query/api_key
```

API 返回以下响应：

```json
{
  "total": 3,
  "count": 3,
  "api_keys": [
    {
      "id": "nkvrGXsB8w290t56q3Rg",
      "name": "my-api-key-1",
      "creation": 1628227480421,
      "expiration": 1629091480421,
      "invalidated": false,
      "username": "elastic",
      "realm": "reserved",
      "realm_type": "reserved",
      "metadata": { "letter": "a" },
      "role_descriptors": {
        "role-a": {
          "cluster": [ "monitor" ],
          "indices": [
            {
              "names": [ "index-a" ],
              "privileges": [ "read" ],
              "allow_restricted_indices": false
            }
          ],
          "applications": [ ],
          "run_as": [ ],
          "metadata": { },
          "transient_metadata": { "enabled": true }
        }
      }
    },
    {
      "id": "oEvrGXsB8w290t5683TI",
      "name": "my-api-key-2",
      "creation": 1628227498953,
      "expiration": 1628313898953,
      "invalidated": false,
      "username": "elastic",
      "realm": "reserved",
      "metadata": { "letter": "b" },
      "role_descriptors": { }
    }
  ]
}
```

以下示例首先创建一个名为 `application-key-1` 的 API 密钥：

```txt
POST /_security/api_key
{
  "name" : "application-key-1",
  "metadata": {
    "application": "my-application"
  }
}
```

然后使用 `ids` 查询并配合 `with_limited_by=true` 查询参数按 ID 检索该密钥，响应中会包含 `limited_by` 快照：

```txt
GET /_security/_query/api_key?with_limited_by=true
{
  "query": {
    "ids": {
      "values": [ "VuaCfGcBCdbkQm-e5aOx" ]
    }
  }
}
```

以下示例使用 `term` 查询按名称检索 API 密钥：

```txt
GET /_security/_query/api_key
{
  "query": {
    "term": {
      "name": {
        "value": "application-key-1"
      }
    }
  }
}
```

以下示例使用复杂的 `bool` 查询并配合分页和排序：

```txt
GET /_security/_query/api_key
{
  "query": {
    "bool": {
      "must": [
        { "prefix": { "name": "app1-key-" } },
        { "term": { "invalidated": "false" } }
      ],
      "must_not": [
        { "term": { "name": "app1-key-01" } }
      ],
      "filter": [
        { "wildcard": { "username": "org-*-user" } },
        { "term": { "metadata.environment": "production" } }
      ]
    }
  },
  "from": 20,
  "size": 10,
  "sort": [
    { "creation": { "order": "desc", "format": "date_time" } },
    "name"
  ]
}
```

该查询返回满足以下条件的 API 密钥：名称以 `app1-key-` 开头且仍然有效，名称不是 `app1-key-01`，属主用户名匹配 `org-*-user`，并且 `metadata.environment` 为 `production`。`from: 20` 表示从零开始的偏移量，`size: 10` 表示页面大小，按 `creation` 降序、`name` 升序排序。响应中的每个命中项都包含一个 `_sort` 数组，其中包含这些排序值。

## 聚合示例

以下示例返回仍然有效且即将过期的 API 密钥，并按属主用户名分组：

```txt
POST /_security/_query/api_key
{
  "size": 0,
  "query": {
    "bool": {
      "must": {
        "term": {
          "invalidated": false
        }
      },
      "should": [
        {
          "range": {
            "expiration": {
              "gte": "now"
            }
          }
        },
        {
          "bool": {
            "must_not": {
              "exists": {
                "field": "expiration"
              }
            }
          }
        }
      ],
      "minimum_should_match": 1
    }
  },
  "aggs": {
    "keys_by_username": {
      "composite": {
        "sources": [
          {
            "usernames": {
              "terms": {
                "field": "username"
              }
            }
          }
        ]
      },
      "aggs": {
        "expires_soon": {
          "filter": {
            "range": {
              "expiration": {
                "lte": "now+30d/d"
              }
            }
          },
          "aggs": {
            "key_names": {
              "terms": {
                "field": "name"
              }
            }
          }
        }
      }
    }
  }
}
```

以下示例检索已失效（但尚未删除）的 API 密钥，并按属主用户名和密钥名称分组：

```txt
POST /_security/_query/api_key
{
  "size": 0,
  "query": {
    "bool": {
      "filter": {
        "term": {
          "invalidated": true
        }
      }
    }
  },
  "aggs": {
    "invalidated_keys": {
      "composite": {
        "sources": [
          {
            "username": {
              "terms": {
                "field": "username"
              }
            }
          },
          {
            "key_name": {
              "terms": {
                "field": "name"
              }
            }
          }
        ]
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-query-api-key.html)
