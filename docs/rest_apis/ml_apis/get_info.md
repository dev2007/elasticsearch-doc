# 获取机器学习信息 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml)。

:::::

返回机器学习使用的默认值和限制。

## 请求

```bash
GET _ml/info
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

此端点设计用于需要完全理解机器学习配置的用户界面，其中某些选项未指定，意味着应使用默认值。此端点可用于了解这些默认值是什么。它还提供有关在当前集群配置下可运行的机器学习作业最大规模的信息。

## 示例

此端点不接受任何参数：

```bash
GET _ml/info
```

可能的响应：

```json
{
  "defaults" : {
    "anomaly_detectors" : {
      "categorization_analyzer" : {
        "char_filter" : [
          "first_line_with_letters"
        ],
        "tokenizer" : "ml_standard",
        "filter" : [
          {
            "type" : "stop",
            "stopwords" : [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
              "Sun",
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
              "GMT",
              "UTC"
            ]
          },
          {
            "type": "limit",
            "max_token_count": "100"
          }
        ]
      },
      "model_memory_limit" : "1gb",
      "categorization_examples_limit" : 4,
      "model_snapshot_retention_days" : 10,
      "daily_model_snapshot_retention_after_days" : 1
    },
    "datafeeds" : {
      "scroll_size" : 1000
    }
  },
  "upgrade_mode": false,
  "native_code" : {
    "version": "7.0.0",
    "build_hash": "99a07c016d5a73"
  },
  "limits" : {
    "effective_max_model_memory_limit": "28961mb",
    "total_ml_memory": "86883mb",
    "total_ml_processors": 16,
    "max_single_ml_node_processors": 16
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-ml-info.html)
