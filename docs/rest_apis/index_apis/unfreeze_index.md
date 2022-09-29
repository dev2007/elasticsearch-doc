# 解冻索引 API [`X-Pack`]

解冻一个索引。

## 请求

`POST /<index>/_unfreeze`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标索引或索引别名必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

当一个冻结索引被解冻，索引会通过正常的恢复过程再次变为可写。参阅[已冻结索引](/frozen_indices/frozen_indices)和[冻结索引](/rest_apis/index_apis/freeze_index)。

::: danger 警告
冻结一个索引会在同一个 API 调用中关闭这个索引并且重新打开它。这将导致在短时间内主分片不被分配，直到再次分配主分片前集群会变为红色（red）。这个限制在未来可能被移除。
:::

## 路径参数

`<index>`

（必需，字符串）标识索引。

## 示例

以下的示例冻结和解冻一个索引。

```bash
POST /my-index-000001/_freeze
POST /my-index-000001/_unfreeze
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/unfreeze-index-api.html)
