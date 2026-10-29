# 基础：全文搜索和过滤

本教程是使用 `_search` API 和 Query DSL 进行全文（词法）搜索以及过滤的动手介绍。

场景是为一个烹饪博客实现搜索。目标包括：按配料查找菜谱、按饮食需求查找菜谱、查找各类别中评分较高的菜谱，以及查找喜欢作者的近期菜谱。

## 要求

你需要一个正在运行的 Elasticsearch 集群，以及用于 Dev Tools API Console 的 Kibana。在终端中运行以下命令，在 Docker 中设置一个单节点本地集群：

```sh
curl -fsSL https://elastic.co/start-local | sh
```

## 步骤 1：创建索引

创建索引：

```txt
PUT /cooking_blog
```

定义映射：

```txt
PUT /cooking_blog/_mapping
{
  "properties": {
    "title": {
      "type": "text",
      "analyzer": "standard",
      "fields": {
        "keyword": { "type": "keyword", "ignore_above": 256 }
      }
    },
    "description": {
      "type": "text",
      "fields": { "keyword": { "type": "keyword" } }
    },
    "author": {
      "type": "text",
      "fields": { "keyword": { "type": "keyword" } }
    },
    "date": { "type": "date", "format": "yyyy-MM-dd" },
    "category": {
      "type": "text",
      "fields": { "keyword": { "type": "keyword" } }
    },
    "tags": {
      "type": "text",
      "fields": { "keyword": { "type": "keyword" } }
    },
    "rating": { "type": "float" }
  }
}
```

要点说明：

1. 如果未指定分析器，`text` 字段默认使用 `standard` 分析器；此处为演示而显式列出。
2. **多字段（multi-fields）** 将 `text` 字段同时索引为 `text` 和 `keyword`，从而可以在同一个字段上既进行全文搜索又进行精确匹配/过滤。动态映射会自动创建这些多字段。
3. `ignore_above: 256`（默认值）会阻止索引长度超过 256 个字符的关键字值，从而节省磁盘空间并避免超过 Lucene 的词条字节长度限制。

全文搜索由**文本分析**提供支持，文本分析会为倒排索引规范化文本；分析在索引和搜索时都会发生。

## 步骤 2：添加示例博客文章

使用批量 API 添加示例博客文章：

```txt
POST /cooking_blog/_bulk?refresh=wait_for
{"index":{"_id":"1"}}
{"title":"Perfect Pancakes: A Fluffy Breakfast Delight","description":"Learn the secrets to making the fluffiest pancakes, so amazing you won't believe your tastebuds. This recipe uses buttermilk and a special folding technique to create light, airy pancakes that are perfect for lazy Sunday mornings.","author":"Maria Rodriguez","date":"2023-05-01","category":"Breakfast","tags":["pancakes","breakfast","easy recipes"],"rating":4.8}
{"index":{"_id":"2"}}
{"title":"Spicy Thai Green Curry: A Vegetarian Adventure","description":"Dive into the flavors of Thailand with this vibrant green curry. Packed with vegetables and aromatic herbs, this dish is both healthy and satisfying. Don't worry about the heat - you can easily adjust the spice level to your liking.","author":"Liam Chen","date":"2023-05-05","category":"Main Course","tags":["thai","vegetarian","curry","spicy"],"rating":4.6}
{"index":{"_id":"3"}}
{"title":"Classic Beef Stroganoff: A Creamy Comfort Food","description":"Indulge in this rich and creamy beef stroganoff. Tender strips of beef in a savory mushroom sauce, served over a bed of egg noodles. It's the ultimate comfort food for chilly evenings.","author":"Emma Watson","date":"2023-05-10","category":"Main Course","tags":["beef","pasta","comfort food"],"rating":4.7}
{"index":{"_id":"4"}}
{"title":"Vegan Chocolate Avocado Mousse","description":"Discover the magic of avocado in this rich, vegan chocolate mousse. Creamy, indulgent, and secretly healthy, it's the perfect guilt-free dessert for chocolate lovers.","author":"Alex Green","date":"2023-05-15","category":"Dessert","tags":["vegan","chocolate","avocado","healthy dessert"],"rating":4.5}
{"index":{"_id":"5"}}
{"title":"Crispy Oven-Fried Chicken","description":"Get that perfect crunch without the deep fryer! This oven-fried chicken recipe delivers crispy, juicy results every time. A healthier take on the classic comfort food.","author":"Maria Rodriguez","date":"2023-05-20","category":"Main Course","tags":["chicken","oven-fried","healthy"],"rating":4.9}
```

## 步骤 3：基本全文搜索

全文查询会为每个文档计算一个**相关性评分**。

### match 查询 — 在描述中搜索 "fluffy pancakes"

```txt
GET /cooking_blog/_search
{
  "query": {
    "match": {
      "description": { "query": "fluffy pancakes" }
    }
  }
}
```

- `match` 默认的词条间逻辑是 **OR**，因此会匹配包含 "fluffy" 或 "pancakes"（或两者都包含）的文档。
- 在搜索时，Elasticsearch 使用该字段映射的分析器（此处为 `standard`）。

示例响应返回一个命中，`_id` 为 `"1"`（Perfect Pancakes），`max_score`/`_score` 为 `1.8378843`。其中 `hits` 包含命中总数及 relation；`max_score` 是最高的相关性评分；`_score` 是每个文档的相关性（越高越好）。

### 要求匹配所有词条（`operator: "and"`）

```txt
GET /cooking_blog/_search
{
  "query": {
    "match": {
      "description": { "query": "fluffy pancakes", "operator": "and" }
    }
  }
}
```

返回**零命中** — 没有文档在描述中同时包含 "fluffy" 和 "pancakes"。

### `minimum_should_match`

在标题中匹配 "fluffy"、"pancakes"、"breakfast" 三个词条中的至少 2 个：

```txt
GET /cooking_blog/_search
{
  "query": {
    "match": {
      "title": { "query": "fluffy pancakes breakfast", "minimum_should_match": 2 }
    }
  }
}
```

## 步骤 4：跨多个字段搜索（multi_match）

基本用法 — 所有字段权重相同：

```txt
GET /cooking_blog/_search
{
  "query": {
    "multi_match": {
      "query": "vegetarian curry",
      "fields": [ "title", "description", "tags" ]
    }
  }
}
```

使用**字段加权**：

```txt
GET /cooking_blog/_search
{
  "query": {
    "multi_match": {
      "query": "vegetarian curry",
      "fields": [ "title^3", "description^2", "tags" ]
    }
  }
}
```

加权说明：

- `title^3`：标题字段的重要性是未加权字段的 3 倍。
- `description^2`：重要性为 2 倍。
- `tags`：未加权（相当于 `^1`）。

示例响应返回一个命中，`_id` 为 `"2"`（Spicy Thai Green Curry），`_score` 为 `7.546015`。标题包含 "Vegetarian"/"Curry"（加权最高，贡献最大）；描述包含 "curry" 和 "vegetables"；tags 中精确包含两个词条。虽然 "vegetarian curry" 这个精确短语没有出现在任何单个字段中，但跨字段匹配仍产生了高度相关的结果。对于大多数文本搜索用例，`multi_match` 通常比单个 `match` 更受推荐。

## 步骤 5：过滤和查找精确匹配

**过滤器是二元的（是/否），不影响相关性评分，并且运行更快**，因为被排除的结果不需要评分。

### bool + filter 配合 term — Breakfast 类别

```txt
GET /cooking_blog/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "category.keyword": "Breakfast" } }
      ]
    }
  }
}
```

关于 `category.keyword` 的说明：`.keyword` 后缀访问未经分析的多字段，用于精确、区分大小写的匹配。它在以下情况下有效：(1) 动态映射在 text 字段上自动创建了 `.keyword` 子字段，或 (2) text 字段被显式映射了 `.keyword` 子字段（如步骤 1 所示）。

### 日期范围过滤

```txt
GET /cooking_blog/_search
{
  "query": {
    "range": {
      "date": { "gte": "2023-05-01", "lte": "2023-05-31" }
    }
  }
}
```

`gte` 表示大于或等于 2023 年 5 月 1 日；`lte` 表示小于或等于 2023 年 5 月 31 日。

### 作者的精确词条匹配

```txt
GET /cooking_blog/_search
{
  "query": {
    "term": { "author.keyword": "Maria Rodriguez" }
  }
}
```

:::warning 注意

`term` 查询**没有任何灵活性** — 查询 `"maria"` 或 `"maria rodriguez"` 会因为区分大小写而返回零命中。避免在 `text` 字段上使用 `term`，因为分析会转换这些字段。

:::

## 步骤 6：组合多个条件（bool 查询）

目标要求：必须是素食；标题/描述中最好包含 "curry" 或 "spicy"；最好是主菜；不能是甜点；评分必须 ≥ 4.5；最好优先显示最近一个月的菜谱。

```txt
GET /cooking_blog/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "tags": "vegetarian" } },
        { "range": { "rating": { "gte": 4.5 } } }
      ],
      "should": [
        { "term": { "category": "Main Course" } },
        { "multi_match": { "query": "curry spicy", "fields": [ "title^2", "description" ] } },
        { "range": { "date": { "gte": "now-1M/d" } } }
      ],
      "must_not": [
        { "term": { "category.keyword": "Dessert" } }
      ]
    }
  }
}
```

子句语义：

- **`must`**：全部必须满足（素食标签、评分 ≥ 4.5）。
- **`should`**：可选，但会提升相关性（主菜、curry/spicy 匹配、发布时间）。
- **`must_not`**：排除匹配的文档（非常适合过滤掉不需要的结果）。

示例响应返回一个命中，`_id` 为 `"2"`（Spicy Thai Green Curry），`_score` 为 `7.444513`。文档说明：标题中的 "Spicy"/"Curry" 匹配了一个 `should` 条件 — 在默认的 `best_fields` 行为下，只有最佳匹配字段的评分被计入；该菜谱是近期发布的；"Main Course" 满足另一个 `should`；"vegetarian" 标签满足 `must`；评分 4.6 ≥ 4.5。

## 了解更多

- [全文搜索](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/full-text-search.html)
- [Elasticsearch 基础 — 搜索和分析数据](/intro/search_analyze)
- [文本分析](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis.html)
- [搜索你的数据](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-with-elasticsearch.html)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/full-text-filter-tutorial.html)
