# 使用 API 密钥身份验证添加远程集群

API 密钥身份验证使本地集群能够通过**跨集群 API 密钥**（使用创建跨集群 API 密钥 API 创建）向远程集群验证自己。该 API 密钥必须由远程集群的管理员创建。本地集群被配置为在每次向远程集群发出的请求中提供此 API 密钥。远程集群验证该 API 密钥并根据 API 密钥的权限授予访问权限。

要点：

- 来自本地集群的所有跨集群请求都受 API 密钥权限的约束，无论本地用户是谁。例如，如果 API 密钥只允许对远程集群上的 `my-index` 进行读取访问，即使是本地超级用户也受此约束的限制。
- 远程集群的管理员完全控制谁可以通过跨集群搜索和/或跨集群复制访问哪些数据 — 除了显式分配给 API 密钥的权限之外，不可能有任何访问。
- 在本地集群侧，管理员可以在 API 密钥权限的基础上进一步限制本地用户，但**不可能提高超出** API 密钥允许范围的权限。
- 跨集群操作使用**专用服务器端口**（远程集群接口）。远程集群必须启用此端口；应为该端口配置 TLS 以最大化安全性。
- 本地集群必须信任为远程集群接口使用的服务器证书签名的远程集群 CA。所有参与的本地节点基于 TLS 信任配置验证来自远程侧的证书。

步骤：

1. 查阅前置条件
2. 与远程集群建立信任
3. 连接到远程集群
4. 配置角色和用户

## 前置条件

- 两个集群的每个节点上都必须启用 Elasticsearch 安全功能。安全功能默认启用；如果已禁用，请在 `elasticsearch.yml` 中将 `xpack.security.enabled` 设置为 `true`。
- 本地集群和远程集群的节点必须为**版本 8.10 或更高**。
- 两个集群都必须有适当的许可证（参阅 https://www.elastic.co/subscriptions）。

## 与远程集群建立信任

如果远程集群是 Elasticsearch Service 部署的一部分，它默认具有有效证书 — 你可以跳过与证书相关的步骤。

### 在远程集群上

1. 在每个节点上**启用远程集群服务器**。在 `elasticsearch.yml` 中：
   1. 将 `remote_cluster_server.enabled` 设置为 `true`。
   2. 配置绑定和发布地址，例如使用 `remote_cluster.host`（否则流量可能绑定到本地接口，其他机器上的远程集群将无法连接）。
   3. 可选择使用 `remote_cluster.port` 配置端口（默认为 `9443`）。

2. 在一个远程节点上，从 Elasticsearch 安装目录**生成 CA 和服务器证书/密钥对**：
   1. 创建 CA（如果你还没有）：
      ```sh
      ./bin/elasticsearch-certutil ca --pem --out=cross-cluster-ca.zip --pass CA_PASSWORD
      ```
      （非生产环境可移除 `--pass`。）
   2. 解压 `cross-cluster-ca.zip`，其中包含：
      ```txt
      /ca
      |_ ca.crt
      |_ ca.key
      ```
   3. 生成证书和私钥对：
      ```sh
      ./bin/elasticsearch-certutil cert --out=cross-cluster.p12 --pass=CERT_PASSWORD --ca-cert=ca/ca.crt --ca-key=ca/ca.key --ca-pass=CA_PASSWORD --dns=example.com --ip=127.0.0.1
      ```
      `--dns` 和 `--ip` 可以多次指定。
   4. 对于多节点集群：创建一个单一的通配符证书，或为每个节点创建单独的证书（手动或通过静默模式）。

3. **在每个远程节点上**：
   1. 将 `cross-cluster.p12` 文件（如果没有通配符证书则为对应节点的证书）复制到 `config` 目录。
   2. 在 `elasticsearch.yml` 中添加：
      ```yaml
      xpack.security.remote_cluster_server.ssl.enabled: true
      xpack.security.remote_cluster_server.ssl.keystore.path: cross-cluster.p12
      ```
   3. 将 SSL 密钥库密码添加到密钥库：
      ```sh
      ./bin/elasticsearch-keystore add xpack.security.remote_cluster_server.ssl.keystore.secure_password
      ```
      出现提示时输入 `CERT_PASSWORD`。

4. **重启远程集群。**

5. 在远程集群上**生成跨集群 API 密钥**，该密钥提供对用于跨集群搜索或复制的索引的访问。使用创建跨集群 API 密钥 API 或 Kibana。

6. **将编码后的密钥**（响应中的 `encoded`）复制到安全位置 — 连接时需要用到。

### 在本地集群上

1. **在每个本地节点上**：
   1. 将远程集群的 `ca.crt` 复制到 `config` 目录，并重命名为 `remote-cluster-ca.crt`。
   2. 在 `elasticsearch.yml` 中添加：
      ```yaml
      xpack.security.remote_cluster_client.ssl.enabled: true
      xpack.security.remote_cluster_client.ssl.certificate_authorities: [ "remote-cluster-ca.crt" ]
      ```
   3. 将跨集群 API 密钥添加到密钥库：
      ```sh
      ./bin/elasticsearch-keystore add cluster.remote.ALIAS.credentials
      ```
      将 `ALIAS` 替换为稍后创建远程集群条目时使用的相同名称；出现提示时输入编码后的 API 密钥。

2. **重启本地集群**以加载密钥库和设置的更改。

:::note 注意

如果只配置跨集群 API 密钥，你可以调用节点重载安全设置 API 而不是重启。在 `elasticsearch.yml` 中更改 `remote_cluster_client` 设置仍然需要重启。

:::

## 连接到远程集群

你必须拥有 `manage` 集群权限。本地集群使用远程集群接口，从协调节点建立到特定远程节点的长存 TCP 连接；这些连接即使在空闲时也必须保持打开。

**通过 Kibana（Stack Management）**：

1. 从侧边导航中选择 **Remote Clusters**。
2. 输入名称（集群别名）。
3. 指定 Elasticsearch 端点 URL，或 IP/主机名加远程集群端口（默认 `9443`），例如 `cluster.es.eastus2.staging.azure.foundit.no:9443` 或 `192.168.1.1:9443`。

**通过集群更新设置 API**（动态地，对每个节点生效；或使用静态 `elasticsearch.yml` 设置针对单个节点）：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster": {
      "remote": {
        "cluster_one": {
          "seeds": [ "127.0.0.1:9443" ]
        }
      }
    }
  }
}
```

其中集群别名为 `cluster_one`；`seeds` 指定种子节点的主机名和远程集群端口。

**使用远程集群信息 API 验证连接**：

```txt
GET _remote/info
```

示例响应：

```json
{
  "cluster_one": {
    "seeds": ["127.0.0.1:9443"],
    "connected": true,
    "num_nodes_connected": 1,
    "max_connections_per_cluster": 3,
    "initial_connect_timeout": "30s",
    "skip_unavailable": true,
    "cluster_credentials": "::es_redacted::",
    "mode": "sniff"
  }
}
```

- `num_nodes_connected`：本地集群连接到的远程节点数量。
- `skip_unavailable`：当没有可用节点时，是否在跨集群搜索中跳过此远程集群。
- `cluster_credentials`：如果存在，表示该远程集群是使用 **API 密钥身份验证**连接的。

### 动态配置远程集群

添加多个远程集群：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster": {
      "remote": {
        "cluster_one": { "seeds": [ "127.0.0.1:9443" ] },
        "cluster_two": {
          "mode": "sniff",
          "seeds": [ "127.0.0.1:9444" ],
          "transport.compress": true,
          "skip_unavailable": true
        },
        "cluster_three": {
          "mode": "proxy",
          "proxy_address": "127.0.0.1:9445"
        }
      }
    }
  }
}
```

`mode` 在未指定时默认为 `sniff`；`proxy` 模式使用 `proxy_address` 代替。

动态更新设置（例如压缩/ping 计划）：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster": {
      "remote": {
        "cluster_two": { "transport.compress": false },
        "cluster_three": { "transport.compress": true, "transport.ping_schedule": "60s" }
      }
    }
  }
}
```

> 当压缩或 ping 计划设置发生变化时，所有现有的节点连接必须关闭并重新打开，这可能导致进行中的请求失败。

删除远程集群 — 为每个设置传递 `null`：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster": {
      "remote": {
        "cluster_two": {
          "mode": null,
          "seeds": null,
          "skip_unavailable": null,
          "transport.compress": null
        }
      }
    }
  }
}
```

### 静态配置远程集群

`elasticsearch.yml` 中的设置意味着只有这些节点可以连接并服务远程请求。动态 API 设置优先于 `elasticsearch.yml`：

```yaml
cluster:
  remote:
    cluster_one:
      seeds: 127.0.0.1:9443
    cluster_two:
      mode: sniff
      seeds: 127.0.0.1:9444
      transport.compress: true
      skip_unavailable: true
    cluster_three:
      mode: proxy
      proxy_address: 127.0.0.1:9445
```

## 配置角色和用户

要使用远程集群进行跨集群复制（CCR）或跨集群搜索（CCS），创建具有**远程索引权限**或**远程集群权限**的本地角色。通过 Kibana（Security > Roles）或角色管理 API 管理（至少需要 `manage_security` 集群权限）。

> 跨集群 API 密钥必须具有足够的权限，以覆盖单个用户所需的所有远程索引权限。

### 跨集群复制所需的权限

创建 `remote-replication` 角色（远程集群别名 `my_remote_cluster`）：

```txt
POST /_security/role/remote-replication
{
  "cluster": [ "manage_ccr" ],
  "remote_indices": [
    {
      "clusters": [ "my_remote_cluster" ],
      "names": [ "leader-index" ],
      "privileges": [ "cross_cluster_replication" ]
    }
  ]
}
```

创建具有此角色的本地用户（仅在本地集群）：

```txt
POST /_security/user/cross-cluster-user
{
  "password": "l0ng-r4nd0m-p@ssw0rd",
  "roles": [ "remote-replication" ]
}
```

### 跨集群搜索所需的权限

创建 `remote-search` 角色：

```txt
POST /_security/role/remote-search
{
  "remote_indices": [
    {
      "clusters": [ "my_remote_cluster" ],
      "names": [ "target-index" ],
      "privileges": [ "read", "read_cross_cluster", "view_index_metadata" ]
    }
  ]
}
```

创建具有此角色的本地用户（仅在本地集群）：

```txt
POST /_security/user/cross-search-user
{
  "password": "l0ng-r4nd0m-p@ssw0rd",
  "roles": [ "remote-search" ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/remote-clusters-api-key.html)
