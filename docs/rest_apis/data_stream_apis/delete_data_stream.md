# 删除数据流 API

删除一个或多个[数据流](/data_streams)及其支持索引。参阅[删除数据流](/data_streams/set_up_a_data_stream#删除数据流)。

```bash
DELETE /_data_stream/my-data-stream
```

## 请求

`DELETE /_data_stream/<data-stream>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `delete_index` 或 `manage` 的[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)：

## 路径参数

- `<data-stream>`

    （必需，字符串）要删除的数据流的逗号分隔列表。支持通配符 （`*`） 表达式。

## 查询参数

- `expand_wildcards`

    （可选，字符串）通配符模式可以匹配的数据流类型。支持逗号分隔值，例如 `open,hidden`。有效值为：

    - `all`，`hidden`

        匹配任何数据流或索引，包括[隐藏的](/rest_apis/api_conventions/multi_target_syntax#隐藏数据流和索引)。

    - `open`，`closed`

        匹配任何非隐藏的数据流。无法关闭 Data Streams。

    - `none`

        不接受通配符模式。

    默认为 `open`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-delete-data-stream.html#delete-data-stream-api-prereqs)
