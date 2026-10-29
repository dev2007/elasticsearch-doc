# 系统调用过滤器检查

Elasticsearch 根据操作系统安装不同风格的系统调用过滤器（例如 Linux 上的 seccomp）。安装这些系统调用过滤器是为了阻止执行与派生（fork）相关的系统调用，作为针对针对 Elasticsearch 的任意代码执行攻击的防御机制。系统调用过滤器检查确保如果启用了系统调用过滤器，则它们已成功安装。要通过系统调用过滤器检查，你必须修复系统上阻止系统调用过滤器安装的任何配置错误（检查你的日志）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-syscall-filter.html)
