# 发现配置检查

默认情况下，Elasticsearch 首次启动时会尝试发现在同一主机上运行的其他节点。如果在几秒钟内未发现任何已选举的主节点，Elasticsearch 将组成一个包含发现的任何其他节点的集群。在开发模式下无需任何额外配置即可形成此集群会很有用，但这不适合生产环境，因为可能会形成多个集群并因此丢失数据。

此引导检查确保发现不是以默认配置运行的。它可以通过设置以下至少一个属性来满足：

- `discovery.seed_hosts`
- `discovery.seed_providers`
- `cluster.initial_master_nodes`

请注意，集群首次启动后，你必须从每个节点的配置中移除 `cluster.initial_master_nodes`。改为配置 `discovery.seed_hosts` 或 `discovery.seed_providers`。如果你不需要任何发现配置（例如运行单节点集群），设置 `discovery.seed_hosts: []` 以禁用发现并满足此引导检查。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-discovery-configuration.html)
