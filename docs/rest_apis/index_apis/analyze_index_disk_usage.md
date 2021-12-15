# 分析索引磁盘的使用 API

!> 此功能是实验性的，在将来的版本中可能会完全更改或删除。Elastic 将尽最大努力解决任何问题，但实验性功能不受官方 GA 功能支持 SLA 的约束。

分析索引或数据流中每个字段的磁盘使用情况。此 API 可能不支持在老版本 Elasticsearch 中创建的索引。小索引的结果可能不准确，因为 API 可能无法分析索引的某些部分。

```bash
POST /my-index-000001/_disk_usage?run_expensive_tasks=true
```

## 请求

`POST /<target>/_disk_usage`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对指定索引、数据流或别名必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<target>`

  （必需，字符串）用于限制请求的，逗号分隔的数据流或索引。推荐使用单个索引（或数据流的最新备份索引）执行此 API，因为 API 会大量消耗资源。

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

- `flush`

  （可选，布尔值）如果为 `true`，Elasticsearch 在分析前对索引执行冲刷。如果为 `false`，响应可能不包含未提交的数据。默认为 `true`。

- `ignore_unavailable`

（可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `run_expensive_tasks`

  （必需，布尔值）分析字段磁盘使用情况需要大量资源。为了使用此 API，这个参数必须设置为 `true`。默认为 `false`。

- `wait_for_active_shards`

  （可选，字符串）继续操作前必须处于活动状态的分片副本数。设置为 `all` 或任何正整数，上限为索引中分片的总数（`(number_of_replicas+1`）。默认为：`1`，代表主分片。

  参阅[激活分片](/rest_apis/document_apis/index?id=激活分片)。

## 示例

```bash
POST /my-index-000001/_disk_usage?run_expensive_tasks=true
```

API 返回：

```bash
{
    "_shards": {
        "total": 1,
        "successful": 1,
        "failed": 0
    },
    "my-index-000001": {
        "store_size": "929mb",
        "store_size_in_bytes": 974192723,
        "all_fields": {
            "total": "928.9mb",
            "total_in_bytes": 973977084,
            "inverted_index": {
                "total": "107.8mb",
                "total_in_bytes": 113128526
            },
            "stored_fields": "623.5mb",
            "stored_fields_in_bytes": 653819143,
            "doc_values": "125.7mb",
            "doc_values_in_bytes": 131885142,
            "points": "59.9mb",
            "points_in_bytes": 62885773,
            "norms": "2.3kb",
            "norms_in_bytes": 2356,
            "term_vectors": "2.2kb",
            "term_vectors_in_bytes": 2310
        },
        "fields": {
            "_id": {
                "total": "49.3mb",
                "total_in_bytes": 51709993,
                "inverted_index": {
                    "total": "29.7mb",
                    "total_in_bytes": 31172745
                },
                "stored_fields": "19.5mb",
                "stored_fields_in_bytes": 20537248,
                "doc_values": "0b",
                "doc_values_in_bytes": 0,
                "points": "0b",
                "points_in_bytes": 0,
                "norms": "0b",
                "norms_in_bytes": 0,
                "term_vectors": "0b",
                "term_vectors_in_bytes": 0
            },
            "_primary_term": {...},
            "_seq_no": {...},
            "_version": {...},
            "_source": {
                "total": "603.9mb",
                "total_in_bytes": 633281895,
                "inverted_index": {...},
                "stored_fields": "603.9mb",
                "stored_fields_in_bytes": 633281895,
                "doc_values": "0b",
                "doc_values_in_bytes": 0,
                "points": "0b",
                "points_in_bytes": 0,
                "norms": "0b",
                "norms_in_bytes": 0,
                "term_vectors": "0b",
                "term_vectors_in_bytes": 0
            },
            "context": {
                "total": "28.6mb",
                "total_in_bytes": 30060405,
                "inverted_index": {
                    "total": "22mb",
                    "total_in_bytes": 23090908
                },
                "stored_fields": "0b",
                "stored_fields_in_bytes": 0,
                "doc_values": "0b",
                "doc_values_in_bytes": 0,
                "points": "0b",
                "points_in_bytes": 0,
                "norms": "2.3kb",
                "norms_in_bytes": 2356,
                "term_vectors": "2.2kb",
                "term_vectors_in_bytes": 2310
            },
            "context.keyword": {...},
            "message": {...},
            "message.keyword": {...}
        }
    }
}
```

1. `"store_size": "929mb"`：仅分析索引分片的存储大小。

2. `"total": "928.9mb"`：索引的已分析分片的字段的总大小。这个总数通常小于 <1> 中指定的索引大小，因为一些小的元数据文件被忽略，数据文件的某些部分可能不会被 API 扫描。

3. `"stored_fields": "19.5mb"`：`_id` 字段的存储大小

4. `"stored_fields": "603.9mb"`：`_source` 字段的存储大小。由于存储的字段是以压缩格式存储在一起的，因此存储字段的估计大小可能是不准确的。可能低估了 `_id` 字段的存储大小，而高估了 `_source` 字段的存储大小。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-disk-usage.html)
