# 获取训练模型 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

检索训练模型的配置信息。

## 请求

```bash
GET _ml/trained_models/
```

```bash
GET _ml/trained_models/<model_id>
```

```bash
GET _ml/trained_models/_all
```

```bash
GET _ml/trained_models/<model_id1>,<model_id2>
```

```bash
GET _ml/trained_models/<model_id_pattern*>
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 路径参数

- `<model_id>`

  （可选，字符串）训练模型或模型别名的唯一标识符。

  你可以通过使用逗号分隔的模型 ID 列表或通配符表达式在单个 API 请求中获取多个训练模型的信息。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的模型。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `decompress_definition`

  （可选，布尔值）指定包含的模型定义是否以 JSON 映射返回（`true`）还是自定义压缩格式（`false`）。默认为 `true`。

- `exclude_generated`

  （可选，布尔值）指示是否在检索时从配置中移除某些字段。这使配置处于可接受的格式，便于检索后添加到另一个集群。默认为 `false`。

- `from`

  （可选，整数）跳过指定数量的模型。默认为 0。

- `include`

  （可选，字符串）要在响应中包含的可选字段的逗号分隔字符串。默认为空，表示不包含可选字段。有效选项：

  - `definition`：包含模型定义。
  - `feature_importance_baseline`：包含特征重要性值的基线。
  - `hyperparameters`：包含有关用于训练模型的超参数信息。
  - `total_feature_importance`：包含训练数据集的总特征重要性。
  - `definition_status`：包含 `fully_defined` 字段，指示完整的模型定义是否存在。

- `size`

  （可选，整数）指定获取的模型的最大数量。默认为 100。

- `tags`

  （可选，字符串）标签的逗号分隔字符串。训练模型可以有多个标签或没有标签。提供时，仅返回包含所有提供标签的训练模型。

## 响应体

- `trained_model_configs`

  （数组）训练模型资源数组，按 `model_id` 值升序排列。

  训练模型资源的属性：

  - `created_by`（字符串）训练模型的创建者。
  - `create_time`（时间单位）训练模型创建的时间。
  - `default_field_map`（对象）包含推理时使用的默认字段映射的字符串对象。例如，数据帧分析可能在特定多字段 `foo.keyword` 上训练模型，分析作业将提供 `"foo": "foo.keyword"` 的默认字段映射条目。推理配置中描述的任何字段映射优先于此值。
  - `description`（字符串）训练模型的自由文本描述。
  - `model_size_bytes`（整数）在内存中保持训练模型的估计大小（字节）。仅适用于数据帧分析训练模型。
  - `estimated_operations`（整数）使用训练模型的估计操作数。
  - `inference_config`（对象）推理的默认配置。可以是 `regression`、`classification`、`fill_mask`、`ner`、`pass_through`、`question_answering`、`text_classification`、`text_embedding`、`text_expansion`、`text_similarity` 或 `zero_shot_classification`。必须匹配底层 `definition.trained_model` 的 `target_type`。有关每种推理配置的属性，请参阅[创建训练模型 API](./put_trained_models) 的 `inference_config` 部分。
  - `input`（对象）模型定义的输入字段名称。属性：`field_names`（字符串）输入字段名称数组。
  - `fully_defined`（布尔值）如果存在完整的模型定义则为 `true`。仅当请求中指定了 `include=definition_status` 时存在。
  - `location`（可选，对象）模型定义的位置。属性：`index`（必需，对象）指示模型定义存储在索引中。
  - `license_level`（字符串）训练模型的许可证级别。
  - `metadata`（对象）包含训练模型元数据的对象。例如，数据帧分析创建的模型包含 `analysis_config` 和 `input` 对象。
    - `feature_importance_baseline`（对象）包含特征重要性值基线的对象。回归分析为单个值，分类分析为每个类别一个值。
    - `hyperparameters`（数组）超参数优化期间优化和用户指定的可用超参数列表。属性：`absolute_importance`、`max_trees`、`name`、`relative_importance`、`supplied`、`value`。
    - `total_feature_importance`（数组）训练数据集中每个特征的总特征重要性数组。属性：`feature_name`、`importance`（含 `mean_magnitude`、`max`、`min`）、`classes`（含 `class_name`、`importance`）。
  - `model_id`（字符串）训练模型的标识符。
  - `model_type`（可选，字符串）创建的模型类型。可能值：`tree_ensemble`、`lang_ident`、`pytorch`。
  - `tags`（字符串）标签的逗号分隔字符串。
  - `version`（字符串）创建训练模型时的机器学习配置版本号。从 Elasticsearch 8.10.0 开始，使用新的版本号。

## 响应码

- 400：如果 `include_model_definition` 为 `true`，此码表示有多个模型匹配 ID 模式。
- 404（缺少资源）：如果 `allow_no_match` 为 `false`，此码表示没有与请求匹配的资源或只有部分匹配。

## 示例

以下示例获取所有训练模型的配置信息：

```bash
GET _ml/trained_models/
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-trained-models.html)
