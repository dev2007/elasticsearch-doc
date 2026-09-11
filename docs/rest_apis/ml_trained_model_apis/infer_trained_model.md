# 推理训练模型 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

评估训练模型。模型可以是由数据帧分析训练或导入的任何监督模型。

对于启用了缓存的模型部署，结果可能直接从推理缓存中返回。

## 请求

```bash
POST _ml/trained_models/<model_id>/_infer
```

```bash
POST _ml/trained_models/<deployment_id>/_infer
```

## 路径参数

- `<model_id>`

  （可选，字符串）训练模型或模型别名的唯一标识符。如果指定 `model_id` 且模型有多个部署，将使用随机部署。如果 `model_id` 匹配某个部署的 ID，则使用该部署。

- `<deployment_id>`

  （可选，字符串）模型部署的唯一标识符。

## 查询参数

- `timeout`

  （可选，时间值）控制等待推理结果的时间。默认为 10 秒。

## 请求体

- `docs`

  （必需，数组）传递给模型进行推理的对象数组。对象应包含与配置的训练模型输入匹配的字段。对于 NLP 模型，字段名称通常为 `text_field`。此属性中指定的每个推理输入字段必须是单个字符串而非字符串数组。

- `inference_config`

  （可选，对象）推理的默认配置。可以是：`regression`、`classification`、`fill_mask`、`ner`、`question_answering`、`text_classification`、`text_embedding`、`text_similarity` 或 `zero_shot_classification`。如果为 `regression` 或 `classification`，必须匹配底层 `definition.trained_model` 的 `target_type`。如果为 NLP 任务，`model_type` 必须为 `pytorch`。如果未指定，使用创建模型时的 `inference_config`。

  有关每种推理配置的属性，请参阅[创建训练模型 API](./put_trained_models) 的 `inference_config` 部分。

  **各任务特有属性：**

  - `classification`：`num_top_classes`（默认 0）、`num_top_feature_importance_values`（默认 0）、`prediction_field_type`（`string`/`number`/`boolean`）、`results_field`（默认 `predicted_value`）、`top_classes_results_field`（默认 `top_classes`）。
  - `fill_mask`：`num_top_classes`（默认 0）、`results_field`、`tokenization`。
  - `ner`：`results_field`、`tokenization`。NER 是标记分类的特殊情况，要求 IOB 格式的分类标签。仅支持 person、organization、location 和 miscellaneous。
  - `pass_through`：`results_field`、`tokenization`。用于调试，返回原始池化层结果，无后处理。
  - `question_answering`：`max_answer_length`（默认 15）、`num_top_classes`（默认 0）、`question`（必需，字符串）、`results_field`、`tokenization`。推荐设置 `max_sequence_length` 为 386、`span` 为 128、`truncate` 为 `none`。
  - `regression`：`num_top_feature_importance_values`（默认 0）、`results_field`（默认 `predicted_value`）。
  - `text_classification`：`classification_labels`、`num_top_classes`（默认 -1，即所有类）、`results_field`、`tokenization`。
  - `text_embedding`：`results_field`、`tokenization`。
  - `text_similarity`：`span_score_combination_function`（默认 `max`，可选 `mean`）、`text`（必需，字符串，比较文本）、`tokenization`。
  - `zero_shot_classification`：`labels`（可选，数组）、`multi_label`（可选，布尔值，默认 `false`）、`results_field`、`tokenization`。

## 分词属性

`tokenization` 对象指示要执行的分词和期望的设置。默认分词配置为 `bert`。有效分词值：

- `bert`：用于 BERT 风格模型
- `deberta_v2`：用于 DeBERTa v2 和 v3 风格模型
- `mpnet`：用于 MPNet 风格模型
- `roberta`：用于 RoBERTa 风格和 BART 风格模型
- `xlm_roberta`：用于 XLMRoBERTa 风格模型（技术预览）
- `bert_ja`：用于日语训练的 BERT 风格模型（技术预览）

每种分词器的属性：

- `truncate`（可选，字符串）指示 token 超过 `max_sequence_length` 时如何截断。默认为 `first`。可选值：`none`（不截断，返回错误）、`first`（仅截断第一序列）、`second`（仅截断第二序列）、`balanced`（仅 `deberta_v2`，平衡截断两个序列）。对于 `zero_shot_classification`，假设序列始终是第二序列，因此不要使用 `second`。
- `span`（可选，整数，`question_answering`、`text_classification`、`text_embedding`、`text_similarity` 支持）当 `truncate` 为 `none` 时，可将较长文本序列分区进行推理。值指示每个子序列之间重叠的 token 数。默认为 -1，表示不进行窗口化或跨度。
- `with_special_tokens`（可选，布尔值，仅 `text_similarity` 的 `bert`、`deberta_v2`、`bert_ja` 支持）是否使用特殊 token 分词。

## 示例

### 语言识别

```json
POST _ml/trained_models/lang_ident_model_1/_infer
{
  "docs":[{"text": "The fool doth think he is wise, but the wise man knows himself to be a fool."}]
}
```

```json
{
  "inference_results": [
    {
      "predicted_value": "en",
      "prediction_probability": 0.9999658805366392,
      "prediction_score": 0.9999658805366392
    }
  ]
}
```

### 文本分类

```json
POST _ml/trained_models/model2/_infer
{
  "docs": [{"text_field": "The movie was awesome!!"}]
}
```

```json
{
  "inference_results": [{
    "predicted_value": "POSITIVE",
    "prediction_probability": 0.9998667964092964
  }]
}
```

### 命名实体识别（NER）

```json
POST _ml/trained_models/model2/_infer
{
  "docs": [{"text_field": "Hi my name is Josh and I live in Berlin"}]
}
```

```json
{
  "inference_results": [{
    "predicted_value": "Hi my name is [Josh](PER&Josh) and I live in [Berlin](LOC&Berlin)",
    "entities": [
      {
        "entity": "Josh",
        "class_name": "PER",
        "class_probability": 0.9977303419824,
        "start_pos": 14,
        "end_pos": 18
      },
      {
        "entity": "Berlin",
        "class_name": "LOC",
        "class_probability": 0.9992474323902818,
        "start_pos": 33,
        "end_pos": 39
      }
    ]
  }]
}
```

### 零样本分类

零样本分类模型需要额外配置定义类标签：

```json
POST _ml/trained_models/model2/_infer
{
  "docs": [{"text_field": "This is a very happy person"}],
  "inference_config": {
    "zero_shot_classification": {
      "labels": ["glad", "sad", "bad", "rad"],
      "multi_label": false
    }
  }
}
```

API 返回预测标签和置信度，以及顶级类别：

```json
{
  "inference_results": [{
    "predicted_value": "glad",
    "top_classes": [
      {"class_name": "glad", "class_probability": 0.8061155063386439},
      {"class_name": "rad", "class_probability": 0.18218006158387956},
      {"class_name": "bad", "class_probability": 0.006325615787634201},
      {"class_name": "sad", "class_probability": 0.0053788162898424545}
    ],
    "prediction_probability": 0.8061155063386439
  }]
}
```

### 问答

问答模型需要额外配置定义要回答的问题：

```json
POST _ml/trained_models/model2/_infer
{
  "docs": [{"text_field": "<long text to extract answer>"}],
  "inference_config": {
    "question_answering": {
      "question": "<question to be answered>"
    }
  }
}
```

API 返回类似以下响应：

```json
{
  "predicted_value": "<string subsection of the text that is the answer>",
  "start_offset": "<character offset in document to start>",
  "end_offset": "<character offset end of the answer>",
  "prediction_probability": "<prediction score>"
}
```

### 文本相似度

文本相似度模型需要至少两个文本序列进行比较：

```json
POST _ml/trained_models/cross-encoder__ms-marco-tinybert-l-2-v2/_infer
{
  "docs": [
    {"text_field": "Berlin has a population of 3,520,031 registered inhabitants in an area of 891.82 square kilometers."},
    {"text_field": "New York City is famous for the Metropolitan Museum of Art."}
  ],
  "inference_config": {
    "text_similarity": {
      "text": "How many people live in Berlin?"
    }
  }
}
```

响应包含与 `text_similarity.text` 字段中提供的文本比较的每个字符串的预测：

```json
{
  "inference_results": [
    {"predicted_value": 7.235751628875732},
    {"predicted_value": -11.562295913696289}
  ]
}
```

### 覆盖分词截断选项

调用 API 时可以覆盖分词 `truncate` 选项：

```json
POST _ml/trained_models/model2/_infer
{
  "docs": [{"text_field": "The Amazon rainforest covers most of the Amazon basin in South America"}],
  "inference_config": {
    "ner": {
      "tokenization": {
        "bert": {
          "truncate": "first"
        }
      }
    }
  }
}
```

当输入因模型的 `max_sequence_length` 限制被截断时，响应中出现 `is_truncated` 字段：

```json
{
  "inference_results": [{
    "predicted_value": "The [Amazon](LOC&Amazon) rainforest covers most of the [Amazon](LOC&Amazon) basin in [South America](LOC&South+America)",
    "entities": [...],
    "is_truncated": true
  }]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-trained-model.html)
