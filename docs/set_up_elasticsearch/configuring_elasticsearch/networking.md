---
sidebar_position: 200
---

# 网络

每个 Elasticsearch 节点都有两个不同的网络接口。客户端使用其 [HTTP 接口](#高级-http-设置)向 Elasticsearch 的 RES TAPI 发送请求，但节点使用[传输接口](#高级传输设置)与其他节点通信。传输接口还用于与[远程集群](/set_up_elasticsearch/remote_clusters)进行通信。

你可以使用 `network.*` 设置来同时配置这两个接口。如果你有一个更复杂的网络，你可能需要使用 `http.*` 和 `transport.*` 设置独立配置接口。在可能的情况下，使用适用于两个接口的 `network.*` 设置来简化配置并减少重复。

默认情况下，Elasticsearch 只绑定到本地主机，这意味着无法远程访问它。对于由一个或多个节点组成的本地开发集群来说，这种配置就足够了，所有节点都在同一台主机上运行。要在多个主机之间形成群集，或者远程客户端可以访问集群，必须调整一些[网络设置](#常用网络设置)，如 `network.host`。

:::warning 警告
**小心网络配置！**

永远不要将未受保护的节点暴露在公共互联网上。如果你这样做了，你就允许世界上任何人下载、修改或删除集群中的任何数据。
:::

将 Elasticsearch 配置为绑定到非本地地址会[将一些警告转换为致命的异常](/set_up_elasticsearch/important_system_configuration#开发模式与生产模式)。如果节点在配置其网络设置后拒绝启动，则在继续之前必须解决记录的异常。

## 常用网络设置

大多数用户只需要配置以下网络设置。

- `network.host`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）为 HTTP 和传输流量设置此节点的地址。节点将绑定到此地址，并将其用作发布地址。接受 IP 地址、主机名或[特殊值](#网络地址的特殊值)。

    默认为 `_local_`。

- `http.port`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为 HTTP 客户端通信绑定的端口。接受单个值或范围。如果指定了一个范围，则节点将绑定到该范围中的第一个可用端口。

    默认为 `9200-9300`。

- `transport.port`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为节点之间的通信而绑定的端口。接受单个值或范围。如果指定了一个范围，则节点将绑定到该范围中的第一个可用端口。在每个符合主条件的节点上，将此设置设置为单个端口，而不是范围。

    默认为 `9300-9400`。

## 网络地址的特殊值

你可以使用以下特殊值配置 Elasticsearch 以自动确定其地址。配置 `network.host`、`network.bind_host`、`network.publish_host` 以及 HTTP 和传输接口的相应设置时，请使用这些值。

- `_local_`

    系统上的任何环回地址，例如 `127.0.0.1`。

- `_site_`

    系统上的任何站点本地地址，例如 `192.168.0.1`。

- `_global_`

    系统上任何全局范围的地址，例如 `8.8.8.8`。

- `_[networkInterface]_`

    使用名为 `[networkInterface]`的网络接口的地址。例如，如果你希望使用名为 `en0` 的接口的地址，则设置 `network.host: _en0_`。

- `0.0.0.0`

    所有可用网络接口的地址。

:::tip 注意
在一些系统中，这些特殊值解析为多个地址。如果是这样，Elasticsearch 将选择其中一个作为其发布地址，并可能在每次节点重新启动时更改其选择。确保每个可能的地址都可以访问你的节点。
:::

:::tip 注意
任何包含 `:` 的值（例如 IPv6 地址或某些[特殊值](#网络地址的特殊值)）都必须引用，因为 `:` 是 YAML 中的一个特殊字符。
:::

## IPv4 与 IPv6

默认情况下，这些特殊值同时产生 IPv4 和 IPv6 地址，但你也可以添加 `:ipv4` 或 `:ipv6` 后缀，将它们分别限制为 IPv4 或 IPv6 地址。例如，`network.host: "_en0:ipv4_"` 会将此节点的地址设置为接口 `en0` 的 IPv4 地址。

:::note 提示
**云端发现**

当在安装了 EC2 发现插件或[谷歌计算引擎发现插件](https://www.elastic.co/guide/en/elasticsearch/plugins/8.7/discovery-gce-network-host.html#discovery-gce-network-host)的云上运行时，可以使用更多特殊设置。
:::

## 绑定和发布

Elasticsearch 将网络地址用于两个不同的目的，即绑定和发布。大多数节点将对所有内容使用相同的地址，但更复杂的设置可能需要为不同的目的配置不同的地址。

当像 Elasticsearch 这样的应用程序希望接收网络通信时，它必须向操作系统指示应该接收其流量的一个或多个地址。这被称为绑定到这些地址。如果需要，Elasticsearch 可以绑定到多个地址，但大多数节点只绑定到一个地址。Elasticsearch 只能绑定到一个地址，前提是它运行在具有该地址的网络接口的主机上。如有必要，你可以配置传输和 HTTP 接口以绑定到不同的地址。

每个 Elasticsearch 节点都有一个地址，客户端和其他节点可以在该地址与它联系，即它的*发布地址*。每个节点的 HTTP 接口和传输接口各有一个发布地址。这两个地址可以是任何地址，不需要是主机上网络接口的地址。唯一的要求是每个节点必须：
- 在其传输发布地址时，可由其集群中的所有其他节点进行访问，并能被任何远程集群使用[嗅探模式](/set_up_elasticsearch/remote_clusters#嗅探模式)发现它。
- 所有使用嗅探发现它的客户端，都可以在其 HTTP 发布地址访问它。

### 使用单个地址

最常见的配置是将 Elasticsearch 绑定到客户端和其他节点可以访问的单个地址。在此配置中，你只需将 `network.host` 设置为该地址即可。不应单独设置任何绑定或发布地址，也不应单独配置 HTTP 或传输接口的地址。

### 使用多个地址

如果你希望将 Elasticsearch 绑定到多个地址，或者发布与要绑定的地址不同的地址，请使用[高级网络设置](#高级网络设置)。将 `network.bind_host` 设置为绑定地址，将 `network.publish_host` 设置为此节点公开的地址。在复杂的配置中，你可以为 HTTP 和传输接口以不同的方式配置这些地址。

## 高级网络设置

通过这些高级设置，你可以绑定到多个地址，或者使用不同的地址进行绑定和发布。在大多数情况下，它们不是必需的，如果可以使用[常用设置](#常用网络设置)，则不应使用它们。

- `network.bind_host`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）节点应绑定到的网络地址，以便监听传入连接。接受 IP 地址、主机名和[特殊值](#网络地址的特殊值)的列表。默认为 `network.host` 提供的地址。仅当绑定到多个地址或使用不同的地址进行发布和绑定时，才使用此设置。

- `network.publish_host`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）客户端和其他节点可以用来联系此节点的网络地址。接受IP 地址、主机名或[特殊值](#网络地址的特殊值)。默认为 `network.host` 提供的地址。仅当绑定到多个地址或使用不同的地址进行发布和绑定时，才使用此设置。

:::tip 注意
你可以指定 `network.host` 和 `network.publish_host` 的地址列表。你还可以指定一个或多个主机名或解析为多个地址的[特殊值](#网络地址的特殊值)。如果你这样做，那么 Elasticsearch 会选择其中一个地址作为其发布地址。这种选择使用基于 IPv4/IPv6 堆栈偏好和可达性的启发式方法，并且可能在节点重新启动时发生变化。确保每个节点在所有可能的发布地址都可以访问。
:::

### 高级 TCP 设置

使用以下设置来控制 HTTP 和传输接口使用的 TCP 连接的低级别参数。

- `network.tcp.keep_alive`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）为网络套接字配置 `SO_KEEPALIVE` 选项，该选项确定每个连接是否发送 TCP 保活探测。默认为 `true`。

- `network.tcp.keep_idle`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为网络套接字配置 `TCP_KEEPIDLE` 选项，该选项确定连接在开始发送 TCP 保活探测之前必须处于空闲状态的时间（以秒为单位）。默认值为 `-1`，这意味着使用系统默认值。此值不能超过 `300` 秒。仅适用于 Linux 和 macOS。

- `network.tcp.keep_interval`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为网络套接字配置 `TCP_KEEPINTVL` 选项，该选项确定发送 TCP 保活探测之间的时间（以秒为单位）。默认值为 `-1`，这意味着使用系统默认值。此值不能超过 `300` 秒。仅适用于 Linux 和 macOS。

- `network.tcp.keep_count`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为网络套接字配置 `TCP_KEEPCNT` 选项，该选项确定在断开连接之前可能在连接上发送的未确认 TCP 保活探测的数量。默认值为 `-1`，这意味着使用系统默认值。仅适用于 Linux 和 macOS。

- `network.tcp.no_delay`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）在网络套接字上配置 `TCP_NODELAY` 选项，该选项确定是否启用 TCP 无延迟。默认为 `true`。

- `network.tcp.reuse_address`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）为网络套接字配置 `SO_REUSEADDR` 选项，该选项决定地址是否可以重用。在 Windows 上默认为 `false`，在其他情况下默认为 `true`。

- `network.tcp.send_buffer_size`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[字节值](/rest_apis/api_conventions#字节大小单位)）为网络套接字配置 TCP 发送缓冲区的大小。默认值为 `-1`，这意味着使用系统默认值。

- `network.tcp.receive_buffer_size`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[字节值](/rest_apis/api_conventions#字节大小单位)）配置 TCP 接收缓冲区的大小。默认值为 `-1`，这意味着使用系统默认值。

## 高级 HTTP 设置

使用以下高级设置可以独立于[传输接口](#高级传输设置)配置 HTTP 接口。你也可以使用[网络设置](#常用网络设置)同时配置这两个接口。

- `http.host`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）为 HTTP 流量设置此节点的地址。节点将绑定到此地址，并将其用作其 HTTP 发布地址。接受 IP 地址、主机名或[特殊值](#网络地址的特殊值)。只有当你需要对传输和 HTTP 接口进行不同的配置时，才能使用此设置。

    默认为 `network.host` 提供的地址。

- `http.bind_host`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）节点应绑定到的网络地址，以便侦听传入的 HTTP 连接。接受 IP 地址、主机名和[特殊值](#网络地址的特殊值)的列表。默认为 `http.host` 或 `network.bind_host` 提供的地址。只有当你需要绑定到多个地址或使用不同的地址进行发布和绑定，并且还需要传输和 HTTP 接口的不同绑定配置时，才使用此设置。

- `http.publish_host`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）HTTP 客户端使用嗅探与节点联系的网络地址。接受 IP 地址、主机名或[特殊值](#网络地址的特殊值)。默认为 `http.host` 或 `network.publish_host` 提供的地址。只有当你需要绑定到多个地址或使用不同的地址进行发布和绑定，并且还需要传输和 HTTP 接口的不同绑定配置时，才使用此设置。

- `http.max_content_length`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[字节值](/rest_apis/api_conventions#字节大小单位)）HTTP 请求正文的最大大小。默认值为 `100mb`。将此设置配置为大于 `100mb` 可能会导致集群不稳定，建议不要这样做。如果在向[批量](/rest_apis/document_apis/bulk) API 发送请求时达到此限制，请将客户端配置为在每个批量请求中发送较少的文档。如果你希望索引超过 `100mb` 的单个文档，请在将其发送到 Elasticsearch 之前将其预处理为较小的文档。例如，将原始数据存储在 Elasticsearch 之外的系统中，并在 Elastic 搜索索引的文档中包含原始数据的链接。

- `http.max_initial_line_length`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[字节值](/rest_apis/api_conventions#字节大小单位)）HTTP URL 的最大值。默认值为 `4kb`。

- `http.max_header_size`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[字节值](/rest_apis/api_conventions#字节大小单位)）允许的头的最大值。默认值为 `16kb`。

- `http.compression` ![Elastic Cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）尽可能支持压缩（使用 `Accept-Encoding`）。如果启用了 HTTPS，则默认为 `false`。否则，默认为 `true`。

    禁用 HTTPS 压缩可以降低潜在的安全风险，例如 [BreaACH 攻击](https://en.wikipedia.org/wiki/BREACH)。要压缩 HTTPS 流量，必须将 `http.compressure` 显式设置为 `true`。

- `http.compression_level`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）定义用于 HTTP 响应的压缩级别。有效值介于1（最小压缩）和 9（最大压缩）之间。默认值为 `3`。

- `http.cors.enabled` ![Elastic Cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）启用或禁用跨源资源共享，这决定了另一个源上的浏览器是否可以执行针对 Elasticsearch 的请求。设置为 `true` 可使 Elasticsearch 处理预检 [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) 请求。如果 `http.cors.allow-origin` 列表允许请求中发送的 `Origin`，则 Elasticsearch 将使用 `Access-Control-Allow-Origin` 头来响应这些请求。设置为 `false`（默认值）可使 Elasticsearch 忽略 Origin 请求头，从而有效地禁用 CORS 请求，因为 Elasticsearch 永远不会使用 `Access-Control-Allow-Origin` 响应头进行响应。

    :::tip 注意
    如果客户端没有发送带有 Origin 头的预检请求，或者没有检查服务器的响应标头以验证 `Access-Control-Allow-Origin` 响应头，则跨来源安全性会受到损害。如果 Elasticsearch 上没有启用 CORS，那么客户端知道的唯一方法就是发送预检请求，并意识到所需的响应头丢失。
    :::

- `http.cors.allow-origin`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）允许哪些来源。如果你在值前面加上一个正斜杠（`/`），这将被视为一个正则表达式，从而允许你支持 HTTP 和 HTTPs。例如，使用 `/https?:\/\/localhost(:[0-9]+)?/` 在这两种情况下都会适当地返回请求头。默认为不允许源。

    :::danger 重要
    通配符（`*`）是一个有效值，但被认为是一个安全风险，因为你的 Elasticsearch 实例对来自**任何地方**的跨源请求都是开放的。
    :::

- `http.cors.max-age` ![Elastic Cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）浏览器发送”预检“ OPTIONS 请求以确定 CORS 设置。`max-age` 定义了缓存结果的时间（以秒为单位）。默认值为 `1728000`（20 天）。

- `http.cors.allow-methods` ![Elastic Cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）允许使用哪些方法。默认为 `OPTIONS`、`HEAD`、`GET`、`POST`、`PUT`、`DELETE`。

- `http.cors.allow-headers` ![Elastic Cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）允许哪些头。默认为 `X-Requested-With`、`Content-Type`、`Content-Length`。

- `http.cors.allow-credentials` ![Elastic Cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）是否应返回 `Access-Control-Allow-Credentials` 头。默认为 `false`。

    :::tip 注意
    只有当设置设置为 `true` 时，才会返回此头。
    :::

- `http.detailed_errors.enabled`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）配置是否启用 HTTP 响应中的详细错误报告。默认为`true`，这意味着包含的 [?error_trace 参数](/rest_apis/common_options#启用堆栈跟踪)的 HTTP 请求如果遇到异常，将返回一条详细的错误消息，其中包括堆栈跟踪。如果设置为 `false`，则使用请求 `?error_trace` 参数被拒绝。

- `http.pipelining.max_events`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）在 HTTP 连接关闭之前，要在内存中排队的最大事件数，默认为 `10000`。

- `http.max_warning_header_count`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）客户端 HTTP 响应中警告标头的最大数目。默认值为 `-1`，这意味着警告头的数量是无限的。

- `http.max_warning_header_size`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[字节值](/rest_apis/api_conventions#字节大小单位)）客户端 HTTP 响应中警告头的最大总大小。默认值为 `-1`，这意味着警告头的大小是无限的。

- `http.tcp.keep_alive`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）为此套接字配置 `SO_KEEPALIVE` 选项，该选项决定是否发送 TCP 保活探测。默认为 `network.tcp.keep_alive`。

- `http.tcp.keep_idle`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为 HTTP 套接字配置 `TCP_KEEPIDLE` 选项，该选项确定连接在开始发送 TCP 保活探测之前必须处于空闲状态的时间（以秒为单位）。默认为 `network.tcp.keep_idle`，它使用系统默认值。此值不能超过 `300` 秒。仅适用于 Linux 和 macOS。

- `http.tcp.keep_interval`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为 HTTP 套接字配置 `TCP_KEEPINTVL` 选项，该选项确定发送 TCP 保活探测之间的时间（以秒为单位）。默认为 `network.tcp.keep_interval`，它使用系统默认值。此值不能超过 `300` 秒。仅适用于 Linux 和 macOS。

- `http.tcp.keep_count`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为 HTTP 套接字配置 `TCP_KEEPCNT` 选项，该选项确定在断开连接之前可能在连接上发送的未确认 TCP 保活探测的数量。默认为 `network.tcp.keep_count`，使用系统默认值。仅适用于 Linux 和 macOS。

- `http.tcp.no_delay`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）在 HTTP 套接字上配置 `TCP_NODELAY` 选项，该选项确定是否启用 TCP 无延迟。默认为 `true`。

- `http.tcp.reuse_address`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）为 HTTP 套接字配置 `SO_REUSEADDR` 选项，该选项决定地址是否可以重用。在 Windows 上默认为 `false`，在其他情况下默认为 `true`。

- `http.tcp.send_buffer_size`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[字节值](/rest_apis/api_conventions#字节大小单位)）HTTP 流量的 TCP 发送缓冲区的大小。默认为 `network.tcp.send_buffer_size`。

- `http.tcp.receive_buffer_size`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[字节值](/rest_apis/api_conventions#字节大小单位)）HTTP 流量的 TCP 发送缓冲区的大小。默认为 `network.tcp.send_buffer_size`。

- `http.client_stats.enabled`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）启用或禁用 HTTP 客户端统计信息的收集。默认为 `true`。

- `http.client_stats.closed_channels.max_count`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）当 `http.client_stats.enabled` 为 `true` 时，设置 Elasticsearch 报告统计信息的最大关闭 HTTP 通道数。默认值为 `10000`。

- `http.client_stats.closed_channels.max_age`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[时间值](/rest_apis/api_conventions#时间单位)）当 `http.client_stats.enabled` 为 `true` 时，设置关闭 HTTP 通道后 Elasticsearch 将报告该通道统计信息的最大时间长度。默认值为 `5m`。

## 高级传输设置

使用以下高级设置可以独立于 [HTTP 接口](#高级网络设置)配置传输接口。使用[网络设置](#常用网络设置)可以同时配置两个接口。

- `transport.host`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）为传输流量设置此节点的地址。节点将绑定到此地址，并将其用作传输发布地址。接受 IP 地址、主机名或[特殊值](#网络地址的特殊值)。只有当你需要对传输和 HTTP 接口进行不同的配置时，才能使用此设置。

    默认为 `network.host` 提供的地址。

- `transport.bind_host`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）节点应绑定到的网络地址，以便监听传入的传输连接。接受 IP 地址、主机名和[特殊值](#网络地址的特殊值)的列表。默认为 `transport.host` 或 `network.bind_host` 提供的地址。仅当你需要绑定到多个地址或使用不同的地址进行发布和绑定，并且你还需要传输和 HTTP 接口的不同绑定配置时，才使用此设置。

- `transport.publish_host`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）其他节点可以联系该节点的网络地址。接受 IP 地址、主机名或[特殊值](#网络地址的特殊值)。默认为 `transport.host` 或 `network.publish_host` 提供的地址。仅当你需要绑定到多个地址或使用不同的地址进行发布和绑定，并且你还需要传输和 HTTP 接口的不同绑定配置时，才使用此设置。

- `transport.publish_port`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）[传输发布地址](#绑定和发布)的端口。仅当你需要发布端口与 `transport.port` 不同时才设置此参数。默认为通过 `transport.port`分配的端口。

- `transport.connect_timeout`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[时间值](/rest_apis/api_conventions#时间单位)）启动新连接的连接超时（以时间设置格式）。默认值为 `30s`。

- `transport.compress`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）设置为 `true`、`indexing_data` 或 `false` 可配置节点之间的传输压缩。选项 `true` 将压缩所有数据。`indexing_data` 选项将仅压缩在摄取、ccr 跟随（排除引导）和基于操作的分片恢复（不包括传输 lucene 文件）期间在节点之间发送的原始索引数据。默认为 `indexing_data`。

- `transport.compression_scheme`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，字符串）配置 `transport.compress` 的压缩方案。选项为 `deflate` 或 `lz4`。如果配置了 `lz4`，并且远程节点尚未升级到支持 `lz4` 的版本，则流量将以未压缩的方式发送。默认值为 `lz4`。

- `transport.tcp.keep_alive`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）为传输套接字配置 `SO_KEEPALIVE` 选项，用于确定它们是否发送 TCP 保活探测。默认为 `network.tcp.keep_alive`。

- `transport.tcp.keep_idle`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为传输套接字配置 `TCP_KEEPIDLE` 选项，该选项确定连接在开始发送 TCP 保活探测之前必须处于空闲状态的时间（以秒为单位）。如果已设置，则默认为 `network.tcp.keep_idle`，否则为系统默认值。此值不能超过 `300` 秒。在系统默认值高于 `300` 的情况下，该值会自动降低到 `300`。仅适用于 Linux 和 macOS。

- `transport.tcp.keep_interval`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为传输套接字配置 `TCP_KEEPINTVL` 选项，该选项确定发送 TCP 保活探测之间的时间（以秒为单位）。如果已设置，则默认为 `network.tcp.keep_interval`，否则为系统默认值。此值不能超过 `300` 秒。在系统默认值高于 `300` 的情况下，该值会自动降低到 `300`。仅适用于 Linux 和 macOS。

- `transport.tcp.keep_count`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，整数）为传输套接字配置 `TCP_KEEPCNT` 选项，该选项确定在断开连接之前可能在连接上发送的未确认 TCP 保活探测的数量。如果已设置，则默认为 `network.tcp.keep_count`，否则为系统默认值。仅适用于 Linux 和 macOS。

- `transport.tcp.no_delay`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）配置传输套接字上的 `TCP_NODELAY` 选项，该选项确定是否启用 TCP 无延迟。默认为 `true`。

- `transport.tcp.reuse_address`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，布尔值）为网络套接字配置 `SO_REUSEADDR` 选项，该选项决定地址是否可以重用。默认为 `network.tcp.reuse_address`。

- `transport.tcp.send_buffer_size`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[字节值](/rest_apis/api_conventions#字节大小单位)）传输流量的 TCP 发送缓冲区的大小。默认为 `network.tcp.send_buffer_size`。

- `transport.tcp.receive_buffer_size`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[字节值](/rest_apis/api_conventions#字节大小单位)）用于传输流量的 TCP 接收缓冲区的大小。默认为 `network.tcp.receive_buffer_size`。

- `transport.ping_schedule`

    （[静态](/set_up_elasticsearch/configuring_elasticsearch#静态)，[时间值](/rest_apis/api_conventions#时间单位)）配置在所有传输连接上发送应用程序级 ping 的间隔时间，以便在传输连接出现故障时及时检测。默认值为 `-1`，表示不发送应用程序级 ping。你应该尽可能使用 TCP 保活（参阅 `transport.tcp.keep_alive`），而不是应用程序级别的 ping。

### 传输配置文件

Elasticsearch 允许你通过使用传输配置文件绑定到不同接口上的多个端口。参阅此配置示例：

```bash
transport.profiles.default.port: 9300-9400
transport.profiles.default.bind_host: 10.0.0.1
transport.profiles.client.port: 9500-9600
transport.profiles.client.bind_host: 192.168.0.1
transport.profiles.dmz.port: 9700-9800
transport.profiles.dmz.bind_host: 172.16.1.2
```

默认配置文件是特殊的。它被用作任何其他配置文件的后备，如果这些配置文件没有设置特定的配置设置，并且是该节点连接到集群中其他节点的方式。其他配置文件可以有任何名称，并且可以用于为传入连接设置特定的端点。

可以在每个传输配置文件上配置以下参数，如上面的示例所示：
- `port`：要绑定的端口。
- `bind_host`：要绑定到的主机。
- `publish_host`：在信息 API 中发布的主机。

配置文件还支持在[传输设置](#高级传输设置)部分指定的所有其他传输设置，并将这些设置用作默认设置。例如，`transport.profiles.client.tcp.reuse_address` 可以显式配置，否则默认为 `transport.tcp.reuse_address`。

### 长期闲置连接

两个节点之间的传输连接由许多长寿命的 TCP 连接组成，其中一些连接可能会闲置很长一段时间。尽管如此，Elasticsearch 要求这些连接保持开放，如果任何节点间连接被防火墙等外部影响关闭，它可能会中断集群的运行。重要的是要配置你的网络以保留 Elasticsearch 节点之间的长期空闲连接，例如，通过启用 `*.tcp.keep_alive` 并确保保活间隔短于可能导致空闲连接关闭的任何超时，或者如果无法配置保活，则通过设置 `transport.ping_schedule`。当设备达到一定年龄时会断开连接，这是 Elasticsearch 集群的常见问题来源，因此不得使用。

### 请求压缩

默认的 `transport.compress` 配置选项 `indexing_data` 将只压缩与节点之间原始索引源数据传输相关的请求。此选项主要压缩在摄取、ccr 和分片恢复期间发送的数据。这种默认设置通常对本地集群通信有意义，因为压缩原始文档往往会显著减少节点间网络的使用，而对 CPU 的影响最小。

`transport.compress` 设置始终配置本地集群请求压缩，并且是远程集群请求压缩的后备设置。如果要以不同于本地请求压缩的方式配置远程请求压缩，可以使用 [`cluster.remote.${cluster_alias}.transport.compress` 设置](/set_up_elasticsearch/remote_clusters/remote_cluster_settings)按每个远程集群进行设置。

### 响应压缩

压缩设置不配置响应的压缩。如果入站请求被压缩，Elasticsearch 将压缩响应——​即使在没有启用压缩的情况下。同样，如果入站请求未压缩，Elasticsearch 也不会压缩响应——​即使在启用压缩时也是如此。用于压缩响应的压缩方案与用于压缩请求的远程节点的压缩方案相同。

## 请求跟踪

你可以跟踪在 HTTP 和传输层上发出的单个请求。

:::warning 警告
跟踪可能会生成极高的日志卷，从而破坏集群的稳定。不要在繁忙或重要的集群上启用请求跟踪。
:::

### REST 请求跟踪器

HTTP 层有一个专用的跟踪器，用于记录传入请求和相应的传出响应。通过将 `org.elasticsearch.http.HttpTracer` 记录器的级别设置为 `TRACE` 来激活跟踪器：

```bash
PUT _cluster/settings
{
   "persistent" : {
      "logger.org.elasticsearch.http.HttpTracer" : "TRACE"
   }
}
```

你还可以使用一组包含和排除通配符模式来控制将跟踪哪些 URI。默认情况下，将跟踪每个请求。

```bash
PUT _cluster/settings
{
   "persistent" : {
      "http.tracer.include" : "*",
      "http.tracer.exclude" : ""
   }
}
```

### 传输跟踪器

传输层有一个专用的跟踪器，用于记录传入和传出的请求和响应。通过将 `org.elasticsearch.transport.TransportService.tracer` 记录器的级别设置为 `TRACE` 来激活跟踪器：

```bash
PUT _cluster/settings
{
   "persistent" : {
      "logger.org.elasticsearch.transport.TransportService.tracer" : "TRACE"
   }
}
```

你还可以使用一组包含和排除通配符模式来控制将跟踪哪些操作。默认情况下，除了故障检测 ping 之外，将跟踪每个请求：

```bash
PUT _cluster/settings
{
   "persistent" : {
      "transport.tracer.include" : "*",
      "transport.tracer.exclude" : "internal:coordination/fault_detection/*"
   }
}
```

## 网络线程模型

本节描述了 Elasticsearch 中网络子系统使用的线程模型。使用 Elasticsearch 不需要这些信息，但它可能对诊断集群中网络问题的高级用户有用。

Elasticsearch 节点通过一组 TCP 通道进行通信，这些通道共同形成传输连接。Elasticsearch 客户端通过 HTTP 与集群通信，HTTP 也使用一个或多个 TCP 通道。这些 TCP 通道中的每一个都恰好由节点中的一个 `transport_worker` 线程所拥有。该拥有线程是在通道打开时选择的，并且在通道的生命周期内保持不变。

每个 `transport_worker` 线程都全权负责通过其拥有的通道发送和接收数据。此外，每个 http 和传输服务器套接字都被分配给其中一个 `transport_worker` 线程。该工作者有责任接受到其拥有的服务器套接字的新传入连接。

如果 Elasticsearch 中的线程想要通过特定通道发送数据，它会将数据传递给拥有 `transport_worker` 的线程进行实际传输。

如果 Elasticsearch 中的线程想要通过特定通道发送数据，它会将数据传递给拥有 `transport_worker` 的线程进行实际传输。

通常 `transport_worker` 线程不会完全处理它们接收到的消息。相反，他们将进行少量的初步处理，然后将消息分派（移交）到另一个线程池，以进行其余的处理。例如，批量消息被调度到写线程池，搜索被调度到其中一个搜索线程池，对统计信息和其他管理任务的请求大多被调度到管理线程池。然而，在某些情况下，消息的处理速度预计会非常快，以至于 Elasticsearch 将在 `transport_worker` 线程上完成所有处理，而不是在其他地方调度消息。

默认情况下，每个 CPU 有一个 `transport_worker` 线程。相比之下，有时可能有数以万计的 TCP 通道。如果数据到达 TCP 通道，并且它所属的 `transport_worker` 线程正忙，那么在线程完成它正在做的任何事情之前，都不会处理数据。类似地，在拥有 `transport_worker` 线程空闲之前，不会通过通道发送传出数据。这意味着我们要求每个 `transport_worker` 线程经常处于空闲状态。闲置的 `transport_worker` 在堆栈转储中看起来像这样：

```bash
"elasticsearch[instance-0000000004][transport_worker][T#1]" #32 daemon prio=5 os_prio=0 cpu=9645.94ms elapsed=501.63s tid=0x00007fb83b6307f0 nid=0x1c4 runnable  [0x00007fb7b8ffe000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPoll.wait(java.base@17.0.2/Native Method)
	at sun.nio.ch.EPollSelectorImpl.doSelect(java.base@17.0.2/EPollSelectorImpl.java:118)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(java.base@17.0.2/SelectorImpl.java:129)
	- locked <0x00000000c443c518> (a sun.nio.ch.Util$2)
	- locked <0x00000000c38f7700> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(java.base@17.0.2/SelectorImpl.java:146)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:813)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:460)
	at io.netty.util.concurrent.SingleThreadEventExecutor$4.run(SingleThreadEventExecutor.java:986)
	at io.netty.util.internal.ThreadExecutorMap$2.run(ThreadExecutorMap.java:74)
	at java.lang.Thread.run(java.base@17.0.2/Thread.java:833)
```

在[节点热线程](/rest_apis/cluster_apis/node_hot_threads) API 中，空闲的 `transport_worker` 线程报告如下：

```bash
   100.0% [cpu=0.0%, other=100.0%] (500ms out of 500ms) cpu usage by thread 'elasticsearch[instance-0000000004][transport_worker][T#1]'
     10/10 snapshots sharing following 9 elements
       java.base@17.0.2/sun.nio.ch.EPoll.wait(Native Method)
       java.base@17.0.2/sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:118)
       java.base@17.0.2/sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:129)
       java.base@17.0.2/sun.nio.ch.SelectorImpl.select(SelectorImpl.java:146)
       io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:813)
       io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:460)
       io.netty.util.concurrent.SingleThreadEventExecutor$4.run(SingleThreadEventExecutor.java:986)
       io.netty.util.internal.ThreadExecutorMap$2.run(ThreadExecutorMap.java:74)
       java.base@17.0.2/java.lang.Thread.run(Thread.java:833)
```

请注意，`transport_worker` 线程应该始终处于 `RUNNABLE` 状态，即使在等待输入时也是如此，因为它们会阻塞本机 `EPoll#wait` 方法。这意味着热线程 API 将以 100% 的总体利用率报告这些线程。这是正常的，将时间分解为 `cpu=` 和 `other=` 部分可以分别显示线程运行和等待输入所花费的时间。

如果 `transport_worker` 线程不经常处于空闲状态，那么它可能会积累积压的工作。这可能会导致在其拥有的通道上处理消息的延迟。很难准确预测哪些工作会被推迟：

- 通道比线程多得多。如果与一个通道相关的工作导致其工作线程延迟，那么该线程拥有的所有其他通道也将遭受延迟。
- 从 TCP 通道到工作线程的映射是固定的，但却是任意的。当通道打开时，以循环方式为每个通道分配一个拥有的线程。每个工作线程负责许多不同类型的通道。
- 每对节点之间都有许多通道打开。对于每个请求，Elasticsearch 将以循环方式从适当的通道中进行选择。一些请求可能会在延迟工作人员拥有的通道上结束，而其他相同的请求则会在工作正常的通道上发送。

如果积压工作积累得太多，一些消息可能会延迟几秒钟。该节点甚至可能[无法通过其运行状况检查](/set_up_elasticsearch/discovery_and_cluster_formation/cluster_fault_detection)并从集群中删除。有时，你可以使用[节点热线程](/rest_apis/cluster_apis/node_hot_threads) API 找到繁忙的 `transport_worker` 线程的证据。然而，此 API 本身会发送网络消息，因此如果 `transport_worker` 线程太忙，则可能无法正常工作。使用 `jstack` 获取堆栈转储或使用 Java Flight Recorder 获取评测跟踪更可靠。这些工具独立于 JVM 正在执行的任何工作。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html)
