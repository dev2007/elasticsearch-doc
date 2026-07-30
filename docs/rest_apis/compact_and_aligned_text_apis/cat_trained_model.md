# cat 训练模型 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[获取训练模型 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-trained-models.html)。

::::

返回有关推理训练模型的配置和使用信息。

## 请求

```json
GET /_cat/ml/trained_models
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有以下[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)：
  - `monitor_ml`

有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)和[机器学习安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-settings.html#ml-security-privileges)。

## 查询参数

- `bytes`（可选，[字节大小单位](/rest_apis/api_convention/common_options#字节大小单位)）

  用于显示字节值的单位。

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果未指定要包含的列，API 将返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列包括：

  - `create_time`、`ct`：训练模型创建的时间。
  - `created_by`、`c`、`createdBy`：训练模型创建者的信息。
  - `data_frame_analytics_id`、`df`、`dataFrameAnalytics`：创建模型的数据帧分析作业的标识符。仅当仍然可用时才显示。
  - `description`、`d`：训练模型的描述。
  - `heap_size`、`hs`、`modelHeapSize`：（默认）将训练模型保留在内存中的估计堆大小。
  - `id`：（默认）训练模型的标识符。
  - `ingest.count`、`ic`、`ingestCount`：由模型处理的文档总数。
  - `ingest.current`、`icurr`、`ingestCurrent`：当前正由训练模型处理的文档总数。
  - `ingest.failed`、`if`、`ingestFailed`：使用训练模型的失败接入尝试总数。
  - `ingest.pipelines`、`ip`、`ingestPipelines`：（默认）引用训练模型的接入管道总数。
  - `ingest.time`、`it`、`ingestTime`：使用训练模型处理文档所花费的总时间。
  - `license`、`l`：训练模型的许可证级别。
  - `operations`、`o`、`modelOperations`：（默认）使用训练模型的估计操作数。此数字有助于衡量模型的计算复杂度。
  - `version`、`v`：创建训练模型时的 Elasticsearch 版本号。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `time`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  用于显示时间值的单位。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 示例

```json
GET _cat/ml/trained_models?h=c,o,l,ct,v&v=true
```

API 返回以下响应：

```text
id                           created_by operations license  create_time              version
ddddd-1580216177138              _xpack 196        PLATINUM 2020-01-28T12:56:17.138Z 8.0.0
flight-regress-1580215685537     _xpack 102        PLATINUM 2020-01-28T12:48:05.537Z 8.0.0
lang_ident_model_1               _xpack 39629      BASIC    2019-12-05T12:28:34.594Z 7.6.0
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-trained-model.html)
