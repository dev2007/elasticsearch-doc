# 批量删除角色 API

角色管理 API 通常是管理角色的首选方式，而不是使用基于文件的角色管理。批量删除角色 API **不能删除角色文件中定义的角色**。

```txt
DELETE /_security/role
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 查询参数

`refresh`

（可选，字符串）如果为 `true`（默认），刷新受影响的分片以使此操作对搜索可见；如果为 `wait_for`，等待刷新以使此操作对搜索可见；如果为 `false`，不进行任何刷新操作。有效值为：`true`、`false`、`wait_for`。

## 请求体

`names`

（必需，字符串数组）要删除的角色名称数组。

## 响应体

`deleted`

（字符串数组）已删除的角色数组。

`not_found`

（字符串数组）找不到的角色数组。

`errors`

（对象）仅在有任何删除导致错误时出现。

- `count`（必需，数字）错误的数量。
- `details`（必需，对象）关于错误的详细信息，以角色名称为键，每个错误对象包含：
  - `type`（必需，字符串）错误的类型。
  - `reason`（必需，字符串或 null）错误的可读解释。
  - `stack_trace`（字符串）服务器堆栈跟踪；仅在发送 `error_trace=true` 时出现。
  - `caused_by`（对象）请求失败的原因和详情。
  - `root_cause`（对象数组）根本原因详情。
  - `suppressed`（对象数组）被抑制的错误详情。

## 示例

以下示例删除 `my_admin_role` 和 `my_user_role` 两个角色：

```json
DELETE /_security/role
{
  "names": [ "my_admin_role", "my_user_role" ]
}
```

成功响应：

```json
{
  "deleted": [
    "my_admin_role",
    "my_user_role"
  ]
}
```

如果找不到某个角色，它会出现在 `not_found` 列表中：

```json
{
  "deleted": [
    "my_admin_role"
  ],
  "not_found": [
    "not_an_existing_role"
  ]
}
```

如果请求的一部分失败或无效，响应中会包含 `errors`：

```json
{
  "deleted": [
    "my_admin_role"
  ],
  "errors": {
    "count": 1,
    "details": {
      "superuser": {
        "type": "illegal_argument_exception",
        "reason": "role [superuser] is reserved and cannot be deleted"
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-bulk-delete-role.html)
