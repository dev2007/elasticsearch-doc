# 创建或更新生命周期策略 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [创建或更新生命周期策略 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ilm-put-lifecycle)。

:::::

创建或更新生命周期策略。有关策略组件的定义，请参阅[索引生命周期](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-lifecycle-management.html)。

## 请求

```bash
PUT _ilm/policy/<policy_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_ilm` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。你还必须对策略管理的所有索引拥有**管理索引**[权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。ILM 以最后更新策略的用户身份执行操作。ILM 仅拥有在最后一次策略更新时分配给该用户的角色。

## 描述

创建生命周期策略。如果指定的策略已存在，则替换该策略并递增策略版本号。

仅存储最新版本的策略，无法回退到之前的版本。

## 路径参数

- `<policy_id>`

  （必需，字符串）策略的标识符。

  为避免与内置和 Fleet 管理的 ILM 策略发生命名冲突，请勿在你自己的 ILM 策略 ID 中使用 `@`。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

以下示例创建一个名为 `my_policy` 的新策略。此外，你可以使用 `_meta` 参数向策略添加任意元数据，`_meta` 参数是可选的，Elasticsearch 不会自动生成或使用它。要取消设置 `_meta`，请在替换策略时不指定它。要检查 `_meta`，你可以使用获取生命周期策略 API。

```json
PUT _ilm/policy/my_policy
{
  "policy": {
    "_meta": {
      "description": "used for nginx log",
      "project": {
        "name": "myProject",
        "department": "myDepartment"
      }
    },
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
          "delete": {}
        }
      }
    }
  }
}
```

如果请求成功，你将收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-put-lifecycle.html)
