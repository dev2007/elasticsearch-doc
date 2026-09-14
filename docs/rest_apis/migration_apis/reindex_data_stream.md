# 重新索引数据流 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [迁移 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-migration)。

:::::

这些 API 为 Kibana 的升级助手功能提供支持。我们强烈建议你使用升级助手从 7.17 升级到 8.18.8。有关升级说明，请参阅[升级到 Elastic 8.18.8](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/setup-upgrade.html)。

重新索引数据流 API 用于将数据流的后备索引升级到最新主要版本。它通过将每个后备索引重新索引到新索引中，然后用新索引替换原始后备索引并删除原始后备索引来工作。原始后备索引的设置和映射被复制到新的后备索引中。

此 API 在后台运行，因为重新索引大型数据流中的所有索引预计需要大量时间和资源。端点将立即返回，并创建一个持久任务在后台运行。可以使用重新索引状态 API 检查任务的当前状态。此状态在任务完成后（无论成功还是失败）保留 24 小时。但是，只保留最后的状态，因此重新运行重新索引将覆盖该数据流之前的状态。可以使用重新索引取消 API 取消正在运行或最近完成的数据流重新索引任务。

## 请求

```bash
POST /_migration/reindex
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对数据流拥有**管理索引**[权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 请求体

- `source`

  - `index`

    （必需，字符串）要升级的数据流名称。

  - `mode`

    （必需，枚举）设置为 `upgrade` 以原地升级数据流，使用相同的源和目标数据流。每个过期的后备索引将被重新索引。然后新的后备索引被交换到数据流中，旧索引被删除。目前此参数唯一允许的值为 `upgrade`。

## 设置

你可以使用以下设置控制重新索引数据流 API 的行为：

- `migrate.max_concurrent_indices_reindexed_per_data_stream`

  （动态）给定数据流中并发重新索引的后备索引数量。默认为 1。

- `migrate.data_stream_reindex_max_request_per_second`

  （动态）给定后备索引每秒重新索引文档的平均最大数量。默认为 1000，但可以是任何大于 0 的十进制数。要移除限制，设置为 -1。此设置可用于限制重新索引过程并管理资源使用。有关更多信息，请参阅重新索引限制文档。

## 示例

假设我们有一个数据流 `my-data-stream`，具有以下后备索引，所有索引的主要版本为 7.x：

- `.ds-my-data-stream-2025.01.23-000001`
- `.ds-my-data-stream-2025.01.23-000002`
- `.ds-my-data-stream-2025.01.23-000003`

同时假设 `.ds-my-data-stream-2025.01.23-000003` 是写入索引。如果 Elasticsearch 是 8.x 版本，我们希望升级到主要版本 9.x，必须先升级 7.x 版本索引。我们可以使用此 API 重新索引具有 7.x 后备索引的数据流，使其成为 8.x 版本后备索引。

首先调用 API：

```json
POST _migration/reindex
{
    "source": {
        "index": "my-data-stream"
    },
    "mode": "upgrade"
}
```

由于此任务在后台运行，API 将立即返回。任务将执行以下操作。

首先，数据流被滚动。为了在重新索引期间不丢失文档，我们在重新索引现有后备索引之前向它们添加写入块。由于数据流的写入索引不能有写入块，数据流必须被滚动。这将产生新的写入索引 `.ds-my-data-stream-2025.01.23-000004`，它具有 8.x 版本，因此不需要升级。

一旦数据流具有 8.x 版本的写入索引，我们就可以继续重新索引旧索引。对于每个 7.x 版本索引，我们现在执行以下操作：

1. 向源索引添加写入块以保证不丢失写入。
2. 如果源索引已关闭，则打开它。
3. 如果目标索引存在，则删除它。这是在失败后重试时执行的，以便从全新索引开始。
4. 使用从源创建索引 API 创建目标索引。这会将旧后备索引的设置和映射复制到新后备索引。
5. 使用重新索引 API 将旧后备索引的内容复制到新后备索引。
6. 如果源索引最初是关闭的，则关闭目标索引。
7. 使用修改数据流 API 将数据流中的旧索引替换为新索引。
8. 最后，删除旧的后备索引。

默认情况下，一次只处理一个后备索引。可以使用 `migrate.max_concurrent_indices_reindexed_per_data_stream` 设置修改此行为。

当重新索引数据流任务运行时，我们可以使用重新索引状态 API 检查当前状态：

```bash
GET /_migration/reindex/my-data-stream/_status
```

对于上述示例，以下是可能的状态：

```json
{
  "start_time_millis": 1737676174349,
  "complete": false,
  "total_indices_in_data_stream": 4,
  "total_indices_requiring_upgrade": 3,
  "successes": 0,
  "in_progress": [
    {
      "index": ".ds-my-data-stream-2025.01.23-000001",
      "total_doc_count": 10000000,
      "reindexed_doc_count": 999999
    }
  ],
  "pending": 2,
  "errors": []
}
```

此输出意味着第一个后备索引 `.ds-my-data-stream-2025.01.23-000001` 当前正在处理，还没有任何后备索引完成。注意 `total_indices_in_data_stream` 的值为 4，因为滚动后数据流中有 4 个索引。但新写入索引具有 8.x 版本，因此不需要重新索引，所以 `total_indices_requiring_upgrade` 仅为 3。

## 取消和重启

重新索引数据流设置提供了几种控制重新索引任务性能和资源使用的方法。以下示例展示如何停止正在运行的重新索引任务、修改设置并重启任务。

假设重新索引任务尚未完成，重新索引状态 API 返回以下内容：

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

假设任务已经运行了很长时间。默认情况下，我们限制重新索引操作每秒可以执行的请求数。这可以防止重新索引过程消耗过多资源。但默认值 1000 请求/秒并不适用于所有场景。`migrate.data_stream_reindex_max_request_per_second` 设置可用于增加或减少每秒请求数，或完全移除限制。

更改此设置不会影响当前正在重新索引的后备索引。例如，更改设置不会影响 `.ds-my-data-stream-2025.01.23-000002`，但会影响下一个后备索引。

在上面的状态中，`.ds-my-data-stream-2025.01.23-000002` 的 `reindexed_doc_count` 和 `total_doc_count` 分别为 1000 和 1000 万。这意味着它只重新索引了索引中 0.01% 的文档。这可能是取消运行并优化设置的好时机，不会丢失太多工作。所以我们调用取消 API：

```bash
POST /_migration/reindex/my-data-stream/_cancel
```

现在我们可以使用更新集群设置 API 增加限制：

```json
PUT /_cluster/settings
{
  "persistent" : {
    "migrate.data_stream_reindex_max_request_per_second" : 10000
  }
}
```

原始重新索引命令现在可以用于重启重新索引。由于第一个后备索引 `.ds-my-data-stream-2025.01.23-000001` 已经被重新索引并因此已经是 8.x 版本，它将被跳过。任务将从 `.ds-my-data-stream-2025.01.23-000002` 重新开始。

稍后，当所有后备索引完成后，重新索引状态 API 将返回类似以下内容：

```json
{
  "start_time_millis": 1737676174349,
  "complete": true,
  "total_indices_in_data_stream": 4,
  "total_indices_requiring_upgrade": 2,
  "successes": 2,
  "in_progress": [],
  "pending": 0,
  "errors": []
}
```

注意 `total_indices_requiring_upgrade` 的值为 2，不像之前的状态为 3。这是因为 `.ds-my-data-stream-2025.01.23-000001` 在任务取消前已经升级。重启后，API 发现它不需要升级，因此不将其包含在 `total_indices_requiring_upgrade` 或 `successes` 中，尽管它已经成功升级。

完成的状态将在任务完成后从状态 API 访问 24 小时。

我们现在可以检查数据流以验证索引已升级：

```bash
GET _data_stream/my-data-stream?filter_path=data_streams.indices.index_name
```

返回：

```json
{
  "data_streams": [
    {
      "indices": [
        {
          "index_name": ".migrated-ds-my-data-stream-2025.01.23-000003"
        },
        {
          "index_name": ".migrated-ds-my-data-stream-2025.01.23-000002"
        },
        {
          "index_name": ".migrated-ds-my-data-stream-2025.01.23-000001"
        },
        {
          "index_name": ".ds-my-data-stream-2025.01.23-000004"
        }
      ]
    }
  ]
}
```

索引 `.ds-my-data-stream-2025.01.23-000004` 是写入索引，不需要升级，因为它是用 8.x 版本创建的。其他三个后备索引现在以 `.migrated` 为前缀，因为它们已经升级。

我们现在可以检查索引并验证它们具有 8.x 版本：

```bash
GET .migrated-ds-my-data-stream-2025.01.23-000001?human&filter_path=*.settings.index.version.created_string
```

返回：

```json
{
  ".migrated-ds-my-data-stream-2025.01.23-000001": {
    "settings": {
      "index": {
        "version": {
          "created_string": "8.18.0"
        }
      }
    }
  }
}
```

## 处理失败

由于重新索引数据流 API 在后台运行，失败信息可以通过重新索引状态 API 获取。例如，如果后备索引 `.ds-my-data-stream-2025.01.23-000002` 被用户意外删除，我们将看到类似以下状态：

```json
{
  "start_time_millis": 1737676174349,
  "complete": false,
  "total_indices_in_data_stream": 4,
  "total_indices_requiring_upgrade": 3,
  "successes": 1,
  "in_progress": [],
  "pending": 1,
  "errors": [
    {
      "index": ".ds-my-data-stream-2025.01.23-000002",
      "message": "index [.ds-my-data-stream-2025.01.23-000002] does not exist"
    }
  ]
}
```

问题修复后，可以重新运行失败的重新索引任务。首先，必须使用重新索引取消 API 清除失败运行的状态。然后可以调用原始重新索引命令从上次中断处继续。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/data-stream-reindex-api.html)
