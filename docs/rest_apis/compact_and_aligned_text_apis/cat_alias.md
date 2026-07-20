# cat 别名 API

::::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_(CAT)_apis/compact_and_aligned_text_(CAT)_apis)。
::::

::::caution 警告
cat API 仅用于使用命令行或 Kibana 控制台的人工查看。它们不适用于应用程序。对于应用程序使用，请使用 [aliases API](/rest_apis/index_apis/aliases)。
::::

检索集群的索引别名，包括过滤器和路由信息。此 API 不返回数据流别名。

## 请求

```bash
GET _cat/aliases/<alias>
```

```bash
GET _cat/aliases
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `view_index_metadata` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)才能检索任何别名。

## 路径参数

- `<alias>`（可选，字符串）

  要检索的别名的逗号分隔列表。支持通配符（`*`）。要检索所有别名，请省略此参数或使用 `*` 或 `_all`。

## 查询参数

- `format`（可选，字符串）

  HTTP accept 头的简写版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

- `help`（可选，布尔值）

  如果为 `true`，响应包含帮助信息。默认为 `false`。

- `local`（可选，布尔值）

  如果为 `true`，请求仅从本地节点检索信息。默认为 `false`，表示从主节点检索信息。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `v`（可选，布尔值）

  如果为 `true`，响应包含列标题。默认为 `false`。

- `expand_wildcards`（可选，字符串）

  通配符模式可以匹配的索引类型。如果请求可以针对数据流，此参数确定通配符表达式是否匹配隐藏数据流。支持逗号分隔的值，如 `open,hidden`。有效值为：

  - `all`

    匹配任何数据流或索引，包括隐藏的。

  - `open`

    匹配开放的、非隐藏的索引。也匹配任何非隐藏的数据流。

  - `closed`

    匹配关闭的、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。

  - `hidden`

    匹配隐藏的数据流和隐藏的索引。必须与 `open`、`closed` 或两者组合使用。

  - `none`

    不接受通配符模式。

## 示例

```bash
GET _cat/aliases?v=true
```

API 返回以下响应：

```bash
alias  index filter routing.index routing.search is_write_index
alias1 test1 -      -            -              -
alias2 test1 *      -            -              -
alias3 test1 -      1            1              -
alias4 test1 -      2            1,2            -
```

此响应显示 alias2 配置了过滤器，alias3 和 alias4 配置了特定的路由。

如果你只想获取特定别名的信息，可以以逗号分隔格式将别名指定为 URL 参数，例如 `/_cat/aliases/alias1,alias2`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-alias.html)
