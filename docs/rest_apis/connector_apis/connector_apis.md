# 连接器 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

连接器和同步作业 API 提供了一种便捷的方式，用于在内部索引中创建和管理 Elastic [连接器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors.html)和同步作业。要开始使用连接器 API，请参阅[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

连接器是 Elasticsearch 集成，用于从第三方数据源引入内容，可以部署在 Elastic Cloud 上或托管在你自己的基础设施上：

- **托管连接器**是 Elastic Cloud 上的托管服务
- **自托管连接器**是在你的基础设施上自行托管的

在[连接器文档](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors.html)中查找所有支持的服务类型列表。

此 API 提供了替代仅依赖 Kibana UI 进行连接器和同步作业管理的方式。API 附带一组验证和断言，以确保内部索引中的状态表示保持有效。

我们还有一个 Elastic 连接器的命令行界面。在 [elastic/connectors](https://github.com/elastic/connectors/blob/main/docs/CLI.md) 仓库中了解更多信息。

## 连接器 API

你可以使用这些 API 创建、获取、删除和更新连接器。

使用以下 API 管理连接器：

- [创建连接器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/create-connector-api.html) **[beta]**
- [删除连接器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-connector-api.html) **[beta]**
- [获取连接器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-connector-api.html) **[beta]**
- [列出连接器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/list-connector-api.html) **[beta]**
- [更新连接器 API 密钥 ID](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-api-key-id-api.html) **[beta]**
- [更新连接器配置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-configuration-api.html) **[beta]**
- [更新连接器功能](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-features-api.html) **[beta]**
- [更新连接器过滤](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-filtering-api.html) **[beta]**
- [更新连接器索引名称](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-index-name-api.html) **[beta]**
- [更新连接器名称和描述](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-name-description-api.html) **[beta]**
- [更新连接器管道](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-pipeline-api.html) **[beta]**
- [更新连接器调度](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-scheduling-api.html) **[beta]**
- [更新连接器服务类型](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-service-type-api.html) **[beta]**

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

## 同步作业 API

你可以使用这些 API 创建、取消、删除和更新同步作业。

使用以下 API 管理同步作业：

- [创建连接器同步作业](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/create-connector-sync-job-api.html) **[beta]**
- [取消连接器同步作业](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cancel-connector-sync-job-api.html) **[beta]**
- [删除连接器同步作业](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-connector-sync-job-api.html) **[beta]**
- [获取连接器同步作业](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-connector-sync-job-api.html) **[beta]**
- [列出连接器同步作业](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/list-connector-sync-jobs-api.html) **[beta]**

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

## 服务 API

:::warning 警告
此功能处于技术预览版，可能会在未来的版本中更改或移除。Elastic 将努力修复任何问题，但技术预览版功能不受正式 GA 功能的支持 SLA 约束。
:::

**连接器服务 API** 是连接器 API 端点的子集，代表[连接器协议](https://github.com/elastic/connectors/blob/main/docs/CONNECTOR_PROTOCOL.md)中定义的框架级操作。这些 API 不用于用户直接管理连接器，而是支持利用连接器协议与 Elasticsearch 通信的服务实现。

所有 Elastic 连接器均使用我们的 Python 连接器框架构建。源代码可在 GitHub 上的 [elastic/connectors](https://github.com/elastic/connectors) 仓库中找到。

### 连接器服务 API

- [连接器签到](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/check-in-connector-api.html) **[preview]**
- [更新连接器错误](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-error-api.html) **[preview]**
- [更新连接器上次同步统计信息](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-last-sync-api.html) **[preview]**
- [更新连接器状态](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-status-api.html) **[preview]**

:::warning 警告
此功能处于技术预览版，可能会在未来的版本中更改或移除。Elastic 将努力修复任何问题，但技术预览版功能不受正式 GA 功能的支持 SLA 约束。
:::

### 同步作业服务 API

- [连接器同步作业签到](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/check-in-connector-sync-job-api.html) **[preview]**
- [认领连接器同步作业](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/claim-connector-sync-job-api.html) **[preview]**
- [设置连接器同步作业错误](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/set-connector-sync-job-error-api.html) **[preview]**
- [设置连接器同步作业统计信息](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/set-connector-sync-job-stats-api.html) **[preview]**

:::warning 警告
此功能处于技术预览版，可能会在未来的版本中更改或移除。Elastic 将努力修复任何问题，但技术预览版功能不受正式 GA 功能的支持 SLA 约束。
:::


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/connector-apis.html)
