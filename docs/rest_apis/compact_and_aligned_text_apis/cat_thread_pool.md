# cat 线程池 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[节点信息 API](/rest_apis/cluster_apis/nodes_info)。

::::

返回集群中每个节点的线程池统计信息。返回的信息包括所有内置线程池和自定义线程池。

## 请求

```json
GET /_cat/thread_pool/<thread_pool>
```

```json
GET /_cat/thread_pool
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<thread_pool>`（可选，字符串）

  用于限制请求的线程池名称的逗号分隔列表。接受通配符表达式。

## 查询参数

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果未指定要包含的列，API 将按以下列出的顺序返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列包括：

  - `node_name`：（默认）节点名称，例如 `I8hydUG`。
  - `name`：（默认）线程池名称，例如 `analyze` 或 `generic`。
  - `active`、`a`：（默认）当前线程池中的活动线程数。
  - `queue`、`q`：（默认）当前线程池队列中的任务数。
  - `rejected`、`r`：（默认）线程池执行器拒绝的任务数。
  - `completed`、`c`：线程池执行器已完成的任务数。
  - `core`、`cr`：当前线程池中配置的允许活动核心线程数。
  - `ephemeral_id`、`eid`：临时节点 ID。
  - `host`、`h`：当前节点的主机名。
  - `ip`、`i`：当前节点的 IP 地址。
  - `keep_alive`、`k`：线程的配置保持存活时间。
  - `largest`、`l`：当前线程池中活动线程的最高数量。
  - `max`、`mx`：当前线程池中配置的允许最大活动线程数。
  - `node_id`、`id`：节点 ID，例如 `k0zy`。
  - `pid`、`p`：运行中节点的进程 ID。
  - `pool_size`、`psz`：当前线程池中的线程数。
  - `port`、`po`：当前节点绑定的传输端口。
  - `queue_size`、`qs`：当前线程池队列中允许的最大任务数。
  - `size`、`sz`：当前线程池中配置的固定活动线程数。
  - `type`、`t`：线程池类型。返回值为 `fixed`、`fixed_auto_queue_size`、`direct` 或 `scaling`。

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

### 默认列示例

```json
GET /_cat/thread_pool
```

API 返回以下响应：

```text
node-0 analyze             0 0 0
...
node-0 fetch_shard_started 0 0 0
node-0 fetch_shard_store   0 0 0
node-0 flush               0 0 0
...
node-0 write               0 0 0
```

### 显式列示例

以下 API 请求返回 `id`、`name`、`active`、`rejected` 和 `completed` 列。请求将返回信息限制为 `generic` 线程池。

```json
GET /_cat/thread_pool/generic?v=true&h=id,name,active,rejected,completed
```

API 返回以下响应：

```text
id                     name    active rejected completed
0EWUhXeBQtaVGlexUeVwMg generic      0        0        70
```
