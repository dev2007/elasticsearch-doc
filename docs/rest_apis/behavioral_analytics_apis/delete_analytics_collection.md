# 删除分析集合

:::caution 警告
此功能为测试版，可能会有更改。其设计和代码不如 GA 正式功能成熟，因此不提供任何保证。测试版功能不受 GA 正式功能的支持服务级别协议约束。
:::

删除分析集合及其相关数据流。

## 请求

`DELETE _application/analytics/<name>`

## 前置条件

需要 `manage_behavioral_analytics` 集群权限。

## 路径参数

- `<name>`
    （必需，字符串）

## 响应码

- `400`
    `name` 未提供

- `404` （缺失资源）
    未找到与 `name` 匹配的分析数据集。

## 示例

下面的示例将删除名为 `my_analytics_collection` 的分析集合。

```bash
DELETE _application/analytics/my_analytics_collection/
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/delete-analytics-collection.html)
