# 创建训练模型定义部分 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

创建训练模型定义的一部分。

## 请求

```bash
PUT _ml/trained_models/<model_id>/definition/<part>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 路径参数

- `<model_id>`

  （必需，字符串）训练模型的唯一标识符。

- `<part>`

  （必需，数字）定义部分编号。加载定义进行推理时，定义部分将按 `part` 编号顺序流式传输。第一部分必须为 0，最后一部分必须为 `total_parts - 1`。

## 请求体

- `definition`

  （必需，字符串）模型的定义部分。必须是 base64 编码的字符串。

- `total_definition_length`

  （必需，数字）未压缩定义的总长度（字节）。非 base64 编码。

- `total_parts`

  （必需，数字）将要上传的总部分数。必须大于 0。

## 示例

以下示例为先前存储的模型配置创建模型定义部分。定义部分存储在由 `location.index.name` 配置的索引中。

`definition` 对象的值在示例中已省略，因为它是一个非常大的 base64 编码字符串。

```json
PUT _ml/trained_models/elastic__distilbert-base-uncased-finetuned-conll03-english/definition/0
{
    "definition": "...",
    "total_definition_length": 265632637,
    "total_parts": 64
}
```

API 返回以下结果：

```json
{
    "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-trained-model-definition-part.html)
