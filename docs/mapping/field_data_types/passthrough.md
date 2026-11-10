# passthrough 字段类型

pass-through（透传）对象扩展了对象的功能，允许访问其子字段，而无需将 pass-through 对象的名称作为前缀。例如：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "attributes": {
        "type": "passthrough",
        "priority": 10,
        "properties": {
          "id": {
            "type": "keyword"
          }
        }
      }
    }
  }
}

# 对象内容照常被索引，包括动态映射
PUT my-index-000001/_doc/1
{
  "attributes" : {
    "id": "foo",
    "zone": 10
  }
}

# 子字段可以在查询中引用，就好像它们定义在根级别一样
GET my-index-000001/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "id": "foo" }},
        { "match": { "zone": 10 }}
      ]
    }
  }
}

# 子字段也可以带上对象名称前缀来引用
GET my-index-000001/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "attributes.id": "foo" }},
        { "match": { "attributes.zone": 10 }}
      ]
    }
  }
}
```

1. 对象被定义为 pass-through。其 `priority`（必需）用于冲突解决。
2. 对象内容照常被索引，包括动态映射。
3. 子字段可以在查询中引用，就好像它们定义在根级别一样。
4. 子字段也可以带上对象名称前缀来引用。

## 冲突解决

对于定义在不同作用域中的字段，可能会出现名称冲突的情况：

1. 定义了一个 pass-through 对象，旁边有一个与该 pass-through 对象子字段同名的字段，例如：

```bash
PUT my-index-000001/_doc/1
{
  "attributes" : {
    "id": "foo"
  },
  "id": "bar"
}
```

在这种情况下，对 `id` 的引用指向根级别的字段，而字段 `attributes.id` 只能使用完整路径访问。

2. 两个（或更多）pass-through 对象定义在同一个对象内，并且包含同名的字段，例如：

```bash
PUT my-index-000002
{
  "mappings": {
    "properties": {
      "attributes": {
        "type": "passthrough",
        "priority": 10,
        "properties": {
          "id": {
            "type": "keyword"
          }
        }
      },
      "resource.attributes": {
        "type": "passthrough",
        "priority": 20,
        "properties": {
          "id": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```

在这种情况下，`priority` 参数用于冲突解决，值越高优先级越高。在上面的例子中，`resource.attributes` 的优先级高于 `attributes`，因此对 `id` 的引用指向 `resource.attributes` 中的字段。`attributes.id` 仍然可以使用其完整路径访问。

## 将子字段定义为时序维度

可以将 pass-through 字段配置为时序维度的容器。在这种情况下，所有子字段都会在底层被标注相同的参数，并且它们也会被包含在路由路径和 tsid 计算中，从而简化 TSDS 的设置：

```bash
PUT _index_template/my-metrics
{
  "index_patterns": ["metrics-mymetrics-*"],
  "priority": 200,
  "data_stream": { },
  "template": {
    "settings": {
      "index.mode": "time_series"
    },
    "mappings": {
      "properties": {
        "attributes": {
          "type": "passthrough",
          "priority": 10,
          "time_series_dimension": true,
          "properties": {
            "host.name": {
              "type": "keyword"
            }
          }
        },
        "cpu": {
          "type": "integer",
          "time_series_metric": "counter"
        }
      }
    }
  }
}

POST metrics-mymetrics-test/_doc
{
  "@timestamp": "2020-01-01T00:00:00.000Z",
  "attributes" : {
    "host.name": "foo",
    "zone": "bar"
  },
  "cpu": 10
}
```

在上面的例子中，`attributes` 被定义为一个维度容器。其子字段 `host.name`（静态）和 `zone`（动态）会被包含在路由路径和 tsid 中，并且可以在查询中不带 `attributes.` 前缀引用。

## 子字段自动扁平化

Pass-through 字段默认对子字段应用自动扁平化，以减少动态映射冲突。因此，pass-through 字段内不允许定义子对象。

## passthrough 字段的参数

passthrough 字段接受以下参数：

- `priority`
  （必需，整数）用于 pass-through 字段之间的命名冲突解决。值最高的字段获胜。接受非负整数值。
- `time_series_dimension`
  （可选，Boolean）是否将子字段视为时序维度。接受 `false`（默认）或 `true`。
- `dynamic`
  （可选，字符串）是否应将新属性动态添加到现有对象。接受 `true`（默认）、`runtime`、`false` 和 `strict`。
- `enabled`
  （可选，Boolean）是否应该解析并索引为对象字段给定的 JSON 值（`true`，默认），还是完全忽略它（`false`）。
- `properties`
  （可选，对象）对象内的字段，可以是任何数据类型，包括 `object`。可以向现有对象添加新属性。

如果你需要索引对象数组而不是单个对象，请先阅读 [`nested`](/mapping/field_data_types/nested)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/passthrough.html)
