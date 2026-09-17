# 获取仓库计量信息 API

返回集群仓库计量信息。

```txt
GET /_nodes/<node_id>/_repositories_metering
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor` 或 `manage` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 描述

可以使用集群仓库计量 API 来检索集群中的仓库计量信息。

此 API 暴露单调非递减的计数器，客户端需要持久存储计算一段时间内聚合所需的信息。此外，此 API 暴露的信息是易失性的，节点重启后不会保留。

## 路径参数

`<node_id>`

（可选，字符串）用于限制返回信息的节点 ID 或名称的逗号分隔列表。

所有节点选择选项的说明请参阅[节点信息 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-nodes-info.html)。

## 响应体

`_nodes`

（对象）包含请求所选择节点数量的统计信息。

`_nodes` 的属性

- `total`（整数）请求选择的总节点数。

- `successful`（整数）成功响应请求的节点数。

- `failed`（整数）拒绝请求或未能响应的节点数。如果此值不为 0，响应中会包含拒绝或失败的原因。

`cluster_name`

（字符串）集群的名称。基于[集群名称设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-name-setting.html)。

`nodes`

（对象）包含请求所选择节点的仓库计量信息。

`nodes` 的属性

`<node_id>`

（数组）该节点的仓库计量信息数组。

`<node_id>` 中对象的属性

- `repository_name`（字符串）仓库名称。

- `repository_type`（字符串）仓库类型。

- `repository_location`（对象）表示仓库内的唯一位置。

  `repository_location` 的属性

  - 仓库类型 `Azure`：

    - `base_path`（字符串）仓库存储数据的容器内路径。

    - `container`（字符串）容器名称。

  - 仓库类型 `GCP`：

    - `base_path`（字符串）仓库存储数据的存储桶内路径。

    - `bucket`（字符串）存储桶名称。

  - 仓库类型 `S3`：

    - `base_path`（字符串）仓库存储数据的存储桶内路径。

    - `bucket`（字符串）存储桶名称。

- `repository_ephemeral_id`（字符串）每次仓库更新时都会更改的标识符。

- `repository_started_at`（long）仓库创建或更新的时间。以自 Unix 纪元以来的毫秒数记录。

- `repository_stopped_at`（可选，long）仓库删除或更新的时间。以自 Unix 纪元以来的毫秒数记录。

- `archived`（布尔值）指示此对象是否已被归档的标志。当仓库关闭或更新时，仓库计量信息会被归档并保留一段时间。这允许检索以前仓库实例的仓库计量信息。

- `cluster_version`（可选，long）此对象被归档时的集群状态版本，此字段可用作逻辑时间戳来删除直到已观察版本的所有归档指标。此字段仅在已归档的仓库计量信息对象中存在。此字段的主要目的是避免仓库计量信息删除期间可能出现的竞争条件，即删除尚未观察到的已归档仓库计量信息。

- `request_counts`（对象）包含按请求类型分组对仓库执行的请求数量的对象。

  `request_counts` 的属性

  - 仓库类型 `Azure`：

    - `GetBlobProperties`（long）Get Blob Properties 请求数。

    - `GetBlob`（long）Get Blob 请求数。

    - `ListBlobs`（long）List Blobs 请求数。

    - `PutBlob`（long）Put Blob 请求数。

    - `PutBlock`（long）Put Block 请求数。

    - `PutBlockList`（long）Put Block List 请求数。

    参阅 [Azure 存储定价](https://azure.microsoft.com/zh-cn/pricing/details/storage/blobs/)。

  - 仓库类型 `GCP`：

    - `GetObject`（long）get object 请求数。

    - `ListObjects`（long）list objects 请求数。

    - `InsertObject`（long）insert object 请求数，包括简单、分段和可恢复上传。可恢复上传可能执行多个 HTTP 请求来插入单个对象，但被视为单个请求，因为它们按单个操作计费。

    参阅 [Google Cloud 存储定价](https://cloud.google.com/storage/pricing)。

  - 仓库类型 `S3`：

    - `GetObject`（long）GetObject 请求数。

    - `ListObjects`（long）ListObjects 请求数。

    - `PutObject`（long）PutObject 请求数。

    - `PutMultipartObject`（long）Multipart 请求数，包括 CreateMultipartUpload、UploadPart 和 CompleteMultipartUpload 请求。

    参阅 [Amazon Web Services Simple Storage Service 定价](https://aws.amazon.com/cn/s3/pricing/)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-repositories-metering-api.html)
