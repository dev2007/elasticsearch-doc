# 别名 API

在一个请求中添加或移除多个索引别名。也可以删除具体的索引。

索引别名是用于引用一个或多个现有索引的辅助名称。大多数 Elasticsearch API 接受索引别名代替索引。

```bash
POST /_aliases
{
  "actions" : [
    { "add" : { "index" : "my-index-000001", "alias" : "alias1" } }
  ]
}
```

## 请求

`POST /_aliases`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有以下的[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)：
  - 为了使用 `add` 或 `remove` 操作，你必须对所有索引和索引别名有 `manage` 索引权限。
  - 为了使用 `remove_index` 操作，你必须对索引有 `manage` 索引权限。

## 描述

Elasticsearch 中的 API 在处理指定索引时接受一个索引名，在适用时接受多个索引。索引别名 API 允许为索引添加一个名字，所有 API 自动将别名转换为实际索引名字。别名也可以映射到多个索引，指定别名时别名将自动扩展到别名索引。别名还可以与在搜索和路由值时自动应用的筛选器相关联。别名不能与索引同名。

## 查询参数

- `master_timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 请求体

- `actions`
（必需，操作数组）待执行的操作集合。有效的操作包括：
  - `add`
  为索引添加一个别名
  - `remove`
  从索引移除一个别名
  - `remove_index`
  删除具体的索引，类似[删除索引 API](/rest_apis/index_apis/delete_index)。尝试移除一个索引别名会失败。

  你也可以在别名对象中执行这些操作。别名对象中有效的值包括：
  - `index`
  （字符串）用于执行操作的索引名字的通配符表达式。
  如果 `indices` 参数未被指定，此参数是必需的。
  ?> 你不能向索引别名添加[数据流](/data_streams/data_streams)。
  - `indices`
  （数组）用于执行操作的索引名数组。
  如果 `index` 参数未被指定，此参数是必需的。
  ?> 你不能向索引别名添加[数据流](/data_streams/data_streams)。
  - `alias`
  （字符串）待添加、移除或删除的以逗号分隔的列表或通配符表达式的索引别名。支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。
  如果 `aliases` 参数未被指定，对操作 `add` 或 `remove` 此参数是必需的。

  - `aliases`
  （字符串数组）待添加、移除或删除索引别名数组。支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。
  如果 `alias` 参数未被指定，对操作 `add` 或 `remove` 此参数是必需的。

  - `filter`
  （可选，查询对象）[过滤器查询](/query_dsl/compound_queries/boolean)用于限制索引别名。
  如果指定，索引别名仅用于过滤器返回的文档。
  参阅[过滤的别名](/rest_apis/index_apis/aliases?id=过滤的别名)获取示例。

  - `is_hidden`
  （可选，布尔值）如果为 `true`，默认会从通配符表达式中排除别名，除非通过参数 `expand_wildcards` 重载请求，类似 [隐藏索引](/index_modules/index_modules)。对于共享别名的所有索引，必须将此属性设置为相同的值。默认为 `false`。

  - `must_exist`
  （可选，布尔值）如果为 `true`，待移除的别名必须存在。默认为 `false`。

  - `is_write_index`
  （可选，布尔值）如果为 `true`，分配此索引作为别名的写索引。默认为 `false`。

  一个别名一次可以有一个写索引。

  参阅[写索引](/rest_apis/index_apis/aliases?id=写索引)获取示例。

  !> 对一个索引，别名没有显示地设置 `is_write_index: true`，且只引用了一个索引，那在引用另一个索引之前，引用的索引的行为将与写索引一致。

  - `routing`
  （可选，字符串）用于路由操作到指定分片的自定义值。

  参阅[路由](/rest_apis/index_apis/aliases?id=路由)获取示例。

  - `index_routing`
  （可选，字符串）用于别名索引操作的自定义[路由值](/mapping/metadata_fields/_routing_field)。

  参阅[路由](/rest_apis/index_apis/aliases?id=路由)获取示例。

  - `search_routing`
  （可选，字符串）用于别名搜索操作的自定义[路由值](/mapping/metadata_fields/_routing_field)。

  参阅[路由](/rest_apis/index_apis/aliases?id=路由)获取示例。

## 示例

### 添加一个别名

以下请求为索引 `test1` 添加别名 `alias1`。

```bash
POST /_aliases
{
  "actions" : [
    { "add" : { "index" : "test1", "alias" : "alias1" } }
  ]
}
```

索引别名支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。

```bash
POST /_aliases
{
  "actions" : [
    { "add" : { "index" : "logs", "alias" : "<logs_{now/M}>" } }
  ]
}
```

### 移除一个别名

以下请求移除别名 `alias1`。

```bash
POST /_aliases
{
  "actions" : [
    { "remove" : { "index" : "test1", "alias" : "alias1" } }
  ]
}
```

### 重命名一个别名

重命名一个别名，简单地在同一个 API 中执行操作 `remove`（移除）又 `add`（添加）。这个操作是原子的，不用担心别名会短时间的不指向索引。

```bash
POST /_aliases
{
  "actions" : [
    { "remove" : { "index" : "test1", "alias" : "alias1" } },
    { "add" : { "index" : "test1", "alias" : "alias2" } }
  ]
}
```

### 向多个索引添加一个别名

通过简单的几个操作 `add`（添加），就能将别名关联到多个索引。

```bash
POST /_aliases
{
  "actions" : [
    { "add" : { "index" : "test1", "alias" : "alias1" } },
    { "add" : { "index" : "test2", "alias" : "alias1" } }
  ]
}
```

多个索引也可以通过一个操作中的 `indices` 数组的语法指定：

```bash
POST /_aliases
{
  "actions" : [
    { "add" : { "indices" : ["test1", "test2"], "alias" : "alias1" } }
  ]
}
```

为了在一个操作中指定多个别名，相应的 `aliases` 数组语法也可以使用。

如上示例，匹配模式也可以用于关联一个别名给共享同一个名字的多个索引：

```bash
POST /_aliases
{
  "actions" : [
    { "add" : { "index" : "test*", "alias" : "all_test_indices" } }
  ]
}
```

在这种情况下，别名是一个即时别名，它将对所有当前匹配的索引进行分组，与此模式匹配的新索引将被添加或移除时，它不会自动更新。

索引指向多个索引的别名是错误的。

也可以在一个原子操作中用别名交换索引。这意味着在集群状态下，不会有别名指向无索引的时间点。然而，由于索引和搜索涉及多个步骤，因此正在运行或排队的请求可能会由于临时不存在索引而失败。

```bash
PUT test
PUT test_2
POST /_aliases
{
  "actions" : [
    { "add":  { "index": "test_2", "alias": "test" } },
    { "remove_index": { "index": "test" } }  
  ]
}
```

1. `PUT test` 误加的一个索引
2. `PUT test_2` 准备加的索引
3. `{ "remove_index": { "index": "test" } }` `remove_index` 类似[删除索引](/rest_apis/index_apis/delete_index)，只会移除具体的索引。

### 过滤的别名

带过滤器的别名提供了一种简单的方法来创建同一索引的不同“视图”。可以通过查询 DSL 定义过滤器，可应用于使用别名的所有搜索、按查询删除和其他类似操作。

为了创建带过滤器的别名，首先我们需要确认字段已经在映射中存在：

```bash
PUT /my-index-000001
{
  "mappings": {
    "properties": {
      "@timestamp": {
        "type": "date"
      },
      "user": {
        "properties": {
          "id": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```

现在我们可以在 `@timestamp` 和 `user.id` 上创建一个带过滤器的别名：

```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "my-index-000001",
        "alias": "alias2",
        "filter": {
          "bool": {
            "filter": [
              {
                "range": {
                  "@timestamp": {
                    "gte": "now-1d/d",
                    "lt": "now/d"
                  }
                }
              },
              {
                "term": {
                  "user.id": "kimchy"
                }
              }
            ]
          }
        }
      }
    }
  ]
}
```

### 路由

别名可以关联路由值。此功能可以与筛选别名一起使用，以避免不必要的分片操作。

以下命名创建一个指向索引 `test` 的新别名 `alias1`。在 `alias1` 被创建后，通过此别名的操作都会自动修改为使用值 `1` 来路由：

```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "test",
        "alias": "alias1",
        "routing": "1"
      }
    }
  ]
}
```

也可以为搜索和索引操作指定不同的路由值：

```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "test",
        "alias": "alias2",
        "search_routing": "1,2",
        "index_routing": "2"
      }
    }
  ]
}
```

如上例所示，搜索路由可以包含几个由逗号分隔的值。索引路由可以只包含一个值。

如果使用路由别名的搜索操作也具有路由参数，则使用该参数中指定的搜索别名路由和路由的交集。例如以下的命令中会使用 `2` 作为路由值：

```bash
GET /alias2/_search?q=user.id:kimchy&routing=2,3
```

### 写索引

可以将别名指向的索引关联为写索引。当指定时，指向多个索引的别名的所有索引和更新请求都将尝试解析为一个索引，即写入索引。每个别名一次只能分配一个索引作为写索引。如果未指定写索引，并且别名引用了多个索引，则不允许写。

可以使用别名 API 和索引创建 API 将与别名关联的一个索引指定为写索引。将索引设置为具有别名的写索引也会影响在翻转期间如何操作别名（参阅[带写索引的翻转]()）。

```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "test",
        "alias": "alias1",
        "is_write_index": true
      }
    },
    {
      "add": {
        "index": "test2",
        "alias": "alias1"
      }
    }
  ]
}
```

在这个例子中，我们将别名 `alias1` 关联到 `test` 和 `test2`，而 `test` 选择作为写索引。

```bash
PUT /alias1/_doc/1
{
  "foo": "bar"
}
```

索引到 `/alias1/_doc/1` 的新文档正如它是 `/test/_doc/1`。

```bash
GET /test/_doc/1
```

要交换别名的哪个索引来作为写索引，可用别名 API 来原子交换。

```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "test",
        "alias": "alias1",
        "is_write_index": false
      }
    }, {
      "add": {
        "index": "test2",
        "alias": "alias1",
        "is_write_index": true
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-aliases.html)
