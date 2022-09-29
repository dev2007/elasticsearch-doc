# 安全设置

有些设置是敏感的，依靠文件系统权限来保护它们的值是不够的。对于这个用例，Elasticsearch 提供一个密钥存储库和 [elasticsearch-keystore](/command_line_tools/elasticsearch_keystore) 工具来管理密钥存储库中的设置。

::: danger 重要
只有一些设置被设计为从密钥库中读取。但是，密钥库没有验证来阻止不支持的设置。向密钥库中添加不支持的设置将导致 Elasticsearch 启动失败。要查看密钥存储库中是否支持某个设置，请在设置引用中查找 “Secure” 限定符。
:::

所有对密钥库的修改只有在重新启动 Elasticsearch 后才会生效。

这些设置，就像配置文件 `elasticsearch.yml` 中的常规设置一样，需要在集群中的每个节点上指定。目前，所有安全设置都是特定于节点的设置，必须在每个节点上具有相同的值。

## 可重新加载的安全设置

就像 `elasticsearch.yml` 中的设置值一样中，对密钥存储库内容的更改不会自动应用到正在运行的 Elasticsearch 节点。重新读取设置需要重新启动节点。但是，某些安全设置被标记为 **reloadable（可重新加载）**。这些设置可以重新读取并应用到运行中的节点上。

所有安全设置的值(无论是否**reloadable（可重新加载）**)，必须在所有集群节点上相同。在完成所需的安全设置更改后，使用bin/elasticsearch-keystore add命令，调用:

```bash
POST _nodes/reload_secure_settings
{
  "secure_settings_password": "keystore-password" 
}
```

1. `"secure_settings_password": "keystore-password"`：Elasticsearch 密钥存储库使用的加密密码。

该 API 在每个集群节点上解密并重新读取整个密钥存储库，但只应用 **reloadable（可重新加载）**的安全设置。对其他设置的更改直到下一次重启才生效。一旦调用返回，重新加载就完成了，这意味着依赖于这些设置的所有内部数据结构都已被更改。一切都应该看起来好像设置从一开始就有了新的值。

在更改多个 **reloadable（可重新加载）**的安全设置时，在每个集群节点上修改所有这些设置，然后发出 [reload_secure_settings](/rest_apis/cluster_apis/nodes_reload_secure_settings) 调用，而不是在每次修改后重新加载。

有可重新加载的安全设置:

- [Azure 存储库插件](/snapshot_and_restore/azure_repository)

- [EC2 发现插件](https://www.elastic.co/guide/en/elasticsearch/plugins/8.4/discovery-ec2-usage.html#_configuring_ec2_discovery)

- [GCS 存储库插件](/snapshot_and_restore/google_cloud_storage_repository)

- [S3 存储库插件](/snapshot_and_restore/s3_repository)

- [监控设置](/set_up_elasticsearch/configuring_elasticsearch/secure_settings)

- [观察器设置](/set_up_elasticsearch/configuring_elasticsearch/watcher_settings)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/secure-settings.html)
