# 清除训练模型部署缓存 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

清除部署分配到的所有节点上的推理缓存。

## 请求

```bash
POST _ml/trained_models/<deployment_id>/deployment/cache/_clear
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

训练模型部署可能启用了推理缓存。当每个分配的节点处理请求时，其响应可能会缓存在该单个节点上。调用此 API 可以清除缓存而无需重启部署。

## 路径参数

- `<deployment_id>`

  （必需，字符串）模型部署的唯一标识符。

## 示例

以下示例清除 `elastic__distilbert-base-uncased-finetuned-conll03-english` 训练模型部署的缓存：

```bash
POST _ml/trained_models/elastic__distilbert-base-uncased-finetuned-conll03-english/deployment/cache/_clear
```

API 返回以下结果：

```json
{
   "cleared": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/clear-trained-model-deployment-cache.html)
