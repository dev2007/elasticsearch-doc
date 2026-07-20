# cat 异常检测器 API

::::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。
::::

::::caution 警告
cat API 仅用于使用命令行或 Kibana 控制台的人工查看。它们不适用于应用程序。对于应用程序使用，请使用[获取异常检测作业统计信息 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-anomaly-detector-stats.html)。
::::

返回有关异常检测作业的配置和使用信息。

## 请求

```bash
GET /_cat/ml/anomaly_detectors/<job_id>
```

```bash
GET /_cat/ml/anomaly_detectors
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor_ml`、`monitor`、`manage_ml` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。参见[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)和[机器学习安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-settings.html)。

## 描述

此 API 最多返回 10,000 个作业。

有关异常检测的更多信息，请参见[发现异常](https://www.elastic.co/guide/en/machine-learning/8.18/ml-ad-resources.html)。

## 路径参数

- `<job_id>`（可选，字符串）

  异常检测作业的标识符。

## 查询参数

- `allow_no_match`（可选，布尔值）

  指定当请求出现以下情况时的处理方式：

  - 包含通配符表达式且没有匹配的作业。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且仅有部分匹配。

  默认值为 `true`，当没有匹配项时返回空的作业数组，当有部分匹配项时返回结果的子集。如果此参数为 `false`，当没有匹配项或仅有部分匹配项时，请求返回 `404` 状态码。

- `bytes`（可选，[字节大小单位](/rest_apis/api_convention/common_options#字节大小单位)）

  用于显示字节值的单位。

- `format`（可选，字符串）

  HTTP accept 头的简写版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果不指定要包含的列，API 返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列为：

  - `assignment_explanation`、`ae`

    仅对于打开的异常检测作业，包含与选择运行作业的节点相关的消息。

  - `buckets.count`、`bc`、`bucketsCount`（默认）

    作业生成的桶结果数量。

  - `buckets.time.exp_avg`、`btea`、`bucketsTimeExpAvg`

    所有桶处理时间的指数移动平均值，以毫秒为单位。

  - `buckets.time.exp_avg_hour`、`bteah`、`bucketsTimeExpAvgHour`

    在 1 小时时间窗口内计算的桶处理时间的指数加权移动平均值，以毫秒为单位。

  - `buckets.time.max`、`btmax`、`bucketsTimeMax`

    所有桶处理时间中的最大值，以毫秒为单位。

  - `buckets.time.min`、`btmin`、`bucketsTimeMin`

    所有桶处理时间中的最小值，以毫秒为单位。

  - `buckets.time.total`、`btt`、`bucketsTimeTotal`

    所有桶处理时间的总和，以毫秒为单位。

  - `data.buckets`、`db`、`dataBuckets`

    已处理的桶数量。

  - `data.earliest_record`、`der`、`dataEarliestRecord`

    按时间顺序最早的输入文档的时间戳。

  - `data.empty_buckets`、`deb`、`dataEmptyBuckets`

    不包含任何数据的桶数量。如果数据包含许多空桶，考虑增大 `bucket_span` 或使用对数据间隙有容忍度的函数，如 `mean`、`non_null_sum` 或 `non_zero_count`。

  - `data.input_bytes`、`dib`、`dataInputBytes`

    发布到异常检测作业的输入数据的字节数。

  - `data.input_fields`、`dif`、`dataInputFields`

    发布到异常检测作业的输入文档中的字段总数。此计数包括未在分析中使用的字段。但是请注意，如果使用数据源，它仅从检索的文档中提取所需字段后再发布到作业。

  - `data.input_records`、`dir`、`dataInputRecords`

    发布到异常检测作业的输入文档数量。

  - `data.invalid_dates`、`did`、`dataInvalidDates`

    缺少日期字段或日期无法解析的输入文档数量。

  - `data.last`、`dl`、`dataLast`

    根据服务器时间，数据最后一次被分析的时间戳。

  - `data.last_empty_bucket`、`dleb`、`dataLastEmptyBucket`

    最后一个不包含任何数据的桶的时间戳。

  - `data.last_sparse_bucket`、`dlsb`、`dataLastSparseBucket`

    最后一个被视为稀疏的桶的时间戳。

  - `data.latest_record`、`dlr`、`dataLatestRecord`

    按时间顺序最新的输入文档的时间戳。

  - `data.missing_fields`、`dmf`、`dataMissingFields`

    缺少异常检测作业配置要分析的字段的输入文档数量。缺少字段的输入文档仍会被处理，因为可能并非所有字段都缺失。

    如果使用数据源或以 JSON 格式将数据发布到作业，较高的 `missing_field_count` 通常不表示数据问题，不一定需要关注。

  - `data.out_of_order_timestamps`、`doot`、`dataOutOfOrderTimestamps`

    时间戳按时间顺序早于当前异常检测桶开始时间减去延迟窗口的输入文档数量。此信息仅在使用 post data API 向异常检测作业提供数据时适用。这些乱序文档将被丢弃，因为作业要求数据按时间升序排列。

  - `data.processed_fields`、`dpf`、`dataProcessedFields`

    异常检测作业已处理的所有文档中的字段总数。只有检测器配置对象中指定的字段才计入此计数。时间戳不计入此计数。

  - `data.processed_records`、`dpr`、`dataProcessedRecords`（默认）

    异常检测作业已处理的输入文档数量。此值包括缺少字段的文档，因为它们仍会被分析。如果使用数据源且搜索查询中包含聚合，则 `processed_record_count` 是已处理的聚合结果数量，而非 Elasticsearch 文档数量。

  - `data.sparse_buckets`、`dsb`、`dataSparseBuckets`

    与预期数据点数量相比包含较少数据点的桶数量。如果数据包含许多稀疏桶，考虑使用更长的 `bucket_span`。

  - `forecasts.memory.avg`、`fmavg`、`forecastsMemoryAvg`

    与异常检测作业相关的预测的平均内存使用量（字节）。

  - `forecasts.memory.max`、`fmmax`、`forecastsMemoryMax`

    与异常检测作业相关的预测的最大内存使用量（字节）。

  - `forecasts.memory.min`、`fmmin`、`forecastsMemoryMin`

    与异常检测作业相关的预测的最小内存使用量（字节）。

  - `forecasts.memory.total`、`fmt`、`forecastsMemoryTotal`

    与异常检测作业相关的预测的总内存使用量（字节）。

  - `forecasts.records.avg`、`fravg`、`forecastsRecordsAvg`

    与异常检测作业相关的预测写入的 `model_forecast` 文档的平均数量。

  - `forecasts.records.max`、`frmax`、`forecastsRecordsMax`

    与异常检测作业相关的预测写入的 `model_forecast` 文档的最大数量。

  - `forecasts.records.min`、`frmin`、`forecastsRecordsMin`

    与异常检测作业相关的预测写入的 `model_forecast` 文档的最小数量。

  - `forecasts.records.total`、`frt`、`forecastsRecordsTotal`

    与异常检测作业相关的预测写入的 `model_forecast` 文档的总数。

  - `forecasts.time.avg`、`ftavg`、`forecastsTimeAvg`

    与异常检测作业相关的预测的平均运行时间（毫秒）。

  - `forecasts.time.max`、`ftmax`、`forecastsTimeMax`

    与异常检测作业相关的预测的最大运行时间（毫秒）。

  - `forecasts.time.min`、`ftmin`、`forecastsTimeMin`

    与异常检测作业相关的预测的最小运行时间（毫秒）。

  - `forecasts.time.total`、`ftt`、`forecastsTimeTotal`

    与异常检测作业相关的预测的总运行时间（毫秒）。

  - `forecasts.total`、`ft`、`forecastsTotal`（默认）

    当前可用于作业的单个预测数量。值为 1 或更大表示存在预测。

  - `id`（默认）

    异常检测作业的标识符。

  - `model.bucket_allocation_failures`、`mbaf`、`modelBucketAllocationFailures`

    由于模型内存不足而未处理传入数据中新实体的桶数量。这种情况也通过 `hard_limit` 的 `memory_status` 属性值表示。

  - `model.by_fields`、`mbf`、`modelByFields`

    模型分析的 by 字段值的数量。此值是作业中所有检测器的累计值。

  - `model.bytes`、`mb`、`modelBytes`（默认）

    模型使用的内存字节数。这是自上次持久化模型以来的最大值。如果作业已关闭，此值表示最新大小。

  - `model.bytes_exceeded`、`mbe`、`modelBytesExceeded`

    上次分配失败时超过内存使用高限的字节数。

  - `model.categorization_status`、`mcs`、`modelCategorizationStatus`

    作业的分类状态。包含以下值之一：

    - `ok`：分类表现可接受（或未使用）。
    - `warn`：分类检测到的类别分布表明输入数据不适合分类。问题可能是只有一个类别、超过 90% 的类别是稀有类别、类别数量大于已分类文档数量的 50%、没有频繁匹配的类别，或超过 50% 的类别已失效。

  - `model.categorized_doc_count`、`mcdc`、`modelCategorizedDocCount`

    已对字段进行分类的文档数量。

  - `model.dead_category_count`、`mdcc`、`modelDeadCategoryCount`

    分类创建的永远不会再次被分配的类别数量，因为另一个类别的定义使其成为该失效类别的超集。（失效类别是分类没有预先训练的副产物。）

  - `model.failed_category_count`、`mdcc`、`modelFailedCategoryCount`

    分类想要创建新类别但由于作业已达到其 `model_memory_limit` 而无法创建的次数。此计数不跟踪具体哪些类别未能创建，因此无法使用此值确定被遗漏的唯一类别数量。

  - `model.frequent_category_count`、`mfcc`、`modelFrequentCategoryCount`

    匹配超过 1% 已分类文档的类别数量。

  - `model.log_time`、`mlt`、`modelLogTime`

    根据服务器时间，收集模型统计信息时的时间戳。

  - `model.memory_limit`、`mml`、`modelMemoryLimit`

    模型内存使用的上限，在值增加时检查。

  - `model.memory_status`、`mms`、`modelMemoryStatus`（默认）

    数学模型的状态，可以具有以下值之一：

    - `ok`：模型保持在配置值以下。
    - `soft_limit`：模型使用了超过配置内存限制 60% 的空间，较旧的未使用模型将被修剪以释放空间。此外，在分类作业中不再存储进一步的类别示例。
    - `hard_limit`：模型使用的空间超过了配置的内存限制。结果是，并非所有传入数据都被处理。

  - `model.output_memory_allocator_bytes`、`momab`、`modelOutputMemoryAllocatorBytes`

    用于输出异常检测作业文档的内存量（字节）。

  - `model.over_fields`、`mof`、`modelOverFields`

    模型分析的 over 字段值的数量。此值是作业中所有检测器的累计值。

  - `model.partition_fields`、`mpf`、`modelPartitionFields`

    模型分析的分区字段值的数量。此值是作业中所有检测器的累计值。

  - `model.rare_category_count`、`mrcc`、`modelRareCategoryCount`

    仅匹配一个已分类文档的类别数量。

  - `model.timestamp`、`mt`、`modelTimestamp`

    收集模型统计信息时最后一条记录的时间戳。

  - `model.total_category_count`、`mtcc`、`modelTotalCategoryCount`

    分类创建的类别数量。

  - `node.address`、`na`、`nodeAddress`

    节点的网络地址。

    包含运行作业的节点的属性。此信息仅适用于打开的作业。

  - `node.ephemeral_id`、`ne`、`nodeEphemeralId`

    节点的临时 ID。

    包含运行作业的节点的属性。此信息仅适用于打开的作业。

  - `node.id`、`ni`、`nodeId`

    节点的唯一标识符。

    包含运行作业的节点的属性。此信息仅适用于打开的作业。

  - `node.name`、`nn`、`nodeName`

    节点名称。

    包含运行作业的节点的属性。此信息仅适用于打开的作业。

  - `opened_time`、`ot`

    仅对于打开的作业，作业已打开的运行时间。

  - `state`、`s`（默认）

    异常检测作业的状态，可以是以下值之一：

    - `closed`：作业已成功完成，模型状态已持久化。作业必须先打开才能接受进一步数据。
    - `closing`：作业关闭操作正在进行中且尚未完成。正在关闭的作业不能接受进一步数据。
    - `failed`：作业由于错误未能成功完成。这种情况可能由于无效的输入数据、分析过程中发生的致命错误，或外部交互（如进程被 Linux 内存不足（OOM）杀手终止）。如果作业已不可恢复地失败，必须强制关闭然后删除。如果可以更正数据源，则可以关闭作业然后重新打开。
    - `opened`：作业可以接收和处理数据。
    - `opening`：作业打开操作正在进行中且尚未完成。

- `help`（可选，布尔值）

  如果为 `true`，响应包含帮助信息。默认为 `false`。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `time`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  用于显示时间值的单位。

- `v`（可选，布尔值）

  如果为 `true`，响应包含列标题。默认为 `false`。

## 示例

```bash
GET _cat/ml/anomaly_detectors?h=id,s,dpr,mb&v=true
```

API 返回以下响应：

```bash
id                        s dpr   mb
high_sum_total_sales closed 14022 1.5mb
low_request_rate     closed 1216  40.5kb
response_code_rates  closed 28146 132.7kb
url_scanning         closed 28146 501.6kb
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-anomaly-detectors.html)
