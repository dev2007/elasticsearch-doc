# 创建或更新角色映射 API

角色映射定义了为每个用户分配哪些角色。每个映射都有标识用户的**规则**（rules）和授予这些用户的**角色**（roles）列表。

- 角色映射 API 通常是管理角色映射的**首选方式**，而不是使用角色映射文件。此 API **不能**更新角色映射文件中定义的角色映射。
- 此 API **不会**创建角色 — 它将用户映射到现有角色。角色通过[创建或更新角色 API](./put_role) 或角色文件创建。
- 有关更多信息，请参阅[将用户和组映射到角色](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-users-groups-to-roles.html)。

## 角色模板

- 最常见的用途：将用户上的已知值映射到固定的角色名称（例如，LDAP 组 `cn=admin,dc=example,dc=com` → `superuser` 角色）。此时使用 `roles` 字段。
- 对于更复杂的需求，**Mustache 模板**可以动态确定角色名称 — 此时使用 `role_templates` 字段。
- 必须启用相关的脚本功能，否则创建带模板的角色映射会失败（请参阅[允许的脚本类型设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/scripting-settings.html#scripting-allowed-types-setting)）。
- `rules` 中可用的所有用户字段（username、groups、realm.name、dn、metadata 等）在角色模板中同样可用。
- 默认情况下，模板的计算结果为单个字符串（角色名称）。如果 `format` 设置为 `json`，模板必须生成 JSON 字符串或 JSON 字符串的**数组**作为角色名称。

```txt
POST /_security/role_mapping/<name>
PUT /_security/role_mapping/<name>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<name>`

（必需，字符串）标识角色映射的唯一名称。仅用作 API 标识符；不影响映射行为。

## 请求体

`enabled`

（必需，布尔值）`enabled: false` 的映射在角色映射期间会被忽略。

`metadata`

（可选，对象）帮助定义角色分配的附加元数据。以 `_` 开头的键保留供系统使用。

`roles`

（有条件，字符串列表）授予匹配用户的角色名称。**必须指定 `roles` 或 `role_templates` 之一。**

`role_templates`

（有条件，对象列表）经计算以确定角色名称的 Mustache 模板。**必须指定 `roles` 或 `role_templates` 之一。**

`rules`

（必需，对象）确定哪些用户匹配的规则。通过 JSON DSL 表示（请参阅[角色映射资源](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api.html#role-mapping-resources)）。

规则 DSL 支持以下结构：

- `field` — 将用户字段与值匹配：例如 `{"field": {"username": "*"}}`、`{"field": {"realm.name": "ldap1"}}`、`{"field": {"dn": "*,ou=subtree,dc=example,dc=com"}}`、`{"field": {"groups": [...]}}`、`{"field": {"metadata.terminated_date": null}}`。值可以是单个值或**数组**（匹配任意一个值即匹配）。
- `any` — 规则列表；如果**任意**子规则匹配即匹配。
- `all` — 规则列表；只有当**所有**子规则都匹配时才匹配。
- `except` — 对嵌套规则取反（例如，排除具有 `terminated_date` 的用户）。
- `role_templates` 对象格式：`{"template": {"source": "<mustache>"}, "format": "json"}` — `format` 默认为字符串；当模板生成 JSON 数组（例如使用 `{{#tojson}}groups{{/tojson}}` mustache 函数）时设置为 `json`。

## 示例

**mapping1 — 为所有用户分配 `user` 角色：**

```json
POST /_security/role_mapping/mapping1
{
  "roles": [ "user" ],
  "enabled": true,
  "rules": { "field": { "username": "*" } },
  "metadata": { "version": 1 }
}
```

创建时的响应：

```json
{ "role_mapping": { "created": true } }
```

更新现有映射时，`created` 设置为 `false`。

**mapping2 — 为特定用户分配 `user` 和 `admin` 角色：**

```json
POST /_security/role_mapping/mapping2
{
  "roles": [ "user", "admin" ],
  "enabled": true,
  "rules": { "field": { "username": [ "esadmin01", "esadmin02" ] } }
}
```

**mapping3 — 匹配针对特定 realm 进行身份验证的用户：**

```json
POST /_security/role_mapping/mapping3
{
  "roles": [ "ldap-user" ],
  "enabled": true,
  "rules": { "field": { "realm.name": "ldap1" } }
}
```

**mapping4 — 匹配用户名 `esadmin` 或属于管理员组的用户：**

```json
POST /_security/role_mapping/mapping4
{
  "roles": [ "superuser" ],
  "enabled": true,
  "rules": {
    "any": [
      { "field": { "username": "esadmin" } },
      { "field": { "groups": "cn=admins,dc=example,dc=com" } }
    ]
  }
}
```

当身份提供方的组名与 Elasticsearch 角色名不是一一对应时非常有用。对于多个组，在 `groups` 上使用数组语法（匹配任意一个组即匹配）：

```json
{ "field": { "groups": [ "cn=admins,dc=example,dc=com", "cn=other,dc=example,dc=com" ] } }
```

**mapping5 — 将组名视为角色名（SAML）：**

```json
POST /_security/role_mapping/mapping5
{
  "role_templates" : [
    {
      "template" : { "source": "{{#tojson}}groups{{/tojson}}" },
      "format": "json"
    }
  ],
  "rules": { "field": { "realm.name": "saml1" } },
  "enabled": true
}
```

`tojson` 将组列表转换为 JSON 数组；必须设置 `format: "json"`。**注意：**仅当你打算为提供的**所有**组定义角色时才这样做 — 将用户映射到许多不必要的/未定义的角色效率低下且损害性能。

**mapping6 — 匹配 LDAP 子树中的用户：**

```json
POST /_security/role_mapping/mapping6
{
  "roles" : [ "example-user" ],
  "enabled": true,
  "rules": { "field": { "dn": "*,ou=subtree,dc=example,dc=com" } }
}
```

**mapping7 — 匹配特定 realm 中的子树（all）：**

```json
POST /_security/role_mapping/mapping7
{
  "roles": [ "ldap-example-user" ],
  "enabled": true,
  "rules": {
    "all" : [
      { "field": { "dn" : "*,ou=subtree,dc=example,dc=com" } },
      { "field": { "realm.name" : "ldap1" } }
    ]
  }
}
```

**mapping8 — 带通配符和 `except` 的复杂规则：**匹配同时满足以下条件的用户：

- DN 匹配 `*,ou=admin,dc=example,dc=com` **或**用户名为 `es-admin` 或 `es-system`
- 用户属于组 `cn=people,dc=example,dc=com`
- 用户**没有** `terminated_date`

```json
POST /_security/role_mapping/mapping8
{
  "roles": [ "superuser" ],
  "enabled": true,
  "rules": {
    "all": [
      { "any": [
          {
            "field": { "dn": "*,ou=admin,dc=example,dc=com" }
          },
          {
            "field": { "username": [ "es-admin", "es-system" ] }
          }
      ]},
      { "field": { "groups": "cn=people,dc=example,dc=com" } },
      { "except": { "field": { "metadata.terminated_date": null } } }
    ]
  }
}
```

**mapping9 — 按用户模板化角色：**`cloud-saml` realm 中的每个用户都会获得 `saml_user` 角色以及一个名为 `_user_<username>` 的角色（例如，用户 `nwong` → `saml_user`、`_user_nwong`）：

```json
POST /_security/role_mapping/mapping9
{
  "rules": { "field": { "realm.name": "cloud-saml" } },
  "role_templates": [
    {
      "template": { "source": "saml_user" }
    },
    {
      "template": { "source": "_user_{{username}}" }
    }
  ],
  "enabled": true
}
```

由于 `roles` 和 `role_templates` 不能同时指定，固定名称角色通过不带替换项的模板应用。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-put-role-mapping.html)
