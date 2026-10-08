# 删除应用程序权限 API

删除应用程序权限。应用程序权限始终与恰好一个应用程序关联。

```txt
DELETE /_security/privilege/<application>/<name>
```

## 前置条件

要使用此 API，你必须具有以下权限之一：

- `manage_security` [集群权限](../security_privileges/cluster_privileges)（或更高级别的权限，例如 `all`）。
- 请求中引用的应用程序的**管理应用程序权限**全局权限。

## 路径参数

`<application>`

（必需，字符串）应用程序的名称。应用程序权限始终与恰好一个应用程序关联。

`<name>`

（必需，字符串或字符串数组）权限的名称。

## 查询参数

`refresh`

（可选，字符串）如果为 `true`（默认），刷新受影响的分片以使此操作对搜索可见；如果为 `wait_for`，等待刷新以使此操作对搜索可见；如果为 `false`，不进行任何刷新操作。有效值为：`true`、`false`、`wait_for`。

## 示例

以下示例删除应用程序 `myapp` 的 `read` 权限：

```txt
DELETE /_security/privilege/myapp/read
```

如果权限成功删除，`found` 设置为 `true`：

```json
{
  "myapp": {
    "read": {
      "found": true
    }
  }
}
```

如果权限不存在（未找到），`found` 设置为 `false`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-delete-privilege.html)
