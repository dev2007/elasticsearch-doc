# 删除 rollup 作业 API

:::warning 已弃用

在 8.11.0 中已弃用。

Rollup 将在未来版本中移除。请改用[降采样](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/downsampling-data-stream.html)。

:::

删除一个现有的 rollup 作业。

```txt
DELETE _rollup/job/<job_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 或 `manage_rollup` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 描述

作业必须先停止才能删除。如果尝试删除已启动的作业，会发生错误。同样，如果尝试删除不存在的作业，会发生异常。

删除作业只会移除主动监控和 rollup 数据的进程，不会删除任何之前已 rollup 的数据。这是设计使然；用户可能希望 rollup 一个静态数据集。由于数据集是静态的，一旦被完全 rollup，就无需保留正在索引的 rollup 作业（因为不会再有新数据）。因此可以删除该作业，留下 rollup 后的数据供分析。

如果还希望移除 rollup 数据，且 rollup 索引仅包含单个作业的数据，可以直接删除整个 rollup 索引。如果 rollup 索引存储了多个作业的数据，则必须发出针对 rollup 索引中该 rollup 作业 ID 的 delete-by-query：

```json
POST my_rollup_index/_delete_by_query
{
  "query": {
    "term": {
      "_rollup.id": "the_rollup_job_id"
    }
  }
}
```

## 路径参数

`<job_id>`

（必需，字符串）作业的标识符。

## 响应码

- `404`（资源缺失）

  此代码表示没有与请求匹配的资源。尝试删除不存在的作业时会发生。

## 示例

如果有一个名为 `sensor` 的 rollup 作业，可以使用以下命令删除：

```txt
DELETE _rollup/job/sensor
```

将返回以下响应：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rollup-delete-job.html)
