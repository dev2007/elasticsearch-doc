# 评估数据帧分析 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习数据帧分析 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-dfa)。

:::::

评估带注释索引的数据帧分析。

## 请求

```bash
POST _ml/data_frame/_evaluate
```

## 前置条件

- 需要以下权限：
  - 集群：`monitor_ml`（`machine_learning_user` 内置角色授予此权限）— [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)
  - 目标索引：`read` — [权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)

## 描述

此 API 将各种机器学习功能类型常用的评估指标打包在一起。专为数据帧分析创建的索引设计。评估需要同时存在真实值字段和分析结果字段。

## 请求体

- `evaluation`

  （必需，对象）定义要执行的评估类型。

  可用的评估类型：

  - `outlier_detection`
  - `regression`
  - `classification`

- `index`

  （必需，对象）定义执行评估的索引。

- `query`

  （可选，对象）从源索引检索数据子集的查询子句。请参阅查询 DSL。

## 数据帧分析评估资源

### 离群点检测评估对象

离群点检测评估离群点检测分析的结果，该分析输出每个文档是离群点的概率。

- `actual_field`

  （必需，字符串）包含真实值的索引字段。此字段的数据类型可以是布尔值或整数。如果数据类型为整数，值必须为 0（false）或 1（true）。

- `predicted_probability_field`

  （必需，字符串）定义项目是否属于所讨论类别的概率的索引字段。它是包含分析结果的字段。

- `metrics`

  （可选，对象）指定用于评估的指标。如果未指定指标，默认返回：`auc_roc`（include_curve: false）、`precision`（at: [0.25, 0.5, 0.75]）、`recall`（at: [0.25, 0.5, 0.75]）、`confusion_matrix`（at: [0.25, 0.5, 0.75]）。

  `metrics` 的属性：

  - `auc_roc`（可选，对象）AUC ROC（受试者工作特征曲线下面积）分数和可选曲线。默认为 `{"include_curve": false}`。
  - `confusion_matrix`（可选，对象）设置计算指标（tp - 真正例、fp - 假正例、tn - 真负例、fn - 假负例）的离群点分数阈值。默认为 `{"at": [0.25, 0.50, 0.75]}`。
  - `precision`（可选，对象）设置计算指标的离群点分数阈值。默认为 `{"at": [0.25, 0.50, 0.75]}`。
  - `recall`（可选，对象）设置计算指标的离群点分数阈值。默认为 `{"at": [0.25, 0.50, 0.75]}`。

### 回归评估对象

回归评估回归分析的结果，该分析输出值的预测。

- `actual_field`

  （必需，字符串）包含真实值的索引字段。此字段的数据类型必须是数值。

- `predicted_field`

  （必需，字符串）包含预测值的索引字段，即回归分析的结果。

- `metrics`

  （可选，对象）指定用于评估的指标。如果未指定指标，默认返回：`mse`、`r_squared`、`huber`（delta: 1.0）。

  `metrics` 的属性：

  - `mse`（可选，对象）预测值与实际（真实值）值之间的均方差。
  - `msle`

    （可选，对象）预测值的对数与实际（真实值）值的对数之间的均方差。

    - `offset`（可选，双精度浮点数）定义从最小化二次误差切换到最小化二次对数误差的过渡点。默认为 1。

  - `huber`

    （可选，对象）伪 Huber 损失函数。

    - `delta`（可选，双精度浮点数）对于远小于 delta 的值近似 1/2 (prediction - actual)²，对于远大于 delta 的值近似斜率为 delta 的直线。默认为 1。Delta 必须大于 0。

  - `r_squared`（可选，对象）因变量中可从自变量预测的方差比例。

### 分类评估对象

分类评估分类分析的结果，该分析输出标识每个文档所属类别的预测。

- `actual_field`

  （必需，字符串）包含真实值的索引字段。此字段的数据类型必须是类别。

- `predicted_field`

  （可选，字符串）包含预测值的索引字段，即分类分析的结果。

- `top_classes_field`

  （可选，字符串）索引中作为文档数组的字段，格式为 `{ "class_name": XXX, "class_probability": YYY }`。此字段必须在映射中定义为 nested 类型。

- `metrics`

  （可选，对象）指定用于评估的指标。如果未指定指标，默认返回：`accuracy`、`multiclass_confusion_matrix`、`precision`、`recall`。

  `metrics` 的属性：

  - `accuracy`（可选，对象）预测的准确率（每类和总体）。
  - `auc_roc`

    （可选，对象）AUC ROC 分数和可选曲线。为特定类别（作为 "class_name" 提供）计算，将其视为正类。

    - `class_name`（必需，字符串）在 AUC ROC 计算期间被视为正类的唯一类别名称。其他类别被视为负类（"一对多"策略）。所有被评估文档必须在 top 类列表中有 class_name。
    - `include_curve`（可选，布尔值）是否在分数之外返回曲线。默认为 false。

  - `multiclass_confusion_matrix`

    （可选，对象）多类混淆矩阵。

    - `size`（可选，双精度浮点数）指定多类混淆矩阵的大小。默认为 10，生成 10x10 矩阵。

  - `precision`（可选，对象）预测的精确率（每类和平均值）。
  - `recall`（可选，对象）预测的召回率（每类和平均值）。

## 示例

### 离群点检测

```json
POST _ml/data_frame/_evaluate
{
  "index": "my_analytics_dest_index",
  "evaluation": {
    "outlier_detection": {
      "actual_field": "is_outlier",
      "predicted_probability_field": "ml.outlier_score"
    }
  }
}
```

API 返回以下结果：

```json
{
  "outlier_detection": {
    "auc_roc": {
      "value": 0.92584757746414444
    },
    "confusion_matrix": {
      "0.25": {
          "tp": 5,
          "fp": 9,
          "tn": 204,
          "fn": 5
      },
      "0.5": {
          "tp": 1,
          "fp": 5,
          "tn": 208,
          "fn": 9
      },
      "0.75": {
          "tp": 0,
          "fp": 4,
          "tn": 209,
          "fn": 10
      }
    },
    "precision": {
        "0.25": 0.35714285714285715,
        "0.5": 0.16666666666666666,
        "0.75": 0
    },
    "recall": {
        "0.25": 0.5,
        "0.5": 0.1,
        "0.75": 0
    }
  }
}
```

### 回归

以下示例仅评估测试集的结果：

```json
POST _ml/data_frame/_evaluate
{
  "index": "house_price_predictions", 
  "query": {
      "bool": {
        "filter": [
          { "term":  { "ml.is_training": false } } 
        ]
      }
  },
  "evaluation": {
    "regression": {
      "actual_field": "price", 
      "predicted_field": "ml.price_prediction", 
      "metrics": {
        "r_squared": {},
        "mse": {},
        "msle": {"offset": 10},
        "huber": {"delta": 1.5}
      }
    }
  }
}
```

1. 数据帧分析回归分析的输出目标索引。
2. 此查询将评估限制为仅对测试集执行。
3. 实际房屋价格的真实值。
4. 回归分析计算的房屋价格预测值。

### 分类

```json
POST _ml/data_frame/_evaluate
{
   "index": "animal_classification",
   "evaluation": {
      "classification": { 
         "actual_field": "animal_class", 
         "predicted_field": "ml.animal_class_prediction", 
         "metrics": {
           "multiclass_confusion_matrix" : {} 
         }
      }
   }
}
```

1. 评估类型。
2. 实际动物分类的真实值。
3. 分类分析的动物分类预测值。
4. 指定评估的指标。

API 返回以下结果：

```json
{
   "classification" : {
      "multiclass_confusion_matrix" : {
         "confusion_matrix" : [
         {
            "actual_class" : "cat", 
            "actual_class_doc_count" : 12, 
            "predicted_classes" : [ 
              {
                "predicted_class" : "cat",
                "count" : 12 
              },
              {
                "predicted_class" : "dog",
                "count" : 0 
              }
            ],
            "other_predicted_class_doc_count" : 0 
          },
          {
            "actual_class" : "dog",
            "actual_class_doc_count" : 11,
            "predicted_classes" : [
              {
                "predicted_class" : "dog",
                "count" : 7
              },
              {
                "predicted_class" : "cat",
                "count" : 4
              }
            ],
            "other_predicted_class_doc_count" : 0
          }
        ],
        "other_actual_class_count" : 0
      }
    }
  }
```

1. 分析尝试预测的实际类别名称。
2. 索引中属于 actual_class 的文档数量。
3. 此对象包含预测类别列表和与该类别关联的预测数量。
4. 数据集中被正确识别为猫的猫数量。
5. 数据集中被错误分类为狗的猫数量。
6. 被分类为未列为 predicted_class 的类别的文档数量。

以下示例使用 AUC ROC 评估：

```json
POST _ml/data_frame/_evaluate
{
   "index": "animal_classification",
   "evaluation": {
      "classification": { 
         "actual_field": "animal_class", 
         "metrics": {
            "auc_roc" : { 
              "class_name": "dog" 
            }
         }
      }
   }
}
```

1. 评估类型。
2. 实际动物分类的真实值。
3. 指定评估的指标。
4. 指定在评估期间被视为正类的类别名称，所有其他类别被视为负类。

API 返回以下结果：

```json
{
  "classification" : {
    "auc_roc" : {
      "value" : 0.8941788639536681
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/evaluate-dfanalytics.html)
