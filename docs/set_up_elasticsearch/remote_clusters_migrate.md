# 将远程集群从证书身份验证迁移到 API 密钥身份验证

远程集群基于 API 密钥的安全模型与基于 TLS 证书的安全模型相比，为管理员提供了更细粒度的访问控制。因此，你可能希望从基于证书的安全模型迁移到基于 API 密钥的模型。

虽然可以通过定义新的远程集群连接（使用新的别名）来进行迁移，但这有几个缺点：

- 对于跨集群复制，无法为现有任务更改领导者集群别名。因此，使用新的远程集群时，追随者索引需要从头重新创建。
- 对于跨集群搜索，转换和异常检测作业确实允许更新远程集群别名。但是，如果作业是使用通配符创建的（例如 `*:source_index`）并且具有 `superuser` 角色，添加新的远程集群将导致作业的工作量翻倍，并可能因重复而使结果产生偏差。

由于这些原因，你可能更倾向于就地迁移远程集群，遵循以下步骤：

1. 查阅前置条件
2. 重新配置远程集群并生成跨集群 API 密钥
3. 停止跨集群操作
4. 重新连接到远程集群
5. 恢复跨集群操作
6. 禁用基于证书的身份验证和授权

如果遇到任何问题，参阅故障排除。

## 前置条件

- 本地集群和远程集群的节点必须为版本 8.10 或更高。
- 本地集群和远程集群必须有适当的许可证。更多信息参阅 https://www.elastic.co/subscriptions。

## 重新配置远程集群并生成跨集群 API 密钥

在远程集群上：

1. 在远程集群的每个节点上启用远程集群服务器。在 `elasticsearch.yml` 中：
   1. 将 `remote_cluster_server.enabled` 设置为 `true`。
   2. 为远程集群服务器流量配置绑定和发布地址，例如使用 `remote_cluster.host`。如果不配置地址，远程集群流量可能绑定到本地接口，运行在其他机器上的远程集群将无法连接。
   3. 可选择使用 `remote_cluster.port` 配置远程服务器端口（默认为 `9443`）。

2. 接下来，生成证书颁发机构（CA）和服务器证书/密钥对。在远程集群的其中一个节点上，从 Elasticsearch 的安装目录：
   1. 如果你还没有 CA，创建一个：
      ```sh
      ./bin/elasticsearch-certutil ca --pem --out=cross-cluster-ca.zip --pass CA_PASSWORD
      ```
      将 `CA_PASSWORD` 替换为你想用于 CA 的密码。如果你不是部署到生产环境，可以移除 `--pass` 选项及其参数。
   2. 解压生成的 `cross-cluster-ca.zip` 文件。此压缩文件包含以下内容：
      ```txt
      /ca
      |_ ca.crt
      |_ ca.key
      ```
   3. 为远程集群中的节点生成证书和私钥对：
      ```sh
      ./bin/elasticsearch-certutil cert --out=cross-cluster.p12 --pass=CERT_PASSWORD --ca-cert=ca/ca.crt --ca-key=ca/ca.key --ca-pass=CA_PASSWORD --dns=example.com --ip=127.0.0.1
      ```
      - 将 `CA_PASSWORD` 替换为上一步中的 CA 密码。
      - 将 `CERT_PASSWORD` 替换为你想用于生成的私钥的密码。
      - 使用 `--dns` 选项指定证书的相关 DNS 名称。可以为多个 DNS 多次指定。
      - 使用 `--ip` 选项指定证书的相关 IP 地址。可以为多个 IP 地址多次指定。
   4. 如果远程集群有多个节点，你可以：
      - 为所有节点创建一个单一的通配符证书；
      - 或者，手动或通过静默模式批量为每个节点创建单独的证书。

3. 在远程集群的每个节点上：
   1. 将上一步的 `cross-cluster.p12` 文件复制到 `config` 目录。如果你没有创建通配符证书，确保复制正确的节点专属 p12 文件。
   2. 在 `elasticsearch.yml` 中添加以下配置：
      ```yaml
      xpack.security.remote_cluster_server.ssl.enabled: true
      xpack.security.remote_cluster_server.ssl.keystore.path: cross-cluster.p12
      ```
   3. 将 SSL 密钥库密码添加到 Elasticsearch 密钥库：
      ```sh
      ./bin/elasticsearch-keystore add xpack.security.remote_cluster_server.ssl.keystore.secure_password
      ```
      出现提示时，输入上一步中的 `CERT_PASSWORD`。

4. 重启远程集群。
5. 在远程集群上，生成一个跨集群 API 密钥，提供对你要用于跨集群搜索或跨集群复制的索引的访问。你可以使用创建跨集群 API 密钥 API 或 Kibana。
6. 将编码后的密钥（响应中的 `encoded`）复制到安全位置。稍后连接到远程集群时需要用到它。

## 停止跨集群操作

在本地集群上，停止引用该远程集群的任何持久任务：

- 使用停止转换 API 停止任何转换。
- 使用关闭作业 API 关闭任何异常检测作业。
- 使用暂停自动跟随模式 API 暂停任何自动跟随跨集群复制。
- 使用暂停追随者 API 暂停任何手动跨集群复制或从自动跟随模式创建的现有索引。

## 重新连接到远程集群

在本地集群上：

1. 为本地集群用户使用的任何角色增加跨集群复制和跨集群搜索所需的远程索引权限或远程集群权限。参阅配置角色和用户。注意：
   - 你只需要为用于跨集群操作的现有角色分配额外的 `remote_indices` 或 `remote_cluster` 权限。你应该能够从远程集群上的原始角色复制这些权限，在基于证书的安全模型下它们定义在远程集群上。
   - 本地集群上的角色不能超过跨集群 API 密钥授予的 `access` 权限。任何额外的本地权限都会被跨集群 API 密钥的权限抑制。
   - 如果跨集群复制或跨集群搜索任务已使用 `superuser` 角色配置，则无需更新。`superuser` 角色会自动更新以允许访问所有远程索引。
   - 以具有命名角色的普通用户身份运行的任务会立即以新权限更新。任务将在下次运行时加载新定义。
   - 你需要重启使用 API 密钥运行的任务（在后面的步骤中完成）。

2. 如果你已动态配置远程集群（通过集群设置 API）：
   1. 检索当前的远程集群配置，并将其存储在安全的地方。稍后如果需要回滚可能会用到。使用集群设置 API：
      ```txt
      GET /_cluster/settings?filter_path=persistent.cluster.remote
      ```
   2. 通过将远程集群设置设置为 `null` 来移除现有的远程集群定义。

3. 如果你已静态配置远程集群（通过 `elasticsearch.yml`），从 `elasticsearch.yml` 复制 `cluster.remote` 设置，并将其存储在安全的地方。稍后如果需要回滚可能会用到。

4. 在本地集群的每个节点上：
   1. 将之前在远程集群上生成的 `ca.crt` 文件复制到 `config` 目录，并将文件重命名为 `remote-cluster-ca.crt`。
   2. 在 `elasticsearch.yml` 中添加以下配置：
      ```yaml
      xpack.security.remote_cluster_client.ssl.enabled: true
      xpack.security.remote_cluster_client.ssl.certificate_authorities: [ "remote-cluster-ca.crt" ]
      ```
   3. 将之前在远程集群上创建的跨集群 API 密钥添加到密钥库：
      ```sh
      ./bin/elasticsearch-keystore add cluster.remote.ALIAS.credentials
      ```
      将 `ALIAS` 替换为迁移之前用于跨集群操作的相同别名。出现提示时，输入之前在远程集群上创建的编码跨集群 API 密钥。

5. 如果你已动态配置远程集群（通过集群设置 API）：
   1. 重启本地集群以加载密钥库和设置的更改。
   2. 重新添加远程集群。使用相同的远程集群别名，并将传输端口更改为远程集群端口。例如：
      ```txt
      PUT /_cluster/settings
      {
        "persistent": {
          "cluster": {
            "remote": {
              "my_remote": {
                "mode": "proxy",
                "proxy_address": "my.remote.cluster.com:9443"
              }
            }
          }
        }
      }
      ```
      说明：远程集群别名 — 使用迁移之前使用的相同别名；远程集群地址及远程集群端口（默认为 `9443`）。

6. 如果你已静态配置远程集群（通过 `elasticsearch.yml`）：
   1. 在本地集群的每个节点上更新 `elasticsearch.yml` 中的 `cluster.remote` 设置。将端口更改为远程集群端口（默认为 `9443`）。
   2. 重启本地集群以加载密钥库和设置的更改。

7. 使用远程集群信息 API 验证本地集群是否已成功连接到远程集群：
   ```txt
   GET /_remote/info
   ```
   API 响应应指示本地集群已连接到远程集群：
   ```json
   {
     "my_remote": {
       "connected": true,
       "mode": "proxy",
       "proxy_address": "my.remote.cluster.com:9443",
       "server_name": "",
       "num_proxy_sockets_connected": 0,
       "max_proxy_socket_connections": 18,
       "initial_connect_timeout": "30s",
       "skip_unavailable": false,
       "cluster_credentials": "::es_redacted::"
     }
   }
   ```
   说明：`connected: true` 表示远程集群已连接；`cluster_credentials` 如果存在，表示远程集群已使用 API 密钥身份验证连接。

## 恢复跨集群操作

恢复你之前停止的任何持久任务。任务应由迁移之前创建任务的同一用户或 API 密钥重启。确保此用户或 API 密钥的角色已更新为所需的 `remote_indices` 或 `remote_cluster` 权限。对于用户，任务在启动时捕获调用者的凭据并在该用户的安全上下文中运行。对于 API 密钥，重启任务将使用更新后的 API 密钥更新任务。

- 使用启动转换 API 启动任何转换。
- 使用打开作业 API 打开任何异常检测作业。
- 使用恢复追随者 API 恢复任何手动跨集群复制或从自动跟随模式创建的现有索引。
- 使用恢复自动跟随模式 API 恢复任何自动跟随跨集群复制。

## 禁用基于证书的身份验证和授权

只有在本地集群上已证明迁移成功之后才继续此步骤。如果迁移不成功，要么找出问题所在并尝试修复，要么进行回滚。

接下来，禁用基于证书的连接。可选择地，你还可以撤销授权。

1. 没有用于启用或禁用基于证书的跨集群连接的特定设置，因为它与集群内节点间通信共享相同的传输协议。

   远程集群管理员阻止现有本地集群连接的一种方法是更改 TLS 信任。具体步骤取决于集群的配置方式。一个通用的解决方案是重新创建远程传输接口使用的 CA 和证书/密钥，从而使现有的任何证书/密钥（本地或分发的）不再受信任。

   另一种解决方案是将 IP 过滤器应用于传输接口，阻止来自集群外部的流量。

2. 可选择地，删除远程集群上仅用于跨集群操作的任何角色。在基于 API 密钥的安全模型下，这些角色不再使用。

## 回滚

如果你需要回滚，在本地集群上遵循以下步骤：

1. 停止引用该远程集群的任何持久任务。
2. 通过将远程集群设置设置为 `null` 来移除远程集群定义。
3. 从迁移期间更新的任何角色中移除 `remote_indices` 或 `remote_cluster` 权限。
4. 在每个节点上，从 `elasticsearch.yml` 中移除 `remote_cluster_client.ssl.*` 设置。
5. 重启本地集群以应用对密钥库和 `elasticsearch.yml` 的更改。
6. 在本地集群上，应用原始的远程集群设置。如果远程集群连接已静态配置（使用 `elasticsearch.yml` 文件），重启集群。
7. 使用远程集群信息 API 验证本地集群已连接到远程集群。响应应为 `"connected": true` 且没有 `"cluster_credentials": "::es_redacted::"`。
8. 重启你之前停止的任何持久任务。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/remote-clusters-migrate.html)
