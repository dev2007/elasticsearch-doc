# 删除角色映射 API

角色映射定义了为每个用户分配哪些角色。角色映射 API 通常是管理角色映射的**首选方式**，而不是使用角色映射文件。

:::warning 警告

删除角色映射 API **不能移除角色映射文件中定义的角色映射**。

:::

```txt
DELETE /_security/role_mapping/<name>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<name>`

（必需，字符串）标识角色映射的唯一名称。该名称仅用作通过 API 进行交互的标识符；它不会以任何方式影响映射的行为。

## 查询参数

`refresh`

（可选，字符串）如果为 `true`（默认），刷新受影响的分片以使此操作对搜索可见；如果为 `wait_for`，等待刷新以使此操作对搜索可见；如果为 `false`，不进行任何刷新操作。有效值为：`true`、`false`、`wait_for`。

## 示例

以下示例删除名为 `mapping1` 的角色映射：

```txt
DELETE /_security/role_mapping/mapping1
```

如果映射成功删除，`found` 为 `true`：

```json
{
  "found" : true
}
```

否则，`found` 为 `false`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-delete-role-mapping.html)
