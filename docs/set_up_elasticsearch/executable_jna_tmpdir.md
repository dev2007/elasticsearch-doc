# 确保 JNA 临时目录允许执行

*这仅适用于 Linux。*

Elasticsearch 使用 Java 本地访问（JNA）库和另一个名为 libffi 的库来执行一些依赖平台的本地代码。在 Linux 上，支持这些库的本地代码在运行时被提取到一个临时目录，然后映射到 Elasticsearch 地址空间中的可执行页。这要求底层文件不能位于以 `noexec` 选项挂载的文件系统上。

默认情况下，Elasticsearch 会在 `/tmp` 中创建其临时目录。但是，一些经过安全加固的 Linux 安装默认以 `noexec` 选项挂载 `/tmp`。这会阻止 JNA 和 libffi 正常工作。例如，在启动时 JNA 可能无法加载并抛出 `java.lang.UnsatisfiedLinkerError` 异常，或显示类似于 `failed to map segment from shared object` 的消息，或者 libffi 可能报告诸如 `failed to allocate closure` 之类的消息。请注意，异常消息可能因 JVM 版本而异。此外，依赖通过 JNA 执行本地代码的 Elasticsearch 组件可能会失败，并显示指示 JNA 不可用的消息。

要解决这些问题，可以从你的 `/tmp` 文件系统中移除 `noexec` 选项，或者通过设置 `$ES_TMPDIR` 环境变量将 Elasticsearch 配置为使用其他位置作为其临时目录。例如：

- 如果你直接从 shell 运行 Elasticsearch，按如下方式设置 `$ES_TMPDIR`：

  ```sh
  export ES_TMPDIR=/usr/share/elasticsearch/tmp
  ```

- 对于通过 RPM 或 DEB 软件包完成的安装，需要通过系统配置文件设置环境变量。

- 如果你使用 systemd 将 Elasticsearch 作为服务运行，请在服务覆盖文件的 `[Service]` 部分中添加以下行：

  ```txt
  Environment=ES_TMPDIR=/usr/share/elasticsearch/tmp
  ```

如果你需要对这些临时文件的位置进行更精细的控制，还可以使用 JVM 标志 `-Djna.tmpdir=<path>` 配置 JNA 使用的路径，并通过设置 `LIBFFI_TMPDIR` 环境变量配置 libffi 用于其临时文件的路径。未来版本的 Elasticsearch 可能需要额外的配置，因此应尽可能优先设置 `ES_TMPDIR`。

Elasticsearch 不会移除其临时目录。你应该在 Elasticsearch 未运行时移除遗留的临时目录。最好自动执行此操作，例如在每次重启时。如果你在 Linux 上运行，可以通过使用 tmpfs 文件系统来实现。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/executable-jna-tmpdir.html)
