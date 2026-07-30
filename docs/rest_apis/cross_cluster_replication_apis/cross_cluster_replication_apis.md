# 跨集群复制 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-ccr)。

::::

你可以使用以下 API 执行跨集群复制操作。

## 顶级

- [获取跨集群复制统计信息](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-get-stats.html)

## 关注

- [创建关注者索引](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-put-follow.html)
- [暂停关注者](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-pause-follow.html)
- [恢复关注者](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-resume-follow.html)
- [将关注者索引转换为常规索引](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-unfollow.html)
- [从领导者中移除关注者保留租约](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-forget-follower.html)
- [获取关注者索引的统计信息](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-get-follow-stats.html)
- [获取关注者索引的信息](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-get-follow-info.html)

## 自动关注

- [创建自动关注模式](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-put-auto-follow-pattern.html)
- [删除自动关注模式](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-delete-auto-follow-pattern.html)
- [获取自动关注模式](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-get-auto-follow-pattern.html)
- [暂停自动关注模式](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-pause-auto-follow-pattern.html)
- [恢复自动关注模式](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-resume-auto-follow-pattern.html)


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-apis.html)
