# 远程集群故障排除

在为跨集群复制或跨集群搜索设置远程集群时，你可能会遇到几个问题。

## 常规故障排除

### 检查远程集群是否已成功连接

对添加或更新远程集群的集群设置更新 API 的成功调用不一定意味着配置成功。使用远程集群信息 API 验证本地集群是否已成功连接到远程集群：

```txt
GET /_remote/info
```

该 API 应返回 `"connected": true`。使用 API 密钥身份验证时，还应返回 `"cluster_credentials": "::es_redacted::"`。

```json
{
  "cluster_one": {
    "seeds": ["127.0.0.1:9443"],
    "connected": true,
    "num_nodes_connected": 1,
    "max_connections_per_cluster": 3,
    "initial_connect_timeout": "30s",
    "skip_unavailable": false,
    "cluster_credentials": "::es_redacted::",
    "mode": "sniff"
  }
}
```

① 远程集群已成功连接。② 如果存在，表示远程集群是使用 API 密钥身份验证（而非基于证书的身份验证）连接的。

### 启用远程集群服务器

使用 API 密钥身份验证时，跨集群流量发生在远程集群接口上，而不是传输接口上。远程集群接口默认不启用。这意味着节点默认情况下不准备接受传入的跨集群请求，但已准备好发送传出的跨集群请求。确保你已在远程集群的每个节点上启用远程集群服务器。在 `elasticsearch.yml` 中：

- 将 `remote_cluster_server.enabled` 设置为 `true`。
- 为远程集群服务器流量配置绑定和发布地址，例如使用 `remote_cluster.host`。如果不配置地址，远程集群流量可能绑定到本地接口，运行在其他机器上的远程集群将无法连接。
- 可选择使用 `remote_cluster.port` 配置远程服务器端口（默认为 `9443`）。

## 常见问题

以下问题按设置远程集群时可能发生的顺序列出。

### 远程集群不可达

**症状**：本地集群可能因多种原因无法连接到远程集群。例如，远程集群服务器可能未启用、配置了错误的主机或端口，或者防火墙阻止了流量。当远程集群不可达时，检查本地集群的日志以查找 `connect_exception`。

当远程集群使用代理模式配置时：

```txt
[2023-06-28T16:36:47,264][WARN ][o.e.t.ProxyConnectionStrategy][local-node] failed to open any proxy connections to cluster [my]
org.elasticsearch.transport.ConnectTransportException:[][][192.168.0.42:9443] connect_exception
```

当远程集群使用嗅探模式配置时：

```txt
[2023-06-28T16:38:37,731][WARN ][o.e.t.SniffConnectionStrategy][local-node] fetching nodes from external cluster [my] failed
org.elasticsearch.transport.ConnectTransportException:[][][192.168.0.42:9443] connect_exception
```

**解决方法**：
- 检查远程集群的主机和端口是否正确。
- 确保远程集群上已启用远程集群服务器。
- 确保没有防火墙阻止通信。

### 远程集群连接不可靠

**症状**：本地集群可以连接到远程集群，但连接无法可靠工作。例如，某些跨集群请求可能成功，而其他请求报告连接错误、超时，或看起来卡在等待远程集群响应。

当 Elasticsearch 检测到远程集群连接不工作时，它会在日志中报告以下消息：

```txt
[2023-06-28T16:36:47,264][INFO ][o.e.t.ClusterConnectionManager][local-node] transport connection to [{my-remote#192.168.0.42:9443}{...}] closed by remote
```

如果 Elasticsearch 连接到的远程集群节点被关闭或重启，也会记录此消息。

请注意，在某些网络配置下，操作系统可能需要几分钟或几小时才能检测到连接已停止工作。在故障被检测并报告给 Elasticsearch 之前，涉及远程集群的请求可能超时或看起来卡住。

**解决方法**：
- 确保集群之间的网络尽可能可靠。
- 确保网络配置为允许长存的空闲连接。
- 确保网络配置为快速检测故障连接。特别是，你必须启用并完全支持 TCP keepalive，并设置较短的重传超时。
- 在 Linux 系统上，执行 `ss -tonie` 以验证集群之间每个网络连接的配置细节。
- 如果问题持续存在，在连接的两端捕获网络数据包并分析流量，查找延迟和丢失的消息。

### 未建立 TLS 信任

本地或远程集群上的 TLS 可能配置错误。结果是本地集群不信任远程集群出示的证书。

**症状**：本地集群记录 `failed to establish trust with server`：

```txt
[2023-06-29T09:40:55,465][WARN ][o.e.c.s.DiagnosticTrustManager][local-node] failed to establish trust with server at [192.168.0.42]; the server provided a certificate with subject name [CN=remote_cluster], fingerprint [529de35e15666ffaa26afa50876a2a48119db03a], no keyUsage and no extendedKeyUsage; the certificate is valid between [2023-01-29T12:08:37Z] and [2032-08-29T12:08:37Z] (current time is [2023-08-16T23:40:55.464275Z], certificate dates are valid); the session uses cipher suite [TLS_AES_256_GCM_SHA384] and protocol [TLSv1.3]; the certificate has subject alternative names [DNS:localhost,DNS:localhost6.localdomain6,IP:127.0.0.1,IP:0:0:0:0:0:0:0:1,DNS:localhost4,DNS:localhost6,DNS:localhost.localdomain,DNS:localhost4.localdomain4,IP:192.168.0.42]; the certificate is issued by [CN=ElasticAutoRemoteCluster CA] but the server did not provide a copy of the issuing certificate in the certificate chain; this ssl context ([(shared)(with trust configuration: JDK-trusted-certs)]) is not configured to trust that issuer but trusts [97] other issuers
sun.security.validator.ValidatorException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
```

远程集群记录 `client did not trust this server's certificate`：

```txt
[2023-06-29T09:40:55,478][WARN ][o.e.x.c.s.t.n.SecurityNetty4Transport][remote-node] client did not trust this server's certificate, closing connection Netty4TcpChannel{localAddress=/192.168.0.42:9443, remoteAddress=/192.168.0.84:57305, profile=_remote_cluster}
```

**解决方法**：仔细阅读本地集群上的警告日志消息，以确定失败的确切原因。例如：

- 远程集群证书是否未由受信任的 CA 签名？这是最可能的原因。
- 主机名验证是否失败？
- 证书是否已过期？

一旦你知道了原因，你应该能够通过调整本地集群或远程集群上与远程集群相关的 SSL 设置来修复它。

通常，问题出在本地集群上。例如，通过配置必要的受信任 CA（`xpack.security.remote_cluster_client.ssl.certificate_authorities`）来修复。

如果你更改了 `elasticsearch.yml` 文件，需要重启关联的集群才能使更改生效。

## API 密钥身份验证问题

### 使用 API 密钥身份验证时连接到传输端口

使用 API 密钥身份验证时，本地集群应连接到远程集群的远程集群服务器端口（默认为 `9443`），而不是传输端口（默认为 `9300`）。配置错误可能导致多种症状：

**症状 1**：建议为传输接口和远程集群服务器接口使用不同的 CA 和证书。如果遵循此建议，远程集群客户端节点将不信任远程集群在传输接口上出示的服务器证书。本地集群记录 `failed to establish trust with server`（主体名称为 `[CN=transport]` 的证书，由 `[CN=ElasticAutoTransport CA]` 颁发，而 SSL 上下文 `xpack.security.remote_cluster_client.ssl` 只信任颁发者 `[CN=ElasticAutoRemoteCluster CA]`）；以 `PKIX path building failed ... unable to find valid certification path to requested target` 结束。远程集群记录 `client did not trust this server's certificate`（profile=`default`）。

**症状 2**：CA 和证书可以在传输接口和远程集群服务器接口之间共享。由于远程集群客户端默认没有客户端证书，服务器将无法验证客户端证书。本地集群记录 `Received fatal alert: bad_certificate`；远程集群记录 `Empty client certificate chain`。

**症状 3**：如果远程集群客户端配置为 mTLS 并提供了有效的客户端证书，连接会失败，因为客户端没有发送预期的身份验证头。本地集群记录 `missing authentication credentials for action [cluster:internal/remote_cluster/handshake]`。这不会显示在远程集群的日志中。

**症状 4**：如果在远程集群上启用了匿名访问且不需要身份验证，根据匿名用户的权限，本地集群可能记录以下内容。如果匿名用户没有建立连接所需的权限，本地集群会为用户 `[anonymous_foo]` 记录 `unauthorized`，指出该操作由集群权限 `[cross_cluster_search,cross_cluster_replication,manage,all]` 授予。如果匿名用户具有必要的权限（例如它是超级用户），本地集群记录 `requires channel profile to be [_remote_cluster], but got [default]`。

**解决方法**：检查端口号，确保你确实连接到远程集群服务器而不是传输接口。

### 未使用跨集群 API 密钥进行连接

本地集群使用跨集群 API 密钥的存在来确定它连接到远程集群所使用的模型。如果存在跨集群 API 密钥，它使用基于 API 密钥的身份验证；否则使用基于证书的身份验证。你可以在本地集群上使用远程集群信息 API（`GET /_remote/info`）检查正在使用的模型，它应返回 `"connected": true`，对于 API 密钥身份验证还应返回 `"cluster_credentials": "::es_redacted::"`。你也可以检查日志。

**症状 1**：如果未使用跨集群 API 密钥，本地集群使用基于证书的身份验证方法，并使用传输接口的 TLS 配置连接到远程集群。如果远程集群的传输接口和远程集群服务器接口具有不同的 TLS CA 和证书（这是推荐做法），TLS 验证将失败。本地集群记录 `failed to establish trust with server`（SSL 上下文 `xpack.security.transport.ssl` 只信任 `[CN=ElasticAutoTransport CA]`）；远程集群记录 `client did not trust this server's certificate`。

**症状 2**：即使 TLS 验证不是问题，连接也会由于缺少凭据而失败。本地集群记录：

```txt
Cross cluster requests through the dedicated remote cluster server port require transport header [_cross_cluster_access_credentials] but none found. Please ensure you have configured remote cluster credentials on the cluster originating the request.
```

这不会显示在远程集群的日志中。

**解决方法**：将跨集群 API 密钥添加到本地集群每个节点上的 Elasticsearch 密钥库。使用节点重载安全设置 API 重载密钥库。

### 使用了错误的 API 密钥类型

基于 API 密钥的身份验证需要跨集群 API 密钥。它不适用于 REST API 密钥。

**症状**：本地集群记录 `authentication expected API key type of [cross_cluster]`，例如 `but API key [agZXJocBmA2beJfq2yKu] has type [rest]`。这不会显示在远程集群的日志中。

**解决方法**：请远程集群管理员创建并分发跨集群 API 密钥。在本地集群的每个节点上，将 Elasticsearch 密钥库中的现有 API 密钥替换为此跨集群 API 密钥。使用节点重载安全设置 API 重载密钥库。

### 无效的 API 密钥

跨集群 API 密钥可能无法通过身份验证。例如，当其凭据不正确、或已失效或过期时。

**症状**：本地集群记录 `unable to authenticate user [agZXJocBmA2beJfq2yKu] for action [cluster:internal/remote_cluster/handshake]`。远程集群记录 `Authentication using apikey failed - invalid credentials for API key [agZXJocBmA2beJfq2yKu]`。

**解决方法**：请远程集群管理员创建并分发跨集群 API 密钥。在本地集群的每个节点上，将 Elasticsearch 密钥库中的现有 API 密钥替换为此跨集群 API 密钥。使用节点重载安全设置 API 重载密钥库。

### API 密钥或本地用户权限不足

在远程集群上运行请求的本地用户的有效权限由跨集群 API 密钥的权限与本地用户的 `remote_indices` 权限的交集决定。

**症状**：由于权限不足导致的请求失败会产生如下 API 响应：

```json
{"type":"security_exception","reason":"action [indices:data/read/search] towards remote cluster is unauthorized for user [foo] with assigned roles [foo-role] authenticated by API key id [agZXJocBmA2beJfq2yKu] of user [elastic-admin] on indices [cd], this action is granted by the index privileges [read,all]"}
```

这不会显示在任何日志中。

**解决方法**：
1. 检查本地用户是否具有必要的 `remote_indices` 或 `remote_cluster` 权限。如有必要，授予足够的 `remote_indices` 或 `remote_cluster` 权限。
2. 如果本地权限不是问题，请远程集群管理员创建并分发跨集群 API 密钥。在本地集群的每个节点上，将 Elasticsearch 密钥库中的现有 API 密钥替换为此跨集群 API 密钥。使用节点重载安全设置 API 重载密钥库。

### 本地用户没有 `remote_indices` 权限

这是权限不足的一种特殊情况。在这种情况下，本地用户对于目标远程集群完全没有任何 `remote_indices` 权限。Elasticsearch 可以检测到这一点并发出更明确的错误响应。

**症状**：这会产生如下 API 响应：

```json
{"type":"security_exception","reason":"action [indices:data/read/search] towards remote cluster [my] is unauthorized for user [foo] with effective roles [] (assigned roles [foo-role] were not found) because no remote indices privileges apply for the target cluster"}
```

**解决方法**：向本地用户授予足够的 `remote_indices` 权限。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/remote-clusters-troubleshooting.html)
