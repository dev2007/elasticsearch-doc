# 获取数据流的生命周期

获取一组[数据流](/data-streams)的[生命周期](/data-streams/data-stream-lifecycle)。

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限) 或 `manage_data_stream_lifecycle` 索引权限或 `view_index_metadata` 索引权限。更多信息，参阅[安全权限](/secure_the_elastic_statck/user_authorization/security_privileges)。

## 请求

`GET _data_stream/<data-stream>/_lifecycle`

## 描述

获取指定数据流的生命周期。如果请求多个数据流，但其中至少有一个不存在，那么 API 将以 404 响应，因为至少有一个请求的资源无法检索。如果请求的数据流没有配置生命周期，它们仍将包含在 API 响应中，但 `lifecycle` 关键字将丢失。

## 路径参数

- `<data-stream>`

    (必需，字符串) 用于限制请求的数据流的逗号分隔列表。支持通配符 (`*`)。要针对所有数据流，请使用 `*` 或 `_all`。

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

- `include_defaults`

    (可选，布尔值） 如果为 `true`，则在响应中返回所有默认设置。默认为 `false`。

## 响应体

- `data_streams`

    (对象数组）包含有关检索到的数据流生命周期的信息。

    - `data_streams` 对象属性

        - `name`

            (字符串） 数据流的名称。

        - `lifecycle`

            （可选，对象）

            `lifecycle` 属性

            - `data_retention`

                (可选，字符串） 如果已定义，则表示数据流所有者为该数据流要求的保留时间。

            - `effective_retention`

                (可选，字符串）如果定义，则添加到此数据流中的每个文档都将至少在此时间段内保存。在此期限之后的任何时间，文档都可能被删除。如果为空，该数据流中的每份文档都将无限期存储。为空时，该数据流中的每份文档都将无限期保存。有效保留时间的计算方法如[教程](/data_streams/data_stream_lifecycle/tutorial_data_stream_retention#如何计算有效保留时间？)所述。

            - `retention_determined_by`

                (可选，字符串） 保留的来源，可以是三种值之一：`data_stream_configuration`、`default_retention` 或 `max_retention`。

            - `rollover`

                (可选，对象）由集群设置 `cluster.lifecycle.default.rollover` 配置的触发后备索引翻转的条件。该属性是一个实现细节，只有当查询参数 `include_defaults` 设置为 `true` 时才能检索到。此字段的内容可能会更改。

- `global_retention`

    (对象）包含全局最大保留和默认保留。如果未配置全局保留，则该对象为空。

    - `global_retention` 属性

        - `max_retention`

            (可选，字符串） 数据流生命周期管理的数据流的有效保留时间不能超过此值。

        - `default_retention`

            (可选，字符串） 这将是数据流生命周期管理的、未指定 `data_retention` 的数据流的有效保留时间。

## 示例

让我们检索生命周期：

```bash
GET _data_stream/my-data-stream*/_lifecycle
```

响应如下：

```json
{
  "data_streams": [
    {
      "name": "my-data-stream-1",
      "lifecycle": {
        "enabled": true,
        "data_retention": "7d",
        "effective_retention": "7d",
        "retention_determined_by": "data_stream_configuration"
      }
    },
    {
      "name": "my-data-stream-2",
      "lifecycle": {
        "enabled": true,
        "data_retention": "7d",
        "effective_retention": "7d",
        "retention_determined_by": "data_stream_configuration"
      }
    }
  ],
  "global_retention": {}
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/data-streams-get-lifecycle.html)
