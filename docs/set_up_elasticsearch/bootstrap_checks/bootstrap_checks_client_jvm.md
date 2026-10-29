# 客户端 JVM 检查

OpenJDK 衍生的 JVM 提供两种不同的 JVM：客户端 JVM 和服务器 JVM。这些 JVM 使用不同的编译器从 Java 字节码生成可执行的机器码。客户端 JVM 针对启动时间和内存占用进行调优，而服务器 JVM 针对最大化性能进行调优。两者之间的性能差异可能非常大。客户端 JVM 检查确保 Elasticsearch 不是在客户端 JVM 中运行。要通过客户端 JVM 检查，你必须使用服务器 VM 启动 Elasticsearch。在现代系统和操作系统上，服务器 VM 是默认值。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-client-jvm.html)
