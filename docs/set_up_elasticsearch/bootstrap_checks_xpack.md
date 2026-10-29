# X-Pack 的引导检查

除了 Elasticsearch 引导检查之外，还有一些特定于 X-Pack 特性的检查。

## 加密敏感数据检查

如果你使用 Watcher 并选择加密敏感数据（通过将 `xpack.watcher.encrypt_sensitive_data` 设置为 `true`），你还必须在安全设置存储中放置一个密钥。

要通过此引导检查，你必须在集群中的每个节点上设置 `xpack.watcher.encryption_key`。更多信息参阅在 Watcher 中加密敏感数据。

## PKI 域检查

如果你使用 Elasticsearch 安全功能和公钥基础设施（PKI）域，你必须在集群上配置传输层安全性（TLS）并在网络层（传输层或 http 层）上启用客户端身份验证。更多信息参阅 PKI 用户身份验证和设置基本安全加 HTTPS。

要通过此引导检查，如果启用了 PKI 域，你必须在至少一个网络通信层上配置 TLS 并启用客户端身份验证。

## 角色映射检查

如果你使用除本地域或文件域之外的域对用户进行身份验证，你必须创建角色映射。这些角色映射定义了向每个用户分配哪些角色。

如果你使用文件来管理角色映射，你必须配置一个 YAML 文件并将其复制到集群中的每个节点。默认情况下，角色映射存储在 `ES_PATH_CONF/role_mapping.yml` 中。或者，你可以为每种类型的域指定不同的角色映射文件，并在 `elasticsearch.yml` 文件中指定其位置。更多信息参阅使用角色映射文件。

要通过此引导检查，角色映射文件必须存在且必须有效。角色映射文件中列出的可分辨名称（DN）也必须有效。

## SSL/TLS 检查

如果你启用 Elasticsearch 安全功能，除非你拥有试用许可证，否则你必须为节点间通信配置 SSL/TLS。

使用环回接口的单节点集群没有此要求。更多信息参阅自动启用安全启动 Elastic Stack。

要通过此引导检查，你必须在集群中设置 SSL/TLS。

## 令牌 SSL 检查

如果你使用 Elasticsearch 安全功能并且启用了内置令牌服务，你必须将集群配置为对 HTTP 接口使用 SSL/TLS。使用令牌服务需要 HTTPS。

特别是，如果 `elasticsearch.yml` 文件中的 `xpack.security.authc.token.enabled` 设置为 `true`，你还必须将 `xpack.security.http.ssl.enabled` 设置为 `true`。有关这些设置的更多信息，参阅安全设置和高级 HTTP 设置。

要通过此引导检查，你必须启用 HTTPS 或禁用内置令牌服务。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-xpack.html)
