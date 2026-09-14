# 重新索引数据流状态 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [迁移 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-migration)。

:::::

这些 API 为 Kibana 的升级助手功能提供支持。我们强烈建议你使用升级助手从 7.17 升级到 8.18.8。有关升级说明，请参阅[升级到 Elastic 8.18.8](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/setup-upgrade.html)。

获取请求的数据流重新索引任务的当前状态。此状态在重新索引任务运行期间和任务完成后（无论成功还是失败）24 小时内可用。如果任务被取消，状态不再可用。如果任务失败，异常将列在状态中。

## 请求

```bash
GET /_migration/reindex/<data-stream>/_status
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对数据流拥有**管理索引**[权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 路径参数

- `<data-stream>`

  （必需，字符串）要获取状态的数据流名称。数据流的重新索引任务应正在运行或在最近 24 小时内完成。

## 响应体

- `start_time`

  （可选，时间值）重新索引任务开始的时间。

- `start_time_millis`

  （整数）重新索引任务开始的时间，以自纪元以来的毫秒数表示。

- `complete`

  （布尔值）如果重新索引任务仍在运行则为 `false`，如果任务已成功或失败完成则为 `true`。

- `total_indices_in_data_stream`

  （整数）数据流中后备索引的总数，包括写入索引。

- `total_indices_requiring_upgrade`

  （整数）需要升级的后备索引数量。这些索引具有旧版本且不是只读索引。

- `successes`

  （整数）已成功升级的后备索引数量。

- `in_progress`

  （对象数组）当前正在重新索引的后备索引信息。

  `in_progress` 对象的属性：

  - `index`（字符串）源后备索引的名称。
  - `total_doc_count`（整数）源后备索引中的文档数量。
  - `reindexed_doc_count`（整数）已添加到目标后备索引的文档数量。

- `pending`

  （整数）仍需升级且尚未开始的后备索引数量。

- `errors`

  （对象数组）发生的任何错误的信息。

  `errors` 对象的属性：

  - `index`（字符串）重新索引期间发生错误的后备索引名称。
  - `message`（字符串）错误描述。

- `exceptions`

  （可选，字符串）如果失败无法与特定索引关联时的重新索引失败异常消息。

## 示例

```bash
GET _migration/reindex/my-data-stream/_status
```

以下是典型的响应：

```json
{
  "start_time_millis": 1737676174349,
  "complete": false,
  "total_indices_in_data_stream": 4,
  "total_indices_requiring_upgrade": 3,
  "successes": 1,
  "in_progress": [
    {
      "index": ".ds-my-data-stream-2025.01.23-000002",
      "total_doc_count": 10000000,
      "reindexed_doc_count": 1000
    }
  ],
  "pending": 1,
  "errors": []
}
```

有关此 API 与重新索引和取消 API 一起使用的更深入示例，请参阅[重新索引数据流 API](./reindex_data_stream) 中的示例。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/data-stream-reindex-status-api.html)
