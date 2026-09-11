# 创建训练模型词表 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

创建训练模型词表。仅支持自然语言处理（NLP）模型。

## 请求

```bash
PUT _ml/trained_models/<model_id>/vocabulary
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

词表存储在索引中，如训练模型定义的 `inference_config.*.vocabulary` 中所述。

## 路径参数

- `<model_id>`

  （必需，字符串）训练模型的唯一标识符。

## 请求体

- `vocabulary`

  （必需，数组）模型词表。不能为空。

- `merges`

  （可选，数组）字节对编码中使用的模型合并。合并必须是空格分隔的子 token 对，按优先级顺序排列。例如：`["f o", "fo o"]`。RoBERTa 和 BART 风格模型必须提供。

- `scores`

  （可选，数组）句子分词使用的词表值分数。长度必须与 `vocabulary` 相同。XLMRoberta 和 T5 等 unigram 句子分词模型必需。

## 示例

以下示例为先前存储的训练模型配置创建词表：

```json
PUT _ml/trained_models/elastic__distilbert-base-uncased-finetuned-conll03-english/vocabulary
{
  "vocabulary": [
    "[PAD]",
    "[unused0]",
    ...
  ]
}
```

API 返回以下结果：

```json
{
    "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-trained-model-vocabulary.html)
