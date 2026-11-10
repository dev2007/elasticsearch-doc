# eager_global_ordinals

## 什么是全局序号？

为了支持聚合和其他需要按文档查找字段值的操作，Elasticsearch 使用一种称为 [doc values](/mapping/mapping_parameters/doc_values) 的数据结构。诸如 `keyword` 之类的基于词条的字段类型使用序号映射（ordinal mapping）存储其 doc values，以获得更紧凑的表示。此映射的工作方式是根据词元的字典顺序为每个词元分配一个递增的整数，即序号（ordinal）。字段的 doc values 只存储每个文档的序号而不是原始词元，并使用单独的查找结构在序号和词元之间进行转换。

在聚合中使用时，序号可以极大地提高性能。例如，`terms` 聚合在分片级别仅依靠序号将文档收集到桶中，然后在跨分片合并结果时将序号转换回其原始词元值。

每个索引段都定义自己的序号映射，但聚合收集整个分片的数据。因此，为了能够在聚合等分片级操作中使用序号，Elasticsearch 创建了一个称为全局序号（global ordinals）的统一映射。全局序号映射构建在段序号之上，它的工作方式是维护一个从全局序号到每个段的本地序号的映射。

如果搜索包含以下任何组件，就会使用全局序号：

- 对 `keyword`、`ip` 和 `flattened` 字段的某些桶聚合。这包括前述的 `terms` 聚合，以及 `composite`、`diversified_sampler` 和 `significant_terms`。
- 对需要启用 [`fielddata`](/mapping/field_data_types/text#fielddata-映射参数) 的 `text` 字段的桶聚合。
- 对来自 `join` 字段的父文档和子文档的操作，包括 `has_child` 查询和 `parent` 聚合。

全局序号映射使用堆内存作为[字段数据缓存](/index_modules/index_modules#字段数据缓存)的一部分。对高基数字段的聚合可能使用大量内存，并触发[字段数据熔断器](/set_up_elasticsearch/configuring_elasticsearch/circuit_breaker_settings#字段数据熔断器)。

## 加载全局序号

在搜索期间可以使用序号之前，必须先构建全局序号映射。默认情况下，该映射在第一次需要全局序号时在搜索期间加载。如果你以索引速度为优化目标，这是正确的方法；但如果搜索性能是优先事项，建议对将用于聚合的字段立即（eagerly）加载全局序号：

```bash
PUT my-index-000001/_mapping
{
  "properties": {
    "tags": {
      "type": "keyword",
      "eager_global_ordinals": true
    }
  }
}
```

启用 `eager_global_ordinals` 后，全局序号会在分片被[刷新](/rest_apis/index_apis/refresh)时构建——Elasticsearch 始终在向外界暴露索引内容的更改之前加载它们。这将构建全局序号的成本从搜索阶段转移到了索引阶段。在创建分片的新副本时（例如增加副本数量或将分片迁移到新节点时），Elasticsearch 也会立即构建全局序号。

可以通过更新 `eager_global_ordinals` 设置随时禁用立即加载：

```bash
PUT my-index-000001/_mapping
{
  "properties": {
    "tags": {
      "type": "keyword",
      "eager_global_ordinals": false
    }
  }
}
```

## 避免全局序号加载

通常，全局序号在加载时间和内存使用方面不会带来很大的开销。但是，在具有大分片的索引上，或者当字段包含大量唯一词元值时，加载全局序号可能很昂贵。由于全局序号为分片上的所有段提供统一映射，因此当新段可见时，它们也需要完全重建。

在某些情况下，可以完全避免全局序号加载：

- `terms`、`sampler` 和 `significant_terms` 聚合支持参数 [`execution_hint`](/aggregations/bucket/terms_aggregation#执行提示)，它有助于控制如何收集桶。它默认为 `global_ordinals`，但可以设置为 `map` 来改为直接使用词元值。
- 如果一个分片被[强制合并](/rest_apis/index_apis/force_merge)为单个段，那么它的段序号对分片而言已经是全局的。在这种情况下，Elasticsearch 不需要构建全局序号映射，使用全局序号也没有额外的开销。注意，出于性能考虑，你应该只强制合并一个永远不会再写入的索引。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/eager-global-ordinals.html)
