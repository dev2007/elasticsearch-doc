# 授权设置

你可以在 `elasticsearch.yml` 文件中配置此许可设置。有关详细信息，参阅[授权管理](https://www.elastic.co/guide/en/kibana/8.5/managing-licenses.html)。

- `xpack.license.self_generated.type`

    ([静态](/set_up_elasticsearch/configuring_elasticsearch)设置为 `basic`（默认）以启用基本 X-Pack特性。

    如果设置为 `trial`，自动生成的授权仅允许在 30 天内访问 x-pack 的所有功能。如果需要，你可以稍后将集群降级为基本授权。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/license-settings.html)
