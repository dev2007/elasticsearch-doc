# 使用串行收集器检查

针对不同工作负载，OpenJDK 衍生的 JVM 有多种垃圾收集器。其中串行收集器最适合单逻辑 CPU 机器或极小的堆，这两者都不适合运行 Elasticsearch。将串行收集器与 Elasticsearch 一起使用可能会对性能造成毁灭性影响。使用串行收集器检查确保 Elasticsearch 未被配置为使用串行收集器运行。要通过串行收集器检查，你不能以串行收集器启动 Elasticsearch（无论是你所用 JVM 的默认值，还是你使用 `-XX:+UseSerialGC` 显式指定的）。请注意，Elasticsearch 附带的默认 JVM 配置在 JDK14 及更高版本上将 Elasticsearch 配置为使用 G1GC 垃圾收集器。对于较早的 JDK 版本，配置默认为 CMS 收集器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-serial-collector.html)
