# 最大文件大小检查

作为单个分片组成部分的段文件以及作为 translog 组成部分的 translog 世代文件可能会变得很大（超过数 GB）。在 Elasticsearch 进程可创建文件的最大大小受限制的系统上，这可能导致写入失败。因此，这里最安全的选择是文件最大大小不受限制，这正是最大文件大小引导检查所强制执行的。要通过最大文件检查，你必须将系统配置为允许 Elasticsearch 进程写入无限大小的文件。这可以通过 `/etc/security/limits.conf` 将 `fsize` 设置为 `unlimited` 来完成（注意，你可能还必须提高 root 用户的限制）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-max-file-size.html)
