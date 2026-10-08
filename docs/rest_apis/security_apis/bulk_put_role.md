# 批量创建或更新角色 API

角色管理 API 通常是管理角色的首选方式，而不是使用基于文件的角色管理。批量创建或更新角色 API **不能更新角色文件中定义的角色**。

```txt
POST /_security/role
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 查询参数

`refresh`

（可选，字符串）如果为 `true`（默认），刷新受影响的分片以使操作对搜索可见；如果为 `wait_for`，等待刷新；如果为 `false`，不进行任何刷新操作。有效值为：`true`、`false`、`wait_for`。

## 请求体

`roles`

（必需，对象）要添加或更新的角色名称 → 角色描述符对象的字典。每个角色对象包含以下属性：

- `cluster`（字符串数组）定义集群级操作的集群权限列表。

- `indices`（对象数组）索引权限条目列表：

  - `names`（必需，字符串或字符串数组）权限适用的索引或索引名称模式。
  - `privileges`（必需，字符串数组）指定索引上的索引级权限。
  - `field_security`（对象）角色所有者可以读取的文档字段。
  - `query`（字符串或对象）定义哪些文档可访问的查询 DSL 搜索查询（文档级安全性）。
  - `allow_restricted_indices`（布尔值）如果使用覆盖受限索引的通配符或正则表达式模式，则设置为 `true`。默认为 `false`。

- `remote_indices`（对象数组，在 8.14.0 中加入）远程集群的索引权限。条目结构与 `indices` 相同，额外包含：

  - `clusters`（必需，字符串或字符串数组）权限适用的集群别名。

- `remote_cluster`（对象数组，在 8.15.0 中加入）远程集群的集群权限（仅限有限子集）：

  - `clusters`（必需，字符串或字符串数组）集群别名。
  - `privileges`（必需，字符串数组）有效值为 `monitor_enrich` 或 `monitor_stats`。

- `global`（对象）请求感知的全局（集群）权限。包含 `application`（对象）和 `data_source`（对象数组）— ES|QL 数据源权限，包含 `names` 和 `privileges`（`create`、`delete`、`read_metadata`、`read`、`manage`）。

- `applications`（对象数组）应用程序权限条目：

  - `application`（必需，字符串）应用程序的名称。
  - `privileges`（必需，字符串数组）应用程序权限或操作。
  - `resources`（必需，字符串数组）应用权限的资源。

- `metadata`（对象）可选元数据。以 `_` 开头的键保留供系统使用。

- `run_as`（字符串数组）可以模拟的用户。

- `description`（字符串）可选的角色描述。

- `restriction`（对象）角色描述符生效时的限制。包含 `workflows`（必需，字符串数组）。注意：要求使用单个角色描述符创建的 API 密钥。

- `transient_metadata`（对象）附加属性对象。

## 响应体

`created`

（字符串数组）已创建的角色数组。

`updated`

（字符串数组）已更新的角色数组。

`noop`

（字符串数组）没有任何更改的角色名称数组。

`errors`

（对象）仅在有任何更新失败时出现；包含 `count`（必需，数字）和 `details`（必需，以角色名称为键的对象）。每个错误对象包含 `type`（必需，字符串）、`reason`（字符串或 null）、`caused_by`、`root_cause`（对象数组）、`suppressed`（对象数组）。

## 示例

以下示例批量创建两个角色：

```json
POST /_security/role
{
  "roles": {
    "my_admin_role": {
      "cluster": [ "all" ],
      "indices": [
        {
          "names": [ "index1", "index2" ],
          "privileges": [ "all" ],
          "field_security": { "grant": [ "title", "body" ] },
          "query": "{\"match\": {\"title\": \"foo\"}}"
        }
      ],
      "applications": [
        {
          "application": "myapp",
          "privileges": [ "admin", "read" ],
          "resources": [ "*" ]
        }
      ],
      "run_as": [ "other_user" ],
      "metadata": { "version": 1 }
    },
    "my_user_role": {
      "cluster": [ "all" ],
      "indices": [
        {
          "names": [ "index1" ],
          "privileges": [ "read" ],
          "field_security": { "grant": [ "title", "body" ] },
          "query": "{\"match\": {\"title\": \"foo\"}}"
        }
      ],
      "applications": [
        {
          "application": "myapp",
          "privileges": [ "admin", "read" ],
          "resources": [ "*" ]
        }
      ],
      "run_as": [ "other_user" ],
      "metadata": { "version": 1 }
    }
  }
}
```

成功响应：

```json
{
  "created": [ "my_admin_role", "my_user_role" ]
}
```

错误按角色单独处理，因此 API 允许**部分成功**。例如，包含无效 `bad_cluster_privilege` 的请求只会使 `my_admin_role` 失败，而 `my_user_role` 成功：

```json
{
  "created": [ "my_user_role" ],
  "errors": {
    "count": 1,
    "details": {
      "my_admin_role": {
        "type": "action_request_validation_exception",
        "reason": "Validation Failed: 1: unknown cluster privilege [bad_cluster_privilege]..."
      }
    }
  }
}
```

错误响应会列出所有有效的预定义集群权限名称（例如 `manage_own_api_key`、`monitor`、`manage`、`all`、`manage_security` 等）或可用集群操作之上的模式。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-bulk-put-role.html)
