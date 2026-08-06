# 获取生命周期策略 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [获取生命周期策略 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ilm-get-lifecycle)。

:::::

检索生命周期策略。

## 请求

```bash
GET _ilm/policy
```

```bash
GET _ilm/policy/<policy_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_ilm` 或 `read_ilm` 或两者的[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

返回指定的策略定义。包含策略版本和最后修改日期。如果未指定策略，则返回所有已定义的策略。

## 路径参数

- `<policy_id>`

  （可选，字符串）策略的标识符。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

以下示例检索 `my_policy`：

```bash
GET _ilm/policy/my_policy
```

如果请求成功，响应体包含策略定义：

```json
{
  "my_policy": {
    "version": 1, 
    "modified_date": 82392349, 
    "policy": {
      "phases": {
        "warm": {
          "min_age": "10d",
          "actions": {
            "forcemerge": {
              "max_num_segments": 1
            }
          }
        },
        "delete": {
          "min_age": "30d",
          "actions": {
            "delete": {
              "delete_searchable_snapshot": true
            }
          }
        }
      }
    },
    "in_use_by" : { 
      "indices" : [],
      "data_streams" : [],
      "composable_templates" : []
    }
  }
}
```

1. 每当策略更新时，策略版本号就会递增。
2. 此策略的最后修改时间。
3. 当前使用此策略的索引、数据流或模板。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-get-lifecycle.html)
