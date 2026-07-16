# 集群信息 API

::::note 提示
此功能处于技术预览阶段，可能会在未来版本中更改或移除。Elastic 将努力修复任何问题，但技术预览中的功能不受正式 GA 功能的支持 SLA 约束。
::::

::::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
::::

返回集群信息。

## 请求

```bash
GET /_info/<target>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

你可以使用集群信息 API 检索集群的信息。

## 路径参数

- `<target>`

  （字符串）将返回的信息限制在特定的目标。支持逗号分隔的以下选项列表：

  - `_all`：所有可用信息。不能与其他目标混合使用。
  - `http`：HTTP 连接信息。
  - `ingest`：摄取信息。
  - `thread_pool`：关于每个线程池的统计信息，包括当前大小、队列大小和被拒绝的任务。
  - `script`：包含集群的脚本统计信息。

## 响应体

- `cluster_name`

  （字符串）集群名称。基于集群名称设置。

- `http`

  （对象）包含集群的 HTTP 信息。

  - `http` 的属性

    - `current_open`

      （整数）集群当前打开的 HTTP 连接数。

    - `total_opened`

      （整数）集群已打开的 HTTP 连接总数。

    - `clients`

      （对象数组）有关当前和最近关闭的 HTTP 客户端连接的信息。关闭时间超过 `http.client_stats.closed_channels.max_age` 设置的客户端不会在此显示。

      - `clients` 的属性

        - `id`

          （整数）HTTP 客户端的唯一 ID。

        - `agent`

          （字符串）HTTP 客户端报告的代理。如果不可用，则响应中不包含此属性。

        - `local_address`

          （字符串）HTTP 连接的本地地址。

        - `remote_address`

          （字符串）HTTP 连接的远程地址。

        - `last_uri`

          （字符串）客户端最近请求的 URI。

        - `x_forwarded_for`

          （字符串）客户端 `x-forwarded-for` HTTP 头的值。如果不可用，则响应中不包含此属性。

        - `x_opaque_id`

          （字符串）客户端 `x-opaque-id` HTTP 头的值。如果不可用，则响应中不包含此属性。

        - `opened_time_millis`

          （整数）客户端打开连接的时间。

        - `closed_time_millis`

          （整数）如果连接已关闭，客户端关闭连接的时间。

        - `last_request_time_millis`

          （整数）此客户端最近请求的时间。

        - `request_count`

          （整数）来自此客户端的请求数。

        - `request_size_bytes`

          （整数）来自此客户端的所有请求的累计大小（以字节为单位）。

- `ingest`

  （对象）包含集群的摄取信息。

  - `ingest` 的属性

    - `total`

      （对象）包含集群摄取操作的信息。

      - `total` 的属性

        - `count`

          （整数）集群范围内摄取的文档总数。

        - `time`

          （时间值）集群范围内预处理摄取文档花费的总时间。

        - `time_in_millis`

          （整数）集群范围内预处理摄取文档花费的总时间（以毫秒为单位）。

        - `current`

          （整数）当前正在摄取的文档总数。

        - `failed`

          （整数）集群范围内失败的摄取操作总数。

    - `pipelines`

      （对象）包含集群摄取管道的信息。

      - `pipelines` 的属性

        - `<pipeline_id>`

          （对象）包含摄取管道的信息。

          - `<pipeline_id>` 的属性

            - `count`

              （整数）摄取管道预处理的文档数。

            - `time`

              （时间值）在摄取管道中预处理文档花费的总时间。

            - `time_in_millis`

              （整数）在摄取管道中预处理文档花费的总时间（以毫秒为单位）。

            - `failed`

              （整数）摄取管道失败的操作总数。

            - `ingested_as_first_pipeline`

              （字节值）由此管道首次处理的所有文档的总摄取大小。如果文档是默认管道之后的最终管道、reroute 处理器之后运行的管道或管道处理器内的管道，则不会将文档大小添加到此管道的统计值中，而是添加到最初摄取文档的管道的统计值中。

            - `ingested_as_first_pipeline_in_bytes`

              （整数）由此管道首次处理的所有文档的总摄取大小（以字节为单位）。

            - `produced_as_first_pipeline`

              （字节值）由此管道首次处理的所有文档的总产出大小。

            - `produced_as_first_pipeline_in_bytes`

              （整数）由此管道首次处理的所有文档的总产出大小（以字节为单位）。

            - `processors`

              （对象数组）包含摄取管道的摄取处理器信息。

              - `processors` 的属性

                - `<processor>`

                  （对象）包含摄取处理器的信息。

                  - `<processor>` 的属性

                    - `count`

                      （整数）处理器转换的文档数。

                    - `time`

                      （时间值）处理器转换文档花费的时间。

                    - `time_in_millis`

                      （整数）处理器转换文档花费的时间（以毫秒为单位）。

                    - `current`

                      （整数）处理器当前正在转换的文档数。

                    - `failed`

                      （整数）处理器失败的操作数。

- `thread_pool`

  （对象）包含集群线程池的信息。

  - `thread_pool` 的属性

    - `<thread_pool_name>`

      （对象）包含集群中名为 `<thread_pool_name>` 的线程池信息。

      - `<thread_pool_name>` 的属性

        - `threads`

          （整数）线程池中的线程数。

        - `queue`

          （整数）线程池队列中的任务数。

        - `active`

          （整数）线程池中的活跃线程数。

        - `rejected`

          （整数）线程池执行器拒绝的任务数。

        - `largest`

          （整数）线程池中活跃线程的最高数量。

        - `completed`

          （整数）线程池执行器完成的任务数。

- `script`

  （对象）包含集群的脚本统计信息。

  - `script` 的属性

    - `compilations`

      （整数）集群执行的内联脚本编译总数。

    - `compilations_history`

      （对象）包含最近的脚本编译历史。

      - `compilations_history` 的属性

        - `5m`

          （长整数）最近五分钟内的脚本编译数。

        - `15m`

          （长整数）最近十五分钟内的脚本编译数。

        - `24h`

          （长整数）最近二十四小时内的脚本编译数。

    - `cache_evictions`

      （整数）脚本缓存驱逐旧数据的总次数。

    - `cache_evictions_history`

      （对象）包含最近的脚本缓存驱逐历史。

      - `cache_evictions_history` 的属性

        - `5m`

          （长整数）最近五分钟内的脚本缓存驱逐数。

        - `15m`

          （长整数）最近十五分钟内的脚本缓存驱逐数。

        - `24h`

          （长整数）最近二十四小时内的脚本缓存驱逐数。

    - `compilation_limit_triggered`

      （整数）脚本编译断路器限制内联脚本编译的总次数。

## 示例

```bash
# 返回集群的所有统计信息
GET /_info/_all
# 返回集群的 HTTP 信息
GET /_info/http
# 返回集群的摄取信息
GET /_info/ingest
# 返回集群的线程池信息
GET /_info/thread_pool
# 返回集群的脚本信息
GET /_info/script
# 返回集群的 HTTP 和摄取信息
GET /_info/http,ingest
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-info.html)
