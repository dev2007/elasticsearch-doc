# 线程数

Elasticsearch 使用多个线程池来执行不同类型的操作。重要的是它能够在需要时创建新线程。确保 Elasticsearch 用户可以创建的线程数至少为 4096。

可以通过在启动 Elasticsearch 之前以 root 身份设置 `ulimit -u 4096` 来实现，或者在 `/etc/security/limits.conf` 中将 `nproc` 设置为 4096。

软件包发行版在 systemd 下作为服务运行时，会自动为 Elasticsearch 进程配置线程数。不需要额外的配置。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/max-number-of-threads.html)
