# GeoIP 统计 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [摄取 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ingest)。

:::::

获取有关 geoip 处理器的统计信息，包括与之一起使用的 GeoIP2 数据库的下载统计信息。

## 请求

```bash
GET _ingest/geoip/stats
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。
- 如果 `ingest.geoip.downloader.enabled` 被禁用且未配置自定义数据库，此 API 返回零值和空的 nodes 对象。

## 响应体

- `stats`

  （对象）所有 GeoIP2 数据库的下载统计信息。

  `stats` 的属性：

  - `successful_downloads`

    （整数）成功的数据库下载总次数。

  - `failed_downloads`

    （整数）失败的数据库下载总次数。

  - `total_download_time`

    （整数）下载数据库花费的总毫秒数。

  - `database_count`

    （整数）当前可用的数据库数量。

  - `skipped_updates`

    （整数）跳过的数据库更新总次数。

- `nodes`

  （对象）每个节点的统计信息。

  `nodes` 的属性：

  - `<node_id>`

    （对象）该节点已下载的数据库。字段键为节点 ID。

    `<node_id>` 的属性：

    - `databases`

      （对象数组）该节点已下载的数据库。

      `databases` 对象的属性：

      - `name`

        （字符串）数据库的名称。

    - `cache_stats`

      （对象）该节点的 GeoIP 缓存统计信息。

      `cache_stats` 的属性：

      - `count`

        （长整数）缓存条目数。

      - `hits`

        （长整数）从缓存服务的富化查找次数。

      - `misses`

        （长整数）GeoIP 查找无法从缓存服务的次数。

      - `evictions`

        （长整数）从缓存中驱逐的缓存条目数。

      - `hits_time_in_millis`

        （长整数）仅在缓存命中成功时从缓存获取数据所花费的毫秒数。

      - `misses_time_in_millis`

        （长整数）仅在缓存未命中时从缓存和底层 GeoIP2 数据库获取数据并更新缓存所花费的毫秒数。

    - `files_in_temp`

      （字符串数组）已下载的数据库文件，包括相关的许可证文件。Elasticsearch 将这些文件存储在节点的临时目录中：`$ES_TMPDIR/geoip-databases/<node_id>`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/geoip-stats-api.html)
