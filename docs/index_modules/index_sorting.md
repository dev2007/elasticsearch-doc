# 索引排序

在 Elasticsearch 中创建新索引时，可以配置每个分片内的段（Segments）如何排序。默认情况下 Lucene 不应用任何排序。`index.sort.*` 设置定义应使用哪些字段对每个段内的文档进行排序。

允许对带有嵌套对象的映射应用索引排序，只要 `index.sort.*` 设置中不包含嵌套字段。

例如，以下示例显示如何在单个字段上定义排序：

```txt
PUT my-index-000001
{
  "settings": {
    "index": {
      "sort.field": "date",
      "sort.order": "desc"
    }
  },
  "mappings": {
    "properties": {
      "date": {
        "type": "date"
      }
    }
  }
}
```

- 此索引按 `date` 字段排序
- … 以降序排列。

也可以按多个字段对索引排序：

```txt
PUT my-index-000001
{
  "settings": {
    "index": {
      "sort.field": [ "username", "date" ],
      "sort.order": [ "asc", "desc" ]
    }
  },
  "mappings": {
    "properties": {
      "username": {
        "type": "keyword",
        "doc_values": true
      },
      "date": {
        "type": "date"
      }
    }
  }
}
```

- 此索引先按 `username` 再按 `date` 排序
- … `username` 字段按升序，`date` 字段按降序。

## 索引排序设置

- **index.sort.field** — 用于对索引排序的字段列表。这里只允许带有 `doc_values` 的 boolean、数值、date 和 keyword 字段。

- **index.sort.order** — 每个字段使用的排序顺序。order 选项可以具有以下值：
  - `asc`：升序
  - `desc`：降序

- **index.sort.mode** — Elasticsearch 支持按多值字段排序。mode 选项控制选择什么值来对文档排序。mode 选项可以具有以下值：
  - `min`：选取最低值。
  - `max`：选取最高值。

- **index.sort.missing** — missing 参数指定如何处理缺少该字段的文档。missing 值可以具有以下值：
  - `_last`：没有该字段值的文档排在最后。
  - `_first`：没有该字段值的文档排在最前。

:::important 重要注意事项

索引排序只能在创建索引时定义一次。不允许在现有索引上添加或更新排序。索引排序还会在索引吞吐量方面产生代价，因为文档必须在 flush 和合并时进行排序。在启用此特性之前，你应该测试它对应用程序的影响。

:::

## 搜索请求的提前终止

默认情况下，在 Elasticsearch 中，搜索请求必须访问匹配查询的每个文档，以检索按指定排序排序的顶级文档。不过，当索引排序与搜索排序相同时，可以限制每个段需要访问的文档数量，以检索全局排名前 N 的文档。例如，假设我们有一个包含按时间戳字段排序的事件的索引：

```txt
PUT events
{
  "settings": {
    "index": {
      "sort.field": "timestamp",
      "sort.order": "desc"
    }
  },
  "mappings": {
    "properties": {
      "timestamp": {
        "type": "date"
      }
    }
  }
}
```

- 此索引按 `timestamp` 降序排序（最新的在前）

你可以使用以下命令搜索最近 10 个事件：

```txt
GET /events/_search
{
  "size": 10,
  "sort": [
    { "timestamp": "desc" }
  ]
}
```

Elasticsearch 将检测到每个段的顶部文档已在索引中排序，因此只会比较每个段的前 N 个文档。匹配查询的其余文档会被收集，用于统计结果总数和构建聚合。

如果你只想要最近 10 个事件，而不关心匹配查询的文档总数，可以将 `track_total_hits` 设置为 `false`：

```txt
GET /events/_search
{
  "size": 10,
  "sort": [
    { "timestamp": "desc" }
  ],
  "track_total_hits": false
}
```

索引排序将用于对顶级文档进行排名，每个段将在前 10 个匹配之后提前终止收集。

这一次，Elasticsearch 不会尝试统计文档数量，并且能够在每个段收集到 N 个文档后立即终止查询。

```json
{
  "_shards": "...",
  "hits": {
    "max_score": null,
    "hits": []
  },
  "took": 20,
  "timed_out": false
}
```

- 由于提前终止，匹配查询的命中总数是未知的。

> 无论 `track_total_hits` 的值如何，聚合都会收集匹配查询的所有文档。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-modules-index-sorting.html)
