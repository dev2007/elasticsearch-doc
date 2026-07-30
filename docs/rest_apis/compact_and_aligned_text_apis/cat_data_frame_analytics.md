# cat 数据帧分析 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[获取数据帧分析作业统计信息 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-dfanalytics-stats.html)。

::::

返回有关数据帧分析作业的配置和使用信息。

## 请求

```json
GET /_cat/ml/data_frame/analytics/<data_frame_analytics_id>
```

```json
GET /_cat/ml/data_frame/analytics
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有以下[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)：
  - `monitor_ml`

有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)和[机器学习安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-settings.html#ml-security-privileges)。

## 路径参数

- `<data_frame_analytics_id>`（可选，字符串）

  数据帧分析作业的标识符。如果未指定此选项，API 将返回前一百个数据帧分析作业的信息。

## 查询参数

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果未指定要包含的列，API 将返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列包括：

  - `assignment_explanation`、`ae`：包含与节点选择相关的消息。
  - `create_time`、`ct`、`createTime`：（默认）数据帧分析作业创建的时间。
  - `description`、`d`：作业的描述。
  - `dest_index`、`di`、`destIndex`：目标索引的名称。
  - `failure_reason`、`fr`、`failureReason`：包含有关数据帧分析作业失败原因的消息。
  - `id`：（默认）数据帧分析作业的标识符。
  - `model_memory_limit`、`mml`、`modelMemoryLimit`：数据帧分析作业允许使用的最大内存资源的近似值。
  - `node.address`、`na`、`nodeAddress`：数据帧分析作业分配到的节点的网络地址。
  - `node.ephemeral_id`、`ne`、`nodeEphemeralId`：数据帧分析作业分配到的节点的临时 ID。
  - `node.id`、`ni`、`nodeId`：数据帧分析作业分配到的节点的唯一标识符。
  - `node.name`、`nn`、`nodeName`：数据帧分析作业分配到的节点的名称。
  - `progress`、`p`：按阶段报告的数据帧分析作业进度。
  - `source_index`、`si`、`sourceIndex`：源索引的名称。
  - `state`、`s`：（默认）数据帧分析作业的当前状态。
  - `type`、`t`：（默认）数据帧分析作业执行的分析类型。
  - `version`、`v`：创建数据帧分析作业时的 Elasticsearch 版本号。

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
GET _cat/ml/data_frame/analytics?v=true
```

API 返回以下响应：

```text
id               create_time              type             state
classifier_job_1 2020-02-12T11:49:09.594Z classification stopped
classifier_job_2 2020-02-12T11:49:14.479Z classification stopped
classifier_job_3 2020-02-12T11:49:16.928Z classification stopped
classifier_job_4 2020-02-12T11:49:19.127Z classification stopped
classifier_job_5 2020-02-12T11:49:21.349Z classification stopped
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-dfanalytics.html)
