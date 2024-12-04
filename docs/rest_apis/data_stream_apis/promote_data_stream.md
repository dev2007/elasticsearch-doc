# 推广数据流 API

推广[数据流](/data_streams) API 的目的是将 CCR 复制的数据流转化为常规数据流。

通过 CCR 自动跟踪，远程群集的数据流可复制到本地群集。这些数据流无法在本地群集中滚动。只有当上游数据流滚动时，这些复制的数据流才会滚动。如果远程群集不再可用，本地群集中的数据流可升级为常规数据流，从而允许这些数据流在本地群集中滚动。

```bash
POST /_data_stream/_promote/my-data-stream
```

## 请求

`POST /_data_stream/_promote/<data-stream>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `manage_follow_index` 的[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。

## 路径参数

- `<data-stream>`

    (必填，字符串） 要推广的数据流名称。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/promote-data-stream-api.html)
