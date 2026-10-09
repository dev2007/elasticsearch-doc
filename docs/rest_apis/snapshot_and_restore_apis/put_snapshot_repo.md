# 创建或更新快照仓库 API

注册或更新快照仓库。

```txt
PUT /_snapshot/<repository>
POST /_snapshot/<repository>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 集群权限才能使用此 API。
- 要注册快照仓库，集群的全局元数据必须是可写的。确保没有任何阻止写访问的集群块。

## 描述

:::note 注意

如果要迁移可搜索快照，源集群和目标集群中的仓库名称必须相同。

:::

## 路径参数

`<repository>`

（必需，字符串）要注册或更新的快照仓库的名称。

## 查询参数

:::note 注意

此 API 的几个选项既可以使用查询参数指定，也可以使用请求体参数指定。如果两者都指定，则**仅使用查询参数**。

:::

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）在更新集群元数据后，等待集群中所有相关节点响应的期限。如果在超时期限到期之前未收到响应，集群元数据的更新仍然生效，但响应将指示未被完全确认。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

`verify`

（可选，布尔值）默认为 `true`。如果为 `true`，则请求会验证仓库在集群中所有主节点和数据节点上是否可用。如果为 `false`，则跳过此验证。你可以使用验证快照仓库 API 手动执行此验证。

## 请求体

`type`

（必需，字符串）仓库类型。有效值包括：

- `azure`：Azure 仓库。
- `gcs`：Google Cloud Storage 仓库。
- `s3`：S3 仓库。
- `fs`：共享文件系统仓库。
- `source`：仅限源仓库。
- `url`：只读 URL 仓库。

通过官方插件提供的其他仓库类型：

- `hdfs`：Hadoop 分布式文件系统（HDFS）仓库。

`settings`

（必需，对象）仓库的设置。支持的设置因仓库类型而异：

- [Azure 仓库设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/repository-azure.html)
- [Google Cloud Storage 仓库设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/repository-gcs.html)
- [S3 仓库设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/repository-s3.html)
- [共享文件系统仓库设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/shared-file-system-repository.html)
- [只读 URL 仓库设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/url-repository.html)
- [仅限源仓库设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/source-only-repository.html)
- [HDFS 仓库设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/repository-hdfs.html)（通过官方插件）

`verify`

（可选，布尔值）与查询参数相同：如果为 `true`，则请求会验证仓库在集群中所有主节点和数据节点上是否可用。如果为 `false`，则跳过此验证。默认为 `true`。也可以通过验证快照仓库 API 手动执行。

## 示例

以下示例注册一个名为 `my_repository` 的共享文件系统仓库：

```txt
PUT /_snapshot/my_repository
{
  "type": "fs",
  "settings": {
    "location": "my_backup_location"
  }
}
```

API 返回以下响应：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-snapshot-repo-api.html)
