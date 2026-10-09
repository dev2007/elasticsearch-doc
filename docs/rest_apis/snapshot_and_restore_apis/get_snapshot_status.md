# 获取快照状态 API

检索参与快照的每个分片的当前状态的详细描述。

```txt
GET _snapshot/_status
GET _snapshot/<repository>/_status
GET _snapshot/<repository>/<snapshot>/_status
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor_snapshot`、`create_snapshot` 或 `manage` 集群权限才能使用此 API。

## 描述

:::note 注意

此 API 仅应用于获取**正在进行的快照**的详细分片级信息。如果不需要这些详细信息，或者你需要有关一个或多个现有快照的信息，请改用获取快照 API。

:::

如果省略 `<snapshot>` 路径参数，则请求仅检索**当前正在运行的快照**的信息 — 推荐使用此方式。你也可以指定 `<repository>` 和 `<snapshot>` 来检索特定快照的状态，即使它们当前并未运行。

:::important 重要

检索**未**在运行的快照的状态可能非常昂贵 — 此 API 需要对每个快照中的每个分片各执行一次仓库读取。例如：100 个快照 × 1,000 个分片 = 100,000 次读取。此类请求可能耗时极长、消耗机器资源并产生高昂的云存储费用。

:::

## 路径参数

`<repository>`

（可选，字符串）用于限定请求的快照仓库名称。仅在未指定 `<snapshot>` 时支持通配符（`*`）。

`<snapshot>`

（可选，字符串）要检索状态的快照的逗号分隔列表。默认为当前正在运行的快照。**不支持通配符。**

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。可以设置为 `-1` 表示永不超时。

`ignore_unavailable`

（可选，布尔值）默认为 `false`。如果为 `false`，则对于任何不可用的快照，请求都会返回错误。如果为 `true`，则请求会忽略不可用的快照（例如已损坏或暂时不可用的快照）。

## 响应体

`snapshots` 数组中的每个对象包含：

- `repository`：包含该快照的仓库的名称。
- `snapshot`：快照的名称。
- `uuid`：快照的通用唯一标识符（UUID）。
- `state`：快照的当前状态，取值之一：
  - `FAILED`：快照已完成但有错误，未能存储任何数据。
  - `STARTED`：快照当前正在运行。
  - `SUCCESS`：快照已完成。
- `include_global_state`：快照中是否包含当前集群状态。
- `shards_stats`：快照中分片的计数对象，包含：
  - `initializing`：仍在初始化中的分片数量。
  - `started`：已启动但未终结（finalize）的分片数量。
  - `finalizing`：正在终结但尚未完成的分片数量。
  - `done`：已成功完成初始化、启动和终结的分片数量。
  - `failed`：未能包含在快照中的分片数量。
  - `total`：快照中包含的分片总数。
- `stats`：快照中包含文件的数量（`file_count`）和大小（`size_in_bytes`），包含：
  - `incremental`：作为增量快照的一部分仍需复制的文件的数量/大小。对于已完成的快照：指仓库中原本不存在且已被复制的文件。
  - `processed`：已上传到快照的文件的数量/大小。文件上传后，`stats` 中的 `processed.file_count` 和 `size_in_bytes` 会随之递增。
  - `total`：快照引用的文件的总数量/大小。
- `start_time_in_millis`：快照创建开始的时间（以毫秒为单位）。
- `time_in_millis`：快照过程完成所需的总时间（以毫秒为单位）。
- `indices`：快照中包含的索引的信息列表（以索引名称为键），每个索引包含：
  - `shards_stats`：与快照级的 `shards_stats` 结构相同。
  - `stats`：与快照级的 `stats` 结构相同。
  - `shards`：包含每个分片信息的对象列表，每个分片包含：
    - `stage`：分片的当前阶段，取值之一：
      - `DONE`：分片已成功存储在仓库中。
      - `FAILURE`：分片未能成功存储在仓库中。
      - `FINALIZE`：分片处于存储的终结阶段。
      - `INIT`：分片处于初始化阶段。
      - `STARTED`：分片处于已启动阶段。
    - `stats`：与快照级的 `stats` 结构相同。

## 示例

以下示例检索快照 `snapshot_2` 的状态：

```txt
GET _snapshot/my_repository/snapshot_2/_status
```

API 返回以下响应：

```json
{
  "snapshots": [
    {
      "snapshot": "snapshot_2",
      "repository": "my_repository",
      "uuid": "lNeQD1SvTQCqqJUMQSwmGg",
      "state": "SUCCESS",
      "include_global_state": false,
      "shards_stats": {
        "initializing": 0,
        "started": 0,
        "finalizing": 0,
        "done": 1,
        "failed": 0,
        "total": 1
      },
      "stats": {
        "incremental": {
          "file_count": 3,
          "size_in_bytes": 5969
        },
        "total": {
          "file_count": 4,
          "size_in_bytes": 6024
        },
        "start_time_in_millis": 1594829326691,
        "time_in_millis": 205
      },
      "indices": {
        "index_1": {
          "shards_stats": {
            "initializing": 0,
            "started": 0,
            "finalizing": 0,
            "done": 1,
            "failed": 0,
            "total": 1
          },
          "stats": {
            "incremental": {
              "file_count": 3,
              "size_in_bytes": 5969
            },
            "total": {
              "file_count": 4,
              "size_in_bytes": 6024
            },
            "start_time_in_millis": 1594829326896,
            "time_in_millis": 0
          },
          "shards": {
            "0": {
              "stage": "DONE",
              "stats": {
                "incremental": {
                  "file_count": 3,
                  "size_in_bytes": 5969
                },
                "total": {
                  "file_count": 4,
                  "size_in_bytes": 6024
                },
                "start_time_in_millis": 1594829326896,
                "time_in_millis": 0
              }
            }
          }
        }
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-snapshot-status-api.html)
