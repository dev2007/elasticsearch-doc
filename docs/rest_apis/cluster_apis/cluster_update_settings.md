# 集群更新设置 API

:::info 新 API 参考
有关最新的 API 详情，请参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

配置[动态集群设置](/set_up_elasticsearch/configuring_elasticsearch)。

## 请求

`PUT /_cluster/settings`

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

你可以使用集群更新设置 API 在运行中的集群上配置和更新动态设置。你也可以使用 `elasticsearch.yml` 在未启动或已关闭的节点上本地配置动态设置。

使用集群更新设置 API 进行的更新可以是*持久性*的（在集群重启后仍然有效），也可以是*临时性*的（在集群重启后重置）。你还可以通过使用 API 将临时或持久设置赋值为 `null` 来重置它们。

如果你使用多种方法配置相同的设置，Elasticsearch 会按以下优先级顺序应用设置：

1. 临时设置
2. 持久设置
3. `elasticsearch.yml` 设置
4. 默认设置值

例如，你可以应用临时设置来覆盖持久设置或 `elasticsearch.yml` 设置。但是，对 `elasticsearch.yml` 设置的更改不会覆盖已定义的临时或持久设置。

:::tip 提示
如果你使用 Elasticsearch Service，请使用[用户设置](https://www.elastic.co/docs/deploy-manage/deploy/elastic-cloud/edit-stack-settings)功能来配置所有集群设置。这种方法可以让 Elasticsearch Service 自动拒绝可能破坏集群的不安全设置。

如果你在自己的硬件上运行 Elasticsearch，请使用集群更新设置 API 来配置动态集群设置。仅将 `elasticsearch.yml` 用于静态集群设置和节点设置。API 不需要重启，并确保所有节点上的设置值相同。
:::

:::warning 警告
我们不再推荐使用临时集群设置。请改用持久集群设置。如果集群变得不稳定，临时设置可能会意外清除，导致可能不希望的集群配置。请参阅[临时设置迁移指南](/migration_guide/8.0/transient_settings_migration_guide)。
:::

## 查询参数

- `flat_settings`
  （可选，布尔值）如果为 `true`，以扁平格式返回设置。默认为 `false`。

- `include_defaults`
  （可选，布尔值）如果为 `true`，返回所有默认集群设置。默认为 `false`。

- `master_timeout`
  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的时间。如果在超时到期前主节点不可用，请求失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

- `timeout`
  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然适用，但响应将指示未被完全确认。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

## 示例

持久性更新示例：

```bash
PUT /_cluster/settings
{
  "persistent" : {
    "indices.recovery.max_bytes_per_sec" : "50mb"
  }
}
```

临时更新示例：

:::warning 警告
我们不再推荐使用临时集群设置。请改用持久集群设置。如果集群变得不稳定，临时设置可能会意外清除，导致可能不希望的集群配置。请参阅[临时设置迁移指南](/migration_guide/8.0/transient_settings_migration_guide)。
:::

```bash
PUT /_cluster/settings?flat_settings=true
{
  "transient" : {
    "indices.recovery.max_bytes_per_sec" : "20mb"
  }
}
```

更新后的响应返回更改的设置，如临时示例的响应：

```json
{
  ...,
  "persistent" : { },
  "transient" : {
    "indices.recovery.max_bytes_per_sec" : "20mb"
  }
}
```

重置设置示例：

```bash
PUT /_cluster/settings
{
  "transient" : {
    "indices.recovery.max_bytes_per_sec" : null
  }
}
```

响应不包括已重置的设置：

```json
{
  ...,
  "persistent" : {},
  "transient" : {}
}
```

你也可以使用通配符重置设置。例如，重置所有动态 `indices.recovery` 设置：

```bash
PUT /_cluster/settings
{
  "transient" : {
    "indices.recovery.*" : null
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-update-settings.html)
