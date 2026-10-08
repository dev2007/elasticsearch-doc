# 禁用用户配置文件 API

禁用用户配置文件，使其在用户配置文件搜索中不可见。

```txt
POST /_security/profile/<uid>/_disable
PUT /_security/profile/<uid>/_disable
```

## 前置条件

- 要使用此 API，你必须具有 `manage_user_profile` 集群权限。

## 描述

:::important 重要

用户配置文件功能仅供 Kibana 以及 Elastic 的可观测性、企业搜索和 Elastic Security 解决方案使用。个别用户和外部应用程序不应直接调用此 API。Elastic 保留在未来版本中更改或删除此功能而不事先通知的权利。

:::

激活用户配置文件时，它会自动启用并在用户配置文件搜索中可见。你可以使用此 API 禁用用户配置文件，使其在这些搜索中不可见。

要重新启用已禁用的用户配置文件，请使用启用用户配置文件 API。

## 路径参数

`<uid>`

（必需，字符串）用户配置文件的唯一标识符。

## 查询参数

`refresh`

（可选，枚举值）默认为 `false`。如果为 `true`，Elasticsearch 会刷新受影响的分片以使此操作对搜索可见；如果为 `wait_for`，则等待刷新以使此操作对搜索可见；如果为 `false`，则不执行与刷新相关的任何操作。

## 示例

以下示例禁用 uid 为 `u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0` 的用户配置文件：

```txt
POST /_security/profile/u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0/_disable
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-disable-user-profile.html)
