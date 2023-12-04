# 按查询删除 API

删除与指定查询匹配的文档。

```bash
POST /my-index-000001/_delete_by_query
{
  "query": {
    "match": {
      "user.id": "elkbee"
    }
  }
}
```

## 请求

`POST /<target>/_delete_by_query`

## 前置条件

- 如果启用了 Elasticsearch 安全功能，则必须对目标数据流、索引或别名拥有以下[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)：

    - `read`
    - `delete` 或 `write`

## 描述

您可以使用与[搜索 API](/rest_apis/search_apis/search) 相同的语法，在请求 URI 或请求正文中指定查询条件。

提交查询删除请求时，Elasticsearch 会在开始处理请求时获取数据流或索引的快照，并使用 `internal` 版本控制删除匹配的文档。如果文档在快照获取和删除操作处理之间发生变化，则会导致版本冲突，删除操作会失败。

:::note 注意
版本等于 0 的文档不能使用查询删除，因为内部版本管理不支持将 0 作为有效的版本号。
:::

在处理查询删除请求时，Elasticsearch 会按顺序执行多个搜索请求，以找到要删除的所有匹配文档。每批匹配文档都会执行一次批量删除请求。如果搜索或批量请求被拒绝，请求最多会重试 10 次，重试次数以指数形式递减。如果达到最大重试限制，处理就会停止，所有失败的请求都会在响应中返回。任何已成功完成的删除请求仍会保留，不会回滚。

你可以选择计算版本冲突，而不是通过将 `conflicts` 设置为 `proceed` 来停止和返回。请注意，如果您选择计算版本冲突，操作可能会尝试从源中删除比 `max_docs` 更多的文档，直到成功删除 `max_docs` 文档，或完成源查询中的所有文档。

### 刷新分片

一旦请求完成，指定 `refresh` 参数就会刷新所有参与查询删除的分片。这与删除 API 的刷新参数不同，后者只会刷新接收到删除请求的分片。与删除 API 不同，它不支持 `wait_for`。

### 异步运行按查询删除

如果请求中包含 `wait_for_completion=false`，Elasticsearch 会执行一些预检，启动请求，并返回一个 [task](/rest_apis/cluster_apis/task_management)，你可以用它来取消或获取任务的状态。Elasticsearch 会在 `.tasks/task/${taskId}` 文件中创建该任务的记录。完成任务后，应删除任务文档，以便 Elasticsearch 可以回收空间。

### 等待活动分片

`wait_for_active_shards` 控制在继续处理请求之前，分片必须有多少副本处于活动状态。参阅[活动分片](/rest_apis/document_apis/docs_index#活动分片)。`timeout` 控制每个写入请求等待不可用分区变为可用的时间。两者的工作方式与[批量 API](/rest_apis/document_apis/bulk) 中的工作方式完全相同。按查询删除使用滚动搜索，因此也可以指定 `scroll` 参数来控制搜索上下文的有效时间，例如：`?scroll=10m`。默认值为 5 分钟。

### 限制删除请求

要控制通过查询删除成批删除操作的速度，可以将 `requests_per_second` 设置为任意正数小数。这将为每个批次添加等待时间，以节流速度。如果将 `requests_per_second` 设置为 `-1`，则禁用节流。

节流会在批次之间使用等待时间，这样内部滚动请求的超时时间就会考虑到请求填充时间。填充时间是批次大小除以每秒请求数与写入时间之差。默认情况下，批次大小为 `1000`，因此如果将 `requests_per_second` 设置为 `500`，则批次大小为 `1000`：

```bash
target_time = 1000 / 500 per second = 2 seconds
wait_time = target_time - write_time = 2 seconds - .5 seconds = 1.5 seconds
```

由于批处理是作为单个 `_bulk` 请求发出的，因此大容量批处理会导致 Elasticsearch 创建许多请求，并在开始下一组请求之前等待。这就是“突发（bursty）”，而不是“平稳（smooth）”。

### 切片

通过查询删除支持[切片滚动](/search_your_data/the_search_api/paginate_search_results#切片滚动)以并行化删除过程。这可以提高效率，并为将请求分解成更小的部分提供方便。

将 `slices` 设置为 `auto`，可为大多数数据流和索引选择合理的数量。如果要手动切片或以其他方式调整自动切片，请记住以下几点：

- 当 `slices` 数等于索引或后备索引中的分片数时，查询性能最为高效。如果这个数字很大（例如 500），请选择一个较小的数字，因为过多的 `slices` 会降低性能。设置高于分片数量的 `slices` 通常不会提高效率，反而会增加开销。
- 删除性能与可用资源的分片数呈线性关系。

在运行时间内，查询还是删除性能占主导地位取决于重新索引的文档和集群资源。

## 路径参数

- `<target>`
    (可选，字符串） 用逗号分隔的要搜索的数据流、索引和别名列表。支持通配符 (`*`)。要搜索所有数据流或索引，请省略此参数或使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`
    (可选，布尔值）如果为 `false`，则如果任何通配符表达式、[索引别名](/aliases)或 `_all` 值仅针对丢失或关闭的索引，请求将返回错误。即使请求以其他开放索引为目标，该行为也适用。例如，如果某个索引以 `foo` 开头，但没有以 `bar` 开头的索引，则以 `foo*,bar*` 为目标的请求将返回错误。

    默认为 `true`。

- `analyzer`
    (可选，字符串） 用于查询字符串的分析器。

    该参数只能在指定 `q` 查询字符串参数时使用。

- `analyze_wildcard`
    (可选，布尔） 如果为 `true`，则分析通配符和前缀查询。默认为 `false`。

    该参数只能在指定 `q` 查询字符串参数时使用。

- `conflicts`
    (可选，字符串） 如果通过查询删除遇到版本冲突，将如何处理：终止或继续。默认为终止。

- `default_operator`
    (可选，字符串）查询字符串的默认运算符：`AND` 或 `OR`。默认为 `OR`。

    该参数只能在指定 `q` 查询字符串参数时使用。

- `df`
    (可选，字符串）查询字符串中未给出字段前缀时作为默认字段使用的字段。

    该参数只能在指定 `q` 查询字符串参数时使用。

- `expand_wildcards`
    (可选，字符串） 通配符模式可匹配的索引类型。如果请求以数据流为目标，该参数将决定通配符表达式是否匹配隐藏的数据流。支持逗号分隔值，如 `open,hidden`。有效值为

    - `all`
        匹配任何数据流或索引，包括[隐藏的](/rest_apis/api_convertion#隐藏数据流和索引)。
    - `open`
        匹配打开的非隐藏索引。也可匹配任何非隐藏数据流。
    - `closed`
        匹配封闭的非隐藏索引。也匹配任何非隐藏数据流。数据流不能关闭。
    - `hidden`
        匹配隐藏数据流和隐藏索引。必须与打开、关闭或两者结合使用。
    - `none`
        不接受通配符模式。
    
    默认为 `open`。

- `ignore_unavailable`
    (可选，布尔）如果为 `false`，则如果请求的目标索引丢失或关闭，则返回错误。默认为 `false`。

- `lenient`
    (可选，布尔）如果为 "true"，查询字符串中基于格式的查询失败（例如为数字字段提供文本）将被忽略。默认为 false。

    该参数只能在指定 `q` 查询字符串参数时使用。

- `max_docs`
    (可选，整数）要处理的最大文件数。默认为所有文档。当设置的值小于或等于 scroll_size 时，将不会使用滚动来检索操作结果。

- `preference`
    (可选，字符串） 指定应在哪个节点或分片上执行操作。默认为随机。

- `q`
    (可选，字符串） Lucene 查询字符串语法中的查询。

- `request_cache`
    (可选，布尔） 如果为 "true"，则该请求将使用请求缓存。默认为索引级设置。

- `refresh`
    (可选，布尔）如果为 `true`，Elasticsearch 会在请求完成后刷新查询中涉及删除的所有分片。默认为 `false`。

- `requests_per_second`
    (可选，整数）该请求的节流阀，单位为每秒子请求数。默认为 `-1`（无节流）。

- `routing`
    (可选，字符串） 用于将操作路由到特定分区的自定义值。

-  `scroll`
    (可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）在滚动时保留搜索上下文的时间段。参阅[滚动搜索结果](/search_your_data/paginate_search_results#滚动搜索结果)。

- `scroll_size`
    (可选，整数）支持操作的滚动请求大小。默认为 `1000`。

- `search_type`
    (可选，字符串） 搜索操作的类型。可用选项：

    - `query_then_fetch`
    - `dfs_query_then_fetch`

- `search_timeout`
    (可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）每次搜索请求的明确超时。默认为无超时。

- `slices`
    (可选，整数）该任务应划分的子任务数。默认为 1，表示任务不被分割成子任务。

- `sort`
    (可选，字符串）以逗号分隔的 `<field>:<direction>` 对列表。

- `stats`
    (可选，字符串）请求的特定 `tag`，用于记录和统计。

- `terminate_after`
    (可选，整数）每个分片要收集的最大文档数。如果查询达到此限制，Elasticsearch 会提前终止查询。Elasticsearch 会在排序前收集文档。

:::caution 重要
谨慎使用。Elasticsearch 会将此参数应用于处理请求的每个分片。在可能的情况下，让 Elasticsearch 自动执行提前终止。如果请求的目标数据流带有跨多个数据层的备份索引，则应避免指定此参数。
:::

- `timeout`
    (可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)） 每个删除请求[等待活动分片](/rest_apis/document_apis/docs_index#活动分片)的时间。默认为 `1m`（一分钟）。

- `version`
    (可选，布尔值） 如果为 true，则返回作为命中一部分的文档版本。

- `wait_for_active_shards`
    (可选，字符串） 进行操作前必须激活的分片副本数量。设置为全部或任何正整数，最多不超过索引中的分片总数（`number_of_replicas+1`）。默认值：`1`，主分区。

    参阅[活动分片](/rest_apis/document_apis/docs_index#活动分片)。

## 请求体

- `query`
    (可选，[查询对象](/query_dsl/query_dsl)）使用[Query DSL](/query_dsl/query_dsl) 指定要删除的文档。

## 响应体

JSON 响应如下：

```json
{
  "took" : 147,
  "timed_out": false,
  "total": 119,
  "deleted": 119,
  "batches": 1,
  "version_conflicts": 0,
  "noops": 0,
  "retries": {
    "bulk": 0,
    "search": 0
  },
  "throttled_millis": 0,
  "requests_per_second": -1.0,
  "throttled_until_millis": 0,
  "failures" : [ ]
}
```

- `took`
    整个操作从开始到结束的毫秒数。

- `timed_out`
    如果在执行查询删除过程中执行的任何请求超时，该标志将被设置为 true。

- `total`
    成功处理的文件数量。

- `deleted`
    成功删除的文件数量。

- `batches`
    通过查询删除拉回的滚动回复的数量。

- `version_conflicts`
    通过查询删除所遇到的版本冲突的数量。

- `noops`
    对于通过查询删除，该字段始终等于零。它的存在只是为了让通过查询删除、通过查询更新和重新索引 API 返回具有相同结构的响应。

- `retries`
    批量操作重试次数，搜索操作重试次数。

- `throttled_millis`
    请求符合 `requests_per_second` 要求所需的毫秒数。

- `requests_per_second`
    查询删除过程中每秒有效执行的请求数。

- `throttled_until_millis`
    在 `_delete_by_query` 响应中，该字段应始终等于零。它只有在使用[任务 API](/rest_apis/cluster_apis/task_management) 时才有意义，因为它表示下一次再次执行节流请求的时间（以毫秒为单位，自纪元开始），以符合 `requests_per_second` 的要求。

- `failures`
    失败数组（如果在处理过程中出现无法恢复的错误）。如果该数组非空，则请求会因为这些故障而中止。通过查询删除是使用批次实现的，任何失败都会导致整个过程中止，但当前批次中的所有失败都会被收集到数组中。可以使用冲突选项来防止重新索引在版本冲突时中止。

## 示例

删除 `my-index-000001` 数据流或索引中的所有文件：

```bash
POST my-index-000001/_delete_by_query?conflicts=proceed
{
  "query": {
    "match_all": {}
  }
}
```

从多个数据流或索引中删除文件：

```bash
POST /my-index-000001,my-index-000002/_delete_by_query
{
  "query": {
    "match_all": {}
  }
}
```

将查询删除操作限制在特定路由值的分区上：

```bash
POST my-index-000001/_delete_by_query?routing=1
{
  "query": {
    "range" : {
        "age" : {
           "gte" : 10
        }
    }
  }
}
```
默认情况下，`_delete_by_query` 使用的滚动批次为 `1000`。您可以使用 `scroll_size` URL 参数更改批次大小：

```bash
POST my-index-000001/_delete_by_query?scroll_size=5000
{
  "query": {
    "term": {
      "user.id": "kimchy"
    }
  }
}
```

使用唯一属性删除文档：

```bash
POST my-index-000001/_delete_by_query
{
  "query": {
    "term": {
      "user.id": "kimchy"
    }
  },
  "max_docs": 1
}
```

### 手动切片

通过提供切片 ID 和切片总数，手动按查询对删除进行切片：

```bash
POST my-index-000001/_delete_by_query
{
  "slice": {
    "id": 0,
    "max": 2
  },
  "query": {
    "range": {
      "http.response.bytes": {
        "lt": 2000000
      }
    }
  }
}
POST my-index-000001/_delete_by_query
{
  "slice": {
    "id": 1,
    "max": 2
  },
  "query": {
    "range": {
      "http.response.bytes": {
        "lt": 2000000
      }
    }
  }
}
```

您可以验证它是否有效：

```bash
GET _refresh
POST my-index-000001/_search?size=0&filter_path=hits.total
{
  "query": {
    "range": {
      "http.response.bytes": {
        "lt": 2000000
      }
    }
  }
}
```

这就产生了一个合理的 `total`，如下：

```json
{
  "hits": {
    "total" : {
        "value": 0,
        "relation": "eq"
    }
  }
}
```

### 使用自动切片

你也可以让逐个查询删除自动并行化，使用[切片滚动](/search_your_data/the_search_api/paginate_search_results#切片滚动)对 `_id` 进行分片。使用 `slices` 指定要使用的切片数量：

```bash
POST my-index-000001/_delete_by_query?refresh&slices=5
{
  "query": {
    "range": {
      "http.response.bytes": {
        "lt": 2000000
      }
    }
  }
}
```

您也可以验证它是否有效：

```bash
POST my-index-000001/_search?size=0&filter_path=hits.total
{
  "query": {
    "range": {
      "http.response.bytes": {
        "lt": 2000000
      }
    }
  }
}
```

这就产生一个合理的 `total`，如下：

```json
{
  "hits": {
    "total" : {
        "value": 0,
        "relation": "eq"
    }
  }
}
```

将 `slices` 设置为 `auto`，Elasticsearch 就可以选择要使用的切片数量。此设置将在一定限制内对每个分片使用一个切片。如果有多个源数据流或索引，它会根据分片数量最少的索引或后备索引来选择切片数量。

在 `_delete_by_query` 中添加 `slices` 只是将上一节中使用的手动过程自动化，创建子请求，这意味着它有一些怪异之处：

- 您可以在[任务 API](/rest_apis/cluster_apis/task_management) 中看到这些请求。这些子请求是带 `slices` 请求任务的“子”任务。
- 获取带 `slices` 请求的任务状态只包含已完成切片的状态。
- 这些子任务可单独处理，如取消和重加速。
- 重新加速 `slices` 请求会按比例重新加速未完成的子请求。
- 取消带 `slices` 的请求将取消每个子请求。
- 由于 `slices` 的特性，每个子请求不会得到完全平均的文件。所有文件都会被处理，但有些切片可能比其他分片大。预计较大的切片分布会更均匀。
- 带 `slices` 的请求的参数，如 `requests_per_second` 和 `max_docs` 等参数会按比例分配给每个子请求。结合上文关于分布不均的观点，你应该会得出结论：使用 `max_docs` 和 `slices` 可能不会导致删除的文件数正好达到 `max_docs` 文档。
- 每个子请求获得的源数据流或索引快照都略有不同，尽管这些快照都是在大致相同的时间获取的。

### 更改请求的节流

可使用 `_rethrottle` API 在运行中的删除查询中更改 `requests_per_second` 的值。加快查询速度的节流措施会立即生效，但降低查询速度的节流措施会在完成当前批次后生效，以防止滚动超时。

```bash
POST _delete_by_query/r1A2WoRbTwKZ516z6NEs5A:36619/_rethrottle?requests_per_second=-1
```

使用[任务 API](/rest_apis/cluster_apis/task_management) 获取任务 ID。将 `requests_per_second` 设置为任意正十进制值，或设置为 `-1` 以禁用节流。

### 通过查询获取删除操作的状态

使用[任务 API](/rest_apis/cluster_apis/task_management) 获取查询删除操作的状态：

```bash
GET _tasks?detailed=true&actions=*/delete/byquery
```

响应如下：

```json
{
  "nodes" : {
    "r1A2WoRbTwKZ516z6NEs5A" : {
      "name" : "r1A2WoR",
      "transport_address" : "127.0.0.1:9300",
      "host" : "127.0.0.1",
      "ip" : "127.0.0.1:9300",
      "attributes" : {
        "testattr" : "test",
        "portsfile" : "true"
      },
      "tasks" : {
        "r1A2WoRbTwKZ516z6NEs5A:36619" : {
          "node" : "r1A2WoRbTwKZ516z6NEs5A",
          "id" : 36619,
          "type" : "transport",
          "action" : "indices:data/write/delete/byquery",
          "status" : {    
            "total" : 6154,
            "updated" : 0,
            "created" : 0,
            "deleted" : 3500,
            "batches" : 36,
            "version_conflicts" : 0,
            "noops" : 0,
            "retries": 0,
            "throttled_millis": 0
          },
          "description" : ""
        }
      }
    }
  }
}
```

1. `"status"`：该对象包含实际状态。`total` 是重索引预计执行的操作总数。您可以通过添加 `updated`、 `created` 和 `deleted` 字段来估算进度。当它们的总和等于 `total` 字段时，请求将完成。

有了任务 ID，就可以直接查找任务：

```bash
GET /_tasks/r1A2WoRbTwKZ516z6NEs5A:36619
```

此 API 的优势在于它与 `wait_for_completion=false` 集成，可以透明地返回已完成任务的状态。如果任务已完成，且对其设置了 `wait_for_completion=false`，那么它将返回结果或错误字段。此功能的代价是，`wait_for_completion=false` 会在 `.tasks/task/${taskId}` 创建一个文档。您可以自行删除该文档。

### 取消查询删除操作

可以使用[任务取消 API](/rest_apis/cluster_apis/task_management) 取消任何查询删除操作：

```bash
POST _tasks/r1A2WoRbTwKZ516z6NEs5A:36619/_cancel
```

任务 ID 可通过[任务 API](/rest_apis/cluster_apis/task_management) 找到。

取消任务的过程应该很快，但可能需要几秒钟。上述任务状态 API 将继续列出通过查询删除的任务，直到该任务检查到它已被取消并自行终止。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-delete-by-query.html)
