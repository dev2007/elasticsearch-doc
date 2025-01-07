# 删除数据流生命周期

:::info 新 API 参考
有关最新 API 的详细信息，参阅[数据流 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-data-stream)。
:::

从一组数据流中删除[生命周期](/data_streams/data_stream_lifecycle)。

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `manage_data_stream_lifecycle` 的索引权限。更多信息，参阅[安全权限](/secure_the_elastic_statck/user_authorization/security_privileges)。

## 请求

`DELETE _data_stream/<data-stream>/_lifecycle`

## 描述

从指定的数据流中删除生命周期。如果提供了多个数据流，但其中只要有一个不存在，那么删除所有数据流中的生命周期都将失败，API 将以 `404` 响应。

## 路径参数

- `<data-stream>`

    （必需，字符串）要删除的数据流的逗号分隔列表。支持通配符 （`*`） 表达式。要针对所有数据流，请使用 `*` 或 `_all`。

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

## 示例

下面的示例删除了 `my-data-stream` 的生命周期：

```bash
DELETE _data_stream/my-data-stream/_lifecycle
```

从所有选定数据流中成功删除策略后，会收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/data-streams-delete-lifecycle.html)
