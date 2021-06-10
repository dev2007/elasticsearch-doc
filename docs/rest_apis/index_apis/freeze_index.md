# 冻结索引 API

冻结一个索引。

## 请求

`POST /<index>/_freeze`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标索引或索引别名必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 描述

已冻结的索引在集群上几乎没有开销（除了在内存中维护它的元数据）且是只读的。只读索引禁止写操作，比如 [docs-index_](/rest_apis/search_apis/suggesters?id=索引) 或[强制合并](/rest_apis/index_apis/force_merge)。参阅[已冻结索引](/frozen_indices/frozen_indices)和[解冻索引](/rest_apis/index_apis/unfreeze_index)。

在数据流中的当前写索引不能被冻结。为了冻结当前写索引，数据流必须先被[翻转](/data_streams/data_streams?id=翻转)，这样一个新的写索引被创建，前一个写索引才能被冻结。

!> 冻结一个索引会在同一个 API 调用中关闭这个索引并且重新打开它。这将导致在短时间内主分片不被分配，直到再次分配主分片前集群会变为红色（red）。这个限制在未来可能被移除。

## 路径参数

`<index>`

（必需，字符串）标识索引。

## 示例

以下的示例冻结和解冻一个索引。

```bash
POST /my-index-000001/_freeze
POST /my-index-000001/_unfreeze
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/freeze-index-api.html)
