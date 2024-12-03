# 迁移数据流 API

将[索引别名](/aliases)转换为[数据流](/data_streams)。

```bash
POST /_data_stream/_migrate/my-logs
```

## 请求

`POST /_data_stream/_migrate/<alias>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `manage` 的[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。
- 已启用数据流的匹配[索引模板](/index_templates)。参阅[设置数据流](/data_streams/set_up_a_data_stream)。

## 路径参数

- `<alias>`

    (必需，字符串）要转换为数据流的索引别名的名称。别名必须符合以下条件：

    - 别名必须有一个[写索引](/aliases#写索引)。
    - 别名的所有索引都有一个 `date` 或 `date_nanos` 字段类型的 `@timestamp` 字段映射。
    - 别名必须没有任何[过滤器](/aliases#过滤别名)。
    - 别名不得使用[自定义路由](/aliases#路由)。

    如果请求成功，则会删除别名并创建同名数据流。别名的索引将成为数据流的隐藏备份索引。别名的写索引将成为数据流的写索引。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-migrate-to-data-stream.html)
