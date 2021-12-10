# 获取字段映射 API

获取一个或多个字段的[映射定义](/mapping/mapping)。对数据流而言，此 API 获取数据流的备份索引的字段定义。

如果你不需要[完整的映射](/rest_apis/index_apis/get_mapping)或者索引映射包含大量字段时，此 API 就是有用的。

```bash
GET /my-index-000001/_mapping/field/user
```

## 请求

`GET /_mapping/field/<field>`

`GET /<target>/_mapping/field/<field>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或索引别名必须有 `view_index_metadata` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

`<target>`

（可选，字符串）用于限制请求的，逗号分隔的数据流、索引和别名列表。支持通配符（*）。为了标明所有数据流和索引，省略这个参数或者使用 `*` 或 `_all`。

`<field>`

（可选，字符串）逗号分隔的字段列表或者通配符，用于限制返回的信息。

## 查询参数

- `allow_no_indices`

（可选，布尔值）如果为 `false`，如果任何通配符表达式、索引别名或 `_all` 值只针对丢失或关闭的索引，则请求返回一个错误。即使请求以其他开放索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，但没有索引以 `bar` 开头，以 `foo*,bar*` 为目标的请求将返回错误。

默认为 `true`。

- `expand_wildcards`

（可选，字符串）通配符表达式能匹配的索引类型。如果请求目标为数据流，则此参数确定通配符表达式是否匹配隐藏的数据流则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔列表的值，如 `open,hidden`。有效的值有：

1. `all`
匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax?id=隐藏数据流和索引)（隐藏的）。
2. `open`
匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
3. `closed`
匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
4. `hidden`
匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
5. `none`
不接受通配符表达式。

默认为 `open`。

- `include_type_name`
[~~7.0.0~~开始不推荐] （可选，布尔值）如果为 `true`，映射体中需要映射类型。

- `ignore_unavailable`
（可选，布尔值）如果为 `true`，请求不存在的索引将返回错误。默认为 `false`。

- `include_defaults`
（可选，布尔值）如果为 `true`，响应包含默认的映射值。默认为 `false`。

- `local`
（可选，布尔值）如果为 `true`，请求只从本地节点获取信息。默认为 `false`，意味着信息从主节点获取。

## 示例

### 索引设置示例

当创建新索引时，你可以提供字段映射。以下的[创建索引](/rest_apis/index_apis/creat_index) API 请求，创建一个名为 `publications` 的索引，并有几个字段映射。

```bash
PUT /publications
{
  "mappings": {
    "properties": {
      "id": { "type": "text" },
      "title": { "type": "text" },
      "abstract": { "type": "text" },
      "author": {
        "properties": {
          "id": { "type": "text" },
          "name": { "type": "text" }
        }
      }
    }
  }
}
```

以下请求仅返回字段 `title`  的映射：

```bash
GET publications/_mapping/field/title
```

API 返回以下的响应：

```bash
{
   "publications": {
      "mappings": {
          "title": {
             "full_name": "title",
             "mapping": {
                "title": {
                   "type": "text"
                }
             }
          }
       }
   }
}
```

### 指定字段

获取映射 API 允许你指定逗号分隔的字段列表。

例如，为了选择 `author` 字段的 `id`，你必须使用命名 `author.id`。

```bash
GET publications/_mapping/field/author.id,abstract,name
```

返回：

```bash
{
   "publications": {
      "mappings": {
        "author.id": {
           "full_name": "author.id",
           "mapping": {
              "id": {
                 "type": "text"
              }
           }
        },
        "abstract": {
           "full_name": "abstract",
           "mapping": {
              "abstract": {
                 "type": "text"
              }
           }
        }
     }
   }
}
```

获取字段映射 API 也支持通配符。

```bash
GET publications/_mapping/field/a*
```

返回：

```bash
{
   "publications": {
      "mappings": {
         "author.name": {
            "full_name": "author.name",
            "mapping": {
               "name": {
                 "type": "text"
               }
            }
         },
         "abstract": {
            "full_name": "abstract",
            "mapping": {
               "abstract": {
                  "type": "text"
               }
            }
         },
         "author.id": {
            "full_name": "author.id",
            "mapping": {
               "id": {
                  "type": "text"
               }
            }
         }
      }
   }
}
```

### 多目标和字段

获取字段映射 API 可以用于一次请求获取多个数据流或索引的多个字段映射。

路径参数中的 `<target>` 及 `<field>` 都支持逗号分隔的列表和通配符。

你也可以忽略参数 `<target>` 或者使用 `*` 或 `_all` 来指示集群中的所有数据流和索引。

同样的，你也可以忽略参数 `<field>`，或者使用 `*` 来获取目标数据流或索引的所有字段映射。然而参数 `<field>` 不支持 `_all` 值。

例如，以下的请求获取在任何名为 `my-index-000001` 或 `my-index-000002` 的数据流或索引中 `message` 字段的映射。

```bash
GET /my-index-000001,my-index-000002/_mapping/field/message
```

以下的请求获取集群中任何数据流或索引的字段 `message` 和 `user.id` 的映射。

```bash
GET /_all/_mapping/field/message
```

以下的请求获取集群中任何数据流或索引带有 `id` 属性的字段的映射。

```bash
GET /_all/_mapping/field/*.id
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-field-mapping.html)
