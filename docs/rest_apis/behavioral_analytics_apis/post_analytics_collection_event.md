# 将事件发布到分析集合

:::caution 警告
此功能为测试版，可能会有更改。其设计和代码不如 GA 正式功能成熟，因此不提供任何保证。测试版功能不受 GA 正式功能的支持服务级别协议约束。
:::

将事件发布到分析集合。

## 请求

`POST _application/analytics/<collection_name>/event/<event_type>`

## 路径参数

- `<collection_name>`
  (必填，字符串）你要在其中摄取事件的分析集合名称。

- `<event_type>`
  (必填，字符串）分析事件类型。可以是 `page_view`、`search`、`search_click` 中的一种。

## 请求体

完整的请求体参数可在此找到：[事件参考](/search_your_data/search_analytics/events_reference)。

## 前置条件

需要获得 `manage_behavioral_analytics` 集群权限。

## 响应码

- `202`
  事件已被接受并将被输入。

- `404`
  分析集合 `<collection_name>` 不存在。

- `400`
  事件类型未知或事件有效负载包含无效数据时出现。

## 示例

下面的示例将 `search_click` 事件发送到名为 `my_analytics_collection` 的分析集合。

```bash
POST _application/analytics/my_analytics_collection/event/search_click
{
  "session": {
    "id": "1797ca95-91c9-4e2e-b1bd-9c38e6f386a9"
  },
  "user": {
    "id": "5f26f01a-bbee-4202-9298-81261067abbd"
  },
  "search":{
    "query": "search term",
    "results": {
      "items": [
        {
          "document": {
            "id": "123",
            "index": "products"
          }
        }
      ],
      "total_results": 10
    },
    "sort": {
      "name": "relevance"
    },
    "search_application": "website"
  },
  "document":{
    "id": "123",
    "index": "products"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/post-analytics-collection-event.html)
