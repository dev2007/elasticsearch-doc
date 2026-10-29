# 虚拟内存

Elasticsearch 默认使用 `mmapfs` 目录来存储其索引。操作系统的默认 mmap 计数限制可能太低，这可能导致内存不足异常。

如果操作系统的默认 `vm.max_map_count` 值为 1048576 或更高，则无需更改配置。如果默认值低于 1048576，请将 `vm.max_map_count` 参数配置为 1048576。

在 Linux 上，你可以以 root 身份运行以下命令来增加限制：

```sh
sysctl -w vm.max_map_count=1048576
```

要永久设置此值，请更新 `/etc/sysctl.conf` 中的 `vm.max_map_count` 设置。要在重启后验证，运行 `sysctl vm.max_map_count`。

RPM 和 Debian 软件包会自动配置此设置。不需要进一步的配置。

你可以使用以下命令找出正在运行的 Elasticsearch 进程的当前 mmap 计数，其中 `$PID` 是正在运行的 Elasticsearch 进程的进程 ID：

```sh
wc -l /proc/$PID/maps
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/vm-max-map-count.html)
