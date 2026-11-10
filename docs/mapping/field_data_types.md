# 字段数据类型

每个字段都有一个**字段数据类型**（field data type），也称为字段类型（field type）。该类型指示字段包含的数据种类（例如字符串或布尔值）及其预期用途。例如，你可以将字符串索引到 `text` 和 `keyword` 字段。不过，`text` 字段的值会经过分析以用于全文搜索，而 `keyword` 字符串则保持原样，用于过滤和排序。

字段类型按**类型族**（family）分组。同一类型族中的类型具有完全相同的搜索行为，但可能具有不同的空间占用或性能特征。

目前有两种类型族：`keyword` 和 `text`。其他类型族只包含单一字段类型。例如，`boolean` 类型族只包含一个字段类型：`boolean`。

## 通用类型

- [binary](/mapping/field_data_types/binary)：编码为 Base64 字符串的二进制值。
- [boolean](/mapping/field_data_types/boolean)：`true` 和 `false` 值。
- [Keywords](/mapping/field_data_types/keyword)：`keyword` 类型族，包括 `keyword`、`constant_keyword` 和 `wildcard`。
- [Numbers](/mapping/field_data_types/numeric)：用于表示数量的数值类型，例如 `long` 和 `double`。
- [Dates](/mapping/field_data_types/date)：日期类型，包括 `date` 和 `date_nanos`。
- [alias](/mapping/field_data_types/alias)：为现有字段定义别名。

## 对象及关系类型

- [object](/mapping/field_data_types/object)：JSON 对象。
- [flattened](/mapping/field_data_types/flattened)：将整个 JSON 对象作为单一字段值。
- [nested](/mapping/field_data_types/nested)：保留其子字段之间关系的 JSON 对象。
- [join](/mapping/field_data_types/join)：为同一索引中的文档定义父/子关系。
- [passthrough](/mapping/field_data_types/passthrough)：为同级子字段提供别名。

## 结构化数据类型

- [Range](/mapping/field_data_types/range)：范围类型，例如 `long_range`、`double_range`、`date_range` 和 `ip_range`。
- [ip](/mapping/field_data_types/ip)：IPv4 和 IPv6 地址。
- [version](/mapping/field_data_types/version)：软件版本。遵循语义化版本优先规则。
- murmur3：计算并存储值的哈希。

## 聚合数据类型

- [aggregate_metric_double](/mapping/field_data_types/aggregate_metric_double)：预聚合的指标值。
- [histogram](/mapping/field_data_types/histogram)：直方图形式的预聚合数值。

## 文本搜索类型

- [text fields](/mapping/field_data_types/text)：`text` 类型族，包括 `text` 和 `match_only_text`。经过分析的非结构化文本。
- annotated-text：包含特殊标记的文本。用于识别命名实体。
- [completion](/mapping/field_data_types/completion)：用于自动补全建议。
- [search_as_you_type](/mapping/field_data_types/search_as_you_type)：类似 `text` 的类型，用于边输入边补全。
- [semantic_text](/mapping/field_data_types/semantic_text)：用于执行语义搜索。
- [token_count](/mapping/field_data_types/token_count)：文本中的词元计数。

## 文档排名类型

- [dense_vector](/mapping/field_data_types/dense_vector)：记录浮点数的稠密向量。
- [sparse_vector](/mapping/field_data_types/sparse_vector)：记录浮点数的稀疏向量。
- [rank_feature](/mapping/field_data_types/rank_feature)：记录用于在查询时提升命中权重的数值特征。
- [rank_features](/mapping/field_data_types/rank_features)：记录多个用于在查询时提升命中权重的数值特征。

## 空间数据类型

- [geo_point](/mapping/field_data_types/geo_point)：经纬度点。
- [geo_shape](/mapping/field_data_types/geo_shape)：复杂形状，例如多边形。
- [point](/mapping/field_data_types/point)：任意笛卡尔点。
- [shape](/mapping/field_data_types/shape)：任意笛卡尔几何图形。

## 其他类型

- [percolator](/mapping/field_data_types/percolator)：索引用 Query DSL 编写的查询。

## 数组

在 Elasticsearch 中，数组不需要专用的字段数据类型。默认情况下，任何字段都可以包含零个或多个值，但数组中的所有值必须是相同的字段类型。参阅[数组](/mapping/field_data_types/array)。

## 多字段

以不同方式索引同一字段以用于不同目的通常很有用。例如，一个字符串字段可以映射为用于全文搜索的 `text` 字段，以及用于排序或聚合的 `keyword` 字段。或者，你可以使用 `standard` 分析器、`english` 分析器和 `french` 分析器来索引一个 `text` 字段。

这正是多字段（multi-fields）的用途。大多数字段类型通过 [`fields`](/mapping/mapping_parameters/fields) 参数支持多字段。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-types.html)
