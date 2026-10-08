# 创建 API 密钥 API

创建一个无需基本身份验证即可访问的 API 密钥。

- API 密钥由 Elasticsearch API 密钥服务创建，该服务会自动启用。有关禁用它的方法，请参阅 [API 密钥服务设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-settings.html#api-key-service-settings)。
- 成功请求会返回一个 JSON 结构，其中包含 API 密钥、其唯一的 `id` 及其 `name`。如果适用，还会以毫秒为单位返回过期信息。
- 默认情况下，API 密钥永不过期。你可以在创建时指定过期信息。
- 有关 API 密钥服务的相关配置设置，请参阅 [API 密钥服务设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-settings.html#api-key-service-settings)。

```txt
POST /_security/api_key
PUT /_security/api_key
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_own_api_key` [集群权限](../security_privileges/cluster_privileges)。
- 如果用于验证此请求的凭据是 API 密钥，则派生的 API 密钥不能具有任何权限。如果你指定了权限，API 会返回错误（请参阅 `role_descriptors` 下的说明）。

## 请求体

`name`

（必需，字符串）指定此 API 密钥的名称。

`role_descriptors`

（可选，对象）此 API 密钥的角色描述符。未指定或为空数组时，API 密钥将获得已验证用户权限的**时间点快照**。如果提供，最终权限是 API 密钥权限与已验证用户权限的**交集**，从而限制了访问范围。由于这种交集计算，无法创建作为另一个 API 密钥子级的 API 密钥，除非派生密钥在创建时没有任何权限 — 在这种情况下，你必须显式指定一个没有权限的角色描述符。派生的 API 密钥可用于身份验证，但无权调用 Elasticsearch API。

`expiration`

（可选，字符串）API 密钥的过期时间。默认情况下，API 密钥永不过期。

`metadata`

（可选，对象）要与 API 密钥关联的任意元数据。支持嵌套数据结构。以 `_` 开头的键保留供系统使用。

`role_descriptors` 的属性

- `applications`（列表）应用程序权限条目列表：

  - `application`（必需，字符串）此条目适用的应用程序的名称。
  - `privileges`（必需，列表）字符串列表，每项为应用程序权限或操作的名称。
  - `resources`（必需，列表）应用权限的资源列表。

- `cluster`（列表）定义 API 密钥可执行的集群级操作的集群权限列表。

- `global`（可选，对象）定义全局权限的对象（集群权限的请求感知形式）。目前仅限于应用程序权限的管理。

- `indices`（列表）索引权限条目列表：

  - `field_security`（对象）API 密钥具有读取权限的文档字段（请参阅[设置字段和文档级安全性](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/field-and-document-level-security.html)）。
  - `names`（必需，列表）权限适用的索引（或索引名称模式）。
  - `privileges`（必需，列表）指定索引上的索引级权限。
  - `query`（对象）定义 API 密钥具有读取权限的文档的搜索查询；指定索引中的文档必须匹配此查询才可访问。

- `metadata`（可选，对象）可选元数据。以 `_` 开头的键保留供系统使用。

- `restriction`（可选，对象）角色描述符生效时的可选限制（请参阅[角色限制](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/role-restriction.html)）：

  - `workflows`（列表）API 密钥受限制的工作流列表（完整列表请参阅[工作流](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/workflows.html)）。要使用角色限制，必须使用**单个**角色描述符创建 API 密钥。

- `run_as`（列表）API 密钥可以模拟的用户列表（请参阅[代表其他用户提交请求](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/run-as-privilege.html)）。

## 示例

以下示例创建一个 API 密钥：

```json
POST /_security/api_key
{
  "name": "my-api-key",
  "expiration": "1d",
  "role_descriptors": {
    "role-a": {
      "cluster": ["all"],
      "indices": [
        { "names": ["index-a*"], "privileges": ["read"] }
      ]
    },
    "role-b": {
      "cluster": ["all"],
      "indices": [
        { "names": ["index-b*"], "privileges": ["all"] }
      ]
    }
  },
  "metadata": {
    "application": "my-application",
    "environment": {
       "level": 1,
       "trusted": true,
       "tags": ["dev", "staging"]
    }
  }
}
```

成功响应：

```json
{
  "id": "VuaCfGcBCdbkQm-e5aOx",
  "name": "my-api-key",
  "expiration": 1544068612110,
  "api_key": "ui2lp2axTNmsyakw9tvNnw",
  "encoded": "VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkybHAyYXhUTm1zeWFrdzl0dk5udw=="
}
```

响应字段：

- `id` — 此 API 密钥的唯一 ID。
- `expiration` — 此 API 密钥的过期时间（毫秒，可选）。
- `api_key` — 生成的 API 密钥。
- `encoded` — API 密钥凭据：`id` 和 `api_key` 用冒号（`:`）连接后的 UTF-8 表示形式的 Base64 编码。

使用 API 密钥时，发送一个带 `ApiKey` 前缀后跟 `encoded` 值的 `Authorization` 头：

```bash
curl -H "Authorization: ApiKey VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkybHAyYXhUTm1zeWFrdzl0dk5udw==" \
http://localhost:9200/_cluster/health?pretty
```

:::warning 警告

如果你的节点将 `xpack.security.http.ssl.enabled` 设置为 `true`，则创建 API 密钥时必须指定 **https**。

:::

在类 Unix 系统上，可以使用以下命令创建 `encoded` 值：

```bash
echo -n "VuaCfGcBCdbkQm-e5aOx:ui2lp2axTNmsyakw9tvNnw" | base64
```

（使用 `-n` 使 `echo` 命令不打印结尾的换行符。）

以下示例创建一个仅限于 `search_application_query` 工作流的 API 密钥，该工作流仅允许调用搜索应用搜索 API：

```json
POST /_security/api_key
{
  "name": "my-restricted-api-key",
  "role_descriptors": {
    "my-restricted-role-descriptor": {
      "indices": [
        { "names": ["my-search-app"], "privileges": ["read"] }
      ],
      "restriction": {
        "workflows": ["search_application_query"]
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-create-api-key.html)
