# 创建分析集合

:::caution 警告
此功能为测试版，可能会有更改。其设计和代码不如 GA 正式功能成熟，因此不提供任何保证。测试版功能不受 GA 正式功能的支持服务级别协议约束。
:::

创建分析集合。

## 请求

`PUT _application/analytics/<name>`

## 路径参数

- `<name>`
    (必填，字符串）

## 前提条件

需要 `manage_behavioral_analytics` 集群权限。

## 响应码

- `400`
    分析集合 `<name>` 存在。

## 示例

下面的示例创建了一个新的分析集合，名为：`my_analytics_collection`：

```bash
PUT _application/analytics/my_analytics_collection
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/put-analytics-collection.html#put-analytics-collection)
