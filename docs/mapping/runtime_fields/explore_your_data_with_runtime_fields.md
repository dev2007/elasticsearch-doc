# 使用运行时字段探索你的数据

设想有一批日志数据，你希望从中提取字段。索引这些数据既耗时又占用大量磁盘空间，而你只想先探索数据结构，不想预先确定 schema。

你知道日志数据中包含想要提取的特定字段。在本例中，我们重点关注 `@timestamp` 和 `message` 字段。通过使用运行时字段，你可以定义脚本在搜索时为这些字段计算值。

## 将索引字段作为起点

你可以从一个简单的例子开始，将 `@timestamp` 和 `message` 字段作为索引字段添加到 `my-index-000001` 的映射中。为了保持灵活性，`message` 字段使用 `wildcard` 作为字段类型：

```bash
PUT /my-index-000001/
{
  "mappings": {
    "properties": {
      "@timestamp": {
        "format": "strict_date_optional_time||epoch_second",
        "type": "date"
      },
      "message": {
        "type": "wildcard"
      }
    }
  }
}
```

## 摄取一些数据

映射好要检索的字段之后，将日志数据中的一些记录索引到 Elasticsearch。以下请求使用批量 API 将原始日志数据索引到 `my-index-000001`。你不必索引全部日志数据，只需使用一小部分样本来试验运行时字段即可。

最后一个文档不是有效的 Apache 日志格式，但我们可以在脚本中处理这种情况。

```bash
POST /my-index-000001/_bulk?refresh
{"index":{}}
{"timestamp":"2020-04-30T14:30:17-05:00","message":"40.135.0.0 - - [30/Apr/2020:14:30:17 -0500] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"}
{"index":{}}
{"timestamp":"2020-04-30T14:30:53-05:00","message":"232.0.0.0 - - [30/Apr/2020:14:30:53 -0500] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"}
{"index":{}}
{"timestamp":"2020-04-30T14:31:12-05:00","message":"26.1.0.0 - - [30/Apr/2020:14:31:12 -0500] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"}
{"index":{}}
{"timestamp":"2020-04-30T14:31:19-05:00","message":"247.37.0.0 - - [30/Apr/2020:14:31:19 -0500] \"GET /french/splash_inet.html HTTP/1.0\" 200 3781"}
{"index":{}}
{"timestamp":"2020-04-30T14:31:22-05:00","message":"247.37.0.0 - - [30/Apr/2020:14:31:22 -0500] \"GET /images/hm_nbg.jpg HTTP/1.0\" 304 0"}
{"index":{}}
{"timestamp":"2020-04-30T14:31:27-05:00","message":"252.0.0.0 - - [30/Apr/2020:14:31:27 -0500] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"}
{"index":{}}
{"timestamp":"2020-04-30T14:31:28-05:00","message":"not a valid apache log"}
```

此时，你可以查看 Elasticsearch 是如何存储原始数据的。

```bash
GET /my-index-000001
```

映射中包含两个索引字段：`@timestamp` 和 `message`。

```json
{
  "my-index-000001" : {
    "aliases" : { },
    "mappings" : {
      "properties" : {
        "@timestamp" : {
          "type" : "date",
          "format" : "strict_date_optional_time||epoch_second"
        },
        "message" : {
          "type" : "wildcard"
        },
        "timestamp" : {
          "type" : "date"
        }
      }
    },
    ...
  }
}
```

## 使用 grok 模式定义运行时字段

如果你想检索包含 `clientip` 的结果，可以将该字段作为运行时字段添加到映射中。以下运行时脚本定义了一个 grok 模式，从文档的单个文本字段中提取结构化字段。grok 模式类似于支持可复用别名表达式的正则表达式。

该脚本匹配 `%{COMMONAPACHELOG}` 日志模式，该模式理解 Apache 日志的结构。如果模式匹配（`clientip != null`），脚本会输出匹配到的 IP 地址的值。如果模式不匹配，脚本只会返回字段值而不会崩溃。

```bash
PUT my-index-000001/_mappings
{
  "runtime": {
    "http.client_ip": {
      "type": "ip",
      "script": """
        String clientip=grok('%{COMMONAPACHELOG}').extract(doc["message"].value)?.clientip;
        if (clientip != null) emit(clientip); 
      """
    }
  }
}
```

这个条件确保即使 `message` 的模式不匹配，脚本也不会崩溃。

或者，你也可以在搜索请求的上下文中定义相同的运行时字段。运行时定义和脚本与之前在索引映射中定义的完全相同。只需将该定义复制到搜索请求的 `runtime_mappings` 部分下，并包含一个匹配该运行时字段的查询。此查询返回的结果与在索引映射中为 `http.clientip` 运行时字段定义搜索查询时相同，但仅在此特定搜索的上下文中有效：

```bash
GET my-index-000001/_search
{
  "runtime_mappings": {
    "http.clientip": {
      "type": "ip",
      "script": """
        String clientip=grok('%{COMMONAPACHELOG}').extract(doc["message"].value)?.clientip;
        if (clientip != null) emit(clientip);
      """
    }
  },
  "query": {
    "match": {
      "http.clientip": "40.135.0.0"
    }
  },
  "fields" : ["http.clientip"]
}
```

## 定义组合运行时字段

你还可以定义一个 `composite` 运行时字段，从单个脚本输出多个字段。你可以定义一组带类型的子字段并输出一个值映射。在搜索时，每个子字段都会检索映射中与其名称关联的值。这意味着你只需指定一次 grok 模式，就可以返回多个值：

```bash
PUT my-index-000001/_mappings
{
  "runtime": {
    "http": {
      "type": "composite",
      "script": "emit(grok(\"%{COMMONAPACHELOG}\").extract(doc[\"message\"].value))",
      "fields": {
        "clientip": {
          "type": "ip"
        },
        "verb": {
          "type": "keyword"
        },
        "response": {
          "type": "long"
        }
      }
    }
  }
}
```

## 搜索特定的 IP 地址

使用 `http.clientip` 运行时字段，你可以定义一个简单的查询来搜索特定的 IP 地址并返回所有相关字段。

```bash
GET my-index-000001/_search
{
  "query": {
    "match": {
      "http.clientip": "40.135.0.0"
    }
  },
  "fields" : ["*"]
}
```

API 返回以下结果。由于 `http` 是一个 `composite` 运行时字段，响应在 `fields` 下包含了每个子字段，以及匹配查询的所有关联值。无需提前构建数据结构，你就可以用有意义的方式搜索和探索数据，从而进行试验并确定要索引哪些字段。

```json
{
  ...
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "my-index-000001",
        "_id" : "sRVHBnwBB-qjgFni7h_O",
        "_score" : 1.0,
        "_source" : {
          "timestamp" : "2020-04-30T14:30:17-05:00",
          "message" : "40.135.0.0 - - [30/Apr/2020:14:30:17 -0500] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"
        },
        "fields" : {
          "http.verb" : [
            "GET"
          ],
          "http.clientip" : [
            "40.135.0.0"
          ],
          "http.response" : [
            200
          ],
          "message" : [
            "40.135.0.0 - - [30/Apr/2020:14:30:17 -0500] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"
          ],
          "http.client_ip" : [
            "40.135.0.0"
          ],
          "timestamp" : [
            "2020-04-30T19:30:17.000Z"
          ]
        }
      }
    ]
  }
}
```

还记得脚本中的那个 `if` 语句吗？

```bash
if (clientip != null) emit(clientip);
```

如果脚本不包含此条件，查询会在任何不匹配该模式的分片上失败。通过包含此条件，查询会跳过与 grok 模式不匹配的数据。

## 搜索特定范围内的文档

你还可以对 `timestamp` 字段运行 range 查询。以下查询返回 `timestamp` 大于或等于 `2020-04-30T14:31:27-05:00` 的文档：

```bash
GET my-index-000001/_search
{
  "query": {
    "range": {
      "timestamp": {
        "gte": "2020-04-30T14:31:27-05:00"
      }
    }
  }
}
```

响应中包含日志格式不匹配、但时间戳落在定义范围内的文档。

```json
{
  ...
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "my-index-000001",
        "_id" : "hdEhyncBRSB6iD-PoBqe",
        "_score" : 1.0,
        "_source" : {
          "timestamp" : "2020-04-30T14:31:27-05:00",
          "message" : "252.0.0.0 - - [30/Apr/2020:14:31:27 -0500] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"
        }
      },
      {
        "_index" : "my-index-000001",
        "_id" : "htEhyncBRSB6iD-PoBqe",
        "_score" : 1.0,
        "_source" : {
          "timestamp" : "2020-04-30T14:31:28-05:00",
          "message" : "not a valid apache log"
        }
      }
    ]
  }
}
```

## 使用 dissect 模式定义运行时字段

如果你不需要正则表达式的强大功能，可以使用 dissect 模式代替 grok 模式。dissect 模式基于固定分隔符进行匹配，但通常比 grok 更快。

你可以使用 dissect 来实现与使用 grok 模式解析 Apache 日志相同的结果。dissect 不匹配日志模式，而是包含你想要丢弃的字符串部分。特别注意要丢弃的字符串部分，这有助于构建成功的 dissect 模式。

```bash
PUT my-index-000001/_mappings
{
  "runtime": {
    "http.client.ip": {
      "type": "ip",
      "script": """
        String clientip=dissect('%{clientip} %{ident} %{auth} [%{@timestamp}] "%{verb} %{request} HTTP/%{httpversion}" %{status} %{size}').extract(doc["message"].value)?.clientip;
        if (clientip != null) emit(clientip);
      """
    }
  }
}
```

类似地，你可以定义一个 dissect 模式来提取 HTTP 响应码：

```bash
PUT my-index-000001/_mappings
{
  "runtime": {
    "http.responses": {
      "type": "long",
      "script": """
        String response=dissect('%{clientip} %{ident} %{auth} [%{@timestamp}] "%{verb} %{request} HTTP/%{httpversion}" %{response} %{size}').extract(doc["message"].value)?.response;
        if (response != null) emit(Integer.parseInt(response));
      """
    }
  }
}
```

然后你可以运行查询，使用 `http.responses` 运行时字段检索特定的 HTTP 响应。使用 `_search` 请求的 `fields` 参数来指定要检索的字段：

```bash
GET my-index-000001/_search
{
  "query": {
    "match": {
      "http.responses": "304"
    }
  },
  "fields" : ["http.client_ip","timestamp","http.verb"]
}
```

响应中包含一个 HTTP 响应为 304 的文档：

```json
{
  ...
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "my-index-000001",
        "_id" : "A2qDy3cBWRMvVAuI7F8M",
        "_score" : 1.0,
        "_source" : {
          "timestamp" : "2020-04-30T14:31:22-05:00",
          "message" : "247.37.0.0 - - [30/Apr/2020:14:31:22 -0500] \"GET /images/hm_nbg.jpg HTTP/1.0\" 304 0"
        },
        "fields" : {
          "http.verb" : [
            "GET"
          ],
          "http.client_ip" : [
            "247.37.0.0"
          ],
          "timestamp" : [
            "2020-04-30T19:31:22.000Z"
          ]
        }
      }
    ]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/runtime-examples.html)
