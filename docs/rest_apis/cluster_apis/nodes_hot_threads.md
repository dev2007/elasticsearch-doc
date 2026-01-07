# 节点热点线程 API

:::info 新 API 参考
如需获取最新的 API 详情，请参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

返回集群中每个选定节点上的热点线程。

## 请求

```bash
GET /_nodes/hot_threads
```

```bash
GET /_nodes/<node_id>/hot_threads
```

## 先决条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

此 API 提供集群中每个选定节点上热点线程的详细分析。输出为纯文本格式，包含每个节点顶部热点线程的明细。

## 路径参数

- `node_id`

  (可选，字符串) 用于限制返回信息的节点 ID 或名称的逗号分隔列表。

## 查询参数

- `ignore_idle_threads`

  (可选，布尔值) 如果为 true，已知的空闲线程（例如在套接字选择中等待，或从空队列中获取任务）将被过滤掉。默认为 `true`。

- `interval`

  (可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)) 执行第二次线程采样的时间间隔。默认为 `500ms`。

- `snapshots`

  (可选，整数) 线程堆栈跟踪的采样次数。默认为 `10`。

- `threads`

  (可选，整数) 指定要提供信息的热点线程数量。默认为 `3`。如果你将此 API 用于故障排除，请将此参数设置为较大的数字（例如 `9999`）以获取系统中所有线程的信息。

- `timeout`

  (可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)) 指定等待每个节点响应的时间。如果省略，则无限期等待。

- `type`

  (可选，字符串) 要采样的类型。可用选项为 `block`、`cpu` 和 `wait`。默认为 `cpu`。

## 示例

```bash
GET /_nodes/hot_threads
GET /_nodes/nodeId1,nodeId2/hot_threads
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-nodes-hot-threads.html)
