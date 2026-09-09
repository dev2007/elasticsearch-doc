# 解释数据帧分析 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习数据帧分析 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-dfa)。

:::::

解释数据帧分析配置。

## 请求

```bash
GET _ml/data_frame/analytics/_explain
```

```bash
POST _ml/data_frame/analytics/_explain
```

```bash
GET _ml/data_frame/analytics/<data_frame_analytics_id>/_explain
```

```bash
POST _ml/data_frame/analytics/<data_frame_analytics_id>/_explain
```

## 前置条件

- 需要以下权限：
  - 集群：`monitor_ml`（`machine_learning_user` 内置角色授予此权限）— [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)
  - 源索引：`read`、`view_index_metadata` — [权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)

## 描述

此 API 为已存在或尚未创建的数据帧分析配置提供解释。提供以下解释：

- 哪些字段包含或不包含在分析中及其原因。
- 估计需要多少内存。此估计可用于稍后决定 `model_memory_limit` 设置的适当值。

如果你有对象字段或通过源过滤排除的字段，它们不会包含在解释中。

## 路径参数

- `<data_frame_analytics_id>`

  （可选，字符串）数据帧分析作业的标识符。

## 请求体

如[创建数据帧分析作业 API](./put_dfanalytics) 中所述的数据帧分析配置。注意，在此 API 的上下文中不需要提供 `id` 和 `dest`。

## 响应体

API 返回包含以下内容的响应：

- `field_selection`

  （数组）解释每个字段选择的对象数组，按字段名称排序。

  `field_selection` 对象的属性：

  - `is_included`（布尔值）该字段是否被选中包含在分析中。
  - `is_required`（布尔值）该字段是否为必需。
  - `feature_type`（字符串）该字段在分析中的特征类型。可能为 `categorical`（类别）或 `numerical`（数值）。
  - `mapping_types`（字符串）该字段的映射类型。
  - `name`（字符串）字段名称。
  - `reason`（字符串）字段未被选中包含在分析中的原因。

- `memory_estimation`

  （对象）包含内存估计的对象。

  `memory_estimation` 的属性：

  - `expected_memory_with_disk`（字符串）在允许数据帧分析期间溢出到磁盘的假设下的估计内存使用量。`expected_memory_with_disk` 通常小于 `expected_memory_without_disk`，因为使用磁盘可以限制执行数据帧分析所需的主内存。
  - `expected_memory_without_disk`（字符串）在整个数据帧分析在内存中进行的假设下（即不溢出到磁盘）的估计内存使用量。

## 示例

```json
POST _ml/data_frame/analytics/_explain
{
  "source": {
    "index": "houses_sold_last_10_yrs"
  },
  "analysis": {
    "regression": {
      "dependent_variable": "price"
    }
  }
}
```

API 返回以下结果：

```json
{
  "field_selection": [
    {
      "field": "number_of_bedrooms",
      "mappings_types": ["integer"],
      "is_included": true,
      "is_required": false,
      "feature_type": "numerical"
    },
    {
      "field": "postcode",
      "mappings_types": ["text"],
      "is_included": false,
      "is_required": false,
      "reason": "[postcode.keyword] is preferred because it is aggregatable"
    },
    {
      "field": "postcode.keyword",
      "mappings_types": ["keyword"],
      "is_included": true,
      "is_required": false,
      "feature_type": "categorical"
    },
    {
      "field": "price",
      "mappings_types": ["float"],
      "is_included": true,
      "is_required": true,
      "feature_type": "numerical"
    }
  ],
  "memory_estimation": {
    "expected_memory_without_disk": "128MB",
    "expected_memory_with_disk": "32MB"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/explain-dfanalytics.html)
