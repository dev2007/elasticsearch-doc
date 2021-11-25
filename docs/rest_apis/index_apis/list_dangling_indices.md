# 列出悬挂索引 API

列出悬挂索引。

## 请求

```bash
GET /_dangling
```

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=集群权限)来使用此 API。

## 描述

如果 Elasticsearch 遇到当前集群状态中缺少的索引数据，则认为这些索引处于悬挂状态。例如，如果在 Elasticsearch 节点脱机时删除多个 `cluster.index.tombstones.size` 索引，则可能会发生这种情况。

使用此 API 列出悬挂索引，你就可以[导入](/rest_apis/index_apis/import_dangling_index)或[删除](/rest_apis/index_apis/delete_dangling_index)它们。

## 示例

API 返回以下响应：

```bash
{
  "dangling_indices": [
   {
    "index_name": "my-index-000001",
    "index_uuid": "zmM4e0JtBkeUjiHD-MihPQ",
    "creation_date_millis": 1589414451372,
    "node_ids": [
      "pL47UN3dAb2d5RCWP6lQ3e"
    ]
   }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/dangling-indices-list.html)
