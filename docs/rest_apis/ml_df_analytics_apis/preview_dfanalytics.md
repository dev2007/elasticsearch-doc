# 预览数据帧分析 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习数据帧分析 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-dfa)。

:::::

预览数据帧分析配置使用的特征。

## 请求

```bash
GET _ml/data_frame/analytics/_preview
```

```bash
POST _ml/data_frame/analytics/_preview
```

```bash
GET _ml/data_frame/analytics/<data_frame_analytics_id>/_preview
```

```bash
POST _ml/data_frame/analytics/<data_frame_analytics_id>/_preview
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

此 API 提供已存在或尚未创建的数据帧分析配置所提取特征的预览。

## 路径参数

- `<data_frame_analytics_id>`

  （可选，字符串）数据帧分析作业的标识符。

## 请求体

- `config`

  （可选，对象）如[创建数据帧分析作业 API](./put_dfanalytics) 中所述的数据帧分析配置。注意，在此 API 的上下文中不需要提供 `id` 和 `dest`。

## 响应体

API 返回包含以下内容的响应：

- `feature_values`

  （数组）包含特征名称和值对的对象数组。这些特征已经过处理，指示将发送给模型进行训练的内容。

## 示例

```json
POST _ml/data_frame/analytics/_preview
{
  "config": {
    "source": {
      "index": "houses_sold_last_10_yrs"
    },
    "analysis": {
      "regression": {
        "dependent_variable": "price"
      }
    }
  }
}
```

API 返回以下结果：

```json
{
  "feature_values": [
    {
      "number_of_bedrooms": "1",
      "postcode": "29655",
      "price": "140.4"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/preview-dfanalytics.html)
