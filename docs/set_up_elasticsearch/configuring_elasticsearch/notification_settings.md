# Watcher 设置

你配置 Watcher 设置来设置 Watcher，并通过电子邮件、Slack 和 PagerDuty 发送通知。

除安全设置（添加到 Elasticsearch 密钥库）之外，所有这些设置都可以添加到 `elasticsearch.yml` 配置文件中。有关创建和更新 Elasticsearch 密钥库的更多信息，参阅安全设置。动态设置也可以通过集群更新设置 API 在整个集群中更新。

## 通用 Watcher 设置

- **`xpack.watcher.enabled`**（静态）— 设置为 `false` 以在节点上禁用 Watcher。
- **`xpack.watcher.encrypt_sensitive_data`**（静态）— 设置为 `true` 以加密敏感数据。如果启用了此设置，你还必须指定 `xpack.watcher.encryption_key` 设置。更多信息参阅在 Watcher 中加密敏感数据。
- **`xpack.watcher.encryption_key`**（安全）— 指定包含用于加密敏感数据的密钥的文件的路径。如果 `xpack.watcher.encrypt_sensitive_data` 设置为 `true`，则此设置为必需。
- **`xpack.watcher.max.history.record.size`**（静态）— 可以写入 watch 历史索引的 watch 历史记录的最大大小。任何更大的历史记录将移除其一些较大的字段。默认为 `10mb`。
- **`xpack.http.proxy.host`**（静态）— 指定用于连接 HTTP 服务的代理服务器地址。
- **`xpack.http.proxy.port`**（静态）— 指定用于连接代理服务器的端口号。
- **`xpack.http.proxy.scheme`**（静态）— 用于与代理服务器通信的协议。有效值为 `http` 和 `https`。默认为请求中使用的协议。
- **`xpack.http.default_connection_timeout`**（静态）— 在发起连接时等待请求中止的最长期限。
- **`xpack.http.default_read_timeout`**（静态）— 在请求中止之前，两个数据包之间的最大非活动时间。
- **`xpack.http.tcp.keep_alive`**（静态）— 是否在 HTTP 连接上启用 TCP keepalive。默认为 `true`。
- **`xpack.http.connection_pool_ttl`**（静态）— 连接池中连接的存活时间。如果连接在此超时内未被复用，它将被关闭。默认情况下，存活时间是无限的，即连接永不过期。
- **`xpack.http.max_response_size`**（静态）— 指定 HTTP 响应允许的最大大小，默认为 `10mb`，最大可配置值为 `50mb`。
- **`xpack.http.whitelist`**（动态）— 内部 HTTP 客户端允许连接的 URL 列表。此客户端用于 HTTP 输入、webhook、slack、pagerduty 和 jira 操作。此设置可以动态更新。默认为 `*`，允许所有连接。

:::note 注意

如果你配置了此设置并且正在使用 slack/pagerduty 操作之一，你必须确保相应的端点也被显式允许。

:::

## Watcher HTTP TLS/SSL 设置

- **`xpack.http.ssl.supported_protocols`**（静态）— 支持的协议及版本。有效协议：`SSLv2Hello`、`SSLv3`、`TLSv1`、`TLSv1.1`、`TLSv1.2`、`TLSv1.3`。如果 JVM 的 SSL 提供程序支持 TLSv1.3，默认为 `TLSv1.3,TLSv1.2,TLSv1.1`；否则默认为 `TLSv1.2,TLSv1.1`。Elasticsearch 依赖于你的 JDK 的 SSL 和 TLS 实现。如果 `xpack.security.fips_mode.enabled` 为 `true`，则不能使用 `SSLv2Hello` 或 `SSLv3`（参阅 FIPS 140-2）。
- **`xpack.http.ssl.verification_mode`**（静态）— 定义如何验证 TLS 连接中另一方出示的证书。有效值：
  - `full` — 验证提供的证书：签发日期在 `not_before` 和 `not_after` 日期之间；链接到受信任的证书颁发机构（CA）；具有与证书中的名称匹配的主机名或 IP 地址。
  - `certificate` — 验证提供的证书并确认它由受信任的机构（CA）签名，但不检查证书主机名。
  - `none` — 不执行任何证书验证。

  :::warning 注意

  将证书验证设置为 `none` 会禁用 SSL/TLS 的许多安全优势，非常危险。只有在 Elastic 支持人员指示作为解决 TLS 错误的临时诊断机制时才设置此值。默认为 `full`。

  :::

- **`xpack.http.ssl.cipher_suites`**（静态）— 支持的密码套件取决于你使用的 Java 版本。例如，对于版本 12，默认值为：`TLS_AES_256_GCM_SHA384`、`TLS_AES_128_GCM_SHA256`、`TLS_CHACHA20_POLY1305_SHA256`、`TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384`、`TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256`、`TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`、`TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`、`TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256`、`TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256`、`TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384`、`TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256`、`TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384`、`TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256`、`TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA`、`TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA`、`TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA`、`TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA`、`TLS_RSA_WITH_AES_256_GCM_SHA384`、`TLS_RSA_WITH_AES_128_GCM_SHA256`、`TLS_RSA_WITH_AES_256_CBC_SHA256`、`TLS_RSA_WITH_AES_128_CBC_SHA256`、`TLS_RSA_WITH_AES_256_CBC_SHA`、`TLS_RSA_WITH_AES_128_CBC_SHA`。

## Watcher HTTP TLS/SSL 密钥和受信任证书设置

### PEM 编码文件

- **`xpack.http.ssl.key`**（静态）— 包含私钥的 PEM 编码文件的路径。如果需要 HTTP 客户端身份验证，则使用此文件。不能与 `ssl.keystore.path` 同时使用此设置。
- **`xpack.http.ssl.secure_key_passphrase`**（安全）— 用于解密私钥的密码短语。由于密钥可能未加密，因此此值是可选的。
- **`xpack.http.ssl.certificate`**（静态）— 指定与密钥关联的 PEM 编码证书（或证书链）的路径。只有在设置了 `ssl.key` 的情况下才能使用此设置。
- **`xpack.http.ssl.certificate_authorities`**（静态）— 应当信任的 PEM 编码证书文件的路径列表。此设置与 `ssl.truststore.path` 不能同时使用。

### Java 密钥库文件（JKS）

- **`xpack.http.ssl.keystore.path`**（静态）— 包含私钥和证书的密钥库文件的路径。它必须是 Java 密钥库（jks）或 PKCS#12 文件。不能与 `ssl.key` 同时使用此设置。
- **`xpack.http.ssl.keystore.secure_password`**（安全）— 密钥库的密码。
- **`xpack.http.ssl.keystore.secure_key_password`**（安全）— 密钥库中密钥的密码。默认为密钥库密码。
- **`xpack.http.ssl.truststore.path`**（静态）— 包含要信任的证书的密钥库的路径。它必须是 Java 密钥库（jks）或 PKCS#12 文件。不能与 `ssl.certificate_authorities` 同时使用此设置。
- **`xpack.http.ssl.truststore.secure_password`**（安全）— 信任库的密码。

### PKCS#12 文件

PKCS#12 文件（.p12 或 .pfx）的配置方式与 Java 密钥库文件相同：

- **`xpack.http.ssl.keystore.path`**（静态）— 同上（jks 或 PKCS#12；与 `ssl.key` 互斥）。
- **`xpack.http.ssl.keystore.type`**（静态）— 密钥库文件的格式。必须是 `jks` 或 `PKCS12`。如果密钥库路径以 `.p12`、`.pfx` 或 `.pkcs12` 结尾，此设置默认为 `PKCS12`；否则默认为 `jks`。
- **`xpack.http.ssl.keystore.secure_password`**（安全）— 密钥库的密码。
- **`xpack.http.ssl.keystore.secure_key_password`**（安全）— 密钥库中密钥的密码。默认为密钥库密码。
- **`xpack.http.ssl.truststore.path`**（静态）— 同上（与 `ssl.certificate_authorities` 互斥）。
- **`xpack.http.ssl.truststore.type`**（静态）— 设置为 `PKCS12` 以指示信任库是 PKCS#12 文件。
- **`xpack.http.ssl.truststore.secure_password`**（安全）— 信任库的密码。

## 电子邮件通知设置

在 `elasticsearch.yml` 中配置。更多信息参阅配置电子邮件操作。

- **`xpack.notification.email.default_account`**（动态）— 要使用的默认电子邮件帐户。如果你配置了多个电子邮件帐户，则必须配置此设置或在电子邮件操作中指定要使用的电子邮件帐户。
- **`xpack.notification.email.recipient_allowlist`**（动态）— 指定允许向其发送电子邮件的地址。收件人（收件人：、抄送：或密送：）不在这些模式之内的电子邮件将被拒绝并抛出错误。默认为 `["*"]`（允许所有收件人）。支持简单的通配符匹配，例如 `list-*@company.com`。此设置不能与 `xpack.notification.email.account.domain_allowlist` 同时使用（如果两者都设置将抛出错误）。可以通过通配符模式（如 `*@company.com`）指定域。
- **`xpack.notification.email.account`** — 指定用于通过电子邮件发送通知的帐户信息。属性：
  - **`domain_allowlist`**（动态）— 指定允许向其发送电子邮件的域。收件人不在这些域内的电子邮件将被拒绝。默认为 `["*"]`。支持简单的通配符匹配，例如 `*.company.com`。不能与 `recipient_allowlist` 同时使用。
  - **`profile`**（动态）— 用于构建 MIME 消息的电子邮件配置文件。有效值：`standard`、`gmail` 和 `outlook`。默认为 `standard`。
  - **`email_defaults.*`**（动态）— 一组可选的电子邮件属性，用作从该帐户发送的电子邮件的默认值。
  - **`smtp.auth`**（动态）— 设置为 `true` 以尝试使用 AUTH 命令对用户进行身份验证。默认为 `false`。
  - **`smtp.host`**（动态）— 要连接的 SMTP 服务器。必需。
  - **`smtp.port`**（动态）— 要连接的 SMTP 服务器端口。默认为 `25`。
  - **`smtp.user`**（动态）— SMTP 的用户名。必需。
  - **`smtp.secure_password`**（安全，可重载）— 指定 SMTP 用户的密码。
  - **`smtp.starttls.enable`**（动态）— 设置为 `true` 以启用使用 STARTTLS 命令（如果服务器支持）在发出任何登录命令之前将连接切换到受 TLS 保护的连接。必须配置适当的信任库，以便客户端信任服务器的证书。默认为 `false`。
  - **`smtp.starttls.required`**（动态）— 如果为 `true`，则 STARTTLS 是必需的。如果该命令失败，连接将失败。默认为 `false`。
  - **`smtp.ssl.trust`**（动态）— 假定受信任并为其禁用证书验证的 SMTP 服务器主机列表。如果为 `"*"`，则信任所有主机；如果是空格分隔的列表，则信任这些主机；否则信任取决于服务器出示的证书。
  - **`smtp.timeout`**（动态）— 套接字读取超时。默认为两分钟。
  - **`smtp.connection_timeout`**（动态）— 套接字连接超时。默认为两分钟。
  - **`smtp.write_timeout`**（动态）— 套接字写入超时。默认为两分钟。
  - **`smtp.local_address`**（动态）— 发送电子邮件时可配置的本地地址。默认不配置。
  - **`smtp.local_port`**（动态）— 发送电子邮件时可配置的本地端口。默认不配置。
  - **`smtp.send_partial`**（动态）— 尽管其中一个收件人地址无效，仍然发送电子邮件。
  - **`smtp.wait_on_quit`**（动态）— 如果为 `false`，则发送 QUIT 命令并关闭连接。如果为 `true`，则发送 QUIT 命令并等待回复。默认为 `true`。
- **`xpack.notification.email.html.sanitization.allow`** — 指定电子邮件通知中允许的 HTML 元素。HTML 特性组：
  - **`_tables`**（静态）— 所有与表格相关的元素：`<table>`、`<th>`、`<tr>`、`<td>`、`<caption>`、`<col>`、`<colgroup>`、`<thead>`、`<tbody>` 和 `<tfoot>`。
  - **`_blocks`**（静态）— 块元素：`<p>`、`<div>`、`<h1>`、`<h2>`、`<h3>`、`<h4>`、`<h5>`、`<h6>`、`<ul>`、`<ol>`、`<li>` 和 `<blockquote>`。
  - **`_formatting`**（静态）— 行内格式化元素：`<b>`、`<i>`、`<s>`、`<u>`、`<o>`、`<sup>`、`<sub>`、`<ins>`、`<del>`、`<strong>`、`<strike>`、`<tt>`、`<code>`、`<big>`、`<small>`、`<hr>`、`<br>`、`<span>` 和 `<em>`。
  - **`_links`**（静态）— 带 `href` 属性的 `<a>` 元素，指向使用 `http`、`https` 和 `mailto` 协议的 URL。
  - **`_styles`**（静态）— 所有元素上的 style 属性。注意：CSS 属性也会被清理以防止 XSS 攻击。
  - **`img`**：
    - **`img:all`**（静态）— 所有图像（外部和内嵌）。
    - **`img:embedded`**（静态）— 仅内嵌图像。内嵌图像在其 `src` 属性中只能使用 `cid:` URL 协议。
- **`xpack.notification.email.html.sanitization.disallow`**（静态）— 指定电子邮件通知中**不允许**的 HTML 元素（单个元素和特性组）。
- **`xpack.notification.email.html.sanitization.enabled`**（静态）— 设置为 `false` 可完全禁用 HTML 清理。不推荐。默认为 `true`。
- **`xpack.notification.reporting.warning.kbn-csv-contains-formulas.text`**（动态）— 指定当 Kibana 的 `xpack.reporting.csv.checkForFormulas` 的 CSV 文件公式验证条件为 true 时发送的自定义消息。使用 `%s` 作为文件名占位符。默认为："Warning: The attachment [%s] contains characters which spreadsheet applications may interpret as formulas. Please ensure that the attachment is safe prior to opening."（警告：附件 [%s] 包含电子表格应用可能解释为公式的字符。打开前请确保附件安全。）

## Watcher 电子邮件 TLS/SSL 设置

与 HTTP TLS/SSL 设置的结构相同，使用 `xpack.notification.email.ssl.` 前缀：

- **`xpack.notification.email.ssl.supported_protocols`**（静态）— 同样的有效协议（`SSLv2Hello`、`SSLv3`、`TLSv1`、`TLSv1.1`、`TLSv1.2`、`TLSv1.3`）和默认值。FIPS 模式禁止 `SSLv2Hello`/`SSLv3`。
- **`xpack.notification.email.ssl.verification_mode`**（静态）— 同样的有效值（`full`、`certificate`、`none`），默认为 `full`；对 `none` 有相同的警告。
- **`xpack.notification.email.ssl.cipher_suites`**（静态）— 与上述相同的默认密码套件。

**密钥和受信任证书设置（与 HTTP 部分规则相同）**：

*PEM 编码文件*：
- **`xpack.notification.email.ssl.key`**（静态）— PEM 编码私钥文件的路径；与 `ssl.keystore.path` 互斥。
- **`xpack.notification.email.ssl.secure_key_passphrase`**（安全）— 解密私钥的密码短语；可选。
- **`xpack.notification.email.ssl.certificate`**（静态）— PEM 编码证书（或证书链）的路径；只有在设置了 `ssl.key` 时才可用。
- **`xpack.notification.email.ssl.certificate_authorities`**（静态）— 受信任的 PEM 证书文件的路径列表；与 `ssl.truststore.path` 互斥。

*Java 密钥库文件*：
- **`xpack.notification.email.ssl.keystore.path`**（静态）— jks 或 PKCS#12 密钥库；与 `ssl.key` 互斥。
- **`xpack.notification.email.ssl.keystore.secure_password`**（安全）— 密钥库密码。
- **`xpack.notification.email.ssl.keystore.secure_key_password`**（安全）— 密钥密码；默认为密钥库密码。
- **`xpack.notification.email.ssl.truststore.path`**（静态）— 信任库路径（jks 或 PKCS#12）；与 `ssl.certificate_authorities` 互斥。
- **`xpack.notification.email.ssl.truststore.secure_password`**（安全）— 信任库密码。

*PKCS#12 文件*：
- **`xpack.notification.email.ssl.keystore.path`**（静态）— 同上。
- **`xpack.notification.email.ssl.keystore.type`**（静态）— `jks` 或 `PKCS12`；如果路径以 `.p12`、`.pfx` 或 `.pkcs12` 结尾，默认为 `PKCS12`，否则为 `jks`。
- **`xpack.notification.email.ssl.keystore.secure_password`**（安全）、**`xpack.notification.email.ssl.keystore.secure_key_password`**（安全）— 同上。
- **`xpack.notification.email.ssl.truststore.path`**（静态）— 同上。
- **`xpack.notification.email.ssl.truststore.type`**（静态）— 对 PKCS#12 信任库设置为 `PKCS12`。
- **`xpack.notification.email.ssl.truststore.secure_password`**（安全）— 信任库密码。

## Slack 通知设置

在 `elasticsearch.yml` 中配置。参阅配置 Slack 操作。

- **`xpack.notification.slack.default_account`**（动态）— 要使用的默认 Slack 帐户。如果配置了多个 Slack 帐户，则为必需（或在 slack 操作中指定帐户）。
- **`xpack.notification.slack.account`** — 指定用于通过 Slack 发送通知的帐户信息。属性：
  - **`secure_url`**（安全，可重载）— 用于向 Slack 发布消息的传入 Webhook URL。必需。
  - **`message_defaults`** — Slack 消息属性的默认值：
    - **`from`**（动态）— 在 Slack 消息中显示的发送者名称。默认为 watch ID。
    - **`to`**（动态）— 你希望向其发送消息的默认 Slack 频道或组。
    - **`icon`**（动态）— 在 Slack 消息中显示的图标。覆盖传入 Webhook 配置的图标。接受指向图像的公共 URL。
    - **`text`**（动态）— 默认消息内容。
    - **`attachment`**（动态）— 默认消息附件。Slack 消息附件支持格式更丰富的消息。按照 Slack 附件文档中定义的方式指定为数组。

## Jira 通知设置

在 `elasticsearch.yml` 中配置。参阅配置 Jira 操作。

- **`xpack.notification.jira.default_account`**（动态）— 要使用的默认 Jira 帐户。如果配置了多个 Jira 帐户，则为必需（或在 jira 操作中指定帐户）。
- **`xpack.notification.jira.account`** — 指定用于通过通知在 Jira 中创建问题的帐户信息。属性：
  - **`allow_http`**（动态）— 如果为 `false`，Watcher 拒绝使用 HTTP 协议的 URL 设置。默认为 `false`。
  - **`secure_url`**（安全，可重载）— Jira Software 服务器的 URL。必需。
  - **`secure_user`**（安全，可重载）— 连接到 Jira Software 服务器的用户名。必需。
  - **`secure_password`**（安全，可重载）— 连接到 Jira Software 服务器的用户密码。必需。
  - **`issue_defaults`**（动态）— 在 Jira 中创建的问题的默认字段值。可选。参阅 Jira 操作属性。

## PagerDuty 通知设置

在 `elasticsearch.yml` 中配置。参阅配置 PagerDuty 操作。

- **`xpack.notification.pagerduty.default_account`**（动态）— 要使用的默认 PagerDuty 帐户。如果配置了多个 PagerDuty 帐户，则为必需（或在 pagerduty 操作中指定帐户）。
- **`xpack.notification.pagerduty.account`** — 指定用于通过 PagerDuty 发送通知的帐户信息。属性：
  - **`name`**（静态）— 与你用于访问 PagerDuty 的 API 密钥关联的 PagerDuty 帐户的名称。必需。
  - **`secure_service_api_key`**（安全，可重载）— 用于访问 PagerDuty 的 PagerDuty API 密钥。必需。
  - **`event_defaults`** — PagerDuty 事件属性的默认值。可选：
    - **`description`**（动态）— PagerDuty 事件的默认描述。如果未配置默认值，每个 PagerDuty 操作必须指定一个描述。
    - **`incident_key`**（动态）— 发送 PagerDuty 事件时使用的默认事件键。
    - **`client`**（动态）— 指定默认监控客户端的字符串。
    - **`client_url`**（动态）— 默认监控客户端的 URL。
    - **`event_type`**（动态）— 默认事件类型。有效值：`trigger`、`resolve`、`acknowledge`。
    - **`attach_payload`**（动态）— 是否默认提供 watch 载荷作为事件的上下文。有效值：`true`、`false`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/notification-settings.html)
