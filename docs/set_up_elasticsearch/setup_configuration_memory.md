# 禁用交换

大多数操作系统尝试尽可能多地将内存用于文件系统缓存，并急切地将未使用的应用程序内存换出到磁盘。这可能导致 JVM 堆的部分内存甚至其可执行页被换出到磁盘。

交换对性能和节点稳定性都非常不利，应不惜一切代价避免。它可能导致垃圾收集持续数分钟而不是毫秒，并可能导致节点响应缓慢甚至与集群断开连接。在一个有弹性的分布式系统中，让操作系统杀死节点是更有效的做法。

有三种禁用交换的方法。首选方法是完全禁用 swap。如果这不是一个选项，是选择最小化 swappiness 还是内存锁定取决于你的环境。

## 禁用所有交换文件

通常 Elasticsearch 是机器上运行的唯一服务，其内存使用由 JVM 选项控制。应该不需要启用 swap。

在 Linux 系统上，你可以通过运行以下命令临时禁用 swap：

```sh
sudo swapoff -a
```

这不需要重启 Elasticsearch。

要永久禁用它，你需要编辑 `/etc/fstab` 文件并注释掉所有包含 `swap` 一词的行。

在 Windows 上，可以通过系统属性 → 高级 → 性能 → 高级 → 虚拟内存完全禁用页面文件来实现等效效果。

## 配置 swappiness

Linux 系统上可用的另一个选项是确保 `sysctl` 值 `vm.swappiness` 设置为 `1`。这会减少内核换出的倾向，在正常情况下不应导致交换，同时仍允许整个系统在紧急情况下进行交换。

## 启用 bootstrap.memory_lock

另一个选项是在 Linux/Unix 系统上使用 `mlockall`，或在 Windows 上使用 `VirtualLock`，尝试将进程地址空间锁定到 RAM 中，防止任何 Elasticsearch 堆内存被换出。

某些平台在使用内存锁定时仍会换出堆外内存。为了防止堆外内存被换出，应改为禁用所有交换文件。

要启用内存锁定，请在 `elasticsearch.yml` 中将 `bootstrap.memory_lock` 设置为 `true`：

```txt
bootstrap.memory_lock: true
```

:::warning 警告

`mlockall` 可能导致 JVM 或 shell 会话在尝试分配比可用内存更多的内存时退出！

:::

启动 Elasticsearch 后，你可以通过在此请求的输出中检查 `mlockall` 的值来查看此设置是否成功应用：

```txt
GET _nodes?filter_path=**.mlockall
```

如果你看到 `mlockall` 为 `false`，则意味着 `mlockall` 请求失败。你还会在日志中看到包含 "Unable to lock JVM Memory" 字样的行，其中包含更多信息。

在 Linux/Unix 系统上，最可能的原因是运行 Elasticsearch 的用户没有锁定内存的权限。可以按以下方式授予权限：

**.zip 和 .tar.gz**

在启动 Elasticsearch 之前以 root 身份设置 `ulimit -l unlimited`。或者，在 `/etc/security/limits.conf` 中将 `memlock` 设置为 `unlimited`：

```txt
# allow user 'elasticsearch' mlockall
elasticsearch soft memlock unlimited
elasticsearch hard memlock unlimited
```

**RPM 和 Debian**

在 systemd 配置中将 `LimitMEMLOCK` 设置为 `infinity`。

`mlockall` 失败的另一个可能原因是 JNA 临时目录（通常是 `/tmp` 的子目录）以 `noexec` 选项挂载。这可以通过使用 `ES_JAVA_OPTS` 环境变量为 JNA 指定新的临时目录来解决：

```sh
export ES_JAVA_OPTS="$ES_JAVA_OPTS -Djna.tmpdir=<path>"
./bin/elasticsearch
```

或者在 `jvm.options` 配置文件中设置此 JVM 标志。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/setup-configuration-memory.html)
