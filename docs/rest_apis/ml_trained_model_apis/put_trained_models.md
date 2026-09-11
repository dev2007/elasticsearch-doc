# 创建训练模型 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

创建一个训练模型。

在 7.8.0 版本中创建的模型与旧版本节点不向后兼容。如果在混合集群环境中，所有节点必须至少为 7.8.0 才能使用 7.8.0 节点存储的模型。

## 请求

```bash
PUT _ml/trained_models/<model_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

创建训练模型 API 使你能够提供非数据帧分析创建的训练模型。

## 路径参数

- `<model_id>`

  （必需，字符串）训练模型的唯一标识符。

## 查询参数

- `defer_definition_decompression`

  （可选，布尔值）如果为 `true` 且提供了 `compressed_definition`，请求将延迟定义解压缩并跳过相关验证。此延迟适用于知道模型字节大小估计且模型有效、不太可能在推理期间失败的系统或用户。

- `wait_for_completion`

  （可选，布尔值）是否在返回前等待所有子操作（如模型下载）完成。默认为 `false`。

## 请求体

- `compressed_definition`

  （必需*，字符串）模型的压缩（GZip 压缩并 Base64 编码）推理定义。如果指定了 `compressed_definition`，则不能指定 `definition`。

- `definition`

  （必需*，对象）模型的推理定义。如果指定了 `definition`，则不能指定 `compressed_definition`。

  `definition` 的属性：

  - `preprocessors`

    （可选，对象）预处理器的集合。参见预处理器示例。

    `preprocessors` 的属性：

    - `frequency_encoding`（对象）定义字段的频率编码。属性：`feature_name`（必需，字符串）、`field`（必需，字符串）、`frequency_map`（必需，对象）、`custom`（可选，布尔值，默认 `false`）。
    - `one_hot_encoding`（对象）定义字段的独热编码映射。属性：`field`（必需，字符串）、`hot_map`（必需，对象）、`custom`（可选，布尔值，默认 `false`）。
    - `target_mean_encoding`（对象）定义字段的目标均值编码。属性：`default_value`（必需，双精度浮点数）、`feature_name`（必需，字符串）、`field`（必需，字符串）、`target_map`（必需，对象）、`custom`（可选，布尔值，默认 `false`）。

    `custom` 属性指示分析作业创建预处理器还是用户提供，影响特征重要性计算。

  - `trained_model`

    （必需，对象）训练模型的定义。

    `trained_model` 的属性：

    - `tree`

      （必需*，对象）二叉决策树的定义。

      `tree` 的属性：

      - `classification_labels`（可选，字符串）分类标签数组（用于分类）。
      - `feature_names`（必需，字符串）树期望的特征，按期望顺序排列。
      - `target_type`（必需，字符串）模型目标类型；`regression` 或 `classification`。
      - `tree_structure`（必需，对象）`tree_node` 对象数组。节点必须按 `tree_node.node_index` 值的顺序排列。

      `tree_node` 的属性：

      - `decision_type`（可选，字符串）指示正值（即何时选择左节点）的决策类型。支持 `lt`、`lte`、`gt`、`gte`。默认为 `lte`。
      - `default_left`（可选，布尔值）指示特征缺失时是否默认到左。默认为 `true`。
      - `leaf_value`（可选，双精度浮点数）节点的叶值（如果是叶节点，即无子节点）。
      - `left_child`（可选，整数）左子节点的索引。
      - `node_index`（整数）当前节点的索引。
      - `right_child`（可选，整数）右子节点的索引。
      - `split_feature`（可选，整数）特征数组中特征值的索引。
      - `split_gain`（可选，双精度浮点数）拆分的信息增益。
      - `threshold`（可选，双精度浮点数）用于比较特征值的决策阈值。

    - `ensemble`

      （可选，对象）集成模型的定义。参见模型示例。

      `ensemble` 的属性：

      - `aggregate_output`（必需，对象）定义如何聚合训练模型输出的聚合输出对象。支持 `weighted_mode`、`weighted_sum`、`logistic_regression` 和 `exponent`。参见聚合输出示例。
        - `logistic_regression`（对象）适用于二分类。将输出乘以权重，求和后传入 sigmoid 函数。属性：`weights`（必需，双精度浮点数）。
        - `weighted_sum`（对象）适用于回归。输入值的加权和。属性：`weights`（必需，双精度浮点数）。
        - `weighted_mode`（对象）适用于回归或分类。输入值的加权投票。属性：`weights`（必需，双精度浮点数）。
        - `exponent`（对象）适用于回归。输入值的加权和传入指数函数。属性：`weights`（必需，双精度浮点数）。
      - `classification_labels`（可选，字符串）分类标签数组。
      - `feature_names`（可选，字符串）集成期望的特征，按期望顺序排列。
      - `target_type`（必需，字符串）模型目标类型；`regression` 或 `classification`。
      - `trained_models`（必需，对象）`trained_model` 对象数组。支持的训练模型为 `tree` 和 `ensemble`。

- `description`

  （可选，字符串）推理训练模型的人类可读描述。

- `estimated_heap_memory_usage_bytes`

  （可选，整数）在 7.16.0 中已弃用。由 `model_size_bytes` 替代。

- `estimated_operations`

  （可选，整数）推理期间使用训练模型的估计操作数。仅在 `defer_definition_decompression` 为 `true` 或未提供模型定义时支持此属性。

- `inference_config`

  （必需，对象）推理的默认配置。可以是：`regression`、`classification`、`fill_mask`、`ner`、`question_answering`、`text_classification`、`text_embedding`、`text_expansion` 或 `zero_shot_classification`。如果为 `regression` 或 `classification`，必须匹配底层 `definition.trained_model` 的 `target_type`。如果为 `fill_mask`、`ner`、`question_answering`、`text_classification`、`text_embedding` 或 `text_expansion`，`model_type` 必须为 `pytorch`。

  `inference_config` 的属性：

  - `classification`（可选，对象）分类推理配置。属性：`num_top_classes`（可选，整数）、`num_top_feature_importance_values`（可选，整数）、`prediction_field_type`（可选，字符串）、`results_field`（可选，字符串，默认 `predicted_value`）、`top_classes_results_field`（可选，字符串，默认 `top_classes`）。
  - `fill_mask`（可选，对象）填充掩码 NLP 任务配置。属性：`num_top_classes`（可选，整数）、`results_field`（可选，字符串）、`tokenization`（可选，对象）。
  - `ner`（可选，对象）命名实体识别（NER）任务配置。属性：`classification_labels`（可选，字符串）、`results_field`（可选，字符串）、`tokenization`（可选，对象）。
  - `pass_through`（可选，对象）直通任务配置，用于调试，返回原始池化层结果。属性：`results_field`（可选，字符串）、`tokenization`（可选，对象）。
  - `question_answering`（可选，对象）问答 NLP 任务配置。属性：`max_answer_length`（可选，整数，默认 15）、`results_field`（可选，字符串）、`tokenization`（可选，对象）。
  - `regression`（可选，对象）回归推理配置。属性：`num_top_feature_importance_values`（可选，整数）、`results_field`（可选，字符串，默认 `predicted_value`）。
  - `text_classification`（可选，对象）文本分类任务配置。属性：`classification_labels`（可选，字符串）、`num_top_classes`（可选，整数）、`results_field`（可选，字符串）、`tokenization`（可选，对象）。
  - `text_embedding`（可选，对象）文本嵌入配置，将输入序列转换为数字向量。属性：`embedding_size`（可选，整数）、`results_field`（可选，字符串）、`tokenization`（可选，对象）。
  - `text_expansion`（可选，对象）文本扩展配置，与稀疏嵌入模型配合，将输入转换为加权 token 向量。属性：`results_field`（可选，字符串）、`tokenization`（可选，对象）。
  - `text_similarity`（可选，对象）文本相似度配置，将输入序列与另一输入序列比较（交叉编码）。属性：`span_score_combination_function`（可选，字符串，默认 `max`）、`tokenization`（可选，对象）。
  - `zero_shot_classification`（可选，对象）零样本分类配置，允许在无预定义标签的情况下进行文本分类。属性：`classification_labels`（必需，数组，必须为 `["entailment", "neutral", "contradiction"]`）、`hypothesis_template`（可选，字符串）、`labels`（可选，数组）、`multi_label`（可选，布尔值，默认 `false`）、`results_field`（可选，字符串）、`tokenization`（可选，对象）。

- `input`

  （必需，对象）模型定义的输入字段名称。

  `input` 的属性：

  - `field_names`（必需，字符串）输入字段名称数组。

- `location`

  （可选，对象）模型定义的位置。如果未指定 `definition` 或 `compressed_definition`，则需要 `location`。

  `location` 的属性：

  - `index`（必需，对象）指示模型定义存储在索引中。此对象必须为空，因为存储模型定义的索引是自动配置的。

- `metadata`

  （可选，对象）包含模型元数据的对象映射。

- `model_size_bytes`

  （可选，整数）在内存中保持训练模型的估计内存使用量（字节）。仅在 `defer_definition_decompression` 为 `true` 或未提供模型定义时支持此属性。

- `model_type`

  （可选，字符串）创建的模型类型。默认为 `tree_ensemble`。可用类型：

  - `tree_ensemble`：模型定义为决策树集成模型。
  - `lang_ident`：为语言识别模型保留的特殊类型。
  - `pytorch`：存储的定义为 PyTorch（特别是 TorchScript）模型。目前仅支持 NLP 模型。有关更多信息，请参阅自然语言处理。

- `platform_architecture`

  （可选，字符串）如果模型仅在一个平台上工作（因为针对特定处理器架构和操作系统组合进行了深度优化），此字段指定平台。格式必须匹配 Elasticsearch 使用的平台标识符：`linux-x86_64`、`linux-aarch64`、`darwin-x86_64`、`darwin-aarch64` 或 `windows-x86_64`。对于可移植模型，留空。

- `prefix_strings`

  （可选，对象）某些 NLP 模型训练时需要在评估前对输入文本应用前缀字符串。前缀可能因意图而异。

  `prefix_strings` 的属性：

  - `search`（可选，字符串）为搜索查询请求前缀到输入文本的字符串。
  - `ingest`（可选，字符串）为摄取时使用推理摄取处理器的请求前缀到输入文本的字符串。

- `tags`

  （可选，字符串）用于组织模型的标签数组。

## 分词属性

`tokenization` 对象指示要执行的分词和期望的设置。默认分词配置为 `bert`。有效分词值：

- `bert`：用于 BERT 风格模型
- `deberta_v2`：用于 DeBERTa v2 和 v3 风格模型
- `mpnet`：用于 MPNet 风格模型
- `roberta`：用于 RoBERTa 风格和 BART 风格模型
- `xlm_roberta`：用于 XLMRoBERTa 风格模型（技术预览）
- `bert_ja`：用于日语训练的 BERT 风格模型（技术预览）

每种分词器的属性：

- `do_lower_case`（可选，布尔值）指定分词时是否将文本序列转为小写。
- `add_prefix_space`（可选，布尔值，仅 `roberta`）指定是否在分词输入前添加空格。
- `max_sequence_length`（可选，整数）指定分词器允许输出的最大 token 数量。
- `span`（可选，整数）当 `truncate` 为 `none` 时，可将较长文本序列分区进行推理。值指示每个子序列之间重叠的 token 数。默认为 -1，表示不进行窗口化或跨度。
- `truncate`（可选，字符串）指示 token 超过 `max_sequence_length` 时如何截断。默认为 `first`。可选值：`none`（不截断，返回错误）、`first`（仅截断第一序列）、`second`（仅截断第二序列）、`balanced`（仅 `deberta_v2`，平衡截断两个序列）。
- `with_special_tokens`（可选，布尔值）是否使用特殊 token 分词。例如 BERT 风格包含 `[CLS]` 和 `[SEP]`；RoBERTa/MPNet 风格包含 `<s>` 和 `</s>`。

## 示例

### 预处理器示例

以下示例展示 `frequency_encoding` 预处理器对象：

```json
{
   "frequency_encoding":{
      "field":"FlightDelayType",
      "feature_name":"FlightDelayType_frequency",
      "frequency_map":{
         "Carrier Delay":0.6007414737092798,
         "NAS Delay":0.6007414737092798,
         "Weather Delay":0.024573576178086153,
         "Security Delay":0.02476631010889467,
         "No Delay":0.6007414737092798,
         "Late Aircraft Delay":0.6007414737092798
      }
   }
}
```

### 模型示例

以下示例展示 `trained_model` 对象（决策树）：

```json
{
   "tree":{
      "feature_names":[
         "DistanceKilometers",
         "FlightTimeMin",
         "FlightDelayType_NAS Delay",
         "Origin_targetmean",
         "DestRegion_targetmean",
         "DestCityName_targetmean",
         "OriginAirportID_targetmean",
         "OriginCityName_frequency",
         "DistanceMiles",
         "FlightDelayType_Late Aircraft Delay"
      ],
      "tree_structure":[
         {
            "decision_type":"lt",
            "threshold":9069.33437193022,
            "split_feature":0,
            "split_gain":4112.094574306927,
            "node_index":0,
            "default_left":true,
            "left_child":1,
            "right_child":2
         },
         ...
         {
            "node_index":9,
            "leaf_value":-27.68987349695448
         },
         ...
      ],
      "target_type":"regression"
   }
}
```

### 聚合输出示例

以下示例展示 `logistic_regression` 聚合输出对象：

```json
"aggregate_output" : {
  "logistic_regression" : {
    "weights" : [2.0, 1.0, .5, -1.0, 5.0, 1.0, 1.0]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-trained-models.html)
