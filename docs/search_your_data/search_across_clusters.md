# 跨集群搜索（Search across clusters）

**跨集群搜索（cross-cluster search）** 允许你用单个搜索请求查询一个或多个远程集群。例如，可以用跨集群搜索过滤和分析存储在不同数据中心集群中的日志数据。

## 前置条件

跨集群搜索需要配置远程集群：

- Elastic Service：配置远程集群。
- 自管 Elasticsearch：参见 Remote clusters。

为获得完整跨集群搜索能力，本地集群与远程集群必须处于相同订阅级别。其他要求：

- 本地协调节点必须具有 `remote_cluster_client` 节点角色。
- 如果使用 sniff mode：
  - 本地协调节点必须能连接远程集群的 seed 节点和 gateway 节点。
  - 建议使用能够作为协调节点的 gateway 节点；seed 节点可以是这些 gateway 节点的子集。
- 如果使用 proxy mode：
  - 本地协调节点必须能连接配置的 `proxy_address`。
  - 该代理必须能把连接路由到远程集群的 gateway 和 coordinating 节点。
- 跨集群搜索需要在本地集群和远程集群上配置不同安全权限。

## 版本兼容性

- 8.0+ 支持本地集群搜索远程集群的：上一个 minor 版本、相同版本、同一 major 中更新的 minor 版本。
- 也支持本地集群为某 major 的最后一个 minor 时，搜索下一个 major 中任意 minor 的远程集群。例如：本地 7.17 可搜索任意 8.x 远程集群。
- EQL search API 在版本早于或等于 7.17.7、8.5.1 时，本地和远程集群必须使用相同 Elasticsearch 版本。
- 只有所有被搜索集群都存在的特性才受支持；在不支持某特性的远程集群上使用该特性会导致未定义行为。
- 不受支持配置下的跨集群搜索可能仍能工作，但 Elastic 不测试且不保证行为。

确保兼容性的最简单方法是让所有集群使用相同版本。如果必须维护不同版本：

- 维护专用跨集群搜索集群，并保持在需要搜索的最早版本。例如有 7.17 和 8.x 集群时，可维护专用 7.17 本地集群。
- 或让每两个集群之间不超过一个 minor 版本差异。

本地集群滚动升级期间仍可搜索远程集群，但本地协调节点的 “upgrade from” 和 “upgrade to” 版本必须与远程集群 gateway 节点兼容。升级持续时间之外，在同一集群中运行多个 Elasticsearch 版本不受支持。

## 支持的 API

- Search API
- Async search API
- Multi search API
- Search template API
- Multi search template API
- Field capabilities API
- Painless execute API
- EQL search API（technical preview）
- SQL search API（technical preview）
- Vector tile search API（technical preview）
- ES|QL（technical preview）

Technical preview 功能未来可能更改或移除，Elastic 会修复问题，但不适用正式 GA 功能的支持 SLA。

## 配置远程集群

以下设置添加三个远程集群：`cluster_one`、`cluster_two` 和 `cluster_three`：

```bash
PUT _cluster/settings
{
  "persistent": {
    "cluster": {
      "remote": {
        "cluster_one": {
          "seeds": ["35.238.149.1:9300"],
          "skip_unavailable": true
        },
        "cluster_two": {
          "seeds": ["35.238.149.2:9300"],
          "skip_unavailable": false
        },
        "cluster_three": {
          "seeds": ["35.238.149.3:9300"]
        }
      }
    }
  }
}
```

也可使用配置文件：

```yaml
cluster:
  remote:
    cluster_one:
      seeds: 35.238.149.1:9300
      skip_unavailable: false
    cluster_two:
      seeds: 35.238.149.2:9300
      skip_unavailable: true
```

## `skip_unavailable`

默认情况下，如果请求中的远程集群不可用，或远程集群所有 shard 搜索失败，跨集群搜索会失败。

`skip_unavailable` 用于将远程集群标记为可选（`true`）或必需（`false`）。

:::::important 重要
Elasticsearch 8.15 中，`skip_unavailable` 默认值从 `false` 改为 `true`。

8.15 之前：如需将远程集群视为可选，需要显式设为 `true`；8.15 及之后：如需将远程集群视为必需，需要显式设为 `false`。
:::::

当 `skip_unavailable: true` 时：

- 如果远程集群节点在搜索期间不可用，则跳过该远程集群。响应中的 `_clusters.skipped` 记录跳过的集群数量，`_clusters.details` 中该集群状态为 `skipped`。
- 忽略远程集群返回的错误，例如不可用 shard 或 index 相关错误，也可能包括 `allow_no_indices`、`ignore_unavailable` 等参数相关错误。
- 忽略远程集群搜索中的 `allow_partial_search_results` 参数及相关 `search.default_allow_partial_results` 集群设置，因此远程集群搜索可能返回部分结果。

当该集群断开或不可用时，Elasticsearch 不会在最终结果中包含该集群中的匹配文档，搜索仍被认为成功，HTTP 状态为 `200 OK`。

如果远程集群至少有一个 shard 返回搜索结果：这些结果会被使用，搜索会返回部分数据，这与 `skip_unavailable` 设置无关。如果使用 async search，响应的 `is_partial` 会设为 `true`。

## 最小网络往返

跨集群搜索会向远程集群发送请求，网络延迟会影响搜索速度。

### 最小化网络往返（默认）

- 同步搜索默认最小化网络往返，可通过 `ccs_minimize_roundtrips=true` 显式启用。
- Elasticsearch 减少本地与远程集群之间的网络往返次数，从而降低延迟影响。
- 但对于大型搜索请求，例如包含 scroll 或 inner hits 的请求，Elasticsearch 无法减少网络往返。

优点：

1. 对查询大量 shard 的跨集群搜索，通常性能更好。
2. 对高网络延迟场景尤其有效，例如跨地域集群。
3. 对 async cross-cluster search：`GET _async_search/<search_id>` 可以在其他集群仍在运行时返回已完成集群的 top hits 和 aggregations，即提供增量部分结果。如果本地集群也参与搜索，本地集群可显示部分 aggregations，但不会显示部分 top hits。

工作机制：

1. 用户向本地集群发送跨集群搜索请求。
2. 本地协调节点接收并解析请求。
3. 协调节点向每个集群发送一个搜索请求，包括本地集群。
4. 每个远程集群独立执行搜索请求，并应用自己的集群级设置。
5. 远程集群把搜索结果返回给协调节点。
6. 协调节点汇总结果并返回最终跨集群搜索响应。

### 不最小化网络往返

- 异步搜索默认不最小化网络往返，可通过 `ccs_minimize_roundtrips=false` 显式设置。
- 对包含 scroll 或 inner hits 的请求，Elasticsearch 会向每个远程集群发送多次进出请求。
- 通常较慢，但适合低延迟网络。
- 不最小化时，async search 可在 shard 完成时返回增量 aggregation 结果，但 top hits 要等所有集群完成后才显示。

工作机制：

1. 用户向本地集群发送跨集群搜索请求。
2. 本地协调节点接收并解析请求。
3. 协调节点向每个远程集群发送 transport 层 `search shards` 请求，让远程集群执行 `can match` 搜索，确定哪些 shard 应被搜索。
4. 远程集群返回响应，包含将被执行的 index 和 shard 信息。
5. 协调节点向每个 shard 发送搜索请求，包括本地集群的 shard。
6. 每个 shard 独立执行搜索。
7. 每个 shard 把结果返回给协调节点。
8. 协调节点汇总结果并返回最终响应。

不最小化网络往返时，搜索执行方式类似所有数据都在协调节点所在集群中。建议更新限制搜索的集群级设置，例如 `action.search.shard_count.limit`、`pre_filter_shard_size` 和 `max_concurrent_shard_requests`。如果这些限制过低，搜索可能被拒绝。

:::::note 提示
- Vector tile search API 始终最小化网络往返，且不包含 `ccs_minimize_roundtrips` 参数。
- Approximate kNN search 不支持最小化网络往返，会将 `ccs_minimize_roundtrips` 设为 `false`。
:::::

## 搜索远程集群

远程集群上的 data stream 和 index 使用 `<remote_cluster_name>:<target>` 格式，例如 `cluster_one:my-index-000001`。搜索一个或多个远程集群时，响应会包含 `_clusters` 字段，说明每个集群上的搜索信息。

`_clusters` 中的集群状态：

- `running`
- `successful`：集群所有 shard 搜索成功
- `partial`：集群至少一个 shard 成功，至少一个 shard 失败
- `skipped`：搜索在标记为 `skip_unavailable=true` 的集群上失败
- `failed`：搜索在标记为 `skip_unavailable=false` 的集群上失败

`_clusters.details` 展示每个集群的搜索元数据，包括用户提供的 index 表达式（如使用 wildcard，显示的是模式而非实际匹配的具体 index）、子搜索耗时（毫秒）及 shard 统计信息。

本地集群在 `_clusters.details` 中标识为 `(local)`。来自本地集群的文档，其 `_index` 不包含集群名；来自远程集群的文档，其 `_index` 包含远程集群名。

### 搜索单个远程集群

```bash
GET /cluster_one:my-index-000001/_search
{
  "size": 1,
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  },
  "_source": ["user.id", "message", "http.response.status_code"]
}
```

响应要点：`_clusters.total` 为 1；`cluster_one` 状态为 `successful`；搜索 12 个 shard 全部成功；命中文档的 `_index` 为 `cluster_one:my-index-000001`。

### 搜索本地集群和多个远程集群

```bash
GET /my-index-000001,cluster_one:my-index-000001,cluster_two:my-index-000001/_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  },
  "_source": ["user.id", "message", "http.response.status_code"]
}
```

响应要点：本地集群标识为 `(local)`，10 个 shard；`cluster_one` 12 个 shard；`cluster_two` 6 个 shard；总计 28 个 shard 全部成功。本地文档的 `_index` 为 `my-index-000001`，远程文档的 `_index` 带集群名前缀。

### 异步跨集群搜索（最小化往返）

```bash
POST /my-index-000001,cluster_one:my-index-000001,cluster_two:my-index-000001/_async_search?ccs_minimize_roundtrips=true
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  },
  "_source": ["user.id", "message", "http.response.status_code"]
}

GET /_async_search/FklQYndoTDJ2VEFlMEVBTzFJMGhJVFEaLVlKYndBWWZSMUdicUc4WVlEaFl4ZzoxNTU=
```

提交时返回 async search id，初始响应中 `is_partial: true`、`is_running: true`，`_clusters` 表明 3 个集群都在搜索中。此时 `_shards.total` 只包括本地集群和已完成的远程集群；全部完成后才显示所有集群 shard 总数。

运行中的获取结果示例：本地集群与 `cluster_one` 已完成，`cluster_two` 仍在运行；`_clusters.successful` 为 2、`running` 为 1；`_shards.total` 为 22（本地 10 + `cluster_one` 12）；`hits.total.value` 为 542，最终结果要等所有集群完成后才确定。

完成后的获取结果示例：`is_partial: false`、`is_running: false`，出现 `completion_time_in_millis`；`_shards.total` 为 28 全部成功；3 个集群全部 `successful`；`hits.total.value` 为 1067。

### 部分 shard 失败

```bash
GET /_async_search/status/FmpwbThueVB4UkRDeUxqb1l4akIza3cbWEJyeVBPQldTV3FGZGdIeUVabXBldzoyMDIw
```

响应中 `is_partial: true`、`is_running: false`；28 个 shard 中 27 个成功、1 个失败；`cluster_two` 状态为 `partial`。失败 shard 信息同时出现在 `_shards.failures` 和 `_clusters.details.cluster_two.failures`。有 shard 返回结果的集群会被标为 `partial`，而不是 `skipped` 或 `failed`。

### 集群断开

一个配置为 `skip_unavailable=true` 的集群断开后状态为 `skipped`；一个配置为 `skip_unavailable=false` 的集群断开后状态为 `failed`。由于存在 `failed` 集群，响应包含顶层 `error`，HTTP 状态为 500。如果希望集群不可用时搜索仍返回结果，应将所有远程集群设为 `skip_unavailable=true`。

### 排除集群或索引

如果使用 wildcard 包含大量集群或索引，可以用 `-` 显式排除。

排除整个远程集群时，index 位置必须使用 `*`，否则会返回错误：

```bash
POST /my-index-000001,cluster*:my-index-000001,-cluster_three:*/_async_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  },
  "_source": ["user.id", "message", "http.response.status_code"]
}
```

`cluster*` 自然包含 `cluster_one`、`cluster_two`、`cluster_three`；`-cluster_three:*` 表示排除 `cluster_three`，不与其建立搜索联系。

排除远程索引时，不会排除集群本身，仍会联系该集群：

```bash
POST /my-index-000001,cluster*:my-index-*,cluster_three:-my-index-000001/_async_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  },
  "_source": ["user.id", "message", "http.response.status_code"]
}
```

`cluster_three` 会搜索匹配 `my-index-*` 的索引，但排除 `my-index-000001`。

### 异步跨集群搜索（不最小化往返）

```bash
POST /my-index-000001,cluster_one:my-index-000001,cluster_two:my-index-000001/_async_search?ccs_minimize_roundtrips=false
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  },
  "_source": ["user.id", "message", "http.response.status_code"]
}
```

此时 `_shards.total` 从一开始就是准确的，因为搜索开始前已从所有集群收集 shard 总数（示例为本地 10 + `cluster_one` 12 + `cluster_two` 6 = 28）。`_shards` 会随着单个 shard 完成而增量更新，所有集群初始状态都是 `running`。可以看到来自任意已完成 shard 的 partial aggregation 结果，但 hits 要等所有集群完成才显示。

## 跨集群搜索失败

跨集群搜索失败会导致两类结果：部分结果（HTTP 2xx）和搜索失败（HTTP 4xx 或 5xx），两种情况都会在搜索响应中包含失败详情。

搜索会失败的情况：

- 标记为 `skip_unavailable=false` 的集群不可用。
- 标记为 `skip_unavailable=false` 的集群在搜索期间断开。
- 标记为 `skip_unavailable=false` 的集群所有 shard 搜索失败。

其他情况通常返回部分结果。单个 shard 的搜索失败会同时出现在 `_shards` 和 `_clusters` 中；失败的搜索会包含顶层错误字段。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/modules-cross-cluster-search.html)
