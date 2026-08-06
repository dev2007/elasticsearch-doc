# 移动到生命周期步骤 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [移动到生命周期步骤 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ilm-move-to-step)。

:::::

触发生命周期策略中特定步骤的执行。

## 请求

```bash
POST _ilm/move/<index>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对受管理的索引拥有 `manage_ilm` [权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

:::::warning 数据丢失风险

此操作可能导致数据丢失。手动将索引移入特定步骤会执行该步骤，即使该步骤已经执行过。这是一个潜在破坏性操作，应被视为专家级 API。

:::::

手动将索引移入指定步骤并执行该步骤。你必须在请求体中同时指定当前步骤和要执行的步骤。

如果当前步骤与索引当前正在执行的步骤不匹配，请求将失败。这是为了防止索引从意外的步骤被移到下一步。

指定索引要移动到的目标（`next_step`）时，`name` 或同时使用 `action` 和 `name` 字段是可选的。如果仅指定阶段（phase），索引将移动到目标阶段中第一个操作的第一个步骤。如果指定了阶段和操作（action），索引将移动到指定阶段中指定操作的第一个步骤。只有 ILM 策略中指定的操作才被视为有效，索引不能移动到不属于其策略的步骤。

## 路径参数

- `<index>`

  （必需，字符串）索引的标识符。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 请求体

- `current_step`

  （必需，对象）

  `current_step` 的属性：

  - `phase`

    （必需，字符串）当前阶段的名称。必须与解释 API 返回的阶段匹配。

  - `action`

    （必需，字符串）当前操作的名称。必须与解释 API 返回的操作匹配。

  - `name`

    （必需，字符串）当前步骤的名称。必须与解释 API 返回的步骤匹配。如果 ILM 在执行操作时遇到问题，它会暂停策略的执行并转换到 ERROR 步骤。如果你在故障排除后尝试推进策略，可以将此 ERROR 步骤指定为当前步骤。有关更多信息，请参阅 [ILM 错误处理](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-lifecycle-management-error-handling.html)。

- `next_step`

  （必需，对象）

  `next_step` 的属性：

  - `phase`

    （必需，字符串）包含你要执行或恢复的操作所在阶段的名称。

  - `action`

    （可选，字符串）你要执行或恢复的操作的名称。如果使用了 `name` 则为必需。

  - `name`

    （可选，字符串）要移动到并执行的步骤的名称。如果使用了 `action` 则为必需。

## 示例

以下示例将 `my-index-000001` 从初始步骤移动到 forcemerge 步骤：

```json
POST _ilm/move/my-index-000001
{
  "current_step": { 
    "phase": "new",
    "action": "complete",
    "name": "complete"
  },
  "next_step": { 
    "phase": "warm",
    "action": "forcemerge", 
    "name": "forcemerge" 
  }
}
```

1. 索引预期所处的步骤。
2. 你要执行的步骤。
3. 索引将移动到的可选操作。
4. 索引将移动到的可选步骤名称。

如果请求成功，你将收到以下结果：

```json
{
  "acknowledged": true
}
```

如果索引不在 `current_step` 指定的 new 阶段，请求将失败。

以下示例将 `my-index-000001` 从 hot 阶段末尾推入 warm 阶段开头：

```json
POST _ilm/move/my-index-000001
{
  "current_step": {
    "phase": "hot",
    "action": "complete",
    "name": "complete"
  },
  "next_step": {
    "phase": "warm"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-move-to-step.html)
