# 索引生命周期管理 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [索引生命周期管理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ilm)。

:::::

你可以使用以下 API 来设置策略以自动管理索引生命周期。有关索引生命周期管理（ILM）的更多信息，请参阅 [ILM：管理索引生命周期](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-lifecycle-management.html)。

## 策略管理 API

- [创建生命周期策略 API](./put_lifecycle)
- [获取生命周期策略 API](./get_lifecycle)
- [删除生命周期策略 API](./delete_lifecycle)

## 索引管理 API

- [将索引移动到指定步骤 API](./move_to_step)
- [重试策略执行 API](./retry_policy)
- [从索引移除策略 API](./remove_policy)

## 操作管理 API

- [获取 ILM 操作模式 API](./get_status)
- [启动 ILM API](./start)
- [停止 ILM API](./stop)
- [解释 API](./explain_lifecycle)
- [迁移到数据层路由 API](./migrate_to_data_tiers)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-lifecycle-management-api.html)
