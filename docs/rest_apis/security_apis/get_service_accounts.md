# 获取服务账户 API

获取与提供的路径参数匹配的服务账户列表。

:::note 注意

目前，只有 `elastic/fleet-server` 服务账户可用。

:::

```txt
GET /_security/service
GET /_security/service/<namespace>
GET /_security/service/<namespace>/<service>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_service_account` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`namespace`

（必需，字符串）命名空间的名称。省略此参数以检索所有服务账户的信息。如果省略此参数，必须同时省略 `service` 参数。

`service`

（必需，字符串）服务名称。省略此参数以检索属于指定命名空间的所有服务账户的信息。

## 响应体

响应是一个以服务账户名称为键的对象，每个值包含：

`role_descriptor`

（必需，对象）服务账户的角色描述符，包含：

- `cluster`（必需，字符串数组）集群权限列表。这些定义了 API 密钥能够执行的集群级操作。
- `indices`（必需，对象数组）索引权限条目列表，每个条目包含：
  - `names`（必需，字符串数组）权限适用的索引（或索引名称模式）。
  - `privileges`（必需，字符串数组）角色所有者对指定索引具有的索引级权限。
  - `field_security`（对象）角色所有者具有读取权限的文档字段。
  - `query`（对象）定义可访问文档的搜索查询。
  - `allow_restricted_indices`（布尔值，默认 `false`）如果为 `true`，允许覆盖受限索引的通配符/正则表达式模式。隐式地，受限索引具有有限的权限，可能导致模式测试失败。如果在 `names` 中显式包含了受限索引，则无论此值如何，Elasticsearch 都会对它们检查权限。
- `remote_indices`（对象数组）远程集群的索引权限条目列表。属性：`clusters`、`field_security`、`names`、`privileges`（必需，字符串数组）、`query`、`allow_restricted_indices`。
- `remote_cluster`（对象数组）远程集群的集群权限条目列表（有限子集）。属性：`clusters`、`privileges`（必需，字符串数组；有效值为 `monitor_enrich` 或 `monitor_stats`）。
- `global`（对象）定义全局权限 — 一种请求感知形式的集群权限。包含 `data_source`（对象数组）：用于授予 ES|QL 数据源访问权限的数据源权限条目列表。
- `applications`（对象数组）应用程序权限条目列表：`application`（必需，字符串）、`privileges`（必需，字符串数组 — 权限或操作名称）、`resources`（必需，字符串数组）。
- `metadata`（可选，对象）可选元数据。以 `_` 开头的键保留供系统使用。
- `run_as`（字符串数组）API 密钥可以模拟的用户列表。注意：在 Elastic Cloud Serverless 中，run-as 已禁用；为 API 兼容性允许空的 `run_as` 字段，但非空列表会被拒绝。
- `description`（可选，字符串）角色描述符的可选描述。
- `restriction`（对象）角色描述符生效时的限制。包含 `workflows`（必需，字符串数组）— API 密钥受限制的工作流。注意：要使用角色限制，必须使用单个角色描述符创建 API 密钥。
- `transient_metadata`（对象）附加属性对象。

## 示例

以下示例获取 `elastic` 命名空间中 `fleet-server` 服务的信息：

```txt
GET /_security/service/elastic/fleet-server
```

响应示例：

```json
{
  "elastic/fleet-server": {
    "role_descriptor": {
      "cluster": [
        "monitor",
        "manage_own_api_key",
        "read_fleet_secrets"
      ],
      "indices": [
        {
          "names": [
            "logs-*",
            "metrics-*",
            "traces-*",
            ".logs-endpoint.diagnostic.collection-*",
            ".logs-endpoint.action.responses-*",
            ".logs-endpoint.heartbeat-*"
          ],
          "privileges": [ "write", "create_index", "auto_configure" ],
          "allow_restricted_indices": false
        },
        {
          "names": [ "profiling-*" ],
          "privileges": [ "read", "write" ],
          "allow_restricted_indices": false
        },
        {
          "names": [ "traces-apm.sampled-*" ],
          "privileges": [ "read", "monitor", "maintenance" ],
          "allow_restricted_indices": false
        },
        {
          "names": [ ".fleet-secrets*" ],
          "privileges": [ "read" ],
          "allow_restricted_indices": true
        },
        {
          "names": [ ".fleet-*" ],
          "privileges": [
            "read", "write", "monitor", "create_index", "auto_configure", "maintenance"
          ],
          "allow_restricted_indices": true
        },
        {
          "names": [ "synthetics-*" ],
          "privileges": [ "read", "write", "create_index", "auto_configure" ],
          "allow_restricted_indices": false
        }
      ],
      "applications": [
        {
          "application": "kibana-*",
          "privileges": [ "reserved_fleet-setup" ],
          "resources": [ "*" ]
        }
      ],
      "run_as": [],
      "metadata": {},
      "transient_metadata": {
        "enabled": true
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-service-accounts.html)
