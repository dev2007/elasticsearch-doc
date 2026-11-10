# 检索运行时字段

使用 `_search` API 上的 `fields` 参数来检索运行时字段的值。运行时字段不会显示在 `_source` 中，但 `fields` API 对所有字段都有效，即使是那些未作为原始 `_source` 一部分发送的字段。

## 定义一个计算星期几的运行时字段

例如，以下请求添加了一个名为 `day_of_week` 的运行时字段。该运行时字段包含一个基于 `@timestamp` 字段值计算星期几的脚本。我们在请求中包含 `"dynamic":"runtime"`，以便将新字段作为运行时字段添加到映射中。

```bash
PUT my-index-000001/
{
  "mappings": {
    "dynamic": "runtime",
    "runtime": {
      "day_of_week": {
        "type": "keyword",
        "script": {
          "source": "emit(doc['@timestamp'].value.dayOfWeekEnum.getDisplayName(TextStyle.FULL, Locale.ENGLISH))"
        }
      }
    },
    "properties": {
      "@timestamp": {"type": "date"}
    }
  }
}
```

## 摄取一些数据

让我们摄取一些示例数据，这将产生两个索引字段：`@timestamp` 和 `message`。

```bash
POST /my-index-000001/_bulk?refresh
{ "index": {}}
{ "@timestamp": "2020-06-21T15:00:01-05:00", "message" : "211.11.9.0 - - [2020-06-21T15:00:01-05:00] \"GET /english/index.html HTTP/1.0\" 304 0"}
{ "index": {}}
{ "@timestamp": "2020-06-21T15:00:01-05:00", "message" : "211.11.9.0 - - [2020-06-21T15:00:01-05:00] \"GET /english/index.html HTTP/1.0\" 304 0"}
{ "index": {}}
{ "@timestamp": "2020-04-30T14:30:17-05:00", "message" : "40.135.0.0 - - [2020-04-30T14:30:17-05:00] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"}
{ "index": {}}
{ "@timestamp": "2020-04-30T14:30:53-05:00", "message" : "232.0.0.0 - - [2020-04-30T14:30:53-05:00] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"}
{ "index": {}}
{ "@timestamp": "2020-04-30T14:31:12-05:00", "message" : "26.1.0.0 - - [2020-04-30T14:31:12-05:00] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"}
{ "index": {}}
{ "@timestamp": "2020-04-30T14:31:19-05:00", "message" : "247.37.0.0 - - [2020-04-30T14:31:19-05:00] \"GET /french/splash_inet.html HTTP/1.0\" 200 3781"}
{ "index": {}}
{ "@timestamp": "2020-04-30T14:31:27-05:00", "message" : "252.0.0.0 - - [2020-04-30T14:31:27-05:00] \"GET /images/hm_bg.jpg HTTP/1.0\" 200 24736"}
{ "index": {}}
{ "@timestamp": "2020-04-30T14:31:29-05:00", "message" : "247.37.0.0 - - [2020-04-30T14:31:29-05:00] \"GET /images/hm_brdl.gif HTTP/1.0\" 304 0"}
{ "index": {}}
{ "@timestamp": "2020-04-30T14:31:29-05:00", "message" : "247.37.0.0 - - [2020-04-30T14:31:29-05:00] \"GET /images/hm_arw.gif HTTP/1.0\" 304 0"}
{ "index": {}}
{ "@timestamp": "2020-04-30T14:31:32-05:00", "message" : "247.37.0.0 - - [2020-04-30T14:31:32-05:00] \"GET /images/nav_bg_top.gif HTTP/1.0\" 200 929"}
{ "index": {}}
{ "@timestamp": "2020-04-30T14:31:43-05:00", "message" : "247.37.0.0 - - [2020-04-30T14:31:43-05:00] \"GET /french/images/nav_venue_off.gif HTTP/1.0\" 304 0"}
```

## 搜索计算出的星期几

以下请求使用搜索 API 检索 `day_of_week` 字段，该字段由原始请求定义为映射中的运行时字段。此字段的值在查询时动态计算，无需重新索引文档或索引 `day_of_week` 字段。这种灵活性让你无需更改任何字段值即可修改映射。

```bash
GET my-index-000001/_search
{
  "fields": [
    "@timestamp",
    "day_of_week"
  ],
  "_source": false
}
```

上面的请求会返回所有匹配文档的 `day_of_week` 字段。我们可以定义另一个运行时字段 `client_ip`，它同样作用于 `message` 字段，并进一步细化查询：

```bash
PUT /my-index-000001/_mapping
{
  "runtime": {
    "client_ip": {
      "type": "ip",
      "script" : {
      "source" : "String m = doc[\"message\"].value; int end = m.indexOf(\" \"); emit(m.substring(0, end));"
      }
    }
  }
}
```

再运行一个查询，使用 `client_ip` 运行时字段搜索特定的 IP 地址：

```bash
GET my-index-000001/_search
{
  "size": 1,
  "query": {
    "match": {
      "client_ip": "211.11.9.0"
    }
  },
  "fields" : ["*"]
}
```

这一次，响应只包含两个命中结果。`day_of_week`（星期日）的值是在查询时使用映射中定义的运行时脚本计算得出的，并且结果只包含匹配 211.11.9.0 IP 地址的文档。

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
        "_id" : "oWs5KXYB-XyJbifr9mrz",
        "_score" : 1.0,
        "_source" : {
          "@timestamp" : "2020-06-21T15:00:01-05:00",
          "message" : "211.11.9.0 - - [2020-06-21T15:00:01-05:00] \"GET /english/index.html HTTP/1.0\" 304 0"
        },
        "fields" : {
          "@timestamp" : [
            "2020-06-21T20:00:01.000Z"
          ],
          "client_ip" : [
            "211.11.9.0"
          ],
          "message" : [
            "211.11.9.0 - - [2020-06-21T15:00:01-05:00] \"GET /english/index.html HTTP/1.0\" 304 0"
          ],
          "day_of_week" : [
            "Sunday"
          ]
        }
      }
    ]
  }
}
```

## 从相关索引检索字段

`_search` API 上的 `fields` 参数还可以通过类型为 `lookup` 的运行时字段从相关索引中检索字段。

通过类型为 `lookup` 的运行时字段检索的字段可用于充实搜索响应中的命中结果，但不能对这些字段进行查询或聚合。

```bash
POST ip_location/_doc?refresh
{
  "ip": "192.168.1.1",
  "country": "Canada",
  "city": "Montreal"
}

PUT logs/_doc/1?refresh
{
  "host": "192.168.1.1",
  "message": "the first message"
}

PUT logs/_doc/2?refresh
{
  "host": "192.168.1.2",
  "message": "the second message"
}

POST logs/_search
{
  "runtime_mappings": {
    "location": {
        "type": "lookup",
        "target_index": "ip_location",
        "input_field": "host",
        "target_field": "ip",
        "fetch_fields": ["country", "city"]
    }
  },
  "fields": [
    "host",
    "message",
    "location"
  ],
  "_source": false
}
```

在主搜索请求中定义一个类型为 `lookup` 的运行时字段，该字段使用词条查询从目标索引中检索字段。

- `target_index`
  （可选，字符串）执行查找查询的目标索引。
- `input_field`
  （可选，字符串）主索引上的字段，其值用作查找词条查询的输入值。
- `target_field`
  （可选，字符串）查找索引上由查找查询搜索的字段。
- `fetch_fields`
  （可选，字符串数组）要从查找索引中检索的字段列表。参阅搜索请求的 `fields` 参数。

上面的搜索会为返回的搜索命中中的每个 IP 地址返回 `ip_location` 索引中的 `country` 和 `city`。

```json
{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "logs",
        "_id": "1",
        "_score": 1.0,
        "fields": {
          "host": [ "192.168.1.1" ],
          "location": [
            {
              "city": [ "Montreal" ],
              "country": [ "Canada" ]
            }
          ],
          "message": [ "the first message" ]
        }
      },
      {
        "_index": "logs",
        "_id": "2",
        "_score": 1.0,
        "fields": {
          "host": [ "192.168.1.2" ],
          "message": [ "the second message" ]
        }
      }
    ]
  }
}
```

查找字段的响应会被分组，以保持每个文档相对于查找索引的独立性。每个输入值的查找查询预期最多匹配查找索引上的一个文档。如果查找查询匹配多个文档，则会随机选择一个文档。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/runtime-retrieving-fields.html)
