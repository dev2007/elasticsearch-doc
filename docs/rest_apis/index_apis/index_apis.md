# 索引 API

索引 API 用于管理单个索引、索引设置、别名、映射及索引模板。

## 索引管理

- [创建索引](/rest_apis/index_apis/create_index)
- [删除索引](/rest_apis/index_apis/delete_index)
- [获取索引](/rest_apis/index_apis/get_index)
- [索引存在](/rest_apis/index_apis/index_exists)
- [关闭索引](/rest_apis/index_apis/close_index)
- [开启索引](/rest_apis/index_apis/open_index)
- [收缩索引](/rest_apis/index_apis/shrink_index)
- [拆分索引](/rest_apis/index_apis/split_index)
- [复制索引](/rest_apis/index_apis/clone_index)
- [翻转](/rest_apis/index_apis/rollover_index)
- [冻结索引](/rest_apis/index_apis/freeze_index)
- [解冻索引](/rest_apis/index_apis/unfreeze_index)
- [解析索引](/rest_apis/index_apis/resolve_index)

## 映射管理

- [更新映射](/rest_apis/index_apis/update_mapping)
- [获取映射](/rest_apis/index_apis/get_mapping)
- [获取字段映射](/rest_apis/index_apis/get_field_mapping)
- [类型存在](/rest_apis/index_apis/type_exists)

## 别名管理

- [别名](/rest_apis/index_apis/aliases)
- [创建或更新索引别名](/rest_apis/index_apis/create_or_update_index_alias)
- [获取索引别名](/rest_apis/index_apis/get_index_alias)
- [索引别名存在](/rest_apis/index_apis/index_alias_exists)
- [删除索引别名](/rest_apis/index_apis/delete_index_alias)

## 索引设置

- [更新索引设置](/rest_apis/index_apis/update_index_settings)
- [获取索引设置](/rest_apis/index_apis/get_index_settings)
- [分析](/rest_apis/index_apis/analyze)

## 索引模板

索引模板自动为新索引应用设置、映射以及别名。他们通常用于为时序数据配翻转索引，以确保每个新索引与前一个索引有相同的配置。关联到数据流的索引模板配置了它的和备份指示符。获取更多信息，参阅[索引模板](/index_templates/index_templates)。

- [创建或更新索引模板](/rest_apis/index_apis/create_or_update_index_template)
- [获取索引模板](/rest_apis/index_apis/get_index_template)
- [删除索引模板](/rest_apis/index_apis/delete_index_template)
- [创建或更新组件模板](/rest_apis/index_apis/create_or_update_component_template)
- [获取组件模板](/rest_apis/index_apis/get_component_template)
- [删除组件模板](/rest_apis/index_apis/delete_component_template)
- [模拟索引](/rest_apis/index_apis/simulate_index)
- [模拟模板](/rest_apis/index_apis/simulate_template)

## 监测

- [索引统计](/rest_apis/index_apis/index_stats)
- [索引段](/rest_apis/index_apis/index_segments)
- [索引恢复](/rest_apis/index_apis/index_recovery)
- [索引分片存储](/rest_apis/index_apis/index_shard_stores)

## 状态管理

- [清除缓存](/rest_apis/index_apis/clear_cache)
- [刷新](/rest_apis/index_apis/refresh)
- [冲刷](/rest_apis/index_apis/flush)
- [同步冲刷](/rest_apis/index_apis/synced_flush)
- [强制合并](/rest_apis/index_apis/force_merge)

## 悬挂索引

- [列出悬挂索引](/rest_apis/index_apis/list_dangling_indices)
- [导入悬挂索引](/rest_apis/index_apis/import_dangling_index)
- [删除悬挂索引](/rest_apis/index_apis/delete_dangling_index)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices.html)
