# index_phrases

如果启用，两个词的组合（shingles）会被索引到一个单独的字段中。这使精确短语查询（无 slop）运行得更高效，但代价是更大的索引。注意，当不移除停用词时效果最好，因为包含停用词的短语不会使用辅助字段，而会回退到标准短语查询。接受 `true` 或 `false`（默认）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-phrases.html)
