# 字段能力 API

允许你在多个索引中检索字段的功能。对于数据流，API 返回流的支持索引中的字段功能。

```bash
GET /_field_caps?fields=rating
```

## 请求

`GET /_field_caps?fields=<fields>`

`POST /_field_caps?fields=<fields>`

`GET /<target>/_field_caps?fields=<fields>`

`POST /<target>/_field_caps?fields=<fields>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须对目标数据流、索引或别名有 `view_index_metadata`、`read` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

字段能力 API 在多个索引中返回有关字段功能的信息。

字段能力 API 像任何其他字段一样返回[运行时字段](/mapping/runtime_fields/runtime_fields)。例如，具有 `keyword` 类型的运行时字段将作为属于 `keyword` 族的任何其他字段返回。

## 路径参数

- `<target>`
  （可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `fields`
  （必需，字符串）以逗号分隔的待返回能力的字段列表，用于检索功能。支持通配符（*）表达式。

- `allow_no_indices`
  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

  默认为 `true`。

- `expand_wildcards`
  （可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效的值有：

  1. `all`
  匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax#隐藏数据流和索引)（隐藏的）。
  2. `open`
  匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
  3. `closed`
  匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
  4. `hidden`
  匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
  5. `none`
  不接受通配符表达式。

  默认为 `open`。

- `ignore_unavailable`
  （可选，布尔值）如果为 `true`，缺少或关闭的索引不包括在响应中。默认为 `false`。

- `include_unmapped`
  （可选，布尔值）如果为 `true`，响应中包含未映射的字段。默认为 `false`。

- `filters`
  （可选，字符串）用于响应的逗号分隔过滤器列表。

  - `filters` 有效值：

    - `+metadata`
      仅包含 metadata 字段

    - `-metadata`
      排除 metadata 字段

    - `-parent`
      排除 parent 字段

    - `-nested`
      排除 nested 字段

    - `-multifield`
      排除 multifield 字段

- `types`
  （可选，字符串）逗号分隔的要包含的字段类型的列表。任何与这些类型之一不匹配的字段都将从结果中排除。默认为空，表示返回所有字段类型。参阅[此处](/rest_apis/search_api/field_capabilities#响应体)，了解有关字段能力请求和响应中字段类型的更多信息。

## 请求体

- `index_filter`
  （可选，[查询对象](/query_dsl/query_dsl)）如果提供的查询重写为在每个分片上 `match_none`，则允许筛选索引。

- `runtime_mappings`
  （可选，对象）在请求中定义临时[运行时字段](/mapping/define_runtime_fields_in_a_search_request)，类似于在[搜索请求](/rest_apis/search_apis/search)中执行的方式。这些字段仅作为查询的一部分存在，并且优先于在索引映射中使用相同名称定义的字段。

## 响应体

响应中使用的类型描述了字段类型*族（families）*。通常，类型族与映射中声明的字段类型相同，但为了简化问题，某些行为相同的字段类型使用类型族进行描述。例如，`keyword`、`constant_keyword` 和 `wildcard` 字段类型都被描述为 `keyword` 类型族。

- `metadata_field`
  该字段是否注册为 [metadata 字段](/mapping/metadata_fields)

- `searchable`
  该字段是否在所有索引中都可搜索

- `aggregatable`
  该字段是否在所有索引中都可聚合

- `time_series_dimension`
  [预览]该字段是否为时序维度

- `time_series_metric`
  [预览]如果此字段用作时序度量，则包含度量类型；如果此字段未用作度量，则不包含。

- `indices`
  此字段具有相同类型族的索引列表，如果所有索引都具有该字段的相同类型族，则为 null。

- `non_searchable_indices`
  此字段不可搜索的索引列表，如果所有索引对该字段具有相同的定义，则为 null。

- `non_aggregatable_indices`
  此字段不可聚合的索引列表，如果所有索引对该字段具有相同的定义，则为 null。

- `non_dimension_indices`
  [预览]此字段不可聚合的索引列表，如果所有索引对该字段具有相同的定义，则为null。如果有此列表作为响应，则某些索引将字段标记为维度，而其他索引（此列表中的索引）则没有。

- `metric_conflicts_indices`
  [预览]如果此字段的索引没有相同的 `time_series_metric` 值，则显示此字段的索引列表。

- `meta`
  将所有索引中的元数据合并为字符串键到值数组的映射。值长度为1表示所有索引对此键具有相同的值，而长度为 2 或更多表示并非所有索引对此键具有相同的值。

## 示例

请求可以限制为特定的数据流和索引：

```bash
GET my-index-000001/_field_caps?fields=rating
```

下一个示例 API 调用请求有关 `rating` 和 `title` 字段的信息：

```bash
GET _field_caps?fields=rating,title
```

此 API 返回以下响应：

```bash
{
  "indices": [ "index1", "index2", "index3", "index4", "index5" ],
  "fields": {
    "rating": {
      "long": {
        "metadata_field": false,
        "searchable": true,
        "aggregatable": false,
        "indices": [ "index1", "index2" ],
        "non_aggregatable_indices": [ "index1" ]  
      },
      "keyword": {
        "metadata_field": false,
        "searchable": false,
        "aggregatable": true,
        "indices": [ "index3", "index4" ],
        "non_searchable_indices": [ "index4" ]
      }
    },
    "title": {
      "text": {
        "metadata_field": false,
        "searchable": true,
        "aggregatable": false
      }
    }
  }
}
```

1. `"rating": {`：字段 `rating` 在 `index1` 和 `index2` 中定义为长，在 `index3` 和 `index4` 中定义为 `keyword`。
2. `"non_aggregatable_indices": [ "index1" ] `：字段 `rating` 在索引 `index1` 中无聚合。
3. `"non_searchable_indices": [ "index4" ] `：字段 `rating` 在索引 `index4` 中无法搜索。
4. `"title": { `：字段 `title` 在所有索引中定义为 `text`。

默认情况下，将忽略未映射的字段。通过在请求中添加一个名为 `include_unmapped` 的参数，可以将它们包括在响应中：

```bash
GET _field_caps?fields=rating,title&include_unmapped
```

在这种情况下，响应将包含某些索引（但不是所有索引）中存在的每个字段的条目：

```bash
{
  "indices": [ "index1", "index2", "index3" ],
  "fields": {
    "rating": {
      "long": {
        "metadata_field": false,
        "searchable": true,
        "aggregatable": false,
        "indices": [ "index1", "index2" ],
        "non_aggregatable_indices": [ "index1" ]
      },
      "keyword": {
        "metadata_field": false,
        "searchable": false,
        "aggregatable": true,
        "indices": [ "index3", "index4" ],
        "non_searchable_indices": [ "index4" ]
      },
      "unmapped": {
        "metadata_field": false,
        "indices": [ "index5" ],
        "searchable": false,
        "aggregatable": false
      }
    },
    "title": {
      "text": {
        "metadata_field": false,
        "indices": [ "index1", "index2", "index3", "index4" ],
        "searchable": true,
        "aggregatable": false
      },
      "unmapped": {
        "metadata_field": false,
        "indices": [ "index5" ],
        "searchable": false,
        "aggregatable": false
      }
    }
  }
}
```

1. 第一个 `"unmapped": {  `：字段 `rating` 在索引 `index5` 中无映射。
2. 第二个 `"unmapped": {  `：字段 `title` 在索引 `index5` 中无映射。

还可以通过查询过滤索引：

```bash
POST my-index-*/_field_caps?fields=rating
{
  "index_filter": {
    "range": {
      "@timestamp": {
        "gte": "2018"
      }
    }
  }
}
```

在这种情况下的索引，将从响应中筛选提供的过滤器，在每个分片上重写为 `match_none`。

:::caution 警告
过滤是在尽力而为的基础上完成的，它使用索引统计信息和映射来重写查询为 `match_none`，而不是完全执行请求。例如，如果分片中的所有文档（包括已删除的文档）都不在提供的范围内，则对 `date` 字段的 `range` 查询可以重写为 `match_none`。但是，并非所有查询都可以重写为 `match_none`，因此即使提供的筛选器不匹配任何文档，该 API 也可能返回索引。
:::

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-field-caps.html)
