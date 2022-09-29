# 获取索引别名 API

返回一个或多个索引别名的信息。

索引别名是一个或多个索引的第二个名字。大多数 Elasticsearch API 都支持索引别名代替索引名称。

```bash
GET /my-index-000001/_alias/alias1
```

## 请求

`GET /_alias`

`GET /_alias/<alias>`

`GET /<index>/_alias/<alias>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对索引别名必须有 `view_index_metadata` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。如果你指定一个索引，你对这个索引也必须要有 `view_index_metadata` 或 `manage` 索引权限。

## 路径参数

- `<alias>`

（可选，字符串）用于限制请求的，逗号分隔列表或通配符的索引别名。

为了获取所有索引别名的信息，使用值 `_all` 或 `*`。

- `<index>`

（可选，字符串）用于限制请求的，逗号分隔列表或通配符的索引名。

## 查询参数

- `allow_no_indices`

（可选，布尔值）如果为 `false`，如果任何通配符表达式、索引别名或 `_all` 值只针对丢失或关闭的索引，则请求返回一个错误。即使请求以其他开放索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，但没有索引以 `bar` 开头，以 `foo*,bar*` 为目标的请求将返回错误。

默认为 `true`。

- `expand_wildcards`

（可选，字符串）通配符表达式能匹配的索引类型。如果请求目标为数据流，则此参数确定通配符表达式是否匹配隐藏的数据流则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔列表的值，如 `open,hidden`。有效的值有：

1. `all`
匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax#隐藏数据流和索引)（隐藏的）。
2. `open`
匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
3. `closed`
匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
4. `hidden`
匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
5. `none`
不接受通配符表达式。

默认为 `open`。

- `ignore_unavailable`

（可选，布尔值）如果为 `true`，请求不存在的索引将返回错误。默认为 `false`。

- `local`

（可选，布尔值）如果为 `true`，请求只从本地节点获取信息。默认为 `false`，意味着信息从主节点获取。

## 示例

### 获取一个索引的所有别名

你可以通过[创建索引 API](/rest_apis/index_apis/create_index)请求在索引创建时添加索引别名。

以下的创建索引 API 请求创建带有两个别名的索引 `logs_20302801`：

- `current_day`
- `2030`，仅返回索引 `logs_20302801` 中字段 `year` 的值为 `2030` 的文档

```bash
PUT /logs_20302801
{
  "aliases" : {
    "current_day" : {},
    "2030" : {
      "filter" : {
          "term" : {"year" : 2030 }
      }
    }
  }
}
```

以下获取索引别名 API 请求返回索引 `logs_20302801` 所有别名：

```bash
GET /logs_20302801/_alias/*
```

API 返回以下响应：

```bash
{
 "logs_20302801" : {
   "aliases" : {
    "current_day" : {
    },
     "2030" : {
       "filter" : {
         "term" : {
           "year" : 2030
         }
       }
     }
   }
 }
}
```

### 获取一个指定别名

以下的索引别名 API 请求返回别名 `2030`：

```bash
GET /_alias/2030
```

API 返回以下响应：

```bash
{
  "logs_20302801" : {
    "aliases" : {
      "2030" : {
        "filter" : {
          "term" : {
            "year" : 2030
          }
        }
      }
    }
  }
}
```

### 获取基于通配符的别名

以下的索引别名 API 请求返回以 `20` 开头的任何别名：

```bash
GET /_alias/20*
```

API 返回以下响应：

```bash
{
  "logs_20302801" : {
    "aliases" : {
      "2030" : {
        "filter" : {
          "term" : {
            "year" : 2030
          }
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-alias.html)
