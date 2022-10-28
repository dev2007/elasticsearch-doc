# 跨集群复制设置

可以使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings) 在活动集群上动态更新这些跨集群复制设置。

## 远程恢复设置

以下设置可用于对[远程恢复](/set_up_a_cluster_for_high_availability/cross_cluster_replication#通过远程恢复初始化追随者)期间传输的数据进行速率限制：

- `ccr.indices.recovery.max_bytes_per_sec` （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）

  限制每个节点上的总入站和出站远程恢复流量。由于此限制适用于每个节点，但可能有多个节点同时执行远程恢复，因此远程恢复字节的总量可能远高于此限制。如果将此限制设置得太高，则存在进行中的远程恢复将消耗过量带宽（或其他资源）的风险，这可能会破坏集群的稳定。该设置同时用于领导者和追随者集群。例如，如果将一个领导者其设置为 `20mb`，那么即使追随者正在请求，领导也只会向随从发送 `20mb/s`，且可以能 `60mb/s`。默认为 `40mb`。

## 高级远程恢复设置

可以设置以下专家设置来管理远程恢复所消耗的资源：

- `ccr.indices.recovery.max_concurrent_file_chunks` （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）

  控制每次恢复可并行发送的文件块请求数。由于多个远程恢复可能已经并行运行，因此增加此专家级设置可能只会在单个分片的远程恢复未达到 `ccr.indices.recovery.max_bytes_per_sec` 配置的总入站和出站远程恢复流量的情况下有所帮助。默认为 `5`。允许的最大值为 `10`。

- `ccr.indices.recovery.chunk_size` （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）

  控制文件传输期间追随者请求的块大小。默认为 `1mb`。

- `ccr.indices.recovery.recovery_activity_timeout` （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）

  控制恢复活动的超时。此超时主要适用于领导者集群。领导者集群必须在内存中打开资源，以便在恢复过程中向追随者提供数据。如果领导者在这段时间内没有收到跟随者的恢复请求，它将关闭资源。默认为 60 秒。

- `ccr.indices.recovery.internal_action_timeout` （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）

  控制远程恢复过程中单个网络请求的超时。单个操作超时可能会导致恢复失败。默认为 60 秒。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/ccr-settings.html)
