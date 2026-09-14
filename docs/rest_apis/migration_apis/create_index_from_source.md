# 从源创建索引 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [索引 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-index)。

:::::

这些 API 为 Kibana 的升级助手功能提供支持。我们强烈建议你使用升级助手从 7.17 升级到 8.18.8。有关升级说明，请参阅[升级到 Elastic 8.18.8](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/setup-upgrade.html)。

## 请求

```bash
PUT /_create_from/<source>/<dest>
```

```bash
POST /_create_from/<source>/<dest>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对索引拥有**管理索引**[权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

此 API 允许你向 Elasticsearch 集群添加新索引，使用现有源索引作为新索引的基础。源索引的设置和映射将被复制到目标索引。你还可以提供覆盖设置和映射，在创建目标索引时与源设置和映射组合使用。

## 路径参数

- `<source>`

  （必需，字符串）将用作基础的现有源索引名称。

- `<dest>`

  （必需，字符串）将要创建的目标索引名称。

## 请求体

- `settings_override`

  （可选，索引设置对象）覆盖源设置的设置。

- `mappings_override`

  （可选，映射对象）覆盖源映射的映射。

- `remove_index_blocks`

  （可选，布尔值）创建目标索引时从源索引中过滤掉任何索引块。默认为 `true`。

## 示例

首先创建一个源索引，我们将使用此 API 复制它：

```json
PUT /my-index
{
  "settings": {
    "index": {
      "number_of_shards": 3,
      "blocks.write": true
    }
  },
  "mappings": {
    "properties": {
        "field1": { "type": "text" }
    }
  }
}
```

现在从源索引创建目标索引。新索引将具有与源索引相同的映射和设置：

```bash
POST _create_from/my-index/my-new-index
```

或者，我们可以覆盖源的一些设置和映射。这将使用源设置和映射作为基础，与覆盖组合创建目标设置和映射：

```json
POST _create_from/my-index/my-new-index
{
  "settings_override": {
    "index": {
      "number_of_shards": 5
    }
  },
  "mappings_override": {
    "properties": {
        "field2": { "type": "boolean" }
    }
  }
}
```

由于目标索引是空的，我们很可能希望在创建后向索引写入数据。如果源索引包含索引写入块（复制到目标索引），这将不可能。处理此问题的一种方法是使用设置覆盖移除索引写入块。例如，以下设置覆盖移除所有索引块：

```json
POST _create_from/my-index/my-new-index
{
  "settings_override": {
    "index": {
      "blocks.write": null,
      "blocks.read": null,
      "blocks.read_only": null,
      "blocks.read_only_allow_delete": null,
      "blocks.metadata": null
    }
  }
}
```

由于这是常见场景，索引块实际上默认会被移除。这由 `remove_index_blocks` 参数控制，默认为 `true`。如果我们希望目标索引包含源索引的索引块，可以执行以下操作：

```json
POST _create_from/my-index/my-new-index
{
  "remove_index_blocks": false
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/indices-create-index-from-source.html)
