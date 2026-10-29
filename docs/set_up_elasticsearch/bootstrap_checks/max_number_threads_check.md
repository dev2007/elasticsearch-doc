# 最大线程数检查

Elasticsearch 通过将请求分解为多个阶段并将这些阶段交给不同的线程池执行器来执行请求。Elasticsearch 内部有多种任务使用不同的线程池执行器。因此，Elasticsearch 需要能够创建大量线程。最大线程数检查确保 Elasticsearch 进程在正常使用下有权创建足够的线程。此检查仅在 Linux 上强制执行。如果你在 Linux 上，要通过最大线程数检查，你必须将系统配置为允许 Elasticsearch 进程创建至少 4096 个线程。这可以通过 `/etc/security/limits.conf` 使用 `nproc` 设置来完成（注意，你可能还必须提高 root 用户的限制）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/max-number-threads-check.html)
