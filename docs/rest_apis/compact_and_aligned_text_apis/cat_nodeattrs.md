# cat 节点属性 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[节点信息 API](/rest_apis/cluster_apis/nodes_info)。

::::

返回自定义节点属性的信息。

## 请求

```json
GET /_cat/nodeattrs
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 查询参数

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果未指定要包含的列，API 将按以下列出的顺序返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列包括：

  - `node`、`name`：（默认）节点名称，例如 `DKDM97B`。
  - `host`、`h`：（默认）主机名，例如 `n1`。
  - `ip`、`i`：（默认）IP 地址，例如 `127.0.1.1`。
  - `attr`、`attr.name`：（默认）属性名称，例如 `rack`。
  - `value`、`attr.value`：（默认）属性值，例如 `rack123`。
  - `id`、`nodeId`：节点 ID，例如 `k0zy`。
  - `pid`、`p`：进程 ID，例如 `13061`。
  - `port`、`po`：绑定的传输端口，例如 `9300`。

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

### 默认列示例

```json
GET /_cat/nodeattrs?v=true
```

API 返回以下响应：

```text
node    host      ip        attr     value
...
node-0 127.0.0.1 127.0.0.1 testattr test
...
```

`node`、`host` 和 `ip` 列提供每个节点的基本信息。`attr` 和 `value` 列返回自定义节点属性，每行一个。

### 显式列示例

以下 API 请求返回 `name`、`pid`、`attr` 和 `value` 列。

```json
GET /_cat/nodeattrs?v=true&h=name,pid,attr,value
```

API 返回以下响应：

```text
name    pid   attr     value
...
node-0 19566 testattr test
...
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-nodeattrs.html)
