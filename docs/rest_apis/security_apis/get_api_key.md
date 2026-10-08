# 获取 API 密钥 API

检索一个或多个 API 密钥的信息。

:::note 注意

如果你只有 `manage_own_api_key` 权限，此 API 只返回你拥有的 API 密钥。如果你拥有 `read_security`、`manage_api_key` 或更高权限（包括 `manage_security`），则无论归属如何，此 API 会返回所有 API 密钥。

:::

```txt
GET /_security/api_key
```

## 前置条件

- 要使用此 API，你必须具有 `manage_own_api_key` 或 `read_security` [集群权限](../security_privileges/cluster_privileges)。

## 查询参数

`id`

（可选，字符串）API 密钥的 ID。**不能**与 `name`、`realm_name` 或 `username` 同时使用。

`name`

（可选，字符串）API 密钥的名称。**不能**与 `id`、`realm_name` 或 `username` 同时使用。支持使用通配符进行前缀搜索。

`owner`

（可选，布尔值）布尔标志，用于查询当前已验证用户拥有的 API 密钥。设为 `true` 时不能指定 `realm_name` 或 `username`（因为默认即为当前已验证用户的值）。默认为 `false`。

`realm_name`

（可选，字符串）身份验证 realm 的名称。**不能**与 `id` 或 `name` 同时使用，也不能在 `owner=true` 时使用。

`username`

（可选，字符串）用户的用户名。**不能**与 `id` 或 `name` 同时使用，也不能在 `owner=true` 时使用。

`active_only`

（可选，布尔值）只查询当前活跃的 API 密钥（既未被使失效也未过期）。可与 `owner`、`name` 等参数一起使用。设为 `false` 时，返回结果包含活跃与不活跃（过期或已失效）的密钥。默认为 `false`。

`with_limited_by`

（可选，布尔值）返回与该 API 密钥关联的属主用户角色描述符快照。API 密钥的实际权限是其被分配角色描述符与属主用户角色描述符的交集。默认为 `false`。

`with_profile_uid`

（可选，布尔值）是否同时返回 API 密钥属主 principal 的 profile uid（如果存在）。默认为 `false`。

## 响应体

`api_keys`

（必需，对象数组）API 密钥信息数组，每个元素包含：

- `id`（必需，字符串）API 密钥的 ID。

- `name`（必需，字符串）API 密钥的名称。

- `type`（必需，字符串）API 密钥类型（`rest` 或 `cross_cluster`）。

- `creation`（必需，数字）创建时间（毫秒时间戳）。

- `expiration`（可选，数字）过期时间（毫秒时间戳），可为空。

- `invalidated`（必需，布尔值）是否已失效。已失效为 `true`，否则为 `false`。

- `invalidation`（可选，数字）若已失效，失效时间（毫秒时间戳）。

- `username`（必需，字符串）创建此 API 密钥的 principal（用户名）。

- `realm`（必需，字符串）创建此密钥的 principal 所在 realm 名称。

- `realm_type`（可选，字符串）创建此密钥的 principal 的 realm 类型。

- `metadata`（必需，对象）API 密钥的元数据。

- `role_descriptors`（可选，对象）创建或最后更新时分配给此密钥的角色描述符。**空角色描述符表示该密钥继承属主用户的权限**。其子属性与[创建 API 密钥 API](./create_api_key) 中的 `role_descriptors` 相同（`cluster`、`indices`、`remote_indices`、`remote_cluster`、`global`、`applications`、`metadata`、`run_as`、`description`、`restriction`、`transient_metadata`）。

- `limited_by`（可选，对象数组）该密钥关联的属主用户权限快照（创建时及后续更新时捕获的时间点快照）。**密钥的有效权限 = 被分配权限 ∩ 属主用户权限**。

- `access`（可选，对象）跨集群 API 密钥被授予的访问权限，包含 `replication`（跨集群复制的索引权限条目）和/或 `search`（跨集群搜索的索引权限条目）。指定时完全替换此前分配的访问权限。

- `certificate_identity`（可选，字符串）跨集群 API 密钥关联的证书身份。限制密钥只能用于由特定 TLS 证书认证的连接。仅适用于跨集群 API 密钥。

- `profile_uid`（可选，字符串）若请求且存在，API 密钥属主 principal 的 profile uid。

- `_sort`（可选，数组）使用[查询 API 密钥 API](./query_api_key) 的 `sort` 参数时的排序值。

## 示例

以下示例按 ID 获取密钥并包含权限限制信息：

```txt
GET /_security/api_key?id=VuaCfGcBCdbkQm-e5aOx&with_limited_by=true
```

响应示例：

```json
{
  "api_keys": [
    {
      "id": "VuaCfGcBCdbkQm-e5aOx",
      "name": "my-api-key",
      "creation": 1548550550158,
      "expiration": 1548551550158,
      "invalidated": false,
      "username": "myuser",
      "realm": "native1",
      "realm_type": "native",
      "metadata": {
        "application": "myapp"
      },
      "role_descriptors": { },
      "limited_by": [
        {
          "role-power-user": {
            "cluster": [ "monitor" ],
            "indices": [
              {
                "names": [ "*" ],
                "privileges": [ "read" ],
                "allow_restricted_indices": false
              }
            ],
            "applications": [ ],
            "run_as": [ ],
            "metadata": { },
            "transient_metadata": {
              "enabled": true
            }
          }
        }
      ]
    }
  ]
}
```

以下示例获取某用户在某 realm 下的所有密钥：

```txt
GET /_security/api_key?username=myuser&realm_name=native1
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-api-key.html)
