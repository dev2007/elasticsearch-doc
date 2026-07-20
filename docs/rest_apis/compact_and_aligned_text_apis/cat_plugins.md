# cat 插件 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[节点信息 API](/rest_apis/cluster_apis/nodes_info)。

::::

返回集群中每个节点上运行的插件列表。

## 请求

```json
GET /_cat/plugins
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
GET /_cat/plugins?v=true&s=component&h=name,component,version,description
```

API 返回以下响应：

```text
name    component               version   description
U7321H6 analysis-icu            8.18.8 The ICU Analysis plugin integrates the Lucene ICU module into Elasticsearch, adding ICU-related analysis components.
U7321H6 analysis-kuromoji       8.18.8 The Japanese (kuromoji) Analysis plugin integrates Lucene kuromoji analysis module into elasticsearch.
U7321H6 analysis-nori           8.18.8 The Korean (nori) Analysis plugin integrates Lucene nori analysis module into elasticsearch.
U7321H6 analysis-phonetic       8.18.8 The Phonetic Analysis plugin integrates phonetic token filter analysis with elasticsearch.
U7321H6 analysis-smartcn        8.18.8 Smart Chinese Analysis plugin integrates Lucene Smart Chinese analysis module into elasticsearch.
U7321H6 analysis-stempel        8.18.8 The Stempel (Polish) Analysis plugin integrates Lucene stempel (polish) analysis module into elasticsearch.
U7321H6 analysis-ukrainian      8.18.8 The Ukrainian Analysis plugin integrates the Lucene UkrainianMorfologikAnalyzer into elasticsearch.
U7321H6 discovery-azure-classic 8.18.8 The Azure Classic Discovery plugin allows to use Azure Classic API for the unicast discovery mechanism
U7321H6 discovery-ec2           8.18.8 The EC2 discovery plugin allows to use AWS API for the unicast discovery mechanism.
U7321H6 discovery-gce           8.18.8 The Google Compute Engine (GCE) Discovery plugin allows to use GCE API for the unicast discovery mechanism.
U7321H6 mapper-annotated-text   8.18.8 The Mapper Annotated_text plugin adds support for text fields with markup used to inject annotation tokens into the index.
U7321H6 mapper-murmur3          8.18.8 The Mapper Murmur3 plugin allows to compute hashes of a field's values at index-time and to store them in the index.
U7321H6 mapper-size             8.18.8 The Mapper Size plugin allows document to record their uncompressed size at index time.
U7321H6 store-smb               8.18.8 The Store SMB plugin adds support for SMB stores.
```
