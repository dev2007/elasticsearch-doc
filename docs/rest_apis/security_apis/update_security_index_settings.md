# 更新安全设置 API

更新安全内部索引的设置。

```txt
PUT /_security/settings
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` 集群权限。

## 描述

此 API 允许用户修改安全内部索引（`.security` 及相关索引）的设置。

仅允许修改以下设置的子集：

- `index.auto_expand_replicas`
- `index.number_of_replicas`

:::note 注意

如果设置了 `index.auto_expand_replicas`，则在更新期间将忽略 `index.number_of_replicas`。

:::

可以使用[获取安全设置 API](./get_security_index_settings) 检索配置的设置。

如果某个索引在系统上尚未投入使用，但为其提供了设置，则请求将被拒绝 — 此 API 尚不支持在索引投入使用之前为其配置设置。

## 请求体

`security`

（可选，对象）用于大部分安全配置（包括通过 API 配置的原生 realm 用户和角色）的索引的设置。

`security-tokens`

（可选，对象）用于存储令牌的索引的设置（参见获取令牌 API）。

`security-profile`

（可选，对象）用于存储档案信息的索引的设置（参见激活用户档案 API）。

## 示例

以下示例更新安全内部索引的设置：

```txt
PUT /_security/settings
{
  "security": {
    "index.auto_expand_replicas": "0-all"
  },
  "security-tokens": {
    "index.auto_expand_replicas": "0-all"
  },
  "security-profile": {
    "index.auto_expand_replicas": "0-all"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-update-settings.html)
