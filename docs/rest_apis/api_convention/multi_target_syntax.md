# 多目标语法

大多数 API 接受 `<data-stream>`、`<index>` 或 `<target>` 请求路径参数，也支持多目标语法。

在多目标语法中，你可以使用逗号分隔的列表在多个资源上运行请求，比如数据流、索引或者[索引别名](/rest_apis/bulk_index_alias)：`test1,test2,test3`。你还可以使用类似 [glob](https://en.wikipedia.org/wiki/Glob_(programming)) 的通配符（*）表达式匹配模式为：`test*` 或 `*test` 或 `te*t` 或 `*test*.` 的目标资源。

你可以使用 `-` 字符排除目标：`test*,-test3`。

::: danger 警告
索引别名在通配符表达式后解析。这可能导致以排除的别名为目标的请求。例如，如果 `test3` 是一个索引别名，这个模式 `test*`,`-test3` 仍然以 `test3` 的索引为目标。要避免这种情况，排除别名的具体索引。
:::

针对索引的多目标 API，支持以下的查询字符串参数：

- `ignore_unavailable`

（可选，布尔值）如果为 `true`，缺失或者关闭的索引不包含在响应中。默认值为 `false`。

- `allow_no_indices`

（可选，布尔值）如果为 `false`，任何通配符表达式、索引别名或 `_all` 值只针对缺失或者关闭的索引，则请求将返回错误。即使请求以其他开放索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，同时没有索引以 `bar` 开头，则一个以 `foo*,bar*`为目标的请求会返回错误。

- `expand_wildcards`

（可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效值为：

  - `all`

  匹配任何数据流或索引，包括[隐藏的](/rest_apis/api_conventions/multi_target_syntax#隐藏数据流和索引)。

  - `open`

  匹配开启的、非隐藏的索引。也匹配任何非隐藏的数据流。

  - `closed`

  匹配关闭的、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能被关闭。

  - `hidden`

  匹配隐藏的数据流和隐藏的索引。必须与 `open`、`closed` 或一并结合使用。

  - `none`

  不接受通配符表达式。

上述参数的默认设置取决于所使用的 API。

一些针对索引的多目标 API，还支持以下查询字符串参数：

- `ignore_throttled`

（可选，布尔值）如果为 `true`，具体、展开或别名索引在冻结时将忽略。默认值为 `true`。

::: tip 提示
单索引 API，如[文档 API](/rest_apis/document_apis)和[单索引别名 API](/rest_apis/index_apis/bulk_index_alias)，不支持多目标语法。
:::

## 隐藏数据流和索引

对大多数 API，默认通配符表达式不匹配隐藏的数据流和索引。为了使用通配符表达式匹配隐藏数据流和索引，你必须指定 `expand_wildcards` 查询参数。

你可以通过在数据流匹配索引模板中设置 [`data_stream.hidden`](/rest_apis/index_apis/create_or_update_index_template#请求体) 为 `true` 来创建隐藏数据流。你可以使用 [`index.hidden`](/index_modules#静态索引设置) 索引设置来隐藏索引。

数据流的备份索引将自动隐藏。一些特性，如机器学习，信息将存储在隐藏索引中。

匹配所有索引的全局索引模板不会应用于隐藏索引。

## 系统索引

Elasticsearch 模块和插件可以在内部系统索引中存储配置和状态信息。你不应该直接访问或修改系统索引，因为它们包含系统运行所必需的数据。

::: danger 警告
不推荐直接访问系统索引，并且在下一个主要版本中将不再允许直接访问系统索引。
:::

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/7.11/multi-index.html)
