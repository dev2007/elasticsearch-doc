# 基于 URL 的访问控制

许多用户使用基于 URL 的访问控制的代理来保护对 Elasticsearch 数据流和索引的访问。对[多搜索](/rest_apis/search_apis/multi_search)、[多获取](/rest_apis/document_apis/multi_get)和[批量](/rest_apis/document_apis/bulk)请求，用户可以选择在 URL 和带请求体的每个独立请求中指定数据流或索引。这会使基于 URL 的访问控制具有挑战性。

为了阻止用户重写在 URL 中指定的数据流或索引，在 `elasticsearch.yml` 中设置 `rest.action.multi.allow_explicit_index` 为 `false`。

这可以引起 Elasticsearch 拒绝在请求体中显示指定数据流或索引的请求。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/url-access-control.html)
