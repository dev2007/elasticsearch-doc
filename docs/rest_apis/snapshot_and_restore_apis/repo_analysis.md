# 仓库分析 API

分析一个仓库，报告其性能特征以及发现的任何错误行为。

```txt
POST /_snapshot/<repository>/_analyze
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 集群权限。

## 描述

此 API 分析仓库，报告其性能特征以及发现的任何不正确行为。它旨在检测第三方存储系统是否适合用作快照仓库。

推荐的测试方法：

- 从默认参数开始，以发现简单的问题。
- 然后运行规模越来越大的分析，直到至少达到：`blob_count` 为 2000、`max_blob_size` 为 2gb、`max_total_data_size` 为 1tb、`register_operation_count` 为 100。
- 使用充裕的 `timeout`，可能为 1 小时或更长。
- 使用与生产环境规模相似的多节点集群，因为有些问题只在多个节点并发访问时才会出现。

:::important 重要

如果分析失败，则说明仓库的行为不符合预期 — 通常是存储 API 的实现不正确或不兼容，使其不适合用于快照。向此类存储进行快照可能看似正常工作，但数据存在风险。为确认这一点，请验证针对该存储协议的参考实现（例如真实的 AWS S3）是否也会出现相同的故障。除非你能证明在参考实现上也存在相同的问题，否则不要报告涉及第三方存储的 Elasticsearch 问题。

:::

如果分析成功，它会返回测试细节（可选地包含每次操作的计时信息）。但成功的分析**不能**保证仓库能正确工作，因为它不会测试：

- **持久写入**（blob 必须在断电后仍然存在，直到被删除）。
- **静默数据损坏**（blob 内容在被修改或删除之前必须保持不变）。
- **连接中断时的正确行为**（读写可能失败，但不能返回不正确的结果）。

:::note 注意

此 API 会写入大量数据并将其读回；它会消耗网络、存储和 IO 带宽。它遵循 `max_snapshot_bytes_per_sec`、`max_restore_bytes_per_sec` 和 `indices.recovery.max_bytes_per_sec` 的限流设置。

:::

:::note 注意

如果在等待期间客户端连接关闭，测试将被取消。遗留的数据路径会记录在 Elasticsearch 日志中；请验证并手动清理。

:::

:::note 注意

此 API 旨在供人类以探索方式使用。其参数和响应格式可能会发生变化。较新的 Elasticsearch 版本可能会更严格（通过某个版本测试的存储系统可能会在另一个版本中失败）。在混合版本的集群中，此 API 可能无法正确工作。

:::

## 实现细节

该分析包含 blob 级任务（由 `blob_count` 控制）和对可线性化寄存器（linearizable registers）的比较交换操作（由 `register_operation_count` 控制），分布在具备数据节点资格和主节点资格的节点上：

- **写后读任务**：一个节点写入一个 blob（大小在 `max_blob_size` 和 `max_total_data_size` 限制内随机），然后其他节点尝试读取它。读取失败意味着缺少**写后读**（read-after-write）语义。
- **早期读取**：其他节点在写入仍在进行时进行读取 — 读取可能失败，但**不能返回部分数据**（测试原子性）。
- **覆盖测试**：当其他节点正在读取 blob 时该 blob 被覆盖 — 读取可以返回任一版本，但**不能返回部分数据或两个 blob 的混合**。
- **多种读写方法**：例如，单部分和多部分上传；完整读取或部分范围读取。
- **中止写入**：一个节点在写入过程中途中止写入；其他节点对 blob 的读取**必须失败（找不到该 blob）**。
- **可线性化寄存器**：通过原子比较交换操作操纵 blob。该分析验证：
  - 无竞争的比较交换操作总是成功。
  - 有竞争的操作要么成功，要么报告竞争，绝不会返回不正确的结果（竞争会触发重试）。
  - 大多数操作会原子地递增一个 8 字节的计数器 blob；一些操作会验证其他 blob 大小上的行为。

## 路径参数

`<repository>`

（必需，字符串）要测试的快照仓库的名称。

## 查询参数

`blob_count`

（可选，整数）默认为 `100`。要写入的 blob 总数。要进行符合实际的实验，应至少设置为 2000。

`max_blob_size`

（可选，[字节单位](/rest_apis/api_convention/common_options.html#字节大小单位)）默认为 `10mb`。单个 blob 的最大大小。要进行符合实际的实验，应至少设置为 2gb。

`max_total_data_size`

（可选，[字节单位](/rest_apis/api_convention/common_options.html#字节大小单位)）默认为 `1gb`。所有 blob 总大小的上限。要进行符合实际的实验，应至少设置为 1tb。

`register_operation_count`

（可选，整数）默认为 `10`。要执行的可线性化寄存器操作的最小数量。要进行符合实际的实验，应至少设置为 100。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待测试完成的期限；如果超过此期限，测试将被取消并返回错误。

### 高级查询参数

`concurrency`

（可选，整数）默认为 `10`。并发写入操作的数量。

`read_node_count`

（可选，整数）默认为 `10`。每次写入 blob 后执行读取的节点数量。

`early_read_node_count`

（可选，整数）默认为 `2`。执行早期读取（即在写入仍在进行时读取）的节点数量。早期读取很少被执行。

`rare_action_probability`

（可选，双精度浮点数）默认为 `0.02`。针对每个 blob 执行罕见操作（早期读取、覆盖或中止写入）的概率。

`seed`

（可选，整数）用于生成操作列表的伪随机数生成器（PRNG）种子。相同的种子会重现相同的操作（尽管并发执行的顺序可能会有所不同）。

`detailed`

（可选，布尔值）默认为 `false`。返回包含每次操作计时信息的详细结果。

`rarely_abort_writes`

（可选，布尔值）默认为 `true`。是否偶尔中止一些写入请求。

## 响应体

响应中包含实现细节，其格式在不同版本之间**不稳定**。

`coordinating_node`

协调分析并执行最终清理的节点，包含：

- `id`：节点的 ID。
- `name`：节点的名称。

`repository`

被分析的仓库的名称。

`blob_count`

写入的 blob 数量（等于 `blob_count` 查询参数）。

`concurrency`

并发写入操作的数量（等于 `concurrency` 查询参数）。

`read_node_count`

读取节点限制（等于 `read_node_count` 查询参数）。

`early_read_node_count`

早期读取节点限制（等于 `early_read_node_count` 查询参数）。

`max_blob_size` / `max_blob_size_bytes`

单个 blob 的最大大小限制（人类可读格式 / 字节数）。

`max_total_data_size` / `max_total_data_size_bytes`

所有数据总大小的限制（人类可读格式 / 字节数）。

`seed`

使用的 PRNG 种子（如果设置则等于 `seed` 查询参数）。

`rare_action_probability`

罕见操作的概率（等于 `rare_action_probability` 查询参数）。

`blob_path`

写入所有测试 blob 时所在的仓库路径。

`issues_detected`

检测到的正确性问题列表；如果 API 成功则为空。包含此字段是为了强调：即使成功，也不能保证将来的行为是正确的。

### `summary` 对象

`summary.write`

写入操作的摘要，包含：

- `count`：写入操作的数量。
- `total_size` / `total_size_bytes`：写入的 blob 总大小（人类可读格式 / 字节数）。
- `total_throttled` / `total_throttled_nanos`：由于 `max_snapshot_bytes_per_sec` 限流而等待的时间。
- `total_elapsed` / `total_elapsed_nanos`：写入的总耗时。

`summary.read`

读取操作的摘要，包含：

- `count`：读取操作的数量。
- `total_size` / `total_size_bytes`：读取的 blob（或 blob 的部分内容）总大小。
- `total_wait` / `total_wait_nanos`：等待每次读取第一个字节的总时间。
- `max_wait` / `max_wait_nanos`：任一读取的最大首字节等待时间。
- `total_throttled` / `total_throttled_nanos`：由于 `max_restore_bytes_per_sec` 或 `indices.recovery.max_bytes_per_sec` 限流而等待的时间。
- `total_elapsed` / `total_elapsed_nanos`：读取的总耗时。

`summary.details`

每次读写操作的详细信息；**仅在 `detailed` 为 `true` 时返回**。每一项包含：

- `blob`（对象）被操作的 blob，包含：`name`（名称）、`size` / `size_bytes`（大小）、`read_start` / `read_end`（读取的时间范围）、`read_early`（布尔值 — 读取是否在写入完成之前开始）、`overwritten`（布尔值 — blob 是否在读取期间被覆盖）。
- `writer_node`（对象）写入该 blob 并协调其读取的节点，包含 `id` 和 `name`。
- `write_elapsed` / `write_elapsed_nanos`：写入该 blob 所用的时间。
- `overwrite_elapsed` / `overwrite_elapsed_nanos`：覆盖所花的时间；如果未覆盖则省略。
- `write_throttled` / `write_throttled_nanos`：限流等待时间（通过 `max_snapshot_bytes_per_sec`，对于托管服务则为 `indices.recovery.max_bytes_per_sec`）。
- `reads`：对该 blob 的每次读取操作，每一项包含：
  - `node`：执行读取的节点（`id`、`name`）。
  - `before_write_complete`（布尔值）：读取是否可能在写入完成之前开始；如果为 `false` 则省略。
  - `found`（布尔值）：是否找到了该 blob（对于早期读取或中止的写入可能为 `false`）。
  - `first_byte_time` / `first_byte_time_nanos`：首字节延迟；如果未找到则省略。
  - `elapsed` / `elapsed_nanos`：读取持续时间；如果未找到则省略。
  - `throttled` / `throttled_nanos`：读取限流等待时间；如果未找到则省略。
- `listing_elapsed` / `listing_elapsed_nanos`：列出容器中所有 blob 所用的时间。
- `delete_elapsed` / `delete_elapsed_nanos`：删除容器中所有 blob 所用的时间。

## 示例

以下示例分析仓库 `my_repository`：

```txt
POST /_snapshot/my_repository/_analyze?blob_count=10&max_blob_size=1mb&timeout=120s
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/repo-analysis-api.html)
