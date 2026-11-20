# Inference 处理器

使用预训练的数据帧分析模型或为自然语言处理任务部署的模型，对管道中正在摄取的数据进行推理。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `model_id` | 是 | - | （字符串）推理 ID、模型部署 ID、训练模型 ID 或别名。 |
| `input_output` | 否 | - | （列表）用于推理的输入字段和存放推理结果的输出（目标）字段。此选项与 `target_field` 和 `field_map` 选项不兼容。 |
| `target_field` | 否 | `ml.inference.<processor_tag>` | （字符串）添加到传入文档、用于包含结果对象的字段。 |
| `field_map` | 否 | 如果已定义，则为模型的默认字段映射 | （对象）将文档字段名映射到模型的已知字段名。此映射优先于模型配置中提供的任何默认映射。 |
| `inference_config` | 否 | 模型中定义的默认设置 | （对象）包含推理类型及其选项。 |
| `ignore_missing` | 否 | `false` | （布尔值）如果为 `true`，且 `input_output` 中定义的任何输入字段缺失，则静默忽略这些缺失字段；否则缺失字段会导致失败。仅在使用 `input_output` 配置显式列出输入字段时适用。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

- 不能将 `input_output` 字段与 `target_field` 和 `field_map` 字段一起使用。对于 NLP 模型，使用 `input_output` 选项。对于数据帧分析模型，使用 `target_field` 和 `field_map` 选项。
- 每个推理输入字段必须是单个字符串，不能是字符串数组。
- `input_field` 按原样处理，在推理运行时忽略任何[索引映射](/mapping/)的[分析器](/text_analysis/analysis)。

## 配置输入和输出字段

选择 `content` 字段进行推理，并将结果写入 `content_embedding`。

如果指定的 `output_field` 已存在于摄取文档中，它不会被覆盖。推理结果将追加到 `output_field` 中的现有字段，这可能导致字段重复和潜在错误。为避免这种情况，请使用与任何现有字段不冲突的唯一 `output_field` 字段名。

```json
{
  "inference": {
    "model_id": "model_deployment_for_inference",
    "input_output": [
      {"input_field": "content", "output_field": "content_embedding"}
    ]
  }
}
```

### 配置多个输入

`content` 和 `title` 字段将从传入文档中读取并发送到模型进行推理。推理输出分别写入 `content_embedding` 和 `title_embedding`。

```json
{
  "inference": {
    "model_id": "model_deployment_for_inference",
    "input_output": [
      {"input_field": "content", "output_field": "content_embedding"},
      {"input_field": "title", "output_field": "title_embedding"}
    ]
  }
}
```

使用 `input_output` 选择输入字段与 `target_field` 和 `field_map` 选项不兼容。

数据帧分析模型必须使用 `target_field` 指定结果写入的根位置，并可选地使用 `field_map` 将输入文档中的字段名映射到模型输入字段。

```json
{
  "inference": {
    "model_id": "model_deployment_for_inference",
    "target_field": "FlightDelayMin_prediction_infer",
    "field_map": {"your_field": "my_field"},
    "inference_config": {"regression": {}}
  }
}
```

## 分类配置选项

推理的分类配置。

- `num_top_classes`

  （可选，整数）指定要返回的前几个类预测的数量。默认为 0。

- `num_top_feature_importance_values`

  （可选，整数）指定每个文档的[特性重要性](https://www.elastic.co/guide/en/machine-learning/8.18/ml-feature-importance.html)值的最大数量。默认为 0，表示不进行特性重要性计算。

- `results_field`

  （可选，字符串）添加到传入文档、用于包含推理预测的字段。默认为训练该模型的数据帧分析作业的 `results_field` 值，该值默认为 `<dependent_variable>_prediction`。

- `top_classes_results_field`

  （可选，字符串）指定写入前几个类的字段。默认为 `top_classes`。

- `prediction_field_type`

  （可选，字符串）指定要写入的预测字段的类型。有效值为：`string`、`number`、`boolean`。提供 `boolean` 时，`1.0` 被转换为 `true`，`0.0` 转换为 `false`。

- `tokenization`

  （可选，对象）指示要执行的标记化及所需的设置。默认标记化配置为 `bert`。有效的标记化值有：

  - `bert`：用于 BERT 风格的模型
  - `deberta_v2`：用于 DeBERTa v2 和 v3 风格的模型
  - `mpnet`：用于 MPNet 风格的模型
  - `roberta`：用于 RoBERTa 风格和 BART 风格的模型
  - `xlm_roberta`：用于 XLMRoBERTa 风格的模型 [~~技术预览~~]
  - `bert_ja`：用于为日语训练的 BERT 风格模型 [~~技术预览~~]

  `tokenization` 的属性：

  - `bert`

    （可选，对象）执行 BERT 风格的标记化，使用所包含的设置。

    `bert` 的属性：

    - `truncate`

      （可选，字符串）指示当标记超过 `max_sequence_length` 时如何截断。默认值为 `first`。

      - `none`：不进行截断；推理请求会收到错误。
      - `first`：仅截断第一个序列。
      - `second`：仅截断第二个序列。如果只有一个序列，则截断该序列。

      对于 `zero_shot_classification`，假设序列始终是第二个序列。因此在这种情况下不要使用 `second`。

  - `deberta_v2`

    （可选，对象）执行 DeBERTa 风格的标记化，使用所包含的设置。

    `deberta_v2` 的属性：

    - `truncate`

      （可选，字符串）指示当标记超过 `max_sequence_length` 时如何截断。默认值为 `first`。

      - `balanced`：第一个和第二个序列中的一个或两者都可能被截断，以平衡两个序列中包含的标记。
      - `none`：不进行截断；推理请求会收到错误。
      - `first`：仅截断第一个序列。
      - `second`：仅截断第二个序列。如果只有一个序列，则截断该序列。

  - `roberta`

    （可选，对象）执行 RoBERTa 风格的标记化，使用所包含的设置。`truncate` 属性与 `bert` 相同。

  - `mpnet`

    （可选，对象）执行 MPNet 风格的标记化，使用所包含的设置。`truncate` 属性与 `bert` 相同。

## Fill mask 配置选项

- `num_top_classes`

  （可选，整数）指定要返回的前几个类预测的数量。默认为 0。

- `results_field`

  （可选，字符串）添加到传入文档、用于包含推理预测的字段。默认为训练该模型的数据帧分析作业的 `results_field` 值，该值默认为 `<dependent_variable>_prediction`。

- `tokenization`

  （可选，对象）指示要执行的标记化及所需的设置。有效值及属性与上文[分类配置选项](#分类配置选项)中的 `tokenization` 相同（`bert`、`deberta_v2`、`mpnet`、`roberta`、`xlm_roberta` [~~技术预览~~]、`bert_ja` [~~技术预览~~]）。

## NER 配置选项

- `results_field`

  （可选，字符串）添加到传入文档、用于包含推理预测的字段。默认为训练该模型的数据帧分析作业的 `results_field` 值，该值默认为 `<dependent_variable>_prediction`。

- `tokenization`

  （可选，对象）指示要执行的标记化及所需的设置。有效值及属性与上文[分类配置选项](#分类配置选项)中的 `tokenization` 相同。

## 回归配置选项

推理的回归配置。

- `results_field`

  （可选，字符串）添加到传入文档、用于包含推理预测的字段。默认为训练该模型的数据帧分析作业的 `results_field` 值，该值默认为 `<dependent_variable>_prediction`。

- `num_top_feature_importance_values`

  （可选，整数）指定每个文档的[特性重要性](https://www.elastic.co/guide/en/machine-learning/8.18/ml-feature-importance.html)值的最大数量。默认为 0，表示不进行特性重要性计算。

## 文本分类配置选项

- `classification_labels`

  （可选，字符串）分类标签数组。

- `num_top_classes`

  （可选，整数）指定要返回的前几个类预测的数量。默认为 0。

- `results_field`

  （可选，字符串）添加到传入文档、用于包含推理预测的字段。默认为训练该模型的数据帧分析作业的 `results_field` 值，该值默认为 `<dependent_variable>_prediction`。

- `tokenization`

  （可选，对象）指示要执行的标记化及所需的设置。有效值及属性与上文[分类配置选项](#分类配置选项)中的 `tokenization` 相同，但 `bert` 额外支持 `span` 属性：

  - `span`

    （可选，整数）当 `truncate` 为 `none` 时，你可以为较长的文本序列分区以进行推理。该值表示每个子序列之间有多少标记重叠。

    默认值为 `-1`，表示不发生窗口化或跨距。

    当你的典型输入仅略大于 `max_sequence_length` 时，最好直接截断；因为第二个子序列中的信息非常少。

## 文本嵌入配置选项

- `results_field`

  （可选，字符串）添加到传入文档、用于包含推理预测的字段。默认为训练该模型的数据帧分析作业的 `results_field` 值，该值默认为 `<dependent_variable>_prediction`。

- `tokenization`

  （可选，对象）指示要执行的标记化及所需的设置。有效值及属性与上文[分类配置选项](#分类配置选项)中的 `tokenization` 相同（`bert` 额外支持 `span` 属性）。

## 文本扩展配置选项

- `results_field`

  （可选，字符串）添加到传入文档、用于包含推理预测的字段。默认为训练该模型的数据帧分析作业的 `results_field` 值，该值默认为 `<dependent_variable>_prediction`。

- `tokenization`

  （可选，对象）指示要执行的标记化及所需的设置。有效值及属性与上文[分类配置选项](#分类配置选项)中的 `tokenization` 相同（`bert` 和 `deberta_v2` 额外支持 `span` 属性）。

## 文本相似度配置选项

- `text_similarity`

  （可选，对象）文本相似度接受一个输入序列并将其与另一个输入序列进行比较。这通常称为交叉编码。当将文档文本与提供的另一个文本输入进行比较时，此任务对于文档文本排名非常有用。

  `text_similarity` 推理的属性：

  - `span_score_combination_function`

    （可选，字符串）当提供的文本段落长于 `max_sequence_length` 且必须自动拆分以进行多次调用时，标识如何组合得到的相似度得分。仅在 `truncate` 为 `none` 且 `span` 为非负数时适用。默认值为 `max`。可用选项：

    - `max`：返回所有跨距中的最高得分。
    - `mean`：返回所有跨距的平均得分。

  - `tokenization`

    （可选，对象）指示要执行的标记化及所需的设置。`tokenization` 对象的属性参阅 [`tokenization` 的属性](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-trained-models.html#tokenization-properties)。

## 零样本分类配置选项

- `labels`

  （可选，数组）要分类的标签。可以在创建时设置为默认标签，然后在推理期间更新。

- `multi_label`

  （可选，布尔值）指示给定输入是否可能出现多个 `true` 标签。当标注可能与多个输入标签相关的文本时非常有用。默认为 `false`。

- `results_field`

  （可选，字符串）添加到传入文档、用于包含推理预测的字段。默认为训练该模型的数据帧分析作业的 `results_field` 值，该值默认为 `<dependent_variable>_prediction`。

- `tokenization`

  （可选，对象）指示要执行的标记化及所需的设置。有效值及属性与上文[分类配置选项](#分类配置选项)中的 `tokenization` 相同（`bert` 和 `deberta_v2` 额外支持 `span` 属性）。

## Inference 处理器示例

以下配置指定一个 `regression` 推理，结果写入 `target_field` 结果对象中包含的 `my_regression` 字段。`field_map` 配置将源文档中的字段 `original_fieldname` 映射到模型期望的字段。

```json
{
  "inference": {
    "model_id": "my_model_id",
    "field_map": {
      "original_fieldname": "expected_fieldname"
    },
    "inference_config": {
      "regression": {
        "results_field": "my_regression"
      }
    }
  }
}
```

以下配置指定一个 `classification` 推理。报告预测概率的类别数量为 2（`num_top_classes`）。结果写入 `prediction` 字段，前几个类写入 `probabilities` 字段。两个字段都包含在 `target_field` 结果对象中。

```json
{
  "inference": {
    "model_id": "my_model_id",
    "inference_config": {
      "classification": {
        "num_top_classes": 2,
        "results_field": "prediction",
        "top_classes_results_field": "probabilities"
      }
    }
  }
}
```

有关使用自然语言处理训练模型的示例，参阅[将 NLP 推理添加到摄取管道](https://www.elastic.co/guide/en/machine-learning/8.18/ml-nlp-inference.html)。

## 特性重要性对象映射

要充分发挥聚合和搜索[特性重要性](https://www.elastic.co/guide/en/machine-learning/8.18/ml-feature-importance.html)的作用，请更新特性重要性结果字段的索引映射，如下所示：

```json
{
  "ml.inference.feature_importance": {
    "type": "nested",
    "dynamic": true,
    "properties": {
      "feature_name": {"type": "keyword"},
      "importance": {"type": "double"}
    }
  }
}
```

特性重要的映射字段名（在上例中为 `ml.inference.feature_importance`）按以下方式组合：

```text
<ml.inference.target_field>.<inference.tag>.feature_importance
```

- `<ml.inference.target_field>`：默认为 `ml.inference`。
- `<inference.tag>`：如果未在处理器定义中提供，则它不是字段路径的一部分。

例如，如果你在定义中提供标签 `foo`：

```json
{
  "tag": "foo",
  ...
}
```

那么特性重要性值将写入 `ml.inference.foo.feature_importance` 字段。

你还可以按如下方式指定目标字段：

```json
{
  "tag": "foo",
  "target_field": "my_field"
}
```

在这种情况下，特性重要性将在 `my_field.foo.feature_importance` 字段中公开。

## Inference 处理器示例（聊天补全）

以下示例在名为 `query_helper_pipeline` 的推理处理器中使用一个[推理端点](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/inference-apis.html)执行聊天补全任务。该处理器使用为补全任务类型设计的提示词，从自然语言输入生成 Elasticsearch 查询。参阅你所使用的推理服务的[此列表](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-inference-api.html#put-inference-api-desc)，并查看设置具有聊天补全任务类型的端点的相应示例。

```bash
PUT _ingest/pipeline/query_helper_pipeline
{
  "processors": [
    {
      "script": {
        "source": "ctx.prompt = 'Please generate an elasticsearch search query on index `articles_index` for the following natural language query. Dates are in the field `@timestamp`, document types are in the field `type` (options are `news`, `publication`), categories in the field `category` and can be multiple (options are `medicine`, `pharmaceuticals`, `technology`), and document names are in the field `title` which should use a fuzzy match. Ignore fields which cannot be determined from the natural language query context: ' + ctx.content"
      }
    },
    {
      "inference": {
        "model_id": "openai_chat_completions",
        "input_output": {
          "input_field": "prompt",
          "output_field": "query"
        }
      }
    },
    {
      "remove": {
        "field": "prompt"
      }
    }
  ]
}
```

1. `prompt` 字段包含用于补全任务的提示词，使用 [Painless](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/modules-scripting-painless.html) 创建。`+ ctx.content` 将自然语言输入追加到提示词中。
2. 预配置推理端点的 ID，它使用具有 `completion` 任务类型的 [`openai` 服务](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-openai.html)。

以下 API 请求将模拟一个文档流经先前创建的摄取管道：

```bash
POST _ingest/pipeline/query_helper_pipeline/_simulate
{
  "docs": [
    {
      "_source": {
        "content": "artificial intelligence in medicine articles published in the last 12 months"
      }
    }
  ]
}
```

推理处理器创建的提示词中，用于生成 Elasticsearch 查询的自然语言查询。

## 延伸阅读

- [哪份工作最适合你？使用 LLM 和 semantic_text 将简历与工作匹配](https://www.elastic.co/search-labs/blog/openwebcrawler-llms-semantic-text-resume-job-search)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/inference-processor.html)
