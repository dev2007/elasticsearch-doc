# 启用用户 API

启用本机 realm 中的用户。默认情况下，创建用户时用户是启用的。

```txt
PUT /_security/user/<username>/_enable
POST /_security/user/<username>/_enable
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

以下示例启用用户 `logstash_system`：

```txt
PUT /_security/user/logstash_system/_enable
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-enable-user.html)
