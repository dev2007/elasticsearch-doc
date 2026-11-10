# _source 字段

`_source` 字段包含索引时传入的原始 JSON 文档主体。`_source` 字段本身不被索引（因此不可搜索），但会被存储，以便在执行获取请求（如 get 或 search）时返回。

如果磁盘占用对你很重要，请考虑以下选项：

- 使用**合成 `_source`**，它在检索时重建源内容，而不是将其存储在磁盘上。这会减少磁盘占用，代价是在 Get 和 Search 查询中对 `_source` 的访问变慢。
- 完全**禁用 `_source` 字段**。这会减少磁盘占用，但会禁用依赖 `_source` 的特性。

## 合成 `_source`

:::danger[重要]
此功能需要订阅。
:::

虽然 source 字段非常方便，但它会占用大量磁盘空间。Elasticsearch 可以在检索时即时重建源内容，而不是将源文档原样存储在磁盘上。要启用此特性，请将索引设置 `index.mapping.source.mode` 的值设为 `synthetic`：

```bash
PUT idx
{
  "settings": {
    "index": {
      "mapping": {
        "source": {
          "mode": "synthetic"
        }
      }
    }
  }
}
```

虽然这种即时重建通常比原样保存源文档并在查询时加载更慢，但它可以节省大量存储空间。通过在不需要时不加载 `_source` 字段，可以避免额外的延迟。

### 支持的字段

**所有字段类型**都支持合成 `_source`。根据实现细节，字段类型与合成 `_source` 一起使用时具有不同的特性。

大多数字段类型使用现有数据（最常见的是 `doc_values` 和存储字段）构建合成 `_source`。对于这些字段类型，不需要额外的空间来存储 `_source` 字段的内容。由于 doc_values 的存储布局，生成的 `_source` 字段与原始文档相比会有所修改。

对于所有其他字段类型，字段的原始值会按原样存储，与非合成模式下的 `_source` 字段相同。在这种情况下没有任何修改，`_source` 中的字段数据与原始文档中相同。类似地，使用 `ignore_malformed` 或 `ignore_above` 的字段的格式错误值需要按原样存储。这种方式的存储效率较低，因为 `_source` 重建所需的数据会额外存储（在索引该字段所需的其他数据如 doc_values 之外）。

### 合成 `_source` 限制

一些字段类型有额外的限制。这些限制记录在字段类型文档的合成 `_source` 部分中。

仅源（source-only）快照存储库不支持合成 source。要存储使用合成 `_source` 的索引，请选择其他存储库类型。

### 合成 `_source` 的修改

启用合成 `_source` 后，检索到的文档与原始 JSON 相比会经历一些修改。

#### 数组被移动到叶子字段

合成 `_source` 中的数组会被移动到叶子。例如：

```bash
PUT idx/_doc/1
{
  "foo": [
    { "bar": 1 },
    { "bar": 2 }
  ]
}
```

将变为：

```json
{
  "foo": {
    "bar": [1, 2]
  }
}
```

这可能导致某些数组消失：

```bash
PUT idx/_doc/1
{
  "foo": [
    { "bar": 1 },
    { "baz": 2 }
  ]
}
```

将变为：

```json
{
  "foo": {
    "bar": 1,
    "baz": 2
  }
}
```

#### 字段按映射中的名称命名

合成 source 按照映射中的名称命名字段。与动态映射一起使用时，默认情况下，名称中带点（`.`）的字段被解释为多个对象，而在禁用 `subobjects` 的对象中字段名称中的点会被保留。例如：

```bash
PUT idx/_doc/1
{
  "foo.bar.baz": 1
}
```

将变为：

```json
{
  "foo": {
    "bar": {
      "baz": 1
    }
  }
}
```

这会影响在脚本中引用源内容的方式。例如，以原始源形式引用脚本将返回 null：

```json
"script": { "source": """  emit(params._source['foo.bar.baz'])  """ }
```

相反，源引用需要与映射结构保持一致：

```json
"script": { "source": """  emit(params._source['foo']['bar']['baz'])  """ }
```

或者简单地：

```json
"script": { "source": """  emit(params._source.foo.bar.baz)  """ }
```

以下字段 API 更可取，因为它们除了与映射结构无关外，还会在可用时使用 docvalues，仅在需要时回退到合成 source。这减少了源合成——一种缓慢且昂贵的操作。

```json
"script": { "source": """  emit(field('foo.bar.baz').get(null))   """ }
"script": { "source": """  emit($('foo.bar.baz', null))   """ }
```

#### 按字母顺序排序

合成 `_source` 字段按字母顺序排序。JSON RFC 将对象定义为“零个或多个名称/值对的无序集合”，因此应用程序不应在意顺序，但在没有合成 `_source` 的情况下，原始顺序会被保留，某些应用程序可能会（违反规范地）对该顺序进行操作。

#### 范围的表示

范围字段的值（例如 `long_range`）始终表示为两侧都包含的值，并相应调整边界。参阅[示例](/mapping/field_data_types/range#合成-source)。

#### geo_point 值的精度降低

`geo_point` 字段的值在合成 `_source` 中以降低的精度表示。参阅[示例](/mapping/field_data_types/geo_point#合成-source)。

#### 尽量减少源修改

可以通过额外的存储成本，避免对特定对象或字段进行合成 source 修改。这通过参数 `synthetic_source_keep` 控制，选项如下：

- **`none`**：合成 source 按上述描述偏离原始 source（默认）。
- **`arrays`**：相应字段或对象的数组保留原始元素顺序和重复元素。此类数组的合成 source 片段不保证与原始源完全匹配，例如数组 `[1, 2, [5], [[4, [3]]], 5]` 可能按原样或以等效格式（如 `[1, 2, 5, 4, 3, 5]`）出现。确切格式将来可能会变化，以减少此选项的存储开销。
- **`all`**：相应字段或对象的单例实例和数组的源都会被记录。当应用于对象时，所有子对象和子字段的源都会被捕获。此外，数组的原始源会被捕获，并在合成 source 中不作修改地出现。

例如：

```bash
PUT idx_keep
{
  "settings": {
    "index": {
      "mapping": {
        "source": {
          "mode": "synthetic"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "path": {
        "type": "object",
        "synthetic_source_keep": "all"
      },
      "ids": {
        "type": "integer",
        "synthetic_source_keep": "arrays"
      }
    }
  }
}

PUT idx_keep/_doc/1
{
  "path": {
    "to": [
      { "foo": [3, 2, 1] },
      { "foo": [30, 20, 10] }
    ],
    "bar": "baz"
  },
  "ids": [ 200, 100, 300, 100 ]
}
```

返回原始 source，不进行数组去重和排序：

```json
{
  "path": {
    "to": [
      { "foo": [3, 2, 1] },
      { "foo": [30, 20, 10] }
    ],
    "bar": "baz"
  },
  "ids": [ 200, 100, 300, 100 ]
}
```

可以通过将 `index.mapping.synthetic_source_keep` 设置为 `arrays` 来在索引级别应用捕获数组源的选项。这适用于索引中的所有对象和字段，但显式将 `synthetic_source_keep` 覆盖为 `none` 的对象和字段除外。在这种情况下，存储开销自然会随着每个文档 source 中数组数量和大小的增加而增长。

### 无存储开销支持合成 source 的字段类型

以下字段类型使用来自 doc_values 或存储字段的数据支持合成 source，并且不需要额外的存储空间来构建 `_source` 字段。

如果你启用 `ignore_malformed` 或 `ignore_above` 设置，则这些类型需要额外的存储空间来存储被忽略的字段值。

| 字段类型 |
|:--|
| aggregate_metric_double |
| annotated-text |
| binary |
| boolean |
| byte |
| date |
| date_nanos |
| dense_vector |
| double |
| flattened |
| float |
| geo_point |
| half_float |
| histogram |
| integer |
| ip |
| keyword |
| long |
| range 类型 |
| scaled_float |
| short |
| text |
| version |
| wildcard |

### 禁用 `_source` 字段

虽然 source 字段非常方便，但它确实会在索引中产生存储开销。因此，可以按如下方式禁用它：

```bash
PUT my-index-000001
{
  "mappings": {
    "_source": {
      "enabled": false
    }
  }
}
```

:::danger[重要]
禁用 `_source` 字段之前请三思
:::

用户经常在没有考虑后果的情况下禁用 `_source` 字段，然后追悔莫及。如果 `_source` 字段不可用，则不支持以下特性：

- `update`、`update_by_query` 和 `reindex` API。
- 在 Kibana Discover 应用中，不会显示字段数据。
- 即时高亮显示。
- 从一个 Elasticsearch 索引重新索引到另一个索引的能力，无论是为了更改映射或分析，还是为了将索引升级到新的主版本。
- 通过查看索引时使用的原始文档来调试查询或聚合的能力。
- 将来可能支持的自动修复索引损坏的能力。

对于 `index_mode` 设置为 `logsdb` 或 `time_series` 的索引，你不能禁用 `_source` 字段。

如果担心磁盘空间，应该提高压缩级别而不是禁用 `_source`。

### 从 `_source` 中包含/排除字段

一项仅限专家的特性是，可以在文档被索引之后、`_source` 字段被存储之前，修剪 `_source` 字段的内容。

从 `_source` 中移除字段具有与禁用 `_source` 类似的缺点，特别是你无法将文档从一个 Elasticsearch 索引重新索引到另一个。考虑改用源过滤。

`includes`/`excludes` 参数（也接受通配符）可以按如下方式使用：

```bash
PUT logs
{
  "mappings": {
    "_source": {
      "includes": [
        "*.count",
        "meta.*"
      ],
      "excludes": [
        "meta.description",
        "meta.other.*"
      ]
    }
  }
}

PUT logs/_doc/1
{
  "requests": {
    "count": 10,
    "foo": "bar"
  },
  "meta": {
    "name": "Some metric",
    "description": "Some metric description",
    "other": {
      "foo": "one",
      "baz": "two"
    }
  }
}

GET logs/_search
{
  "query": {
    "match": {
      "meta.other.foo": "one"
    }
  }
}
```

1. 这些字段将从存储的 `_source` 字段中删除。
2. 即使它不在存储的 `_source` 中，我们仍然可以在此字段上搜索。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-source-field.html)
