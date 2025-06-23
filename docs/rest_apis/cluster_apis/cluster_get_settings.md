# 集群获取设置 API

:::info 新 API 参考
有关最新 API 的详细信息，参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

返回整个集群的设置。

```bash
GET /_cluster/settings
```

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `monitor` 或 `manage` 的[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)以使用此 API。

## 请求

```bash
GET /_cluster/settings
```

## 描述

默认情况下，该 API 调用只返回已明确定义的设置，但也可以通过调用 `include_defaults` 参数来包含默认设置。

## 查询参数

- `flat_settings`
    （可选，布尔值） 如果为 `true`，则以平面格式返回设置。默认为 `false`。

- `include_defaults`
    （可选，布尔） 如果为 `true`，则返回本地节点的默认集群设置。默认为 `false`。

- `master_timeout`
    （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的时间。如果在超时前主节点不可用，则请求失败并返回错误。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-get-settings.html)
