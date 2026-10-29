# ES|QL 基础

了解如何使用 ES|QL 查询和聚合数据。

## 前置条件

要跟随本教程，你可以设置自己的部署，或使用 Elastic 的公共 ES|QL 演示环境（ela.st/ql）。

首先摄取示例数据。在 Kibana 中，打开主菜单并选择 **Dev Tools**，然后运行：

```txt
PUT sample_data
{
  "mappings": {
    "properties": {
      "client_ip": { "type": "ip" },
      "message": { "type": "keyword" }
    }
  }
}

PUT sample_data/_bulk
{"index": {}}
{"@timestamp": "2023-10-23T12:15:03.360Z", "client_ip": "172.21.2.162", "message": "Connected to 10.1.0.3", "event_duration": 3450233}
{"index": {}}
{"@timestamp": "2023-10-23T12:27:28.948Z", "client_ip": "172.21.2.113", "message": "Connected to 10.1.0.2", "event_duration": 2764889}
{"index": {}}
{"@timestamp": "2023-10-23T13:33:34.937Z", "client_ip": "172.21.0.5", "message": "Disconnected", "event_duration": 1232382}
{"index": {}}
{"@timestamp": "2023-10-23T13:51:54.732Z", "client_ip": "172.21.3.15", "message": "Connection error", "event_duration": 725448}
{"index": {}}
{"@timestamp": "2023-10-23T13:52:55.015Z", "client_ip": "172.21.3.15", "message": "Connection error", "event_duration": 8268153}
{"index": {}}
{"@timestamp": "2023-10-23T13:53:55.832Z", "client_ip": "172.21.3.15", "message": "Connection error", "event_duration": 5033755}
{"index": {}}
{"@timestamp": "2023-10-23T13:55:01.543Z", "client_ip": "172.21.3.15", "message": "Connected to 10.1.0.1", "event_duration": 1756467}
```

在公共演示环境（ela.st/ql）中已预加载了此数据集。

## 运行 ES|QL 查询

- **Console**：在 Kibana 中，打开主菜单 → Dev Tools。查询 API 请求的结构如下：

```txt
POST /_query?format=txt
{
  "query": """
  
  """
}
```

在两组三引号之间输入查询：

```txt
POST /_query?format=txt
{
  "query": """
FROM sample_data
  """
}
```

- **Discover**：主菜单 → Discover → 从应用菜单栏中选择 **Try ES|QL**。调整时间过滤器以包含示例数据的时间戳（2023 年 10 月 23 日）。自动补全会提示可能的命令和函数；通过拖动编辑器的底边可以调整其高度。

## 你的第一个 ES|QL 查询（FROM）

每个 ES|QL 查询都以一个**源命令**开始，源命令生成一个表，通常包含来自 Elasticsearch 的数据。`FROM` 源命令返回一个包含来自数据流、索引或别名的文档的表。每一行代表一个文档；每一列对应一个字段。默认最多返回 **1000 个文档**：

```txt
FROM sample_data
```

ES|QL 关键字**不区分大小写** — `from sample_data` 与之等价。

## 处理命令（LIMIT、SORT）

源命令后面可以跟一个或多个**处理命令**，用管道符 `|` 分隔。处理命令通过添加、删除或更改行/列来改变输入表；它们可以执行过滤、投影、聚合等操作。

**LIMIT** — 限制返回的行数，最多 10000 行：

```txt
FROM sample_data
| LIMIT 3
```

为了可读性，你可以将每个命令放在单独的一行，但并非必须：

```txt
FROM sample_data | LIMIT 3
```

**SORT** — 默认情况下，`FROM` 返回的行没有定义的排序顺序。对一个或多个列使用 `SORT`：

```txt
FROM sample_data
| SORT @timestamp DESC
```

## 查询数据（WHERE）

使用 `WHERE` 进行过滤。持续时间超过 5 毫秒的事件：

```txt
FROM sample_data
| WHERE event_duration > 5000000
```

`WHERE` 支持多种运算符 — 例如，用于通配符查询的 `LIKE`：

```txt
FROM sample_data
| WHERE message LIKE "Connected*"
```

**其他处理命令**：`KEEP` 和 `DROP`（保留/删除列）、`ENRICH`（用索引中的数据丰富表），以及 `DISSECT` 和 `GROK`（处理数据）。

**链式命令** — 每个命令都在前一个命令的输出上工作；最终结果是由最后一个命令生成的表。例如，先排序再限制：

```txt
FROM sample_data
| SORT @timestamp DESC
| LIMIT 3
```

:::warning 注意

顺序很重要：在排序*之前*限制 3 行，其结果可能与在限制之前排序不同。

:::

## 计算值（EVAL）

`EVAL` 追加包含计算值的列。例如，将纳秒转换为毫秒：

```txt
FROM sample_data
| EVAL duration_ms = event_duration/1000000.0
```

`EVAL` 支持函数 — 例如 `ROUND`：

```txt
FROM sample_data
| EVAL duration_ms = ROUND(event_duration/1000000.0, 1)
```

## 计算统计数据（STATS ... BY）

使用 `STATS` 进行聚合。持续时间的中位数：

```txt
FROM sample_data
| STATS median_duration = MEDIAN(event_duration)
```

在一个命令中计算多个统计值：

```txt
FROM sample_data
| STATS median_duration = MEDIAN(event_duration), max_duration = MAX(event_duration)
```

使用 `BY` 对统计值分组 — 每个客户端 IP 的持续时间中位数：

```txt
FROM sample_data
| STATS median_duration = MEDIAN(event_duration) BY client_ip
```

**访问列**：包含特殊字符的名称需要用反引号括起来。为 EVAL/STATS 的输出列命名是可选的；否则列名就是函数表达式：

```txt
FROM sample_data
| EVAL event_duration/1000000.0
| STATS MEDIAN(`event_duration/1000000.0`)
```

## 创建直方图（BUCKET）

`BUCKET` 函数创建便于阅读的桶大小，并返回每行所属的桶。每小时的事件计数：

```txt
FROM sample_data
| STATS c = COUNT(*) BY bucket = BUCKET(@timestamp, 24, "2023-10-23T00:00:00Z", "2023-10-23T23:59:59Z")
```

每小时的持续时间中位数：

```txt
FROM sample_data
| KEEP @timestamp, event_duration
| STATS median_duration = MEDIAN(event_duration) BY bucket = BUCKET(@timestamp, 24, "2023-10-23T00:00:00Z", "2023-10-23T23:59:59Z")
```

## 丰富数据（ENRICH）

在使用 `ENRICH` 之前，需要创建并执行 enrich 策略。例如，一个将 IP 地址与环境（"Development"、"QA"、"Production"）关联的 `clientip_policy`：

```txt
PUT clientips
{
  "mappings": {
    "properties": {
      "client_ip": { "type": "keyword" },
      "env": { "type": "keyword" }
    }
  }
}

PUT clientips/_bulk
{ "index" : {}}
{ "client_ip": "172.21.0.5", "env": "Development" }
{ "index" : {}}
{ "client_ip": "172.21.2.113", "env": "QA" }
{ "index" : {}}
{ "client_ip": "172.21.2.162", "env": "QA" }
{ "index" : {}}
{ "client_ip": "172.21.3.15", "env": "Production" }
{ "index" : {}}
{ "client_ip": "172.21.3.16", "env": "Production" }

PUT /_enrich/policy/clientip_policy
{
  "match": {
    "indices": "clientips",
    "match_field": "client_ip",
    "enrich_fields": ["env"]
  }
}

PUT /_enrich/policy/clientip_policy/_execute?wait_for_completion=false
```

（在演示环境中，`clientip_policy` 已经创建并执行完毕。）

然后使用 `ENRICH`：

```txt
FROM sample_data
| KEEP @timestamp, client_ip, event_duration
| EVAL client_ip = TO_STRING(client_ip)
| ENRICH clientip_policy ON client_ip WITH env
```

在后续命令中使用新的 `env` 列 — 每个环境的持续时间中位数：

```txt
FROM sample_data
| KEEP @timestamp, client_ip, event_duration
| EVAL client_ip = TO_STRING(client_ip)
| ENRICH clientip_policy ON client_ip WITH env
| STATS median_duration = MEDIAN(event_duration) BY env
```

## 处理数据（DISSECT / GROK）

要在查询时将非结构化字符串结构化，使用 `DISSECT`（基于分隔符的模式）或 `GROK`（正则表达式 — 功能更强大但通常更慢）。示例消息：`"Connected to 10.1.0.3"`。

提取服务器 IP：

```txt
FROM sample_data
| DISSECT message "Connected to %{server_ip}"
```

这会向匹配的行添加一个 `server_ip` 列（不匹配的行该列为 null）。统计每台服务器的连接数：

```txt
FROM sample_data
| WHERE STARTS_WITH(message, "Connected to")
| DISSECT message "Connected to %{server_ip}"
| STATS COUNT(*) BY server_ip
```

## 了解更多

参阅 **ES|QL 参考**和**使用 ES|QL** 文档。该指南还在 `elasticsearch-labs` GitHub 仓库中以交互式 Python 笔记本的形式提供。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-getting-started.html)
