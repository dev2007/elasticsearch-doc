---
sidebar_position: 100
---

# Elasticsearch 索引生命周期管理设置

这些是可用于配置[索引生命周期管理](/data_management/ILM_manage_the_index_lifecycle.html)（ILM）的设置。

## 集群级设置

- `xpack.ilm.enabled`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch)，布尔值)[~7.0.0~]

  此不推荐使用的设置已无效，将在 Elasticsearch 8.0 中删除。

- `indices.lifecycle.history_index_enabled`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)，布尔值)是否启用 ILM 的历史索引。如果启用，ILM 将把作为 ILM 策略一部分采取的操作的历史记录记录到 `ilm-history-*` 索引中。默认为 `true`。

- `indices.lifecycle.poll_interval`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)，[时间单位值](/rest_apis/api_conventions.html#时间单位))索引生命周期管理检查符合策略条件的索引的频率。默认为 `10m`。

- `indices.lifecycle.rollover.only_if_has_documents`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)，布尔值)ILM 是否只滚动非空索引。如果启用，ILM 将只滚动索引，只要索引至少包含一个文档。默认为 `true`。

## 索引级设置

这些索引级 ILM 设置通常通过索引模板进行配置。有关详细信息，参阅[创建生命周期策略](/data_management/tutorial_automate_rollover.html#创建生命周期策略)。

- `index.lifecycle.indexing_complete`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)，布尔值)指示索引是否已翻转。ILM 完成翻转操作时自动设置为 `true`。可以将其显式设置为[跳过翻转](/data_management/skip_rollover.html)。默认为 `false`。

- `index.lifecycle.name`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)，字符串)用于管理索引的策略的名称。有关 Elasticsearch 如何应用策略更改的信息，参阅[策略更新](/data_management/concepts/policy_updates.html)。如果要从以前由索引生命周期管理管理的快照恢复索引，则可以在恢复操作期间将此设置覆盖为空，以禁用对索引的进一步管理。参阅 `index.lifecycle.rollover_alias`。

- `index.lifecycle.origination_date`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)，长整型)如果指定，这是用于计算其相变的索引年龄的时间戳。如果创建包含旧数据的新索引并希望使用原始创建日期计算索引年限，请使用此设置。以毫秒为单位指定为 Unix epoch 值。

- `index.lifecycle.parse_origination_date`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)，布尔值)设置为 `true` 可从索引名称解析起始日期。该起始日期用于计算其相变的索引年龄。索引名称必须匹配模式 `^.*-{date_format}-\\d+`，其中 `date_format` 为 `yyyy.MM.dd`，尾随数字是可选的。滚动的索引通常与完整格式匹配，例如 `logs-2016.10.31-000002`。如果索引名称与模式不匹配，则索引创建失败。

- `index.lifecycle.step.wait_time_threshold`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)，[时间单位值](/rest_apis/api_conventions.html#时间单位))等待群集在 ILM [收缩](/data_management/index_lifecycle_actions/shrink.html)操作期间解决分配问题的时间。必须大于 `1h`（1小时）。默认为 `12h`（12小时）。参阅[用于收缩的分片分配](/data_management/index_lifecycle_actions/shrink.html#用于收缩的分片分配)。

- `index.lifecycle.rollover_alias`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)，字符串)索引滚动时要更新的索引别名。指定何时使用包含滚动操作的策略。当索引翻转时，别名将更新以反映索引不再是写索引。有关翻转索引的详细信息，参阅[翻转](/data_management/concepts/rollover.html)。如果要从以前由索引生命周期管理管理的快照恢复索引，则可以在恢复操作期间将此设置覆盖为空，以禁用对未来索引的进一步管理。参阅 `index.lifecycle.name`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/ilm-settings.html)
