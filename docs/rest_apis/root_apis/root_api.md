# 根 API

::::::info 新版 API 参考

有关最新的 API 详情，请参阅[信息 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-info)。

::::::

Elasticsearch API 的基础 URL（`GET /`）返回基本的构建、版本和集群信息。

```txt
GET /
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor`、`manage` 或 `all` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 响应体

`name`

（字符串）响应节点的名称。

`cluster_name`

（字符串）响应集群的名称。

`cluster_uuid`

（字符串）响应集群的 UUID（由集群状态确认）。

`version`

（对象）包含有关正在运行的 Elasticsearch 版本的信息。

`version` 的属性

- `number`（字符串）响应的 Elasticsearch 发布版本的版本号。

- `build_flavor`（字符串）构建风格，例如 `default`。

- `build_type`（字符串）与 Elasticsearch 安装方式对应的构建类型，例如 `docker`、`rpm`、`tar`。

- `build_hash`（字符串）Elasticsearch 的 Git 提交的 SHA 哈希值。

- `build_date`（字符串）Elasticsearch 的 Git 提交的日期。

- `build_snapshot`（布尔值）Elasticsearch 的构建是否来自快照。

- `lucene_version`（字符串）Elasticsearch 底层 Lucene 软件的版本号。

- `minimum_wire_compatibility_version`（字符串）响应节点可以与之通信的最低节点版本。也是可以执行[滚动升级](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rolling-upgrades.html)的最低版本。

- `minimum_index_compatibility_version`（字符串）响应节点可以从磁盘读取的最低索引版本。

## 示例

```txt
GET /
```

响应示例：

```json
{
  "name": "instance-0000000000",
  "cluster_name": "my_test_cluster",
  "cluster_uuid": "5QaxoN0pRZuOmWSxstBBwQ",
  "version": {
    "build_date": "2024-02-01T13:07:13.727175297Z",
    "minimum_wire_compatibility_version": "7.17.0",
    "build_hash": "6185ba65d27469afabc9bc951cded6c17c21e3f3",
    "number": "8.12.1",
    "lucene_version": "9.9.2",
    "minimum_index_compatibility_version": "7.0.0",
    "build_flavor": "default",
    "build_snapshot": false,
    "build_type": "docker"
  },
  "tagline": "You Know, for Search"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rest-api-root.html)
