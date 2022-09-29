# 创建索引 API

创建一个新的索引。

```bash
PUT /my-index-000001
```

## 请求

`PUT /<index>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标索引必须有 `create_index` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

你可以使用创建索引 API 向 Elasticsearch 集群添加一个新的索引。当创建索引时，你可以指定以下项：

- 索引设置
- 索引字段映射
- 索引别名

## 路径参数

- `<index>`

（必需的，字符串）你希望创建的索引的名字。

索引名字必须符合以下约定：

1. 只能是小写字符
2. 不能包含字符：`\`、`/`、`*`、`?`、`"`、`<`、`>`、`|`、` `(空格)、`,`、`#`
3. 7.0 之前索引可以包含冒号（:），但在 7.0 之后不推荐。
4. 不能以 `-`、`_`、`+` 开头
5. 不能是 `.` 或 `..`
6. 长度不能超过 255 字节（注意是字节，所以多字节字符会更快达到 255 的限制）
7. 名字以 `.` 开头不推荐，除非由插件管理的[隐藏索引](/index_modules)和内部索引

## 查询参数

- `include_type_name`
[~~7.0.0~~开始不推荐] （可选，布尔值）如果为 `true`，映射体中需要映射类型。

- `wait_for_active_shards`
（可选，字符串）在操作执行之前必须活动的分片复制数量。设置为 `all` 或任何正整数，最大值为索引分片总数（`number_of_replicas+1`）。默认为：1，主分片。

参阅 [活动分片](/rest_apis/document_apis/esindex#活动分片)

- `master_timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 请求体

- `aliases`
（可选，[别名对象](/rest_apis/index_apis/bulk_index_alias)）包含索引的索引别名。参阅[批量索引别名](/rest_apis/index_apis/bulk_index_alias)。

- `mappings`
（可选，[映射对象](/mapping/mapping)）索引中字段映射。如果指定，映射可以包含：

1. 字段名字
2. [字段数据类型](/mapping/field_data_types)
3. [映射参数](/mapping/mapping_parameters/mapping_parameters)

参阅[映射](/mapping/mapping)

- `settings`
（可选，[索引设置对象](/index_modules#索引设置)）索引的配置选项。参阅[索引设置](/index_modules#索引设置)

## 示例

### 索引设置

创建的每个索引可以有与它关联的特定设置，在请求体中定义：

```bash
PUT /my-index-000001
{
  "settings": {
    "index": {
      "number_of_shards": 3,  
      "number_of_replicas": 2
    }
  }
}
```

1. `number_of_shards` 默认为 1
2. `number_of_replicas` 默认为 1 （例如，每个主分片一个副本）

或更简单：

```bash
PUT /my-index-000001
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2
  }
}
```

::: tip 提示
在 `settings` 部分中，不必显示指定 `index` 部分。
:::

有关创建索引时，可以设置的所有不同索引级别设置的详细信息，参阅章节[索引模块](/index_modules)。

### 映射

创建索引 API 允许提供映射定义：

```bash
PUT /test
{
  "settings": {
    "number_of_shards": 1
  },
  "mappings": {
    "properties": {
      "field1": { "type": "text" }
    }
  }
}
```

::: tip 提示
在 7.0.0 之前，**mapping**（映射）定义用于包含类型名字。尽管现在不推荐在请求中指定类型，但如果设置了请求参数 include_type_name，仍然可以提供类型。更多的信息，参阅[移除映射类型](/mapping/removal_of_mapping_types)。
:::

### 别名

创建索引 API 也允许提供一组[别名](/rest_apis/index_apis/bulk_index_alias)。

```bash
PUT /test
{
  "aliases": {
    "alias_1": {},
    "alias_2": {
      "filter": {
        "term": { "user.id": "kimchy" }
      },
      "routing": "shard-1"
    }
  }
}
```

### 等待活动分片

默认情况下，索引创建只会在每个分片的主副本已启动或请求超时时，向客户端返回响应。索引创建响应将表明发生了什么。

```bash
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "test"
}
```

`acknowledged` 表明在集群中索引是否成功创建，同时 `shards_acknowledged` 表明在超时之前，是否为每个分片启动了必需的分片副本数量。注意，`acknowledged` 或 `shards_acknowledged` 仍有可能为 `false`，但索引创建是成功的。这个值只简单表明在超时前操作是否完成。如果 `acknowledged` 为 `false`，然后为新创建的索引更新集群状态之前，我们超时了，但它也可能很快被创建。如果 `shards_acknowledged` 为 `false`，在启动所需数量的分片之前我们就超时了（默认情况下，只有主碎片），即使集群状态已成功更新以反映新创建的索引（如，`acknowledged=true`）。

我们可以通过索引设置 `index.write.wait_for_active_shards`，更改等待主分片启动的默认值（注意改变这个设置也会影响后续写入操作上的 `wait_for_active_shards` 值）：

```bash
PUT /test
{
  "settings": {
    "index.write.wait_for_active_shards": "2"
  }
}
```

或者通过请求参数 `wait_for_active_shards`：

```bash
PUT /test?wait_for_active_shards=2
```

对 `wait_for_active_shards` 的详情解释，及它的可能值能在[这里](/rest_apis/document_apis/esindex#活动分片)找到。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-create-index.html)
