# 设置 Elasticsearch

本章包括有关如何设置 Elasticsearch 并使其运行的信息，包含：

- 下载
- 安装
- 启动
- 配置

## 支持的平台

官方支持的操作系统的 JVM 列表见：[支持列表](https://www.elastic.co/cn/support/matrix)。Elasticsearch 在列出的平台上进行了测试，但它也可能在其他平台运行。

## Java (JVM) 版本

Elasticsearch 使用 Java构建，在每个发行版本中都包含 JDK 维护者（GPLv2+CE）提供的 [OpenJDK](https://openjdk.java.net/) 捆绑版本。捆绑的 JVM 是推荐的 JVM，位于 Elasticsearch 主目录中的 jdk 目录中。

要使用你自己版本的 Java，设置 `JAVA_HOME` 环境变量。如果你必须使用不同于捆绑 JVM 的 Java 版本，我们推荐你使用[受支持的](https://www.elastic.co/support/matrix) [`LTS` 版本的 Java](https://www.oracle.com/technetwork/java/eol-135779.html)。如果使用已知的坏版本 Java，Elasticsearch 会拒绝启动。使用你的自己的 JVM时，捆绑 JVM 目录 可能被删除。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html)
