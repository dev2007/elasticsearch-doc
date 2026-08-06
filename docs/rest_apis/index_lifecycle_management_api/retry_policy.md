# 重试策略执行 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [重试策略执行 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ilm-retry-policy)。

:::::

对处于 ERROR 步骤的索引重试执行生命周期策略。

## 请求

```bash
POST <index>/_ilm/retry
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对受管理的索引拥有 `manage_ilm` [权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

将策略回退到发生错误的步骤并重新执行该步骤。使用 ILM 解释 API 可以确定索引是否处于 ERROR 步骤。

## 路径参数

- `<index>`

  （必需，字符串）要重试的索引标识符，以逗号分隔格式表示。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

以下示例重试 `my-index-000001` 的策略：

```bash
POST my-index-000001/_ilm/retry
```

如果请求成功，你将收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-retry-policy.html)
