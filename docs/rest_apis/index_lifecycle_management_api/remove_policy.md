# 从索引移除策略 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [从索引移除策略 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ilm-remove-policy)。

:::::

从索引或数据流的后备索引中移除已分配的生命周期策略。

## 请求

```bash
POST <target>/_ilm/remove
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对受管理的索引拥有 `manage_ilm` [权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

对于索引，移除生命周期策略 API 会移除已分配的生命周期策略并停止管理指定的索引。

对于数据流，该 API 会从数据流的后备索引中移除所有已分配的生命周期策略并停止管理这些索引。

## 路径参数

- `<target>`

  （必需，字符串）要目标定位的数据流、索引和别名的逗号分隔列表。支持通配符（`*`）。要目标定位所有数据流和索引，使用 `*` 或 `_all`。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

以下示例从 `my-index-000001` 移除已分配的策略：

```bash
POST my-index-000001/_ilm/remove
```

如果请求成功，你将收到以下结果：

```json
{
  "has_failures" : false,
  "failed_indexes" : []
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-remove-policy.html)
