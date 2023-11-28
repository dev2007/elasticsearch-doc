# 列出分析集合

:::caution 警告
此功能为测试版，可能会有更改。其设计和代码不如 GA 正式功能成熟，因此不提供任何保证。测试版功能不受 GA 正式功能的支持服务级别协议约束。
:::

## 请求

`GET _application/analytics/<criteria>`

## 前置条件

需要获得 `manage_behavioral_analytics` 集群权限。

## 路径参数

- `<criteria>`
    (可选，字符串）标准用于查找匹配的分析集合。可以是集合名称，也可以是匹配多个集合的模式。如果未指定，将返回所有分析集合。

## 响应码

- `404`
    标准与任何分析集合不匹配。

## 示例

下面的示例列出了所有已配置的分析集合：

```bash
GET _application/analytics/
```

一个示例响应：

```json
{
  "my_analytics_collection": {
      "event_data_stream": {
          "name": "behavioral_analytics-events-my_analytics_collection"
      }
  },
  "my_analytics_collection2": {
      "event_data_stream": {
          "name": "behavioral_analytics-events-my_analytics_collection2"
      }
  }
}
```

下面的示例会返回与 `my_analytics_collection` 匹配的分析集合：

```bash
GET _application/analytics/my_analytics_collection
```

一个示例响应：

```json
{
  "my_analytics_collection": {
      "event_data_stream": {
          "name": "behavioral_analytics-events-my_analytics_collection"
      }
  }
}
```

下面的示例会返回所有以 `my` 为前缀的分析集合：

```bash
GET _application/analytics/my*
```

一个示例响应：

```json
{
  "my_analytics_collection": {
      "event_data_stream": {
          "name": "behavioral_analytics-events-my_analytics_collection"
      }
  },
  "my_analytics_collection2": {
      "event_data_stream": {
          "name": "behavioral_analytics-events-my_analytics_collection2"
      }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/list-analytics-collection.html)
