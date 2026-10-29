# 使用 TLS 证书身份验证添加远程集群

要使用 TLS 证书身份验证添加远程集群：

1. 查阅前置条件
2. 与远程集群建立信任
3. 连接到远程集群
4. 为远程集群配置角色和用户

如果遇到任何问题，参阅故障排除。

## 前置条件

1. 两个集群的每个节点上都需要启用 Elasticsearch 安全功能。安全功能默认启用。如果已禁用，请在 `elasticsearch.yml` 中将 `xpack.security.enabled` 设置为 `true`。参阅通用安全设置。

2. 本地集群和远程集群的版本必须兼容：
   - 任何节点都可以与相同主版本上的另一个节点通信（例如 7.0 可以与任何 7.x 节点通信）。
   - 只有主版本的最后一个次要版本上的节点才能与下一个主版本上的节点通信（例如 6.8 可以与任何 7.x 节点通信；6.7 只能与 7.0 通信）。
   - 版本兼容性是对称的（如果 6.7 ↔ 7.0 单向可行，则双向都可行）。
   - 兼容性表涵盖本地/远程集群版本：5.0–5.5、5.6、6.0–6.6、6.7、6.8、7.0、7.1–7.16、7.17、8.0–8.18。
   - Elastic 只支持其中一部分配置的跨集群搜索（参阅"支持的跨集群搜索配置"）。

## 与远程集群建立信任

- 要安全地使用跨集群复制或跨集群搜索，请在所有连接的集群上启用安全功能并在每个节点上配置 TLS。**传输接口**上最低要求配置 TLS；建议在 HTTP 接口上配置 TLS 以获得额外的安全性。
- 所有连接的集群必须在传输接口的 TLS 上**相互**信任：本地集群信任远程集群的 CA，反之亦然。所有连接的节点实际上形成了一个单一的安全域。
- 用户身份验证在**本地**集群上执行；用户的角色名称会传递给远程集群，远程集群根据其本地角色定义检查它们。
- 在每个节点上配置 TLS（参阅"为 Elastic Stack 设置基本安全"）。该过程对所有节点使用同一个 CA；或者，将每个集群的 CA 证书添加为其他集群上的受信任 CA（共享 CA 可以简化此过程）。

## 连接到远程集群

你必须拥有 `manage` 集群权限。本地集群使用传输接口建立与远程节点的长存 TCP 连接（连接即使在空闲时也必须保持打开）。

### 通过 Kibana（Stack Management）

1. 从侧边导航中选择 **Remote Clusters**。
2. 为远程集群输入名称（集群别名）。
3. 指定 Elasticsearch 端点 URL，或 IP/主机名加传输端口（默认 `9300`），例如 `cluster.es.eastus2.staging.azure.foundit.no:9300` 或 `192.168.1.1:9300`。

### 通过集群更新设置 API

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster": {
      "remote": {
        "cluster_one": {
          "seeds": [ "127.0.0.1:9300" ]
        }
      }
    }
  }
}
```

其中集群别名为 `cluster_one`；`seeds` 指定远程集群中种子节点的主机名和传输端口。

### 使用远程集群信息 API 验证连接

```txt
GET _remote/info
```

示例响应：

```json
{
  "cluster_one": {
    "seeds": ["127.0.0.1:9300"],
    "connected": true,
    "num_nodes_connected": 1,
    "max_connections_per_cluster": 3,
    "initial_connect_timeout": "30s",
    "skip_unavailable": true,
    "mode": "sniff"
  }
}
```

- `num_nodes_connected`：本地集群连接到的远程节点数量。
- `skip_unavailable`：当通过跨集群搜索该远程集群但没有可用节点时，是否跳过该远程集群。

### 动态配置远程集群

添加三个使用不同模式的远程集群：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster": {
      "remote": {
        "cluster_one": {
          "seeds": [ "127.0.0.1:9300" ]
        },
        "cluster_two": {
          "mode": "sniff",
          "seeds": [ "127.0.0.1:9301" ],
          "transport.compress": true,
          "skip_unavailable": true
        },
        "cluster_three": {
          "mode": "proxy",
          "proxy_address": "127.0.0.1:9302"
        }
      }
    }
  }
}
```

`mode` 默认为 `sniff`（如 `cluster_one` 所使用的）。

更新示例（更改压缩/ping 计划 — 注意这会关闭并重新打开现有连接，可能导致进行中的请求失败）：

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

删除示例（为 `cluster_two` 的每个设置传递 `null`）：

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

### 静态配置远程集群（`elasticsearch.yml`）

只有具有这些设置的节点才能连接并服务远程请求。动态 API 设置优先于 `elasticsearch.yml`：

```yaml
cluster:
  remote:
    cluster_one:
      seeds: 127.0.0.1:9300
    cluster_two:
      mode: sniff
      seeds: 127.0.0.1:9301
      transport.compress: true
      skip_unavailable: true
    cluster_three:
      mode: proxy
      proxy_address: 127.0.0.1:9302
```

## 为远程集群配置角色和用户

在**本地和远程集群上**创建具有**相同角色名称**的角色（定义可以不同）。通过 Kibana **Security > Roles** 或角色管理 API 管理（需要 `manage_security` 权限）。用户只在**本地**集群上创建。

### 用于跨集群复制

**远程集群**（领导者索引）— 角色 `remote-replication`：

```txt
POST _security/role/remote-replication
{
  "cluster": [ "read_ccr" ],
  "indices": [
    {
      "names": [ "leader-index-name" ],
      "privileges": [ "monitor", "read" ]
    }
  ]
}
```

**本地集群**（追随者索引）— 角色 `remote-replication`：

```txt
POST _security/role/remote-replication
{
  "cluster": [ "manage_ccr" ],
  "indices": [
    {
      "names": [ "follower-index-name" ],
      "privileges": [ "monitor", "read", "write", "manage_follow_index" ]
    }
  ]
}
```

**在本地集群上创建用户**：

```txt
POST _security/user/cross-cluster-user
{
  "password": "l0ng-r4nd0m-p@ssw0rd",
  "roles": [ "remote-replication" ]
}
```

说明：如果使用 API 密钥进行身份验证，API 密钥需要在**本地**集群上拥有远程侧的权限。如果使用代执行（run-as），进行身份验证的用户需要在远程集群上拥有 `run_as` 权限。

### 用于跨集群搜索

**远程集群** — 角色 `remote-search`：

```txt
POST _security/role/remote-search
{
  "indices": [
    {
      "names": [ "target-indices" ],
      "privileges": [ "read", "read_cross_cluster" ]
    }
  ]
}
```

**本地集群** — 角色 `remote-search`（权限可以为空）：

```txt
POST _security/role/remote-search
{}
```

**在本地集群上创建用户**：

```txt
POST _security/user/cross-search-user
{
  "password": "l0ng-r4nd0m-p@ssw0rd",
  "roles": [ "remote-search" ]
}
```

### 用于配合 Kibana 的跨集群搜索

授权分两步进行：本地集群检查远程集群访问权限，然后远程集群检查索引/数据流访问权限。远程目标指定为 `<remote_cluster_name>:<target>`。

**本地集群** — 角色 `logstash-reader`：

```txt
POST _security/role/logstash-reader
{
  "indices": [
    {
      "names": [ "logstash-*" ],
      "privileges": [ "read", "view_index_metadata" ]
    }
  ]
}
```

（如果本地集群配置为其自身的远程集群，Kibana 用户还应在本地获得 `read_cross_cluster` 权限。）

**在本地集群上创建 Kibana 用户**：

```txt
PUT _security/user/cross-cluster-kibana
{
  "password": "l0ng-r4nd0m-p@ssw0rd",
  "roles": [ "logstash-reader", "kibana-access" ]
}
```

**远程集群** — 角色 `logstash-reader`：

```txt
POST _security/role/logstash-reader
{
  "indices": [
    {
      "names": [ "logstash-*" ],
      "privileges": [ "read_cross_cluster", "read", "view_index_metadata" ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/remote-clusters-cert.html)
