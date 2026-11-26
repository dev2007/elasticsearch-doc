# 长时间运行搜索（Long-running searches）

Elasticsearch 通常可以快速地在大量数据上进行搜索。但在某些情况下，搜索可能需要在许多分片上执行，可能面对大规模数据集或多个远程集群，此时无法期望结果在毫秒级内返回。

当你需要执行长时间运行的搜索时，同步等待结果返回并不是理想的选择。相反，异步搜索（Async search）允许你：

1. 提交一个以异步方式执行的搜索请求；
2. 监控该请求的执行进度；
3. 在稍后阶段检索结果；
4. 在搜索尚未完成时，即可获取已可用的部分结果。

## 相关 API

- [提交异步搜索 API](/rest_apis/search_apis/async_search)：提交异步搜索请求。
- [获取异步搜索 API](/rest_apis/search_apis/async_search)：监控异步搜索请求的进度并检索其结果。
- [删除异步搜索 API](/rest_apis/search_apis/async_search)：删除正在进行的异步搜索。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/async-search-intro.html)
