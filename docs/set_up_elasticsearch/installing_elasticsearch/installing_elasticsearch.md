# 安装 Elasticsearch

## 托管 Elasticsearch 服务

Elastic Cloud 在 AWS、GCP 和 Azure 上以托管服务的形式提供 Elasticsearch、Kibana 以及 Elastic 的可观测性、企业搜索和 Elastic 安全解决方案的所有功能。

要在 Elastic Cloud 中设置 Elasticsearch，[注册免费的 Elastic Cloud 试用](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)。

## 自管理 Elasticsearch 选项

如果你想自己安装和管理 Elasticsearch，你可以：

- 使用 Linux、MacOS 或 Windows 安装包运行 Elasticsearch。
- 在 Docker 容器中运行 Elasticsearch。
- 使用 Elastic Cloud on Kubernetes 在 Kubernetes 上设置和管理 Elasticsearch、Kibana、Elastic Agent 以及 Elastic Stack 的其余部分。

要在你自己的机器上试用 Elasticsearch，我们推荐使用 Docker 同时运行 Elasticsearch 和 Kibana。更多信息参阅[本地运行 Elasticsearch](/set_up_elasticsearch/run_elasticsearch_locally)。请注意，此设置不适合生产使用。

## Elasticsearch 安装包

Elasticsearch 以以下包格式提供：

| | |
|:--|:--|
|Linux 和 MacOS `tar.gz` 存档|`tar.gz` 存档可以安装在任何 Linux 发行版和 MacOS 上。[在 Linux 或 MacOS 上用存档安装 Elasticsearch](/set_up_elasticsearch/installing_elasticsearch/linux)|
|Windows `.zip` 存档|`zip` 存档适用于在 Windows 上安装。[在 Windows 上用 `.zip` 安装 Elasticsearch](/set_up_elasticsearch/installing_elasticsearch/windows)|
|`deb`|`deb` 包适用于 Debian、Ubuntu 和其他基于 Debian 的系统。Debian 包可以从 Elasticsearch 网站或我们的 Debian 仓库下载。[用 Debian 包安装 Elasticsearch](/set_up_elasticsearch/installing_elasticsearch/debian)|
|`rpm`|`rpm` 包适用于在 Red Hat、Centos、SLES、OpenSuSE 以及其他基于 RPM 的系统上安装。RPM 可以从 Elasticsearch 网站或我们的 RPM 仓库下载。[用 RPM 安装 Elasticsearch](/set_up_elasticsearch/installing_elasticsearch/rpm)|

有关在你自己的场所设置 Elastic Stack 的分步示例，请参阅我们的教程：[安装自管理 Elastic Stack](https://www.elastic.co/guide/en/elastic-stack/8.18/installing-stack-demo-self.html)。

## Elasticsearch 容器镜像

你也可以在容器镜像中运行 Elasticsearch。

| | |
|:--|:--|
|`docker`|Docker 容器镜像可以从 Elastic Docker Registry 下载。[用 Docker 安装 Elasticsearch](/set_up_elasticsearch/installing_elasticsearch/docker)|

## Java (JVM) 版本

Elasticsearch 使用 Java 构建，每个发行版中都包含一个捆绑的 OpenJDK 版本。我们强烈建议在所有 Elasticsearch 安装中使用捆绑的 JVM。

在支持和维护方面，捆绑的 JVM 被视为与 Elasticsearch 的任何其他依赖项相同。这意味着 Elastic 负责使其保持最新状态，并根据需要对安全问题做出反应，按需修复漏洞和 bug。Elastic 对捆绑 JVM 的支持受 Elastic 的支持策略和生命周期终止计划约束，与 JVM 原始供应商提供的支持策略和生命周期终止计划无关。Elastic 不支持将捆绑的 JVM 用于运行 Elasticsearch 之外的目的。

Elasticsearch 只使用 JVM 提供的部分特性。捆绑 JVM 中的 bug 和安全问题通常与 Elasticsearch 未使用的特性有关。这些问题不适用于 Elasticsearch。Elastic 会分析其所有依赖项（包括捆绑 JVM）的安全漏洞报告，并在需要时发布 Elastic 安全公告。

如果你决定使用与捆绑版本不同的 Java 版本运行 Elasticsearch，建议使用[支持列表](https://www.elastic.co/support/matrix)中列出的最新发布的 [`LTS` 版本的 Java](https://www.oracle.com/technetwork/java/eol-135779.html)。虽然支持这种配置，但如果你所选的 JVM 遇到安全问题或其他 bug，除非该问题也存在于捆绑的 JVM 中，否则 Elastic 可能无法提供帮助。相反，你必须直接向你选择的 JVM 供应商寻求帮助。你还必须负责响应你所选 JVM 供应商发布的安全和 bug 通告。使用捆绑 JVM 以外的 JVM 时，Elasticsearch 的性能可能不是最优的。Elasticsearch 与某些 OpenJDK 特有特性紧密耦合，因此在使用非 OpenJDK 的 JVM 时可能无法正常工作。如果你尝试使用已知有问题的 JVM 版本，Elasticsearch 会拒绝启动。

要使用你自己的 Java 版本，请将 `ES_JAVA_HOME` 环境变量设置为你自己的 JVM 安装路径。捆绑的 JVM 位于 Elasticsearch 主目录的 `jdk` 子目录中。如果使用你自己的 JVM，可以删除此目录。

## JDK 区域设置数据库

Elasticsearch 使用的区域设置数据库（用于将各种日期格式映射到底层的日期存储格式）取决于 Elasticsearch 运行的 JDK 版本。在 JDK 23 及以上版本中，Elasticsearch 将使用 CLDR 数据库。在 JDK 22 及以下版本中，Elasticsearch 将使用 COMPAT 数据库。这意味着当从之前的 JDK 版本迁移到 JDK 23 或以上版本时，用于文本日期格式的字符串以及自定义周日期格式的输出可能会发生变化。更多信息参阅自定义日期格式。

## JVM 和 Java 代理

不要使用附加到 JVM 的第三方 Java 代理。这些代理会降低 Elasticsearch 的性能，甚至可能导致节点冻结或崩溃。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/install-elasticsearch.html)
