# cat 分配 API

::::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。
::::

::::caution 警告
cat API 仅用于使用命令行或 Kibana 控制台的人工查看。它们不适用于应用程序。
::::

提供分配给每个数据节点的分片数量及其磁盘空间的快照。

## 请求

```bash
GET /_cat/allocation/<node_id>
```

```bash
GET /_cat/allocation
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<node_id>`（可选，字符串）

  用于限制返回信息的节点 ID 或名称的逗号分隔列表。

## 查询参数

- `bytes`（可选，[字节大小单位](/rest_apis/api_convention/common_options#字节大小单位)）

  用于显示字节值的单位。

- `format`（可选，字符串）

  HTTP accept 头的简写版本。有效值包括 JSON、YAML 等。

- `local`（可选，布尔值）

  如果为 `true`，请求仅从本地节点检索信息。默认为 `false`，表示从主节点检索信息。

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果在超时到期前主节点不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

- `help`（可选，布尔值）

  如果为 `true`，响应包含帮助信息。默认为 `false`。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `v`（可选，布尔值）

  如果为 `true`，响应包含列标题。默认为 `false`。

## 响应体

- `shards`（整数）

  分配给该节点的主分片和副本分片数量。

- `shards.undesired`（整数）

  计划在集群中移动到其他位置的分片数量，如果使用的不是期望平衡分配器则为 `-1`。

- `write_load.forecast`（浮点数）

  索引写入负载预测的总和。

- `disk.indices.forecast`（浮点数）

  分片大小预测的总和。

- `disk.indices`（字符串）

  节点分片使用的磁盘空间。不包括事务日志或未分配分片的磁盘空间。

  此指标会对硬链接文件（例如缩小、拆分或克隆索引时创建的文件）的磁盘空间进行重复计算。

- `disk.used`（字符串）

  正在使用的总磁盘空间。Elasticsearch 从节点的操作系统（OS）检索此指标。该指标包括以下磁盘空间：

  - Elasticsearch，包括事务日志和未分配分片
  - 节点的操作系统
  - 节点上的任何其他应用程序或文件

  与 `disk.indices` 不同，此指标不会对硬链接文件的磁盘空间进行重复计算。

- `disk.avail`（字符串）

  Elasticsearch 可用的空闲磁盘空间。Elasticsearch 从节点的操作系统检索此指标。基于磁盘的分片分配使用此指标根据可用磁盘空间将分片分配给节点。

- `disk.total`（字符串）

  节点的总磁盘空间，包括已用和可用空间。

- `disk.percent`（整数）

  正在使用的磁盘空间总百分比。计算方式为 `disk.used` / `disk.total`。

- `host`（字符串）

  节点的网络主机。使用 `network.host` 设置。

- `ip`（字符串）

  节点的 IP 地址和端口。

- `node`（字符串）

  节点名称。使用 `node.name` 设置。

- `node.role`、`r`、`role`、`nodeRole`（字符串）

  节点角色。

## 示例

```bash
GET /_cat/allocation?v=true
```

API 返回以下响应：

```bash
shards shards.undesired write_load.forecast disk.indices.forecast disk.indices disk.used disk.avail disk.total disk.percent host      ip        node    node.role
     1                0                 0.0                  260b         260b    47.3gb     43.4gb    100.7gb           46 127.0.0.1 127.0.0.1 CSUXak2 himrst
```

此响应显示一个分片被分配到唯一可用的节点上。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-allocation.html)
