# 设置 JVM 选项

如有需要，你可以通过添加自定义选项文件（首选）或设置 `ES_JAVA_OPTS` 环境变量来覆盖默认的 JVM 选项。

JVM 选项文件必须具有 `.options` 后缀，并包含以行分隔的 JVM 参数列表。JVM 按字典顺序处理选项文件。

JVM 选项文件的存放位置取决于安装类型：

- **tar.gz 或 .zip**：将自定义 JVM 选项文件添加到 `config/jvm.options.d/`。
- **Debian 或 RPM**：将自定义 JVM 选项文件添加到 `/etc/elasticsearch/jvm.options.d/`。
- **Docker**：将自定义 JVM 选项文件绑定挂载到 `/usr/share/elasticsearch/config/jvm.options.d/`。

通常不建议设置自己的 JVM 选项，这可能会对性能和稳定性产生负面影响。在大多数情况下，建议使用 Elasticsearch 提供的默认值。

不要修改根 `jvm.options` 文件。请改用 `jvm.options.d/` 中的文件。

## JVM 选项语法

JVM 选项文件包含以行分隔的 JVM 参数列表。参数前面有一个短横线（`-`）。要将设置应用于特定版本，请在前面加上版本或版本范围，后跟冒号。

**将设置应用于所有版本**：

```txt
-Xmx2g
```

**将设置应用于特定版本**：

```txt
17:-Xmx2g
```

**将设置应用于版本范围**：

```txt
17-18:-Xmx2g
```

要将设置应用于特定版本及任何更高版本，请省略范围的上限。例如，此设置适用于 Java 17 及更高版本：

```txt
17-:-Xmx2g
```

空白行会被忽略。以 `#` 开头的行被视为注释并被忽略。未注释且未被识别为有效 JVM 参数的行将被拒绝，Elasticsearch 将无法启动。

## 使用环境变量设置 JVM 选项

在生产环境中，使用 JVM 选项文件来覆盖默认设置。在测试和开发环境中，你还可以通过 `ES_JAVA_OPTS` 环境变量设置 JVM 选项。

```sh
export ES_JAVA_OPTS="$ES_JAVA_OPTS -Djava.io.tmpdir=/path/to/temp/dir"
./bin/elasticsearch
```

如果你使用 RPM 或 Debian 软件包，可以在系统配置文件中指定 `ES_JAVA_OPTS`。

Elasticsearch 会忽略 `JAVA_TOOL_OPTIONS` 和 `JAVA_OPTS` 环境变量。

## 设置 JVM 堆大小

默认情况下，Elasticsearch 基于节点的角色和总内存自动设置 JVM 堆大小。在大多数生产环境中，建议使用默认大小。

要覆盖默认堆大小，请设置最小和最大堆大小设置 `Xms` 和 `Xmx`。最小值和最大值必须相同。

堆大小应基于可用 RAM：

- 将 `Xms` 和 `Xmx` 设置为**不超过总内存的 50%**。Elasticsearch 需要 JVM 堆以外的内存。例如，Elasticsearch 使用堆外缓冲区进行高效的网络通信，并依赖操作系统的文件系统缓存来高效访问文件。JVM 本身也需要一些内存。Elasticsearch 使用的内存多于 `Xmx` 设置配置的限制是正常现象。

  在容器（如 Docker）中运行时，总内存定义为容器可见的内存量，而不是主机上的系统总内存。

- 将 `Xms` 和 `Xmx` 设置为**不超过压缩普通对象指针（oops）的阈值**。确切阈值有所不同，但在大多数系统上 26GB 是安全的，在某些系统上可以高达 30GB。要验证你是否低于阈值，请在 Elasticsearch 日志中检查类似以下的条目：

  ```txt
  heap size [1.9gb], compressed ordinary object pointers [true]
  ```

  或者使用节点信息 API 检查节点的 `jvm.using_compressed_ordinary_object_pointers` 值：

  ```txt
  GET _nodes/_all/jvm
  ```

Elasticsearch 可用的堆越多，它可以用于内部缓存的内存就越多。这会留给操作系统用于文件系统缓存的内存更少。更大的堆还可能导致更长的垃圾收集停顿。

要配置堆大小，请将 `Xms` 和 `Xmx` JVM 参数添加到扩展名为 `.options` 的自定义 JVM 选项文件中，并将其存储在 `jvm.options.d/` 目录中。例如，要将最大堆大小设置为 2GB，请将 `Xms` 和 `Xmx` 都设置为 `2g`：

```txt
-Xms2g
-Xmx2g
```

对于测试，你还可以使用 `ES_JAVA_OPTS` 环境变量设置堆大小：

```sh
ES_JAVA_OPTS="-Xms2g -Xmx2g" ./bin/elasticsearch
```

`ES_JAVA_OPTS` 变量会覆盖所有其他 JVM 选项。我们不建议在生产中使用 `ES_JAVA_OPTS`。

如果你将 Elasticsearch 作为 Windows 服务运行，可以使用服务管理器更改堆大小。参阅"在 Windows 上将 Elasticsearch 安装并运行为服务"。

## JVM 堆转储路径设置

默认情况下，Elasticsearch 将 JVM 配置为在发生内存不足异常时将堆转储到默认数据目录。在 RPM 和 Debian 软件包上，数据目录为 `/var/lib/elasticsearch`。在 Linux 和 MacOS 以及 Windows 发行版上，数据目录位于 Elasticsearch 安装的根目录下。

如果此路径不适合接收堆转储，请修改 `jvm.options` 中的 `-XX:HeapDumpPath=...` 条目：

- 如果你指定一个目录，JVM 将基于正在运行的实例的 PID 为堆转储生成文件名。
- 如果你指定固定的文件名而不是目录，则当 JVM 需要在发生内存不足异常时执行堆转储时，该文件必须不存在。否则，堆转储将失败。

## GC 日志记录设置

默认情况下，Elasticsearch 启用垃圾收集（GC）日志。这些日志在 `jvm.options` 中配置，并输出到与 Elasticsearch 日志相同的默认位置。默认配置每 64 MB 轮换一次日志，最多可占用 2 GB 的磁盘空间。

你可以使用 JEP 158：统一 JVM 日志记录中描述的命令行选项重新配置 JVM 日志记录。除非直接更改默认的 `jvm.options` 文件，否则 Elasticsearch 默认配置会在你自己的设置之外额外应用。要禁用默认配置，请先通过提供 `-Xlog:disable` 选项禁用日志记录，然后提供你自己的命令行选项。这会禁用所有 JVM 日志记录，因此请务必查看可用选项并启用你需要的所有内容。

要查看原始 JEP 中未包含的更多选项，参阅使用 JVM 统一日志框架启用日志记录。

### 示例

通过创建包含以下示例选项的 `$ES_HOME/config/jvm.options.d/gc.options`，将默认 GC 日志输出位置更改为 `/opt/my-app/gc.log`：

```txt
# Turn off all previous logging configuratons
-Xlog:disable

# Default settings from JEP 158, but with `utctime` instead of `uptime` to match the next line
-Xlog:all=warning:stderr:utctime,level,tags

# Enable GC logging to a custom location with a variety of options
-Xlog:gc*,gc+age=trace,safepoint:file=/opt/my-app/gc.log:utctime,level,pid,tags:filecount=32,filesize=64m
```

配置 Elasticsearch Docker 容器将 GC 调试日志发送到标准错误（stderr）。这使容器编排器可以处理输出。如果使用 `ES_JAVA_OPTS` 环境变量，请指定：

```sh
MY_OPTS="-Xlog:disable -Xlog:all=warning:stderr:utctime,level,tags -Xlog:gc=debug:stderr:utctime"
docker run -e ES_JAVA_OPTS="$MY_OPTS" # etc
```

## JVM 致命错误日志设置

默认情况下，Elasticsearch 将 JVM 配置为将致命错误日志写入默认日志记录目录。在 RPM 和 Debian 软件包上，此目录为 `/var/log/elasticsearch`。在 Linux 和 MacOS 以及 Windows 发行版上，日志目录位于 Elasticsearch 安装的根目录下。

这些是 JVM 遇到致命错误（例如段错误）时产生的日志。如果此路径不适合接收日志，请修改 `jvm.options` 中的 `-XX:ErrorFile=...` 条目。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/advanced-configuration.html)
