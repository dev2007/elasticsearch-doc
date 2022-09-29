# 验证 API

验证潜在的昂贵查询，而不执行它。

```bash
GET my-index-000001/_validate/query?q=user.id:kimchy
```

## 请求

`GET /<target>/_validate/<query>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须对目标数据流、索引或别名有 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

验证 API 允许你在不执行查询的情况下验证潜在的昂贵查询。查询可以作为路径参数或在请求正文中发送。

## 路径参数

- `<target>`
  （可选，字符串）用于限制请求的，逗号分隔的数据流、索引。也支持通配符表达式（*）。为了搜索所有数据流和索引，忽略此参数或使用 `*` 或 `_all`。

- `query`
  （可选，[查询对象](/query_dsl/query_dsl)）使用 [Query DSL](/query_dsl/query_dsl) 定义搜索定义。

## 查询参数

- `all_shards`
  （可选，布尔值）如果为 `true`，对所有分片执行验证，而不是对每个索引执行一个随机分片。

- `allow_no_indices`
  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

- `default_operator`
  （可选，字符串）查询字符串查询的默认运算符：`AND` 或 `OR`。默认为 `OR`。

  仅当 `q` 查询参数被指定时，此参数可用。

- `df`
  （可选，字符串）在查询字符串中未给出字段前缀的情况下，要用作默认值的字段。

  仅当 `q` 查询参数被指定时，此参数可用。

- `expand_wildcards`
  （可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效的值有：

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

- `explain`
  （可选，布尔值）如果为 `true`，作为命中的一部分返回有关分数计算的详细信息。默认为 `false`。

- `ignore_unavailable`
  （可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `lenient`
  （可选，布尔值）如果为 `true`，将忽略查询字符串中基于格式的查询失败（例如向数字字段提供文本）。默认为 `false`。

- `rewrite`
  （可选，布尔值）如果为 `true`，则返回显示将执行的实际 Lucene 查询的更详细解释。默认为 `false`。

- `q`
  （可选，字符串）Lucene 查询字符串语法中的查询。

## 示例

```bash
PUT my-index-000001/_bulk?refresh
{"index":{"_id":1}}
{"user" : { "id": "kimchy" }, "@timestamp" : "2099-11-15T14:12:12", "message" : "trying out Elasticsearch"}
{"index":{"_id":2}}
{"user" : { "id": "kimchi" }, "@timestamp" : "2099-11-15T14:12:13", "message" : "My user ID is similar to kimchy!"}
```

当发送验证请求时：

```bash
GET my-index-000001/_validate/query?q=user.id:kimchy
```

响应包含 `valid:true`：

```bash
{"valid":true,"_shards":{"total":1,"successful":1,"failed":0}}
```

查询也可以在请求正文中发送：

```bash
GET my-index-000001/_validate/query
{
  "query" : {
    "bool" : {
      "must" : {
        "query_string" : {
          "query" : "*:*"
        }
      },
      "filter" : {
        "term" : { "user.id" : "kimchy" }
      }
    }
  }
}
```

::: tip 提示
在正文中发送的查询必须嵌套在查询键中，这与 [搜索 API](/rest_apis/search_apis/search)的工作原理相同
:::

如果查询无效，`valid` 将为 `false`。这里的查询无效，因为 Elasticsearch 知道 `post_date` 字段应该是动态映射的日期，而 *foo* 不能正确解析为日期：

```bash
GET my-index-000001/_validate/query
{
  "query": {
    "query_string": {
      "query": "@timestamp:foo",
      "lenient": false
    }
  }
}
```

```json
{"valid":false,"_shards":{"total":1,"successful":1,"failed":0}}
```

### explain 参数

可以指定 `explain` 参数以获取有关查询失败原因的更详细信息：

```bash
GET my-index-000001/_validate/query?explain=true
{
  "query": {
    "query_string": {
      "query": "@timestamp:foo",
      "lenient": false
    }
  }
}
```

API 返回以下响应：

```json
{
  "valid" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "failed" : 0
  },
  "explanations" : [ {
    "index" : "my-index-000001",
    "valid" : false,
    "error" : "my-index-000001/IAEc2nIXSSunQA_suI0MLw] QueryShardException[failed to create query:...failed to parse date field [foo]"
  } ]
}
```

## rewrite 参数

当查询有效时，解释默认为该查询的字符串表示形式。当 `rewrite` 设置为 `true` 时，说明将更详细地显示将执行的实际 Lucene 查询。

```bash
GET my-index-000001/_validate/query?rewrite=true
{
  "query": {
    "more_like_this": {
      "like": {
        "_id": "2"
      },
      "boost_terms": 1
    }
  }
}
```

API 返回以下响应：

```json
{
   "valid": true,
   "_shards": {
      "total": 1,
      "successful": 1,
      "failed": 0
   },
   "explanations": [
      {
         "index": "my-index-000001",
         "valid": true,
         "explanation": "((user:terminator^3.71334 plot:future^2.763601 plot:human^2.8415773 plot:sarah^3.4193945 plot:kyle^3.8244398 plot:cyborg^3.9177752 plot:connor^4.040236 plot:reese^4.7133346 ... )~6) -ConstantScore(_id:2)) #(ConstantScore(_type:_doc))^0.0"
      }
   ]
}
```

### rewrite 和 all_shards 参数

默认情况下，请求仅在随机选择的单个分片上执行。查询的详细解释可能取决于命中的分片，因此可能因请求而异。因此，在查询重写的情况下，应该使用 `all_shards` 参数从所有可用的分片获取响应。

```bash
GET my-index-000001/_validate/query?rewrite=true&all_shards=true
{
  "query": {
    "match": {
      "user.id": {
        "query": "kimchy",
        "fuzziness": "auto"
      }
    }
  }
}
```

API 返回以下响应：

```json
{
  "valid": true,
  "_shards": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "explanations": [
    {
      "index": "my-index-000001",
      "shard": 0,
      "valid": true,
      "explanation": "(user.id:kimchi)^0.8333333 user.id:kimchy"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-validate.html)
