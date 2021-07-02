# 更新索引设置

实时修改[动态索引设置](/index_modules/index_modules)。

对数据流，索引设置更改默认应用于所有备份索引。

```bash
PUT /my-index-000001/_settings
{
  "index" : {
    "number_of_replicas" : 2
  }
}
```

## 请求

`PUT /<target>/_settings`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<target>`

（可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

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

- `flat_settings`

（可选，布尔值）如果为 `true`，以平面格式返回设置。默认为 `false`。

- `ignore_unavailable`

（可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `preserve_existing`

（可选，布尔值）如果为 `true`，已有的索引设置保持不变。默认为 `false`。

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 请求体

- `settings`

（可选，[索引设置对象](/index_modules/index_modules?id=索引设置)）索引配置选项。参阅[索引设置](/index_modules/index_modules?id=索引设置)。

## 示例

### 重置索引设置

要将设置还原为默认值，请使用 `null`。示例：

```bash
PUT /my-index-000001/_settings
{
  "index" : {
    "refresh_interval" : null
  }
}
```

在[索引模块](/index_modules/index_modules)中可以找到每个索引设置的列表，这些设置可以在活动索引上动态更新。

要防止更新已有设置，可以将 `preserve_existing` 请求参数设置为 `true`。

### 批量索引使用

例如，可以使用更新索引 API 动态地更改索引，使其在大容量索引中性能更好，然后将其移动到更实时的索引状态。在开始批量索引之前，请使用：

```bash
PUT /my-index-000001/_settings
{
  "index" : {
    "refresh_interval" : "-1"
  }
}
```

（另一个优化选项是在没有任何副本的情况下启动索引，然后才添加副本，但这实际上取决于用例）。

然后，一旦完成批量索引，就可以更新设置（例如，返回到默认值）：

```bash
PUT /my-index-000001/_settings
{
  "index" : {
    "refresh_interval" : "1s"
  }
}
```

并且，应调用强制合并：

```bash
POST /my-index-000001/_forcemerge?max_num_segments=5
```

### 更新索引分析

只能在关闭的索引上定义新的分析器。

要添加分析器，必须关闭索引，定义分析器，然后重新打开索引。

?> 你不能关闭数据流的写索引。
要为数据流的写入索引和将来的备份索引更新分析器，请在[流使用的索引模板](data_streams/set_up_a_data_stream?id=第三步_创建一个索引模板)中更新分析器。然后[翻转数据流](/data_streams/use_a_data_stream?id=手动翻转数据流)，将新的分析器应用于流的写索引和未来的备份索引。这会影响滚动更新后添加到流中的搜索和任何新数据。但是，它不会影响数据流的支持索引或其现有数据。
要更改现有备份索引的分析器，必须创建新的数据流并将数据重新索引到其中。参阅[使用重索引更改映射或设置](/data_streams/change_mappings_and_settings_for_a_data_stream?id=使用重索引更改映射或设置)。

例如，以下命令将为索引 `my-index-000001` 添加内容分析器：

```bash
POST /my-index-000001/_close?wait_for_active_shards=0

PUT /my-index-000001/_settings
{
  "analysis" : {
    "analyzer":{
      "content":{
        "type":"custom",
        "tokenizer":"whitespace"
      }
    }
  }
}

POST /my-index-000001/_open
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-update-settings.html)
