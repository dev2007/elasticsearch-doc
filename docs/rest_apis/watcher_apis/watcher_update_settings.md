# 更新 Watcher 设置 API

此 API 允许用户修改 Watcher 内部索引（`.watches`）的设置。

```txt
PUT /_watcher/settings
```

## 描述

**仅允许修改以下设置的子集**：

- `index.auto_expand_replicas`
- `index.number_of_replicas`
- 任何具有前缀 `index.routing.allocation.exclude.` 的设置
- 任何具有前缀 `index.routing.allocation.include.` 的设置
- 任何具有前缀 `index.routing.allocation.require.` 的设置

:::important 重要

不允许修改 `index.routing.allocation.include._tier_preference`，因为 Watcher 分片必须始终位于 `data_content` 层中。

:::

## 请求体

请求体是允许的索引设置的 JSON 对象。

## 示例

以下示例更新 Watcher 内部索引的 `index.auto_expand_replicas` 设置：

```txt
PUT /_watcher/settings
{
  "index.auto_expand_replicas": "0-4"
}
```

可配置的设置可以使用获取 Watcher 设置 API（`GET /_watcher/settings`）进行检索。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-update-settings.html)
