# 删除训练模型 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

删除一个已存在的训练推理模型。

## 请求

```bash
DELETE _ml/trained_models/<model_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 路径参数

- `<model_id>`

  （可选，字符串）训练模型的唯一标识符。

## 查询参数

- `force`

  （可选，布尔值）用于强制删除被摄取管道引用或已启动部署的训练模型。

## 响应码

- 409：此状态码表示训练模型被摄取管道引用，无法删除。

## 示例

以下示例删除 `regression-job-one-1574775307356` 训练模型：

```bash
DELETE _ml/trained_models/regression-job-one-1574775307356
```

API 返回以下结果：

```json
{
  "acknowledged" : true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-trained-models.html)
