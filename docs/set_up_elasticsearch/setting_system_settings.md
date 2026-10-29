# 配置系统设置

在何处配置系统设置取决于你使用哪个软件包安装 Elasticsearch，以及你使用的操作系统。

使用 `.zip` 或 `.tar.gz` 软件包时，可以通过以下方式配置系统设置：

- 使用 `ulimit` 临时配置。
- 在 `/etc/security/limits.conf` 中永久配置。

使用 RPM 或 Debian 软件包时，大多数系统设置在系统配置文件中设置。但是，使用 systemd 的系统要求在 systemd 配置文件中指定系统限制。

## ULIMIT

在 Linux 系统上，`ulimit` 可用于临时更改资源限制。通常需要在切换到将运行 Elasticsearch 的用户之前以 root 身份设置限制。例如，要将打开文件句柄的数量（`ulimit -n`）设置为 65,535，可以执行以下操作：

```bash
sudo su
ulimit -n 65535
su elasticsearch
```

- 成为 root。
- 更改最大打开文件数。
- 切换到 elasticsearch 用户以启动 Elasticsearch。

新限制仅在当前会话期间有效。

你可以使用 `ulimit -a` 查看所有当前应用的限制。

## /ETC/SECURITY/LIMITS.CONF

在 Linux 系统上，可以通过编辑 `/etc/security/limits.conf` 文件为特定用户设置持久限制。要将 elasticsearch 用户的最大打开文件数设置为 65,535，请在 `limits.conf` 文件中添加以下行：

```txt
elasticsearch  -  nofile  65535
```

此更改只在 elasticsearch 用户下次打开新会话时生效。

:::note Ubuntu 和 limits.conf

Ubuntu 对由 `init.d` 启动的进程忽略 `limits.conf` 文件。要启用 `limits.conf` 文件，编辑 `/etc/pam.d/su` 并取消注释以下行：

```txt
# session    required   pam_limits.so
```

:::

## SYSCONFIG 文件

使用 RPM 或 Debian 软件包时，可以在系统配置文件中指定环境变量，该文件位于：

- **RPM**：`/etc/sysconfig/elasticsearch`
- **Debian**：`/etc/default/elasticsearch`

但是，系统限制需要通过 systemd 指定。

## SYSTEMD 配置

在使用 systemd 的系统上使用 RPM 或 Debian 软件包时，必须通过 systemd 指定系统限制。

systemd 服务文件（`/usr/lib/systemd/system/elasticsearch.service`）包含默认应用的限制。

要覆盖它们，添加一个名为 `/etc/systemd/system/elasticsearch.service.d/override.conf` 的文件（或者，你可以运行 `sudo systemctl edit elasticsearch`，它会在你的默认编辑器中自动打开该文件）。在此文件中设置任何更改，例如：

```txt
[Service]
LimitMEMLOCK=infinity
```

完成后，运行以下命令重新加载单元：

```bash
sudo systemctl daemon-reload
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/setting-system-settings.html)
