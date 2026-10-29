# 本地运行 Elasticsearch

:::caution 警告

**不要在生产部署中使用这些说明**

本页面的说明仅适用于本地开发。不要将此配置用于生产部署，因为它不安全。生产部署选项的列表参阅部署选项。

:::

使用 start-local 脚本，在 Docker 中快速设置 Elasticsearch 和 Kibana，用于本地开发或测试。

此设置附带一个月的 Elastic Platinum 许可证试用。试用期结束后，许可证将恢复为免费开放（Basic）。更多信息参阅 Elastic 订阅。

## 前置条件

- 如果你没有安装 Docker，请为你的操作系统下载并安装 Docker Desktop。
- 如果你使用 Microsoft Windows，请安装适用于 Linux 的 Windows 子系统（WSL）。

## 运行 start-local

要在本地设置 Elasticsearch 和 Kibana，请运行 start-local 脚本：

```sh
curl -fsSL https://elastic.co/start-local | sh
```

此脚本会创建一个包含配置文件的 `elastic-start-local` 文件夹，并使用 Docker 启动 Elasticsearch 和 Kibana。

运行脚本后，你可以通过以下端点访问 Elastic 服务：

- **Elasticsearch**：http://localhost:9200
- **Kibana**：http://localhost:5601

该脚本会为 `elastic` 用户生成一个随机密码和一个 API 密钥，并存储在 `.env` 文件中。

此设置仅用于本地测试。HTTPS 被禁用，Elasticsearch 使用 Basic 身份验证。出于安全考虑，Elasticsearch 和 Kibana 只能通过 localhost 访问。

## 了解更多

有关 start-local 设置的更多详细信息，参阅 GitHub 上的 README。了解如何自定义设置、日志记录等。

## 后续步骤

使用我们的快速入门指南学习 Elasticsearch 的基础知识。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/run-elasticsearch-locally.html)
