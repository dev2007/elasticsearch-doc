# 删除快照生命周期策略 API

删除现有的快照生命周期策略。

```txt
DELETE /_slm/policy/<snapshot-lifecycle-policy-id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage_slm` 集群权限才能使用此 API。

## 描述

删除指定的生命周期策略定义。重要行为细节：

- 阻止将来拍摄任何快照。
- **不会**取消正在进行中的快照。
- **不会**移除之前拍摄的快照。

## 路径参数

`<snapshot-lifecycle-policy-id>`

（必需，字符串）要删除的快照生命周期策略的 ID。

## 示例

以下示例删除策略 `daily-snapshots`：

```txt
DELETE /_slm/policy/daily-snapshots
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/slm-api-delete-policy.html)
