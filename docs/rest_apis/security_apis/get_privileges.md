# 获取应用程序权限 API

检索有关应用程序权限的信息。

```txt
GET /_security/privilege
GET /_security/privilege/<application>
GET /_security/privilege/<application>/<name>
```

## 前置条件

要使用此 API，你必须具有以下权限之一：

- `read_security` [集群权限](../security_privileges/cluster_privileges)（或更高级别的权限，例如 `manage_security` 或 `all`）
- 请求中引用的应用程序的**管理应用程序权限**全局权限

## 路径参数

`<application>`

（必需，字符串）应用程序的名称。应用程序权限始终与恰好一个应用程序关联。如果省略，API 返回**所有应用程序的所有权限**的信息。

`<name>`

（必需，字符串或字符串数组）权限的名称。如果省略，API 返回**所请求应用程序的所有权限**的信息。

## 响应体

响应是一个以应用程序名称为键的 JSON 对象，包含权限对象，每个权限对象包含：

- `actions`（必需，字符串数组）此权限授予的操作列表。
- `application`（字符串）权限所属的应用程序名称。
- `name`（字符串）权限名称。
- `metadata`（对象）用户定义的元数据。

## 示例

以下示例获取应用程序 `myapp` 的 `read` 权限：

```txt
GET /_security/privilege/myapp/read
```

响应示例：

```json
{
  "myapp": {
    "read": {
      "application": "myapp",
      "name": "read",
      "actions": [
        "data:read/*",
        "action:login"
      ],
      "metadata": {
        "description": "Read access to myapp"
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-privileges.html)
