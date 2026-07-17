# 创建或更新期望节点 API

::::warning 警告
此功能专为 Elasticsearch Service、Elastic Cloud Enterprise 和 Elastic Cloud on Kubernetes 间接使用而设计。不支持直接使用。
::::

:::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](/rest_apis/cluster_apis)。
:::

创建或更新期望节点。

## 请求

```bash
PUT /_internal/desired_nodes/<history_id>/<version>
```

```json
{
    "nodes" : [
        {
            "settings" : {
                 "node.name" : "instance-000187",
                 "node.external_id": "instance-000187",
                 "node.roles" : ["data_hot", "master"],
                 "node.attr.data" : "hot",
                 "node.attr.logical_availability_zone" : "zone-0"
            },
            "processors" : 8.0,
            "memory" : "58gb",
            "storage" : "2tb"
        }
    ]
}
```

## 查询参数

- `master_timeout`（[时间值](/rest_apis/api_convention/common_options#时间单位)）

  （可选）等待主节点的时间。如果在超时到期前主节点不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

- `dry_run`

  （可选，布尔值）如果为 `true`，请求将模拟更新并返回 `dry_run` 字段设为 `true` 的响应。

## 描述

此 API 创建或更新期望节点。外部编排器可以使用此 API 让 Elasticsearch 了解集群拓扑，包括未来的变更（如添加或移除节点）。利用此信息，系统能够做出更好的决策。

可以通过添加 `?dry_run` 查询参数以「试运行」模式运行更新。这将验证请求结果，但不会实际执行更新。

## 示例

在此示例中，为历史 ID 为 `Ywkh3INLQcuPT49f6kcppA` 的期望节点创建了新版本。此 API 仅接受单调递增的版本号。

```bash
PUT /_internal/desired_nodes/Ywkh3INLQcuPT49f6kcppA/100
```

```json
{
    "nodes" : [
        {
            "settings" : {
                 "node.name" : "instance-000187",
                 "node.external_id": "instance-000187",
                 "node.roles" : ["data_hot", "master"],
                 "node.attr.data" : "hot",
                 "node.attr.logical_availability_zone" : "zone-0"
            },
            "processors" : 8.0,
            "memory" : "58gb",
            "storage" : "2tb"
        }
    ]
}
```

API 返回以下结果：

```json
{
  "replaced_existing_history_id": false,
  "dry_run": false
}
```

此外，还可以指定处理器范围。这在 Elasticsearch 节点可以部署在主机上的环境中很有用，这些主机保证 Elasticsearch 进程可以使用的处理器数量至少为范围下限，最多为范围上限。这是 Linux 部署中使用 cgroups 的常见场景。

```bash
PUT /_internal/desired_nodes/Ywkh3INLQcuPT49f6kcppA/101
```

```json
{
    "nodes" : [
        {
            "settings" : {
                 "node.name" : "instance-000187",
                 "node.external_id": "instance-000187",
                 "node.roles" : ["data_hot", "master"],
                 "node.attr.data" : "hot",
                 "node.attr.logical_availability_zone" : "zone-0"
            },
            "processors_range" : {"min": 8.0, "max": 10.0},
            "memory" : "58gb",
            "storage" : "2tb"
        }
    ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-desired-nodes.html)
