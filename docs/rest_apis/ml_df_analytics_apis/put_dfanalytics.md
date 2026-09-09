# 创建数据帧分析作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习数据帧分析 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-dfa)。

:::::

实例化一个数据帧分析作业。

## 请求

```bash
PUT _ml/data_frame/analytics/<data_frame_analytics_id>
```

## 前置条件

- 需要以下权限：
  - 集群：`manage_ml`（`machine_learning_admin` 内置角色授予此权限）— [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)
  - 源索引：`read`、`view_index_metadata` — [权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)
  - 目标索引：`read`、`create_index`、`manage` 和 `index`

- 数据帧分析作业会记住创建它的用户在创建时拥有的角色。当你启动作业时，它使用这些角色执行分析。如果提供了辅助授权头，则使用这些凭据。

## 描述

此 API 创建一个数据帧分析作业，对源索引执行分析并将结果存储在目标索引中。

如果目标索引不存在，启动作业时会自动创建。请参阅[启动数据帧分析作业 API](./start_dfanalytics)。

如果只提供回归或分类参数的子集，将进行超参数优化，为每个未定义的参数确定值。

## 路径参数

- `<data_frame_analytics_id>`

  （必需，字符串）数据帧分析作业的标识符。此标识符可以包含小写字母数字字符（a-z 和 0-9）、短横线和下划线。必须以字母数字字符开头和结尾。

## 请求体

- `allow_lazy_start`

  （可选，布尔值）指定此作业是否可以在没有足够的机器学习节点容量立即分配到节点时启动。默认为 `false`；如果无法立即找到有容量运行作业的机器学习节点，API 返回错误。这也受集群范围的 `xpack.ml.max_lazy_ml_nodes` 设置限制。如果设置为 `true`，API 不会返回错误，作业在启动状态等待，直到有足够的机器学习节点容量可用。

- `analysis`

  （必需，对象）分析配置，包含执行以下分析类型之一所需的信息：分类、离群点检测或回归。

  `analysis` 的属性：

  - `classification`

    （必需*，对象）执行分类所需的配置信息。

    高级参数用于微调分类分析。它们由超参数优化自动设置以获得最小验证误差。强烈建议使用默认值，除非你完全理解这些参数的功能。

    `classification` 的属性：

    - `alpha`（可选，双精度浮点数）高级配置选项。机器学习使用损失引导树增长，意味着决策树在正则化损失下降最快的地方生长。此参数作为树深度的乘数影响损失计算。较高的 alpha 值导致更浅的树和更快的训练时间。默认在超参数优化期间计算。必须大于或等于零。
    - `class_assignment_objective`（可选，字符串）定义分配类标签时要优化的目标：`maximize_accuracy` 或 `maximize_minimum_recall`。默认为 `maximize_minimum_recall`。
    - `dependent_variable`（必需，字符串）定义要预测的文档字段。必须匹配用于训练的索引中的某个字段。如果文档中缺少此字段，该文档不用于训练，但会使用训练模型为其生成预测。字段的数据类型必须是数值、类别或布尔值。此字段中不能超过 100 个不同的值。
    - `downsample_factor`（可选，双精度浮点数）高级配置选项。控制用于计算树训练损失函数导数的数据比例。值小于 1 通常会提高准确性，但太小可能导致集成收敛不良。默认在超参数优化期间计算。必须大于零且小于或等于 1。
    - `early_stopping_enabled`（可选，布尔值）高级配置选项。指定是否在找不到更好模型时完成训练过程。默认启用。
    - `eta`（可选，双精度浮点数）高级配置选项。应用于权重的收缩。较小的值导致更大的森林，具有更好的泛化误差，但训练更慢。默认在超参数优化期间计算。值必须在 0.001 和 1 之间。
    - `eta_growth_rate_per_tree`（可选，双精度浮点数）高级配置选项。指定每棵新树添加到森林时 eta 增加的速率。默认在超参数优化期间计算。必须在 0.5 和 2 之间。
    - `feature_bag_fraction`（可选，双精度浮点数）高级配置选项。定义选择随机包时使用的特征比例。默认在超参数优化期间计算。
    - `feature_processors`（可选，列表）高级配置选项。特征预处理器的集合，修改一个或多个包含的字段。分析使用生成的一个或多个特征而不是原始文档字段。但是，这些特征是临时的，不存储在目标索引中。多个 `feature_processors` 条目可以引用相同的文档字段。只有当你要覆盖指定字段的自动特征编码时才使用此属性。有关更多信息，请参阅[数据帧分析特征处理器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/df-analytics-feature-processors.html)。

      `feature_processors` 的属性：

      - `frequency_encoding`（对象）频率编码配置。属性：`feature_name`（必需，字符串）、`field`（必需，字符串）、`frequency_map`（必需，对象）。
      - `multi_encoding`（对象）多重编码配置，允许多个处理器一起更改。属性：`processors`（必需，数组），必须多于 1 个。
      - `n_gram_encoding`（对象）n-gram 编码配置。属性：`feature_prefix`（可选，字符串）、`field`（必需，字符串）、`length`（可选，整数，默认 50）、`n_grams`（必需，数组）、`start`（可选，整数，默认 0）。
      - `one_hot_encoding`（对象）独热编码配置。属性：`field`（必需，字符串）、`hot_map`（必需，对象）。
      - `target_mean_encoding`（对象）目标均值编码配置。属性：`default_value`（必需，整数）、`feature_name`（必需，字符串）、`field`（必需，字符串）、`target_map`（必需，对象）。

    - `gamma`（可选，双精度浮点数）高级配置选项。防止训练数据集过拟合的正则化参数。乘以与森林中单个树大小相关的线性惩罚。默认在超参数优化期间计算。必须为非负值。
    - `lambda`（可选，双精度浮点数）高级配置选项。防止训练数据集过拟合的正则化参数。乘以 L2 正则化项，应用于森林中单个树的叶权重。默认在超参数优化期间计算。必须为非负值。
    - `max_optimization_rounds_per_hyperparameter`（可选，整数）高级配置选项。确定贝叶斯优化过程中超参数优化最大步骤数的乘数。默认在超参数优化期间计算。
    - `max_trees`（可选，整数）高级配置选项。定义森林中决策树的最大数量。最大值为 2000。默认在超参数优化期间计算。
    - `num_top_classes`（可选，整数）定义报告预测概率的类别数量。必须为非负或 -1。如果为 -1 或大于类别总数，报告所有类别的概率。默认为 2。要使用 AUC ROC 评估方法，必须设置为 -1 或大于或等于类别总数的值。
    - `num_top_feature_importance_values`（可选，整数）高级配置选项。指定每个文档返回的最大特征重要性值数量。默认为 0，不进行特征重要性计算。
    - `prediction_field_name`（可选，字符串）定义结果中预测字段的名称。默认为 `<dependent_variable>_prediction`。
    - `randomize_seed`（可选，长整数）定义用于选择训练数据的随机生成器种子。默认随机生成。设置为特定值可在每次启动作业时使用相同的训练数据。
    - `soft_tree_depth_limit`（可选，双精度浮点数）高级配置选项。与 `soft_tree_depth_tolerance` 结合使用，惩罚超过指定深度的树。默认在超参数优化期间计算。必须大于或等于 0。
    - `soft_tree_depth_tolerance`（可选，双精度浮点数）高级配置选项。控制当树深度超过 `soft_tree_depth_limit` 时正则化损失增加的速度。默认在超参数优化期间计算。必须大于或等于 0.01。
    - `training_percent`（可选，整数）定义用于训练的合格文档百分比。默认为 100。

  - `outlier_detection`

    （必需*，对象）执行离群点检测所需的配置信息。

    `outlier_detection` 的属性：

    - `compute_feature_influence`（可选，布尔值）指定是否启用特征影响计算。默认为 `true`。
    - `feature_influence_threshold`（可选，双精度浮点数）文档需要具有的最小离群点分数才能计算其特征影响分数。值范围：0-1。默认为 0.1。
    - `method`（可选，字符串）离群点检测使用的方法。可用方法：`lof`、`ldof`、`distance_kth_nn`、`distance_knn`、`ensemble`。默认为 `ensemble`。
    - `n_neighbors`（可选，整数）定义离群点检测的每种方法用于计算离群点分数的最近邻数量。未设置时，不同集成成员使用不同值。
    - `outlier_fraction`（可选，双精度浮点数）离群点检测之前假设为离群的数据集比例。例如 0.05 表示假设 5% 的值是真正的离群点。
    - `standardization_enabled`（可选，布尔值）如果为 `true`，在计算离群点分数之前对列执行标准化操作。默认为 `true`。

  - `regression`

    （必需*，对象）执行回归所需的配置信息。

    高级参数用于微调回归分析。与分类类似，强烈建议使用默认值。

    `regression` 的属性与 `classification` 类似，但有以下区别：

    - `dependent_variable`（必需，字符串）定义要预测的文档字段。字段的数据类型必须是数值。
    - `loss_function`（可选，字符串）回归期间使用的损失函数。可用选项：`mse`（均方误差）、`msle`（均方对数误差）、`huber`（伪 Huber 损失）。默认为 `mse`。
    - `loss_function_parameter`（可选，双精度浮点数）用作损失函数参数的正数。
    - 不包含 `class_assignment_objective` 和 `num_top_classes`。

    其他属性与 `classification` 相同（`alpha`、`downsample_factor`、`early_stopping_enabled`、`eta`、`eta_growth_rate_per_tree`、`feature_bag_fraction`、`feature_processors`、`gamma`、`lambda`、`max_optimization_rounds_per_hyperparameter`、`max_trees`、`num_top_feature_importance_values`、`prediction_field_name`、`randomize_seed`、`soft_tree_depth_limit`、`soft_tree_depth_tolerance`、`training_percent`）。

- `analyzed_fields`

  （可选，对象）指定 `includes` 和/或 `excludes` 模式来选择分析中包含的字段。`excludes` 中指定的模式最后应用，因此 `excludes` 优先。如果同一字段在 `includes` 和 `excludes` 中都指定，则该字段不会包含在分析中。

  如果未设置 `analyzed_fields`，只包含相关字段。有关更多信息，请参阅[解释数据帧分析](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/explain-dfanalytics.html)。

  `analyzed_fields` 的属性：

  - `excludes`（可选，数组）定义从分析中排除的字段的字符串数组。
  - `includes`（可选，数组）定义分析中包含的字段的字符串数组。

- `description`

  （可选，字符串）作业的描述。

- `dest`

  （必需，对象）目标配置，包含 `index` 和可选的 `results_field`（默认为 `ml`）。

  `dest` 的属性：

  - `index`（必需，字符串）定义存储数据帧分析作业结果的目标索引。
  - `results_field`（可选，字符串）定义存储分析结果的字段名称。默认为 `ml`。

- `max_num_threads`

  （可选，整数）分析使用的最大线程数。默认为 1。使用更多线程可能会减少完成分析所需时间，但会使用更多 CPU。

- `_meta`

  （可选，对象）高级配置选项。包含有关作业的自定义元数据。

- `model_memory_limit`

  （可选，字符串）分析处理允许的最大近似内存资源量。数据帧分析作业的默认值为 1gb。

- `source`

  （对象）分析数据的来源配置。需要 `index`。可选指定 `query`、`runtime_mappings` 和 `_source`。

  `source` 的属性：

  - `index`（必需，字符串或数组）执行分析的索引。可以是单个索引或索引模式，也可以是索引或模式的数组。如果源索引包含具有相同 ID 的文档，只有最后索引的文档出现在目标索引中。
  - `query`（可选，对象）Elasticsearch 查询领域特定语言（DSL）。默认为 `{"match_all": {}}`。
  - `runtime_mappings`（可选，对象）将成为目标索引映射一部分的运行时字段定义。
  - `_source`（可选，对象）指定 `includes` 和/或 `excludes` 模式来选择目标中存在的字段。排除的字段不能包含在分析中。属性：`includes`（数组）、`excludes`（数组）。

## 示例

### 预处理操作示例

以下示例展示如何将分析范围限制为某些字段、在目标索引中指定排除字段，以及使用查询在分析前过滤数据：

```json
PUT _ml/data_frame/analytics/model-flight-delays-pre
{
  "source": {
    "index": [
      "kibana_sample_data_flights" 
    ],
    "query": { 
      "range": {
        "DistanceKilometers": {
          "gt": 0
        }
      }
    },
    "_source": { 
      "includes": [],
      "excludes": [
        "FlightDelay",
        "FlightDelayType"
      ]
    }
  },
  "dest": { 
    "index": "df-flight-delays",
    "results_field": "ml-results"
  },
  "analysis": {
    "regression": {
      "dependent_variable": "FlightDelayMin",
      "training_percent": 90
    }
  },
  "analyzed_fields": { 
    "includes": [],
    "excludes": [
      "FlightNum"
    ]
  },
  "model_memory_limit": "100mb"
}
```

1. 要分析的源索引。
2. 此查询过滤掉不会出现在目标索引中的完整文档。
3. `_source` 对象定义数据集中将包含或排除在目标索引中的字段。
4. 定义包含分析结果和 `_source` 对象中指定源索引字段的目标索引。还定义 `results_field` 的名称。
5. 指定分析中包含或排除的字段。这不影响字段是否出现在目标索引中，只影响是否用于分析。

### 离群点检测示例

以下示例创建 `loganalytics` 数据帧分析作业，分析类型为离群点检测：

```json
PUT _ml/data_frame/analytics/loganalytics
{
  "description": "Outlier detection on log data",
  "source": {
    "index": "logdata"
  },
  "dest": {
    "index": "logdata_out"
  },
  "analysis": {
    "outlier_detection": {
      "compute_feature_influence": true,
      "outlier_fraction": 0.05,
      "standardization_enabled": true
    }
  }
}
```

### 回归示例

以下示例创建 `house_price_regression_analysis` 数据帧分析作业，分析类型为回归：

```json
PUT _ml/data_frame/analytics/house_price_regression_analysis
{
  "source": {
    "index": "houses_sold_last_10_yrs"
  },
  "dest": {
    "index": "house_price_predictions"
  },
  "analysis": {
    "regression": {
      "dependent_variable": "price"
    }
  }
}
```

以下示例创建作业并指定训练百分比：

```json
PUT _ml/data_frame/analytics/student_performance_mathematics_0.3
{
  "source": {
    "index": "student_performance_mathematics"
  },
  "dest": {
    "index": "student_performance_mathematics_reg"
  },
  "analysis": {
    "regression": {
      "dependent_variable": "G3",
      "training_percent": 70,
      "randomize_seed": 19673948271
    }
  }
}
```

### 分类示例

以下示例创建 `loan_classification` 数据帧分析作业，分析类型为分类：

```json
PUT _ml/data_frame/analytics/loan_classification
{
  "source": {
    "index": "loan-applicants"
  },
  "dest": {
    "index": "loan-applicants-classified"
  },
  "analysis": {
    "classification": {
      "dependent_variable": "label",
      "training_percent": 75,
      "num_top_classes": 2
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-dfanalytics.html)
