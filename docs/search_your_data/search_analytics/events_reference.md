# 行为分析事件参考

行为分析使用弹性通用模式记录事件，包括分析事件的自定义字段集。请参阅记录的完整数据对象示例。

## 字段概述

- [通用事件字段](#通用事件字段)
- [搜索事件字段](#搜索事件字段)
- [搜索点击事件字段](#搜索点击事件字段)
- [页面浏览事件字段](#页面浏览事件字段)

## 通用事件字段

- `@timestamp`
    事件的时间戳
- `event.action`
    事件类型。可能的值包括搜索、搜索点击和页面浏览。
- `event.source`
    事件的来源。可能的值是客户端和服务器。
- `session.id`
    会话的唯一标识符。
- `user.id`
    用户的唯一标识符。
- `_id`
    文件 ID。
- `_index`
    索引名称。
- `_score`
    文件的得分。

## 搜索事件字段

- `search.filters`
    应用于搜索查询的筛选器。
- `search.query`
    搜索查询。
- `search.results.items.document.id`
    搜索结果中文档的 ID。
- `search.results.items.document.index`
    搜索结果中文件的索引。
- `search.results.items.page.url.domain`
    搜索结果中页面的 URL 域。
- `search.results.items.page.url.original`
    搜索结果中页面的原始 URL。
- `search.results.items.page.url.path`
    搜索结果中页面的 URL 路径。
- `search.results.items.page.url.scheme`
    搜索结果中页面的 URL 方案。
- `search.results.total_results`
    搜索查询返回的结果总数。
- `search.search_application`
    用于执行搜索查询的搜索应用程序。
- `search.sort.name`
    应用于搜索查询的排序名称。

## 搜索点击事件字段

- `document.id`
    被点击文档的 ID。
- `document.index`
    包含被点击文档的索引。
- `page.url.domain`
    被点击页面的 URL 域。
- `page.url.original`
    被点击页面的原始 URL。
- `page.url.path`
    被点击页面的 URL 路径。
- `page.url.scheme`
    被点击页面的 URL 方案。
- `search.filters`
    应用于搜索查询的筛选器。
- `search.query`
    搜索查询。
- `search.results.items.document.id`
    搜索结果中文档的 ID。
- `search.results.items.document.index`
    搜索结果中文件的索引。
- `search.results.items.page.url.domain`
    搜索结果中页面的 URL 域。
- `search.results.items.page.url.original`
    搜索结果中页面的原始 URL。
- `search.results.items.page.url.path`
    搜索结果中页面的 URL 路径。
- `search.results.items.page.url.scheme`
    搜索结果中页面的 URL 方案。
- `search.results.total_results`
    搜索查询返回的结果总数。
- `search.search_application`
    用于执行搜索查询的搜索应用程序。
- `search.sort.name`
    应用于搜索查询的排序名称。
- `session.location.country_iso_code`
    搜索点击所在国家的 ISO 代码。
- `session.location.country_name`
    出现搜索点击的国家名称。

## 页面浏览事件字段

- `document.id`
    已查看文件的 ID。
- `document.index`
    包含已查看文件的索引。
- `page.referrer.domain`
    指向已浏览页面的页面的 URL 域。
- `page.referrer.original`
    引用所浏览页面的原始 URL。
- `page.referrer.path`
    指向所浏览页面的页面路径。
- `page.referrer.scheme`
    指向所浏览页面的页面的 URL 方案。
- `page.title`
    浏览页面的标题。
- `page.url.domain`
    浏览页面的 URL 域。
- `page.url.original`
    浏览页面的原始 URL。
- `page.url.path`
    浏览页面的 URL 路径。
- `page.url.scheme`
    浏览页面的 URL 方案。
- `session.location.country_iso_code`
    页面浏览所在国家的 ISO 代码。
- `session.location.country_name`
    页面浏览所在国家的名称。

## 示例

- 查看 `search` 事件数据对象的完整示例：

```json
{
  "@timestamp": [
    "2023-05-16T12:52:29.003Z"
  ],
  "event.action": [
    "search"
  ],
  "event.source": [
    "client"
  ],
  "search.filters": [
    {
      "color": [
        "silver"
      ],
      "brand": [
        "Robel, Klocko and Ziemann",
        "McClure, Marks and Mertz"
      ]
    }
  ],
  "search.query": [
    "transformation"
  ],
  "search.results.items.document.id": [
    "045a164b-229e-40b5-ba66-b2ebabd2a251"
  ],
  "search.results.items.document.index": [
    "products"
  ],
  "search.results.items.page.url.domain": [
    "fancy-overcoat.org"
  ],
  "search.results.items.page.url.original": [
    "http://fancy-overcoat.org/happy/pancakes/deals"
  ],
  "search.results.items.page.url.path": [
    "/happy/pancakes/deals"
  ],
  "search.results.items.page.url.scheme": [
    "http"
  ],
  "search.results.total_results": [
    67
  ],
  "search.search_application": [
    "search-ui"
  ],
  "search.sort.name": [
    "relevance"
  ],
  "session.id": [
    "2bc31b08-d443-4b7a-81ea-65edf3dd82e7"
  ],
  "user.id": [
    "42704a4b-692b-4654-bb67-a65eb0c72f15"
  ],
  "_id": "y3IBBogBWHKTU-4a543S",
  "_index": ".ds-behavioral_behavioral-analytics-event-website-2023.05.10-000001",
  "_score": null
}
```

- 查看 `search_click` 事件数据对象的完整示例：

```json
{
  "@timestamp": [
    "2023-05-16T12:22:23.468Z"
  ],
  "document.id": [
    "38cca784-109a-4ea0-a4e8-60c3be667ffd"
  ],
  "document.index": [
    "products"
  ],
  "event.action": [
    "search_click"
  ],
  "event.source": [
    "client"
  ],
  "page.url.domain": [
    "unfurnished-appartments"
  ],
  "page.url.original": [
    "https://unfurnished-appartments/new/europe"
  ],
  "page.url.path": [
    "/new/europe"
  ],
  "page.url.scheme": [
    "https"
  ],
  "search.filters": [
    {
      "brand": [
        "McClure, Marks and Mertz",
        "Ondricka - Rath"
      ]
    }
  ],
  "search.query": [
    "ferryboat"
  ],
  "search.results.items.document.id": [
    "0c76967b-4915-446e-9b2c-b1bfb9e39e1e"
  ],
  "search.results.items.document.index": [
    "products"
  ],
  "search.results.items.page.url.domain": [
    "dependent-lecture.info"
  ],
  "search.results.items.page.url.original": [
    "http://dependent-lecture.info/documents/additional/latest"
  ],
  "search.results.items.page.url.path": [
    "/documents/additional/latest"
  ],
  "search.results.items.page.url.scheme": [
    "http"
  ],
  "search.results.total_results": [
    54
  ],
  "search.search_application": [
    "search-ui"
  ],
  "search.sort.name": [
    "relevance"
  ],
  "session.id": [
    "9411fb93-8707-49a4-baab-cec4d6aef753"
  ],
  "session.location.country_iso_code": [
    "GP"
  ],
  "session.location.country_name": [
    "Guadeloupe"
  ],
  "user.id": [
    "911d0c19-e713-4413-8f4c-c6c612bc37c4"
  ],
  "_id": "m8cBBogBG4-Ak0Iy7LME",
  "_index": ".ds-behavioral_behavioral-analytics-event-website-2023.05.10-000001",
  "_score": null
}
```

- 查看 `pageview` 事件数据对象的完整示例：

```json
{
  "@timestamp": [
    "2023-05-16T12:52:51.309Z"
  ],
  "document.id": [
    "c98ppfc8-3a04-4a20-888a-f87292b31181"
  ],
  "document.index": [
    "products"
  ],
  "event.action": [
    "page_view"
  ],
  "event.source": [
    "client"
  ],
  "page.referrer.domain": [
    "happy-pancakes.name"
  ],
  "page.referrer.original": [
    "https://happy-pancakes.name/magnam"
  ],
  "page.referrer.path": [
    "/magnam"
  ],
  "page.referrer.scheme": [
    "https"
  ],
  "page.title": [
    "Super fast delivery"
  ],
  "page.url.domain": [
    "happy-staircase.net"
  ],
  "page.url.original": [
    "http://happy-staircase.net/quam"
  ],
  "page.url.path": [
    "/quam"
  ],
  "page.url.scheme": [
    "http"
  ],
  "session.id": [
    "2bc31b08-d443-4b7a-81ea-65edf3dd82e7"
  ],
  "session.location.country_iso_code": [
    "SN"
  ],
  "session.location.country_name": [
    "Senegal"
  ],
  "user.id": [
    "42704a4b-692b-4654-bb67-a65eb0c72f15"
  ],
  "_id": "zHIBBogBWHKTU-4a543S",
  "_index": ".ds-behavioral_behavioral-analytics-event-website-2023.05.10-000001",
  "_score": null
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/behavioral-analytics-event-reference.html)
