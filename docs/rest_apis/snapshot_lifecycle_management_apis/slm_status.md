# 获取快照生命周期管理状态 API

检索快照生命周期管理（SLM）插件的状态。

```txt
GET /_slm/status
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage_slm` 或 `read_slm` 集群权限才能使用此 API。

## 描述

响应中的 `operation_mode` 字段显示以下三种状态之一：

- `RUNNING`：SLM 插件正在运行。
- `STOPPING`：SLM 插件正在停止。
- `STOPPED`：SLM 插件已停止。

可以使用启动快照生命周期管理 API 和停止快照生命周期管理 API 来停止和重启 SLM 插件。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。可以设置为 `-1` 表示永不超时。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。在更新集群元数据后，等待集群中所有相关节点响应的期限。如果在超时期限到期之前未收到响应，集群元数据的更新仍然生效，但响应将指示未被完全确认。可以设置为 `-1` 表示永不超时。

## 示例

以下示例检索 SLM 插件的状态：

```txt
GET _slm/status
```

API 返回以下响应：

```json
{
  "operation_mode": "RUNNING"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/slm-api-get-status.html)
