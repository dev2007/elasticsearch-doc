---
sidebar_position: 80
---

# 字段数据缓存设置

字段数据缓存包含[字段数据](/mapping/field_data_type/text.html#fielddata-映射参数)和[全局序号](/mapping/mapping_parameters/eager_global_ordinals.html)，它们都用于支持某些字段类型的聚合。由于这些是堆上的数据结构，因此监控缓存的使用情况非常重要。

## 缓存大小

缓存中的条目构建成本很高，因此默认行为是将缓存加载到内存中。默认缓存大小是无限的，这会导致缓存增长，直到[字段数据断路器](/set_up_elasticsearch/configuring_elasticsearch/circuit_breaker_settings.html#字段数据断路器)设置的限制。此行为可配置。

如果设置了缓存大小限制，缓存将开始清除缓存中最近更新最少的条目。此设置可以自动避免断路器限制，代价是按需重建缓存。

如果达到断路器限制，将阻止会增加缓存大小的更多请求。在这种情况下，你应该手动[清除缓存](/rest_apis/index_apis/clear_cache.html)。

- `indices.fielddata.cache.size`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))字段数据缓存的最大大小，例如节点堆空间的 `38%`，或绝对值，例如 `12GB`。默认为无界。如果你选择设置它，它应该小于[字段数据断路器](/set_up_elasticsearch/configuring_elasticsearch/circuit_breaker_settings.html#字段数据断路器)限制。

## 监控字段数据

你可以使用[节点统计 API](/rest_apis/cluster_apis/nodes_stats.html) 或 [cat 字段数据 API](/rest_apis/compact_and_aligned_text_apis/cat_fielddata.html) 监视字段数据的内存使用情况以及字段数据断路器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-fielddata.html)
