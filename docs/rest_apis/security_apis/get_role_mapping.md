# 获取角色映射 API

角色映射定义了为每个用户分配哪些角色。角色映射 API 通常是管理角色映射的**首选方式**，而不是使用角色映射文件。

:::warning 警告

获取角色映射 API **不能检索角色映射文件中定义的角色映射**。

:::

```txt
GET /_security/role_mapping
GET /_security/role_mapping/<name>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<name>`

（必需，字符串或字符串数组）标识角色映射的唯一名称。该名称仅用作通过 API 进行交互的标识符；它不会以任何方式影响映射的行为。可以将多个映射名称指定为逗号分隔列表。如果未指定此参数，API 返回**所有**角色映射的信息。

## 响应体

响应是一个以角色映射名称为键的对象，每个值包含：

`enabled`

（必需，布尔值）映射是否启用。

`metadata`

（必需，对象）附加元数据。

`roles`

（可选，字符串数组）授予匹配用户的角色名称。

`role_templates`

（可选，对象数组）经计算以确定角色名称的 Mustache 模板，包含：

- `format`（字符串）有效值为 `string` 或 `json`。
- `template`（必需，对象）包含：
  - `params`（对象）指定传递给脚本作为变量的任何命名参数。使用参数代替硬编码的值以减少编译时间。
  - `options`（对象）脚本选项。

`rules`

（必需，对象）确定哪些用户匹配的规则，包含 `any`、`all`、`field`、`except` 等属性（语义详见[创建或更新角色映射 API](./put_role_mapping)）。

## 示例

以下示例获取名为 `mapping1` 的角色映射：

```txt
GET /_security/role_mapping/mapping1
```

响应示例：

```json
{
  "mapping1": {
    "enabled": true,
    "roles": [
      "user"
    ],
    "rules": {
      "field": {
        "username": "*"
      }
    },
    "metadata": {}
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-role-mapping.html)
