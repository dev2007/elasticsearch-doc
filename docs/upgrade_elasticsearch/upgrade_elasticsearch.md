# 升级 Elasticsearch

Elasticsearch 集群通常可以一次升级一个节点，因此升级不会中断服务。有关升级说明，参阅[升级到 Elastic 8.18.8](https://www.elastic.co/guide/en/elastic-stack/8.18/upgrading-elastic-stack.html)。

## 从 7.x 升级

要从 7.16 或更早版本升级到 8.18.8，你必须先升级到 7.17，即使你选择执行全集群重启而不是滚动升级。这使你能够使用升级助手（Upgrade Assistant）识别并解决问题，重建（reindex）在 7.0 之前创建的索引，然后执行滚动升级。在继续升级之前，你必须解决所有关键问题。有关说明，参阅[准备从 7.x 升级](https://www.elastic.co/guide/en/elastic-stack/8.18/upgrading-elastic-stack.html#prepare-to-upgrade)。

## 乱序发布

Elastic 会同时维护 Elasticsearch 的多个次要版本。这意味着发布并不总是按版本号的顺序进行。只有当你当前运行的版本同时满足以下两个条件时，你才能升级到 8.18.8：

- 版本号早于 8.18.8。
- 发布日期早于 8.18.8。

如果你当前运行的版本号更旧，但发布日期晚于 8.18.8，请等待更新的版本发布后再升级。

## 索引兼容性

Elasticsearch 对在前一个主要版本中创建的索引提供完整的查询和写入支持。如果你有在 6.x 或更早版本中创建的索引，你可以使用归档（archive）功能将它们导入较新的 Elasticsearch 版本，或者你必须在升级到 8.18.8 之前重建或删除它们。如果存在不兼容的索引，Elasticsearch 节点将无法启动。6.x 或更早索引的快照即使是由 7.x 集群创建的，也只能使用归档功能恢复到 8.x 集群。7.17 中的升级助手会识别所有需要重建或移除的索引。

## REST API 兼容性

REST API 兼容性是一项按请求选择性启用的功能，可以帮助 REST 客户端应对 REST API 的不兼容（破坏性）变更。

## FIPS 合规性与 Java 17

Elasticsearch 8.0+ 要求 Java 17 或更高版本。Elasticsearch 8.13+ 已使用 Bouncy Castle 的 Java 17 认证 FIPS 实现完成测试，是在 FIPS 140-2 模式下运行 Elasticsearch 时推荐的 Java 安全提供程序。注意 — Elasticsearch 不随附经 FIPS 认证的安全提供程序，需要显式安装和配置。

或者，考虑使用 FedRAMP 认证的 GovCloud 区域中的 Elasticsearch 服务。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/setup-upgrade.html)
