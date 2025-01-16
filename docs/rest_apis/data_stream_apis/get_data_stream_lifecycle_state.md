# 获取数据流生命周期统计信息

:::info 新 API 参考
有关最新 API 的详细信息，参阅[数据流 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-data-stream)。
:::

获取有关[数据流生命周期](/data_streams/data_stream_lifecycle)执行情况的统计信息。

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)来使用此 API。

## 请求

`GET _lifecycle/stats`

## 描述

获取有关数据流生命周期执行情况的统计信息。数据流级别的统计信息只包括数据流生命周期管理的数据流的统计信息。

## 响应体

- `last_run_duration_in_millis`

    (可选，长整数）最后一次执行数据流生命周期的持续时间。

- `time_between_starts_in_millis`

    (可选，长整数）最后两次数据流生命周期执行开始之间的时间间隔。该值应近似于 [`data_streams.lifecycle.poll_interval`](/set_up_elasticsearch/configuring_elasticsearch/data_stream_lifecycle_settings)。

- `data_stream_count`

    (整数） 当前由数据流生命周期管理的数据流的计数。

- `data_streams`

    (对象数组）包含检索到的数据流生命周期的相关信息。

    - `data_streams` 中的对象属性

        - `name`

            (字符串） 数据流的名称。

        - `backing_indices_in_total`

            (整数）由数据流生命周期管理的该数据流后备索引的计数。

        - `backing_indices_in_error`

            (整数）由数据流生命周期管理并已遇到错误的数据流后备索引的计数。

## 示例

让我们检索已执行过一次以上生命周期的群集的数据流生命周期统计信息：

```bash
GET _lifecycle/stats?human&pretty
```

回复内容如下

```json
{
  "last_run_duration_in_millis": 2,
  "last_run_duration": "2ms",
  "time_between_starts_in_millis": 9998,
  "time_between_starts": "9.99s",
  "data_streams_count": 2,
  "data_streams": [
    {
      "name": "my-data-stream",
      "backing_indices_in_total": 2,
      "backing_indices_in_error": 0
    },
    {
      "name": "my-other-stream",
      "backing_indices_in_total": 2,
      "backing_indices_in_error": 1
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/data-streams-get-lifecycle-stats.html)
