# 获取 IP 地理位置数据库配置 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [摄取 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ingest)。

:::::

返回一个或多个 IP 地理位置数据库配置的信息。

## 请求

```bash
GET /_ingest/ip_location/database/<database>
```

```bash
GET /_ingest/ip_location/database
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<database>`

  （可选，字符串）要检索的数据库配置 ID 的逗号分隔列表。支持通配符（`*`）表达式。

  要获取所有数据库配置，省略此参数或使用 `*`。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

以下示例检索 `my-database-id` 数据库配置的信息：

```bash
GET /_ingest/ip_location/database/my-database-id
```

API 返回以下响应：

```json
{
  "databases" : [
    {
      "id" : "my-database-id",
      "version" : 1,
      "modified_date_millis" : 1723040276114,
      "database" : {
        "name" : "GeoIP2-Domain",
        "maxmind" : {
          "account_id" : "1234567"
        }
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-ip-location-database-api.html)
