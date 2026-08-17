# 删除 IP 地理位置数据库配置 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [摄取 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ingest)。

:::::

删除 IP 地理位置数据库配置。

## 请求

```bash
DELETE /_ingest/ip_location/database/<database>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<database>`

  （必需，字符串）用于限制请求的数据库配置 ID。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

以下示例删除 `example-database-id` 数据库配置：

```bash
DELETE /_ingest/ip_location/database/example-database-id
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-ip-location-database-api.html)
