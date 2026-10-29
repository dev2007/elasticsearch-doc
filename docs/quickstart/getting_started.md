# 基础：使用 Elasticsearch API 索引和搜索数据

本快速入门指南是 Elasticsearch 基本概念的动手介绍：索引、文档和字段类型映射。

你将学习如何创建索引、以文档形式添加数据、使用动态和显式映射，以及执行你的第一个基本搜索。

本教程中的代码示例默认使用 Console 语法。你可以在 Console UI 中将其转换为其他编程语言。

## 要求

你需要一个正在运行的 Elasticsearch 集群，以及用于 Dev Tools API Console 的 Kibana。在终端中运行以下命令，在 Docker 中设置一个单节点本地集群：

```sh
curl -fsSL https://elastic.co/start-local | sh
```

## 步骤 1：创建索引

创建一个名为 `books` 的新索引：

```txt
PUT /books
```

以下响应表示索引创建成功：

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "books"
}
```

## 步骤 2：向索引添加数据

本教程使用 Elasticsearch API，但还有许多其他向 Elasticsearch 添加数据的方式。

你以称为文档的 JSON 对象的形式向 Elasticsearch 添加数据。Elasticsearch 将这些文档存储在可搜索的索引中。

### 添加单个文档

提交以下索引请求，向 `books` 索引添加一个文档。如果该索引尚不存在，此请求会自动创建它：

```txt
POST books/_doc
{
  "name": "Snow Crash",
  "author": "Neal Stephenson",
  "release_date": "1992-06-01",
  "page_count": 470
}
```

响应包含 Elasticsearch 为文档生成的元数据，包括唯一的 `_id`：

```json
{
  "_index": "books",
  "_id": "O0lG2IsBaSa7VYx_rEia",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "_seq_no": 0,
  "_primary_term": 1
}
```

字段说明：

- `_index`：表示文档被添加到的索引。
- `_id`：文档的唯一标识符。
- `_version`：表示文档的版本。
- `result`：表示索引操作的结果。
- `_shards`：包含索引操作在其上执行的分片数量及成功的分片数量的信息。
  - `total`：索引的分片总数。
  - `successful`：在其上执行索引操作的分片数量。
  - `failed`：失败的分片数量；`0` 表示没有失败。
- `_seq_no`：分片上每次索引操作都会递增的单调递增编号。
- `_primary_term`：每当主分片被分配到不同节点时递增的单调递增编号。

### 添加多个文档

使用 `_bulk` 端点在一个请求中添加多个文档。批量数据必须格式化为换行符分隔的 JSON（NDJSON）：

```txt
POST /_bulk
{ "index" : { "_index" : "books" } }
{"name": "Revelation Space", "author": "Alastair Reynolds", "release_date": "2000-03-15", "page_count": 585}
{ "index" : { "_index" : "books" } }
{"name": "1984", "author": "George Orwell", "release_date": "1985-06-01", "page_count": 328}
{ "index" : { "_index" : "books" } }
{"name": "Fahrenheit 451", "author": "Ray Bradbury", "release_date": "1953-10-15", "page_count": 227}
{ "index" : { "_index" : "books" } }
{"name": "Brave New World", "author": "Aldous Huxley", "release_date": "1932-06-01", "page_count": 268}
{ "index" : { "_index" : "books" } }
{"name": "The Handmaids Tale", "author": "Margaret Atwood", "release_date": "1985-06-01", "page_count": 311}
```

你收到的响应应指示没有错误：

```json
{
  "errors": false,
  "took": 29,
  "items": [
    {
      "index": {
        "_index": "books",
        "_id": "QklI2IsBaSa7VYx_Qkh-",
        "_version": 1,
        "result": "created",
        "_shards": { "total": 2, "successful": 2, "failed": 0 },
        "_seq_no": 1,
        "_primary_term": 1,
        "status": 201
      }
    },
    "...（其余 4 个文档的结果与此类似）"
  ]
}
```

## 步骤 3：定义映射和数据类型

映射定义数据在 Elasticsearch 中的存储和索引方式，类似于关系数据库中的模式。

### 使用动态映射

使用动态映射时，Elasticsearch 默认会自动为新字段创建映射。到目前为止添加的文档都使用了动态映射，因为创建索引时未指定映射。

要了解动态映射的工作原理，添加一个包含现有文档中未出现字段的新文档：

```txt
POST /books/_doc
{
  "name": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "release_date": "1925-04-10",
  "page_count": 180,
  "language": "EN"
}
```

其中 `language` 字段是新字段。

通过获取映射 API 查看 books 索引的映射。新字段 `language` 已被添加到映射中，数据类型为 text：

```txt
GET /books/_mapping
```

示例响应：

```json
{
  "books": {
    "mappings": {
      "properties": {
        "author": {
          "type": "text",
          "fields": {
            "keyword": { "type": "keyword", "ignore_above": 256 }
          }
        },
        "name": {
          "type": "text",
          "fields": {
            "keyword": { "type": "keyword", "ignore_above": 256 }
          }
        },
        "language": {
          "type": "text",
          "fields": {
            "keyword": { "type": "keyword", "ignore_above": 256 }
          }
        },
        "page_count": { "type": "long" },
        "release_date": { "type": "date" }
      }
    }
  }
}
```

### 定义显式映射

创建一个名为 `my-explicit-mappings-books` 的显式映射索引。将每个字段的属性作为 JSON 对象传入。该对象应包含字段的数据类型及任何其他映射参数：

```txt
PUT /my-explicit-mappings-books
{
  "mappings": {
    "dynamic": false,
    "properties": {
      "name": { "type": "text" },
      "author": { "type": "text" },
      "release_date": { "type": "date", "format": "yyyy-MM-dd" },
      "page_count": { "type": "integer" }
    }
  }
}
```

- `dynamic: false`：为该索引禁用动态映射。包含映射中未定义字段的文档将被拒绝。
- `properties`：properties 对象定义此索引中文档的字段及其数据类型。

示例响应：

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "my-explicit-mappings-books"
}
```

### 组合使用动态映射和显式映射

显式映射在创建索引时定义，文档必须符合这些映射。你也可以使用更新映射 API。当索引的 `dynamic` 标志设置为 `true` 时，你可以在不更新映射的情况下向文档添加新字段。

这允许你组合使用显式映射和动态映射。了解更多关于管理和更新映射的信息。

## 步骤 4：搜索你的索引

被索引的文档可使用 `_search` API 近实时地进行搜索。

### 搜索所有文档

运行以下命令搜索 books 索引中的所有文档：

```txt
GET books/_search
```

示例响应：

```json
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 7,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "books",
        "_id": "CwICQpIBO6vvGGiC_3Ls",
        "_score": 1,
        "_source": {
          "name": "Brave New World",
          "author": "Aldous Huxley",
          "release_date": "1932-06-01",
          "page_count": 268
        }
      },
      "...（其余命中结果省略）"
    ]
  }
}
```

字段说明：

- `took`：Elasticsearch 执行搜索所用的时间（毫秒）。
- `timed_out`：搜索是否超时。
- `_shards`：关于在其上执行搜索的分片数量及成功数量的信息。
- `hits`：搜索结果。
- `total`：关于匹配文档总数的信息。
- `max_score`：所有匹配文档中最高的相关性评分。
- `_index`：文档所属的索引。
- `_id`：文档的唯一标识符。
- `_score`：文档的相关性评分。
- `_source`：索引时提交的原始 JSON 对象。

### match 查询

你可以使用 match 查询搜索在特定字段中包含特定值的文档。这是全文搜索的标准查询。

运行以下命令搜索 books 索引中 `name` 字段包含 `brave` 的文档：

```txt
GET books/_search
{
  "query": {
    "match": {
      "name": "brave"
    }
  }
}
```

示例响应：

```json
{
  "took": 9,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": { "value": 1, "relation": "eq" },
    "max_score": 0.6931471,
    "hits": [
      {
        "_index": "books",
        "_id": "CwICQpIBO6vvGGiC_3Ls",
        "_score": 0.6931471,
        "_source": {
          "name": "Brave New World",
          "author": "Aldous Huxley",
          "release_date": "1932-06-01",
          "page_count": 268
        }
      }
    ]
  }
}
```

:::note 注意

`max_score` 是结果中评分最高文档的评分。本例中只有一个匹配文档，因此 `max_score` 就是该文档的评分。

:::

## 步骤 5：删除你的索引（可选）

在学习示例的过程中，你可能希望删除某个索引以便从头开始。你可以使用删除索引 API 删除索引。

例如，运行以下命令删除本教程中创建的索引：

```txt
DELETE /books
DELETE /my-explicit-mappings-books
```

:::warning 警告

删除索引会永久删除其文档、分片和元数据。

:::

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/getting-started.html)
