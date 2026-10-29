# 归档设置

如果你将带有已弃用的持久集群设置的集群升级到不再支持该设置的版本，Elasticsearch 会自动归档该设置。类似地，如果你升级的集群中包含具有不受支持的索引设置的索引，Elasticsearch 会归档该索引设置。

我们建议你在升级后移除任何归档设置。归档设置被视为无效，并可能干扰你配置其他设置的能力。

归档设置以 `archived.` 前缀开头。

## 归档的集群设置

使用以下集群更新设置请求检查归档的集群设置。如果请求返回空对象（`{ }`），则没有归档的集群设置：

```txt
GET _cluster/settings?flat_settings=true&filter_path=persistent.archived*
```

要移除任何归档的集群设置，使用以下集群更新设置请求：

```txt
PUT _cluster/settings
{
  "persistent": {
    "archived.*": null
  }
}
```

Elasticsearch 不会归档瞬态集群设置或 `elasticsearch.yml` 中的设置。如果节点在 `elasticsearch.yml` 中包含不受支持的设置，它将在启动时返回错误。

## 归档的索引设置

在升级之前，请从索引和组件模板中移除任何不受支持的索引设置。Elasticsearch 在升级期间不会归档模板中不受支持的索引设置。尝试使用包含不受支持的索引设置的模板将失败并返回错误。这包括自动化操作，例如 ILM 滚动操作。

归档的索引设置不会影响索引的配置或大多数索引操作（例如索引或搜索）。但是，你需要先移除它们，然后才能为索引配置其他设置，例如 `index.hidden`。

使用以下获取索引设置请求获取带有归档设置的索引列表。如果请求返回空对象（`{ }`），则没有归档的索引设置：

```txt
GET */_settings?flat_settings=true&filter_path=**.settings.archived*
```

要移除任何归档的索引设置，使用以下索引更新设置请求：

```txt
PUT /my-index/_settings
{
  "archived.*": null
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/archived-settings.html)
