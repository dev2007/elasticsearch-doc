# 线程池

节点使用多个线程池来管理内存消耗。与许多线程池关联的队列使待处理的请求得以保留而不是被丢弃。

线程池有多种，其中比较重要的包括：

| 线程池 | 描述 | 类型与设置 |
|--------|------|------------|
| **generic** | 用于通用操作（例如，后台节点发现）。 | 线程池类型为 `scaling`。 |
| **search** | 用于分片级别的计数/搜索操作。获取（fetch）和其他与搜索相关的操作也使用它。 | 线程池类型为 `fixed`，大小为 `int((# 已分配处理器数 * 3) / 2) + 1`，`queue_size` 为 `1000`。 |
| **search_throttled** | 用于对 `search_throttled` 索引的计数/搜索/建议/获取操作。 | 线程池类型为 `fixed`，大小为 `1`，`queue_size` 为 `100`。 |
| **search_coordination** | 用于轻量级搜索相关的协调操作。 | 线程池类型为 `fixed`，大小为 `(# 已分配处理器数) / 2`，`queue_size` 为 `1000`。 |
| **get** | 用于获取（get）操作。 | 线程池类型为 `fixed`，大小为 `int((# 已分配处理器数 * 3) / 2) + 1`，`queue_size` 为 `1000`。 |
| **analyze** | 用于分析请求。 | 线程池类型为 `fixed`，大小为 `1`，队列大小为 `16`。 |
| **write** | 用于单文档索引/删除/更新、摄取处理器和批量请求。 | 线程池类型为 `fixed`，大小为 `# 已分配处理器数`，`queue_size` 为 `10000`。此池的最大大小为 `1 + # 已分配处理器数`。 |
| **snapshot** | 用于快照/恢复操作。 | 线程池类型为 `scaling`，keep-alive 为 `5m`。在至少有 750MB 堆的节点上，此池的最大大小默认为 `10`。在堆少于 750MB 的节点上，此池的最大大小默认为 `min(5, (# 已分配处理器数) / 2)`。 |
| **snapshot_meta** | 用于快照仓库元数据读取操作。 | 线程池类型为 `scaling`，keep-alive 为 `5m`，最大为 `min(50, (# 已分配处理器数 * 3))`。 |
| **warmer** | 用于段预热操作。 | 线程池类型为 `scaling`，keep-alive 为 `5m`，最大为 `min(5, (# 已分配处理器数) / 2)`。 |
| **refresh** | 用于刷新操作。 | 线程池类型为 `scaling`，keep-alive 为 `5m`，最大为 `min(10, (# 已分配处理器数) / 2)`。 |
| **fetch_shard_started** | 用于列出分片状态。 | 线程池类型为 `scaling`，keep-alive 为 `5m`，默认最大大小为 `2 * # 已分配处理器数`。 |
| **fetch_shard_store** | 用于列出分片存储。 | 线程池类型为 `scaling`，keep-alive 为 `5m`，默认最大大小为 `2 * # 已分配处理器数`。 |
| **flush** | 用于 flush 和 translog fsync 操作。 | 线程池类型为 `scaling`，keep-alive 为 `5m`，默认最大大小为 `min(5, (# 已分配处理器数) / 2)`。 |
| **force_merge** | 用于强制合并操作。 | 线程池类型为 `fixed`，大小为 `max(1, (# 已分配处理器数) / 8)`，队列大小无界。 |
| **management** | 用于集群管理。 | 线程池类型为 `scaling`，keep-alive 为 `5m`，默认最大大小为 `5`。 |
| **system_read** | 用于系统索引的读操作。 | 线程池类型为 `fixed`，默认最大大小为 `min(5, (# 已分配处理器数) / 2)`。 |
| **system_write** | 用于系统索引的写操作。 | 线程池类型为 `fixed`，默认最大大小为 `min(5, (# 已分配处理器数) / 2)`。 |
| **system_critical_read** | 用于系统索引的关键读操作。 | 线程池类型为 `fixed`，默认最大大小为 `min(5, (# 已分配处理器数) / 2)`。 |
| **system_critical_write** | 用于系统索引的关键写操作。 | 线程池类型为 `fixed`，默认最大大小为 `min(5, (# 已分配处理器数) / 2)`。 |
| **watcher** | 用于 watch 执行。 | 线程池类型为 `fixed`，默认最大大小为 `min(5 * (# 已分配处理器数), 50)`，`queue_size` 为 `1000`。 |
| **esql_worker** | 执行 ES\|QL 操作。 | 线程池类型为 `fixed`，大小为 `int((# 已分配处理器数 * 3) / 2) + 1`，`queue_size` 为 `1000`。 |

## 更改线程池设置

线程池设置是**静态**的，可以通过编辑 `elasticsearch.yml` 来更改。可以通过设置线程池的特定类型参数来更改特定线程池；例如，更改 `write` 线程池中的线程数：

```yaml
thread_pool:
    write:
        size: 30
```

## 线程池类型

### fixed

`fixed` 线程池持有固定数量的线程来处理请求，并使用一个（可选有界的）队列保存没有线程可服务的待处理请求。

- **`size`** 参数控制线程数量。
- **`queue_size`** 用于控制没有线程执行它们的待处理请求队列的大小。默认为 `-1`，表示无界。当请求到来且队列已满时，将中止该请求。

```yaml
thread_pool:
    write:
        size: 30
        queue_size: 1000
```

### scaling

`scaling` 线程池持有动态数量的线程。该数量与工作负载成比例，在 **`core`** 和 **`max`** 参数的值之间变化。

**`keep_alive`** 参数决定线程在没有工作可做时应在线程池中保留多长时间。

```yaml
thread_pool:
    warmer:
        core: 1
        max: 8
        keep_alive: 2m
```

## 已分配处理器设置

处理器数量是自动检测的，线程池设置会基于它自动设置。在某些情况下，覆盖检测到的处理器数量会很有用。这可以通过显式设置 `node.processors` 设置来完成。此设置受可用处理器数量限制，并接受浮点数，这在 Elasticsearch 节点配置为在 CPU 限制（例如 Cgroups 下的 cpu shares 或配额）下运行的环境中非常有用。

```yaml
node.processors: 2
```

显式覆盖 `node.processors` 设置有几个用例：

1. 如果你在同一主机上运行多个 Elasticsearch 实例，但希望 Elasticsearch 按照只有一部分 CPU 的方式来设置其线程池，你应该将 `node.processors` 设置覆盖为所需的比例；例如，如果你在 16 核机器上运行两个 Elasticsearch 实例，请将 `node.processors` 设置为 `8`。请注意，这是专家级用例，涉及的不仅仅是设置 `node.processors` 设置，还有其他需要考虑的事项，如更改垃圾收集器线程数、将进程固定到内核等。
2. 有时处理器数量被错误检测，在这种情况下，显式设置 `node.processors` 设置可以解决此类问题。

要检查检测到的处理器数量，使用带 `os` 标志的节点信息 API。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/modules-threadpool.html)
