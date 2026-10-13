# 获取 Watcher 设置 API

此 API 允许用户检索 Watcher 内部索引（`.watches`）的**用户可配置设置**。仅显示索引设置中用户可配置的子集，包括：

- `index.auto_expand_replicas`
- `index.number_of_replicas`

可配置的设置可以使用更新 Watcher 设置 API 进行修改。

```txt
GET /_watcher/settings
```

## 示例

以下示例检索 Watcher 内部索引的用户可配置设置：

```txt
GET /_watcher/settings
```

响应仅返回 `.watches` 索引的用户可配置设置（即 `index.auto_expand_replicas` 和 `index.number_of_replicas`），其他索引设置不会显示。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-get-settings.html)
