# 审计安全设置

你可以使用[审计日志](/secure_the_elastic_stack/enable_audit_logging/enable_audit_logging)记录与安全相关的事件，例如身份验证失败、拒绝连接和数据访问事件。此外，通过 API 对安全配置的更改，例如创建、更新和删除[本机](/secure_the_elastic_stack/user_authentication/native_user_authentication)和[内置](/secure_the_elastic_stack/user_authentication/built_in_users)用户、[角色](/rest_apis/security_apis/create_or_update_roles)、[角色映射](/rest_apis/security_apis/create_or_update_role_mappings)和 [API 键](/rest_apis/security_apis/create_api_keys)也会被记录下来。

::: tip 提示
审计日志仅在某些订阅级别上可用。欲了解更多信息，参阅 [https://www.elastic.co/subscriptions](https://www.elastic.co/subscriptions)。
:::

如果配置了，则必须在集群中的每个节点上设置审计设置。静态设置，例如 `xpack.security.audit.enabled`，必须在每个节点的 `elasticsearch.yml` 中配置。对于动态审计设置，使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings)确保所有节点上的设置相同。

## 常规审计设置

- `xpack.security.audit.enabled`

    ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置为 `true`，启用对节点的审计。默认值为 `false`。这将把审计事件放在一个名为 `<clustername>_audit.json` 的专用文件中。

    如果启用，则必须在 `elasticsearch.yml` 中配置此设置。在集群中的所有节点上使用。

## 审计事件设置

可以通过使用以下设置来控制记录的事件和其他信息:

- `xpack.security.audit.logfile.events.include`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))指定要在审计输出中打印的[事件类型](/secure_the_elastic_stack/enable_audit_logging/audit_events)。此外，`_all` 可以用于详尽地审计所有事件，但通常不建议这样做，因为它会变得非常冗长。默认列表值包括：`access_denied`、`access_granted`、`anonymous_access_denied`、`authentication_failed`、`connection_denied`、`tampered_request`、`run_as_denied`、`run_as_granted`、`security_config_change`。

- `xpack.security.audit.logfile.events.exclude`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))从包含列表中排除指定[事件类型](/secure_the_elastic_stack/enable_audit_logging/audit_events)。这在事件的情况下很有用。包含设置包含特殊值 `_all`。默认是空列表。

- `xpack.security.audit.logfile.events.emit_request_body`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))指定是否将来自 REST 请求的完整请求体作为某些类型的审计事件的属性。此设置可用于[审计搜索查询](/secure_elastic_stack/enable_audit_logging/auditing_search_queries)。

    默认值为 `false`，因此不打印请求体。

::: danger 重要
当在审计事件中包含请求体时，建议可能会以纯文本的形式审计敏感数据，即使所有安全 API(如更改用户密码的 API)在审计时都会过滤掉凭据。
:::

## 本地节点信息设置

- `xpack.security.audit.logfile.emit_node_name`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))是否在每个审计事件中包含[节点名](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#节点名设置)字段。默认值为 `false`。

- `xpack.security.audit.logfile.emit_node_host_address`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))在每个审计事件中是否包含节点的 IP 地址作为字段。默认值为 `false`。

- `xpack.security.audit.logfile.emit_node_host_name`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))是否在每个审计事件中包含节点的主机名作为字段。默认值为 `false`。

- `xpack.security.audit.logfile.emit_node_id`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))是否在每个审计事件中包含节点id字段。节点名称的值可能在管理员更改配置文件中的设置时发生变化，与节点名称不同的是，节点 id 将在集群重新启动时保持不变，管理员不能更改它。缺省值为 `true`。

## 审计日志文件事件忽略策略

以下设置影响[忽略策略](/secure_the_elastic_stack/enable_audit_logging/logfile_audit_events_ignore_policies)，这些策略支持对哪些审计事件打印到日志文件进行细粒度控制。具有相同策略名称的所有设置组合在一起形成单一策略。如果一个事件匹配任何策略的所有条件，它将被忽略并且不打印。大多数审计事件服从于忽略策略。唯一的例外是 `security_config_change` 类型的事件，它不能被过滤掉，除非完全[排除](/set_up_elasticsearch/configuring_elasticsearch/auditing_settings#审计事件设置)。

- `xpack.security.audit.logfile.events.ignore_filters.<policy_name>.users`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))用户名或通配符的列表。指定的策略将不会打印匹配这些值的用户的审计事件。

- `xpack.security.audit.logfile.events.ignore_filters.<policy_name>.realms`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))认证领域名称或通配符的列表。指定的策略将不会为这些域中的用户打印审计事件。

- `xpack.security.audit.logfile.events.ignore_filters.<policy_name>.actions`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))操作名或通配符的列表。操作名可以在审计事件的 `action` 字段中找到。指定的策略将不会为匹配这些值的操作打印审计事件。

- `xpack.security.audit.logfile.events.ignore_filters.<policy_name>.roles`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))角色名或通配符的列表。指定的策略将不会为具有这些角色的用户打印审计事件。如果用户有多个角色，其中一些角色**不**在策略中覆盖，则策略将**不**覆盖此事件。

- `xpack.security.audit.logfile.events.ignore_filters.<policy_name>.indices`

    ([动态](/set_up_elasticsearch/configuring_elasticsearch))索引名或通配符的列表。当事件中的所有索引都匹配这些值时，指定的策略将不打印审计事件。如果事件涉及多个索引，其中一些不在策略覆盖范围内，则策略将**不**覆盖此事件。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/auditing-settings.html)
