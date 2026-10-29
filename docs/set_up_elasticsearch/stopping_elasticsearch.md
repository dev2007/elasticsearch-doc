# 停止 Elasticsearch

Elasticsearch 的有序关闭确保 Elasticsearch 有机会清理并关闭未完成的资源。例如，以有序方式关闭的节点会将自己从集群中移除，将 translog 同步到磁盘，并执行其他相关的清理活动。你可以通过正确停止 Elasticsearch 来帮助确保有序关闭。

如果你将 Elasticsearch 作为服务运行，你可以通过安装提供的 IService 管理功能停止 Elasticsearch。

如果你直接运行 Elasticsearch，如果是在控制台中运行，可以通过发送 control-C 停止 Elasticsearch；或者在 POSIX 系统上向 Elasticsearch 进程发送 SIGTERM。你可以通过多种工具（例如 `ps` 或 `jps`）获取要发送信号的 PID：

```sh
$ jps | grep Elasticsearch
14542 Elasticsearch
```

从 Elasticsearch 启动日志中：

```txt
[2016-07-07 12:26:18,908][INFO ][node                     ] [I8hydUG] version[5.0.0-alpha4], pid[15399], build[3f5b994/2016-06-27T16:23:46.861Z], OS[Mac OS X/10.11.5/x86_64], JVM[Oracle Corporation/Java HotSpot(TM) 64-Bit Server VM/1.8.0_92/25.92-b14]
```

或者在启动时指定写入 PID 文件的位置（`-p <path>`）：

```sh
$ ./bin/elasticsearch -p /tmp/elasticsearch-pid -d
$ cat /tmp/elasticsearch-pid && echo
15516
$ kill -SIGTERM 15516
```

## 致命错误时停止

在 Elasticsearch 虚拟机的生命周期中，可能出现某些致命错误，使虚拟机处于可疑状态。此类致命错误包括内存不足错误、虚拟机内部错误和严重的 I/O 错误。

当 Elasticsearch 检测到虚拟机遇到此类致命错误时，Elasticsearch 将尝试记录该错误，然后停止虚拟机。当 Elasticsearch 发起这种关闭时，它不会经历上述的有序关闭。Elasticsearch 进程还将返回一个指示错误性质的特殊状态码：

| 终止原因 | 状态码 |
|----------|--------|
| 被 jvmkiller 代理终止 | 158 |
| 用户或内核 SIGTERM | 143 |
| 被内核 oom-killer 终止 | 137 |
| 段错误 | 134 |
| JVM 内部错误 | 128 |
| 内存不足错误 | 127 |
| 栈溢出错误 | 126 |
| 未知的虚拟机错误 | 125 |
| 严重 I/O 错误 | 124 |
| 引导检查失败 | 78 |
| 未知致命错误 | 1 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/stopping-elasticsearch.html)
