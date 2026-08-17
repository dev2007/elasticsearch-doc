# 创建或更新 IP 地理位置数据库配置 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [摄取 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ingest)。

:::::

创建或更新 IP 地理位置数据库配置。

下面展示的 Maxmind `account_id` 需要许可证密钥。由于许可证密钥是敏感信息，它作为安全设置存储在 Elasticsearch 中，名称为 `ingest.geoip.downloader.maxmind.license_key`。每个 Elasticsearch 集群目前仅允许一个 Maxmind 许可证密钥。必须在安全设置中提供有效的许可证密钥才能从 Maxmind 下载。许可证密钥设置在所有节点重启或执行 `reload_secure_settings` 请求后才生效。

```json
PUT _ingest/ip_location/database/my-database-1
{
  "name": "GeoIP2-Domain",
  "maxmind": {
    "account_id": "1234567"
  }
}
```

下面展示的 IPinfo 配置需要令牌。由于令牌是敏感信息，它作为安全设置存储在 Elasticsearch 中，名称为 `ingest.ip_location.downloader.ipinfo.token`。每个 Elasticsearch 集群目前仅允许一个 IPinfo 令牌。必须在安全设置中提供有效的令牌才能从 IPinfo 下载。令牌设置在所有节点重启或执行 `reload_secure_settings` 请求后才生效。

```json
PUT _ingest/ip_location/database/my-database-2
{
  "name": "standard_location",
  "ipinfo": {
  }
}
```

## 请求

```bash
PUT /_ingest/ip_location/database/<database>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<database>`

  （必需，字符串）要创建或更新的数据库配置的 ID。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 请求体

- `name`

  （必需，字符串）要下载的 IP 地理位置数据库的提供商分配名称。

- `<provider>`

  （必需，提供商对象及其关联配置）用于标识使用哪个 IP 地理位置提供商下载数据库的配置，以及下载所需的任何特定于提供商的配置。

  目前支持的提供商为 `maxmind` 和 `ipinfo`。`maxmind` 提供商需要配置 `account_id`（字符串）。`ipinfo` 提供商在请求体中不需要额外配置。

## 许可

从第三方提供商下载数据库是一项商业功能，需要适当的许可证。有关更多信息，请参阅 [https://www.elastic.co/subscriptions](https://www.elastic.co/subscriptions)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-ip-location-database-api.html)
