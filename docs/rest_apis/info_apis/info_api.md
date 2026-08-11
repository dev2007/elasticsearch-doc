# 信息 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [信息 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-info-xpack-info)。

:::::

提供有关已安装 X-Pack 特性的常规信息。

## 请求

```bash
GET /_xpack
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

此 API 提供的信息包括：

- **构建信息** — 包括构建号和时间戳。
- **许可证信息** — 有关当前已安装许可证的基本信息。
- **特性信息** — 在当前许可证下已启用且可用的特性。

## 路径参数

- `categories`

  （可选，列表）要在响应中包含的信息类别的逗号分隔列表。例如 `build,license,features`。

- `human`

  （可选，布尔值）定义是否在响应中包含额外的人类可读信息。特别是，它会添加描述和标签行。默认为 `true`。

## 示例

以下示例查询信息 API：

```bash
GET /_xpack
```

响应示例：

```json
{
   "build" : {
      "hash" : "2798b1a3ce779b3611bb53a0082d4d741e4d3168",
      "date" : "2015-04-07T13:34:42Z"
   },
   "license" : {
      "uid" : "893361dc-9749-4997-93cb-xxx",
      "type" : "trial",
      "mode" : "trial",
      "status" : "active",
      "expiry_date_in_millis" : 1542665112332
   },
   "features" : {
      "ccr" : {
        "available" : true,
        "enabled" : true
      },
      "aggregate_metric" : {
          "available" : true,
          "enabled" : true
      },
      "analytics" : {
          "available" : true,
          "enabled" : true
      },
      "archive" : {
          "available" : true,
          "enabled" : true
      },
      "enrich" : {
          "available" : true,
          "enabled" : true
      },
      "frozen_indices" : {
         "available" : true,
         "enabled" : true
      },
      "graph" : {
         "available" : true,
         "enabled" : true
      },
      "ilm" : {
         "available" : true,
         "enabled" : true
      },
      "logstash" : {
         "available" : true,
         "enabled" : true
      },
      "ml" : {
         "available" : true,
         "enabled" : true
      },
      "esql" : {
         "available" : true,
         "enabled" : true
      },
      "monitoring" : {
         "available" : true,
         "enabled" : true
      },
      "rollup": {
         "available": true,
         "enabled": true
      },
      "searchable_snapshots" : {
         "available" : true,
         "enabled" : true
      },
      "security" : {
         "available" : true,
         "enabled" : true
      },
      "slm" : {
         "available" : true,
         "enabled" : true
      },
      "spatial" : {
         "available" : true,
         "enabled" : true
      },
      "eql" : {
         "available" : true,
         "enabled" : true
      },
      "sql" : {
         "available" : true,
         "enabled" : true
      },
      "transform" : {
         "available" : true,
         "enabled" : true
      },
      "voting_only" : {
         "available" : true,
         "enabled" : true
      },
      "watcher" : {
         "available" : true,
         "enabled" : true
      },
      "data_streams" : {
         "available" : true,
         "enabled" : true
      },
      "data_tiers" : {
         "available" : true,
         "enabled" : true
      },
      "enterprise_search": {
         "available": true,
         "enabled": true
      },
      "universal_profiling": {
         "available": true,
         "enabled": true
      },
      "logsdb": {
        "available": true,
        "enabled": false
      }
   },
   "tagline" : "You know, for X"
}
```

以下示例仅返回构建和特性信息：

```bash
GET /_xpack?categories=build,features
```

以下示例从响应中移除描述信息：

```bash
GET /_xpack?human=false
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/info-api.html)
