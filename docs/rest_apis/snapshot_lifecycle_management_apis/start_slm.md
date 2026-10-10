# 启动快照生命周期管理 API

开启快照生命周期管理（SLM）。

```txt
POST /_slm/start
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage_slm` 集群权限才能使用此 API。

## 描述

如果 SLM 插件未运行，则启动它。集群形成时 SLM 会自动启动。仅当 SLM 已通过停止快照生命周期管理 API 被停止时，才需要手动启动 SLM。

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

以下示例启动 SLM 插件：

```txt
POST _slm/start
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/slm-api-start.html)
