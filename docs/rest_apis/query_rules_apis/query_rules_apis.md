# 查询规则 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [查询规则 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-query-rules)。

:::::

查询规则允许你配置按查询应用的规则，这些规则在查询时应用于匹配特定规则的查询。查询规则组织为规则集，即匹配传入查询的查询规则集合。查询规则使用规则查询应用。

如果查询匹配规则集中的一个或多个规则，查询在搜索前会被重写以应用规则。这使得可以仅为匹配特定词项的查询固定文档。

使用以下 API 来管理查询规则集：

- [创建或更新查询规则集 API](./put_query_ruleset)
- [获取查询规则集 API](./get_query_ruleset)
- [列出查询规则集 API](./list_query_rulesets)
- [删除查询规则集 API](./delete_query_ruleset)
- [创建或更新查询规则 API](./put_query_rule)
- [获取查询规则 API](./get_query_rule)
- [删除查询规则 API](./delete_query_rule)
- [测试查询规则集 API](./test_query_ruleset)（技术预览）

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-rules-apis.html)
