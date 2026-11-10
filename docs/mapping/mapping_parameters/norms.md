# norms

norms 存储各种归一化因子，这些因子会在查询时使用，用于计算文档相对于查询的评分。

虽然对评分很有用，但 norms 也需要相当多的磁盘空间（通常是索引中每个文档每个字段大约一个字节，即使文档没有这个特定字段也是如此）。因此，如果你不需要对特定字段评分，应该禁用该字段的 norms。特别是，对于仅用于过滤或聚合的字段，情况就是如此。

可以使用更新映射 API 在现有字段上禁用 norms。

norms 可以被禁用（但事后无法重新启用），使用更新映射 API 的方式如下：

```bash
PUT my-index-000001/_mapping
{
  "properties": {
    "title": {
      "type": "text",
      "norms": false
    }
  }
}
```

norms 不会被立即删除，而是随着你继续索引新文档、旧段合并到新段时被删除。对已删除 norms 的字段进行的任何分数计算都可能返回不一致的结果，因为某些文档不再拥有 norms，而其他文档可能仍有 norms。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/norms.html)
