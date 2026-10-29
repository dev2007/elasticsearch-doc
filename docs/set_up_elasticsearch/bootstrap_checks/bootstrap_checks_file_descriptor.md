# 文件描述符检查

文件描述符是 Unix 中用于跟踪打开"文件"的构造。不过在 Unix 中，一切都是文件。例如，"文件"可以是物理文件、虚拟文件（例如 `/proc/loadavg`）或网络套接字。Elasticsearch 需要大量的文件描述符（例如，每个分片由多个段和其他文件组成，还有到其他节点的连接等）。此引导检查在 OS X 和 Linux 上强制执行。要通过文件描述符检查，你可能必须配置文件描述符。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-file-descriptor.html)
