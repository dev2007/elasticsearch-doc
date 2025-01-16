# 下采样索引 API

:::info 新 API 参考
有关最新 API 的详细信息，参阅[数据流 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-data-stream)。
:::

聚合时间序列 (TSDS) 索引，并存储按配置时间间隔分组的每个指标字段的预计算统计摘要（`min`、`max`、`sum`、`value_count` 和 `avg`）。例如，包含每 10 秒采样一次的指标的 TSDS 索引可以缩减采样为每小时索引。一小时间隔内的所有文档都会汇总并作为单个文档存储在下采样索引中。

```bash
POST /my-time-series-index/_downsample/my-downsampled-time-series-index
{
    "fixed_interval": "1d"
}
```

请查阅[下采样](/data_streams/tsds/downsamping_a_time_series_data_stream)文档，了解概述、向下采样过程的详情以及手动运行向下采样和作为 ILM 策略的一部分运行向下采样的示例。

## 请求

`POST /<source-index>/_downsample/<output-downsampled-index>`

## 前置条件

- 仅支持[时序数据流](/data_streams/tsds)中的索引。
- 如果启用了 Elasticsearch 安全功能，则必须拥有数据流的 `all` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。
- 源索引上不能[定义字段或文档级安全性](/secure_the_elastic_statck/user_authorization/setting_up_field_and_document_level_security)。
- 源索引必须是只读的（`index.blocks.write: true`）。

## 路径参数

- `<source-index>`

    (可选，字符串）要进行下采样的时间序列索引名称。

- `<output-downsampled_index>`

    (必须，字符串） 要创建的索引的名称。

    - 只能是小写字符
    - 不能包含字符：`\`、`/`、`*`、`?`、`"`、`<`、`>`、`|`、` `(空格)、`,`、`#`
    - 7.0 之前索引可以包含冒号（:），但在 7.0 之后不推荐。
    - 不能以 `-`、`_`、`+` 开头
    - 不能是 `.` 或 `..`
    - 长度不能超过 255 字节（注意是字节，所以多字节字符会更快达到 255 的限制）
    - 名字以 `.` 开头不推荐，除非由插件管理的[隐藏索引](/index_modules)和内部索引

## 查询参数

- `fixed_interval`

    (必填，[时间单位](/rest_apis/api_convention/common_options#时间单位)）汇总原始时间序列索引的时间间隔。例如，60m 为每个 60 分钟（每小时）间隔生成一个文档。这遵循 Elasticsearch 中其他地方使用的标准时间格式语法。

:::note 提示
更小、更细的区间所占空间也更大。
:::

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-downsample-data-stream.html)
