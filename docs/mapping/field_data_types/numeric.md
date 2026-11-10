# numeric 字段类型

支持以下数值类型：

- `long`
  （有符号 64 位整数）最小值为 -2^63，最大值为 2^63-1。
- `integer`
  （有符号 32 位整数）最小值为 -2^31，最大值为 2^31-1。
- `short`
  （有符号 16 位整数）最小值为 -32768，最大值为 32767。
- `byte`
  （有符号 8 位整数）最小值为 -128，最大值为 127。
- `double`
  （双精度浮点数）双精度 64 位 IEEE 754 浮点数，仅限于有限值。
- `float`
  （单精度浮点数）单精度 32 位 IEEE 754 浮点数，仅限于有限值。
- `half_float`
  （半精度浮点数）半精度 16 位 IEEE 754 浮点数，仅限于有限值。
- `scaled_float`
  （缩放浮点数）由 long 支持的浮点数，并按固定的 double 缩放因子进行缩放。
- `unsigned_long`
  （无符号 64 位整数）最小值为 0，最大值为 2^64-1。

以下是一个使用数值字段配置映射的示例：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "number_of_bytes": {
        "type": "integer"
      },
      "time_in_seconds": {
        "type": "float"
      },
      "price": {
        "type": "scaled_float",
        "scaling_factor": 100
      }
    }
  }
}
```

:::note[提示]
`double`、`float` 和 `half_float` 类型认为 -0.0 和 +0.0 是不同的值。因此，对 -0.0 执行 term 查询不会匹配 +0.0，反之亦然。范围查询也是如此：如果上界是 -0.0，则 +0.0 不会匹配；如果下界是 +0.0，则 -0.0 不会匹配。
:::

## 我应该使用哪种类型？

就整数类型（`byte`、`short`、`integer` 和 `long`）而言，你应该选择对用例来说足够的最小类型。这有助于提高索引和搜索的效率。不过请注意，存储会根据实际存储的值进行优化，因此选择一种类型而不是另一种不会影响存储需求。

对于浮点类型，使用缩放因子将浮点数据存储为整数通常更高效，这正是 `scaled_float` 在底层所做的。例如，`price` 字段可以存储在 `scaling_factor` 为 100 的 `scaled_float` 中。所有 API 的表现就好像该字段存储为 double 一样，但在底层 Elasticsearch 使用的是价格乘以 100（即以分为单位的整数）。这主要有助于节省磁盘空间，因为整数比浮点数更容易压缩。当你想用精度换取磁盘空间时，使用 `scaled_float` 也是合理的。例如，假设你将 CPU 利用率跟踪为 0 到 1 之间的数字。CPU 利用率是 12.7% 还是 13% 通常没有太大区别，因此你可以使用 `scaling_factor` 为 100 的 `scaled_float`，将 CPU 利用率四舍五入到最接近的百分比以节省空间。

如果 `scaled_float` 不合适，那么你应该在浮点类型（`double`、`float` 和 `half_float`）中选择对用例来说足够的最小类型。下表比较了这些类型，以帮助做出决策。

| 类型 | 最小值 | 最大值 | 有效位 / 有效数字 | 精度损失示例 |
|:--|:--|:--|:--|:--|
| double | 2^-1074 | (2-2^-52)·2^1023 | 53 / 15.95 | 1.2345678912345678→1.234567891234568 |
| float | 2^-149 | (2-2^-23)·2^127 | 24 / 7.22 | 1.23456789→1.2345679 |
| half_float | 2^-24 | 65504 | 11 / 3.31 | 1.2345→1.234375 |

### 映射数值标识符

并非所有数值数据都应该映射为数值字段数据类型。Elasticsearch 针对[范围查询](/query_dsl/term_level_queries/range)优化了 `integer` 或 `long` 等数值字段。不过，[keyword](/mapping/field_data_types/keyword) 字段更适合 [term](/query_dsl/term_level_queries/term) 和其他[词条级查询](/query_dsl/term_level_queries/term_level_queries)。

诸如 ISBN 或产品 ID 之类的标识符很少用于范围查询，但经常通过词条级查询来检索。

在以下情况下，考虑将数值标识符映射为 `keyword`：

- 你不打算使用范围查询来搜索标识符数据。
- 快速检索很重要。在 `keyword` 字段上执行 `term` 查询搜索通常比在数值字段上执行 `term` 搜索更快。

如果不确定该用哪种，可以使用[多字段](/mapping/mapping_parameters/fields)将数据同时映射为 `keyword` 和数值数据类型。

## 数值字段的参数

数值类型接受以下参数：

- `coerce`
  （可选，Boolean）尝试将字符串转换为数字，并对整数截断小数部分。接受 `true`（默认）和 `false`。不适用于 `unsigned_long`。注意，如果使用了 `script` 参数，则无法设置此项。
- `doc_values`
  （可选，Boolean）是否应该将该字段以列式方式存储在磁盘上，以便之后可用于排序、聚合或脚本？接受 `true`（默认）或 `false`。
- `ignore_malformed`
  （可选，Boolean）如果为 `true`，则忽略格式错误的数字。如果为 `false`（默认），格式错误的数字会抛出异常并拒绝整个文档。注意，如果使用了 `script` 参数，则无法设置此项。
- `index`
  （可选，Boolean）该字段是否应该可以快速搜索？接受 `true`（默认）和 `false`。只启用 `doc_values` 的数值字段也可以查询，只是速度较慢。
- `meta`
  （可选，对象）关于该字段的元数据。
- `null_value`
  （可选，数值）接受与字段相同类型的数值，用于替换任何显式的 `null` 值。默认为 `null`，表示该字段被视为缺失。注意，如果使用了 `script` 参数，则无法设置此项。
- `on_script_error`
  （可选，枚举）定义当 `script` 参数定义的脚本在索引时抛出错误时该怎么办。接受 `fail`（默认），它会导致整个文档被拒绝；以及 `continue`，它会将该字段记录到文档的 `_ignored` 元数据字段中并继续索引。只有同时设置了 `script` 字段时才能设置此参数。
- `script`
  （可选，字符串）如果设置了此参数，则该字段将索引由此脚本生成的值，而不是直接从源中读取值。如果输入文档中为该字段设置了值，文档将被拒绝并返回错误。脚本的格式与其运行时字段等效格式相同。脚本只能配置在 `long` 和 `double` 字段类型上。
- `store`
  （可选，Boolean）是否应该单独存储字段值，使其可以独立于 `_source` 字段检索。接受 `true` 或 `false`（默认）。
- `time_series_dimension`
  （可选，Boolean）将字段标记为时序维度。默认为 `false`。

  `index.mapping.dimension_fields.limit` 索引设置限制索引中的维度数量。

  维度字段具有以下约束：

  - `doc_values` 和 `index` 映射参数必须为 `true`。

  在数值字段类型中，只有 `byte`、`short`、`integer`、`long` 和 `unsigned_long` 字段支持此参数。

  数值字段不能同时是时序维度和时序指标。

- `time_series_metric`
  （可选，字符串）将字段标记为时序指标。值为指标类型。你不能对现有字段更新此参数。

  数值字段的有效 `time_series_metric` 值：

  - `counter`：一种累积指标，只单调递增或重置为 0（零）。例如，错误计数或已完成任务的数量。
  - `gauge`：表示可以任意增加或减少的单一数值的指标。例如，温度或可用磁盘空间。
  - `null`（默认）：不是时序指标。

  对于数值时序指标，`doc_values` 参数必须为 `true`。数值字段不能同时是时序维度和时序指标。

## scaled_float 的参数

`scaled_float` 接受一个额外参数：

- `scaling_factor`
  （必需，数值）编码值时使用的缩放因子。值会在索引时乘以此因子，并四舍五入到最接近的 long 值。例如，`scaling_factor` 为 10 的 `scaled_float` 会在内部将 2.34 存储为 23，所有搜索时操作（查询、聚合、排序）的行为就好像文档的值为 2.3。较高的 `scaling_factor` 可以提高精度，但也会增加空间需求。

## scaled_float 的饱和

`scaled_float` 存储为单个 long 值，即原始值乘以缩放因子的乘积。如果乘法结果超出 long 的范围，该值将被饱和为 long 的最小值或最大值。例如，如果缩放因子为 100 且值为 92233720368547758.08，期望值为 9223372036854775808。但实际存储的值是 9223372036854775807，即 long 的最大值。

当缩放因子或提供的浮点值异常大时，这可能导致范围查询出现意想不到的结果。

## 合成 _source

所有数值字段在其默认配置下都支持合成 `_source`。合成 `_source` 不能与 `copy_to` 一起使用，也不能在禁用 `doc_values` 的情况下使用。

合成 source 可能会对数值字段的值进行排序。例如：

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
  },
  "mappings": {
    "properties": {
      "long": { "type": "long" }
    }
  }
}

PUT idx/_doc/1
{
  "long": [0, 0, -123466, 87612]
}
```

将变为：

```json
{
  "long": [-123466, 0, 0, 87612]
}
```

缩放浮点数始终会应用其缩放因子，因此：

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
  },
  "mappings": {
    "properties": {
      "f": { "type": "scaled_float", "scaling_factor": 0.01 }
    }
  }
}

PUT idx/_doc/1
{
  "f": 123
}
```

将变为：

```json
{
  "f": 100.0
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/number.html)
