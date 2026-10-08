# 删除角色 API

删除本机 realm 中的角色。角色管理 API 通常是管理角色的首选方式，而不是使用基于文件的角色管理。删除角色 API **不能**移除角色文件中定义的角色。

```txt
DELETE /_security/role/<name>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<name>`

（必需，字符串）角色的名称。

## 查询参数

`refresh`

（可选，字符串）如果为 `true`（默认），刷新受影响的分片以使此操作对搜索可见；如果为 `wait_for`，等待刷新以使此操作对搜索可见；如果为 `false`，不进行任何刷新操作。有效值为：`true`、`false`、`wait_for`。

## 示例

以下示例删除名为 `my_admin_role` 的角色：

```txt
DELETE /_security/role/my_admin_role
```

如果角色成功删除，`found` 设置为 `true`：

```json
{
  "found": true
}
```

否则，`found` 设置为 `false`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-delete-role.html)
