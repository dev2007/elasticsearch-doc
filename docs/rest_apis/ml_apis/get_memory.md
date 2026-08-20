# 获取机器学习内存统计 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml)。

:::::

返回有关机器学习如何使用内存的信息。

## 请求

```bash
GET _ml/memory/_stats
```

```bash
GET _ml/memory/<node_id>/_stats
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

获取有关机器学习作业和训练模型在每个节点上如何使用内存的信息，包括 JVM 堆内内存和 JVM 外部的本机内存。

## 路径参数

- `<node_id>`

  （可选，字符串）要目标定位的集群中特定节点的名称。例如 `nodeId1,nodeId2` 或 `ml:true`。有关节点选择选项，请参阅[节点规范](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster.html#cluster-nodes)。

## 查询参数

- `human`

  指定此查询参数以在响应中包含带单位的字段。否则，响应中仅返回 `_in_bytes` 大小。

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 响应体

- `_nodes`

  （对象）包含有关请求选择的节点数量的统计信息。

  `_nodes` 的属性：

  - `failed`

    （整数）拒绝请求或未能响应的节点数量。如果此值不为 0，响应中会包含拒绝或失败的原因。

  - `successful`

    （整数）成功响应请求的节点数量。

  - `total`

    （整数）请求选择的节点总数。

- `cluster_name`

  （字符串）集群名称。基于 `cluster.name` 设置。

- `nodes`

  （对象）包含请求选择的节点的统计信息。

  `nodes` 的属性：

  - `<node_id>`

    （对象）包含该节点的统计信息。字段键为节点 ID。

    `<node_id>` 的属性：

    - `attributes`

      （对象）列出节点属性，如 `ml.machine_memory` 或 `ml.max_open_jobs` 设置。

    - `ephemeral_id`

      （字符串）节点的临时 ID。

    - `jvm`

      （对象）包含该节点的 Java 虚拟机（JVM）统计信息。

      `jvm` 的属性：

      - `heap_max`：（字节值）堆可使用的最大内存量。
      - `heap_max_in_bytes`：（整数）堆可使用的最大内存量（字节）。
      - `java_inference`：（字节值）当前用于缓存推理模型的 Java 堆内存量。
      - `java_inference_in_bytes`：（整数）当前用于缓存推理模型的 Java 堆内存量（字节）。
      - `java_inference_max`：（字节值）可用于缓存推理模型的最大 Java 堆内存量。
      - `java_inference_max_in_bytes`：（整数）可用于缓存推理模型的最大 Java 堆内存量（字节）。

    - `mem`

      （对象）包含该节点的内存使用统计信息。

      `mem` 的属性：

      - `adjusted_total`：（字节值）如果使用 `es.total_memory_bytes` 系统属性覆盖了物理内存量，则报告覆盖后的值。否则报告与 `total` 相同的值。
      - `adjusted_total_in_bytes`：（整数）覆盖后的物理内存量（字节）。
      - `ml`

        （对象）包含该节点上机器学习使用本机内存的统计信息。

        `ml` 的属性：

        - `anomaly_detectors`：（字节值）为异常检测作业保留的本机内存量。
        - `anomaly_detectors_in_bytes`：（整数）为异常检测作业保留的本机内存量（字节）。
        - `data_frame_analytics`：（字节值）为数据帧分析作业保留的本机内存量。
        - `data_frame_analytics_in_bytes`：（整数）为数据帧分析作业保留的本机内存量（字节）。
        - `max`：（字节值）机器学习本机进程可使用的最大本机内存量（与 JVM 堆分开）。
        - `max_in_bytes`：（整数）机器学习本机进程可使用的最大本机内存量（字节）。
        - `native_code_overhead`：（字节值）为加载机器学习本机代码共享库保留的本机内存量。
        - `native_code_overhead_in_bytes`：（整数）为加载机器学习本机代码共享库保留的本机内存量（字节）。
        - `native_inference`：（字节值）为具有 PyTorch `model_type` 的训练模型保留的本机内存量。
        - `native_inference_in_bytes`：（整数）为具有 PyTorch `model_type` 的训练模型保留的本机内存量（字节）。

      - `total`：（字节值）物理内存总量。
      - `total_in_bytes`：（整数）物理内存总量（字节）。

    - `name`

      （字符串）节点的人类可读标识符。基于节点名称设置。

    - `roles`

      （字符串数组）分配给节点的角色。请参阅节点设置。

    - `transport_address`

      （字符串）接受传输 HTTP 连接的主机和端口。

## 示例

```bash
GET _ml/memory/_stats?human
```

可能的响应：

```json
{
  "_nodes": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "cluster_name": "my_cluster",
  "nodes": {
    "pQHNt5rXTTWNvUgOrdynKg": {
      "name": "node-0",
      "ephemeral_id": "ITZ6WGZnSqqeT_unfit2SQ",
      "transport_address": "127.0.0.1:9300",
      "attributes": {
        "ml.machine_memory": "68719476736",
        "ml.max_jvm_size": "536870912"
      },
      "roles": [
        "data",
        "data_cold",
        "data_content",
        "data_frozen",
        "data_hot",
        "data_warm",
        "ingest",
        "master",
        "ml",
        "remote_cluster_client",
        "transform"
      ],
      "mem": {
        "total": "64gb",
        "total_in_bytes": 68719476736,
        "adjusted_total": "64gb",
        "adjusted_total_in_bytes": 68719476736,
        "ml": {
          "max": "19.1gb",
          "max_in_bytes": 20615843020,
          "native_code_overhead": "0b",
          "native_code_overhead_in_bytes": 0,
          "anomaly_detectors": "0b",
          "anomaly_detectors_in_bytes": 0,
          "data_frame_analytics": "0b",
          "data_frame_analytics_in_bytes": 0,
          "native_inference": "0b",
          "native_inference_in_bytes": 0
        }
      },
      "jvm": {
        "heap_max": "512mb",
        "heap_max_in_bytes": 536870912,
        "java_inference_max": "204.7mb",
        "java_inference_max_in_bytes": 214748364,
        "java_inference": "0b",
        "java_inference_in_bytes": 0
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-ml-memory.html)
