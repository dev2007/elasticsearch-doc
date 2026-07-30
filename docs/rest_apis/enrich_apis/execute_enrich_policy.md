# 执行富化策略 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[富化 API](/rest_apis/enrich_apis/enrich_apis)。

::::

执行现有富化策略。使用此 API 为现有富化策略创建富化索引。

富化索引包含策略源索引中的文档。富化索引的关键特征：

- 始终以 `.enrich-*` 开头
- 是**只读的**
- 已被**强制合并**

富化索引应仅由富化处理器或 ES|QL `ENRICH` 命令使用。避免将富化索引用于其他用途。

创建后，你不能更新富化索引或向其索引文档。相反，应更新源索引并再次执行富化策略。这将从更新的源索引创建新的富化索引。之前的富化索引将通过延迟维护作业删除（默认每 15 分钟一次）。

默认情况下，此 API 是**同步的**：在策略执行完成后返回。由于执行策略会执行多项操作，可能需要一段时间才能返回响应，特别是当源索引较大时。这可能导致超时。要防止超时，请将 `wait_for_completion` 参数设置为 `false`。这将在后台异步运行请求并返回一个**任务 ID**，可使用任务管理 API 来管理该请求。

## 请求

```json
PUT /_enrich/policy/<enrich-policy>/_execute
```

```json
POST /_enrich/policy/<enrich-policy>/_execute
```

支持 `PUT` 和 `POST` 两种方法。

## 前置条件

要使用富化策略，你必须拥有：

- 任何使用的索引的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)
- 内置的 `enrich_user` 角色

## 路径参数

- `<enrich-policy>`（必需，字符串）

  要执行的富化策略。

## 查询参数

- `wait_for_completion`（可选，布尔值）

  如果为 `true`，请求将阻塞直到执行完成。如果为 `false`，请求立即返回，执行在后台异步运行。默认为 `true`。

## 示例

```json
PUT /_enrich/policy/my-policy/_execute?wait_for_completion=false
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/execute-enrich-policy-api.html)
