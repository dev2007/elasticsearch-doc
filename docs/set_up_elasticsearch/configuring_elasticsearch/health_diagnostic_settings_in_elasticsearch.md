---
sidebar_position: 90
---

# Elasticsearch 中的健康诊断设置

以下是可用于配置内部诊断服务的*专家级*设置。此服务的输出通过当前运行[健康 API](/rest_apis/cluster_apis/health.html) 展示。不建议更改其中任何一个的默认值。

## 集群级设置

- `health.master_history.has_master_lookup_timeframe`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))节点在继续进行其他检查之前，回顾是否观察到主节点的时间。默认为 `30s`（30秒）。

- `master_history.max_age`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))我们记录用于诊断集群健康状况的主历史记录的时间范围。诊断集群运行状况时，不会考虑早于此时间的主节点更改。默认为 `30m`（30分钟）。

- `health.master_history.identity_changes_threshold`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))节点见证的，表示集群不健康的主标识变更数。默认为 `4`。

- `health.master_history.no_master_transitions_threshold`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))节点见证的，表示集群不健康的转换为无主节点的次数。默认为 `4`。

- `health.node.enabled`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch))启用健康节点，这允许健康 API 提供有关集群范围健康方面（如磁盘空间）的指示。

- `health.reporting.local.monitor.interval`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch))确定集群的每个节点，监视其本地健康情况（如磁盘使用情况）的间隔时间。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/health-diagnostic-settings.html)
