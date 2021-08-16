# 更新映射 API

为现有数据流或索引添加一个字段。你也可以通过 API 修改现有字段的搜索设置。

对于数据流而言，这些变更默认应用于所有备份索引。

```bash
PUT /my-index-000001/_mapping
{
  "properties": {
    "email": {
      "type": "keyword"
    }
  }
}
```

?> 在版本 7.0.0 之前，映射的定义用于包含类型名字。即使在请求中指定类型不被推荐，但如果设置了请求参数 `include_type_name`，仍然可以提供类型。更多细节，参阅 [移除映射类型](/mapping/removal_of_mapping_types)。

## 请求

`PUT /<target>/_mapping`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或索引别名必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

[~~7.9~~开始不推荐] 如果请求以索引或索引别名为目标，你也可以通过索引权限 `create`、`create_doc`、`index` 或 `write` 来更新它的映射。

## 路径参数

`<target>`

（必需，字符串）用于限制请求的逗号分隔的数据流、索引和别名列表。支持通配符（*）。为了标明所有数据流和索引，省略这个参数或者使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`

（可选，布尔值）如果为 `false`，如果任何通配符表达式、索引别名或 `_all` 值只针对丢失或关闭的索引，则请求返回一个错误。即使请求以其他开放索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，但没有索引以 `bar` 开头，以 `foo*,bar*` 为目标的请求将返回错误。

默认为 `true`。

- `expand_wildcards`

（可选，字符串）通配符表达式能匹配的索引类型。如果请求目标为数据流，则此参数确定通配符表达式是否匹配隐藏的数据流则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔列表的值，如 `open,hidden`。有效的值有：

1. `all`
匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax?id=隐藏数据流和索引)（隐藏的）。
2. `open`
匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
3. `closed`
匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
4. `hidden`
匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
5. `none`
不接受通配符表达式。

默认为 `open`。

- `include_type_name`
[~~7.0.0~~开始不推荐] （可选，布尔值）如果为 `true`，映射体中需要映射类型。

- `ignore_unavailable`
（可选，布尔值）如果为 `true`，请求不存在的索引将返回错误。默认为 `false`。

- `master_timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `write_index_only`
（可选，布尔值）如果为 `true`，映射只应用于目标的当前写索引。默认为 `false`。

## 请求体

- `properties`
（必需，[映射对象](/mapping/mapping)）字段的映射。对新字段，映射可以包含：

1. 字段名字
2. [字段数据类型](/mapping/field_data_types)
3. [映射参数](/mapping/mapping_parameters/mapping_parameters)

对已有字段，参阅 [变更已有字段的映射](/rest_apis/index_apis/update_mapping?id=变更已有字段的映射)。

## 示例

### 单目标示例

更新映射 API 必需一个已有的数据流或索引。以下的[创建索引](/rest_apis/index_apis/creat_index) API 请求创建一个无映射的名为 `publications` 的索引。

```bash
PUT /publications
```

以下更新映射 API 请求，为索引 `publications` 添加了一个名为 `title` 的[文本（text）](/mapping/field_data_type/text)字段。

```bash
PUT /publications/_mapping
{
  "properties": {
    "title":  { "type": "text"}
  }
}
```

### 多个目标

更新映射 API 可以通过一个请求应用于多个数据流或索引。例如，你可以同时为索引 `my-index-000001` 和 `my-index-000002` 更新映射：

```bash
# Create the two indices
PUT /my-index-000001
PUT /my-index-000002

# Update both mappings
PUT /my-index-000001,my-index-000002/_mapping
{
  "properties": {
    "user": {
      "properties": {
        "name": {
          "type": "keyword"
        }
      }
    }
  }
}
```

### 为现有对象字段添加新属性

你可以使用更新映射 API 为现有对象字段添加属性。为了查看如何运作，试试以下的例子。

通过[创建索引](/rest_apis/index_apis/create_index) API 创建一个索引，带有名为 `name` 的对象字段，其中包含 `first` 文本字段。

```bash
PUT /my-index-000001
{
  "mappings": {
    "properties": {
      "name": {
        "properties": {
          "first": {
            "type": "text"
          }
        }
      }
    }
  }
}
```

通过更新映射 API 向 `name` 字段中添加一个 `last` 文本字段。

```bash
PUT /my-index-000001/_mapping
{
  "properties": {
    "name": {
      "properties": {
        "last": {
          "type": "text"
        }
      }
    }
  }
}
```

### 为现有字段添加多个字段

[多字段](/mapping/mapping_parameters/fields)允许你以不同的方式索引同一字段。你可以通过更新映射 API 来更新 `fields` 映射参数，且对已有字段也支持多字段。

为了观察如何运作，试试以下例子。

通过[创建索引](/rest_apis/index_apis/create_index) API 创建一个索引，带有名为 `city` 的[文本（text）](/mapping/field_data_type/text)字段。

```bash
PUT /my-index-000001
{
  "mappings": {
    "properties": {
      "city": {
        "type": "text"
      }
    }
  }
}
```

虽然全文搜索下文本字段运行良好，但是 keyword 字段不被解析，对排序或聚集中可能效果更好。

通过更新映射 API 为 `city` 字段启用多字段。这个请求将添加一个 `city.raw` 关键字多字段，可以用于排序。

```bash
PUT /my-index-000001/_mapping
{
  "properties": {
    "city": {
      "type": "text",
      "fields": {
        "raw": {
          "type": "keyword"
        }
      }
    }
  }
}
```

### 变更现有字段支持的映射参数

每个[映射参数](/mapping/mapping_parameters/mapping_parameters)的文档指示是否可以使用更新映射 API 为现有字段更新它。例如，你可以使用更新映射 API 来更新 [`ignore_above`](/mapping/mapping_parameters/ignore_above) 参数。

为了观察如何运作，试试以下例子。

通过[创建索引](/rest_apis/index_apis/create_index) API 创建一个索引，包含名为 `user_id` 的 keyword 字段。`user_id` 字段有一个参数名为 `ignore_above`，值为 `20`。

```bash
PUT /my-index-000001
{
  "mappings": {
    "properties": {
      "user_id": {
        "type": "keyword",
        "ignore_above": 20
      }
    }
  }
}
```

通过更新映射 API 变更 `ignore_above` 参数值为 `100`。

```bash
PUT /my-index-000001/_mapping
{
  "properties": {
    "user_id": {
      "type": "keyword",
      "ignore_above": 100
    }
  }
}
```

### 变更已有字段的映射

除了支持[映射参数](/mapping/mapping_parameters/mapping_parameters)，你不能变更已有字段的映射或字段类型。变更已有字段可能导致已被索引的数据无效。

如果你需要变更在数据流备份索引中字段映射，参阅[为数据流变更映射和设置](/data_streams/change_mappings_and_settings_for_a_data_stream)。

如果你需要变更其他索引的中的字段的映射，创建一个正确映射的新索引，再把数据[重索引（reindex）](/rest_apis/document_apis/reindex)到这个索引。

为了观察如何变更一个索引的已有字段的映射，试试以下例子。

通过[创建索引](/rest_apis/index_apis/create_index) API 创建一个索引，包含名为 `user_id` 的字段，字段类型为 [`long`](/mapping/field_data_types/numeric)。

```bash
PUT /my-index-000001
{
  "mappings" : {
    "properties": {
      "user_id": {
        "type": "long"
      }
    }
  }
}
```

通过[索引](/rest_apis/document_apis/index) API 索引多个具有 `user_id` 字段值的文档。

```bash
POST /my-index-000001/_doc?refresh=wait_for
{
  "user_id" : 12345
}

POST /my-index-000001/_doc?refresh=wait_for
{
  "user_id" : 12346
}
```

为了变更 `user_id` 字段为 [`keyword`](/mapping/field_data_types/keyword) 字段类型，通过创建索引 API 来创建一个正确映射的新索引。

```bash
PUT /my-new-index-000001
{
  "mappings" : {
    "properties": {
      "user_id": {
        "type": "keyword"
      }
    }
  }
}
```

通过[重索引](/rest_apis/document_apis/reindex) API 从旧索引复制文档到新索引。

```bash
POST /_reindex
{
  "source": {
    "index": "my-index-000001"
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
```

### 重命名字段

重命名字段会让旧名字下已被索引的数据失效。换个方法，添加一个 [`alias`](/mapping/field_data_types/alias) 字段来创建一个替代的字段名。

例如，通过[创建索引](/rest_apis/index_apis/create_index) API 创建一个带有 `user_identifier` 字段的索引。

```bash
PUT /my-index-000001
{
  "mappings": {
    "properties": {
      "user_identifier": {
        "type": "keyword"
      }
    }
  }
}
```

通过更新映射 API 为已有的 `user_identifier` 字段添加一个 `user_id` 字段别名。

```bash
PUT /my-index-000001/_mapping
{
  "properties": {
    "user_id": {
      "type": "alias",
      "path": "user_identifier"
    }
  }
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-put-mapping.html)
