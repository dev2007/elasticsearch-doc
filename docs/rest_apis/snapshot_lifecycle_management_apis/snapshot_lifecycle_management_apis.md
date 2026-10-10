# 快照生命周期管理 API

你可以使用以下 API 来设置自动拍摄快照并控制其保留时长的策略。有关快照生命周期管理（SLM）的更多信息，参见[使用 SLM 自动化快照](/operational_management/snapshot_and_restore)。

:::::::info 新版 API 参考

有关最新的 API 详情，请参阅[快照生命周期管理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-slm)。

:::::::

## 策略管理 API

- [创建或更新快照生命周期策略 API](./put_slm_policy)
- [获取快照生命周期策略 API](./get_slm_policy)
- [删除快照生命周期策略 API](./delete_slm_policy)

## 快照管理 API

- [执行快照生命周期策略 API](./execute_slm_policy)（拍摄快照）
- [执行快照保留策略 API](./execute_snapshot_retention_policy)（删除已过期的快照）

## 操作管理 API

- [获取快照生命周期管理状态 API](./slm_status)
- [获取快照生命周期统计信息 API](./slm_stats)（全局和策略级的操作统计信息）
- [启动快照生命周期管理 API](./start_slm)
- [停止快照生命周期管理 API](./stop_slm)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/snapshot-lifecycle-management-api.html)
