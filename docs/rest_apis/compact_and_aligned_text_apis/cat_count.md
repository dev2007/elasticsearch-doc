# cat 计数 API

::::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。
::::

::::caution 警告
cat API 仅用于使用命令行或 Kibana 控制台的人工查看。它们不适用于应用程序。对于应用程序使用，请使用 [count API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-count.html)。
::::

提供对数据流、索引或整个集群的文档计数的快速访问。

文档计数仅包含活动文档，不包含尚未被合并过程移除的已删除文档。

## 请求

```bash
GET /_cat/count/<target>
```

```bash
GET /_cat/count
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)才能检索任何数据流、索引或别名。

## 路径参数

- `<target>`（可选，字符串）

  用于限制请求的数据流、索引和别名的逗号分隔列表。支持通配符（`*`）。要针对所有数据流和索引，请省略此参数或使用 `*` 或 `_all`。

## 查询参数

- `format`（可选，字符串）

  HTTP accept 头的简写版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

- `help`（可选，布尔值）

  如果为 `true`，响应包含帮助信息。默认为 `false`。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `v`（可选，布尔值）

  如果为 `true`，响应包含列标题。默认为 `false`。

## 示例

### 单个数据流或索引的示例

以下计数 API 请求检索 `my-index-000001` 数据流或索引的文档计数。

```bash
GET /_cat/count/my-index-000001?v=true
```

API 返回以下响应：

```bash
epoch      timestamp count
1475868259 15:24:20  120
```

### 集群中所有数据流和索引的示例

以下计数 API 请求检索集群中所有数据流和索引的文档计数。

```bash
GET /_cat/count?v=true
```

API 返回以下响应：

```bash
epoch      timestamp count
1475868259 15:24:20  121
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-count.html)
