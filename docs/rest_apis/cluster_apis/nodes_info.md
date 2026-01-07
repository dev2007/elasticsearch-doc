# 节点信息 API

:::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

返回集群节点信息。

## 请求

```bash
GET /_nodes
```

```bash
GET /_nodes/<node_id>
```

```bash
GET /_nodes/<metric>
```

```bash
GET /_nodes/<node_id>/<metric>
```

## 先决条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

集群节点信息 API 允许检索一个、多个或全部集群节点的信息。所有节点的筛选选项均在[此处](/rest_apis/cluster_apis/cluster_apis)说明。

默认情况下，它会返回节点的所有属性和核心设置。

## 路径参数

- `<metric>`

  （可选，字符串）将返回的信息限制在特定的指标。支持逗号分隔的列表，例如 `http,ingest`。

  - `<metric>` 的有效值

    - `aggregations`

      有关可用聚合类型的信息。

    - `http`

      有关此节点 HTTP 接口的信息。

    - `indices`

      与索引相关的节点级配置：

      - `total_indexing_buffer` ：此节点上索引缓冲区的最大大小。

    - `ingest`

      有关摄取管道和处理器的信息。

    - `jvm`

      JVM 信息，包括其名称、版本和配置。

    - `os`

      操作系统信息，包括其名称和版本。

    - `plugins`
      每个节点上已安装插件和模块的详细信息。每个插件和模块提供以下信息：

      - `name`：插件名称
      - `version`：插件构建所针对的 Elasticsearch 版本
      - `description`：插件用途的简短描述
      - `classname`：插件入口点的完全限定类名
      - `has_native_controller`：插件是否具有原生控制器进程

    - `process`

      进程信息，包括数字进程 ID。

    - `settings`

      列出 `elasticsearch.yml` 文件中定义的所有正在使用的节点设置。

    - `thread_pool`

      有关每个线程池配置的信息。

    - `transport`

      有关节点传输接口的信息。

如果你使用此 API 的完整形式 `GET /_nodes/<node_id>/<metric>`，那么你也可以请求指标 `_all` 来检索所有指标，或者请求指标 `_none` 来抑制所有指标，仅检索节点的身份信息。

- `<node_id>`

  （可选，字符串）用于限制返回信息的节点 ID 或名称的逗号分隔列表。

## 响应体

- `build_hash`

  此版本中最后一个 git 提交的短哈希值。

- `host`

  节点的主机名。

- `ip`

  节点的 IP 地址。

- `name`

  节点的名称。

- `total_indexing_buffer`

  在最近索引的文档必须写入磁盘之前，允许用于保存它们的总堆内存大小。此大小是该节点上所有分片共享的池，由[索引缓冲区设置](/set_up_elasticsearch/configuring_elasticsearch/indexing_buffer_settings)控制。

- `total_indexing_buffer_in_bytes`

  与 `total_indexing_buffer` 相同，但以字节表示。

- `transport_address`

  接受传输 HTTP 连接的主机和端口。

- `version`

  在此节点上运行的 Elasticsearch 版本。

- `transport_version`

  此节点可以与之通信的最新传输版本。

- `index_version`
  此节点可以读取的最新索引版本。

- `component_versions`
  在此节点中加载的各个组件的版本号。

可以设置 `os` 标志来检索与操作系统相关的信息：

- `os.refresh_interval_in_millis`

  操作系统统计信息的刷新间隔

- `os.name`

  操作系统名称（例如：Linux、Windows、Mac OS X）

- `os.arch`

  JVM 架构名称（例如：amd64、x86）

- `os.version`

  操作系统的版本

- `os.available_processors`

  可供 Java 虚拟机使用的处理器数量

- `os.allocated_processors`

  实际用于计算线程池大小的处理器数量。此数值可以通过节点的 [node.processors](/set_up_elasticsearch/configuring_elasticsearch/thread_pools) 设置来设置，默认为操作系统报告的处理器数量。

可以设置 `process` 标志来检索与当前运行进程相关的信息：

- `process.refresh_interval_in_millis`

  进程统计信息的刷新间隔

- `process.id`

  进程标识符 (PID)

- `process.mlockall`

  指示进程地址空间是否已成功锁定在内存中

## 查询参数

- `flat_settings`

（可选，布尔值）如果为 `true`，则以扁平格式返回设置。默认为 `false`。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待每个节点响应的时长。如果某个节点在其超时到期前未响应，则响应中不包含其信息。但是，超时的节点会包含在响应的 `_nodes.failed` 属性中。默认为无超时。

## 示例

```bash
# 仅返回进程信息
GET /_nodes/process
# 同上
GET /_nodes/_all/process
# 仅返回 nodeId1 和 nodeId2 的 jvm 和进程信息
GET /_nodes/nodeId1,nodeId2/jvm,process
# 同上
GET /_nodes/nodeId1,nodeId2/info/jvm,process
# 返回 nodeId1 和 nodeId2 的所有信息
GET /_nodes/nodeId1,nodeId2/_all
```

可以设置 `_all` 标志来返回所有信息，或者你也可以省略它。

### 插件指标示例

如果指定了 `plugins`，结果将包含有关已安装插件和模块的详细信息：

```bash
GET /_nodes/plugins
```

API 返回以下响应：

```json
{
  "_nodes": ...
  "cluster_name": "elasticsearch",
  "nodes": {
    "USpTGYaBSIKbgSUJR2Z9lg": {
      "name": "node-0",
      "transport_address": "192.168.17:9300",
      "host": "node-0.elastic.co",
      "ip": "192.168.17",
      "version": "{version}",
      "transport_version": 100000298,
      "index_version": 100000074,
      "component_versions": {
        "ml_config_version": 100000162,
        "transform_config_version": 100000096
      },
      "build_flavor": "default",
      "build_type": "{build_type}",
      "build_hash": "587409e",
      "roles": [
        "master",
        "data",
        "ingest"
      ],
      "attributes": {},
      "plugins": [
        {
          "name": "analysis-icu",
          "version": "{version}",
          "description": "The ICU Analysis plugin integrates Lucene ICU module into elasticsearch, adding ICU relates analysis components.",
          "classname": "org.elasticsearch.plugin.analysis.icu.AnalysisICUPlugin",
          "has_native_controller": false
        }
      ],
      "modules": [
        {
          "name": "lang-painless",
          "version": "{version}",
          "description": "An easy, safe and fast scripting language for Elasticsearch",
          "classname": "org.elasticsearch.painless.PainlessPlugin",
          "has_native_controller": false
        }
      ]
    }
  }
}
```

### 摄取指标示例

如果指定了 `ingest`，响应将包含每个节点上可用处理器的详细信息：

```bash
GET /_nodes/ingest
```

API 返回以下响应：

```json
{
  "_nodes": ...
  "cluster_name": "elasticsearch",
  "nodes": {
    "USpTGYaBSIKbgSUJR2Z9lg": {
      "name": "node-0",
      "transport_address": "192.168.17:9300",
      "host": "node-0.elastic.co",
      "ip": "192.168.17",
      "version": "{version}",
      "transport_version": 100000298,
      "index_version": 100000074,
      "component_versions": {
        "ml_config_version": 100000162,
        "transform_config_version": 100000096
      },
      "build_flavor": "default",
      "build_type": "{build_type}",
      "build_hash": "587409e",
      "roles": [],
      "attributes": {},
      "ingest": {
        "processors": [
          {
            "type": "date"
          },
          {
            "type": "uppercase"
          },
          {
            "type": "set"
          },
          {
            "type": "lowercase"
          },
          {
            "type": "gsub"
          },
          {
            "type": "convert"
          },
          {
            "type": "remove"
          },
          {
            "type": "fail"
          },
          {
            "type": "foreach"
          },
          {
            "type": "split"
          },
          {
            "type": "trim"
          },
          {
            "type": "rename"
          },
          {
            "type": "join"
          },
          {
            "type": "append"
          }
        ]
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-nodes-info.html)
