# 按查询更新 API

更新与指定查询匹配的文档。如果未指定查询，则对数据流或索引中的每个文档执行更新，而不修改源文件，这对获取映射变化非常有用。

```bash
POST my-index-000001/_update_by_query?conflicts=proceed
```

## 请求

`POST /<target>/_update_by_query`

## 前置条件

- 如果启用了 Elasticsearch 安全功能，则必须拥有目标索引或索引别名的以下 [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)：

- `read`
- `index` 或 `write`

## 描述

您可以使用与搜索 API 相同的语法，在请求 URI 或请求正文中指定查询条件。

当你提交查询更新请求时，Elasticsearch 会在开始处理请求时获取数据流或索引的快照，并使用 `internal` 版本更新匹配的文档。当版本匹配时，文档就会更新，版本号也会递增。如果文档在快照拍摄和更新操作处理之间发生变化，则会导致版本冲突，操作失败。您可以选择计算版本冲突，而不是通过设置 `conflicts` 为 `proceed` 来停止和返回。请注意，如果您选择计算版本冲突，操作可能会尝试更新超过 `max_docs` 的源文档，直到它成功更新了 `max_docs` 文档，或完成了源查询中的所有文档。

:::note 提示
版本等于 0 的文档无法使用查询更新进行更新，因为 `internal` 版本管理不支持将 0 作为有效的版本号。
:::

在处理查询更新请求时，Elasticsearch 会按顺序执行多个搜索请求，以找到所有匹配文档。每一批匹配文档都会执行一次批量更新请求。任何查询或更新失败都会导致查询更新请求失败，失败信息会显示在响应中。任何成功完成的更新请求仍然有效，不会回滚。

### 刷新分片

一旦请求完成，指定 `refresh` 参数就会刷新所有分片。这与更新 API 的 `refresh` 参数不同，后者只会刷新收到请求的分片。与更新 API 不同的是，它不支持 `wait_for`。

### 异步运行查询更新

如果请求中包含 `wait_for_completion=false`，Elasticsearch 会执行一些预检检查，启动请求，并返回一个[任务](/res_apis/cluster_apis/task_management)，你可以用它来取消或获取任务的状态。Elasticsearch 会在 `.tasks/task/${taskId}` 中创建该任务的文档记录。

### 等待活动分片

`wait_for_active_shards`控制的是，在继续处理请求之前，必须有多少份分片处于活动状态。参阅[活动分片](/rest_apis/document_apis/docs_index#活动分片)了解详情。`timeout` 控制每个写入请求等待不可用的分区变为可用的时间。两者的工作方式与[批量 API](/rest_apis/document_apis/bulk) 中的工作方式完全相同。查询更新使用滚动搜索，因此也可以指定 `scroll` 参数来控制搜索上下文的有效时间，例如：`?scroll=10m`。默认值为 5 分钟。

### 限制更新请求

要控制通过查询进行更新操作的速度，可以将 `requests_per_second` 设置为任意正数小数。这会为每个批次添加等待时间，以控制更新速率。如果将  `requests_per_second` 设置为 `-1`，则禁用节流。

节流会在批次之间使用等待时间，这样内部滚动请求的超时时间就会考虑到请求填充时间。填充时间是批次大小除以 `requests_per_second` 与写入时间之差。默认情况下，批次大小为 1000，因此如果将 `requests_per_second` 设置为 `500`，则批次大小为 `1000`：

```bash
target_time = 1000 / 500 per second = 2 seconds
wait_time = target_time - write_time = 2 seconds - .5 seconds = 1.5 seconds
```

由于批处理是以单个 `_bulk` 请求的形式发出的，因此大容量的批处理会导致 Elasticsearch 创建许多请求，并在开始下一组请求之前等待。这就是“突发（bursty）”而非“平稳（smooth）”。

### 切片

查询更新支持[分片滚动](/search_your_data/paginate_search_results)，以并行处理更新过程。这不仅能提高效率，还能方便地将请求分解成更小的部分。

将 `slices` 设置为 `auto`，可为大多数数据流和索引选择合理的数量。如果要手动分片或以其他方式调整自动分片，请记住以下几点：
- 当 `slices` 等于索引或后备索引中的分片数时，查询性能最为高效。如果这个数字很大（例如 500），请选择一个较小的数字，因为过多的分片会降低性能。设置高于 `slices` 的分片通常不会提高效率，反而会增加开销。
- 更新性能与可用资源的分片数呈线性关系。

在运行时间内，查询还是更新性能占主导地位取决于重新索引的文档和集群资源。

## 路径参数

- `allow_no_indices`
    (可选，布尔值）如果为 `false`，则如果任何通配符表达式、[索引别名](/aliases)或 `_all` 值仅针对丢失或关闭的索引，请求将返回错误。即使请求以其他开放索引为目标，该行为也适用。例如，如果某个索引以 `foo` 开头，但没有以 `bar` 开头的索引，则以 `foo*,bar*` 为目标的请求将返回错误。

    默认为 `true`。

- `analyzer`
    (可选，字符串） 用于查询字符串的分析器。

    该参数只能在指定 `q` 查询字符串参数时使用。

- `analyze_wildcard`
    (可选，布尔值） 如果为 `true`，则分析通配符和前缀查询。默认为 `false`。

    该参数只能在指定 `q` 查询字符串参数时使用。

- `conflicts`
    (可选，字符串） 如果查询更新遇到版本冲突，将如何处理：`abort` 或 `proceed`。默认为 `abort`。

- `default_operator`
    (可选，字符串）查询字符串的默认运算符：`AND` 或 `OR`。默认为 `OR`。

    该参数只能在指定 `q` 查询字符串参数时使用。

- `df`
    (可选，字符串）查询字符串中未给出字段前缀时作为默认字段使用的字段。

    该参数只能在指定 `q` 查询字符串参数时使用。

- `expand_wildcards`
    (可选，字符串） 通配符模式可匹配的索引类型。如果请求以数据流为目标，该参数将决定通配符表达式是否匹配隐藏的数据流。支持逗号分隔值，如 `open,hidden`。有效值为

    - `all`
        匹配任何数据流或索引，包括[隐藏的](/rest_apis/api_conventions#隐藏的数据和索引)数据流或索引。
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
    (可选，布尔值）如果为 `false`，则如果请求的目标索引丢失或关闭，则返回错误。默认为 `false`。

- `lenient`
    (可选，布尔值）如果为 `true`，查询字符串中基于格式的查询失败（例如为数字字段提供文本）将被忽略。默认为 `false`。

    该参数只能在指定 `q` 查询字符串参数时使用。

- `max_docs`
    (可选，整数）要处理的最大文件数。默认为所有文档。当设置的值小于或等于 `scroll_size` 时，将不会使用滚动来检索操作结果。

- `pipeline`
    (可选，字符串）用于预处理传入文档的管道 ID。如果索引指定了默认摄取管道，则将该值设为 `_none` 会禁用此请求的默认摄取管道。如果配置了最终管道，无论此参数的值如何，它都将始终运行。

- `preference`
    (可选，字符串） 指定应在哪个节点或分片上执行操作。默认为随机。

- `q`
    (可选，字符串） Lucene 查询字符串语法中的查询。

- `request_cache`
    (可选，布尔值） 如果为 `true`，则该请求将使用请求缓存。默认为索引级设置。

- `refresh`
    (可选，布尔值）如果为 `true`，Elasticsearch 会刷新受影响的分片，使操作在搜索中可见。默认为 `false`。

- `requests_per_second`
    (可选，整数）该请求的节流阀，单位为每秒子请求数。默认为 `-1`（无节流）。

- `routing`
    (可选，字符串） 用于将操作路由到特定分区的自定义值。

- `scroll`
    (可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）在滚动时保留[搜索上下文](/search_your_data/paginate_search_results#保持搜索上下文处于活动)的时间段。参阅[滚动搜索结果](/rest_apis/api_convention/common_options#时间单位)）在滚动时保留[搜索上下文](/search_your_data/paginate_search_results#滚动搜索结果)。

- `scroll_size`
    (可选，整数）支持操作的滚动请求大小。默认为 1000。

- `search_type`
    (可选，字符串） 搜索操作的类型。可用选项：
        - `query_then_fetch`
        - `dfs_query_then_fetch`

- `search_timeout`
    (可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）每次搜索请求的明确超时。默认为无超时。

- `slices`
    (可选，整数）该任务应划分的子任务数。默认为  `1`，表示任务不被分割成子任务。

- `sort`
    (可选，字符串）以逗号分隔的 `<field>:<direction>` 对列表。

- `stats`
    (可选，字符串）请求的特定 `tag`，用于记录和统计。

- `terminate_after`
    (可选，整数）每个分片要收集的最大文档数。如果查询达到此限制，Elasticsearch 会提前终止查询。Elasticsearch 会在排序前收集文档。

    :::danger 重要
    谨慎使用。Elasticsearch 会将此参数应用于处理请求的每个分片。在可能的情况下，让 Elasticsearch 自动执行提前终止。如果请求的目标数据流带有跨多个数据层的备份索引，则应避免指定此参数。
    :::

- `timeout`
    (可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)） 每个更新请求等待以下操作的周期：

        - 动态映射更新
        - [等待活动分片](/rest_apis/document_apis/docs_index#活动分片)

    默认为 `1m`（一分钟）。这保证 Elasticsearch 在失败前至少等待超时时间。实际等待时间可能会更长，尤其是发生多次等待时。

- `version`
    (可选，布尔） 如果为 `true`，则返回作为命中一部分的文档版本。

- `wait_for_active_shards`
    (可选，字符串） 进行操作前必须激活的分片副本数量。设置为 `all` 或任何正整数，最多不超过索引中的分片总数（`number_of_replicas+1`）。默认值：`1`，主分区。

    参阅[活动分片](/rest_apis/document_apis/docs_index#活动分片)。

## 请求体

- `q`
    (可选，[查询对象](/query_dsl)）指定要使用[查询 DSL](/query_dsl) 更新的文档。

## 响应体

- `took`
    整个操作从开始到结束的毫秒数。
- `timed_out`
    如果在通过查询执行更新期间执行的任何请求超时，该标志将被设置为 `true`。
- `total`
    成功处理的文件数量。
- `updated`
    成功更新的文件数量。
- `deleted`
    成功删除的文件数量。
- `batches`
    通过查询更新拉回的滚动响应数。
- `version_conflicts`
    查询更新所遇到的版本冲突的数量。
- `noops`
    由于查询更新使用的脚本返回的 `ctx.op` 值为 noop 而被忽略的文档数量。
- `retries`
    批量操作重试次数，搜索操作重试次数。
- `throttled_millis`
    请求符合 `requests_per_second` 要求所需的毫秒数。
- `requests_per_second`
    查询更新期间每秒有效执行的请求数。
- `throttled_until_millis`
    在 `_update_by_query` 响应中，该字段应始终等于零。它只有在使用[任务 API](#异步运行查询更新) 时才有意义，因为它表示下一次再次执行节流请求的时间（以毫秒为单位，自纪元起算），以符合 `requests_per_second` 的要求。
- `failures`
    失败数组（如果在处理过程中出现无法恢复的错误）。如果该数组为非空，则请求会因为这些错误而中止。查询更新是通过批次实现的。任何故障都会导致整个流程中止，但当前批次中的所有故障都会被收集到数组中。可以使用 `conflicts` 选项来防止重新索引在版本冲突时中止。

## 示例

`_update_by_query` 的最简单用法是在不更改源的情况下对数据流或索引中的每个文档执行更新。这对于[获取新属性](#获取新属性)或其他在线映射变化非常有用。
要更新选定的文档，请在请求正文中指定一个查询：

要更新选定的文档，请在请求正文中指定一个查询：

```bash
POST my-index-000001/_update_by_query?conflicts=proceed
{
  "query": { 
    "term": {
      "user.id": "kimchy"
    }
  }
}
```

- `"query": {`：查询必须作为值传递给查询键，传递方式与[搜索 API](/rest_apis/search_apis/search) 相同。使用 `q` 参数的方法也与搜索 API 相同。

更新多个数据流或索引中的文件：

```bash
POST my-index-000001,my-index-000002/_update_by_query
```

通过查询操作将更新限制在具有特定路由值的分区上：

```bash
POST my-index-000001/_update_by_query?routing=1
```

默认情况下，通过查询更新使用的滚动批次为 1000。您可以使用 `scroll_size` 参数更改批次大小：

```bash
POST my-index-000001/_update_by_query?scroll_size=100
```

使用唯一属性更新文档。

```bash
POST my-index-000001/_update_by_query
{
  "query": {
    "term": {
      "user.id": "kimchy"
    }
  },
  "max_docs": 1
}
```
### 更新文档源

查询更新支持更新文档源的脚本。例如，以下请求会增加 `my-index-000001` 中 `user.id` 为 `kimchy` 的所有文档的计数字段：

```bash
POST my-index-000001/_update_by_query
{
  "script": {
    "source": "ctx._source.count++",
    "lang": "painless"
  },
  "query": {
    "term": {
      "user.id": "kimchy"
    }
  }
}
```

请注意，本例中没有指定 `conflicts=proceed`。在这种情况下，版本冲突应停止进程，以便处理故障。

与[更新 API](/rest_apis/document_apis/docs_update) 一样，您可以设置 `ctx.op` 来更改执行的操作：

`noop`：如果脚本认为不需要进行任何更改，则设置 `ctx.op = "noop"`。通过查询更新操作会跳过更新文档，并递增 `noop` 计数器。

`delete`：如果脚本决定删除文档，则设置 `ctx.op = "delete"`。通过查询更新操作会删除文档并递增已删除计数器。

查询更新仅支持 `update`、`noop` 和 `delete`。将 `ctx.op` 设置为其他任何值都会导致错误。在 ctx 中设置任何其他字段都会出错。此 API 只允许修改匹配文档的源文件，不能移动它们。

### 使用录入管道更新文档

通过查询更新可以通过指定管道使用[摄取管道](/ingest_pipelines)功能：

```bash
PUT _ingest/pipeline/set-foo
{
  "description" : "sets foo",
  "processors" : [ {
      "set" : {
        "field": "foo",
        "value": "bar"
      }
  } ]
}
POST my-index-000001/_update_by_query?pipeline=set-foo
```

#### 通过查询操作获取更新状态编辑

您可以使用[任务 API](/rest_apis/cluster_apis/task_management) 通过查询请求获取所有正在运行的更新的状态：

```bash
GET _tasks?detailed=true&actions=*byquery
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
          "action" : "indices:data/write/update/byquery",
          "status" : {    
            "total" : 6154,
            "updated" : 3500,
            "created" : 0,
            "deleted" : 0,
            "batches" : 4,
            "version_conflicts" : 0,
            "noops" : 0,
            "retries": {
              "bulk": 0,
              "search": 0
            },
            "throttled_millis": 0
          },
          "description" : ""
        }
      }
    }
  }
}
```

- 该对象包含实际状态。`total` 是 reindex 预计执行的操作总数。您可以通过添加 `updated`、 `created` 和 `deleted` 字段来估算进度。当它们的总和等于 `total` 字段时，请求就会完成。

使用任务 ID 可以直接查找任务。下面的示例检索了任务 r1A2WoRbTwKZ516z6NEs5A:36619 的信息：

```bash
GET /_tasks/r1A2WoRbTwKZ516z6NEs5A:36619
```

此 API 的优势在于它与 `wait_for_completion=false` 集成，可以透明地返回已完成任务的状态。如果任务已完成，且对其设置了 `wait_for_completion=false`，则会返回 `results` 或 `error ` 字段。此功能的代价是，`wait_for_completion=false` 会在 `.tasks/task/${taskId}` 创建一个文档。您可以自行删除该文档。

#### 取消查询更新操作

可以使用[任务取消 API](/res_apis/cluster_apis/task_management) 取消任何查询更新操作：

```bash
POST _tasks/r1A2WoRbTwKZ516z6NEs5A:36619/_cancel
```

任务 ID 可通过[任务 API](/res_apis/cluster_apis/task_management) 找到。

任务取消应该很快，但可能需要几秒钟。上面的任务状态 API 将继续列出查询任务的更新，直到该任务检查到它已被取消并自行终止。

#### 更改请求的节流

可以使用 `_rethrottle` API 在运行中的查询更新任务上更改 `requests_per_second` 的值：

```bash
POST _update_by_query/r1A2WoRbTwKZ516z6NEs5A:36619/_rethrottle?requests_per_second=-1
```

任务 ID 可通过[任务 API](/res_apis/cluster_apis/task_management) 找到。

就像在 `_update_by_query` API 上设置一样，`requests_per_second` 可以是 `-1` 表示禁用节流，也可以是 1.7 或 12 等任何十进制数表示节流到该水平。加快查询速度的重节流会立即生效，但减慢查询速度的重节流会在完成当前批次后生效。这样可以防止滚动超时。

#### 手动切片

通过向每个请求提供分片 ID 和分片总数，手动对查询更新进行分片：

```bash
POST my-index-000001/_update_by_query
{
  "slice": {
    "id": 0,
    "max": 2
  },
  "script": {
    "source": "ctx._source['extra'] = 'test'"
  }
}
POST my-index-000001/_update_by_query
{
  "slice": {
    "id": 1,
    "max": 2
  },
  "script": {
    "source": "ctx._source['extra'] = 'test'"
  }
}
```

您可以验证它是否有效：

```bash
GET _refresh
POST my-index-000001/_search?size=0&q=extra:test&filter_path=hits.total
```

这就产生了像这样一个合理的总数：

```json
{
  "hits": {
    "total": {
        "value": 120,
        "relation": "eq"
    }
  }
}
```

#### 使用自动切片

还可以使用[分片滚动](/search_your_data/pagenate_search_results#分片滚动)对 `_id` 进行分片，让查询更新自动并行化。使用 `slices` 指定要使用的分片数：

```bash
POST my-index-000001/_update_by_query?refresh&slices=5
{
  "script": {
    "source": "ctx._source['extra'] = 'test'"
  }
}
```

您也可以验证它是否有效：

```bash
POST my-index-000001/_search?size=0&q=extra:test&filter_path=hits.total
```

这就产生了像这样一个合理的 `total`：

```json
{
  "hits": {
    "total": {
        "value": 120,
        "relation": "eq"
    }
  }
}
```

将 `slices` 设置为 `auto`，Elasticsearch 就可以选择要使用的分片数量。此设置将在一定限制内对每个分片使用一个分片。如果有多个源数据流或索引，它会根据分片数量最少的索引或后备索引来选择分片数量。

在 `_update_by_query` 中添加 `slices` 只是将上一节中使用的手动过程自动化，创建子请求，这意味着它有一些怪异之处：

- 您可以在任务 API 中看到这些请求。这些子请求是带 `slices` 请求任务的 “子”任务。
- 获取带 `slices` 请求的任务状态只包含已完成分片的状态。
- 这些子任务可单独处理，如取消和重加速。
- 重新加速 `slices` 请求会按比例重新加速未完成的子请求。
- 使用 `slices` 取消请求将取消每个子请求。
- 由于 `slices` 的特性，每个子请求不会得到完全平均的文件。所有文件都会被处理，但有些分片可能比其他分片大。预计较大的分片分布会更均匀。
- `slices` 请求的 `requests_per_second` 和 `max_docs` 等参数会按比例分配给每个子请求。结合上文关于分布不均的观点，你应该得出结论：使用 `max_docs` 和 `slices` 可能不会导致更新的文档数正好达到 `max_docs` 文档。
- 每个子请求获取的源数据流或索引快照都略有不同，尽管这些快照都是在大致相同的时间获取的。

#### 获取新属性

假设你创建了一个没有动态映射的索引，将数据填入其中，然后添加一个映射值，从数据中拾取更多的字段：

```bash
PUT test
{
  "mappings": {
    "dynamic": false,   
    "properties": {
      "text": {"type": "text"}
    }
  }
}

POST test/_doc?refresh
{
  "text": "words words",
  "flag": "bar"
}
POST test/_doc?refresh
{
  "text": "words words",
  "flag": "foo"
}
PUT test/_mapping   
{
  "properties": {
    "text": {"type": "text"},
    "flag": {"type": "text", "analyzer": "keyword"}
  }
}
```

1. `"dynamic": false,`：这意味着新字段不会被编入索引，只会存储在 `_source` 中。
2. `PUT test/_mapping`：这将更新映射以添加新的 `flag` 字段。要使用新字段，必须重新索引所有包含该字段的文档。

搜索数据什么也找不到：

```bash
POST test/_search?filter_path=hits.total
{
  "query": {
    "match": {
      "flag": "foo"
    }
  }
}
```

```json
{
  "hits" : {
    "total": {
        "value": 0,
        "relation": "eq"
    }
  }
}
```

但您可以发出 `_update_by_query` 请求来获取新的映射：

```bash
POST test/_update_by_query?refresh&conflicts=proceed
POST test/_search?filter_path=hits.total
{
  "query": {
    "match": {
      "flag": "foo"
    }
  }
}
```

```json
{
  "hits" : {
    "total": {
        "value": 1,
        "relation": "eq"
    }
  }
}
```

在多字段中添加字段时，也可以执行完全相同的操作。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-update-by-query.html)
