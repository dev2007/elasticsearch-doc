# 删除用户 API

从本机 realm 中删除用户。

```txt
DELETE /_security/user/<username>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<username>`

（必需，字符串）用户的标识符。

## 查询参数

`refresh`

（可选，字符串）如果为 `true`（默认），刷新受影响的分片以使此操作对搜索可见；如果为 `wait_for`，等待刷新以使此操作对搜索可见；如果为 `false`，不进行任何刷新操作。有效值为：`true`、`false`、`wait_for`。

## 示例

以下示例删除用户 `jacknich`：

```txt
DELETE /_security/user/jacknich
```

如果用户成功删除，请求返回：

```json
{
  "found" : true
}
```

否则，`found` 设置为 `false`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-delete-user.html)
