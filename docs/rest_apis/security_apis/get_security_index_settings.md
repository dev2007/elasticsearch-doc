# 获取安全设置 API

检索安全内部索引的用户可配置设置。

```txt
GET /_security/settings
```

## 前置条件

- 要使用此 API，你必须至少具有 `read_security` 集群权限。

## 描述

此 API 允许用户检索安全内部索引（`.security` 及相关索引）的用户可配置设置。

仅显示索引设置中用户可配置的子集，包括：

- `index.auto_expand_replicas`
- `index.number_of_replicas`

可以使用更新安全设置 API 修改这些可配置的设置。

## 示例

以下示例检索安全内部索引的用户可配置设置：

```txt
GET /_security/settings
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-settings.html)
