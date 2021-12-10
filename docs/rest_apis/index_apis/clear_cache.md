# 清除缓存 API

清除一个或多个索引的缓存。对于数据流，API 清除流的备份索引的缓存。

```bash
POST /my-index-000001/_cache/clear
```

## 请求

`POST /<target>/_cache/clear`

`POST /_cache/clear`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<target>`

  （可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`

  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

  默认为 `true`。

- `expand_wildcards`

  （可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效的值有：

  1. `all`
  匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax?id=隐藏数据流和索引)（隐藏的）。
  2. `open`
  匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
  3. `closed`
  匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
  4. `hidden`
  匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
  5. `none`
  不接受通配符表达式。

  默认为 `open`。

- `fielddata`

  （可选，布尔值）如果为 `true`，清除字段缓存。

  使用 `fields` 字段仅清除特定字段的缓存。

- `fields`

  （可选，字符串）逗号分隔用于限制 `fielddata` 参数的字段名字列表。

  默认为所有字段。

  ?> 此参数**不**支持对象或字段别名。

- `index`

  （可选，字符串）用于限制请求的，逗号分隔的索引名字。

- `ignore_unavailable`

  （可选，布尔值）如果为 `true`，丢失或关闭的索引不包含在响应中。

  默认为 `false`。

- `query`

  （可选，布尔值）如果为 `true`，清除查询缓存。

- `request`

  （可选，布尔值）如果为 `true`，清除请求缓存。

## 示例

### 清除指定缓存

默认情况，清除缓存 API 清除所有缓存。你可以通过以下以下查询参数为 `true` 来清除指定缓存：

- `fielddata`
- `query`
- `request`

```bash
POST /my-index-000001/_cache/clear?fielddata=true  
POST /my-index-000001/_cache/clear?query=true
POST /my-index-000001/_cache/clear?request=true
```

1. 第一个请求，仅清除字段缓存
2. 第二个请求，仅清除查询缓存
3. 第三个请求，仅清除请求缓存

### 清除指定字段缓存

为了只清除指定指定字段缓存，使用 `fields` 查询参数：

```bash
POST /my-index-000001/_cache/clear?fields=foo,bar
```

1. 此请求清除字段 `foo` 和 `bar` 的缓存

### 清除所有数据流和索引的缓存

```bash
POST /_cache/clear
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-clearcache.html)
