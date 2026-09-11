# 删除训练模型别名 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

删除一个训练模型别名。

## 请求

```bash
DELETE _ml/trained_models/<model_id>/model_aliases/<model_alias>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

此 API 删除引用训练模型的已存在模型别名。

如果模型别名不存在或引用的模型与 `model_id` 标识的模型不同，此 API 返回错误。

## 路径参数

- `model_alias`

  （必需，字符串）要删除的模型别名。

- `model_id`

  （必需，字符串）模型别名引用的训练模型 ID。

## 示例

以下示例删除训练模型（`flight-delay-prediction-1574775339910`）的模型别名（`flight_delay_model`）：

```bash
DELETE _ml/trained_models/flight-delay-prediction-1574775339910/model_aliases/flight_delay_model
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-trained-models-aliases.html)
