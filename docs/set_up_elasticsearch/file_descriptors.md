# 文件描述符

这仅适用于 Linux 和 macOS，如果在 Windows 上运行 Elasticsearch 可以安全地忽略。在 Windows 上，JVM 使用的 API 仅受可用资源的限制。

Elasticsearch 使用大量的文件描述符或文件句柄。文件描述符用尽可能是灾难性的，并且很可能导致数据丢失。确保将运行 Elasticsearch 的用户的打开文件描述符数量限制增加到 65,535 或更高。

对于 .zip 和 .tar.gz 软件包，在启动 Elasticsearch 之前以 root 身份设置 `ulimit -n 65535`，或在 `/etc/security/limits.conf` 中将 `nofile` 设置为 `65535`。

在 macOS 上，你还必须将 JVM 选项 `-XX:-MaxFDLimit` 传递给 Elasticsearch，以便它能够利用更高的文件描述符限制。

RPM 和 Debian 软件包已经默认将最大文件描述符数量设置为 65535，不需要进一步的配置。

你可以使用节点统计 API 检查为每个节点配置的 `max_file_descriptors`：

```txt
GET _nodes/stats/process?filter_path=**.max_file_descriptors
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/file-descriptors.html)
