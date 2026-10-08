# 更新用户配置文件数据 API

更新用户配置文件文档的 `labels` 和 `data` 字段。

```txt
POST /_security/profile/<uid>/_data
```

## 前置条件

- 要使用此 API，你必须具有以下权限之一：
  - `manage_user_profile` 集群权限。
  - 针对请求中引用的命名空间的 `update_profile_data` 全局权限。

## 描述

:::important 重要

用户配置文件功能仅供 Kibana 以及 Elastic 的可观测性、企业搜索和 Elastic Security 解决方案使用。个别用户和外部应用程序不应直接调用此 API。Elastic 保留在未来版本中更改或删除此功能而不事先通知的权利。

:::

更新用户配置文件 API 使用 JSON 对象更新与指定唯一 ID 关联的用户配置文件文档的 `labels` 和 `data` 字段：

- 新的键及其值会被添加到配置文件文档中。
- 冲突的键会被请求中包含的数据替换。

对于 `labels` 和 `data`，内容按顶层字段进行命名空间隔离。`update_profile_data` 全局权限仅授予更新允许的命名空间的权限。

## 路径参数

`<uid>`

（必需，字符串）用户配置文件的唯一标识符。

## 查询参数

`if_seq_no`

（可选，整数）仅当文档具有此序列号时才执行操作。参见[乐观并发控制](/rest_apis/api_convention/optimistic_concurrency_control)。

`if_primary_term`

（可选，整数）仅当文档具有此主 term 时才执行操作。参见[乐观并发控制](/rest_apis/api_convention/optimistic_concurrency_control)。

`refresh`

（可选，枚举值）默认为 `false`。如果为 `true`，Elasticsearch 会刷新受影响的分片以使此操作对搜索可见；如果为 `wait_for`，则等待刷新以使此操作对搜索可见；如果为 `false`，则不执行与刷新相关的任何操作。

## 请求体

`labels`

（部分情况下必需，对象）要与用户配置文件关联的可搜索数据。支持嵌套的数据结构。`labels` 对象内的顶层键不能以下划线（`_`）开头，也不能包含句点（`.`）。

`data`

（部分情况下必需，对象）要与用户配置文件关联的不可搜索数据。支持嵌套的数据结构。`data` 对象内的顶层键同样不能以 `_` 开头或包含 `.`。`data` 对象不可搜索，但可以通过获取用户配置文件 API 检索。

## 响应体

成功的调用返回以下 JSON 结构，表示请求已被确认：

```json
{
  "acknowledged": true
}
```

## 示例

以下示例首次更新用户配置文件的数据：

```txt
POST /_security/profile/u_P_0BMHgaOK3p7k-PFWUCbw9dQ-UFjt01oWJ_Dp2PmPc_0/_data
{
  "labels": {
    "direction": "east"
  },
  "data": {
    "app1": {
      "theme": "default"
    }
  }
}
```

以下示例替换部分键并添加新键：

```txt
POST /_security/profile/u_P_0BMHgaOK3p7k-PFWUCbw9dQ-UFjt01oWJ_Dp2PmPc_0/_data
{
  "labels": {
    "direction": "west"
  },
  "data": {
    "app1": {
      "font": "large"
    }
  }
}
```

以下示例通过获取用户配置文件 API（配合 `data=*`）查看合并后的数据：

```txt
GET /_security/profile/u_P_0BMHgaOK3p7k-PFWUCbw9dQ-UFjt01oWJ_Dp2PmPc_0?data=*
```

API 返回以下响应（注意 `direction` 已从 `east` 更新为 `west`，`font` 为新增键，`theme` 被保留）：

```json
{
  "profiles": [
    {
      "uid": "u_P_0BMHgaOK3p7k-PFWUCbw9dQ-UFjt01oWJ_Dp2PmPc_0",
      "enabled": true,
      "last_synchronized": 1642650651037,
      "user": {
        "username": "jackrea",
        "roles": [ "admin" ],
        "realm_name": "native",
        "full_name": "Jack Reacher",
        "email": "jackrea@example.com"
      },
      "labels": {
        "direction": "west"
      },
      "data": {
        "app1": {
          "theme": "default",
          "font": "large"
        }
      },
      "_doc": {
        "_primary_term": 88,
        "_seq_no": 66
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-update-user-profile-data.html)
