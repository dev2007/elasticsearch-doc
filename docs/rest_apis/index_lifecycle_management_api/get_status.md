# 获取索引生命周期管理状态 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [获取 ILM 操作模式 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ilm-get-status)。

:::::

检索当前索引生命周期管理（ILM）状态。

你可以使用启动 ILM 和停止 ILM API 来启动或停止 ILM。

## 请求

```bash
GET /_ilm/status
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_ilm` 或 `read_ilm` 或两者的[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 响应体

- `operation_mode`

  （字符串）ILM 的当前操作模式。

  `operation_mode` 的可能值：

  - `RUNNING`

    ILM 正在运行。

  - `STOPPING`

    ILM 正在完成进行中的敏感操作（如 shrink）。当这些操作完成后，ILM 将转换为 STOPPED。

  - `STOPPED`

    ILM 未在运行。

## 示例

以下示例获取 ILM 插件状态：

```bash
GET _ilm/status
```

如果请求成功，响应体显示操作模式：

```json
{
  "operation_mode": "RUNNING"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-get-status.html)
