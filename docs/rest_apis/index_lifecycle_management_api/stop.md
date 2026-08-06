# 停止 ILM API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [停止 ILM API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ilm-stop)。

:::::

停止索引生命周期管理（ILM）插件。

## 请求

```bash
POST /_ilm/stop
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_ilm` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

中止所有生命周期管理操作并停止 ILM 插件。当你对集群进行维护并需要阻止 ILM 对索引执行任何操作时，这非常有用。

API 在停止请求被确认后即返回，但插件可能会继续运行，直到进行中的操作完成并且可以安全停止插件。使用获取 ILM 操作模式 API 可以查看 ILM 是否正在运行。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

以下示例停止 ILM 插件：

```bash
POST _ilm/stop
```

如果请求未遇到错误，你将收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-stop.html)
