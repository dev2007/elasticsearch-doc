# subobjects

在索引文档或更新映射时，Elasticsearch 接受名称中包含点的字段，这些字段会被展开为相应的对象结构。例如，字段 `metrics.time.max` 被映射为一个 `max` 叶子字段，其父对象为 `time`，而 `time` 属于其父对象 `metrics`。

所描述的默认行为对大多数场景都是合理的，但在某些情况下会引起问题，例如字段 `metrics.time` 也持有值——这在索引指标数据时很常见。如果一个文档同时持有 `metrics.time.max` 和 `metrics.time` 的值，该文档会被拒绝，因为 `time` 既需要是持有值的叶子字段，又需要是持有 `max` 子字段的对象。

[`subobjects`](/mapping/mapping_parameters) 设置只可以应用于顶层映射定义和 object 字段，它禁用对象持有更多子对象的能力，使得可以存储字段名称包含点并共享公共前缀的文档。从上面的例子来看，如果对象容器 `metrics` 将 `subobjects` 设置为 `false`，它可以直接持有 `time` 和 `time.max` 的值，而不需要任何中间对象，因为字段名称中的点会被保留。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "metrics": {
        "type":  "object",
        # metrics 字段不能持有其他对象
        "subobjects": false,
        "properties": {
          "time": { "type": "long" },
          "time.min": { "type": "long" },
          "time.max": { "type": "long" }
        }
      }
    }
  }
}

# 持有扁平路径的示例文档
PUT my-index-000001/_doc/metric_1
{
  "metrics.time" : 100,
  "metrics.time.min" : 10,
  "metrics.time.max" : 900
}

# 持有一个对象（配置为不持有子对象）及其叶子子字段的示例文档
PUT my-index-000001/_doc/metric_2
{
  "metrics" : {
    "time" : 100,
    "time.min" : 10,
    "time.max" : 900
  }
}

GET my-index-000001/_mapping
```

保留字段名称中点的最终映射如下：

```json
{
  "my-index-000001" : {
    "mappings" : {
      "properties" : {
        "metrics" : {
          "subobjects" : false,
          "properties" : {
            "time" : {
              "type" : "long"
            },
            "time.min" : {
              "type" : "long"
            },
            "time.max" : {
              "type" : "long"
            }
          }
        }
      }
    }
  }
}
```

整个映射也可以配置为不支持子对象，在这种情况下，文档只能持有叶子子字段：

```bash
# 整个映射被配置为不支持对象
PUT my-index-000001
{
  "mappings": {
    "subobjects": false
  }
}

# 文档不支持对象
PUT my-index-000001/_doc/metric_1
{
  "time" : "100ms",
  "time.min" : "10ms",
  "time.max" : "900ms"
}
```

现有字段和顶层映射定义的 `subobjects` 设置无法更新。

## 对象映射的自动扁平化

一般建议使用带点的字段名定义配置了 `subobjects: false` 的对象的属性（如第一个示例所示）。不过，也可以在映射中将这些属性定义为子对象。在这种情况下，映射会在存储之前自动扁平化。这使得无需重写即可复用现有映射。

注意，当在配置了 `subobjects: false` 的对象下定义的对象映射上设置了某些映射参数时，自动扁平化将不起作用：

- [`enabled`](/mapping/mapping_parameters/enabled) 映射参数不能为 `false`。
- [`dynamic`](/mapping/mapping_parameters/dynamic) 映射参数不能与父对象的隐式或显式值相矛盾。例如，当在映射的根中 `dynamic` 设置为 `false` 时，将 `dynamic` 设置为 `true` 的对象映射器无法自动扁平化。
- [`subobjects`](/mapping/mapping_parameters) 映射参数不能显式设置为 `true`。

```bash
PUT my-index-000002
{
  "mappings": {
    "properties": {
      "metrics": {
        # metrics 对象可以包含将被自动扁平化的其他对象映射。此级别的对象映射不得设置上述某些映射参数
        "subobjects": false,
        "properties": {
          "time": {
            # 此字段将在映射存储之前自动扁平化为 time.min
            "type": "object",
            "properties": {
              "min": { "type": "long" },
              "max": { "type": "long" }
            }
          }
        }
      }
    }
  }
}

GET my-index-000002/_mapping
```

通过查看索引映射可以检查自动扁平化的 `time.min` 字段：

```json
{
  "my-index-000002" : {
    "mappings" : {
      "properties" : {
        "metrics" : {
          "subobjects" : false,
          "properties" : {
            "time.min" : {
              "type" : "long"
            },
            "time.max" : {
              "type" : "long"
            }
          }
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/subobjects.html)
