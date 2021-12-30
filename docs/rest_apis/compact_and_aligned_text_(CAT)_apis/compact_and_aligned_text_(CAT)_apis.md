# 紧凑和对齐文本（CAT）API

## 介绍

JSON 用于计算机很棒。即使它的显示格式很好，但试图在数据中找到关系也是乏味的。人类的眼睛，尤其是在看终端时，需要紧凑和对齐的文本。紧凑和对齐文本（CAT）API 旨在满足这一需求。

!> cat API 仅用于使用 [Kibana 控制台](https://www.elastic.co/guide/en/kibana/7.16/console-kibana.html)或命令行的人使用。它们*不*适用于应用程序。对于应用程序使用，我们建议使用相应的 JSON API。

所有 cat 命令都接受查询字符串参数 `help` 以查看它们提供的所有标题和信息，而 `/_cat` 命令单独列出了所有可用的命令。

## 普通参数

### 冗长（Verbose）

每个命令都接受一个查询字符串参数 `v` 以打开详细输出。例如：

```bash
GET _cat/master?v=true
```

可能响应：

```bash
id                     host      ip        node
u_n93zwxThWHi1PDBJAGAg 127.0.0.1 127.0.0.1 u_n93zw
```

### 帮助（Help）

每个命令都接受一个查询字符串参数 `help`，该帮助将输出其可用列。例如：

```bash
GET _cat/master?help
```

可能响应：

```bash
id   |   | node id
host | h | host name
ip   |   | ip address
node | n | node name
```

?> 如果使用任何可选的 url 参数，则不支持 `help`。例如 `GET _cat/shards/my-index-000001?help` 或 `GET _cat/indices/my-index-*?help` 会导致错误。使用 `GET _cat/shards?help` 或 `GET _cat/indices?help` 替代。

### 头（Headers）

每个命令都接受一个查询字符串参数 `h`，该参数仅强制显示这些列。例如：

```bash
GET _cat/nodes?h=ip,port,heapPercent,name
```

响应：

```bash
127.0.0.1 9300 27 sLBaIGK
```

你还可以使用简单的通配符请求多个列，例如 `/_cat/thread_pool?h=ip,queue*` 以获取以 `queue` 开头的所有头（或别名）。

### 数字格式

许多命令提供几种类型的数字输出，可以是字节、大小或时间值。默认情况下，这些类型是人工格式化的，例如，`3.5mb` 而不是 `3763212`。人的价值观是不可数字排序的，所以为了在顺序重要的地方对这些价值观进行操作，你可以更改它。

假设您要查找集群中最大的索引（所有分片使用的存储，而不是文档数量）。 `/_cat/index` API 非常理想。您只需向API请求中添加三项内容：

1. `bytes` 查询字符串参数的值为 `b`，以获得字节级结果。
2. 值为 `store.size:desc` 的 `s`（sort，排序）参数，以及逗号分隔的 `index:asc`，将输出结果按分片存储大小降序，再按索引名字升序排列。
3. `v`（冗长，verbose）参数，用于在响应中包括列标题。

```bash
GET _cat/indices?bytes=b&s=store.size:desc,index:asc&v=true
```

此 API 返回以下响应：

```bash
health status index            uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   my-index-000001  u8FNjxh8Rfy_awN11oDKYQ   1   1       1200            0      72171         72171
green  open   my-index-000002  nYFWZEO7TUiOjLQXBaYJpA   1   0          0            0        230          230
```

如果你想修改 [time units](/rest_apis/api_convention/common_options?id=时间单位)，使用 `time` 参数。

如果你想修改 [size units](/rest_apis/api_convention/common_options?id=无单位数量)，使用 `size` 参数。

如果你想修改 [byte units](/rest_apis/api_convention/common_options?id=字节大小单位)，使用 `bytes` 参数。

### 以文本（text）、json、smile、yaml 或 cbor 形式响应

```bash
% curl 'localhost:9200/_cat/indices?format=json&pretty'
[
  {
    "pri.store.size": "650b",
    "health": "yellow",
    "status": "open",
    "index": "my-index-000001",
    "pri": "5",
    "rep": "1",
    "docs.count": "0",
    "docs.deleted": "0",
    "store.size": "650b"
  }
]
```

当前支持的格式（如 `?format=` 参数）：

- text（默认）
- json
- smile
- yaml
- cbor

或者，你可以将 “Accept” HTTP 头设置为适当的媒体格式。支持上述所有格式，GET 参数优先于标头。例如：

```bash
% curl '192.168.56.10:9200/_cat/indices?pretty' -H "Accept: application/json"
[
  {
    "pri.store.size": "650b",
    "health": "yellow",
    "status": "open",
    "index": "my-index-000001",
    "pri": "5",
    "rep": "1",
    "docs.count": "0",
    "docs.deleted": "0",
    "store.size": "650b"
  }
]
```

### 排序

每个命令都接受一个查询字符串参数 `s`，该参数按指定为参数值的列对表进行排序。列按名称或别名指定，并以逗号分隔的字符串形式提供。默认情况下，排序以升序方式完成。向列追加 `:desc` 将颠倒该列的顺序 `:asc` 也支持，但表现出与默认排序顺序相同的行为。

例如，对于排序字符串 `s=column1，column2:desc，column3`，表将按 column1 升序、column2 降序和 column3 升序进行排序。

```bash
GET _cat/templates?v=true&s=order:desc,index_patterns
```

返回：

```bash
name                  index_patterns order version
pizza_pepperoni       [*pepperoni*]  2
sushi_california_roll [*avocado*]    1     1
pizza_hawaiian        [*pineapples*] 1
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat.html)
