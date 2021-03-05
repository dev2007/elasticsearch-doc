# 安装 Elasticsearch

## 托管 Elasticsearch

你可以在自己的硬件上运行 Elasticsearch，或者使用我们在 Elastic Cloud 上的[托管 Elasticsearch 服务](https://www.elastic.co/cloud/elasticsearch-service)。Elasticsearch 服务 在 AWS 和 GCP 上都有。[免费试用 Elasticsearch 服务](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)。

## 自己安装 Elasticsearch

Elasticsearch 用以下包格式提供：

| | |
|:--|:--|
|Linux and MacOS `tar.gz` 压缩包|`tar.gz` 压缩包可以安装在任何 Linux 发行版和 MacOS。[在 Linux 或 MacOS 上用压缩包安装 Elasticsearch](/setup/install/linux)|
|Windows `.zip` 压缩包|`zip`压缩包适用于在 Windows 上安装。[在 Windows 上用 `.zip` 安装 Elasticsearch](/setup/install/windows)|
|`deb`|`deb` 包适用于 Debian、Ubuntu 和其他基于 Debian 的系统。Debian 包可以从 Elasticsearch 网站或者从我们的 Debian仓库下载。[用 Debian 包安装 Elasticsearch](/setup/install/debian)|
|`rpm`|`rpm` 包适用于在 Red Hat、Centos、SLES、OpenSuSE以及其他基于 RPM 的系统上安装。RPM 可以从 Elasticsearch 网站或者从我们的 RPM 仓库下载。[用 RPM 安装 Elasticsearch](/setup/install/rpm)|
|`msi`|[测试] `msi` 包适用于在 安装了不低于 .NET 4.5 framework 的 Windows 64位系统上安装，这是在 Windows 上开始 Elasticsearch 最简单的选择。MSI 可以从 Elasticsearch 网站上下载。[用 Windows MSI Installer 安装 Elasticsearch](/setup/install/windows)|
|`docker`|镜像可以作为 Docker 容器运行 Elasticsearch。可以从 Elasticsearch Docker Registry 下载。[用 Docker 安装 Elasticsearch](/setup/install/docker)|
|`brew`|Formulae 可从 Elastic Homebrew tap 上获得，用 Homebrew 包管理器在 macOS上安装 Elasticsearch。[用 Homebrew 在 macOS 上安装 Elasticsearch](/setup/install/brew)|

## 配置管理工具

我们也提供以下的配置管理工具用于协助大型部署：

| | |
|:--|:--|
|Puppet| [puppet-elasticsearch](https://github.com/elastic/puppet-elasticsearch)|
|Chef| [cookbook-elasticsearch](https://github.com/elastic/cookbook-elasticsearch)|
|Ansible| [ansible-elasticsearch](https://github.com/elastic/ansible-elasticsearch)|

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html)
