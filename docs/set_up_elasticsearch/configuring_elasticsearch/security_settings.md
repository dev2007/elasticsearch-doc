# Elasticsearch 中的安全设置

你配置 `xpack.security` 设置以启用匿名访问和执行消息身份验证、设置文档和字段级安全、配置域（realm）、使用 SSL 加密通信以及审计安全事件。

除安全设置（添加到 Elasticsearch 密钥库）之外，所有这些设置都可以添加到 `elasticsearch.yml` 配置文件中。有关创建和更新 Elasticsearch 密钥库的更多信息，参阅安全设置。

## 通用安全设置

- **`xpack.security.enabled`**（静态）— 默认为 `true`，在节点上启用 Elasticsearch 安全功能。必须启用此设置才能使用 Elasticsearch 的身份验证、授权和审计功能。如果设置为 `false`，安全功能将被禁用，这是不推荐的。它也会影响连接到此 Elasticsearch 实例的所有 Kibana 实例；你不需要在这些 kibana.yml 文件中禁用安全功能。
- **`xpack.security.autoconfiguration.enabled`**（静态）— 默认为 `true`，启用安全自动配置。如果设置为 `false`，安全自动配置将被禁用，这是不推荐的。禁用时，首次启动 Elasticsearch 时不会自动配置安全，这意味着你必须手动配置安全。
- **`xpack.security.enrollment.enabled`**（静态）— 默认为 `false`。控制（节点和 Kibana）向已进行安全自动配置的本地节点的注册。设置为 `true` 时，本地节点可以生成新的注册令牌。现有令牌如果仍有效，可用于注册。安全自动配置过程会将此设置为 `true`，除非管理员在启动 Elasticsearch 之前将其设置为 `false`。
- **`xpack.security.hide_settings`**（静态）— 从集群节点信息 API 的结果中省略的设置的逗号分隔列表。你可以使用通配符在列表中包含多个设置。例如，以下值隐藏 `ad1` active_directory 域的所有设置：`xpack.security.authc.realms.active_directory.ad1.*`。由于信息的敏感性，API 已经省略了所有 ssl 设置、`bind_dn` 和 `bind_password`。
- **`xpack.security.fips_mode.enabled`**（静态）— 启用 FIPS 操作模式。如果你在启用了 FIPS 140-2 的 JVM 中运行此 Elasticsearch 实例，请将此设置为 `true`。更多信息参阅 FIPS 140-2。默认为 `false`。
- **`xpack.security.fips_mode.required_providers`**（静态）— 可选择强制使用特定的 Java JCE/JSSE 安全提供程序。例如，将其设置为 `["BCFIPS", "BCJSSE"]`（不区分大小写）以要求 Bouncy Castle FIPS JCE 和 JSSE 安全提供程序。仅在 `xpack.security.fips_mode.enabled` 设置为 `true` 时适用。

## 密码哈希设置

- **`xpack.security.authc.password_hashing.algorithm`**（静态）— 指定用于安全用户凭据存储的哈希算法。参阅密码哈希算法表。如果 `xpack.security.fips_mode.enabled` 为 `true`（参阅 FIPS 140-2），默认为 `pbkdf2_stretch`；在所有其他情况下，默认为 `bcrypt`。

## 匿名访问设置

你可以在 `elasticsearch.yml` 中配置以下匿名访问设置。更多信息参阅启用匿名访问。

- **`xpack.security.authc.anonymous.username`**（静态）— 匿名用户的用户名（主体）。默认为 `_es_anonymous_user`。
- **`xpack.security.authc.anonymous.roles`**（静态）— 与匿名用户关联的角色。必需。
- **`xpack.security.authc.anonymous.authz_exception`**（静态）— 为 `true` 时，如果匿名用户没有所请求操作的适当权限，将返回 HTTP 403 响应。不会提示用户提供凭据以访问所请求的资源。设置为 `false` 时，返回 HTTP 401 响应，用户可以提供具有适当权限的凭据以获得访问权限。默认为 `true`。

## 自动机设置

在安全功能接受通配符模式的地方（例如角色中的索引模式、角色映射 API 中的组匹配），每个模式都被编译成一个自动机（Automaton）。可以使用以下设置来控制此行为。

- **`xpack.security.automata.max_determinized_states`**（静态）— 单个模式可以创建的自动机状态数的上限。这可以防止过于困难（例如指数级困难）的模式。默认为 100,000。
- **`xpack.security.automata.cache.enabled`**（静态）— 是否缓存编译后的自动机。编译自动机可能占用大量 CPU 并可能减慢某些操作。缓存减少了需要编译自动机的频率。默认为 `true`。
- **`xpack.security.automata.cache.size`**（静态）— 自动机缓存中保留的最大条目数。默认为 10,000。
- **`xpack.security.automata.cache.ttl`**（静态）— 条目在自动机缓存中保留的时间长度（基于最近使用）。默认为 48h（48 小时）。

## 文档和字段级安全设置

你可以在 `elasticsearch.yml` 中设置以下文档和字段级安全设置。更多信息参阅设置字段和文档级安全。

- **`xpack.security.dls_fls.enabled`**（静态）— 设置为 `false` 以阻止配置文档和字段级安全。默认为 `true`。
- **`xpack.security.dls.bitset.cache.ttl`**（静态）— 文档级安全的缓存 BitSet 条目的存活时间。文档级安全查询可能依赖于 Lucene BitSet 对象，这些对象会被自动缓存以提高性能。默认为未使用 2h（2 小时）后过期。
- **`xpack.security.dls.bitset.cache.size`**（静态）— 文档级安全的缓存 BitSet 条目的最大内存使用量。文档级安全查询可能依赖于 Lucene BitSet 对象，这些对象会被自动缓存以提高性能。可以配置为原始字节数（如 `200mb` 或 `1g`）或节点 JVM 堆内存的百分比（如 `5%`）。当超过默认值时，最近最少使用的条目将被逐出。默认为分配给节点的堆的 10%。

## 令牌服务设置

你可以在 `elasticsearch.yml` 中设置以下令牌服务设置。

- **`xpack.security.authc.token.enabled`**（静态）— 设置为 `false` 以禁用内置令牌服务。默认为 `true`，除非 `xpack.security.http.ssl.enabled` 为 `false`。这可以防止通过纯 http 连接嗅探令牌。
- **`xpack.security.authc.token.timeout`**（静态）— 令牌有效的时间长度。默认情况下，此值为 `20m` 或 20 分钟。最大值为 1 小时。

## API 密钥服务设置

你可以在 `elasticsearch.yml` 中设置以下 API 密钥服务设置。

- **`xpack.security.authc.api_key.enabled`**（静态）— 设置为 `false` 以禁用内置 API 密钥服务。默认为 `true`。
- **`xpack.security.authc.api_key.cache.ttl`**（静态）— 缓存的 API 密钥条目的存活时间。API 密钥 ID 及其 API 密钥的哈希会缓存这段时间。使用标准 Elasticsearch 时间单位指定时间段。默认为 `1d`。
- **`xpack.security.authc.api_key.cache.max_keys`**（静态）— 缓存在任何给定时间可以容纳的最大 API 密钥条目数。默认为 10,000。
- **`xpack.security.authc.api_key.cache.hash_algo`**（静态，专家）— 用于内存缓存 API 密钥凭据的哈希算法。可能的值参阅缓存哈希算法表。默认为 `ssha256`。
- **`xpack.security.authc.api_key.delete.retention_period`**（动态）— 早于保留期限的已失效或过期 API 密钥符合删除条件。默认为 `7d`。

  集群节点之间较大的实时时钟不一致可能导致评估 API 密钥保留期限时出现问题。也就是说，如果使 API 密钥失效的节点上的时钟与执行删除的节点上的时钟差异显著，密钥的保留时间可能比配置的保留期限更长或更短。

- **`xpack.security.authc.api_key.delete.interval`**（动态，专家）— 集群节点安排自动删除早于保留期限的已失效或过期 API 密钥。此设置控制两次此类删除作业之间的最小时间间隔。默认为 `24h`。

  这是一个底层设置，目前控制的是每个节点触发的删除作业之间的间隔，而不是跨集群。

- **`xpack.security.authc.api_key.delete.timeout`**（静态，专家）— 设置内部搜索和删除调用的超时。
- **`xpack.security.authc.api_key.hashing.algorithm`**（静态）— 指定用于保护 API 密钥凭据的哈希算法。参阅安全令牌哈希算法表。默认为 `ssha256`。

## 安全域设置

你在 `elasticsearch.yml` 的 `xpack.security.authc.domains` 命名空间中配置安全域设置。例如：

```yaml
xpack:
  security:
    authc:
      domains:
        my_domain:
          realms: [ 'default_native', 'saml1' ]
```

其中：`my_domain` 为安全域的名称；`realms` 为属于该域的域（realm）列表。

## 域设置

你在 `elasticsearch.yml` 的 `xpack.security.authc.realms` 命名空间中配置域设置。例如：

```yaml
xpack.security.authc.realms:
    native.realm1:
        order: 0
        ...
    ldap.realm2:
        order: 1
        ...
    active_directory.realm3:
        order: 2
    ...
```

其中：`native` 等为域类型（例如 native、ldap、active_directory、pki、file、kerberos、saml）及域名称，此信息为必需；`order` 指定域在域链中的优先级，此信息为必需。

有效设置因域类型而异。更多信息参阅用户身份验证。

### 对所有域有效的设置

- **`order`**（静态）— 域在域链中的优先级。order 较低的域会被优先查询。每个域的值必须唯一。此设置为必需。
- **`enabled`**（静态）— 指示是否启用该域。你可以使用此设置在不删除其配置信息的情况下禁用域。默认为 `true`。

## 本地域设置

除了对所有域有效的设置外，你还可以指定以下可选设置：

- **`cache.ttl`**（静态）— 缓存的用户条目的存活时间。用户及其凭据的哈希会被缓存这段时间。使用标准 Elasticsearch 时间单位指定。默认为 `20m`。
- **`cache.max_users`**（静态）— 缓存在任何给定时间可以容纳的最大用户条目数。默认为 100,000。
- **`cache.hash_algo`**（静态，专家）— 用于内存缓存用户凭据的哈希算法。可能的值参阅缓存哈希算法表。默认为 `ssha256`。
- **`authentication.enabled`**（静态）— 如果设置为 `false`，将禁用此域中的身份验证支持，使其仅支持用户查找（参阅代执行和授权域特性）。默认为 `true`。

## 文件域设置

除了对所有域有效的设置外，你还可以指定以下设置：

- **`cache.ttl`**（静态）— 缓存的用户条目的存活时间。用户及其凭据的哈希会被缓存此配置的时间。默认为 `20m`。
- **`cache.max_users`**（静态）— 缓存在给定时间可以容纳的最大用户条目数。默认为 100,000。
- **`cache.hash_algo`**（静态，专家）— 用于内存缓存用户凭据的哈希算法。参阅缓存哈希算法表。默认为 `ssha256`。
- **`authentication.enabled`**（静态）— 如果设置为 `false`，将禁用此域中的身份验证支持，使其仅支持用户查找（参阅代执行和授权域特性）。默认为 `true`。

## LDAP 域设置

除了对所有域有效的设置外，你还可以指定以下设置：

- **`url`**（静态）— 一个或多个 `ldap[s]://<server>:<port>` 格式的 LDAP URL。必需。要提供多个 URL，使用 YAML 数组（`["ldap://server1:636", "ldap://server2:636"]`）或逗号分隔的字符串（`"ldap://server1:636, ldap://server2:636"`）。虽然两者都支持，但不能混用 `ldap` 和 `ldaps` 协议。
- **`load_balance.type`**（静态）— 定义了多个 LDAP URL 时使用的行为。支持的值参阅负载平衡和故障转移类型。默认为 `failover`。
- **`load_balance.cache_ttl`**（静态）— 当使用 `dns_failover` 或 `dns_round_robin` 作为负载平衡类型时，此设置控制缓存 DNS 查找的时间。默认为 `1h`。
- **`bind_dn`**（静态）— 用于绑定到 LDAP 并执行搜索的用户的 DN。仅适用于用户搜索模式。如果未指定，将尝试匿名绑定。默认为空。由于其潜在的安全影响，`bind_dn` 不会通过节点信息 API 暴露。
- **`bind_password`**（静态）— 在 6.3 中已弃用。请改用 `secure_bind_password`。用于绑定到 LDAP 目录的用户的密码。默认为空。由于其潜在的安全影响，`bind_password` 不会通过节点信息 API 暴露。
- **`secure_bind_password`**（安全，可重载）— 用于绑定到 LDAP 目录的用户的密码。默认为空。
- **`user_dn_templates`**（静态）— 将用户名替换为字符串 `{0}` 的 DN 模板。此设置是多值的；你可以指定多个用户上下文。在用户模板模式下运行时必需。如果指定了 `user_search.base_dn`，则此设置无效。有关不同模式的更多信息，参阅 LDAP 用户身份验证。
- **`authorization_realms`**（静态）— 应该为其查询委托授权的域的名称。如果使用此设置，LDAP 域不执行角色映射，而是从列出的域加载用户。引用的域按它们在此列表中定义的顺序查询。参阅将授权委托给另一个域。

  如果指定了任何以 `user_search` 开头的设置，则 `user_dn_templates` 设置将被忽略。

- **`user_group_attribute`**（静态）— 指定在用户上检查组成员身份的属性。如果指定了任何 `group_search` 设置，则忽略此设置。默认为 `memberOf`。
- **`user_full_name_attribute`**（静态）— 指定在用户上检查用户全名的属性。默认为 `cn`。
- **`user_email_attribute`**（静态）— 指定在用户上检查用户电子邮件地址的属性。默认为 `mail`。
- **`user_search.base_dn`**（静态）— 指定用于搜索用户的容器 DN。在用户搜索模式下运行时必需。如果指定了 `user_dn_templates`，则此设置无效。
- **`user_search.scope`**（静态）— 用户搜索的范围。有效值为 `sub_tree`、`one_level` 或 `base`。`one_level` 只搜索直接包含在 `base_dn` 中的对象。`sub_tree` 搜索 `base_dn` 下包含的所有对象。`base` 指定 `base_dn` 是用户对象，并且它是唯一考虑的用户。默认为 `sub_tree`。
- **`user_search.filter`**（静态）— 指定用于搜索目录以尝试匹配用户提供的用户名的条目的过滤器。默认为 `(uid={0})`。搜索时 `{0}` 会被替换为提供的用户名。
- **`user_search.attribute`**（静态）— 在 5.6 中已弃用。请改用 `user_search.filter`。与请求发送的用户名匹配的属性。默认为 `uid`。
- **`user_search.pool.enabled`**（静态）— 启用或禁用用户搜索的连接池。如果设置为 `false`，则为每次搜索创建一个新连接。设置 `bind_dn` 时默认为 `true`。
- **`user_search.pool.size`**（静态）— 连接池中允许的到 LDAP 服务器的最大连接数。默认为 20。
- **`user_search.pool.initial_size`**（静态）— 启动时创建到 LDAP 服务器的初始连接数。默认为 0。如果 LDAP 服务器关闭，大于 0 的值可能导致启动失败。
- **`user_search.pool.health_check.enabled`**（静态）— 启用或禁用连接池中 LDAP 连接的健康检查。连接按指定间隔在后台检查。默认为 `true`。
- **`user_search.pool.health_check.dn`**（静态）— 作为健康检查的一部分检索的可分辨名称。默认为 `bind_dn` 的值（如果存在）；否则回退到 `user_search.base_dn`。
- **`user_search.pool.health_check.interval`**（静态）— 对池中的连接执行后台检查的间隔。默认为 `60s`。
- **`group_search.base_dn`**（静态）— 用于搜索用户所属组的容器 DN。当此元素不存在时，Elasticsearch 搜索用户上设置的 `user_group_attribute` 指定的属性以确定组成员身份。
- **`group_search.scope`**（静态）— 指定组搜索应该是 `sub_tree`、`one_level` 还是 `base`。`one_level` 只搜索直接包含在 `base_dn` 中的对象。`sub_tree` 搜索 `base_dn` 下包含的所有对象。`base` 指定 `base_dn` 是组对象，并且它是唯一考虑的组。默认为 `sub_tree`。
- **`group_search.filter`**（静态）— 指定用于查找组的过滤器。未设置时，域使用属性 `member`、`memberOf` 或 `memberUid` 搜索 `group`、`groupOfNames`、`groupOfUniqueNames` 或 `posixGroup`。过滤器中的任何 `{0}` 实例都会被 `group_search.user_attribute` 中定义的用户属性替换。
- **`group_search.user_attribute`**（静态）— 指定要获取并作为参数提供给过滤器的用户属性。未设置时，用户 DN 被传入过滤器。默认为空。
- **`unmapped_groups_as_roles`**（静态）— 如果设置为 `true`，任何未映射的 LDAP 组的名称将被用作角色名称并分配给用户。如果组未在角色映射文件中引用，则视为未映射。基于 API 的角色映射不被考虑。默认为 `false`。
- **`files.role_mapping`**（静态）— YAML 角色映射配置文件的位置。默认为 `ES_PATH_CONF/role_mapping.yml`。
- **`follow_referrals`**（静态）— 指定 Elasticsearch 是否应遵循 LDAP 服务器返回的引用（referral）。引用是服务器返回的用于继续 LDAP 操作（例如搜索）的 URL。默认为 `true`。
- **`metadata`**（静态）— 应该从 LDAP 服务器加载并存储在已认证用户的元数据字段中的其他 LDAP 属性的列表。
- **`timeout.tcp_connect`**（静态）— 建立 LDAP 连接的 TCP 连接超时期限。末尾的 `s` 表示秒，`ms` 表示毫秒。默认为 `5s`（5 秒）。
- **`timeout.tcp_read`**（静态）— 在 7.7 中已弃用。建立 LDAP 连接后的 TCP 读取超时期限。等同于 `timeout.response` 并被其取代，两者不能同时使用。
- **`timeout.response`**（静态）— 等待 LDAP 服务器响应的时间间隔。默认为 `timeout.ldap_search` 的值。
- **`timeout.ldap_search`**（静态）— LDAP 搜索的超时期限。该值在请求中指定并由接收 LDAP 服务器执行。默认为 `5s`（5 秒）。
- **`ssl.*`**（静态/安全）— LDAP 域支持完整的 TLS/SSL 设置集（`ssl.key`、`ssl.secure_key_passphrase`、`ssl.certificate`、`ssl.certificate_authorities`、`ssl.keystore.path`、`ssl.keystore.type`、`ssl.keystore.secure_password`、`ssl.keystore.secure_key_password`、`ssl.truststore.path`、`ssl.truststore.type`、`ssl.truststore.secure_password`、`ssl.verification_mode`、`ssl.supported_protocols`、`ssl.cipher_suites`），语义与通用 TLS/SSL 密钥和受信任证书设置相同（详见下文"通用 TLS 设置"及"TLS/SSL 密钥和受信任证书设置"）。其中 `ssl.verification_mode` 默认为 `full`；`ssl.supported_protocols` 在 JVM 支持 TLSv1.3 时默认为 `TLSv1.3,TLSv1.2,TLSv1.1`，否则为 `TLSv1.2,TLSv1.1`；FIPS 模式下不能使用 `SSLv2Hello` 或 `SSLv3`。已弃用的旧设置包括 `ssl.key_passphrase`、`ssl.keystore.password`、`ssl.keystore.key_password`、`ssl.truststore.password`（均建议改用对应的 `secure_*` 安全设置）。
- **`cache.ttl`**（静态）— 缓存的用户条目的存活时间。默认为 `20m`。
- **`cache.max_users`**（静态）— 缓存可以包含的最大用户条目数。默认为 100000。
- **`cache.hash_algo`**（静态，专家）— 用于内存缓存用户凭据的哈希算法。默认为 `ssha256`。
- **`authentication.enabled`**（静态）— 如果设置为 `false`，禁用此域中的身份验证支持，使其仅支持用户查找。默认为 `true`。

## Active Directory 域设置

除了对所有域有效的设置外，你还可以指定以下设置：

- **`url`**（静态）— 一个或多个 `ldap[s]://<server>:<port>` 格式的 LDAP URL。默认为 `ldap://<domain_name>:389`。当使用 SSL/TLS 连接或使用自定义端口时需要此设置。要提供多个 URL，使用 YAML 数组或逗号分隔的字符串。虽然两者都支持，但不能混用 `ldap` 和 `ldaps` 协议。如果未提供 URL，Elasticsearch 使用默认值 `ldap://<domain_name>:389`，该默认值使用 `domain_name` 设置的值并假定到端口 389 的未加密连接。
- **`load_balance.type`**（静态）— 定义了多个 LDAP URL 时使用的行为。默认为 `failover`。
- **`load_balance.cache_ttl`**（静态）— 当使用 `dns_failover` 或 `dns_round_robin` 作为负载平衡类型时，此设置控制缓存 DNS 查找的时间。默认为 `1h`。
- **`domain_name`**（静态）— Active Directory 的域名。如果未指定 `url` 和 `user_search.base_dn` 设置，集群可以从此设置推导这些值。必需。
- **`bind_dn`**（静态）— 用于绑定到 Active Directory 并执行搜索的用户的 DN。默认为空。由于其潜在的安全影响，`bind_dn` 不会通过节点信息 API 暴露。
- **`bind_password`**（静态）— 在 6.3 中已弃用。请改用 `secure_bind_password`。用于绑定到 Active Directory 的用户的密码。默认为空。
- **`secure_bind_password`**（安全，可重载）— 用于绑定到 Active Directory 的用户的密码。默认为空。
- **`unmapped_groups_as_roles`**（静态）— 如果设置为 `true`，任何未映射的 Active Directory 组的名称将被用作角色名称并分配给用户。默认为 `false`。
- **`files.role_mapping`**（静态）— YAML 角色映射配置文件的位置。默认为 `ES_PATH_CONF/role_mapping.yml`。
- **`user_search.base_dn`**（静态）— 搜索用户的上下文。默认为 Active Directory 域的根。
- **`user_search.scope`**（静态）— 指定用户搜索应该是 `sub_tree`、`one_level` 还是 `base`。默认为 `sub_tree`。
- **`user_search.filter`**（静态）— 指定给定用户名时用于查找用户的过滤器。默认过滤器查找具有 `sAMAccountName` 或 `userPrincipalName` 的用户对象。如果指定，必须是有效的 LDAP 用户搜索过滤器，例如 `(&(objectClass=user)(sAMAccountName={0}))`。
- **`user_search.upn_filter`**（静态）— 指定给定用户主体名称（UPN）时用于查找用户的过滤器。默认过滤器查找具有匹配 `userPrincipalName` 的用户对象。例如 `(&(objectClass=user)(userPrincipalName={1}))`。`{1}` 是用户提供的完整用户主体名称。
- **`user_search.down_level_filter`**（静态）— 指定给定下级登录名（DOMAIN\user）时用于查找用户的过滤器。默认过滤器在提供的域中查找具有匹配 `sAMAccountName` 的用户对象。
- **`user_search.pool.*`**（静态）— 用户搜索连接池设置：`enabled`（默认在提供 `bind_dn` 时为 `true`）、`size`（默认 20）、`initial_size`（默认 0，如果 LDAP 服务器关闭，大于 0 的值可能导致启动失败）、`health_check.enabled`（默认 `true`）、`health_check.dn`（默认为 `bind_dn` 或 `user_search.base_dn` 的值）、`health_check.interval`（默认 `60s`）。
- **`group_search.base_dn`**（静态）— 搜索用户所属组的上下文。默认为 Active Directory 域的根。
- **`group_search.scope`**（静态）— 默认为 `sub_tree`。
- **`metadata`**（静态）— 应该从 LDAP 服务器加载并存储在已认证用户的元数据字段中的其他 LDAP 属性的列表。
- **`timeout.*`**（静态）— `timeout.tcp_connect`（默认 `5s`）、`timeout.tcp_read`（7.7 中已弃用，改用 `timeout.response`）、`timeout.response`（默认为 `timeout.ldap_search` 的值）、`timeout.ldap_search`（默认 `5s`）。
- **`ssl.*`**（静态/安全）— 完整的 TLS/SSL 设置集，语义与 LDAP 域相同（详见上文 LDAP 域设置中的 ssl.* 说明）。
- **`cache.ttl`**（静态）— 默认为 `20m`。
- **`cache.max_users`**（静态）— 默认为 100000。
- **`cache.hash_algo`**（静态，专家）— 默认为 `ssha256`。
- **`authentication.enabled`**（静态）— 默认为 `true`。
- **`follow_referrals`**（静态）— 如果设置为 `true`，Elasticsearch 遵循 LDAP 服务器返回的引用。默认为 `true`。

## PKI 域设置

除了对所有域有效的设置外，你还可以指定以下设置：

- **`username_pattern`**（静态）— 用于从证书 DN 中提取用户名的正则表达式模式。用户名用于审计和日志记录，也可与角色映射 API 和授权委托一起使用。第一个匹配组被用作用户名。默认为 `CN=(.*?)(?:,|$)`。
- **`certificate_authorities`**（静态）— 应该用于将用户的证书认证为受信任的 PEM 证书文件的路径列表。默认为为 SSL 配置的受信任证书。此设置不能与 `truststore.path` 一起使用。
- **`truststore.algorithm`**（静态）— 信任库的算法。默认为 `SunX509`。
- **`truststore.password`**（静态）— 在 7.17.0 中已弃用。请改用 `ssl.truststore.secure_password`。信任库的密码。如果设置了 `truststore.path`，则此设置为必需。
- **`truststore.secure_password`**（安全）— 信任库的密码。
- **`truststore.path`**（静态）— 要使用的信任库的路径。默认为为 SSL 配置的受信任证书。此设置不能与 `certificate_authorities` 一起使用。
- **`files.role_mapping`**（静态）— 指定 YAML 角色映射配置文件的位置。默认为 `ES_PATH_CONF/role_mapping.yml`。
- **`authorization_realms`**（静态）— 应该为其查询委托授权的域的名称。如果使用此设置，PKI 域不执行角色映射，而是从列出的域加载用户。
- **`cache.ttl`**（静态）— 默认为 `20m`。
- **`cache.max_users`**（静态）— 默认为 100000。
- **`delegation.enabled`**（静态）— 通常，为了使客户端能够由 PKI 域进行身份验证，它们必须直接连接到 Elasticsearch，即不能经过终止 TLS 连接的代理。为了允许受信任的智能代理（例如 Kibana）位于 Elasticsearch 之前并终止 TLS 连接，同时仍允许客户端由此域在 Elasticsearch 上进行身份验证，你需要将其切换为 `true`。默认为 `false`。如果启用了委托，则必须定义 `truststore.path` 或 `certificate_authorities` 设置。

## SAML 域设置

除了对所有域有效的设置外，你还可以指定以下设置：

- **`idp.entity_id`**（静态）— SAML 身份提供程序（IdP）的实体 ID。实体 ID 是最大长度为 1024 个字符的 URI。可以是 URL（`https://idp.example.com/`）或 URN（`urn:example.com:idp`），可以在 IdP 的配置或 SAML 元数据中找到。
- **`idp.metadata.path`**（静态）— 描述 IdP 能力和配置的 SAML 2.0 元数据文件的路径（推荐）或 URL。如果提供路径，则相对于 Elasticsearch 配置目录解析。如果提供 URL，则必须是文件 URL 或 https URL。Elasticsearch 会自动轮询此元数据资源并在检测到更改时重新加载 IdP 配置：基于文件的资源以全局 `resource.reload.interval.high` 设置（默认 5 秒）确定的频率轮询；HTTPS 资源以域的 `idp.metadata.http.refresh` 和 `idp.metadata.http.minimum_refresh` 设置确定的频率轮询。如果元数据资源从文件加载，则该文件必须在节点启动时存在，否则节点将无法启动。如果资源通过 HTTPS 加载，则（默认情况下）节点可以容忍资源加载失败 — 节点将启动并继续轮询 URL 获取更新，但受影响的 SAML 域在问题解决之前无法对用户进行身份验证。若要在元数据不可用时强制节点失败，请将 `idp.metadata.http.fail_on_error` 设置为 `true`。
- **`idp.metadata.http.fail_on_error`**（静态）— 如果设置为 `true`，当域尝试通过 HTTPS 加载元数据但元数据不可用时，域将在启动时失败（并阻止节点启动）。如果设置为 `false`（默认），节点将启动，但受影响的 SAML 域在元数据成功加载之前不支持用户身份验证。如果元数据从文件加载，则忽略此设置。
- **`idp.metadata.http.refresh`**（静态）— 控制 https 元数据的检查频率。默认为 `1h`。在某些情况下，Elasticsearch 可能确定需要更频繁地检查元数据（例如之前的加载尝试遇到错误，或元数据表明其将在小于配置的刷新间隔内过期）。在这些情况下，Elasticsearch 会更频繁地轮询，但绝不会比 `idp.metadata.http.minimum_refresh` 更频繁。
- **`idp.metadata.http.minimum_refresh`**（静态）— 控制 https 元数据检查更改的最小频率。默认为 `5m`，且不得设置为大于 `idp.metadata.http.refresh` 的值。
- **`idp.use_single_logout`**（静态）— 指示是否使用 IdP 的单点注销服务（如果 IdP 元数据文件中存在）。默认为 `true`。
- **`sp.entity_id`**（静态）— 此 SAML 服务提供程序使用的实体 ID。应以 URI 形式输入。建议使用你的 Kibana 实例的基本 URL，例如 `https://kibana.example.com/`。
- **`sp.acs`**（静态）— Kibana 中断言消费者服务（ACS）的 URL。通常是你的 Kibana 服务器的 `api/security/saml/callback` 端点。
- **`sp.logout`**（静态）— Kibana 中单点注销服务的 URL。通常是 Kibana 服务器的 `logout` 端点。
- **`attributes.principal`** / **`groups`** / **`name`** / **`mail`** / **`dn`**（静态）— 分别包含用户主体（用户名）、组、全名、电子邮件地址、X.509 可分辨名称的 SAML 属性的名称。
- **`attribute_patterns.principal`**（静态）— 在由 `attributes.principal` 指定的 SAML 属性应用到用户的主体属性之前与之匹配的 Java 正则表达式。属性值必须匹配该模式，第一个捕获组的值被用作主体。例如 `^([^@]+)@example\.com$` 匹配来自 "example.com" 域的电子邮件地址并使用本地部分作为主体。`attribute_patterns.groups` / `name` / `mail` / `dn` 与此相同，分别用于对应属性。
- **`attribute_delimiters.groups`**（静态）— 用作分隔符的普通字符串，在由 `attributes.groups` 指定的单值 SAML 属性应用到用户的组属性之前对其进行拆分。无论输入字符串中的转义如何，分隔符始终会被拆分。此设置不支持多值 SAML 属性，不能与 `attribute_patterns` 设置一起使用，且只能为 groups 属性配置。
- **`nameid_format`**（静态）— 请求 IdP 对当前用户进行身份验证时应请求的 NameID 格式。默认为不包含 nameid_format 属性。
- **`nameid.allow_create`**（静态）— 身份验证请求中 NameIdPolicy 元素的 AllowCreate 属性的值。默认为 `false`。
- **`nameid.sp_qualifier`**（静态）— 身份验证请求中 NameIdPolicy 元素的 SPNameQualifier 属性的值。默认为不包含 SPNameQualifier 属性。
- **`force_authn`**（静态）— 指定在请求 IdP 对当前用户进行身份验证时是否设置 ForceAuthn 属性。如果设置为 `true`，IdP 需要验证用户的身份，无论他们可能已存在的会话如何。默认为 `false`。
- **`populate_user_metadata`**（静态）— 指定是否使用 SAML 属性提供的值填充 Elasticsearch 用户的元数据。默认为 `true`。
- **`authorization_realms`**（静态）— 委托授权的域名称。
- **`allowed_clock_skew`**（静态）— IdP 时钟与 Elasticsearch 节点时钟之间可以容忍的最大偏差。默认为 `3m`。
- **`req_authn_context_class_ref`**（静态）— 请求 IdP 对当前用户进行身份验证时包含在请求身份验证上下文中的身份验证上下文类引用值的逗号分隔列表。相应身份验证响应的身份验证上下文应至少包含所请求值之一。更多信息参阅请求特定的身份验证方法。

### SAML 域签名设置

如果配置了签名密钥（即设置了 `signing.key` 或 `signing.keystore.path`），Elasticsearch 会对外发的 SAML 消息进行签名：

- **`signing.saml_messages`**（静态）— 应该签名的 SAML 消息类型列表，或 `*` 表示签名所有消息。列表中的每个元素应为 SAML XML 元素的本地名称。支持的元素类型为 AuthnRequest、LogoutRequest 和 LogoutResponse。仅在同时指定了 `signing.key` 或 `signing.keystore.path` 时有效。默认为 `*`。
- **`signing.key`**（静态）— 指定用于 SAML 消息签名的 PEM 编码私钥的路径。`signing.key` 和 `signing.keystore.path` 不能同时使用。
- **`signing.secure_key_passphrase`**（安全）— 指定解密 PEM 编码私钥（`signing.key`）的密码短语（如果已加密）。
- **`signing.certificate`**（静态）— 指定与 `signing.key` 对应的 PEM 编码证书（或证书链）的路径。此证书也必须包含在服务提供程序元数据中或在 IdP 中手动配置，以允许签名验证。只有在设置了 `signing.key` 的情况下才能使用此设置。
- **`signing.keystore.path`**（静态）— 包含私钥和证书的密钥库的路径。必须是 Java 密钥库（jks）或 PKCS#12 文件。不能与 `signing.key` 同时使用。
- **`signing.keystore.type`**（静态）— 密钥库的类型。必须是 `jks` 或 `PKCS12`。
- **`signing.keystore.alias`**（静态）— 指定密钥库中应用于 SAML 消息签名的密钥的别名。如果密钥库包含多个私钥，则必须指定此设置。
- **`signing.keystore.secure_password`**（安全）— 密钥库的密码。
- **`signing.keystore.secure_key_password`**（安全）— 密钥库中密钥的密码。默认为密钥库密码。

### SAML 域加密设置

如果配置了加密密钥（即设置了 `encryption.key` 或 `encryption.keystore.path`），Elasticsearch 在生成元数据时会发布加密证书，并尝试解密传入的 SAML 内容：

- **`encryption.key`**（静态）— 指定用于 SAML 消息解密的 PEM 编码私钥的路径。`encryption.key` 和 `encryption.keystore.path` 不能同时使用。
- **`encryption.secure_key_passphrase`**（安全）— 指定解密 PEM 编码私钥（`encryption.key`）的密码短语（如果已加密）。
- **`encryption.certificate`**（静态）— 指定与 `encryption.key` 关联的 PEM 编码证书（或证书链）的路径。此证书也必须包含在服务提供程序元数据中或在 IdP 中手动配置以启用消息加密。只有在设置了 `encryption.key` 的情况下才能使用此设置。
- **`encryption.keystore.path`**（静态）— 包含私钥和证书的密钥库的路径。必须是 jks 或 PKCS#12 文件。不能与 `encryption.key` 同时使用。
- **`encryption.keystore.type`**（静态）— 密钥库的类型。必须是 `jks` 或 `PKCS12`。
- **`encryption.keystore.alias`**（静态）— 指定密钥库中应用于 SAML 消息解密的密钥的别名。如果未指定，密钥库中所有兼容的密钥对都被视为解密的候选密钥。
- **`encryption.keystore.secure_password`**（安全）— 密钥库的密码。
- **`encryption.keystore.secure_key_password`**（安全）— 密钥库中密钥的密码。仅支持单个密码。如果你使用多个解密密钥，它们不能有各自的密码。

### SAML 域 SSL 设置

如果你通过 SSL/TLS 加载 IdP 元数据（即 `idp.metadata.path` 是使用 https 协议的 URL），可以使用以下设置配置 SSL。这些设置仅用于通过 https 加载元数据，不用于任何其他目的。

包含完整的 TLS/SSL 设置集：`ssl.key`、`ssl.key_passphrase`（已弃用，改用 `ssl.secure_key_passphrase`）、`ssl.secure_key_passphrase`、`ssl.certificate`、`ssl.certificate_authorities`、`ssl.keystore.path`、`ssl.keystore.type`、`ssl.keystore.password`（已弃用）、`ssl.keystore.secure_password`、`ssl.keystore.key_password`（已弃用）、`ssl.keystore.secure_key_password`、`ssl.truststore.path`、`ssl.truststore.type`、`ssl.truststore.password`（已弃用）、`ssl.truststore.secure_password`、`ssl.verification_mode`（`full`/`certificate`/`none`，默认 `full`）、`ssl.supported_protocols`、`ssl.cipher_suites`。语义与通用 TLS/SSL 设置相同。

## Kerberos 域设置

除了对所有域有效的设置外，你还可以指定以下设置：

- **`keytab.path`**（静态）— 指定包含此 Elasticsearch 节点使用的服务主体的 Kerberos keytab 文件的路径。这必须是 Elasticsearch 配置目录中的位置，并且文件必须具有读权限。必需。
- **`remove_realm_name`**（静态）— 设置为 `true` 以移除主体名称中的域部分。Kerberos 中的主体名称的形式为 `user/instance@REALM`。如果此选项为 `true`，则用户名中不包含域部分（`@REALM`）。默认为 `false`。
- **`krb.debug`**（静态）— 设置为 `true` 以启用为 Kerberos 身份验证提供支持的 Java 登录模块的调试日志。默认为 `false`。
- **`cache.ttl`**（静态）— 缓存的用户条目的存活时间。默认为 `20m`。
- **`cache.max_users`**（静态）— 缓存在任何给定时间可以容纳的最大用户条目数。默认为 100,000。
- **`authorization_realms`**（静态）— 委托授权的域名称。

## OpenID Connect 域设置

除了对所有域有效的设置外，你还可以指定以下设置：

- **`op.issuer`**（静态）— 你的 OpenID Connect 提供程序的可验证标识符。颁发者标识符通常是使用 https 方案且包含方案、主机以及可选的端口号和路径组件、没有查询或片段组件的区分大小写的 URL。此设置的值应由你的 OpenID Connect 提供程序提供。
- **`op.authorization_endpoint`** / **`op.token_endpoint`** / **`op.userinfo_endpoint`** / **`op.endsession_endpoint`**（静态）— 分别是 OpenID Connect 提供程序处授权端点、令牌端点、用户信息端点、结束会话端点的 URL。值应由你的 OpenID Connect 提供程序提供。
- **`op.jwkset_path`**（静态）— 包含用于验证 OpenID Connect 提供程序签名的令牌和声明响应的公钥材料的 JSON Web 密钥集（JWKS）的文件名或 URL。如果不以 `https` 或 `http` 开头，则视为文件名，相对于 Elasticsearch 配置目录解析。文件更改以全局 `resource.reload.interval.high` 设置（默认 5 秒）确定的频率轮询。如果提供了 URL，则必须以 `https://` 或 `http://` 开头。Elasticsearch 会自动缓存检索到的 JWK，并在签名验证失败时尝试刷新 JWK，因为这可能表明 OpenID Connect 提供程序已轮换签名密钥。
- **`authorization_realms`**（静态）— 委托授权的域名称。
- **`rp.client_id`**（静态）— 在 OpenID Connect 提供程序注册期间分配给 Elasticsearch 的 OAuth 2.0 客户端标识符。
- **`rp.client_secret`**（安全）— 在 OpenID Connect 提供程序注册期间分配给 Elasticsearch 的 OAuth 2.0 客户端密钥。
- **`rp.client_auth_method`**（静态）— Elasticsearch 用于向 OpenID Connect 提供程序进行身份验证的客户端身份验证方法。可以是 `client_secret_basic`、`client_secret_post` 或 `client_secret_jwt`。默认为 `client_secret_basic`。
- **`rp.client_auth_jwt_signature_algorithm`**（静态）— 当 `rp.client_auth_method` 选择 `client_secret_jwt` 时，Elasticsearch 用于对其作为客户端向 OpenID Connect 提供程序进行身份验证的 JWT 进行签名的签名算法。可以是 `HS256`、`HS384` 或 `HS512`。默认为 `HS384`。
- **`rp.redirect_uri`**（静态）— Kibana 中的重定向 URI。使用授权码流时是 Kibana 服务器的 `api/security/oidc/callback` 端点；使用隐式流时是 `api/security/oidc/implicit` 端点。
- **`rp.response_type`**（静态）— 确定要使用的授权处理流的 OAuth 2.0 响应类型值。对于授权码授予流为 `code`，对于隐式流为 `id_token` 或 `id_token token`。
- **`rp.signature_algorithm`**（静态）— Elasticsearch 将用于验证它从 OpenID Connect 提供程序接收的 id 令牌的签名的签名算法。允许的值为 `HS256`、`HS384`、`HS512`、`ES256`、`ES384`、`ES512`、`RS256`、`RS384`、`RS512`、`PS256`、`PS384`、`PS512`。默认为 `RS256`。
- **`rp.requested_scopes`**（静态）— OpenID Connect 提供程序作为身份验证请求的一部分请求的 scope 值。可选，默认为 `openid`。
- **`rp.post_logout_redirect_uri`**（静态）— 成功单点注销后，OpenID Connect 提供程序应将浏览器重定向到的重定向 URI（通常在 Kibana 中）。
- **`claims.principal`** / **`groups`** / **`name`** / **`mail`** / **`dn`**（静态）— 分别包含用户主体（用户名）、组、全名、电子邮件地址、X.509 可分辨名称的 OpenID Connect 声明的名称。
- **`claim_patterns.principal`** / **`groups`** / **`name`** / **`mail`** / **`dn`**（静态）— 与相应 claims 设置指定的 OpenID Connect 声明匹配的 Java 正则表达式，语义同 SAML 的 attribute_patterns。
- **`allowed_clock_skew`**（静态）— 在验证 id 令牌的创建和过期时间时考虑的最大允许时钟偏差。默认为 `60s`。
- **`populate_user_metadata`**（静态）— 指定是否使用 OpenID Connect 声明提供的值填充 Elasticsearch 用户的元数据。默认为 `true`。
- **`http.*`**（静态）— 用于到 OpenID Connect 提供程序端点的所有后端通道通信的内部 HTTP 客户端行为设置：`http.proxy.host`、`http.proxy.scheme`（默认 `http`，允许 `http`/`https`）、`http.proxy.port`（默认 80）、`http.connect_timeout`（默认 `5s`）、`http.connection_read_timeout`（默认 `5s`）、`http.socket_timeout`（默认 `5s`）、`http.max_connections`（默认 200）、`http.max_endpoint_connections`（默认 200）、`http.tcp.keep_alive`（默认 `true`）、`http.connection_pool_ttl`（默认 3 分钟；连接空闲超过指定超时将被关闭。服务器也可以设置 Keep-Alive HTTP 响应头，有效值为该设置与 Keep-Alive 响应头之间的较小值。配置为 `-1` 则由服务器决定；如果服务器未设置该头且设置为 `-1`，则存活时间无限，连接永不过期）。

### OpenID Connect 域 SSL 设置

以下设置可用于配置到 OpenID Connect 提供程序端点的所有外发 HTTP 连接的 SSL。这些设置仅用于 Elasticsearch 与 OpenID Connect 提供程序之间的后端通道通信。

包含完整的 TLS/SSL 设置集（与 SAML 域 SSL 设置所列相同），语义与通用 TLS/SSL 设置相同。

## JWT 域设置

除了对所有域有效的设置外，你还可以指定以下设置：

- **`token_type`**（静态）— JWT 域用于验证传入 JWT 的令牌类型，`id_token` 或 `access_token`。默认为 `id_token`。
- **`allowed_audiences`**（静态）— Elasticsearch 应验证的允许的 JWT 受众列表。Elasticsearch 只会使用为这些受众中的任何一个发行的 JWT（由 JWT 中的 `aud` 声明表示）。受众使用精确字符串匹配进行比较，不支持通配符或正则。`aud` 声明的示例有 `https://example.com/client1` 和 `other_service,elasticsearch`。当 `token_type` 为 `access_token` 时，如果 `aud` 不存在，受众可以选择由 JWT 中的不同声明表示（参阅 `fallback_claims.aud`）。
- **`allowed_clock_skew`**（静态）— 在验证 JWT 的创建、not before 和过期时间时考虑的最大允许时钟偏差。
- **`allowed_issuer`**（静态）— 你的 JWT 颁发者的可验证标识符。颁发者标识符通常是用 https 方案的区分大小写的 URL，但它可以是任何字符串。该值应由你的 JWT 颁发者提供。颁发者使用精确字符串匹配进行比较。`iss` 声明的示例有 `https://example.com:8443/jwt` 和 `issuer123`。
- **`allowed_subjects`**（静态）— Elasticsearch 应验证的允许的 JWT 主题列表。Elasticsearch 只会使用为这些主题中的任何一个发行的 JWT（由 JWT 中的 `sub` 声明表示）。主题使用精确字符串匹配进行比较。当 `token_type` 为 `access_token` 时，此设置为必需，如果 `sub` 不存在，主题可以选择由 JWT 中的不同声明表示（参阅 `fallback_claims.sub`）。
- **`fallback_claims.sub`** / **`fallback_claims.aud`**（静态）— 如果 `sub`/`aud` 声明不存在，用于查找主题/受众信息的替代声明。仅在 `token_type` 为 `access_token` 时可配置。回退应用于使用相应声明的所有地方。
- **`required_claims`**（静态）— Elasticsearch 应验证的其他声明及其关联值。这是一个接受键/值对的组设置，键是字符串，值必须是字符串或字符串数组。值使用精确字符串匹配进行比较。例如：

  ```yaml
  xpack.security.authc.realms.jwt.jwt1:
    required_claims:
      token_use: "id"
      versions: [ "1.0", "2.0" ]
  ```

- **`allowed_signature_algorithms`**（静态）— Elasticsearch 将用于验证它从 JWT 颁发者接收的 JWT 的签名的签名算法列表。默认为 `RS256`。示例有 `HS512,RS512,ES512` 和 `ES384`。允许的值为 `HS256`、`HS384`、`HS512`、`ES256`、`ES384`、`ES512`、`RS256`、`RS384`、`RS512`、`PS256`、`PS384`、`PS512`。
- **`authorization_realms`**（静态）— 委托授权的域名称。
- **`claims.dn`** / **`groups`** / **`mail`** / **`name`** / **`principal`**（静态）— 分别包含用户可分辨名称（DN）、组、电子邮件地址、用户名、主体（例如 `sub`、`name`、`email`、`dn`）的 JWT 声明的名称。
- **`claim_patterns.dn`** / **`group`** / **`mail`** / **`name`** / **`principal`**（静态）— 可选的 Java 正则表达式，在相应 claims 设置指定的 JWT 声明应用到用户属性之前与之匹配。值必须匹配该模式，第一个捕获组的值被用作属性值。
- **`client_authentication.type`**（静态）— 指定是使用 `shared_secret` 还是 `none` 来验证传入的客户端请求。如果此值为 `shared_secret`，则使用必须与预先配置的密钥值匹配的 HTTP 请求头来验证客户端。客户端必须在 `ES-Client-Authentication` 请求头中随每个请求提供此共享密钥。如果此值为 `none`，则忽略 `ES-Client-Authentication` 请求头。默认为 `shared_secret`。建议启用客户端身份验证。如果 JWT 不记名令牌与其他客户端或服务共享，客户端身份验证会限制哪些客户端或服务允许将这些 JWT 提交给 Elasticsearch。
- **`client_authentication.shared_secret`**（安全，可重载）— 用于客户端身份验证的密钥值字符串。如果 `client_authentication.type` 为 `shared_secret`，则为必需。
- **`client_authentication.rotation_grace_period`**（静态）— 设置轮换 `client_authentication.shared_secret` 后其保持有效的宽限期。`client_authentication.shared_secret` 可以通过更新密钥库然后调用重载 API 来轮换。默认为 `1m`。
- **`http.*`**（静态）— 用于从远程 URL 获取 JSON Web 密钥集的 HTTP 客户端设置：`http.proxy.host`、`http.proxy.scheme`（必须是 `http`）、`http.proxy.port`（默认 80）、`http.connect_timeout`（默认 `5s`）、`http.connection_read_timeout`（默认 `5s`）、`http.socket_timeout`（默认 `5s`）、`http.max_connections`、`http.max_endpoint_connections`。
- **`jwt.cache.size`**（静态）— 指定 JWT 缓存条目的最大数量。如果客户端为每个请求使用不同的 JWT，请设置为 0 以禁用 JWT 缓存。默认为 100000。
- **`jwt.cache.ttl`**（静态）— 指定缓存 JWT 条目的时间段存活时间。只有在客户端身份验证成功（或已禁用）的情况下才能缓存 JWT。使用标准 Elasticsearch 时间单位。默认为 `20m`。
- **`pkc_jwkset_path`**（静态）— JWT 域用于验证令牌签名的公钥材料的 JSON Web 密钥集（JWKS）的文件名或 URL。如果不以 `https` 开头则视为文件名，相对于 Elasticsearch 配置目录解析。如果提供 URL，则必须以 `https://` 开头（不支持 `http://`）。Elasticsearch 会自动缓存 JWK 集，并在签名验证失败时尝试刷新，因为这可能表明 JWT 提供程序已轮换签名密钥。
- **`hmac_jwkset`**（安全）— JSON Web 密钥集（JWKS）的内容，包括 JWT 域用于验证令牌签名的密钥。此格式支持多个密钥和可选属性，优于 `hmac_key` 设置。不能与 `hmac_key` 设置一起使用。参阅配置 Elasticsearch 使用 JWT 域。
- **`hmac_key`**（安全）— 单个 JSON Web 密钥（JWK）的内容，包括 JWT 域用于验证令牌签名的密钥。此格式只支持单个没有属性的密钥，不能与 `hmac_jwkset` 设置一起使用。此格式与 OIDC 兼容。HMAC 密钥必须是 UNICODE 字符串，其中密钥字节是 UNICODE 字符串的 UTF-8 编码。
- **`populate_user_metadata`**（静态）— 指定是否使用 JWT 声明提供的值填充 Elasticsearch 用户的元数据。默认为 `true`。

### JWT 域 SSL 设置

以下设置可用于配置从远程 URL 获取 JSON Web 密钥集的 SSL。这些设置仅用于 Elasticsearch 与 JWT 颁发者之间的后端通道通信。

包含完整的 TLS/SSL 设置集（与 SAML 域 SSL 设置所列相同），语义与通用 TLS/SSL 设置相同。

## 负载平衡和故障转移

静态 `load_balance.type` 设置可以具有以下值：

- `failover`：按指定的顺序使用指定的 URL。可以连接到的第一个服务器将用于所有后续连接。如果与该服务器的连接失败，则将下一个可以建立连接的服务器用于后续连接。
- `dns_failover`：在此操作模式下，只能指定一个 URL。此 URL 必须包含一个 DNS 名称。系统将查询与此 DNS 名称对应的所有 IP 地址。将始终按检索到的顺序尝试与 Active Directory 或 LDAP 服务器的连接。这与 `failover` 的不同之处在于列表不会重新排序，即使列表开头的服务器已失败，仍会在每个后续连接中尝试它。
- `round_robin`：连接将不断循环遍历提供的 URL 列表。如果某个服务器不可用，将继续循环遍历 URL 列表，直到建立成功连接。
- `dns_round_robin`：在此操作模式下，只能指定一个 URL。此 URL 必须包含一个 DNS 名称。系统将查询与此 DNS 名称对应的所有 IP 地址。连接将不断循环遍历地址列表。如果某个服务器不可用，将继续循环遍历 URL 列表，直到建立成功连接。

## 通用 TLS 设置

- **`xpack.security.ssl.diagnose.trust`**（静态）— 控制是否为 SSL/TLS 信任失败输出诊断消息。如果为 `true`（默认），每当 SSL 连接（传入或传出）由于建立信任失败而被拒绝时，将在 Elasticsearch 日志中打印一条消息。此诊断消息包含可用于确定失败原因并帮助解决问题的信息。设置为 `false` 以禁用这些消息。

## TLS/SSL 密钥和受信任证书设置

以下设置用于指定通过 SSL/TLS 连接通信时应使用的私钥、证书和受信任证书。如果未配置受信任证书，则 JVM 默认信任的证书以及与同一上下文中密钥关联的证书将被信任。对于需要客户端身份验证的连接或作为启用 SSL 的服务器时，必须配置密钥和证书。

在 PKCS#12 文件中存储受信任证书虽然受支持，但在实践中并不常见。`elasticsearch-certutil` 工具以及 Java 的 `keytool` 旨在生成既可用作密钥库又可用作信任库的 PKCS#12 文件，但使用其他工具创建的容器文件可能并非如此。通常，PKCS#12 文件只包含密钥和私钥条目。要确认 PKCS#12 容器包含受信任证书（"锚点"）条目，请在 `openssl pkcs12 -info` 输出中查找 `2.16.840.1.113894.746875.1.1: <Unsupported tag 6>`，或在 `keytool -list` 输出中查找 `trustedCertEntry`。

## HTTP TLS/SSL 设置

你可以配置以下 TLS/SSL 设置。

- **`xpack.security.http.ssl.enabled`**（静态）— 用于在 Elasticsearch 用于与其他客户端通信的 HTTP 网络层上启用或禁用 TLS/SSL。默认为 `false`。
- **`xpack.security.http.ssl.supported_protocols`**（静态）— 支持的协议及版本。有效协议：`SSLv2Hello`、`SSLv3`、`TLSv1`、`TLSv1.1`、`TLSv1.2`、`TLSv1.3`。如果 JVM 的 SSL 提供程序支持 TLSv1.3，默认为 `TLSv1.3,TLSv1.2,TLSv1.1`；否则默认为 `TLSv1.2,TLSv1.1`。Elasticsearch 依赖于你的 JDK 的 SSL 和 TLS 实现。FIPS 模式下不能使用 `SSLv2Hello` 或 `SSLv3`。
- **`xpack.security.http.ssl.client_authentication`**（静态）— 控制服务器在请求客户端连接证书方面的行为。有效值为 `required`、`optional` 和 `none`。`required` 强制客户端出示证书，`optional` 请求客户端证书但不要求客户端必须出示。默认为 `none`。
- **`xpack.security.http.ssl.verification_mode`**（静态）— `xpack.security.http.ssl` 中的 SSL 设置控制 TLS 的服务器上下文，它定义 TLS 连接的设置。不建议在 TLS 服务器中使用 verification_mode。定义如何验证 TLS 连接中另一方出示的证书。有效值为 `full`、`certificate`、`none`（默认 `full`）；对 `none` 有与上文相同的安全警告。
- **`xpack.security.http.ssl.cipher_suites`**（静态）— 支持的密码套件取决于你使用的 Java 版本。例如，对于版本 12，默认值与上文通用设置中列出的套件相同。更多信息参阅 Oracle 的 Java 密码体系结构文档。

## HTTP TLS/SSL 密钥和受信任证书设置

以下设置用于指定通过 SSL/TLS 连接通信时应使用的私钥、证书和受信任证书。必须配置私钥和证书。

**PEM 编码文件**：

- **`xpack.security.http.ssl.key`**（静态）— 包含私钥的 PEM 编码文件的路径。如果需要 HTTP 客户端身份验证，则使用此文件。不能与 `ssl.keystore.path` 同时使用此设置。
- **`xpack.security.http.ssl.key_passphrase`**（静态）— 用于解密私钥的密码短语。由于密钥可能未加密，此值是可选的。在 7.17.0 中已弃用，建议改用 `ssl.secure_key_passphrase`。不能与 `ssl.secure_key_passphrase` 同时使用。
- **`xpack.security.http.ssl.secure_key_passphrase`**（安全）— 用于解密私钥的密码短语。
- **`xpack.security.http.ssl.certificate`**（静态）— 指定与密钥关联的 PEM 编码证书（或证书链）的路径。只有在设置了 `ssl.key` 的情况下才能使用此设置。
- **`xpack.security.http.ssl.certificate_authorities`**（静态）— 应当信任的 PEM 编码证书文件的路径列表。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-settings.html)
