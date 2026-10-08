# 创建或更新角色 API

在本机 realm 中添加和更新角色。角色管理 API 通常是管理角色的首选方式，而不是使用基于文件的角色管理。**注意：**此 API 不能更新角色文件中定义的角色。

```txt
POST /_security/role/<name>
PUT /_security/role/<name>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<name>`

（必需，字符串）角色的名称。

## 请求体

`applications`

（列表）应用程序权限条目列表：

- `application`（必需，字符串）此条目适用的应用程序的名称。
- `privileges`（列表）字符串列表，每项为应用程序权限或操作。
- `resources`（列表）应用权限的资源列表。

`cluster`

（列表）定义具有此角色的用户可执行的集群级操作的集群权限列表。

`description`

（字符串）角色的描述。最大长度：1000 个字符。

`global`

（对象）定义全局权限的对象 — 一种请求感知形式的集群权限。目前仅限于应用程序权限的管理。可选。

`indices`

（列表）索引权限条目列表：

- `field_security`（对象）角色具有读取权限的文档字段（请参阅[设置字段和文档级安全性](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/field-and-document-level-security.html)）。
- `names`（必需，列表）权限适用的索引（或索引名称模式）。
- `privileges`（必需，列表）角色对指定索引具有的索引级权限。
- `query`（对象）定义哪些文档可读的搜索查询（文档必须匹配此查询）。

`metadata`

（对象）可选元数据。以 `_` 开头的键保留供系统使用。

`run_as`

（列表）角色所有者可以模拟的用户列表（请参阅[代表其他用户提交请求](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/run-as-privilege.html)）。

`remote_indices`

（列表）远程索引权限条目列表。*仅对使用基于 API 密钥模型配置的远程集群有效；对基于证书的模型无效。*

- `clusters`（必需，列表）权限适用的集群别名。
- `field_security`（对象）角色具有读取权限的文档字段。
- `names`（必需，列表）权限适用的远程集群上的索引（或模式）。
- `privileges`（必需，列表）指定索引上的索引级权限。
- `query`（对象）定义可读文档的搜索查询。

`remote_cluster`

（列表）远程集群权限条目列表。*与 `remote_indices` 相同的 API 密钥模型限制。*

- `clusters`（必需，列表）权限适用的集群别名。
- `privileges`（必需，列表）指定集群中的集群级权限。**注意：**远程集群仅支持一部分集群权限；内置权限 API 可以确定每个版本允许哪些权限。

## 示例

以下示例创建 `my_admin_role` 角色：

```json
POST /_security/role/my_admin_role
{
  "description": "Grants full access to all management features within the cluster.",
  "cluster": [ "all" ],
  "indices": [
    {
      "names": [ "index1", "index2" ],
      "privileges": [ "all" ],
      "field_security" : {
        "grant" : [ "title", "body" ]
      },
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
  "metadata" : {
    "version" : 1
  }
}
```

创建时的响应：

```json
{
  "role": {
    "created": true
  }
}
```

更新现有角色时，`created` 设置为 `false`。

以下示例创建一个仅允许通过 JDBC 使用 SQL 的最小权限角色：

```json
POST /_security/role/cli_or_drivers_minimal
{
  "cluster": ["cluster:monitor/main"],
  "indices": [
    {
      "names": ["test"],
      "privileges": ["read", "indices:admin/get"]
    }
  ]
}
```

以下示例创建一个仅限远程访问的角色：

```json
POST /_security/role/only_remote_access_role
{
  "remote_indices": [
    {
      "clusters": ["my_remote"],
      "names": ["logs*"],
      "privileges": ["read", "read_cross_cluster", "view_index_metadata"]
    }
  ],
  "remote_cluster": [
    {
      "clusters": ["my_remote"],
      "privileges": ["monitor_stats"]
    }
  ]
}
```

- 远程索引和远程集群权限适用于别名为 `my_remote` 的远程集群。
- 授予 `my_remote` 上匹配 `logs*` 模式的索引的权限。
- 远程集群仅支持一部分集群权限。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-put-role.html)
