# 停止训练模型部署 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

停止一个训练模型部署。

## 请求

```bash
POST _ml/trained_models/<deployment_id>/deployment/_stop
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

部署仅对于具有 PyTorch `model_type` 的训练模型是必需的。

## 路径参数

- `<deployment_id>`

  （必需，字符串）模型部署的唯一标识符。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的部署。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `force`

  （可选，布尔值）如果为 `true`，即使部署或其某个模型别名被摄取管道引用，也会停止部署。在重新启动模型部署之前，你无法使用这些管道。

- `finish_pending_work`

  （可选，布尔值）如果为 `true`，部署将在任何排队工作完成后才停止。默认为 `false`。

## 示例

以下示例停止 `my_model_for_search` 部署：

```bash
POST _ml/trained_models/my_model_for_search/deployment/_stop
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/stop-trained-model-deployment.html)
