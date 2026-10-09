# 获取快照仓库 API

获取一个或多个已注册快照仓库的信息。

```txt
GET /_snapshot/<repository>
GET /_snapshot
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor_snapshot`、`create_snapshot` 或 `manage` 集群权限才能使用此 API。

## 路径参数

`<repository>`

（可选，字符串）用于限定请求的快照仓库名称的逗号分隔列表。支持通配符（`*`）表达式，包括将通配符与以 `-` 开头的排除模式组合使用。要获取**所有**已注册仓库的信息，请省略此参数，或使用 `*` 或 `_all`。

## 查询参数

`local`

（可选，布尔值）默认为 `false`。如果为 `true`，则请求仅从本地节点获取信息。如果为 `false`，则从主节点获取信息。

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

## 响应体

`<repository>`

（对象）包含快照仓库的信息。键为快照仓库的名称。

`type`

（字符串）仓库类型。取值包括：

- `fs`：共享文件系统仓库。
- `source`：仅限源仓库。
- `url`：只读 URL 仓库。

通过官方插件提供的其他仓库类型：

| 插件 | 仓库支持 |
| --- | --- |
| `repository-s3` | S3 仓库 |
| `repository-hdfs` | HDFS 仓库（Hadoop 环境） |
| `repository-azure` | Azure 存储仓库 |
| `repository-gcs` | Google Cloud Storage 仓库 |

`settings`

（对象）包含仓库的设置。有效属性取决于仓库类型（通过 `type` 参数设置）。有关属性，参见创建或更新快照仓库 API 的 `settings` 参数。

## 示例

以下示例获取仓库 `my_repository` 的信息：

```txt
GET /_snapshot/my_repository
```

API 返回以下响应：

```json
{
  "my_repository" : {
    "type" : "fs",
    "uuid" : "0JLknrXbSUiVPuLakHjBrQ",
    "settings" : {
      "location" : "my_backup_location"
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-snapshot-repo-api.html)
