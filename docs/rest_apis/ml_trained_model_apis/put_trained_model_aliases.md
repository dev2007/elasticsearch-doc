# 创建或更新训练模型别名 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

创建或更新训练模型别名。

训练模型别名是用于引用单个训练模型的逻辑名称。

## 请求

```bash
PUT _ml/trained_models/<model_id>/model_aliases/<model_alias>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

你可以使用别名代替训练模型标识符，使引用模型更加容易。例如，你可以在推理聚合和处理器中使用别名。

别名必须唯一，且只能引用单个训练模型。但是，每个训练模型可以有多个别名。

API 限制：

- 不允许更新别名使其引用使用不同类型数据帧分析的不同训练模型 ID。例如，如果你有一个用于回归分析的训练模型和一个用于分类分析的训练模型，不能将别名从一种类型的训练模型重新分配到另一种类型。
- 不能在 PyTorch 模型和数据帧分析模型之间更新别名。
- 不能将别名从已部署的 PyTorch 模型更新为当前未部署的模型。

如果使用此 API 更新别名，且新旧训练模型之间的共同输入字段非常少，API 返回警告。

## 路径参数

- `model_alias`

  （必需，字符串）要创建或更新的别名。此值不能以数字结尾。

- `model_id`

  （必需，字符串）别名引用的训练模型的标识符。

## 查询参数

- `reassign`

  （可选，布尔值）指定当别名已分配给不同的训练模型时是否将其重新分配给指定的训练模型。如果别名已分配且此参数为 `false`，API 返回错误。默认为 `false`。

## 示例

### 创建训练模型别名

以下示例展示如何为训练模型（`flight-delay-prediction-1574775339910`）创建别名（`flight_delay_model`）：

```bash
PUT _ml/trained_models/flight-delay-prediction-1574775339910/model_aliases/flight_delay_model
```

### 更新训练模型别名

以下示例展示如何将别名（`flight_delay_model`）重新分配给不同的训练模型（`flight-delay-prediction-1580004349800`）：

```bash
PUT _ml/trained_models/flight-delay-prediction-1580004349800/model_aliases/flight_delay_model?reassign=true
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-trained-models-aliases.html)
