# 集群故障检测

已选举的主节点定期检查集群中的每个节点，以确保它们仍然连接且健康。集群中的每个节点也定期检查已选举主节点的健康状况。这些检查分别被称为_跟随者检查_（follower checks）和_领导者检查_（leader checks）。

Elasticsearch 允许这些检查偶尔失败或超时而不采取任何行动。只有在连续多次检查失败后，它才认为某个节点出现故障。你可以使用 `cluster.fault_detection.*` 设置控制故障检测行为。

然而，如果已选举的主节点检测到某个节点已断开连接，这种情况被视为立即失败。主节点会绕过超时和重试设置值并尝试将该节点从集群中移除。同样，如果某个节点检测到已选举的主节点已断开连接，这种情况也被视为立即失败。该节点会绕过超时和重试设置并重新启动其发现阶段，以尝试查找或选举新的主节点。

此外，每个节点通过向磁盘写入一个小文件然后再次删除它来定期验证其数据路径是否健康。如果节点发现其数据路径不健康，则它将从集群中移除，直到数据路径恢复。你可以使用 `monitor.fs.health` 设置控制此行为。

如果节点无法在合理时间内应用更新后的集群状态，已选举的主节点也会将其从集群中移除。超时默认为 2 分钟，从集群状态更新开始时算起。更详细的描述参阅发布集群状态。

## 排查不稳定的集群

参阅_排查不稳定的集群_。

- 诊断 `disconnected` 节点：参阅诊断 disconnected 节点。
- 诊断 `lagging` 节点：参阅诊断 lagging 节点。
- 诊断 `follower check retry count exceeded` 节点：参阅诊断 follower check retry count exceeded 节点。
- 诊断 `ShardLockObtainFailedException` 失败：参阅诊断 ShardLockObtainFailedException 失败。
- 诊断其他网络断连：参阅诊断其他网络断连。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-fault-detection.html)
