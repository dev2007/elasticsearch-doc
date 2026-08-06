# 迁移到数据层路由 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [迁移到数据层路由 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ilm-migrate-to-data-tiers)。

:::::

将索引、ILM 策略以及旧版、可组合和组件模板从使用自定义节点属性和基于属性的分配过滤器切换为使用数据层，并可选择删除一个旧版索引模板。使用节点角色使 ILM 能够自动在数据层之间移动索引。

从自定义节点属性路由迁移可以按照[将索引分配过滤器迁移到节点角色](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/migrate-index-allocation-filters-to-node-roles.html)页面中的说明手动执行。

此 API 提供了一种自动化方式来执行迁移指南中列出的四个手动步骤中的三个：

1. 停止在新索引上设置自定义 hot 属性。
2. 从现有 ILM 策略中移除自定义分配设置。
3. 用相应的层偏好替换现有索引中的自定义分配设置。

## 请求

```bash
POST /_ilm/migrate_to_data_tiers
```

该 API 接受一个可选的请求体，允许你指定：

- 要删除的旧版索引模板名称。默认为无。
- 用于索引和 ILM 策略分配过滤的自定义节点属性名称。默认为 `data`。

## 前置条件

- 在执行迁移之前必须停止 ILM。使用[停止 ILM API](./stop) 停止 ILM，并使用获取 ILM 操作模式 API 等待报告的操作模式为 STOPPED。

## 查询参数

- `dry_run`

  （可选，布尔值）如果为 `true`，模拟从基于节点属性的分配过滤器迁移到数据层，但不执行迁移。这提供了一种检索需要迁移的索引和 ILM 策略的方法。默认为 `false`。

  在模拟迁移时（即 `dry_run` 为 `true`），不需要停止 ILM。

## 示例

以下示例将索引、ILM 策略、旧版模板、可组合和组件模板从使用 `custom_attribute_name` 节点属性定义自定义分配过滤中迁移出来，并删除名为 `global-template` 的旧版模板（如果系统中存在）。

```json
POST /_ilm/migrate_to_data_tiers
{
  "legacy_template_to_delete": "global-template",
  "node_attribute": "custom_attribute_name"
}
```

如果请求成功，将收到类似以下的响应：

```json
{
  "dry_run": false,
  "removed_legacy_template":"global-template", 
  "migrated_ilm_policies":["policy_with_allocate_action"], 
  "migrated_indices":["warm-index-to-migrate-000001"], 
  "migrated_legacy_templates":["a-legacy-template"], 
  "migrated_composable_templates":["a-composable-template"], 
  "migrated_component_templates":["a-component-template"] 
}
```

1. 显示被删除的旧版索引模板名称。如果没有删除旧版索引模板，则此字段不存在。
2. 已更新的 ILM 策略。
3. 已迁移到层偏好路由的索引。
4. 已更新为不包含所提供 data 属性的自定义路由设置的旧版索引模板。
5. 已更新为不包含所提供 data 属性的自定义路由设置的可组合索引模板。
6. 已更新为不包含所提供 data 属性的自定义路由设置的组件模板。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-migrate-to-data-tiers.html)
