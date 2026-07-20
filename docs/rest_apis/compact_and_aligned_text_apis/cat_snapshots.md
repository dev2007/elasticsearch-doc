# cat 快照 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[获取快照 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-snapshot-api.html)。

::::

返回存储在一个或多个仓库中的快照信息。快照是索引或运行中的 Elasticsearch 集群的备份。

## 请求

```json
GET /_cat/snapshots/<repository>
```

```json
GET /_cat/snapshots
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor_snapshot`、`create_snapshot` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<repository>`（可选，字符串）

  用于限制请求的快照仓库的逗号分隔列表。接受通配符表达式。`_all` 返回所有仓库。

  如果请求期间任何仓库失败，Elasticsearch 将返回错误。

## 查询参数

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果未指定要包含的列，API 将按以下列出的顺序返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列包括：

  - `id`、`snapshot`：（默认）快照 ID，例如 `snap1`。
  - `repository`、`re`、`repo`：（默认）仓库名称，例如 `repo1`。
  - `status`、`s`：（默认）快照过程的状态。返回值为：
    - `FAILED`：快照过程失败。
    - `INCOMPATIBLE`：快照过程与当前集群版本不兼容。
    - `IN_PROGRESS`：快照过程已启动但尚未完成。
    - `PARTIAL`：快照过程完成但仅部分成功。
    - `SUCCESS`：快照过程完全成功完成。
  - `start_epoch`、`ste`、`startEpoch`：（默认）快照过程开始的 Unix 纪元时间。
  - `start_time`、`sti`、`startTime`：（默认）快照过程开始的 `HH:MM:SS` 时间。
  - `end_epoch`、`ete`、`endEpoch`：（默认）快照过程结束的 Unix 纪元时间。
  - `end_time`、`eti`、`endTime`：（默认）快照过程结束的 `HH:MM:SS` 时间。
  - `duration`、`dur`：（默认）快照过程完成所花费的时间（时间单位）。
  - `indices`、`i`：（默认）快照中的索引数量。
  - `successful_shards`、`ss`：（默认）快照中成功的分片数量。
  - `failed_shards`、`fs`：（默认）快照中失败的分片数量。
  - `total_shards`、`ts`：（默认）快照中的分片总数。
  - `reason`、`r`：任何快照失败的原因。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `ignore_unavailable`（可选，布尔值）

  如果为 `true`，响应不包含来自不可用快照的信息。默认为 `false`。

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
GET /_cat/snapshots/repo1?v=true&s=id
```

API 返回以下响应：

```text
id     repository status start_epoch start_time end_epoch  end_time duration indices successful_shards failed_shards total_shards
snap1  repo1      FAILED 1445616705  18:11:45   1445616978 18:16:18     4.6m       1                 4             1            5
snap2  repo1      SUCCESS 1445634298  23:04:58   1445634672 23:11:12     6.2m       2                10             0           10
```
