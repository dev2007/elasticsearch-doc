# 跨集群复制 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-ccr)。

::::

你可以使用以下 API 执行跨集群复制操作。

## 顶级

- [获取跨集群复制统计信息](./get_ccr_stats)

## 关注

- [创建关注者索引](./create_follower)
- [暂停关注者](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-pause-follow.html)
- [恢复关注者](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-resume-follow.html)
- [将关注者索引转换为常规索引](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-unfollow.html)
- [从领导者中移除关注者保留租约](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-forget-follower.html)
- [获取关注者索引的统计信息](./get_follower_stats)
- [获取关注者索引的信息](./get_follower_info)

## 自动关注

- [创建自动关注模式](./create_auto_follow_pattern)
- [删除自动关注模式](./delete_auto_follow_pattern)
- [获取自动关注模式](./get_auto_follow_pattern)
- [暂停自动关注模式](./pause_auto_follow_pattern)
- [恢复自动关注模式](./resume_auto_follow_pattern)


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-apis.html)
