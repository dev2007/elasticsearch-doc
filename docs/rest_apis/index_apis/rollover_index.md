# 翻转 API

为[数据流](/data_streams/data_streams)或[索引别名](/rest_apis/index_apis/create_or_update_index_alias)创建一个新的索引。

```bash
POST my-data-stream/_rollover
```

## 请求

`POST /<rollover-target>/_rollover/`

`POST /<rollover-target>/_rollover/<target-index>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对翻转目标必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

:::note 提示
我们推荐使用 ILM 的[翻转](/ILM_manage_the_index_lifecycle/index_lifecycle_actions/rollover)操作来自动执行翻转。参阅[索引生命周期](/set_up_elasticsearch/index_lifecycle)
:::

翻转 API 为数据流或索引别名创建一个新索引。API 的行为依赖翻转的目标。

### 翻转数据流

如果你翻转数据流，API 将为数据流创建一个新的写索引。流的前一个写索引会变为常规的协助索引。翻转还会增加数据流的辈分（generation）。

### 翻转带有写索引的索引别名

:::note 提示
在 Elasticsearch 7.9 之前，你通常会使用带有写索引的[索引别名](/rest_apis/index_apis/create_or_update_index_alias)来管理时序数据。数据流取代了这一功能，需要较少的维护，并自动与数据层集成。
参阅[转换索引别名为数据流](/data_streams/set_up_a_data_stream#转换索引别名为数据流)。
:::

如果一个索引别名指向多个索引，其中一个索引必须为[写索引](/rest_apis/index_apis/aliases#写索引)。翻转 API 为别名创建一个新的写索引，并将它的 `is_write_index` 设置为 `true`。API 也会将前一个写索引设置 `is_write_index` 为 `false`。

### 翻转带有一个索引的索引别名

如果你翻转仅指向一个索引的索引别名，API 将为别名创建新索引，并从别名移除原始索引。

## 为别名增加索引名字

当你翻转索引别名时，你可以为新索引指定名字。如果你不指定名字，且当前索引以 `-` 和数字结尾，比如 `my-index-000001` 或 `my-index-3`，新的索引名字会增加数字。例如，你翻转一个带有当前索引名字为 `my-index-000001` 的别名，翻转操作会创建一个名为 `my-index-000002` 的新索引。无论前一个索引名字是什么，这个数字总是 6 个字符并以 0 填充。

> **将日期数学与索引别名翻转一起使用**
如果你为时序数据使用索引别名，你可以在索引名字中使用[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)以追踪翻转日期。例如，你可以创建一个指向索引名为 `<my-index-{now/d}-000001>` 的别名。如果你在2099年5月6日创建索引，索引名为 `my-index-2099.05.06-000001`。如果你在2099年5月7日翻转这个别名，新索引的名字为 `my-index-2099.05.07-000002`。例如，参阅[翻转带有写索引的索引别名](/rest_apis/index_apis/rollover_index#翻转带有写索引的索引别名)

## 等待活动分片

翻转创建一个新的索引，并受限于设置 [`wait_for_active_shards`](/rest_apis/index_apis/create_index#等待活动分片)。

## 路径参数

- `<rollover-target>`

  （必需的，字符串）待翻转的数据流或索引别名的名字。

- `<target-index>`

  （可选的，字符串）创建的目标索引名称。支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。数据流不支持这个参数。

  如果别名的当前写索引的名字不以 `-` 和数字结尾，例如 `my-index-000001` 或 `my-index-3`,这个参数是必需的。

  索引名字必须符合以下约定：

  1. 只能是小写字符
  2. 不能包含字符：`\`、`/`、`*`、`?`、`"`、`<`、`>`、`|`、` `(空格)、`,`、`#`
  3. 7.0 之前索引可以包含冒号（:），但在 7.0 之后不推荐。
  4. 不能以 `-`、`_`、`+` 开头
  5. 不能是 `.` 或 `..`
  6. 长度不能超过 255 字节（注意是字节，所以多字节字符会更快达到 255 的限制）
  7. 名字以 `.` 开头不推荐，除非由插件管理的[隐藏索引](/index_modules)和内部索引

## 查询参数

- `dry_run`

  （可选，布尔值）如果为 `true`，则检查当前索引是否匹配一个或多个指定条件（`conditions`），但不执行翻转。默认为 `false`。

- `include_type_name`

  [~~7.0.0~~开始不推荐]（可选，布尔值）如果为 `true`,映射体中需要映射类型。默认为 `false`。

- `wait_for_active_shards`

  （可选，字符串）在操作执行之前必须活动的分片复制数量。设置为 `all` 或任何正整数，最大值为索引分片总数（`number_of_replicas+1`）。默认为：1，主分片。

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 请求体

- `aliases`

  （可选，[别名对象](/rest_apis/idnex_apis/bulk_index_alias)）包含目标索引的索引别名。索引别名名字支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。

数据流不支持这个参数。

- `conditions`

  （可选，对象）翻转的条件。如果指定，Elasticsearch 仅在当前索引满足以下一个或多个条件时执行翻转。如果参数未指定，Elasticsearch 无条件执行翻转。

  :::caution 警告
  为了触发翻转，当前索引在请求时必须满足这些条件。Elasticsearch 不会在 API 响应后监视索引。要自动化翻转，改用 ILM 的[翻转](/ILM_manage_the_index_lifecycle/index_lifecycle_actions/rollover)。
  :::

- `conditions` 的属性

  - `max_age`

    （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）在达到创建索引所用的最长时间后触发翻转。从索引创建时间开始，始终计算运行的时间，即使索引起始日期配置为自定义日期，例如当使用设置 [`index.lifecycle.parse_origination_date`](/set_up_elasticsearch/configuring_elasticsearch/index_lifecycle_management_settings) 或 [`index.lifecycle.origination_date`](/set_up_elasticsearch/configuring_elasticsearch/index_lifecycle_management_settings) 。

  - `max_docs`

    （可选，整数）在达到指定的最大文档数后触发翻转。自上次刷新以来添加的文档不包括在文档计数中。文档计数不包括副本分片中的文档。

  - `max_size`

    （可选，[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）当索引达到一定大小时触发翻转。这是索引中所有主分片的总大小。副本不会被计算到最大索引大小。

    :::note 提示
    为查看当前索引大小，可以使用 [`_cat indices`](/rest_apis/compact_and_aligned_text_apis/cat_indices) API。`pri.store.size` 值显示所有主分片的组合大小。
    :::

  - `max_primary_shard_size`

    （可选，[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）当索引中最大的主分片达到一定大小时触发翻转。主分片在索引中的最大值。同 `max_size` 一样，副本会被忽略。

    :::note 提示
    为了查看当前分片大小，可以使用 [`_cat shards`] API。`store` 值展示每个分片大小，`prirep` 指示一个分片是主分片（`p`）还是副本（`r`）。
    :::

- `mappings`

  （可选，[映射对象](/mapping/mapping)）索引中字段映射。如果指定，映射可以包含：

  1. 字段名字
  2. [字段数据类型](/mapping/field_data_types)
  3. [映射参数](/mapping/mapping_parameters/mapping_parameters)

  参阅[映射](/mapping/mapping)

  数据流不支持这个参数。

- `settings`

  （可选，[索引设置对象](/index_modules#索引设置)）索引的配置选项。参阅[索引设置](/index_modules#索引设置)

  数据流不支持这个参数。

## 响应体

- `acknowledged`

  （布尔值）如果为 `true`，请求在 `timeout` 周期内接收来自主节点的响应。

- `shards_acknowledged`

  （布尔值）如果为 `true`，请求在 `master_timeout` 周期内接收来自[活动分片](/rest_apis/document_apis/esindex#活动分片)的响应。

- `old_index`

  （字符串）数据流或索引别名的前一个索引。对数据流和有写索引的索引别名，指前一个写索引。

- `new_index`

  （字符串）翻转创建的索引。对数据洲和有写索引的索引别名，指当前写索引。

- `rolled_over`

  （布尔值）如果为 `true`，数据流或索引别名翻转。

- `dry_run`

  （布尔值）如果为 `true`，Elasticsearch 不执行翻转。

- `condition`

  (对象)指定在请求的 `conditions` 里的每个条件的结果。如果未指定任何条件，这是一个空对象。

  - `condition` 的属性

    - `<condition>`

      （布尔值）键是每个条件。值是它的结果。如果为 `true`，该索引在翻转时满足条件。

## 示例

### 翻转数据流

以下请求无条件翻转数据流。

```bash
POST my-data-stream/_rollover
```

如果当前写索引满足一个或多个以下的条件，以下的请求只翻转数据流：

- 索引在 7 天或更早前创建

- 索引包含 1,000 或更多的文档

- 索引最大的主分片是 50GB 或更大

```bash
POST my-data-stream/_rollover
{
  "conditions": {
    "max_age": "7d",
    "max_docs": 1000,
    "max_primary_shard_size": "50gb"
  }
}
```

API 返回：

```bash
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "old_index": ".ds-my-data-stream-2099.05.06-000001",
  "new_index": ".ds-my-data-stream-2099.05.07-000002",
  "rolled_over": true,
  "dry_run": false,
  "conditions": {
    "[max_age: 7d]": false,
    "[max_docs: 1000]": true,
    "[max_primary_shard_size: 50gb]": false
  }
}
```

### 翻转带有写索引的索引别名

以下请求创建 `<my-index-{now/d}-000001>`，且将它设置为 `my-alias` 的写索引。

```bash
# PUT <my-index-{now/d}-000001>
PUT %3Cmy-index-%7Bnow%2Fd%7D-000001%3E
{
  "aliases": {
    "my-alias": {
      "is_write_index": true
    }
  }
}
```

如果当前写索引满足一个或多个以下的条件，以下的请求只翻转别名：

- 索引在 7 天或更早前创建

- 索引包含 1,000 或更多的文档

- 索引最大的主分片是 50GB 或更大

```bash
POST my-alias/_rollover
{
  "conditions": {
    "max_age": "7d",
    "max_docs": 1000,
    "max_primary_shard_size": "50gb"
  }
}
```

API 返回：

```bash
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "old_index": "my-index-2099.05.06-000001",
  "new_index": "my-index-2099.05.07-000002",
  "rolled_over": true,
  "dry_run": false,
  "conditions": {
    "[max_age: 7d]": false,
    "[max_docs: 1000]": true,
    "[max_primary_shard_size: 50gb]": false
  }
}
```

如果别名的索引名使用日期数学，并且你以固定的间隔翻转索引，则可以使用日期数学缩小搜索范围。例如，以下搜索目标索引是在过去三天创建的。

```bash
# GET /<my-index-{now/d}-*>,<my-index-{now/d-1d}-*>,<my-index-{now/d-2d}-*>/_search
GET /%3Cmy-index-%7Bnow%2Fd%7D-*%3E%2C%3Cmy-index-%7Bnow%2Fd-1d%7D-*%3E%2C%3Cmy-index-%7Bnow%2Fd-2d%7D-*%3E/_search
```

### 翻转只有一个索引的索引别名

以下请求创建 `<my-index-{now/d}-000001>` 以及它的别名 `my-write-alias`。

```bash
# PUT <my-index-{now/d}-000001>
PUT %3Cmy-index-%7Bnow%2Fd%7D-000001%3E
{
  "aliases": {
    "my-write-alias": { }
  }
}
```

如果当前索引满足一个或多个以下的条件，以下的请求只翻转别名：

- 索引在 7 天或更早前创建

- 索引包含 1,000 或更多的文档

- 索引最大的主分片是 50GB 或更大

```bash
POST my-write-alias/_rollover
{
  "conditions": {
    "max_age": "7d",
    "max_docs": 1000,
    "max_primary_shard_size": "50gb"
  }
}
```

API 返回：

```bash
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "old_index": "my-index-2099.05.06-000001",
  "new_index": "my-index-2099.05.07-000002",
  "rolled_over": true,
  "dry_run": false,
  "conditions": {
    "[max_age: 7d]": false,
    "[max_docs: 1000]": true,
    "[max_primary_shard_size: 50gb]": false
  }
}
```

### 在翻转时指定设置

典型的，你可以使用[索引模板](/index_templates/index_templates)在翻转时自动配置索引创建。如果你翻转索引别名，你可以使用翻转 API 添加额外的索引设置或重写在模板中的设置。数据流不支持 `settings` 参数。

```bash

POST my-alias/_rollover
{
  "settings": {
    "index.number_of_shards": 2
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-rollover-index.html)
