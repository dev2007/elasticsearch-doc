# 重置特性 API

:::::warning 技术预览

此功能处于技术预览阶段，可能会在未来的版本中更改或移除。Elastic 会努力修复任何问题，但技术预览中的功能不受正式 GA 功能的支持 SLA 约束。

:::::

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [重置特性 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-features-reset-features)。

:::::

清除 Elasticsearch 特性存储在系统索引中的所有状态信息，包括安全和机器学习索引。

仅用于开发和测试。请勿在生产集群上重置特性。

## 请求

```bash
POST /_features/_reset
```

## 描述

通过重置所有 Elasticsearch 特性的特性状态，将集群恢复到与新安装相同的状态。这将删除存储在系统索引中的所有状态信息。

如果所有特性的状态都成功重置，响应码为 HTTP 200；如果任何特性的重置操作失败，响应码为 HTTP 500。

请注意，部分特性可能提供了重置特定系统索引的方法。使用此 API 会重置所有特性，包括内置特性和以插件形式实现的特性。

要列出将受影响的特性，请使用[获取特性 API](./get_features)。

在此节点上提交请求时安装的特性将被重置。如果不确定各个节点上安装了哪些插件，请在主节点上运行此请求。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

```bash
POST /_features/_reset
```

响应示例：

```json
{
  "features" : [
    {
      "feature_name" : "security",
      "status" : "SUCCESS"
    },
    {
      "feature_name" : "tasks",
      "status" : "SUCCESS"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/reset-features-api.html)
