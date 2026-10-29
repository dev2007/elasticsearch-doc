# DNS 缓存设置

Elasticsearch 在安全管理器就位的情况下运行。在安全管理器就位的情况下，JVM 默认无限期缓存正向主机名解析，默认将负向主机名解析缓存十秒。Elasticsearch 覆盖了此行为，默认将正向查找缓存六十秒，将负向查找缓存十秒。这些值应该适用于大多数环境，包括 DNS 解析随时间变化的环境。如果不适用，你可以在 JVM 选项中编辑 `es.networkaddress.cache.ttl` 和 `es.networkaddress.cache.negative.ttl` 的值。请注意，Java 安全策略中的 `networkaddress.cache.ttl=<timeout>` 和 `networkaddress.cache.negative.ttl=<timeout>` 值会被 Elasticsearch 忽略，除非你移除 `es.networkaddress.cache.ttl` 和 `es.networkaddress.cache.negative.ttl` 的设置。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/networkaddress-cache-ttl.html)
