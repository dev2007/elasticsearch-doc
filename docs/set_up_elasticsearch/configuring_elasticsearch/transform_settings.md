# 转换设置

你无需配置任何设置即可使用转换。它默认启用。

## 通用转换设置

**`node.roles: [ transform ]`**（静态）

设置 `node.roles` 包含 `transform`，以将该节点标识为转换节点。如果你想运行转换，集群中必须至少有一个转换节点。

如果你设置了 `node.roles`，则必须显式指定该节点所需的所有角色。了解更多信息参阅节点设置。

强烈建议专用转换节点也具有 `remote_cluster_client` 角色；否则，在转换中使用跨集群搜索时会失败。参阅符合远程条件的节点。

**`xpack.transform.enabled`**（静态）— 在 7.8.0 中已弃用

此已弃用的设置不再有任何作用。基本许可证特性应始终启用。

**`xpack.transform.num_transform_failure_retries`**（动态）

转换遇到非致命错误时的重试次数。重试次数用尽后，转换任务将被标记为失败。默认值为 10，有效最小值为 0，最大值为 100。如果转换已在运行，必须重启转换才能使用更改后的设置。`num_failure_retries` 设置也可以在单个转换级别上指定。建议为每个转换单独指定此设置。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/transform-settings.html)
