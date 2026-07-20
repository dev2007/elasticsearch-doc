# cat 字段数据 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[节点统计 API](/rest_apis/cluster_apis/nodes_stats)。

::::

返回集群中每个数据节点上字段数据缓存当前使用的堆内存量。

## 请求

```json
GET /_cat/fielddata/<field>
```

```json
GET /_cat/fielddata
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<field>`（可选，字符串）

  用于限制返回信息的字段的逗号分隔列表。

## 查询参数

- `bytes`（可选，[字节大小单位](/rest_apis/api_convention/common_options#字节大小单位)）

  用于显示字节值的单位。

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 示例

### 单个字段示例

你可以在请求体或 URL 路径中指定单个字段。以下字段数据 API 请求检索 `body` 字段的堆内存大小信息。

```json
GET /_cat/fielddata?v=true&fields=body
```

API 返回以下响应：

```text
id                     host      ip        node    field   size
Nqk-6inXQq-OxUfOUI8jNQ 127.0.0.1 127.0.0.1 Nqk-6in body    544b
```

### 字段列表示例

你可以在请求体或 URL 路径中指定以逗号分隔的字段列表。以下字段数据 API 请求检索 `body` 和 `soul` 字段的堆内存大小信息。

```json
GET /_cat/fielddata/body,soul?v=true
```

API 返回以下响应：

```text
id                     host      ip        node    field   size
Nqk-6inXQq-OxUfOUI8jNQ 127.0.0.1 127.0.0.1 Nqk-6in body    544b
Nqk-6inXQq-OxUfOUI8jNQ 127.0.0.1 127.0.0.1 Nqk-6in soul    480b
```

响应显示 `body` 和 `soul` 字段的各自字段数据，每个节点的每个字段占一行。

### 集群中所有字段示例

以下字段数据 API 请求检索所有字段的堆内存大小信息。

```json
GET /_cat/fielddata?v=true
```

API 返回以下响应：

```text
id                     host      ip        node    field   size
Nqk-6inXQq-OxUfOUI8jNQ 127.0.0.1 127.0.0.1 Nqk-6in body    544b
Nqk-6inXQq-OxUfOUI8jNQ 127.0.0.1 127.0.0.1 Nqk-6in mind    360b
Nqk-6inXQq-OxUfOUI8jNQ 127.0.0.1 127.0.0.1 Nqk-6in soul    480b
```
