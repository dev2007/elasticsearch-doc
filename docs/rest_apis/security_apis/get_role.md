# 获取角色 API

获取本机 realm 中的角色。角色管理 API 通常是管理角色的首选方式，而不是使用基于文件的角色管理。

:::warning 警告

获取角色 API **不能检索角色文件中定义的角色**。

:::

```txt
GET /_security/role
GET /_security/role/<name>
```

## 前置条件

- 要使用此 API，你必须至少具有 `read_security` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<name>`

（必需，字符串或字符串数组）角色的名称。可以将多个角色指定为逗号分隔列表。如果未指定此参数，API 返回**所有**角色的信息。

## 查询参数

`include_implicit`

（可选，布尔值）如果为 `true`，在显式配置的权限之外包含由已注册 `ImplicitPrivilegesProviders` 隐式授予的权限。响应中的每个隐式条目都标注了 `implicitly_granted: true`。默认为 `false`。

## 响应体

响应是一个以角色名称为键的角色对象映射，每个角色对象包含：

`cluster`

（必需，字符串数组）集群级权限。

`indices`

（必需，对象数组）索引级权限条目列表，每个条目包含：

- `names`（必需，字符串或字符串数组）此条目中的权限适用的索引（或索引名称模式）列表。
- `privileges`（必需，字符串数组）角色所有者对指定索引具有的索引级权限。
- `field_security`（对象）角色所有者具有读取权限的文档字段。
- `query`（字符串或对象）定义角色所有者可访问文档的搜索查询（Elasticsearch 查询 DSL 对象）。指定索引中的文档必须匹配此查询才可访问。
- `allow_restricted_indices`（布尔值，默认 `false`）如果使用覆盖受限索引的通配符或正则表达式模式，则设置为 `true`。受限索引具有有限的权限，可能导致模式测试失败。如果在 `names` 中显式列出了受限索引，则无论此值如何，Elasticsearch 都会对它们检查权限。

`remote_indices`

（可选，对象数组）可以为远程集群定义的索引级权限的子集（条目结构与 `indices` 相同，额外包含必需的 `clusters` — 权限适用的集群别名列表）。

`remote_cluster`

（可选，对象数组）可以为远程集群定义的集群级权限的子集，每个条目包含：

- `clusters`（必需，字符串或字符串数组）权限适用的集群别名列表。
- `privileges`（必需，字符串数组）远程集群上的集群级权限。**有效值：**`monitor_enrich` 或 `monitor_stats`。

`metadata`

（必需，对象）任意用户定义的元数据。

`description`

（可选，字符串）角色描述。

`run_as`

（可选，字符串数组）角色所有者可以模拟的用户。

`transient_metadata`

（可选，对象）临时元数据（例如 `enabled`）。

`applications`

（必需，对象数组）应用程序权限条目列表，每个条目包含：

- `application`（必需，字符串）此条目适用的应用程序的名称。
- `privileges`（必需，字符串数组）应用程序权限或操作名称的列表。
- `resources`（必需，字符串数组）应用权限的资源列表。

`role_templates`

（可选，对象数组）角色定义模板，包含：

- `format`（字符串）有效值为 `string` 或 `json`。
- `template`（必需，对象）包含：
  - `params`（对象）传递给脚本作为变量的命名参数。使用参数代替硬编码的值以减少编译时间。
  - `options`（对象）脚本选项。

`global`

（可选，对象）全局（应用程序管理的）权限。

## 示例

以下示例获取名为 `my_admin_role` 的角色：

```txt
GET /_security/role/my_admin_role
```

响应示例：

```json
{
  "my_admin_role": {
    "description": "Grants full access to all management features within the cluster.",
    "cluster": [ "all" ],
    "indices": [
      {
        "names": [ "index1", "index2" ],
        "privileges": [ "all" ],
        "allow_restricted_indices": false,
        "field_security": {
          "grant": [ "title", "body" ]
        }
      }
    ],
    "applications": [ ],
    "run_as": [ "other_user" ],
    "metadata": {
      "version": 1
    },
    "transient_metadata": {
      "enabled": true
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-role.html)
