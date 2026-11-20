# GeoIP 处理器

`geoip` 处理器添加有关 IPv4 或 IPv6 地址地理位置的信息。它与 [MaxMind](https://www.maxmind.com/) 提供的 GeoIP2 和 GeoLite2 IP 地理位置数据库兼容。

默认情况下，该处理器使用 [MaxMind](http://dev.maxmind.com/geoip/geoip2/geolite2/) 以 CC BY-SA 4.0 许可证共享的 GeoLite2 City、GeoLite2 Country 和 GeoLite2 ASN IP 地理位置数据库。如果你的节点可以连接到 `storage.googleapis.com` 域，并且满足以下条件之一，它会自动下载这些数据库：

- `ingest.geoip.downloader.eager.download` 设置为 true
- 你的集群至少有一个带 `geoip` 或 `ip_location` 处理器的管道

Elasticsearch 会自动从 Elastic GeoIP 端点下载这些数据库的更新：[https://geoip.elastic.co/v1/database](https://geoip.elastic.co/v1/database?elastic_geoip_service_tos=agree)。要获取这些更新的下载统计信息，请使用 [GeoIP stats API](/rest_apis/enrich_apis/enrich_stats)。

如果你的集群无法连接到 Elastic GeoIP 端点，或者你想自己管理更新，参阅[管理你自己的 IP 地理位置数据库更新](#管理你自己的-ip-地理位置数据库更新)。

如果你希望 Elasticsearch 使用你自己提供的许可密钥直接从 Maxmind 下载数据库文件，参阅[创建或更新 IP 地理位置数据库配置 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-ip-location-database-api.html)。

如果 Elasticsearch 连续 30 天无法连接到端点，所有已更新的数据库将变为无效。Elasticsearch 将停止使用 IP 地理位置数据丰富文档，并改为添加 `tags: ["_geoip_expired_database"]` 字段。

## 在管道中使用 geoip 处理器

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 用于地理位置查询、获取 IP 地址的字段。 |
| `target_field` | 否 | `geoip` | 保存从数据库查询到的地理位置信息的字段。 |
| `database_file` | 否 | `GeoLite2-City.mmdb` | 数据库文件名，可以是自动下载的 GeoLite2 数据库之一（GeoLite2-City.mmdb、GeoLite2-Country.mmdb 或 GeoLite2-ASN.mmdb），也可以是 `ingest-geoip` 配置目录中受支持的数据库文件名，或者是[已配置数据库](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-ip-location-database-api.html)的名称（附加 `.mmdb` 后缀）。 |
| `properties` | 否 | [`continent_name`, `country_iso_code`, `country_name`, `region_iso_code`, `region_name`, `city_name`, `location`] * | 基于 IP 地理位置查询控制向 `target_field` 添加哪些属性。 |
| `ignore_missing` | 否 | `false` | 如果为 `true` 且 `field` 不存在，处理器会静默退出而不修改文档。 |
| `first_only` | 否 | `true` | 如果为 `true`，即使 `field` 包含数组，也只返回第一个找到的 IP 地理位置数据。 |
| `download_database_on_pipeline_creation` | 否 | `true` | 如果为 `true`（且 `ingest.geoip.downloader.eager.download` 为 `false`），则在创建管道时下载缺失的数据库。否则，下载由管道被用作索引的 `default_pipeline` 或 `final_pipeline` 时触发。 |

\*取决于 `database_file` 中可用的内容：

- 如果使用 GeoLite2 City 或 GeoIP2 City 数据库，则 `target_field` 下可能添加以下字段：`ip`、`country_iso_code`、`country_name`、`country_in_european_union`、`registered_country_iso_code`、`registered_country_name`、`registered_country_in_european_union`、`continent_code`、`continent_name`、`region_iso_code`、`region_name`、`city_name`、`postal_code`、`timezone`、`location` 和 `accuracy_radius`。实际添加的字段取决于找到的内容以及在 `properties` 中配置的属性。
- 如果使用 GeoLite2 Country 或 GeoIP2 Country 数据库，则 `target_field` 下可能添加以下字段：`ip`、`country_iso_code`、`country_name`、`country_in_european_union`、`registered_country_iso_code`、`registered_country_name`、`registered_country_in_european_union`、`continent_code` 和 `continent_name`。实际添加的字段取决于找到的内容以及在 `properties` 中配置的属性。
- 如果使用 GeoLite2 ASN 数据库，则 `target_field` 下可能添加以下字段：`ip`、`asn`、`organization_name` 和 `network`。实际添加的字段取决于找到的内容以及在 `properties` 中配置的属性。
- 如果使用 GeoIP2 Anonymous IP 数据库，则 `target_field` 下可能添加以下字段：`ip`、`hosting_provider`、`tor_exit_node`、`anonymous_vpn`、`anonymous`、`public_proxy` 和 `residential_proxy`。实际添加的字段取决于找到的内容以及在 `properties` 中配置的属性。
- 如果使用 GeoIP2 Connection Type 数据库，则 `target_field` 下可能添加以下字段：`ip` 和 `connection_type`。实际添加的字段取决于找到的内容以及在 `properties` 中配置的属性。
- 如果使用 GeoIP2 Domain 数据库，则 `target_field` 下可能添加以下字段：`ip` 和 `domain`。实际添加的字段取决于找到的内容以及在 `properties` 中配置的属性。
- 如果使用 GeoIP2 ISP 数据库，则 `target_field` 下可能添加以下字段：`ip`、`asn`、`organization_name`、`network`、`isp`、`isp_organization_name`、`mobile_country_code` 和 `mobile_network_code`。实际添加的字段取决于找到的内容以及在 `properties` 中配置的属性。
- 如果使用 GeoIP2 Enterprise 数据库，则 `target_field` 下可能添加以下字段：`ip`、`country_iso_code`、`country_name`、`country_in_european_union`、`registered_country_iso_code`、`registered_country_name`、`registered_country_in_european_union`、`continent_code`、`continent_name`、`region_iso_code`、`region_name`、`city_name`、`postal_code`、`timezone`、`location`、`accuracy_radius`、`country_confidence`、`city_confidence`、`postal_confidence`、`asn`、`organization_name`、`network`、`hosting_provider`、`tor_exit_node`、`anonymous_vpn`、`anonymous`、`public_proxy`、`residential_proxy`、`domain`、`isp`、`isp_organization_name`、`mobile_country_code`、`mobile_network_code`、`user_type` 和 `connection_type`。实际添加的字段取决于找到的内容以及在 `properties` 中配置的属性。

以下示例使用默认的城市数据库，基于 `ip` 字段将地理位置信息添加到 `geoip` 字段：

```bash
PUT _ingest/pipeline/geoip
{
  "description": "Add ip geolocation info",
  "processors": [
    {
      "geoip": {
        "field": "ip"
      }
    }
  ]
}

PUT my-index-000001/_doc/my_id?pipeline=geoip
{
  "ip": "89.160.20.128"
}

GET my-index-000001/_doc/my_id
```

返回：

```json
{
  "found": true,
  "_index": "my-index-000001",
  "_id": "my_id",
  "_version": 1,
  "_seq_no": 55,
  "_primary_term": 1,
  "_source": {
    "ip": "89.160.20.128",
    "geoip": {
      "continent_name": "Europe",
      "country_name": "Sweden",
      "country_iso_code": "SE",
      "city_name": "Linköping",
      "region_iso_code": "SE-E",
      "region_name": "Östergötland County",
      "location": {
        "lat": 58.4167,
        "lon": 15.6167
      }
    }
  }
}
```

以下示例使用默认的国家数据库，基于 `ip` 字段将地理位置信息添加到 `geo` 字段。注意此数据库是自动下载的：

```bash
PUT _ingest/pipeline/geoip
{
  "description": "Add ip geolocation info",
  "processors": [
    {
      "geoip": {
        "field": "ip",
        "target_field": "geo",
        "database_file": "GeoLite2-Country.mmdb"
      }
    }
  ]
}

PUT my-index-000001/_doc/my_id?pipeline=geoip
{
  "ip": "89.160.20.128"
}

GET my-index-000001/_doc/my_id
```

返回：

```json
{
  "found": true,
  "_index": "my-index-000001",
  "_id": "my_id",
  "_version": 1,
  "_seq_no": 65,
  "_primary_term": 1,
  "_source": {
    "ip": "89.160.20.128",
    "geo": {
      "continent_name": "Europe",
      "country_name": "Sweden",
      "country_iso_code": "SE"
    }
  }
}
```

并非所有 IP 地址都能从数据库中找到地理位置信息。发生这种情况时，文档中不会插入 `target_field`。

以下是找不到 "80.231.5.0" 的信息时文档被索引的结果示例：

```bash
PUT _ingest/pipeline/geoip
{
  "description": "Add ip geolocation info",
  "processors": [
    {
      "geoip": {
        "field": "ip"
      }
    }
  ]
}

PUT my-index-000001/_doc/my_id?pipeline=geoip
{
  "ip": "80.231.5.0"
}

GET my-index-000001/_doc/my_id
```

返回：

```json
{
  "_index": "my-index-000001",
  "_id": "my_id",
  "_version": 1,
  "_seq_no": 71,
  "_primary_term": 1,
  "found": true,
  "_source": {
    "ip": "80.231.5.0"
  }
}
```

## 将 location 识别为 geo_point

尽管此处理器使用包含 IP 地址估算纬度和经度的 `location` 字段丰富你的文档，但如果未在映射中显式定义，该字段不会在 Elasticsearch 中被索引为 [`geo_point`](/mapping/field_data_types/geo_point) 类型。

你可以为上面的示例索引使用以下映射：

```bash
PUT my_ip_locations
{
  "mappings": {
    "properties": {
      "geoip": {
        "properties": {
          "location": {
            "type": "geo_point"
          }
        }
      }
    }
  }
}
```

## 管理你自己的 IP 地理位置数据库更新

如果你无法从 Elastic 端点[自动更新](#geoip-自动更新)你的 IP 地理位置数据库，你还有其他几种选择：

- [使用反向代理端点](#使用反向代理端点)
- [使用自定义端点](#使用自定义端点)
- [手动更新你的 IP 地理位置数据库](#手动更新你的-ip-地理位置数据库)

### 使用反向代理端点

如果你无法直接连接到 Elastic GeoIP 端点，可以考虑设置一个安全的反向代理。然后，你可以在每个节点的 `elasticsearch.yml` 文件的 [`ingest.geoip.downloader.endpoint`](#ingest-geoip-downloader-endpoint) 设置中指定反向代理端点 URL。

Elasticsearch 目前不支持用于 GeoIP 数据库下载的真正 HTTP 代理。

在严格的设置中，可能需要将以下域添加到允许的域列表中：

- `geoip.elastic.co`
- `storage.googleapis.com`

### 使用自定义端点

你可以创建一个模拟 Elastic GeoIP 端点的服务，然后从该服务获取自动更新。

1. 从 [MaxMind 网站](http://dev.maxmind.com/geoip/geoip2/geolite2)下载你的 `.mmdb` 数据库文件。
2. 将你的数据库文件复制到一个目录中。
3. 从你的 Elasticsearch 目录运行：

   ```sh
   ./bin/elasticsearch-geoip -s my/source/dir [-t target/directory]
   ```

4. 从你的目录提供静态数据库文件。例如，你可以使用 Docker 从 nginx 服务器提供文件：

   ```sh
   docker run -v my/source/dir:/usr/share/nginx/html:ro nginx
   ```

5. 在每个节点的 `elasticsearch.yml` 文件的 [`ingest.geoip.downloader.endpoint`](#ingest-geoip-downloader-endpoint) 设置中指定该服务的端点 URL。

   默认情况下，Elasticsearch 每三天检查一次端点是否有更新。要使用其他轮询间隔，使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings) 设置 [`ingest.geoip.downloader.poll.interval`](#ingest-geoip-downloader-poll-interval)。

### 手动更新你的 IP 地理位置数据库

1. 使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings) 将 `ingest.geoip.downloader.enabled` 设置为 `false`。这会禁用可能覆盖你的数据库更改的自动更新。这也会删除所有已下载的数据库。
2. 从 [MaxMind 网站](http://dev.maxmind.com/geoip/geoip2/geolite2)下载你的 `.mmdb` 数据库文件。

   你也可以使用自定义的城市、国家和 ASN `.mmdb` 文件。这些文件必须是未压缩的。类型（城市、国家或 ASN）将从文件元数据中提取，因此文件名无关紧要。

3. 在 Elasticsearch Service 部署上，使用[自定义捆绑包](https://www.elastic.co/guide/en/cloud/current/ec-custom-bundles.html)上传数据库。
4. 在自管部署上，将数据库文件复制到 `$ES_CONFIG/ingest-geoip`。
5. 在你的 `geoip` 处理器中，配置 `database_file` 参数以使用自定义数据库文件。

## 节点设置

`geoip` 处理器支持以下设置：

- `ingest.geoip.cache_size`

  应缓存的结果的最大数量。默认为 `1000`。

注意这些设置是节点设置，适用于所有 `geoip` 和 `ip_location` 处理器，即所有此类处理器共享一个缓存。

## 集群设置

- `ingest.geoip.downloader.enabled`

  （[动态](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/settings.html#dynamic-cluster-setting)，布尔值）如果为 `true`，Elasticsearch 自动从 `ingest.geoip.downloader.endpoint` 下载并管理 IP 地理位置数据库的更新。如果为 `false`，Elasticsearch 不下载更新并删除所有已下载的数据库。默认为 `true`。

- `ingest.geoip.downloader.eager.download`

  （[动态](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/settings.html#dynamic-cluster-setting)，布尔值）如果为 `true`，无论是否存在带 geoip 处理器的管道，Elasticsearch 都会立即下载 IP 地理位置数据库。如果为 `false`，只有当存在或添加了带 geoip 处理器的管道时，Elasticsearch 才开始下载数据库。默认为 `false`。

- `ingest.geoip.downloader.endpoint`

  （[静态](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/settings.html#static-cluster-setting)，字符串）用于下载 IP 地理位置数据库更新的端点 URL。例如 `https://myDomain.com/overview.json`。默认为 `https://geoip.elastic.co/v1/database`。Elasticsearch 将下载的数据库文件存储在每个节点的[临时目录](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/important-settings.html#es-tmpdir)中的 `$ES_TMPDIR/geoip-databases/<node_id>`。注意 Elasticsearch 将向 `${ingest.geoip.downloader.endpoint}?elastic_geoip_service_tos=agree` 发出 GET 请求，期望获得通常位于 `overview.json` 中的数据库元数据列表。

    下载器使用 JDK 内置的 cacerts。如果你使用自定义端点，请将自定义 https 端点的 cacert 添加到 JDK 的信任库中。

- `ingest.geoip.downloader.poll.interval`

  （[动态](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/settings.html#dynamic-cluster-setting)，[时间值](/rest_apis/api_convention/common_options#时间单位)）Elasticsearch 检查 `ingest.geoip.downloader.endpoint` 处 IP 地理位置数据库更新的频率。必须大于 `1d`（一天）。默认为 `3d`（三天）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/geoip-processor.html)
