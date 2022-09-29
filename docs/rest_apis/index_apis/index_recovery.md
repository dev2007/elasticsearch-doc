# 索引恢复 API

返回有关一个或多个索引的正在进行和已完成的分片恢复的信息。对于数据流，API 返回流的备份索引的信息。

```bash
GET /my-index-000001/_recovery
```

## 请求

`GET /<target>/_recovery`

`GET /_recovery`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `monitor` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

使用索引恢复 API 获取有关正在进行和已完成的分片恢复的信息。

分片恢复是从主碎片同步副本碎片的过程。完成后，副本碎片可用于搜索。

在以下过程中自动进行恢复：

- 节点启动或失败。这种类型的恢复称为本地存储恢复。

- 主分片复制。

- 将分片重新定位到同一集群中的不同节点。

- [快照恢复](/snapshot_and_restore/restore_a_snapshot)。

## 路径参数

- `<target>`

  （可选，字符串）用于限制请求的，逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `active_only`

  （可选，布尔值）如果为 `true`，响应仅包括正在进行的分片恢复。默认为 `false`。

- `detailed`

  （可选，布尔值）如果为 `true`，响应包含关于分片恢复的详细信息。默认为 `false`。

- `index`

  （可选，字符串）用于限制请求的，逗号分隔的索引名的列表。

## 响应体

- `id`

  （整数）分片 ID

- `type`

  （字符串）恢复类型，返回值包含：

  - `STORE`

    恢复与节点启动或故障有关。这种类型的恢复称为本地存储恢复。

  - `SNAPSHOT`

    恢复与[快照恢复](/snapshot_and_restore/restore_a_snapshot)有关。

  - `REPLICA`

    恢复与主分片复本有关。

  - `RELOCATING`

    恢复与将分片重新定位到同一集群中的不同节点有关。

- `STAGE`

  （字符串）恢复阶段。返回值包含：

  - `DONE`

    完成。

  - `FINALIZE`

    清除。

  - `INDEX`

    读取索引元数据并将字节从源复制到目标。

  - `INIT`

    恢复还未开始。

  - `START`

    启动恢复过程；打开索引以供使用。

  - `TRANSLOG`

    重放事务日志。

- `primary`

  （布尔值）如果为 `true`，分片是主分片。

- `start_time`

  （时间戳）恢复开始的时间戳。

- `stop_time`

  （字符串）恢复结束的时间戳。

- `total_time_in_millis`

  （字符串）以毫秒为单位，恢复分片的总时长。

- `source`

  （对象）恢复的源。可以包含：
  
  - 如果从快照恢复，则为存储库描述
  - 源节点的描述

- `target`

  （对象）目标节点。

- `index`

  （对象）关于物理索引恢复的统计信息。

- `translog`

  （对象）关于事务日志恢复的统计信息。

- `start`

  （对象）关于打开和启动索引时间的统计信息。

## 示例

### 获取多个数据流和索引的恢复信息

```bash
GET index1,index2/_recovery?human
```

### 获取集群中所有数据流和索引的段信息

```bash
GET /_recovery?human
```

API 返回以下响应：

```bash
{
  "index1" : {
    "shards" : [ {
      "id" : 0,
      "type" : "SNAPSHOT",
      "stage" : "INDEX",
      "primary" : true,
      "start_time" : "2014-02-24T12:15:59.716",
      "start_time_in_millis": 1393244159716,
      "stop_time" : "0s",
      "stop_time_in_millis" : 0,
      "total_time" : "2.9m",
      "total_time_in_millis" : 175576,
      "source" : {
        "repository" : "my_repository",
        "snapshot" : "my_snapshot",
        "index" : "index1",
        "version" : "{version}",
        "restoreUUID": "PDh1ZAOaRbiGIVtCvZOMww"
      },
      "target" : {
        "id" : "ryqJ5lO5S4-lSFbGntkEkg",
        "host" : "my.fqdn",
        "transport_address" : "my.fqdn",
        "ip" : "10.0.1.7",
        "name" : "my_es_node"
      },
      "index" : {
        "size" : {
          "total" : "75.4mb",
          "total_in_bytes" : 79063092,
          "reused" : "0b",
          "reused_in_bytes" : 0,
          "recovered" : "65.7mb",
          "recovered_in_bytes" : 68891939,
          "percent" : "87.1%"
        },
        "files" : {
          "total" : 73,
          "reused" : 0,
          "recovered" : 69,
          "percent" : "94.5%"
        },
        "total_time" : "0s",
        "total_time_in_millis" : 0,
        "source_throttle_time" : "0s",
        "source_throttle_time_in_millis" : 0,
        "target_throttle_time" : "0s",
        "target_throttle_time_in_millis" : 0
      },
      "translog" : {
        "recovered" : 0,
        "total" : 0,
        "percent" : "100.0%",
        "total_on_start" : 0,
        "total_time" : "0s",
        "total_time_in_millis" : 0,
      },
      "verify_index" : {
        "check_index_time" : "0s",
        "check_index_time_in_millis" : 0,
        "total_time" : "0s",
        "total_time_in_millis" : 0
      }
    } ]
  }
}
```

此响应包括有关恢复单个分片的单个索引的信息。恢复的源是快照存储库，恢复的目标是 `my_es_node`。

响应还包括恢复的文件和字节的数量和百分比。

## 获取详细的恢复信息

要获取恢复中的物理文件列表，设置查询参数 `detailed` 为 `true`。

```bash
GET _recovery?human&detailed=true
```

API 返回以下响应：

```bash
{
  "index1" : {
    "shards" : [ {
      "id" : 0,
      "type" : "STORE",
      "stage" : "DONE",
      "primary" : true,
      "start_time" : "2014-02-24T12:38:06.349",
      "start_time_in_millis" : "1393245486349",
      "stop_time" : "2014-02-24T12:38:08.464",
      "stop_time_in_millis" : "1393245488464",
      "total_time" : "2.1s",
      "total_time_in_millis" : 2115,
      "source" : {
        "id" : "RGMdRc-yQWWKIBM4DGvwqQ",
        "host" : "my.fqdn",
        "transport_address" : "my.fqdn",
        "ip" : "10.0.1.7",
        "name" : "my_es_node"
      },
      "target" : {
        "id" : "RGMdRc-yQWWKIBM4DGvwqQ",
        "host" : "my.fqdn",
        "transport_address" : "my.fqdn",
        "ip" : "10.0.1.7",
        "name" : "my_es_node"
      },
      "index" : {
        "size" : {
          "total" : "24.7mb",
          "total_in_bytes" : 26001617,
          "reused" : "24.7mb",
          "reused_in_bytes" : 26001617,
          "recovered" : "0b",
          "recovered_in_bytes" : 0,
          "percent" : "100.0%"
        },
        "files" : {
          "total" : 26,
          "reused" : 26,
          "recovered" : 0,
          "percent" : "100.0%",
          "details" : [ {
            "name" : "segments.gen",
            "length" : 20,
            "recovered" : 20
          }, {
            "name" : "_0.cfs",
            "length" : 135306,
            "recovered" : 135306
          }, {
            "name" : "segments_2",
            "length" : 251,
            "recovered" : 251
          }
          ]
        },
        "total_time" : "2ms",
        "total_time_in_millis" : 2,
        "source_throttle_time" : "0s",
        "source_throttle_time_in_millis" : 0,
        "target_throttle_time" : "0s",
        "target_throttle_time_in_millis" : 0
      },
      "translog" : {
        "recovered" : 71,
        "total" : 0,
        "percent" : "100.0%",
        "total_on_start" : 0,
        "total_time" : "2.0s",
        "total_time_in_millis" : 2025
      },
      "verify_index" : {
        "check_index_time" : 0,
        "check_index_time_in_millis" : 0,
        "total_time" : "88ms",
        "total_time_in_millis" : 88
      }
    } ]
  }
}
```

响应包括恢复的所有物理文件及其大小的列表。

响应还包括各个恢复阶段的计时（以毫秒为单位）：

- 索引检索

- 音译重播

- 索引开始时间

此响应表示恢复已完成。所有恢复（无论是正在进行的还是已完成的）都保持在集群状态，并且可以随时报告。

要仅返回有关正在进行的恢复的信息，设置查询参数 `active_only` 为 `true`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-recovery.html)
