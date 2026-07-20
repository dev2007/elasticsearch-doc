# cat 主节点 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[节点信息 API](/rest_apis/cluster_apis/nodes_info)。

::::

返回主节点的信息，包括 ID、绑定的 IP 地址和名称。

## 请求

```json
GET /_cat/master
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 查询参数

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `local`（可选，布尔值）

  如果为 `true`，请求仅从本地节点检索信息。默认为 `false`，表示从主节点检索信息。

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 示例

```json
GET /_cat/master?v=true
```

API 返回以下响应：

```text
id                     host      ip        node
YzWoH_2BT-6UjVGDyPdqYg 127.0.0.1 127.0.0.1 YzWoH_2
```

此信息也可以通过 nodes 命令获取，但当你只想验证所有节点对主节点是否达成一致时，此命令更简洁：

```text
% pssh -i -h list.of.cluster.hosts curl -s localhost:9200/_cat/master
[1] 19:16:37 [SUCCESS] es3.vm
Ntgn2DcuTjGuXlhKDUD4vA 192.168.56.30 H5dfFeA
[2] 19:16:37 [SUCCESS] es2.vm
Ntgn2DcuTjGuXlhKDUD4vA 192.168.56.30 H5dfFeA
[3] 19:16:37 [SUCCESS] es1.vm
Ntgn2DcuTjGuXlhKDUD4vA 192.168.56.30 H5dfFeA
```
