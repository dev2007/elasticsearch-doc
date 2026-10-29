# 重要的系统配置

理想情况下，Elasticsearch 应该单独在服务器上运行并使用所有可用资源。为此，你需要配置操作系统，以允许运行 Elasticsearch 的用户访问比默认允许的更多的资源。

在生产环境运行之前必须考虑以下设置：

- 配置系统设置
- 禁用交换（swapping）
- 增加文件描述符
- 确保足够的虚拟内存
- 确保足够的线程
- JVM DNS 缓存设置
- 临时目录未以 `noexec` 挂载
- TCP 重传超时

## 开发模式与生产模式

默认情况下，Elasticsearch 假定你正在开发模式下工作。如果上述任何设置未正确配置，将向日志文件写入警告，但你仍然可以启动并运行你的 Elasticsearch 节点。

一旦你配置了诸如 `network.host` 之类的网络设置，Elasticsearch 就会假定你正在迁移到生产环境，并将上述警告升级为异常。这些异常将阻止你的 Elasticsearch 节点启动。这是一项重要的安全措施，确保你不会因为配置错误的服务器而丢失数据。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/system-config.html)
