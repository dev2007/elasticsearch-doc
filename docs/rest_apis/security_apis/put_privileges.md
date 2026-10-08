# 创建或更新应用程序权限 API

创建或更新应用程序权限。

- 要**移除**权限，请使用[删除应用程序权限 API](./delete_privileges)。
- 有关更多信息，请参阅[应用程序权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html#privileges-list-applications)。
- 要检查用户的应用程序权限，请使用[是否具有权限 API](./has_privileges)。

```txt
POST /_security/privilege
PUT /_security/privilege
```

## 前置条件

要使用此 API，你必须具有：

- `manage_security` [集群权限](../security_privileges/cluster_privileges)（或更高级别的权限，例如 `all`）；**或**
- 请求中引用的应用程序的**管理应用程序权限**全局权限。

## 请求体

请求体是一个 JSON 对象，其中：

- **字段名**为应用程序名称
- **每个值**为一个对象，其字段名为权限名称，每个权限值为一个 JSON 对象，包含：

`actions`

（必需，字符串数组）此权限授予的操作名称列表。必须存在且不能为空数组。

`metadata`

（可选，对象）可选元数据。以 `_` 开头的键保留供系统使用。

## 验证

**应用程序名称**（前缀 + 可选后缀）：

- 前缀必须以小写 ASCII 字母开头
- 前缀只能包含 ASCII 字母或数字
- 前缀长度必须至少为 3 个字符
- 如果存在后缀，必须以 `-` 或 `_` 开头
- 后缀不能包含：`\`、`/`、`*`、`?`、`"`、`<`、`>`、`|`、`,`、`*`
- 名称的任何部分都不能包含空格

**权限名称：**

- 必须以小写 ASCII 字母开头
- 只能包含 ASCII 字母、数字以及字符 `_`、`-`、`.`

**操作名称：**

- 可以包含任意数量的可打印 ASCII 字符
- 必须至少包含以下字符之一：`/`、`*`、`:`

## 示例

以下示例添加单个权限：

```json
PUT /_security/privilege
{
  "myapp": {
    "read": {
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

注意：

- 操作字符串仅在 `myapp` 应用程序内有意义 — Elasticsearch 不会为它们赋予任何含义。
- `data:read/*` 中的通配符（`*`）授予对以 `data:read/` 开头的所有操作的访问权限。如果请求稍后包含特定的应用程序权限（例如 `data:read/users` 或 `data:read/settings`），[是否具有权限 API](./has_privileges) 会遵循通配符并返回 `true`。
- `metadata` 对象是可选的。

响应：

```json
{
  "myapp": {
    "read": {
      "created": true
    }
  }
}
```

更新现有权限时 `created` 设置为 `false`。

以下示例添加多个权限：

```json
PUT /_security/privilege
{
  "app01": {
    "read": {
      "actions": [ "action:login", "data:read/*" ]
    },
    "write": {
      "actions": [ "action:login", "data:write/*" ]
    }
  },
  "app02": {
    "all": {
      "actions": [ "*" ]
    }
  }
}
```

响应：

```json
{
  "app02": {
    "all": { "created": true }
  },
  "app01": {
    "read": { "created": true },
    "write": { "created": true }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-put-privileges.html)
