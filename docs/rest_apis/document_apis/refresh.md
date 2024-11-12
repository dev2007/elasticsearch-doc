# ?refresh

[索引](rest_apis/document_apis/docs_index)、[更新](rest_apis/document_apis/update)、[删除](rest_apis/document_apis/delete)和[批量](rest_apis/document_apis/bulk) API 支持设置 `refresh`，以控制搜索何时可以看到该请求所做的更改。这些是允许的值：

- **空字符串**或 `true`

    在操作发生后立即刷新相关的主分片和副本分片（而不是整个索引），以便更新后的文档立即出现在搜索结果中。**只有**在经过深思熟虑并确认不会导致索引和搜索性能低下的情况下，才可以这样做。

- `wait_for`

    在响应之前，等待请求所做的更改通过刷新变得可见。这不会强制立即刷新，而是等待刷新发生。Elasticsearch 会每隔 `index.refresh_interval`（默认值为一秒）自动刷新一次已更改的分片。该设置是[动态的](index_modules/index_module#动态索引设置)。调用[刷新](rest_apis/index_apis/refresh) API 或在任何支持刷新的 API 上将 `refresh` 设置为 `true` 也会导致刷新，进而导致已经在运行的 `refresh=wait_for` 请求返回。

- `false`（默认值）

    不采取任何与刷新相关的操作。该请求所做的更改将在请求返回后的某个时间点可见。

## 选用哪个设置

除非你有充分的理由等待更改变得可见，否则请始终使用 `refresh=false`（默认设置）。最简单快捷的选择是从 URL 中省略 `refresh` 参数。

如果绝对必须让请求所做的更改与请求同步可见，则必须在增加 Elasticsearch 负载（`true`）和延长响应等待时间（`wait_for`）之间做出选择。以下几点可以帮助你做出决定：

- 索引更改的次数越多，`wait_for` 与 `true` 相比节省的工作量就越多。如果索引每隔一次 `index.refresh_interval` 才更改一次，那么 `wait_for` 不会节省任何工作。

- `true` 会创建效率较低的索引结构（小段），这些小段随后必须合并到效率更高的索引结构（大段）中。也就是说，`true` 的代价是在创建索引时创建小段，在搜索时搜索小段，以及在合并时创建大段。

- 切勿连续启动多个 `refresh=wait_for` 请求。相反，使用 `refresh=wait_for` 将它们批量合并为一个批量请求，Elasticsearch 会并行启动所有请求，并在所有请求都完成后才返回。

- 如果将刷新间隔设为 `-1`，禁用自动刷新，那么使用 `refresh=wait_for` 的请求将无限期等待，直到某个操作导致刷新。相反，将 `index.refresh_interval` 设置为比默认值更短的值，如 `200ms`，会使 `refresh=wait_for` 的刷新速度更快，但仍会产生低效的分段。

- `refresh=wait_for` 只影响它所在的请求，但通过强制立即刷新，`refresh=true` 会影响其他正在进行的请求。通常，如果你有一个正在运行的系统，你不想打扰它，那么 `refresh=wait_for` 是一个较小的修改。

## `refresh=wait_for` 能强制刷新

如果在分片上已经有 `index.max_refresh_listeners`（默认值为 `1000`）请求在等待刷新时，收到了 `refresh=wait_for` 请求，那么该请求的行为将与刷新设置为 `true` 时的行为一样：它将强制刷新。这样做既能保证 `refresh=wait_for` 请求返回时，其变更对搜索是可见的，又能防止被阻塞的请求不经检查而占用资源。如果一个请求因为用完了监听器槽而强制刷新，那么它的响应将包含 `"forced_refresh"：true`。

无论批量请求修改了多少次分区，它们在每个分区上都只占用一个槽位。

## 示例

这将创建一个文档，并立即刷新索引，使其可见：

```bash
PUT /test/_doc/1?refresh
{"test": "test"}
PUT /test/_doc/2?refresh=true
{"test": "test"}
```

这将创建一个文档，但不会使其在搜索时可见：

```bash
PUT /test/_doc/3
{"test": "test"}
PUT /test/_doc/4?refresh=false
{"test": "test"}
```

这将创建一个文档，并等待它在搜索时可见：

```bash
PUT /test/_doc/4?refresh=wait_for
{"test": "test"}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-refresh.html)
