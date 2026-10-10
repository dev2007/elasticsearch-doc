# 停止快照生命周期管理 API

关闭快照生命周期管理（SLM）。

```txt
POST /_slm/stop
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage_slm` 集群权限才能使用此 API。

## 描述

停止**所有快照生命周期管理（SLM）操作**并关闭 SLM 插件。

在对集群执行维护、需要防止 SLM 对你的数据流或索引执行任何操作时，此 API 非常有用。

- 停止 SLM **不会**停止任何正在进行的快照。
- 即使 SLM 已停止，你仍然可以使用执行快照生命周期策略 API **手动触发快照**。
- API 在请求被确认后立即返回响应，但插件可能会继续运行，直到正在进行的操作完成并且可以安全地停止。
- 使用获取快照生命周期管理状态 API 查看 SLM 是否正在运行。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。也可以设置为 `-1`，表示请求永不超时。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。在更新集群元数据后，等待集群中所有相关节点响应的期限。如果在超时期限到期之前未收到响应，集群元数据的更新仍然生效，但响应将指示未被完全确认。也可以设置为 `-1`，表示请求永不超时。

## 响应体

成功的调用返回以下响应：

```json
{
  "acknowledged": true
}
```

## 示例

以下示例停止 SLM 插件：

```txt
POST _slm/stop
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/slm-api-stop.html)
