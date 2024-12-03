# 获取数据流 API

读取一个或多个[数据流](/data_streams)的信息。参阅[获取数据流信息](/data_streams/set_up_a_data_stream#获取数据流信息)。

```bash
GET /_data_stream/my-data-stream
```

## 请求

`GET /_data_stream/<data-stream>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `view_index_metadata` 或 `manage` 的[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)：

## 路径参数

- `<data-stream>`

    (可选，字符串） 用逗号分隔的数据流名称列表，用于限制请求。支持通配符 (*) 表达式。如果省略，将返回所有数据流。

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

    (可选，布尔值） [预览] 中的功能。如果为 `true`，则在响应中返回所有默认设置。默认为 `false`。

- `verbose`

    (可选，布尔值）。如果为 `true`，则返回与数据流中文档的 `@timestamp` 字段相对应的 `maximum_timestamp`。默认为 `false`。

## 响应体

- `data_streams`

    - `data_streams` 中对象的属性

        - `name`

            (字符串） 数据流的名称。

        - `timestamp_field`

            (对象）包含数据流 `@timestamp` 字段的相关信息。

            - `timestamp_field` 属性

                - `name`

                    (字符串）数据流时间戳字段的名称，必须是 `@timestamp`。`@timestamp` 字段必须包含在数据流索引的每个文档中。

        - `indices`

            (对象数组）包含数据流备份索引信息的对象数组。

            数组中的最后一项包含数据流的当前[写索引](/data_streams#写索引)信息。

            - `indices` 对象属性

                - `index_name`

                    (字符串） 备份索引的名称。有关命名规则，参阅[生成](/data_streams#生成)。

                - `index_uuid`

                    (字符串）索引的通用唯一标识符（UUID）。

                - `prefer_ilm`

                    (布尔）[预览]中的功能。表示当索引生命周期管理和数据流生命周期都配置为管理此索引时，此索引是否配置为首选索引生命周期管理。

                - `managed_by`

                    (字符串）[预览]中的功能。表示管理此索引的系统。

        - `generation`

            (整数）数据流的[生成](/data_streams#生成)生成数。这个数字是数据流翻转的累积计数，从 `1` 开始。

        - `_meta`

            (对象）流的自定义元数据，从流的匹配[索引模板](/data_streams/set_up_a_data_stream#创建索引模板)的 `_meta` 对象中复制。如果为空，响应将省略此属性。

        - `status`

            (字符串） 数据流的健康状态。

            该健康状态基于数据流备份索引的主分片和副本分片的状态。

            - `status` 的值

                - `GREEN`

                    所有分片都已分配。

                - `YELLOW`

                    所有主分片都已分配，但一个或多个副本分区未分配。

                - `RED`
                
                    一个或多个主分片未分配，因此某些数据不可用。

        - `template`

            (字符串)用于创建数据流后备索引的索引模板名称。

            该模板的索引模式必须与该数据流的名称相匹配。参阅[创建索引模板](/data_streams/set_up_a_data_stream#创建索引模板)。

        - `ilm_policy`

        (字符串)流的匹配索引模板中当前 ILM 生命周期策略的名称。此生命周期策略在 `index.lifecycle.name` 设置中设置。

        如果模板不包含生命周期策略，则响应中不包含此属性。

        :::note 提示
        数据流的后备索引可以分配不同的生命周期策略。要检索单个后备索引的生命周期策略，请使用获取索引设置 API。
        :::

        - `next_generation_managed_by`

            (字符串）[预览]中的功能。表示将管理下一代索引（即下一个数据流写入索引）的系统。

        - `prefer_ilm`

            (布尔）[预览]中的功能。表示当索引生命周期管理和数据流生命周期都配置为管理此索引时，用于创建数据流后备索引的索引模板是否配置为首选索引[生命周期管理](/data_streams/data_stream_lifecycle)。

        - `hidden`

            (布尔值） 如果为 `true`，则隐藏数据流。

        - `system`

            (布尔值）如果为 `true`，则数据流由弹性堆栈组件创建和管理，不能通过正常的用户交互进行修改。

        - `allow_custom_routing`

            (布尔值）如果为 `true`，则该数据流允许在写入请求时自定义路由。

        - `replicated`

            (布尔值）如果为 `true`，则数据流由跨群集复制创建和管理，本地群集不能写入该数据流或更改其映射。

        - `lifecycle`

            (对象）[预览]中的功能。包含此数据流的数据流生命周期管理配置。

            - `lifecycle` 对象的属性

                - `data_retention`

                    (字符串）如果定义，则添加到此数据流中的每个文档都将至少在此时间段内保存。在此期限之后的任何时间，文档都可能被删除。如果为空，则该数据流中的每份文档都将无限期存储。

                - `rollover`

                    (对象）由群集设置 `cluster.lifecycle.default.rollover` 配置的触发后备索引翻转的条件。该属性是一个实现细节，只有当查询参数 `include_defaults` 设置为 `true` 时才能检索到。此字段的内容可能会更改。

        - `rollover_on_write`

            (布尔值）如果为 `true`，下一次写入该数据流时将首先触发一次翻转，然后在新的后备索引中对文档进行索引。如果翻转失败，索引请求也将失败。

## 示例

```bash
GET _data_stream/my-data-stream*
```

API 返回以下响应：

```json
{
  "data_streams": [
    {
      "name": "my-data-stream",
      "timestamp_field": {
        "name": "@timestamp"
      },
      "indices": [
        {
          "index_name": ".ds-my-data-stream-2099.03.07-000001",
          "index_uuid": "xCEhwsp8Tey0-FLNFYVwSg",
          "prefer_ilm": true,
          "ilm_policy": "my-lifecycle-policy",
          "managed_by": "Index Lifecycle Management"
        },
        {
          "index_name": ".ds-my-data-stream-2099.03.08-000002",
          "index_uuid": "PA_JquKGSiKcAKBA8DJ5gw",
          "prefer_ilm": true,
          "ilm_policy": "my-lifecycle-policy",
          "managed_by": "Index Lifecycle Management"
        }
      ],
      "generation": 2,
      "_meta": {
        "my-meta-field": "foo"
      },
      "status": "GREEN",
      "next_generation_managed_by": "Index Lifecycle Management",
      "prefer_ilm": true,
      "template": "my-index-template",
      "ilm_policy": "my-lifecycle-policy",
      "hidden": false,
      "system": false,
      "allow_custom_routing": false,
      "replicated": false,
      "rollover_on_write": false
    },
    {
      "name": "my-data-stream-two",
      "timestamp_field": {
        "name": "@timestamp"
      },
      "indices": [
        {
          "index_name": ".ds-my-data-stream-two-2099.03.08-000001",
          "index_uuid": "3liBu2SYS5axasRt6fUIpA",
          "prefer_ilm": true,
          "ilm_policy": "my-lifecycle-policy",
          "managed_by": "Index Lifecycle Management"
        }
      ],
      "generation": 1,
      "_meta": {
        "my-meta-field": "foo"
      },
      "status": "YELLOW",
      "next_generation_managed_by": "Index Lifecycle Management",
      "prefer_ilm": true,
      "template": "my-index-template",
      "ilm_policy": "my-lifecycle-policy",
      "hidden": false,
      "system": false,
      "allow_custom_routing": false,
      "replicated": false,
      "rollover_on_write": false
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-data-stream.html)
