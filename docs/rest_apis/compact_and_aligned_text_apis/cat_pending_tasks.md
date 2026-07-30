# cat 待处理任务 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[待处理集群任务 API](/rest_apis/cluster_apis/pending_cluster_tasks)。

::::

返回尚未执行的集群级别变更，类似于待处理集群任务 API。

## 请求

```json
GET /_cat/pending_tasks
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

- `time`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  用于显示时间值的单位。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 示例

```json
GET /_cat/pending_tasks?v=true
```

API 返回以下响应：

```text
insertOrder timeInQueue priority source
       1685       855ms HIGH     update-mapping [foo][t]
       1686       843ms HIGH     update-mapping [foo][t]
       1693       753ms HIGH     refresh-mapping [foo][[t]]
       1688       816ms HIGH     update-mapping [foo][t]
       1689       802ms HIGH     update-mapping [foo][t]
       1690       787ms HIGH     update-mapping [foo][t]
       1691       773ms HIGH     update-mapping [foo][t]
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-pending-tasks.html)
