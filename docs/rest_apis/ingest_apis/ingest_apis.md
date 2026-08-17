# 摄取 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [摄取 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ingest)。

:::::

使用摄取 API 来管理与摄取管道和处理器相关的任务和资源。

## 摄取管道 API

使用以下 API 来创建、管理和测试摄取管道：

- [创建或更新管道 API](./put_pipeline)
- [获取管道 API](./get_pipeline)
- [删除管道 API](./delete_pipeline)
- [模拟管道 API](./simulate_pipeline) 和[模拟摄取 API](./simulate_ingest)（用于测试摄取管道）

## 统计 API

使用以下 API 获取有关摄取处理的统计信息：

- [GeoIP 统计 API](./geoip_stats)（用于获取与 geoip 处理器一起使用的 IP 地理位置数据库的下载统计信息）

## 摄取 IP 位置数据库 API

使用以下 API 来配置和管理商业 IP 地理位置数据库下载：

- [创建或更新 IP 地理位置数据库配置 API](./put_ip_location_database)
- [获取 IP 地理位置数据库配置 API](./get_ip_location_database)
- [删除 IP 地理位置数据库配置 API](./delete_ip_location_database)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ingest-apis.html)
