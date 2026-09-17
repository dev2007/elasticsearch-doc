# 创建 rollup 作业 API

:::warning 已弃用

在 8.11.0 中已弃用。

Rollup 将在未来版本中移除。请改用[降采样](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/downsampling-data-stream.html)。

从 8.15.0 开始，在没有 rollup 使用量的集群中调用此 API 将失败，并显示有关 Rollup 弃用和计划移除的消息。集群需要包含 rollup 作业或 rollup 索引，此 API 才被允许执行。

:::

创建一个 rollup 作业。

```txt
PUT _rollup/job/<job_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 或 `manage_rollup` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 描述

rollup 作业配置包含有关作业应如何运行、何时索引文档以及将来可以对 rollup 索引执行哪些查询的所有详细信息。

作业配置有三个主要部分：作业的调度细节（cron 计划等）、用于分组的字段，以及为每个组收集的指标。

作业以 STOPPED（停止）状态创建。可以使用[启动 rollup 作业 API](./start_job) 启动它们。

## 路径参数

`<job_id>`

（必需，字符串）rollup 作业的标识符。可以是任何字母数字字符串，唯一标识与 rollup 作业关联的数据。此 ID 是持久性的；它与 rollup 后的数据一起存储。如果创建一个作业，运行一段时间后删除该作业，该作业 rollup 的数据仍与此作业 ID 关联。不能使用相同的 ID 创建新作业，因为这可能导致作业配置不匹配的问题。

## 请求体

`cron`

（必需，字符串）定义 rollup 作业执行间隔的 cron 字符串。当间隔触发时，索引器尝试 rollup 索引模式中的数据。cron 模式与被 rollup 数据的时间间隔无关。例如，你可能希望创建文档的小时级 rollup，但只按 cron 定义每天午夜运行一次索引器。cron 模式的定义方式与 Watcher cron 调度相同。

`groups`

（必需，对象）定义为此 rollup 作业定义的分组字段和聚合。这些字段之后可用于聚合到桶中。

这些聚合和字段可以任意组合使用。可以将 groups 配置视为定义一组工具，之后可在聚合中用于分区数据。与原始数据不同，我们必须提前考虑可能使用哪些字段和聚合。Rollup 提供了足够的灵活性，你只需确定需要哪些字段，而无需确定它们的使用顺序。

目前有三种可用的分组类型：`date_histogram`、`histogram` 和 `terms`。

`groups` 的属性

`date_histogram`

（必需，对象）日期直方图分组将日期字段聚合到基于时间的桶中。此分组是必需的；目前无法 rollup 没有时间戳和 `date_histogram` 分组的文档。`date_histogram` 分组有多个参数：

`date_histogram` 的属性

- `calendar_interval` 或 `fixed_interval`

  （必需，[时间单位](../api_conventions/time_units)）rollup 时生成的时间桶的间隔。例如，`60m` 生成 60 分钟（小时级）的 rollup。这遵循 Elasticsearch 其他地方使用的标准时间格式语法。间隔仅定义可聚合的最小间隔。如果配置了小时级（`60m`）间隔，rollup 搜索可以执行 60m 或更大（周、月等）间隔的聚合。因此，请将间隔定义为之后希望查询的最小单位。有关日历间隔和固定间隔之间的区别，请参阅[日历和固定间隔](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-aggregations-bucket-dateinterval-aggregation.html#calendar_and_fixed_intervals)。

  更小、更细粒度的间隔会占用成比例更多的空间。

- `delay`

  （可选，[时间单位](../api_conventions/time_units)）rollup 新文档之前等待的时间。默认情况下，索引器尝试 rollup 所有可用数据。但是，数据乱序到达的情况并不少见，有时甚至晚到几天。索引器无法处理在时间跨度已被 rollup 之后到达的数据。也就是说，没有更新已存在 rollup 的机制。

  相反，应指定一个与你预期乱序数据到达的最长时间段相匹配的延迟。例如，`1d` 的延迟指示索引器 rollup 到 now - 1d 为止的文档，为乱序文档提供一天的缓冲时间。

- `field`

  （必需，字符串）要 rollup 的日期字段。

- `time_zone`

  （可选，字符串）定义 rollup 文档存储时使用的时区。与可以即时切换时区的原始数据不同，rollup 后的文档必须使用特定时区存储。默认情况下，rollup 文档以 UTC 存储。

`histogram`

（可选，对象）直方图分组将一个或多个数值字段聚合到数值直方图间隔中。

`histogram` 的属性

- `fields`

  （必需，数组）要为其构建直方图的字段集合。指定的所有字段必须是某种数值类型。顺序无关紧要。

- `interval`

  （必需，整数）rollup 时生成的直方图桶的间隔。例如，值 5 创建宽度为五个单位的桶（0-5、5-10 等）。请注意，直方图分组中只能指定一个间隔，这意味着通过直方图分组的所有字段必须共享相同的间隔。

`terms`

（可选，对象）terms 分组可用于关键字或数值字段，允许之后通过 terms 聚合进行分桶。索引器为每个时间段枚举并存储字段的所有值。这对于 IP 地址等高基数组可能代价高昂，尤其是当时间桶特别稀疏时。

虽然 rollup 的规模不太可能超过原始数据，但在多个高基数字段上定义 terms 分组会在很大程度上降低 rollup 的压缩效果。因此，应谨慎选择包含哪些高基数字段。

`terms` 的属性

- `fields`

  （必需，字符串）要为其收集 terms 的字段集合。此数组可以同时包含关键字和数值字段。顺序无关紧要。

`index_pattern`

（必需，字符串）要 rollup 的索引或索引模式。支持通配符样式模式（`logstash-*`）。作业尝试 rollup 整个索引或索引模式。

`index_pattern` 不能是也会匹配目标 `rollup_index` 的模式。例如，模式 `foo-*` 会匹配 rollup 索引 `foo-rollup`。这种情况会导致问题，因为 rollup 作业会在运行时尝试 rollup 自己的数据。如果尝试配置与 `rollup_index` 匹配的模式，将发生异常以阻止此行为。

`metrics`

（可选，对象）定义为每个分组元组收集的指标。默认情况下，只为每个组收集 `doc_counts`。为使 rollup 有用，通常会添加平均值、最小值、最大值等指标。指标按字段定义，并为每个字段配置要收集的指标。

`metrics` 配置接受一个对象数组，每个对象有两个参数。

`metrics` 对象的属性

- `field`

  （必需，字符串）要为其收集指标的字段。必须是某种数值类型。

- `metrics`

  （必需，数组）要为该字段收集的指标数组。必须至少配置一个指标。可接受的指标为 `min`、`max`、`sum`、`avg` 和 `value_count`。

`page_size`

（必需，整数）rollup 索引器每次迭代处理的桶结果数。更大的值通常执行更快，但处理期间需要更多内存。此值对数据的 rollup 方式没有影响；它仅用于调整索引器的速度或内存成本。

`rollup_index`

（必需，字符串）包含 rollup 结果的索引。此索引可以与其他 rollup 作业共享。数据的存储方式使其不会与无关的作业相互干扰。

`timeout`

（可选，[时间值](../api_conventions/time_units)）等待请求完成的时间。默认为 `20s`（20 秒）。

## 示例

以下示例创建名为 `sensor` 的 rollup 作业，目标为 `sensor-*` 索引模式：

```json
PUT _rollup/job/sensor
{
  "index_pattern": "sensor-*",
  "rollup_index": "sensor_rollup",
  "cron": "*/30 * * * * ?",
  "page_size": 1000,
  "groups": {
    "date_histogram": {
      "field": "timestamp",
      "fixed_interval": "1h",
      "delay": "7d"
    },
    "terms": {
      "fields": [ "node" ]
    }
  },
  "metrics": [
      {
      "field": "temperature",
      "metrics": [ "min", "max", "sum" ]
    },
    {
      "field": "voltage",
      "metrics": [ "avg" ]
    }
  ]
}
```

此配置允许在 `timestamp` 字段上使用日期直方图，在 `node` 字段上使用 terms 聚合。

此配置在两个字段上定义指标：`temperature` 和 `voltage`。对于 `temperature` 字段，收集温度的最小值、最大值和总和。对于 `voltage`，收集平均值。

作业创建后，会收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rollup-put-job.html)
