# 设置升级模式 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml)。

:::::

设置集群范围的 `upgrade_mode` 设置，为机器学习索引准备升级。

## 请求

```bash
POST _ml/set_upgrade_mode
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

升级集群时，在某些情况下你必须重启节点并重新索引机器学习索引。在这些情况下，不能有正在运行的机器学习作业。你可以关闭机器学习作业、执行升级，然后再次打开所有作业。或者，你可以使用此 API 临时暂停与作业和数据源相关的任务，并阻止新作业打开。你还可以在不要求重新索引机器学习索引的升级期间使用此 API，但在这种情况下不需要停止作业。

有关更多信息，请参阅[升级 Elastic Stack](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/start-setup.html#upgrading-the-elastic-stack)。

当 `enabled=true` 时，此 API 临时暂停所有作业和数据源任务，并禁止新的作业和数据源任务启动。

随后，你可以调用此 API 并将 `enabled` 参数设置为 `false`，使机器学习作业和数据源恢复到其期望状态。

你可以使用[获取机器学习信息 API](./get_info) 查看 `upgrade_mode` 设置的当前值。

当 `upgrade_mode` 设置为 `true` 时，无法打开新的机器学习作业。

## 查询参数

- `enabled`

  （可选，布尔值）如果为 `true`，启用升级模式。默认为 `false`。

- `timeout`

  （可选，时间值）等待请求完成的时间。默认为 30 秒。

## 示例

以下示例为集群启用升级模式：

```bash
POST _ml/set_upgrade_mode?enabled=true&timeout=10m
```

调用成功后，返回已确认响应。例如：

```json
{
  "acknowledged": true
}
```

已确认响应只有在所有机器学习作业和数据源都完成向机器学习内部索引写入后才返回。这意味着重新索引这些内部索引是安全的，不会导致失败。在重新索引之前，你必须等待已确认响应以确保所有写入已完成。

升级完成后，你必须将 `upgrade_mode` 设置为 `false` 才能让机器学习作业重新开始运行。例如：

```bash
POST _ml/set_upgrade_mode?enabled=false&timeout=10m
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-set-upgrade-mode.html)
