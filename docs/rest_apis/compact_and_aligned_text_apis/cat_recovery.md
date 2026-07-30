# cat 恢复 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[索引恢复 API](/rest_apis/index_apis/index_recovery)。

::::

返回正在进行和已完成的分片恢复信息，类似于索引恢复 API。

对于数据流，API 返回有关数据流后备索引的信息。

## 请求

```json
GET /_cat/recovery/<target>
```

```json
GET /_cat/recovery
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。你还必须拥有所检索的任何数据流、索引或别名的 `monitor` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

cat 恢复 API 返回有关分片恢复的信息，包括正在进行的和已完成的。它是 JSON 索引恢复 API 的更紧凑视图。

分片恢复是初始化分片副本的过程，例如从快照恢复主分片或从主分片创建副本分片。当分片恢复完成时，恢复的分片可用于搜索和索引。

恢复在以下过程中自动发生：

- 首次创建索引时。
- 节点重新加入集群并使用其数据路径中持有的数据启动任何缺失的主分片副本时。
- 从主分片创建新的副本分片时。
- 将分片副本重定位到同一集群中的不同节点时。
- 快照恢复操作时。
- 克隆、缩小或拆分操作时。

你可以使用恢复 API 或 cat 恢复 API 来确定分片恢复的原因。

## 路径参数

- `<target>`（可选，字符串）

  用于限制请求的数据流、索引和别名的逗号分隔列表。支持通配符（`*`）。要目标所有数据流和索引，请省略此参数或使用 `*` 或 `_all`。

## 查询参数

- `active_only`（可选，布尔值）

  如果为 `true`，响应仅包含正在进行的分片恢复。默认为 `false`。

- `bytes`（可选，[字节大小单位](/rest_apis/api_convention/common_options#字节大小单位)）

  用于显示字节值的单位。

- `detailed`（可选，布尔值）

  如果为 `true`，响应将包含分片恢复的详细信息。默认为 `false`。

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果未指定要包含的列，API 将按以下列出的顺序返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列包括：

  - `index`、`i`、`idx`：（默认）索引名称。
  - `shard`、`s`、`sh`：（默认）分片名称。
  - `time`、`t`、`ti`、`primaryOrReplica`：（默认）恢复经过时间。
  - `type`、`ty`：（默认）恢复类型，来自对等节点或快照。
  - `stage`、`st`：（默认）恢复阶段。返回值为：
    - `INIT`
    - `INDEX`：恢复 Lucene 文件，要么重用本地文件，要么复制新文件
    - `VERIFY_INDEX`：可能运行检查索引
    - `TRANSLOG`：启动引擎，回放 translog
    - `FINALIZE`：在所有 translog 操作完成后执行最终任务
    - `DONE`
  - `source_host`、`shost`：（默认）索引移出的主机地址。
  - `source_node`、`snode`：（默认）索引移出的节点名称。
  - `target_host`、`thost`：（默认）索引移入的主机地址。
  - `target_node`、`tnode`：（默认）索引移入的节点名称。
  - `repository`、`rep`：（默认）正在使用的仓库名称。如果不相关则为 `n/a`。
  - `snapshot`、`snap`：（默认）正在使用的快照名称。如果不相关则为 `n/a`。
  - `files`、`f`：（默认）要恢复的文件总数。
  - `files_recovered`、`fr`：（默认）当前已恢复的文件数。
  - `files_percent`、`fp`：（默认）当前已恢复文件的百分比。
  - `files_total`、`tf`：（默认）文件总数。
  - `bytes`、`b`：（默认）要恢复的字节总数。
  - `bytes_recovered`、`br`：（默认）当前已恢复的字节总数。
  - `bytes_percent`、`bp`：（默认）当前已恢复字节的百分比。
  - `bytes_total`、`tb`：（默认）字节总数。
  - `translog_ops`、`to`：（默认）要恢复的 translog 操作总数。
  - `translog_ops_recovered`、`tor`：（默认）当前已恢复的 translog 操作总数。
  - `translog_ops_percent`、`top`：（默认）当前已恢复 translog 操作的百分比。
  - `start_time`、`start`：恢复操作的开始时间。
  - `start_time_millis`、`start_millis`：恢复操作的开始时间（纪元毫秒）。
  - `stop_time`、`stop`：恢复操作的结束时间。如果正在进行则为 `1970-01-01T00:00:00.000Z`。
  - `stop_time_millis`、`stop_millis`：恢复操作的结束时间（纪元毫秒）。如果正在进行则为 `0`。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `index`（可选，字符串）

  用于限制请求的索引名称的逗号分隔列表或通配符表达式。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `time`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  用于显示时间值的单位。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 示例

### 无正在进行的恢复示例

```json
GET _cat/recovery?v=true
```

API 返回以下响应：

```text
index             shard time type  stage source_host source_node target_host target_node repository snapshot files files_recovered files_percent files_total bytes bytes_recovered bytes_percent bytes_total translog_ops translog_ops_recovered translog_ops_percent
my-index-000001   0     13ms store done  n/a         n/a         127.0.0.1   node-0      n/a        n/a      0     0               100%          13          0b    0b              100%          9928b       0            0                      100.0%
```

在此示例响应中，源节点和目标节点相同，因为恢复类型为 `store`，意味着它们是在节点启动时从本地存储读取的。

### 实时分片恢复示例

通过增加索引的副本数量并使另一个节点上线来托管副本，你可以检索正在进行的恢复信息。

```json
GET _cat/recovery?v=true&h=i,s,t,ty,st,shost,thost,f,fp,b,bp
```

API 返回以下响应：

```text
i               s t      ty   st    shost       thost       f     fp      b  bp
my-index-000001 0 1252ms peer done  192.168.1.1 192.168.1.2 0     100.0%  0b 100.0%
```

在此示例响应中，恢复类型为 `peer`，意味着分片从另一个节点恢复。返回的文件和字节数为实时测量值。

### 快照恢复示例

你可以使用快照和恢复 API 恢复索引的备份。你可以使用 cat 恢复 API 检索有关快照恢复的信息。

```json
GET _cat/recovery?v=true&h=i,s,t,ty,st,rep,snap,f,fp,b,bp
```

API 返回以下响应，恢复类型为 `snapshot`：

```text
i               s t      ty       st    rep     snap   f  fp   b     bp
my-index-000001 0 1978ms snapshot done  my-repo snap-1 79 8.0% 12086 9.0%
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-recovery.html)
