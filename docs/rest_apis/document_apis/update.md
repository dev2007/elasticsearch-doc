# 更新 API

使用指定的脚本更新文档。

## 请求

`POST /<index>/_update/<_id>`

## 前置条件

- 如果启用了 Elasticsearch 安全功能，则必须拥有目标索引或索引别名的 `index` 或 `write` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

使你能够编写文档更新脚本。脚本可以更新、删除或跳过修改文档。更新 API 还支持传递部分文档，并将其合并到现有文档中。要完全替换现有文档，请使用[索引 API](/rest_apis/document_apis/docs_index)。

此操作：

1. 从索引中获取文档（与分片对应）。
2. 运行指定的脚本。
3. 对结果建立索引。

文档仍需重新索引，但使用 `update` 可以减少一些网络往返，并降低 GET 和索引操作之间发生版本冲突的几率。

要使用 `update`，必须启用 `_source` 字段。除了 `_source` 外，还可以通过 `ctx` 映射访问以下变量：`_index`、`_type`、`_id`、`_version`、`_routing` 和 `_now`（当前时间戳）。

## 路径参数

- `<index>`
  (必需，字符串）目标索引的名称。默认情况下，如果索引不存在，则会自动创建。有关详细信息，请参阅[自动创建数据流和索引](/rest_apis/document_apis/docs_index#自动创建数据流和索引)。
- `<_id>`
  (字符串）要更新文档的唯一标识符。

## 查询参数

- `if_seq_no`
  (可选，整数）只有当文档具有此序列号时才执行操作。请参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。
- `if_primary_term`
  (可选，整数）只有在文档具有该主要术语时才执行操作。请参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。
- `lang`
  (可选，字符串）脚本语言。默认：`painless`。
- `require_alias`
  (可选，布尔）如果为 `true`，则目标地址必须是[索引别名](/aliases)。默认为 `false`。
- `refresh`
  (可选，枚举）如果为 `true`，Elasticsearch 会刷新受影响的分片，使该操作在搜索中可见；如果为 `wait_for`，则等待刷新，使该操作在搜索中可见；如果为 `false`，则不刷新。有效值：`true`、`false`、`wait_for`。默认值：`false`。
- `retry_on_conflict`
  (可选，整数）指定当冲突发生时，操作应重试多少次。默认值：`0`。
- `routing`
  (可选，字符串）用于将操作路由到特定分区的自定义值。
- `_source`
  (可选，列表）设置为 `false` 可禁用源检索（默认值：`true`）。你还可以指定一个以逗号分隔的列表，其中包含你要检索的字段。
- `_source_excludes`
  (可选，列表）指定要排除的源字段。
- `_source_includes`
  (可选，列表）指定要检索的源字段。
- `timeout`
  (可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）下列操作的等待时间：
  - [动态映射](/mapping/dynamic_mapping)更新
  - [等待活动分片](/rest_apis/document_apis/docs_index#活动分片)
    默认为 `1m`（一分钟）。这可保证 Elasticsearch 在失败前至少等待超时时间。实际等待时间可能会更长，尤其是发生多次等待时。
- `wait_for_active_shards`
  (可选，字符串）继续操作前必须激活的分片副本数量。设置为全部或任何正整数，最多不超过索引中的分片总数（`number_of_replicas+1`）。默认值：`1`，主分区。

  参阅[活动分片](/rest_apis/document_apis/docs_index#活动分片)。

## 示例

首先，让我们为一个简单的文档编制索引：

```bash
PUT test/_doc/1
{
  "counter" : 1,
  "tags" : ["red"]
}
```

要递增计数器，可使用以下脚本提交更新请求：

```bash
POST test/_update/1
{
  "script" : {
    "source": "ctx._source.counter += params.count",
    "lang": "painless",
    "params" : {
      "count" : 4
    }
  }
}
```

同样，你也可以使用更新脚本将标签添加到标签列表中（这只是一个列表，因此即使标签存在也会被添加）：

```bash
POST test/_update/1
{
  "script": {
    "source": "ctx._source.tags.add(params.tag)",
    "lang": "painless",
    "params": {
      "tag": "blue"
    }
  }
}
```

你还可以从标签列表中移除一个标签。`remove` 标签的无感函数会获取要移除元素的数组索引。为避免可能出现的运行时错误，首先要确保标签存在。如果列表中包含重复的标签，脚本只会删除其中一个。

```bash
POST test/_update/1
{
  "script": {
    "source": "if (ctx._source.tags.contains(params.tag)) { ctx._source.tags.remove(ctx._source.tags.indexOf(params.tag)) }",
    "lang": "painless",
    "params": {
      "tag": "blue"
    }
  }
}
```

你还可以添加或删除文档中的字段。例如，该脚本添加了 `new_field` 字段：

```bash
POST test/_update/1
{
  "script" : "ctx._source.new_field = 'value_of_new_field'"
}
```

相反，该脚本会删除字段 `new_field`：

```bash
POST test/_update/1
{
  "script" : "ctx._source.remove('new_field')"
}
```

下面的脚本将从对象字段中删除一个子字段：

```bash
POST test/_update/1
{
  "script": "ctx._source['my-object'].remove('my-subfield')"
}
```

你也可以更改脚本中执行的操作，而不是更新文档。例如，如果 `tags` 字段包含 `green`，该请求将删除文档，否则什么也不做（`noop`）：

```bash
POST test/_update/1
{
  "script": {
    "source": "if (ctx._source.tags.contains(params.tag)) { ctx.op = 'delete' } else { ctx.op = 'noop' }",
    "lang": "painless",
    "params": {
      "tag": "green"
    }
  }
}
```

### 更新文件的一部分

下面的部分更新在现有文档中添加了一个新字段：

```bash
POST test/_update/1
{
  "doc": {
    "name": "new_name"
  }
}
```

如果同时指定 `doc` 和 `script`，则 `doc` 将被忽略。如果指定脚本更新，请在脚本中包含要更新的字段。

### 检测无更新

默认情况下，不改变任何内容的更新会检测到它们没有改变任何内容，并返回 `"result": "noop"`：

```bash
POST test/_update/1
{
  "doc": {
    "name": "new_name"
  }
}
```

如果 `name` 的值已经是 `new_name`，更新请求将被忽略，响应中的 `result` 元素将返回 `noop`：

```bash
{
   "_shards": {
        "total": 0,
        "successful": 0,
        "failed": 0
   },
   "_index": "test",
   "_id": "1",
   "_version": 2,
   "_primary_term": 1,
   "_seq_no": 1,
   "result": "noop"
}
```

你可以通过设置 `"detect_noop": false` 来禁用此行为：

```bash
POST test/_update/1
{
  "doc": {
    "name": "new_name"
  },
  "detect_noop": false
}
```

### 更新插入

如果文档不存在，`upsert` 元素的内容将作为新文档插入。如果文档存在，则执行 `script`：

```bash
POST test/_update/1
{
  "script": {
    "source": "ctx._source.counter += params.count",
    "lang": "painless",
    "params": {
      "count": 4
    }
  },
  "upsert": {
    "counter": 1
  }
}
```

### 脚本式更新插入

要在文档是否存在的情况下运行脚本，请将 `scripted_upsert` 设置为 `true`：

```bash
POST test/_update/1
{
  "scripted_upsert": true,
  "script": {
    "source": """
      if ( ctx.op == 'create' ) {
        ctx._source.counter = params.count
      } else {
        ctx._source.counter += params.count
      }
    """,
    "params": {
      "count": 4
    }
  },
  "upsert": {}
}
```

### 文档作为更新插入

你可以将 `doc_as_upsert` 设为 `true`，使用 `doc` 的内容作为 `upsert` 值，而不是发送部分 `doc` 和 `upsert` doc：

```bash
POST test/_update/1
{
  "doc": {
    "name": "new_name"
  },
  "doc_as_upsert": true
}
```

:::note 提示
不支持将[摄入管道](/ingest)与 `doc_as_upsert` 结合使用。
:::

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-update.html)
