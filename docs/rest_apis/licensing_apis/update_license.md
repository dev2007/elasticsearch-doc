# 更新许可证 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [许可证 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-license)。

:::::

更新 Elasticsearch 集群的许可证。

## 请求

```bash
PUT _license
```

```bash
POST _license
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你需要 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能安装许可证。
- 如果启用了 Elasticsearch 安全功能且你要安装 gold 或更高级别的许可证，必须在安装许可证之前在传输网络层上启用 TLS。请参阅[使用 TLS 加密节点间通信](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/configuring-tls.html)。
- 如果启用了操作员权限功能，只有操作员用户才能使用此 API。

## 描述

你可以在运行时更新许可证，而无需关闭节点。许可证更新立即生效。但是，如果你安装的许可证不支持先前许可证可用的所有功能，你将在响应中收到通知。此时，你必须将 `acknowledge` 参数设置为 `true` 后重新提交 API 请求。

有关不同许可证类型的更多信息，请参阅 [https://www.elastic.co/subscriptions](https://www.elastic.co/subscriptions)。

## 查询参数

- `acknowledge`

  （可选，布尔值）指定是否确认许可证更改。默认为 `false`。

## 请求体

- `licenses`

  （必需，数组）包含许可证信息的一个或多个 JSON 文档序列。

## 示例

以下示例更新为基础版许可证：

```json
PUT _license
{
  "licenses": [
    {
      "uid":"893361dc-9749-4997-93cb-802e3d7fa4xx",
      "type":"basic",
      "issue_date_in_millis":1411948800000,
      "expiry_date_in_millis":1914278399999,
      "max_nodes":1,
      "issued_to":"issuedTo",
      "issuer":"issuer",
      "signature":"xx"
    }
  ]
}
```

这些值是无效的，你必须用许可证文件中的适当内容替换。

你也可以使用 curl 命令安装许可证文件。确保在许可证文件路径前添加 `@`，以指示 curl 将其作为输入文件处理：

```bash
curl -XPUT -u <user> 'http://<host>:<port>/_license' -H "Content-Type: application/json" -d @license.json
```

在 Windows 上，使用以下命令：

```powershell
Invoke-WebRequest -uri http://<host>:<port>/_license -Credential elastic -Method Put -ContentType "application/json" -InFile .\license.json
```

在这些示例中：

- `<user>` 是具有适当权限的用户 ID。
- `<host>` 是 Elasticsearch 集群中任意节点的主机名（如果在本地执行则为 `localhost`）。
- `<port>` 是 HTTP 端口（默认为 9200）。
- `license.json` 是许可证 JSON 文件。

如果你的 Elasticsearch 节点在 HTTP 接口上启用了 SSL，你的 URL 必须以 `https://` 开头。

如果你之前拥有的许可证比基础版许可证具有更多功能，你将收到以下响应：

```json
{
  "acknowledged": false,
  "license_status": "valid",
  "acknowledge": {
    "message": "This license update requires acknowledgement. To acknowledge the license, please read the following messages and update the license again, this time with the \"acknowledge=true\" parameter:",
    "watcher": [
      "Watcher will be disabled"
    ],
    "logstash": [
      "Logstash will no longer poll for centrally-managed pipelines"
    ],
    "security": [
      "The following X-Pack security functionality will be disabled: ..."
    ]
  }
}
```

要完成更新，你必须重新提交 API 请求并将 `acknowledge` 参数设置为 `true`。例如：

```json
PUT _license?acknowledge=true
{
  "licenses": [
    {
      "uid":"893361dc-9749-4997-93cb-802e3d7fa4xx",
      "type":"basic",
      "issue_date_in_millis":1411948800000,
      "expiry_date_in_millis":1914278399999,
      "max_nodes":1,
      "issued_to":"issuedTo",
      "issuer":"issuer",
      "signature":"xx"
    }
  ]
}
```

或者：

```bash
curl -XPUT -u elastic 'http://<host>:<port>/_license?acknowledge=true' -H "Content-Type: application/json" -d @license.json
```

有关许可证过期时禁用的功能的更多信息，请参阅[许可证过期](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/license-expiration.html)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-license.html)
