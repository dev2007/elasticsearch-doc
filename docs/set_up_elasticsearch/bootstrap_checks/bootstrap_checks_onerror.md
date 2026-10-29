# OnError 和 OnOutOfMemoryError 检查

JVM 选项 OnError 和 OnOutOfMemoryError 允许在 JVM 遇到致命错误（OnError）或 OutOfMemoryError（OnOutOfMemoryError）时执行任意命令。但是，默认情况下，Elasticsearch 系统调用过滤器（seccomp）已启用，这些过滤器会阻止派生（fork）。因此，使用 OnError 或 OnOutOfMemoryError 与系统调用过滤器是不兼容的。如果使用了这些 JVM 选项中的任何一个并且系统调用过滤器已启用，OnError 和 OnOutOfMemoryError 检查将阻止 Elasticsearch 启动。此检查始终强制执行。要通过此检查，不要启用 OnError 或 OnOutOfMemoryError；相反，升级到 Java 8u92 并使用 JVM 标志 ExitOnOutOfMemoryError。虽然它不具备 OnError 或 OnOutOfMemoryError 的完整能力，但在启用 seccomp 的情况下不支持任意派生。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-onerror.html)
