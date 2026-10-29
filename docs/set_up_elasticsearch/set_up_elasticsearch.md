# 设置 Elasticsearch

本章包括有关如何设置 Elasticsearch 并使其运行的信息，包含：

- 下载
- 安装
- 启动
- 配置

## 支持的平台

官方支持的操作系统的 JVM 列表见：[支持列表](https://www.elastic.co/cn/support/matrix)。Elasticsearch 在列出的平台上进行了测试，但它也可能在其他平台运行。

## 使用专用主机

在生产环境中，我们建议你在专用主机上运行 Elasticsearch，或将其作为主要服务运行。Elasticsearch 的一些特性（例如自动 JVM 堆大小设置）假定它是主机或容器上唯一资源密集型的应用。例如，你可能会将 Metricbeat 与 Elasticsearch 一起运行以收集集群统计信息，但资源消耗较大的 Logstash 部署应该放在自己的主机上。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/setup.html)
