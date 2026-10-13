# 角色映射资源

角色映射资源定义用于与安全功能相关的 API。角色映射资源具有以下属性：

- `enabled`：布尔值。在执行角色映射时，`enabled` 设置为 `false` 的映射会被忽略。
- `metadata`：对象。帮助定义向每个用户分配哪些角色的附加元数据。在 `metadata` 对象中，以 `_` 开头的键保留给系统使用。
- `roles`：列表。授予匹配角色映射规则的用户的角色列表。
- `rules`：对象。确定映射应匹配哪些用户的规则。规则是通过 JSON DSL 表达的逻辑条件（参见下方的规则类型）。

## 规则类型（JSON DSL）

`rules` 字段支持以下规则类型：

- **`any`**（规则数组）：如果其**任意**子规则为 true，则求值为 true。
- **`all`**（规则数组）：只有其**所有**子规则都为 true 时才求值为 true。
- **`field`**（对象）：主要的构建块；参见字段规则。
- **`except`**（对象）：作为对象呈现的单个规则。**仅在 `all` 规则的子级中有效**。如果其子规则为 false，则 `except` 为 true（即充当逻辑取反）。

## 字段规则

`field` 规则以单个对象作为其值；该对象必须包含单个成员，其键为 *F*，值为 *V*。该规则在用户对象中查找 *F* 的值，并测试该用户值是否**匹配** *V*。

*V* 支持以下值类型：

| 类型 | 描述 | 示例 |
|------|------|------|
| 简单字符串 | 精确匹配所提供的值。 | `"esadmin"` |
| 通配符字符串 | 使用通配符进行匹配。 | `"*,dc=example,dc=com"` |
| 正则表达式 | 使用 Lucene 正则表达式进行匹配。 | `"/.*-admin[0-9]*/"` |
| 数字 | 匹配等价的数值。 | `7` |
| Null | 匹配 null 或缺失的值。 | `null` |
| 数组 | 按照上述定义测试每个元素。如果**任何**元素匹配，则匹配成功。 | `["admin", "operator"]` |

## 用户字段

规则所针对求值的*用户对象*具有以下字段：

- **`username`**（字符串）：Elasticsearch 安全功能所知晓的用户名。示例：`"username": "jsmith"`。
- **`dn`**（字符串）：用户的*可分辨名称*（Distinguished Name）。示例：`"dn": "cn=jsmith,ou=users,dc=example,dc=com"`。
- **`groups`**（字符串数组）：用户所属的组。示例：`"groups": ["cn=admin,ou=groups,dc=example,dc=com", "cn=esusers,ou=groups,dc=example,dc=com"]`。
- **`metadata`**（对象）：作为键值对形式的附加用户元数据。在角色映射规则中引用时，对嵌套键使用点号表示法。如果键包含特殊字符（括号、点号、空格），请使用反斜杠（`\`）进行转义。示例：`"metadata": { "cn": "John Smith" }`。
- **`realm`**（对象）：对用户进行身份验证的域（realm）；其唯一的字段是域名。示例：`"realm": { "name": "ldap1" }`。

## 多值字段的行为

`groups` 字段是多值的。当 `field` 规则应用于多值字段时，只要**至少有一个**成员值匹配，即为匹配成功。例如，以下规则匹配作为 `admin` 组成员的任何用户（无论其属于哪些其他组）：

```json
{ "field": { "groups": "admin" } }
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/role-mapping-resources.html)
