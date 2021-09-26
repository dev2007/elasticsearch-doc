# 索引分片存储 API

返回在一个或多个索引中关于副本分片的存储信息。对于数据流，API 返回流的备份索引的存储信息。

```bash
GET /my-index-000001/_shard_stores
```

## 请求

`GET /<target>/_shard_stores`

`GET /_shard_stores`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `monitor` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 描述

索引分片存储 API 返回以下信息：

- 每个副本分片存在哪个节点
- 每个副本分片分配的 ID
- 每个副本分片唯一 ID
- 打开分片索引时遇到的任何错误或早期故障导致的任何错误

默认情况，API 只返回未分配或有一到多个未分配副本分片的主分片存储信息。

## 路径参数

- `<target>`

  （可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`

  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

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

- `ignore_unavailable`

（可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `status`

  （可选，字符串）用于限制请求的逗号分隔的分片健康状态。

  有效值包括：

  - `green`

    主分片和所有副本分片都已分配。

  - `yellow`

    一个或多个副本分片未分配。

  - `red`

    主分片未分配。

  - `all`

    返回所有分片，忽略健康状态。

  默认为 `yellow,red`。

## 示例

### 获取特定数据流或索引的分片存储信息

```bash
GET /test/_shard_stores
```

### 获取多个数据流和索引的分片存储信息

```bash
GET /test1,test2/_shard_stores
```

### 获取所有数据流和索引的分片存储信息

```bash
GET /_shard_stores
```

### 基于集群运行状况获取分片存储信息

你可以使用查询参数 `status` 来限制基于分片健康的返回信息。

以下的请求只返回已分配的主分片和副本分片信息。

```bash
GET /_shard_stores?status=green
```

API 返回以下响应：

```bash
{
  "indices": {
    "my-index-00001": {
      "shards": {
        "0": {
          "stores": [
            {
            "sPa3OgxLSYGvQ4oPs-Tajw": {
              "name": "node_t0",
              "ephemeral_id": "9NlXRFGCT1m8tkvYCMK-8A",
              "transport_address": "local[1]",
              "attributes": {},
              "roles": [...]
            },
            "allocation_id": "2iNySv_OQVePRX-yaRH_lQ",  
            "allocation": "primary|replica|unused",
            "store_exception": ...
            }
          ]
        }
      }
    }
  }
}
```

1. `"0": {` ： 密钥是存储信息的对应分片 id
2. `"stores": [`：分片所有副本的存储信息列表
3. `"sPa3OgxLSYGvQ4oPs-Tajw": {`： 托管存储副本的节点信息，密钥是唯一的节点 id
4. `"allocation_id": "2iNySv_OQVePRX-yaRH_lQ",`：存储副本的分配 id
5. `"allocation": "primary|replica|unused"`： 存储副本的状态，无论它是否用作主副本、副本还是根本未使用
6. `"store_exception": ...`：打开分片索引或早期引擎故障时遇到的任何异常

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-shards-stores.html)
