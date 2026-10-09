# 验证仓库完整性 API

验证快照仓库内容的完整性。

```txt
POST /_snapshot/<repository>/_verify_integrity
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 集群权限才能使用此 API。

## 描述

此 API 对仓库的内容执行全面检查，查找其数据或元数据中可能阻止恢复快照、或可能导致将来的快照创建/删除操作失败的任何异常。

:::important 重要

如果你怀疑某个仓库的完整性：请立即停止所有写入活动，将其 `read_only` 选项设置为 `true`，并使用此 API。在此之前：

- 可能无法从此仓库恢复某些快照。
- 可搜索快照在搜索时可能报告错误，或者可能存在未分配的分片。
- 向此仓库进行快照可能失败，或者可能看似成功但创建了无法恢复的快照。
- 删除快照可能失败，或者可能看似成功但在磁盘上留下了底层数据。
- 继续向处于无效状态的仓库写入可能会造成进一步的损坏。

:::

:::note 注意

如果发现损坏，Elasticsearch **无法**对其进行修复。完全恢复仓库的唯一方法是从损坏发生之前拍摄的备份进行恢复。你还必须识别并防止造成损坏的原因。

:::

:::note 注意

如果无法从备份恢复，请注册一个新的仓库用于所有将来的快照操作。在某些情况下可以进行部分恢复 — 通过恢复所需的尽可能多的快照并重新对数据进行快照，或者通过使用 reindex API 从从损坏仓库挂载的可搜索快照中复制数据。

:::

:::note 注意

在验证运行期间，避免对仓库执行所有写入操作；并发写入可能导致报告虚假的异常或遗漏真实的异常。

:::

:::note 注意

此 API 旨在供人类以探索方式使用 — 请求参数和响应格式在将来的版本中可能会有所变化。此 API 在混合版本的集群中可能无法正确工作。

:::

## 路径参数

`<repository>`

（必需，字符串）要验证其完整性的快照仓库的名称。

## 查询参数

:::note 注意

这些参数的默认值旨在限制对集群活动的影响（例如，默认情况下每个快照最多使用 `snapshot_meta` 线程池的一半）。通过更改这些参数来加快验证速度可能会干扰其他快照操作；对于大型仓库，可以考虑使用一个单独的单节点集群专门进行验证。

:::

`snapshot_verification_concurrency`

（可选，整数）并发验证的快照数量。默认为 `0`（最多使用 `snapshot_meta` 线程池的一半）。

`index_verification_concurrency`

（可选，整数）并发验证的索引数量。默认为 `0`（使用整个 `snapshot_meta` 线程池）。

`meta_thread_pool_concurrency`

（可选，整数）并发执行的快照元数据操作的最大数量。默认为 `0`（最多使用 `snapshot_meta` 线程池的一半）。

`index_snapshot_verification_concurrency`

（可选，整数）在每次索引验证中并发验证的索引快照的最大数量。默认为 `1`。

`max_failed_shard_snapshots`

（可选，整数）限制跟踪的分片快照失败数量以避免过度的资源使用；如果存在更多失败，验证将失败。默认为 `10000`。

`verify_blob_contents`

（可选，布尔值）默认为 `false`。是否验证每个数据 blob 的校验和。如果启用，Elasticsearch 会读取整个仓库 — 可能极其缓慢和昂贵。

`blob_thread_pool_concurrency`

（可选，整数）如果 `verify_blob_contents` 为 `true`，一次验证的 blob 数量。默认为 `1`。

`max_bytes_per_sec`

（可选，[字节单位](/rest_apis/api_convention/common_options.html#字节大小单位)）如果 `verify_blob_contents` 为 `true`，每秒从仓库读取的最大数据量。默认为 `10mb`。

## 响应体

响应中包含分析的实现细节，其格式**不稳定** — 可能会因版本而异。

### `log` 数组

报告分析进度的对象序列。`log` 的属性包括：

- `timestamp_in_millis`：日志条目的时间戳（自 Unix 纪元以来的毫秒数）。
- `timestamp`：ISO 8601 格式的时间戳。仅在设置了 `human` 查询参数时包含。
- `snapshot`：如果条目与某个特定快照相关则存在。
- `index`：如果条目与某个特定索引相关则存在。
- `snapshot_restorability`：如果条目与某个索引的可恢复性相关则存在。
- `anomaly`：描述仓库内容中的异常（如适用）。
- `exception`：验证过程中遇到的异常的详细信息（如适用）。

### `results` 对象

描述分析的最终结果。`results` 的属性包括：

- `status`：分析任务的最终状态。
- `final_repository_generation`：分析结束时的仓库代次（generation）。如果在分析期间发生了任何写入，此值与任务状态中的代次不同，并且分析可能报告了虚假的异常或遗漏了真实的异常。
- `total_anomalies`：检测到的异常总数。
- `result`：最终结果：如果仓库内容看起来完好，则为 `pass`。如果缺少此字段或为其他值，则表示内容未完全验证。
- `exception`：阻止成功完成的异常（如有）。

## 示例

以下示例验证仓库 `my_repository` 的完整性：

```txt
POST /_snapshot/my_repository/_verify_integrity
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/verify-repo-integrity-api.html)
