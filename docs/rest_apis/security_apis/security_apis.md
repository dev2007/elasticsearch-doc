# 安全 API

使用安全 API 之前，必须在 `elasticsearch.yml` 文件中将 `xpack.security.enabled` 设置为 `true`。

::::::info 新版 API 参考

有关最新的 API 详情，请参阅[安全 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-security)。

::::::

## 核心安全 API

用于执行一般的安全活动：

- [验证 API](./authenticate)
- [清除缓存 API](./clear_cache)
- [委托 PKI 验证 API](./delegate_pki_authentication)
- [是否具有权限 API](./has_privileges)
- [SSL 证书 API](./ssl)
- [获取内置权限 API](./get_builtin_privileges)
- [获取安全设置 API](./get_security_index_settings)
- [更新安全设置 API](./update_security_index_settings)
- [获取用户权限 API](./get_user_privileges)

## 应用程序权限

添加、更新、检索和移除应用程序权限：

- [创建或更新权限 API](./put_privileges)
- [清除权限缓存 API](./clear_privilege_cache)
- [删除权限 API](./delete_privileges)
- [获取权限 API](./get_privileges)

## 角色映射

添加、移除、更新和检索角色映射：

- [创建或更新角色映射 API](./put_role_mapping)
- [删除角色映射 API](./delete_role_mapping)
- [获取角色映射 API](./get_role_mapping)

## 角色

在本机 realm 中添加、移除、更新和检索角色：

- [创建或更新角色 API](./put_role)
- [批量创建或更新角色 API](./bulk_put_role)
- [清除角色缓存 API](./clear_role_cache)
- [删除角色 API](./delete_role)
- [批量删除角色 API](./bulk_delete_role)
- [获取角色 API](./get_role)
- [查询角色 API](./query_role)

## 令牌

创建和使失效持有者令牌，无需基本身份验证即可访问：

- [获取令牌 API](./get_token)
- [使令牌失效 API](./invalidate_token)

## API 密钥

**REST API 密钥**（无需基本身份验证即可通过 REST 访问）：

- [创建 REST API 密钥 API](./create_api_key)
- [授予 REST API 密钥 API](./grant_api_key)
- [更新 REST API 密钥 API](./update_api_key)
- [批量更新 REST API 密钥 API](./bulk_update_api_keys)

**跨集群 API 密钥**（基于 API 密钥的远程集群访问）：

- [创建跨集群 API 密钥 API](./create_cross_cluster_api_key)
- [更新跨集群 API 密钥 API](./update_cross_cluster_api_key)

**检索和使所有类型的 API 密钥失效：**

- [获取 API 密钥 API](./get_api_key)
- [使 API 密钥失效 API](./invalidate_api_key)
- [查询 API 密钥 API](./query_api_key)
- [清除 API 密钥缓存 API](./clear_api_key_cache)

## 用户

在本机 realm 中添加、移除、更新或检索用户：

- [创建或更新用户 API](./put_user)
- [更改密码 API](./change_password)
- [删除用户 API](./delete_user)
- [禁用用户 API](./disable_user)
- [启用用户 API](./enable_user)
- [获取用户 API](./get_user)
- [查询用户 API](./query_user)

## 服务账户

列出服务账户并管理服务令牌：

- [获取服务账户 API](./get_service_accounts)
- [创建服务账户令牌 API](./create_service_token)
- [清除服务账户令牌缓存 API](./clear_service_token_caches)
- [删除服务账户令牌 API](./delete_service_token)
- [获取服务账户凭据 API](./get_service_credentials)

## OpenID Connect

针对 OpenID Connect 验证 realm 对用户进行身份验证（用于 Kibana 之外的自定义 Web 应用程序）：

- [准备验证请求 API](./oidc_prepare_authentication)
- [提交验证响应 API](./oidc_authenticate)
- [注销已验证用户 API](./oidc_logout)

## SAML

针对 SAML 验证 realm 对用户进行身份验证（用于 Kibana 之外的自定义 Web 应用程序）：

- [准备验证请求 API](./saml_prepare_authentication)
- [提交验证响应 API](./saml_authenticate)
- [注销已验证用户 API](./saml_logout)
- [提交来自 IdP 的注销请求 API](./saml_invalidate)
- [验证来自 IdP 的注销响应 API](./saml_complete_logout)
- [生成 SAML 元数据 API](./saml_sp_metadata)

## 注册

使新节点能够加入启用了安全功能的现有集群，或使 Kibana 实例能够自行配置以与受保护的 Elasticsearch 集群通信：

- [注册新节点 API](./enroll_node)
- [注册新 Kibana 实例 API](./enroll_kibana)

## 用户配置文件

检索和管理用户配置文件：

- [激活用户配置文件 API](./activate_user_profile)
- [获取用户配置文件 API](./get_user_profile)
- [更新用户配置文件数据 API](./update_user_profile_data)
- [启用用户配置文件 API](./enable_user_profile)
- [禁用用户配置文件 API](./disable_user_profile)
- [建议用户配置文件 API](./suggest_user_profile)
- [用户配置文件是否具有权限 API](./has_privileges_user_profile)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api.html)
