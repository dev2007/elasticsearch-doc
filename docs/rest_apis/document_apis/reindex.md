# 重索引 API

将文件从源文件复制到目标文件。

源文件可以是任何现有索引、别名或数据流。目的地必须与源不同。例如，不能将数据流重新编入索引。

:::danger 重要
重新索引要求 [_source](/mapping/metadata_fields/_source) 启用源文件中的所有文档。

在调用 `_reindex` 之前，应根据需要对目标进行配置。重索引不会复制源文件或其关联模板中的设置。

映射、分片计数、副本等必须提前配置。
:::

```bash
POST _reindex
{
  "source": {
    "index": "my-index-000001"
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
```

## 请求

`POST /_reindex`

## 前置条件

- 如果启用了 Elasticsearch 安全功能，则必须拥有以下安全权限：
    - 用于源数据流、索引或索引别名的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。
     - 用于目标数据流、索引或索引别名的 `write` 索引权限。
     - 要通过重索引 API 请求自动创建数据流或索引，您必须拥有目标数据流、索引或别名的 `auto_configure`、`create_index` 或 `manage` 索引权限。
     - 如果从远程集群重索引，则 `source.remote.user` 必须拥有 `monitor` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges.html#集群权限)和 `read` 源数据流、索引或别名的索引权限。
- 如果从远程集群重索引，必须在 `elasticsearch.yml` 的 `reindex.remote.whitelist` 设置中明确允许远程主机。参阅[从远程重索引](#从远程重索引)。
- 自动创建数据流需要启用数据流的匹配索引模板。参阅[设置数据流](/data_streams/set_up_a_data_stream)。

## 描述

从源索引中提取[文档源](/mapping/metadata_fields/_source)，并将文档索引到目标索引中。你可以将所有文档复制到目标索引，也可以重新索引文档的一个子集。

与 [_update_by_query](/rest_apis/document_apis/update_by_query) 一样，`_reindex` 也会获取源的快照，但其目标必须**不同**，因此不太可能发生版本冲突。`dest` 元素可以像索引 API 一样进行配置，以控制乐观并发控制。省略 `version_type` 或将其设置为 `internal` 会导致 Elasticsearch 盲目地将文档转储到目标中，并覆盖任何碰巧具有相同 ID 的文档。

将 `version_type` 设置为 `external` 会导致 Elasticsearch 保留源文件中的版本，创建任何丢失的文档，并更新目标文件中版本比源文件中版本旧的文档。

将 `op_type` 设置为 `create` 会导致 `_reindex` 只创建目标中缺失的文档。所有现有文档都将导致版本冲突。

:::danger 重要
由于数据流是[仅附加](/data_streams.html#仅追加-多数)的，因此对目标数据流的任何重新索引请求的 `op_type` 都必须是 `create`。重新索引只能向目标数据流添加新文档。它不能更新目标数据流中的现有文档。
:::

默认情况下，版本冲突会中止 `_reindex` 进程。要在存在冲突的情况下继续重新索引，可将“`conflicts`”请求正文参数设置为 `proceed`。在这种情况下，响应将包括遇到的版本冲突的计数。请注意，其他错误类型的处理不受“`conflicts`”参数的影响。此外，如果选择对版本冲突进行计数，操作可能会尝试重新索引超过 `max_docs` 的源文档，直到成功将 `max_docs` 文档索引到目标中，或者完成源查询中的所有文档。

### 异步运行重索引

如果请求中包含 `wait_for_completion=false`，Elasticsearch 会执行一些预检检查，启动请求，并返回一个[任务](/rest_apis/cluster_apis/task_management)，你可以用它来取消或获取任务的状态。Elasticsearch 会在 `_tasks/<task_id>` 中以文档形式创建该任务的记录。

### 从多个来源重新索引

如果有许多源要重新索引，通常最好一次一个地重新索引，而不是使用 glob 模式来获取多个源。这样，如果出现错误，就可以删除部分完成的源代码，重新开始。这也使得并行处理变得相当简单：拆分要重新索引的源列表，然后并行运行每个列表。

一次性的 bash 脚本似乎就能很好地解决这个问题：

```bash
for index in i1 i2 i3 i4 i5; do
  curl -HContent-Type:application/json -XPOST localhost:9200/_reindex?pretty -d'{
    "source": {
      "index": "'$index'"
    },
    "dest": {
      "index": "'$index'-reindexed"
    }
  }'
done
```

### 节流

将 `requests_per_second` 设置为任意十进制正数（`1.4`、`6`、`1000` 等），以控制 `_reindex` 发布成批索引操作的速度。通过为每个批次添加等待时间来节流请求。要禁用节流，请将 `requests_per_second` 设置为 `-1`。

节流是通过在批次之间等待来实现的，这样 `_reindex` 内部使用的 `scroll` 就可以获得一个考虑了填充时间的超时。填充时间是批次大小除以每秒请求数与写入时间之差。默认情况下，批量大小为 `1000`，因此，如果将 `requests_per_second` 设置为 `500`，如下：

```bash
target_time = 1000 / 500 per second = 2 seconds
wait_time = target_time - write_time = 2 seconds - .5 seconds = 1.5 seconds
```

由于批处理是以单个 `_bulk` 请求的形式发出的，因此大容量的批处理会导致 Elasticsearch 创建许多请求，然后等待一段时间再开始下一组请求。这就是“突发”而非“平滑”。

### 重新节流

可以使用 `_rethrottle` API 在运行中的重索引上更改 `requests_per_second` 的值：

```bash
POST _reindex/r1A2WoRbTwKZ516z6NEs5A:36619/_rethrottle?requests_per_second=-1
```

任务 ID 可通过任务 API 找到。

就像在重索引 API 上设置一样，`request_per_second` 可以是 `-1` 表示禁用节流，也可以是 `1.7` 或 `12` 等任何十进制数表示节流到该水平。加快查询速度的节流立即生效，但减慢查询速度的节流将在完成当前批次后生效。这样可以防止滚动超时。

### 切片

重索引支持分片滚动，以并行处理重新索引过程。这种并行化可以提高效率，并为将请求分解成更小的部分提供方便。

:::tip 注意
从远程群集重索引不支持手动或自动分片。
:::

#### 手动切片

通过为每个请求提供分片 ID 和分片总数，手动对重新索引请求进行分片：

```bash
POST _reindex
{
  "source": {
    "index": "my-index-000001",
    "slice": {
      "id": 0,
      "max": 2
    }
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
POST _reindex
{
  "source": {
    "index": "my-index-000001",
    "slice": {
      "id": 1,
      "max": 2
    }
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
```

你可以通过以下方式验证其工作原理：

```bash
GET _refresh
POST my-new-index-000001/_search?size=0&filter_path=hits.total
```

这样就得出了这样一个合理的总数：

```json
{
  "hits": {
    "total" : {
        "value": 120,
        "relation": "eq"
    }
  }
}
```

#### 自动切片

你也可以使用[切片滚动](/search_your_data/paginate_search_results.html#切片滚动) 对 `_id` 进行切分，让 `_reindex` 自动并行化。使用分片指定要使用的分片数量：

```bash
POST _reindex?slices=5&refresh
{
  "source": {
    "index": "my-index-000001"
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
```

你还可以通过以下方式验证其工作原理：

```bash
POST my-new-index-000001/_search?size=0&filter_path=hits.total
```

这样就得出了这样一个合理的总数：

```json
{
  "hits": {
    "total" : {
        "value": 120,
        "relation": "eq"
    }
  }
}
```

将 `slices` 设置为 `auto`，Elasticsearch 就可以选择要使用的切片数量。此设置将在一定限制内对每个分片使用一个切片。如果有多个来源，它会根据分片数量最少的索引或后备索引来选择切片数量。

在 `_reindex` 中添加切片只是将上一节中使用的手动流程自动化，创建子请求，这意味着它有一些怪异之处：
- 您可以在任务 API 中看到这些请求。这些子请求是带 `slices` 请求任务的“子”任务。
- 获取带 `slices` 请求的任务状态只包含已完成切片的状态。
- 这些子任务可单独处理，如取消和重新节流。
- 重新节流 `slices` 请求会按比例重新加速未完成的子请求。
- 取消 `slices` 请求将取消每个子请求。
- 由于 `slices` 的特性，每个子请求不会得到完全平均的文件。所有文件都会被处理，但有些切片可能比其他切片大。预计较大的切片分布会更均匀。
- `slices` 请求的 `requests_per_second` 和 `max_docs` 等参数会按比例分配给每个子请求。结合上面关于分布不均的观点，你应该得出结论：使用带 `slices` 的 `max_docs` 可能不会导致精确的 `max_docs` 文档被重索引。
- 每个子请求获得的源快照略有不同，尽管这些快照都是在大致相同的时间获取的。


#### 选择切片数量

如果是自动切片，将 `slices` 设置为 `auto` 会为大多数索引选择合理的切片数。如果手动分片或以其他方式调整自动分片，请使用以下指南。

当切片数等于索引中的分片数时，查询性能最为高效。如果这个数字很大（如 `500`），请选择较低的数字，因为过多的 `slices` 会影响性能。将切片数设置得高于分片数一般不会提高效率，反而会增加开销。

索引性能与可用资源的 `slices` 数量成线性关系。

在运行时间内，查询性能还是索引性能占主导地位取决于重新索引的文档和集群资源。

### 重新索引路由

默认情况下，如果 `_reindex` 看到一个带有路由的文档，那么除非脚本更改，否则路由将被保留。你可以在目标请求中设置路由来更改路由：

- `keep`
    将为每个匹配发送的批量请求上的路由设置为匹配上的路由。这是默认值。
- `discard`
    将为每个匹配发送的批量请求的路由设置为空。
- `=<文本>`
    将为每个匹配发送的批量请求的路由设置为 = 后面的所有文本。

例如，你可以使用以下请求将 `source` 的公司名称为 `cat` 的所有文件复制到 `dest`，并将路由设置为 `cat`。

```bash
POST _reindex
{
  "source": {
    "index": "source",
    "query": {
      "match": {
        "company": "cat"
      }
    }
  },
  "dest": {
    "index": "dest",
    "routing": "=cat"
  }
}
```

默认情况下，`_reindex` 使用的滚动批次为 `1000`。您可以使用 `source` 元素中的 `size` 字段更改批次大小：

```bash
POST _reindex
{
  "source": {
    "index": "source",
    "size": 100
  },
  "dest": {
    "index": "dest",
    "routing": "=cat"
  }
}
```

### 使用摄取管道重索引

重索引也可以使用[摄取管道](/ingest_pipelines)功能，方法是像这样指定一个 `pipeline`：

```bash
POST _reindex
{
  "source": {
    "index": "source"
  },
  "dest": {
    "index": "dest",
    "pipeline": "some_ingest_pipeline"
  }
}
```

## 查询参数

- `refresh`

    (可选，布尔值）如果为 `true`，Elasticsearch 会刷新受影响的分片，使操作在搜索中可见。默认为 `false`。

- `timeout`

    (可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)） 每个更新请求等待以下操作的周期：

    - [自动创建索引](/rest_apis/document_apis/docs_index#自动创建数据流和索引)
    - [动态映射](/mapping/dynamic_mapping)更新
    - [等待活动分片](/rest_apis/document_apis/docs_index#活动分片)

    默认为 `1m`（一分钟）。这保证 Elasticsearch 在失败前至少等待超时时间。实际等待时间可能会更长，尤其是发生多次等待时。

- `wait_for_active_shards`
    (可选，字符串） 进行操作前必须激活的分片副本数量。设置为 `all` 或任何正整数，最多不超过索引中的分片总数（`number_of_replicas+1`）。默认值：`1`，主分区。

    参阅[活动分片](/rest_apis/document_apis/docs_index#活动分片)。

- `wait_for_completion`

    (可选，布尔） 如果为 `true`，则请求会阻塞，直到操作完成。默认为 `true`。

- `requests_per_second`

    (可选，整数）该请求的节流阀，单位为每秒子请求数。默认为 `-1`（无节流）。

- `require_alias`

    （可选，布尔值）如果为 `true`，则目标必须是[索引别名](/aliases)。默认为`false`。

- `scroll`

  （可选，[时间值](/rest_apis/api_convention/common_options#时间单位)）指定滚动搜索时索引的一致视图应保持多长时间。

- `slices`

    (可选，整数）该任务应划分的子任务数。默认为  `1`，表示任务不被分割成子任务。

- `max_docs`

    (可选，整数）要处理的最大文件数。默认为所有文档。当设置的值小于或等于 `scroll_size` 时，将不会使用滚动来检索操作结果。

## 请求体

- `conflicts`

    (可选，字符串） 如果查询更新遇到版本冲突，将如何处理：`abort` 或 `proceed`。默认为 `abort`。

- `max_docs`

    (可选，整数）要重新索引的最大文档数。如果 `conflicts` 等于 `proceed`，重索引会尝试重新索引比 `max_docs` 更多的源文档，直到它成功地将 `max_docs` 文档索引到目标中，或索引完源查询中的所有文档。

- `source`

    - `index`

        (必填，字符串）要复制的数据流、索引或别名的名称。也接受逗号分隔的列表，以便从多个来源重新索引。

    - `query`
    
        (可选，[查询对象](/query_dsl/query_dsl)）使用 Query DSL 指定要删除的文档。

    - `remote`

        - `host`

            (可选，字符串）要从 Elasticsearch 编制索引的远程实例的 URL。从远程建立索引时必须使用。

        - `username`

            (可选，字符串） 用于远程主机身份验证的用户名。

        - `password`

            (可选，字符串） 用于远程主机身份验证的密码。

        - `socket_timeout`

            (可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)） 远程套接字读取超时。默认为 30 秒。

        - `connect_timeout`

            (可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)） 远程连接超时。默认为 30 秒。

        - `headers`

            (可选，对象）包含请求标头的对象。

    - `size`

        （可选，整数） 每个批次要索引的文档数。在远程索引时使用，以确保批次适合堆上缓冲区（默认最大为 100 MB）。

    - `slice`

        - `id`

            (可选，整数）用于[手动切片](#手动切片)的切片 ID。

        - `max`

            (可选，整数）切片总数。

    - `sort`

      (可选，列表）以逗号分隔的 `<字段>:<方向>` 对列表，索引前按其排序。与 `max_docs` 结合使用可控制重新索引哪些文档。

    :::caution 警告
    **7.6 弃用**
    重新索引中的排序已被弃用。在重索引中排序永远不能保证按顺序索引文档，而且会阻碍重索引的进一步发展，如弹性和性能改进。如果与 `max_docs` 结合使用，请考虑使用查询过滤器。
    :::

    - `_source`

        (可选，字符串）如果为 `true`，则重新索引所有源字段。如果设置为列表，则会重新索引所选字段。默认为 `true`。

- `dest`

    - `index`

        (必填，字符串） 复制到的数据流、索引或索引别名的名称。

    - `version_type`

        (可选，枚举）索引操作要使用的版本。有效值：`internal`、`external`、`external_gt`、`external_gte`。更多信息，参阅[版本类型](/rest_apis/document_apis/docs_index.html#版本类型)。

    - `op_type`

        (可选，枚举）设置为 `create` 时，只对尚未存在的文档建立索引（即不存在时创建）。有效值：`index`、`create`。默认为 `index`。

    :::danger 重要
    要重新索引到数据流目标，参数必须为 `create`。
    :::

    - `pipeline`

        (可选，字符串）要使用的管道名称。

- `script`

    - `source`

        (可选，字符串）重新索引时要运行的更新文档源或元数据的脚本。

    - `lang`

        (可选，枚举）脚本语言：`painless`、`expression`、`mustache`、`java`。更多信息，参阅[脚本](/scripting)。

## 响应体

- `took`

    (整数）全部操作花的总毫秒。

- `timed_out`

    (布尔值) 如果在重新索引过程中执行的任何请求超时，该标志将被设置为 `true`。

- `total`

    (整数）成功处理的文件数。

- `updated`

    (整数）成功更新的文档数，即在重新索引更新之前，具有相同 ID 的文档已经存在。

- `created`

    (整数）成功创建的文件数。

- `deleted`

    (整数）成功删除的文件数。

- `batches`

    (整数）通过重新索引拉回的滚动响应数。

- `noops`

    (整数）由于用于重新索引的脚本为 `ctx.op` 返回了 `noop` 值而被忽略的文件数。

- `version_conflicts`

    (整数）重新索引遇到的版本冲突的数量。

- `retries`

    (整数） 重索引尝试重试的次数，`bulk` 是重试批量操作的次数，`search` 是重试搜索操作的次数。

- `throttled_millis`

    (整数）为符合 `requests_per_second` 要求而等待的毫秒数。

- `requests_per_second`

    (整数）重新索引期间每秒有效执行的请求数。

- `throttled_until_millis`

    (整数）在 `_reindex` 响应中，该字段应始终等于零。它只有在使用[任务 API](/rest_apis/cluster_apis/task_management) 时才有意义，因为它表示下一次再次执行节流请求的时间（以毫秒为单位，从Epoch 开始），以符合 `requests_per_second` 的要求。

- `failures`

    (数组)失败数组，表示在处理过程中出现了无法恢复的错误。如果该数组非空，则请求会因为这些故障而中止。重新索引是通过批次实现的，任何故障都会导致整个流程中止，但当前批次中的所有故障都会被收集到数组中。可以使用 `conflicts` 选项来防止重新索引因版本冲突而中止。

## 示例

### 使用查询重新索引所选文件

你可以通过在 `source` 中添加查询来限制文档。例如，下面的请求只将 `user.id` 为 `kimchy` 的文档复制到 `my-new-index-000001` 中：

```bash
POST _reindex
{
  "source": {
    "index": "my-index-000001",
    "query": {
      "term": {
        "user.id": "kimchy"
      }
    }
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
```

### 使用 max_docs 重索引所选文件

你可以通过设置 `max_docs` 来限制处理的文档数量。例如，此请求将单个文档从 `my-index-000001` 复制到 `my-new-index-000001`：

```bash
POST _reindex
{
  "max_docs": 1,
  "source": {
    "index": "my-index-000001"
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
```

### 从多个源重索引

源中的 `index` 属性可以是一个列表，这样就可以在一次请求中从多个源复制文件。这将从 `my-index-000001` 和 `my-index-000002` 索引中复制文件：

```bash
POST _reindex
{
  "source": {
    "index": ["my-index-000001", "my-index-000002"]
  },
  "dest": {
    "index": "my-new-index-000002"
  }
}
```

:::note 提示
重索引 API 不会努力处理 ID 冲突，因此最后写入的文档将“获胜”，但顺序通常无法预测，因此依赖这种行为并不是一个好主意。相反，可以使用脚本确保 ID 的唯一性。
:::

### 使用源过滤器重索引选择字段

你可以使用源过滤重索引原始文档中的子集字段。例如，以下请求只重新索引每个文档的 `user.id` 和 `_doc` 字段：

```bash
POST _reindex
{
  "source": {
    "index": "my-index-000001",
    "_source": ["user.id", "_doc"]
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
```

### 重索引以更改字段名称

`_reindex` 可以用来建立一个带有重命名字段的索引副本。假设你创建了一个包含如下文档的索引：


```bash
POST my-index-000001/_doc/1?refresh
{
  "text": "words words",
  "flag": "foo"
}
```

但你不喜欢名称标志，想用标签来代替它。`_reindex` 可以为你创建另一个索引：

```bash
POST _reindex
{
  "source": {
    "index": "my-index-000001"
  },
  "dest": {
    "index": "my-new-index-000001"
  },
  "script": {
    "source": "ctx._source.tag = ctx._source.remove(\"flag\")"
  }
}
```

现在你可以获取新文件了：

```bash
GET my-new-index-000001/_doc/1
```

将返回：

```json
{
  "found": true,
  "_id": "1",
  "_index": "my-new-index-000001",
  "_version": 1,
  "_seq_no": 44,
  "_primary_term": 1,
  "_source": {
    "text": "words words",
    "tag": "foo"
  }
}
```

### 重新索引每日指数

你可以将 `_reindex` 与 [Painless](/scripting/painless_scripting_language.html) 结合使用，重新索引每日索引，将新模板应用到现有文档中。

假设你的索引包含以下文档：

```bash
PUT metricbeat-2016.05.30/_doc/1?refresh
{"system.cpu.idle.pct": 0.908}
PUT metricbeat-2016.05.31/_doc/1?refresh
{"system.cpu.idle.pct": 0.105}
```

用于 `metricbeat-*` 索引的新模板已经加载到 Elasticsearch 中，但它只适用于新创建的索引。可以使用 Painless 重新索引现有文档并应用新模板。
下面的脚本会从索引名称中提取日期，并创建一个附加 `-1` 的新索引。`metricbeat-2016.05.31` 中的所有数据都将被重新索引到 `metricbeat-2016.05.31-1` 中。

```bash
POST _reindex
{
  "source": {
    "index": "metricbeat-*"
  },
  "dest": {
    "index": "metricbeat"
  },
  "script": {
    "lang": "painless",
    "source": "ctx._index = 'metricbeat-' + (ctx._index.substring('metricbeat-'.length(), ctx._index.length())) + '-1'"
  }
}
```

现在可以在 `*-1` 索引中找到以前的 `metricbeat` 索引中的所有文件。

```bash
GET metricbeat-2016.05.30-1/_doc/1
GET metricbeat-2016.05.31-1/_doc/1
```

前一种方法也可与更改字段名称结合使用，以便仅将现有数据加载到新索引中，并根据需要重新命名任何字段。

### 提取源的随机子集

`_reindex` 可用于提取源代码的随机子集进行测试：

```bash
POST _reindex
{
  "max_docs": 10,
  "source": {
    "index": "my-index-000001",
    "query": {
      "function_score" : {
        "random_score" : {},
        "min_score" : 0.9    
      }
    }
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
```

1. `"min_score" : 0.9`：你可能需要根据从源数据中提取的相对数据量来调整 `min_score`。

### 在重新索引过程中修改文件

与 `_update_by_query` 一样，`_reindex` 也支持修改文档的脚本。与 `_update_by_query` 不同，允许脚本修改文档的元数据。本示例对源文件的版本进行了修改：

```bash
POST _reindex
{
  "source": {
    "index": "my-index-000001"
  },
  "dest": {
    "index": "my-new-index-000001",
    "version_type": "external"
  },
  "script": {
    "source": "if (ctx._source.foo == 'bar') {ctx._version++; ctx._source.remove('foo')}",
    "lang": "painless"
  }
}
```

正如在 `_update_by_query` 中一样，你可以设置 `ctx.op` 来更改在目标上执行的操作：

- `noop`

    如果脚本认为不需要在目标中索引文档，则设置 `ctx.op = "noop"`。[响应体](#响应体)中的 `noop` 计数器将报告无操作。

- `delete`

    如果脚本认为必须从目的地删除文档，请设置 `ctx.op = "delete"`。删除情况将在响应体中的已删除计数器中报告。

将 `ctx.op` 设置为任何其他值都会返回错误，设置 `ctx` 中的任何其他字段也是如此。

想想这些可能性吧！只要小心谨慎，你可以改变的有：

- `_id`
- `_index`
- `_version`
- `_routing`

将 `_version` 设置为空或从 `ctx` 映射中清除它，就像在索引请求中不发送版本一样；不管目标上的版本是什么，也不管你在 `_reindex` 请求中使用的版本类型是什么，它都会导致文档在目标中被覆盖。

## 从远程重索引

重索引支持从远程 Elasticsearch 集群重新索引：

```bash
POST _reindex
{
  "source": {
    "remote": {
      "host": "http://otherhost:9200",
      "username": "user",
      "password": "pass"
    },
    "index": "my-index-000001",
    "query": {
      "match": {
        "test": "data"
      }
    }
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
```

`host` 参数必须包含协议、主机、端口（如 `https://otherhost:9200`）和可选路径（如 `https://otherhost:9200/proxy`）。`username` 和 `password` 参数是可选参数，如果存在这两个参数，`_reindex` 将使用基本认证连接到远程 Elasticsearch 节点。使用基本认证时，请确保使用 `https`，否则密码将以纯文本形式发送。有一系列[设置](#配置-SSL-参数)可用于配置 `https` 连接的行为。

使用 Elastic Cloud 时，也可以通过使用有效的 API 密钥对远程集群进行身份验证：

```bash
POST _reindex
{
  "source": {
    "remote": {
      "host": "http://otherhost:9200",
      "headers": {
        "Authorization": "ApiKey API_KEY_VALUE"
      }
    },
    "index": "my-index-000001",
    "query": {
      "match": {
        "test": "data"
      }
    }
  },
  "dest": {
    "index": "my-new-index-000001"
  }
}
```

必须在 `elasticsearch.yml` 中使用 `reindex.remote.whitelist` 属性明确允许远程主机。可以将其设置为以逗号分隔的允许远程 `host` 和 `port` 组合列表。协议会被忽略，只使用主机和端口。例如：

```bash
reindex.remote.whitelist: "otherhost:9200, another:9200, 127.0.10.*:9200, localhost:*"
```

允许的主机列表必须配置在任何将协调重新索引的节点上。

此功能应适用于任何版本的 Elasticsearch 远程群集。这样就可以通过从旧版本的群集重新索引，将任何版本的 Elasticsearch 升级到当前版本。

:::warning 警告
Elasticsearch 不支持跨主要版本的向前兼容性。例如，你无法将 7.x 集群重新索引到 6.x 集群中。
:::

要启用发送到旧版本 Elasticsearch 的查询，查询参数会直接发送到远程主机，无需验证或修改。

:::note 注意
从远程集群重新索引不支持[手动](#手动切片)或[自动切片](#自动切片)。
:::

从远程服务器重新索引使用堆上缓冲区，默认最大大小为 100MB。如果远程索引包含非常大的文档，则需要使用较小的批量大小。下面的示例将批量大小设置为 `10`，这是非常非常小的。

```bash
POST _reindex
{
  "source": {
    "remote": {
      "host": "http://otherhost:9200",
      ...
    },
    "index": "source",
    "size": 10,
    "query": {
      "match": {
        "test": "data"
      }
    }
  },
  "dest": {
    "index": "dest"
  }
}
```

还可以使用 `socket_timeout` 字段设置远程连接上的套接字读取超时，使用 `connect_timeout` 字段设置连接超时。两者的默认值都是 `30` 秒。本例将套接字读取超时设置为一分钟，连接超时设置为 `10` 秒：

```bash
POST _reindex
{
  "source": {
    "remote": {
      "host": "http://otherhost:9200",
      ...,
      "socket_timeout": "1m",
      "connect_timeout": "10s"
    },
    "index": "source",
    "query": {
      "match": {
        "test": "data"
      }
    }
  },
  "dest": {
    "index": "dest"
  }
}
```

### 配置 SSL 参数

从远程重新索引支持可配置的 SSL 设置。这些设置必须在 `elasticsearch.yml` 文件中指定，但安全设置除外，因为安全设置是在 Elasticsearch keystore 中添加的。无法在 `_reindex` 请求的正文中配置 SSL。

支持以下设置：

- `reindex.ssl.certificate_authorities`

    应受信任的 PEM 编码证书文件的路径列表。不能同时指定 `reindex.ssl.certificate_authorities` 和 `reindex.ssl.truststore.path`。

- `reindex.ssl.truststore.path`

    包含要信任的证书的 Java 密钥存储文件的路径。密钥存储可以是 “JKS” 或 “PKCS#12” 格式。不能同时指定 `reindex.ssl.certificate_authorities` 和 `reindex.ssl.truststore.path`。

- `reindex.ssl.truststore.password`

    信任库的密码（`reindex.ssl.truststore.path`）。[~~7.17.0~~]请使用 `reindex.ssl.truststore.secure_password` 代替。此设置不能与 `reindex.ssl.truststore.secure_password` 同时使用。

- `reindex.ssl.truststore.secure_password`（[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_setting.html)）
    
    信任存储（`reindex.ssl.truststore.path`）的密码。此设置不能与 `reindex.ssl.truststore.password` 一起使用。

- `reindex.ssl.truststore.type`

    信任存储的类型（`reindex.ssl.truststore.path`）。必须是 `jks` 或 `PKCS12`。如果信任存储路径以 “.p12”、“.pfx” 或 “pkcs12” 结尾，则默认设置为 `PKCS12`。否则，默认为 `jks`。

- `reindex.ssl.verification_mode`

    指示验证类型，以防止中间人攻击和证书伪造。可选择 `full`（验证主机名和证书路径）、`certificate`（验证证书路径，但不验证主机名）或 `none`（不执行验证--在生产环境中强烈不建议这样做）。默认为 `full`。

- `reindex.ssl.certificate`

    指定用于 HTTP 客户端身份验证的 PEM 编码证书（或证书链）的路径（如果远程集群需要），此设置要求同时设置 reindex.ssl.key。不能同时指定 `reindex.ssl.certificate` 和 `reindex.ssl.keystore.path`。

- `reindex.ssl.key`

    指定与用于客户端身份验证的证书（`reindex.ssl.certificate`）相关的 PEM 编码私钥的路径。不能同时指定 `reindex.ssl.key` 和 `reindex.ssl.keystore.path`。

- `reindex.ssl.key_passphrase`
    如果 PEM 编码私钥（reindex.ssl.key）已加密，则指定用于解密的口令。[~~7.17.0~~]请优先使用 reindex.ssl.secure_key_passphrase。不能与 reindex.ssl.secure_key_passphrase 一起使用。

- `reindex.ssl.secure_key_passphrase`（[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_setting.html)）

    指定用于解密 PEM 编码私钥（`reindex.ssl.key`）（如果已加密）的口令。不能与 reindex.ssl.key_passphrase 一起使用。

- `reindex.ssl.keystore.path`

    指定包含用于 HTTP 客户端身份验证的私钥和证书的密钥库路径（如果远程群集需要）。该密钥库可以是 "JKS "或 "PKCS#12 "格式。不能同时指定 reindex.ssl.key 和 reindex.ssl.keystore.path。

- `reindex.ssl.keystore.type`

    密钥存储的类型（`reindex.ssl.keystore.path`）。必须是 jks 或 PKCS12。如果密钥库路径以".p12"、".pfx "或 "pkcs12 "结尾，则默认为 PKCS12。否则，默认为 jks。

- `reindex.ssl.keystore.password`
    密钥存储的密码（`reindex.ssl.keystore.path`）。[~~7.17.0~~]请使用 `reindex.ssl.keystore.secure_password` 代替。此设置不能与 `reindex.ssl.keystore.secure_password` 同时使用。

- `reindex.ssl.keystore.secure_password`（[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_setting.html)）

    密钥存储的密码（`reindex.ssl.keystore.path`）。此设置不能与 `reindex.ssl.keystore.password` 一起使用。

- `reindex.ssl.keystore.key_password`

    密钥存储（`reindex.ssl.keystore.path`）中密钥的密码。默认为密钥库密码。[~~7.17.0~~]请使用 `reindex.ssl.keystore.secure_key_password` 代替。此设置不能与 `reindex.ssl.keystore.secure_key_password` 同时使用。

- `reindex.ssl.keystore.secure_key_password`（[安全](/set_up_elasticsearch/configuring_elasticsearch/secure_setting.html)）

    密钥存储（`reindex.ssl.keystore.path`）中密钥的密码。默认为密钥库密码。此设置不能与 `reindex.ssl.keystore.key_password` 一起使用。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html)
