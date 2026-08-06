# 启动 ILM API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [启动 ILM API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ilm-start)。

:::::

启动索引生命周期管理（ILM）插件。

## 请求

```bash
POST /_ilm/start
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_ilm` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

如果 ILM 插件当前已停止，则启动该插件。集群形成时 ILM 会自动启动。仅当使用停止 ILM API 停止 ILM 后，才需要重新启动 ILM。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

以下示例启动 ILM 插件：

```bash
POST _ilm/start
```

如果请求成功，你将收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-start.html)
