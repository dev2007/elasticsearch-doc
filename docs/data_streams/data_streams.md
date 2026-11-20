# 数据流

数据流（data stream）让你能够跨多个索引存储仅追加（append-only）的时间序列数据，同时为请求提供一个单一的命名资源。数据流非常适合日志、事件、指标和其他持续生成的数据。

你可以直接向数据流提交索引和搜索请求。流会自动将请求路由到存储流数据的支持索引。你可以使用[索引生命周期管理](/set_up_elasticsearch/index_lifecycle)（ILM）自动管理这些支持索引。例如，你可以使用 ILM 自动将较旧的支持索引移动到较廉价的硬件上，并删除不需要的索引。随着数据的增长，ILM 可以帮助你降低成本和开销。

## 是否应该使用数据流？

要确定是否应该对数据使用数据流，你需要考虑数据的格式以及预期的交互方式。适合使用数据流的数据应满足以下条件：

- 数据包含时间戳字段，或者可以自动生成时间戳字段。
- 主要执行索引请求，偶尔执行更新和删除。
- 索引文档时不带 `_id`，或者在带显式 `_id` 索引文档时期望“先写入者胜”（first-write-wins）的行为。

对于大多数时间序列数据用例，数据流都是很好的选择。但是，如果发现数据不符合这些类别（例如，频繁使用相同的 `_id` 发送多个文档并期望“后写入者胜”），你可能需要改用带写索引的索引别名。参阅[不使用数据流管理时间序列数据](/data_streams/manage_time_series_data_without_data_streams)了解更多信息。

请记住，一些特性（例如[时序数据流](/data_streams/tsds)（TSDS）和[数据流生命周期](/data_streams/data_stream_lifecycle)）需要使用数据流。

## 支持索引

数据流由一个或多个隐藏的、自动生成的支持索引组成。

数据流需要一个匹配的[索引模板](/index_templates/index_templates)。模板包含用于配置流的支持索引的映射和设置。

每个索引到数据流的文档都必须包含一个 `@timestamp` 字段，映射为 `date` 或 `date_nanos` 字段类型。如果索引模板没有为 `@timestamp` 字段指定映射，Elasticsearch 会将 `@timestamp` 映射为使用默认选项的 `date` 字段。

同一个索引模板可以用于多个数据流。你不能删除数据流正在使用的索引模板。

支持索引的命名模式是实现细节，不应从中推断任何信息。唯一保持不变的是每个数据流的代索引都会有唯一的名称。

## 读请求

当你向数据流提交读请求时，流会将请求路由到其所有支持索引。

## 写索引

最近创建的支持索引是数据流的写索引。流只将新文档添加到该索引。

你不能向其他支持索引添加新文档，即使直接向该索引发送请求也不行。

你也不能对写索引执行可能妨碍索引的操作，例如：

- [克隆](/rest_apis/index_apis/clone_index)
- [删除](/rest_apis/index_apis/delete_index)
- [收缩](/rest_apis/index_apis/shrink_index)
- [拆分](/rest_apis/index_apis/split_index)

## 翻转

[翻转](/rest_apis/index_apis/rollover_index)（rollover）会创建一个新的支持索引，该索引成为流的新写索引。

我们推荐使用 ILM 在写索引达到指定的年龄或大小时自动翻转数据流。如果需要，你也可以[手动翻转数据流](/data_streams/use_a_data_stream#手动翻转数据流)。

## 代

每个数据流都会跟踪其代（generation）：一个六位数的、从 `000001` 开始补零的整数。

创建支持索引时，索引用以下约定命名：

```text
.ds-<data-stream>-<yyyy.MM.dd>-<generation>
```

`<yyyy.MM.dd>` 是支持索引的创建日期。代数较高的支持索引包含较新的数据。例如，`web-server-logs` 数据流的代为 `34`。该流最近的支持索引创建于 2099 年 3 月 7 日，名为 `.ds-web-server-logs-2099.03.07-000034`。

一些操作（例如收缩或还原）可能会更改支持索引的名称。这些名称更改不会将支持索引从其数据流中移除。

数据流的代可以在没有新索引加入数据流的情况下发生变化（例如收缩现有的支持索引时）。这意味着某些代将永远不存在对应的支持索引。你不应该从支持索引的名称中推断任何信息。

## 仅追加（大部分情况）

数据流是为极少更新现有数据的用例设计的。你不能直接向数据流发送针对现有文档的更新或删除请求。但是，你仍然可以通过直接向文档的支持索引提交请求来更新或删除数据流中的文档。

如果需要更新数据流中的大量文档，可以使用 [update by query API](/rest_apis/document_apis/update_by_query) 和 [delete by query API](/rest_apis/document_apis/delete_by_query)。

如果你经常使用相同的 `_id` 发送多个文档并期望“后写入者胜”，你可能需要改用带写索引的索引别名。参阅[不使用数据流管理时间序列数据](/data_streams/manage_time_series_data_without_data_streams)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/data-streams.html)
