# 排序评估 API

允许你在一组典型的搜索查询中评估排名搜索结果的质量。

## 请求

`GET /<target>/_rank_eval`

`POST /<target>/_rank_eval`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须对目标数据流、索引或别名有 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 描述

排序评估 API 允许您评估一组典型搜索查询中排名搜索结果的质量。给定这组查询和手动分级的文档列表，`_rank_eval` 端点计算并返回典型的信息检索指标，如*平均倒数排名、精度或折扣累积增益*。

搜索质量评估从查看搜索应用程序的用户以及他们正在搜索的内容开始。用户有特定的*信息需求*；例如，他们正在网上商店寻找礼物，或者想预订下一个假期的航班。他们通常在搜索框或其他web表单中输入一些搜索词。所有这些信息以及有关用户的元信息（例如浏览器、位置、早期首选项等）然后被转换为对底层搜索系统的查询。

搜索工程师面临的挑战是调整这种从用户输入到具体查询的转换过程，使搜索结果包含与用户信息需求相关的最相关信息。只有在典型用户查询的代表性测试套件中不断评估搜索结果质量，以便某个特定查询的排名改进不会对其他类型查询的排名产生负面影响时，才能做到这一点。

为了开始搜索质量评估，您需要三件基本的事情：

1. 要评估查询性能的文档集合，通常是一个或多个数据流或索引。
2. 用户输入系统的典型搜索请求的集合。
3. 一组文档分级，表示文档与搜索请求的相关性。

需要注意的是，每个测试查询需要一组文档评级，相关性判断是基于输入查询的用户的信息需求。

排序评估 API 提供了一种方便的方法，可以在排名评估请求中使用此信息来计算不同的搜索评估指标。这为您提供了总体搜索质量的第一个估计，以及在微调应用程序中查询生成的各个方面时要进行优化的度量。

## 路径参数

- `<target>`
  （可选，字符串）用于限制请求的，逗号分隔的数据流、索引。也支持通配符表达式（*）。为了搜索所有数据流和索引，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`
  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

  默认为 `true`。

- `expand_wildcards`
  （可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效的值有：

  1. `all`
  匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax?id=隐藏数据流和索引)（隐藏的）。
  2. `open`
  匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
  3. `closed`
  匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
  4. `hidden`
  匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
  5. `none`
  不接受通配符表达式。

  默认为 `open`。

- `ignore_unavailable`
  （可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

## 示例

在最基本的形式中，对 `_rank_eval` 端点的请求有两个部分：

```bash
GET /my-index-000001/_rank_eval
{
  "requests": [ ... ],
  "metric": {
    "mean_reciprocal_rank": { ... }
  }
}
```

1. `"requests": [ ... ]`：一组典型的搜索请求及其提供的评级
2. `"metric"`：要计算的评估指标的定义
3. `"mean_reciprocal_rank": { ... }`：特定度量及其参数

请求部分包含应用程序典型的几个搜索请求，以及每个特定搜索请求的文档评级。

```bash
GET /my-index-000001/_rank_eval
{
  "requests": [
    {
      "id": "amsterdam_query",
      "request": {
          "query": { "match": { "text": "amsterdam" } }
      },
      "ratings": [
        { "_index": "my-index-000001", "_id": "doc1", "rating": 0 },
        { "_index": "my-index-000001", "_id": "doc2", "rating": 3 },
        { "_index": "my-index-000001", "_id": "doc3", "rating": 1 }
      ]
    },
    {
      "id": "berlin_query",
      "request": {
        "query": { "match": { "text": "berlin" } }
      },
      "ratings": [
        { "_index": "my-index-000001", "_id": "doc1", "rating": 1 }
      ]
    }
  ]
}
```

1. `"id": "amsterdam_query"`：搜索请求的 ID，用于稍后对结果详细信息进行分组。
2. `"request": {`：正在计算的查询。
3. `"ratings": [`：文档分级列表。每个条目都包含以下参数：
  - `_index`：文档的索引。对于数据流，这应该是文档的支持索引。
  - `_id`：文档 ID。
  - `rating`：文档与此搜索请求的相关性。

文档 `rating` 可以是在用户定义的范围内表示文档相关性的任何整数值。对于某些度量，只给出一个二进制评级（例如 `0` 表示无关，`1` 表示相关）就足够了，而其他度量可以使用更细粒度的尺度。

### 基于模板的排名评估

除了必须为每个测试请求提供单个查询之外，还可以在评估请求中指定查询模板，然后再引用它们。这样，只有参数不同的类似结构的查询就不必在 `requests` 部分一直重复。在典型的搜索系统中，用户输入通常被填充到一小组查询模板中，这有助于使评估请求更加简洁。

```bash
GET /my-index-000001/_rank_eval
{
   [...]
  "templates": [
     {
        "id": "match_one_field_query",  
        "template": {
            "inline": {
                "query": {
                  "match": { "{{field}}": { "query": "{{query_string}}" }}
                }
            }
        }
     }
  ],
  "requests": [
      {
         "id": "amsterdam_query",
         "ratings": [ ... ],
         "template_id": "match_one_field_query", 
         "params": {
            "query_string": "amsterdam",
            "field": "text"
          }
     },
    [...]
}
```

1. `"id": "match_one_field_query"`：模板 id
2. `"template": {`：定义要使用的模板
3. `"template_id": "match_one_field_query"`：引用预定义的模板
4. `"params": {`：用于填充模板的参数

你也可使用[存储的模板](/search_your_data/search_templates?id=创建一个搜索模板)。

```bash
GET /my_index/_rank_eval
{
   [...]
  "templates": [
     {
        "id": "match_one_field_query",  
        "template": {
            "id": "match_one_field_query"
        }
     }
  ],
  "requests": [...]
}
```

1. `"id": "match_one_field_query"`：用于请求的模板 id
2. `"template": {`：存储在集群状态中的模板 id

### 可用的评估指标

`metric` 部分确定将使用哪些可用的评估度量。支持以下指标：

#### K 精度（P@k）

此指标衡量前 k 个搜索结果中相关结果的比例。这是一种众所周知的精度度量，它只查看前k个文档。它是前k个结果中相关文档的分数。精度为 10(P@10)值为 0.6 意味着 10个 热门搜索中有 6 个与用户的信息需求相关。

P@k 作为一种简单的评估指标，其优点是易于理解和解释。集合中的文档需要被评定为与当前查询相关或不相关。P@k 是一个基于集合的度量，并且没有考虑相关文档在前 k 个结果中的位置，因此，在位置 10 中包含一个相关结果的十个结果的排名与在位置 1 中包含一个相关结果的十个结果的排名一样好。

```bash
GET /my-index-000001/_rank_eval
{
  "requests": [
    {
      "id": "JFK query",
      "request": { "query": { "match_all": {} } },
      "ratings": []
    } ],
  "metric": {
    "precision": {
      "k": 20,
      "relevant_rating_threshold": 1,
      "ignore_unlabeled": false
    }
  }
}
```

`precision` 指标采用以下可选参数：

|参数|描述|
|--|--|
|`k`|设置每个查询检索的最大文档数。此值将替代查询中的常规 `size` 参数。默认值为 10。|
|`relevant_rating_threshold`|设置文档被视为“相关”的评级阈值。默认值为 `1`。|
|`ignore_unlabeled`|控制搜索结果中未标记文档的计数方式。如果设置为 *true*，则忽略未标记的文档，并且两者都不视为相关或无关。如果设置为 *false*（默认值），它们将被视为不相关。|

#### k 召回（R@k）

此指标衡量前 k 个搜索结果中相关结果的总数。这是一种众所周知的[召回](https://en.wikipedia.org/wiki/Evaluation_measures_(information_retrieval)#Recall)指标。它是前 k 个结果中相关文档相对于所有可能相关结果的分数。10 召回(R@10)如果值为 0.5，则表示在 10 个热门搜索中检索到了 8 个与用户信息需求相关的文档中的 4 个。

R@k 作为一种简单的评估指标，其优点是易于理解和解释。集合中的文档需要被评定为与当前查询相关或不相关。R@k 是一个基于集合的度量，并且没有考虑相关文档在前 k 个结果中的位置，因此，在位置 10 中包含一个相关结果的十个结果的排名与在位置 1 中包含一个相关结果的十个结果的排名一样好。

```bash
GET /my-index-000001/_rank_eval
{
  "requests": [
    {
      "id": "JFK query",
      "request": { "query": { "match_all": {} } },
      "ratings": []
    } ],
  "metric": {
    "recall": {
      "k": 20,
      "relevant_rating_threshold": 1
    }
  }
}
```

`recall` 指标采用以下可选参数

|参数|描述|
|--|--|
|`k`|设置每个查询检索的最大文档数。此值将替代查询中的常规大小参数。默认值为 10。|
|`relevant_rating_threshold`|设置文档被视为“相关”的评级阈值。默认值为 `1`。|

#### 平均倒数排序

对于测试套件中的每个查询，此度量计算第一个相关文档的排名的倒数。例如，在位置 3 找到第一个相关结果意味着倒数排名为 1/3。每个查询的倒数排名是测试套件中所有查询的平均值，以给出[平均倒数排序](https://en.wikipedia.org/wiki/Mean_reciprocal_rank)。

```bash
GET /my-index-000001/_rank_eval
{
  "requests": [
    {
      "id": "JFK query",
      "request": { "query": { "match_all": {} } },
      "ratings": []
    } ],
  "metric": {
    "mean_reciprocal_rank": {
      "k": 20,
      "relevant_rating_threshold": 1
    }
  }
}
```

`mean_reciprocal_rank` 度量采用以下可选参数

|参数|描述|
|--|--|
|`k`|设置每个查询检索的最大文档数。此值将替代查询中的常规 `size` 参数。默认值为 10。|
|`relevant_rating_threshold`|设置文档被视为“相关”的评级阈值。默认值为 `1`。|

#### 折损累积增益（Discounted cumulative gain，DCG）

与上述两个指标相比，[折损累积增益](https://en.wikipedia.org/wiki/Discounted_cumulative_gain)同时考虑了搜索结果的排名和评级。

假设高度相关的文档出现在结果列表的顶部时对用户更有用。因此，DCG 公式减少了搜索级别较低的文档的高评级对总体 DCG 指标的贡献。

```bash
GET /my-index-000001/_rank_eval
{
  "requests": [
    {
      "id": "JFK query",
      "request": { "query": { "match_all": {} } },
      "ratings": []
    } ],
  "metric": {
    "dcg": {
      "k": 20,
      "normalize": false
    }
  }
}
```

`dcg` 度量采用以下可选参数

|参数|描述|
|--|--|
|`k`|设置每个查询检索的最大文档数。此值将替代查询中的常规大小参数。默认值为 10。|
|`normalize`|如果设置为 `true`，此度量将计算[归一化DCG](https://en.wikipedia.org/wiki/Discounted_cumulative_gain#Normalized_DCG)。|

#### 期望倒数排序（ERR）

期望倒数排序（ERR）是分级关联案例中经典互易等级的扩展（Olivier Chapelle、Donald Metzler、Ya Zhang和Pierre Grinspan，2009。[期望倒数排序互易等级](https://olivier.chapelle.cc/pub/err.pdf)。）

它基于搜索级联模型的假设，在该模型中，用户按顺序扫描排名的搜索结果，并在满足信息需求的第一个文档处停止。因此，对于问答和导航查询来说，它是一个很好的衡量标准，但对于面向调查的信息需求来说，它就不是那么好了，因为用户希望在前k个结果中找到许多相关文档。

该度量对用户停止读取结果列表的位置的倒数的期望进行建模。这意味着排名靠前的相关文档对总分的贡献很大。然而，如果同一份文件的排名较低，那么它对分数的贡献就会小得多；如果前面有一些相关（但可能不太相关）的文档，则更是如此。这样，ERR度量将折扣显示在非常相关的文档之后的文档。这在相关文档的排序中引入了依赖性的概念，例如精度或DCG没有考虑到这一点。

```bash
GET /my-index-000001/_rank_eval
{
  "requests": [
    {
      "id": "JFK query",
      "request": { "query": { "match_all": {} } },
      "ratings": []
    } ],
  "metric": {
    "expected_reciprocal_rank": {
      "maximum_relevance": 3,
      "k": 20
    }
  }
}
```

`expected_reciprocal_rank` 度量采用以下可选参数

|参数|描述|
|--|--|
|`maximum_relevance`|强制参数。用户提供的相关性判断中使用的最高相关性等级。|
|`k`|设置每个查询检索的最大文档数。此值将替代查询中的常规 `size` 参数。默认值为 10。|

### 响应格式

`_rank_eval` 端点的响应包含定义的质量指标的总体计算结果、包含测试套件中每个查询结果细分的 `details` 部分以及显示单个查询潜在错误的可选 `failures` 部分。响应的格式如下：

```bash
{
  "rank_eval": {
    "metric_score": 0.4,
      "details": {
      "my_query_id1": {
        "metric_score": 0.6,
        "unrated_docs": [
          {
            "_index": "my-index-000001",
            "_id": "1960795"
          }, ...
        ],
        "hits": [
          {
            "hit": {
              "_index": "my-index-000001",
              "_type": "page",
              "_id": "1528558",
              "_score": 7.0556192
            },
            "rating": 1
          }, ...
        ],
        "metric_details": {
          "precision": {
            "relevant_docs_retrieved": 6,
            "docs_retrieved": 10
          }
        }
      },
      "my_query_id2": { [... ] }
    },
    "failures": { [... ] }
  }
}
```

1. `"details": {`：通过定义的指标计算的总体评估质量
2. `"my_query_id1": {`：`details` 部分包含原始请求部分中每个查询的一个条目，由搜索请求id键入
3. `"metric_score": 0.6`：`details` 部分中的 `metric_score` 显示此查询对全局质量度量分数的贡献
4. `"unrated_docs": [`：`unrated_docs` 部分包含此查询的搜索结果中没有评级值的每个文档的 `_index` 和 `_id` 条目。这可用于要求用户提供这些文档的评级
5. `"hit": {`：`hits` 部分显示搜索结果的分组及其提供的评级
6. `"metric_details": {`：`metric_details` 提供了有关计算质量指标的其他信息（例如，检索到的文档中有多少是相关的）。每个指标的内容各不相同，但可以更好地解释结果

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-rank-eval.html)
