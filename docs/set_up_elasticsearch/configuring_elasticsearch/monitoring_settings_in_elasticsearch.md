---
sidebar_position: 180
---

# Elasticsearch 中的监控设置

:::caution 警告
**7.16 弃用**

不推荐使用 Elasticsearch 监控插件来收集和发送监控数据。Metricbeat 是收集监测数据并将其发送到监测集群的推荐方法。如果你以前配置了传统收集方法，则应迁移到使用 Metricbeat 收集方法。参阅[使用 Metricbeat 收集 Elasticsearch 监测数据](/monitor_a_cluster/collecting_elasticsearch_monitoring_data_with_metribeat.html)。
:::

默认情况下，Elasticsearch 监控功能已启用，但数据收集已禁用。要启用数据收集，请使用 `xpack.monitoring.collection.enabled` 设置。

除非另有说明，否则可以使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings.html) 在实时集群上动态更新这些设置。

要调整监控数据在监控 UI 中的显示方式，请在 `kibana.yml` 中配置 [`xpack.monitoring` 设置](https://www.elastic.co/guide/en/kibana/8.10/monitoring-settings-kb.html)。要控制如何从 Logstash 收集监控数据，请在 `Logstash.yml` 配置监控设置。

详细信息，参阅[监控集群](https://www.elastic.co/guide/en/kibana/8.6/monitoring-settings-kb.html)。

## 常规监控设置

- `xpack.monitoring.enabled`

    [~~7.8.0~~]（[静态](/set_up_elasticsearch/configuring_elasticsearch)）已弃用，设置无效。

## 监控集合设置

`xpack.monitoring.collection` 设置控制如何从 Elasticsearch 节点收集数据。

- `xpack.monitoring.collection.enabled`

    （[动态](/rest_apis/cluster_apis/cluster_update_settings.html)）[~~7.1.6~~] 设置为 `true` 以启用监控数据的收集。如果此设置为 `false`（默认值），则不会收集 Elasticsearch 监控数据，并忽略来自其他来源（如 Kibana、Beats 和 Logstash）的所有监控数据。

- `xpack.monitoring.collection.interval` ![elastic cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

    [~~6.3.0~~]（[动态](/rest_apis/cluster_apis/cluster_update_settings.html)）从 7.0.0 开始，不再支持设置为 `-1` 以禁用数据收集。

    控制数据采样的频率。默认值为 `10s`。如果修改收集间隔，请将 `kibana.yml` 中的 `xpack.monitoring.min_interval_seconds` 选项设置为相同的值。

- `xpack.monitoring.elasticsearch.collection.enabled`

    （[动态](/rest_apis/cluster_apis/cluster_update_settings.html)）[~~7.16.0~~] 控制是否应收集有关 Elasticsearch 集群的统计信息。默认为 `true`。这与 `xpack.monitoring.collection.enabled` 不同，它允许你启用或禁用所有监视集合。然而，此设置只是禁用 Elasticsearch 数据的收集，同时仍允许其他数据通过此集群收集（例如，Kibana、Logstash、Beats 或 APM 服务器监控数据）。

- `xpack.monitoring.collection.cluster.stats.timeout`

    （[动态](/rest_apis/cluster_apis/cluster_update_settings.html)）[~~7.16.0~~] 收集集群统计信息的超时（[时间单位](/rest_apis/api_conventions.html#时间单位)）。默认值为 `10s`。

- `xpack.monitoring.collection.node.stats.timeout`

    （[动态](/rest_apis/cluster_apis/cluster_update_settings.html)）[~~7.16.0~~] 收集节点统计信息的超时（[时间单位](/rest_apis/api_conventions.html#时间单位)）。默认值为 `10s`。

- `xpack.monitoring.collection.indices`

    （[动态](/rest_apis/cluster_apis/cluster_update_settings.html)）[~~7.16.0~~] 控制监控功能从中收集数据的索引。默认为所有索引。将索引名称指定为逗号分隔的列表，例如 `test1,test2,test3`。名称可以包含通配符，例如 `test*`。可以通过在 `-` 前面加前缀来显式排除索引。例如 `test*,-test3` 将监视除 `test3` 之外的所有以 `test` 开头的索引。像 `.security*` 或 `.kibana*` 这样的系统索引总是以 `.` 并且通常应当被监测。可以考虑在索引列表中添加 `.*`，以确保对系统索引进行监控。例如：`.*,test*,-test3`

- `xpack.monitoring.collection.index.stats.timeout`

    （[动态](/rest_apis/cluster_apis/cluster_update_settings.html)）[~~7.16.0~~] 收集索引统计信息超时（[时间单位](/rest_apis/api_conventions.html#时间单位)）。默认值为 `10s`。

- `xpack.monitoring.collection.index.recovery.active_only`

    （[动态](/rest_apis/cluster_apis/cluster_update_settings.html)）[~~7.16.0~~] 控制是否收集所有恢复。设置为 `true` 以仅收集活动恢复。默认为 `false`。

- `xpack.monitoring.collection.index.recovery.timeout`

    （[动态](/rest_apis/cluster_apis/cluster_update_settings.html)）[~~7.16.0~~] 收集恢复信息的超时（[时间单位](/rest_apis/api_conventions.html#时间单位)）。默认值为 `10s`。

- `xpack.monitoring.history.duration` ![elastic cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

    （[动态](/rest_apis/cluster_apis/cluster_update_settings.html)）[~~7.16.0~~] 保留期限，超过该期限后，监控导出器创建的索引将自动删除（[时间单位](/rest_apis/api_conventions.html#时间单位)）。默认为 `7d`（7 天）。

    此设置的最小值为 `1d`（1 天），以确保正在监控某些内容并且无法禁用。

    :::danger 重要
    此设置当前仅影响 `local -` 类型导出程序。使用 `http` 导出器创建的索引不会自动删除。
    :::

- `xpack.monitoring.exporters`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）配置代理存储监视数据的位置。默认情况下，代理使用本地导出器，该导出器为安装它的集群上的监控数据编制索引。使用 HTTP 导出器将数据发送到单独的监视集群。详细信息，参阅[本地导出器设置](/set_up_elasticsearch/monitoring_settings_in_elasticsearch.html#本地导出器设置)、[HTTP 导出器设置](/set_up_elasticsearch/monitoring_settings_in_elasticsearch.html#http-导出器设置)和[如何运行](/monitor_a_cluster/how_it_works.html)。

## 本地导出器设置

`local` 导出器是监控功能使用的默认导出器。顾名思义，它将数据导出到本地集群，这意味着不需要太多配置。

如果你没有提供*任何*导出程序，那么监控功能将自动为你创建一个导出程序。如果提供了任何导出器，则不会添加默认值。

```yaml
xpack.monitoring.exporters.my_local:
  type: local
```

- `type`

    [~~7.16.0~~] 本地导出器的值必须始终是 `local`，并且是必需的。

- `use_ingest`

    是否为集群提供占位符管道，并为每个批量请求提供管道处理器。默认值为 `true`。如果禁用，则意味着它将不使用管道，这意味着将来的版本无法自动将批量请求升级到将来的版本。

- `cluster_alerts.management.enabled`

    [~~7.16.0~~] 是否为此群集创建集群警报。默认值为 `true`。若要使用此功能，必须启用观察器。如果你拥有基本许可，则不会显示集群警报。

- `wait_master.timeout`

    [~~7.16.0~~] 等待主节点设置本地导出器以进行监控的时间（[时间单位](/rest_apis/api_conventions.html#时间单位)）。在等待期之后，非主节点会警告用户可能丢失的配置。默认为 `30s`。

## HTTP 导出器设置

以下列出了可以随 `http` 导出器提供的设置。所有设置都显示为你为导出器选择的名称后面的内容：

```yaml
xpack.monitoring.exporters.my_remote:
  type: http
  host: ["host:port", ...]
```

- `type`

    [~~7.16.0~~] HTTP 导出器的值必须始终为 `http`，并且是必需的。

- `host`

    [~~7.16.0~~] 主机支持多种格式，既可以作为数组，也可以作为单个值。支持的格式包括 `hostname`、`hostname:port`、`http://hostname`、`http://hostname:port`、`https://hostname` 和 `https://hostname:port`。无法假定主机。默认协议始终为 `http`，如果未作为 `host` 字符串的一部分提供，则默认端口始终为 `9200`。

    ```yaml
    xpack.monitoring.exporters:
      example1:
        type: http
        host: "10.1.2.3"
      example2:
        type: http
        host: ["http://10.1.2.4"]
      example3:
        type: http
        host: ["10.1.2.5", "10.1.2.6"]
      example4:
        type: http
        host: ["https://10.1.2.3:9200"]
    ```    

- `auth.username`

    [~~7.16.0~~] 如果提供了 `auth.secure_password`，则需要用户名。

- `auth.secure_password`

    （[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_settings.html)，[可重载](/set_up_elasticsearch/configuring_elasticsearch/secure_settings.html#可重载的安全设置)）[~~7.16.0~~] `auth.username` 的密码。

- `connection.timeout`

    [~~7.16.0~~] HTTP 连接等待套接字打开请求的时间值（[时间单位](/rest_apis/api_conventions.html#时间单位)）。默认值为 `6s`。

- `connection.read_timeout`

    [~~7.16.0~~] HTTP 连接等待套接字发送回响应的时间值（[时间单位](/rest_apis/api_conventions.html#时间单位)）。默认值为 `10 * connection.timeout`（如果两者都未设置，则为 `60s`）。

- `ssl`

    [~~7.16.0~~] 每个 HTTP 导出器都可以定义自己的 TLS/SSL 设置或继承它们。参阅 [X-Pack 监控 TLS/SSL 设置](/set_up_elasticsearch/monitoring_settings_in_elasticsearch.html#x-pack-监控-tls-ssl-设置)。

- `proxy.base_path`

    [~~7.16.0~~] 前缀任何传出请求的基本路径，例如 `/base/path`（例如，批量请求将以 `/base/path/_bulk` 的形式发送）。没有默认值。

- `headers`

    [~~7.16.0~~] 添加到每个请求的可选头，可以帮助通过代理路由请求。

    ```yaml
    xpack.monitoring.exporters.my_remote:
      headers:
        X-My-Array: [abc, def, xyz]
        X-My-Header: abc123
    ```

    基于数组的头发送 `n` 次，其中 `n` 是数组的大小。`Content-Type` 和 `Content-Length` 不能设置。监视代理创建的任何头都将覆盖此处定义的任何内容。

- `index.name.time_format`

    [~~7.16.0~~] 用于更改每日监控索引的默认日期后缀的机制。默认格式为 `yyyy.MM.dd`。例如，`.monitoring-es-7-2021.08.26`。

- `use_ingest`

    是否为每个批量请求向监视集群和管道处理器提供占位符管道。默认值为 `true`。如果禁用，则意味着它将不使用管道，这意味着将来的版本无法自动将批量请求升级到将来的版本。

- `cluster_alerts.management.enabled`

    [~~7.16.0~~] 是否为此集群创建集群警报。默认值为 `true`。若要使用此功能，必须启用观察器。如果你拥有基本许可，则不会显示集群警报。

- `cluster_alerts.management.blacklist`

    [~~7.16.0~~] 防止创建特定集群警报。它还会删除当前集群中已存在的所有适用的监控。

    你可以将以下任何监控标识符添加到阻止的警报列表中：

    - `elasticsearch_cluster_status`
    - `elasticsearch_version_mismatch`
    - `elasticsearch_nodes`
    - `kibana_version_mismatch`
    - `logstash_version_mismatch`
    - `xpack_license_expiration`

    例如：`["elasticsearch_version_mismatch","xpack_license_expiration"]`。

## X-Pack 监控 TLS/SSL 设置

你可以配置以下的 TLS/SSL 设置。

- `xpack.monitoring.exporters.$NAME.ssl.supported_protocols`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 支持的协议版本。有效协议：`SSLv2Hello`、`SSLv3`、`TLSv1`、`TLSv1.1`、`TLSv1.2`、`TLSv1.3`。如果 JVM 的 SSL 提供程序支持 `TLSv1.3`，则默认值为 `TLSv1.3,TLSv1.2,TLSv1.1`。否则，默认值为 `TLSv1.2,TLSv1.1`。

    Elasticsearch 依赖于 JDK 对 SSL 和 TLS 的实现。查看 [JDK 版本支持的 SSL/TLS 版本](/secure_the_elastic_stack/manually_configure_security/supported_ssltls_versions_by_jdk_version.html)以了解更多信息。

    :::tip 注意
    如果 `xpack.security.fips_mode.enabled` 为 `true`，则不能使用 `SSLv2Hello` 或 `SSLv3`。参阅 [FIPS 140-2](/secure_the_elastic_stack/manually_configure_security/fips_140_2.html)。
    :::

- `xpack.monitoring.exporters.$NAME.ssl.verification_mode`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 控制证书的验证。

    有效值：

    - `full`，它验证所提供的证书是否由可信机构（CA）签名，并验证服务器的主机名（或 IP 地址）是否与证书中标识的名称匹配。
    - `certificate`，该证书验证所提供的证书是否由可信机构（CA）签名，但不执行任何主机名验证。
    - `none`，它不执行服务器证书的验证。此模式禁用了 SSL/TLS 的许多安全优势，只有在非常仔细的考虑后才能使用。它主要用于解决TLS错误时的临时诊断机制；强烈反对将其用于生产集群。

    默认值为 `full`。

- `xpack.monitoring.exporters.$NAME.ssl.cipher_suites`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 支持的密码套件因你使用的Java版本而异。例如，对于版本12，默认值为：`TLS_AES_256_GCM_SHA384`、 `TLS_AES_128_GCM_SHA256`、 `TLS_CHACHA20_POLY1305_SHA256`、 `TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384`、 `TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256`、 `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`、 `TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`、 `TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256`、 `TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256`、 `TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384`、 `TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256`、 `TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384`、 `TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256`、 `TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA`、 `TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA`、 `TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA`、 `TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA`、 `TLS_RSA_WITH_AES_256_GCM_SHA384、 TLS_RSA_WITH_AES_128_GCM_SHA256`、 `TLS_RSA_WITH_AES_256_CBC_SHA256`、 `TLS_RSA_WITH_AES_128_CBC_SHA256`、 `TLS_RSA_WITH_AES_256_CBC_SHA`、 `TLS_RSA_WITH_AES_128_CBC_SHA`。

    有关更多信息，参阅 Oracle 的 [Java Cryptography Architecture 文档](https://docs.oracle.com/en/java/javase/11/security/oracle-providers.html#GUID-7093246A-31A3-4304-AC5F-5FB6400405E2)。

### X-Pack 监控 TLS/SSL 密钥和受信任的证书设置

以下设置用于指定在通过 SSL/TLS 连接进行通信时应使用的私钥、证书和受信任证书。私钥和证书是可选的，如果服务器需要客户端认证以进行 PKI 认证，则将使用私钥和证书。

### PEM 编码文件

使用 PEM 编码文件时，请使用以下设置：

- `xpack.monitoring.exporters.$NAME.ssl.key`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 包含私钥的 PEM 编码文件的路径。

    如果需要 HTTP 客户端认证，它将使用此文件。不能同时使用此设置和 `ssl.keystore.path`。

- `xpack.monitoring.exporters.$NAME.ssl.key_passphrase`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 用于解密私钥的密码。由于密钥可能未加密，因此此值是可选的。

    不能同时使用此设置和 `ssl.secure_key_passphrase`。

- `xpack.monitoring.exporters.$NAME.ssl.secure_key_passphrase`

    （[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_settings.html)）[~~7.16.0~~] 用于解密私钥的密码。由于密钥可能未加密，因此此值是可选的。

- `xpack.monitoring.exporters.$NAME.ssl.certificate`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 指定与密钥关联的 PEM 编码证书（或证书链）的路径。

    仅当设置了 `ssl.key` 时，才能使用此设置。

- `xpack.monitoring.exporters.$NAME.ssl.certificate_authorities`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 7.16.0 已弃用。应信任的 PEM 编码证书文件的路径列表。

    此设置和 `ssltruststore.path` 不能同时使用。

### Java keystore 文件

当使用 Java keystore 文件（JKS）（其中包含应信任的私钥、证书和证书）时，请使用以下设置：

- `xpack.monitoring.exporters.$NAME.ssl.keystore.path`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 包含私钥和证书的密钥库文件的路径。

    它必须是 Java keystore 库（jks）或 PKCS#12 文件。不能同时使用此设置和 `ssl.key`。

- `xpack.monitoring.exporters.$NAME.ssl.keystore.password`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] keystore 的密码。

- `xpack.monitoring.exporters.$NAME.ssl.keystore.secure_password`

    （[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_settings.html)）[~~7.16.0~~] keystore 的密码。

- `xpack.monitoring.exporters.$NAME.ssl.keystore.key_password`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] keystore 中密钥的密码。默认值是 keystore 密码。

    不能同时使用此设置和 `ssl.keystore.secure_password`。

- `xpack.monitoring.exporters.$NAME.ssl.keystore.secure_key_password`

    （[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_settings.html)）[~~7.16.0~~] keystore 中密钥的密码。默认值是 keystore 密码。

- `xpack.monitoring.exporters.$NAME.ssl.truststore.path`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 包含要信任的证书的 keystore 的路径。它必须是 Java keystore 库（jks）或 PKCS#12 文件。

    不能同时使用此设置和 `ssl.certificate_authorities`。

- `xpack.monitoring.exporters.$NAME.ssl.truststore.password`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] truststore 的密码。

    不能同时使用此设置和 `ssltruststore.secure_password`。

- `xpack.monitoring.exporters.$NAME.ssl.truststore.secure_password`

    （[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_settings.html)）[~~7.16.0~~] truststore 的密码。

### PKCS#12 文件

Elasticsearch 可以配置为使用 PKCS#12 容器文件（`.p12` 或 `.pfx` 文件），这些文件包含应信任的私钥、证书和证书。

PKCS#12 文件的配置方式与 Java keystore 文件相同：

- `xpack.monitoring.exporters.$NAME.ssl.keystore.path`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 包含私钥和证书的密钥库文件的路径。

    它必须是 Java keystore（jks）或 PKCS#12 文件。不能同时使用此设置和 `ssl.key`。

- `xpack.monitoring.exporters.$NAME.ssl.keystore.type`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] keystore 文件的格式。它必须是 `jks` 或 `PKCS12`。如果密钥库路径以 “.p12”、“.pfx” 或 “.pkcs12” 结尾，则此设置默认为 `pkcs12`。否则，默认为 `jks`。

- `xpack.monitoring.exporters.$NAME.ssl.keystore.secure_password`

    （[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_settings.html)）[~~7.16.0~~] keystore 密码。

- `xpack.monitoring.exporters.$NAME.ssl.keystore.key_password`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] keystore 中密钥的密码。默认值是 keystore 密码。

    不能同时使用此设置和 `ssl.keystore.secure_password`。

- `xpack.monitoring.exporters.$NAME.ssl.keystore.secure_key_password`

    （[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_settings.html)）[~~7.16.0~~] keystore 中密钥的密码。默认值是 keystore 密码。

- `xpack.monitoring.exporters.$NAME.ssl.truststore.path`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 包含要信任的证书的 keystore 的路径。它必须是 Java keystore（jks）或 PKCS#12 文件。

    不能同时使用此设置和 `ssl.certificate_authorities`。

- `xpack.monitoring.exporters.$NAME.ssl.truststore.type`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] 将其设置为 PKCS12 以指示信任库是 PKCS#12 文件。

- `xpack.monitoring.exporters.$NAME.ssl.truststore.password`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch)）[~~7.16.0~~] truststore 密码。

    不能同时使用此设置和 `ssltruststore.secure_password`。

- `xpack.monitoring.exporters.$NAME.ssl.truststore.secure_password`

    （[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_settings.html)）[~~7.16.0~~] truststore 密码。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/monitoring-settings.html)
