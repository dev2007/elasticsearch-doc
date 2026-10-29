# 使用 semantic_text 的混合搜索

本教程演示如何执行混合搜索，即将语义搜索与传统的全文搜索相结合。

在混合搜索中，语义搜索根据文本的含义检索结果，而全文搜索专注于精确的单词匹配。通过结合这两种方法，混合搜索可以提供更相关的结果，特别是在依赖单一方法可能不够的情况下。

在 Elastic Stack 中使用混合搜索的推荐方式是遵循 `semantic_text` 工作流。本教程使用 `elasticsearch` 服务进行演示，但你可以使用推理 API 提供的任何服务及其支持的模型。

## 创建索引映射

目标索引将同时包含用于语义搜索的嵌入和用于全文搜索的原始文本字段。这种结构实现了语义搜索和全文搜索的结合：

```txt
PUT semantic-embeddings
{
  "mappings": {
    "properties": {
      "semantic_text": {
        "type": "semantic_text"
      },
      "content": {
        "type": "text",
        "copy_to": "semantic_text"
      }
    }
  }
}
```

其中：

- 包含为语义搜索生成的嵌入的字段名称。
- 包含用于词法搜索的原始文本的字段名称。
- 存储在 `content` 字段中的文本数据将被复制到 `semantic_text` 并由推理端点处理。

:::note 提示

如果你想在由网络爬虫或连接器填充的索引上运行搜索，你必须更新这些索引的映射以包含 `semantic_text` 字段。映射更新后，你需要运行一次完整的网络爬取或完整的连接器同步。这确保所有现有文档都会被重新处理并用新的语义嵌入更新，从而可以对更新后的数据执行混合搜索。

:::

## 加载数据

在此步骤中，你将加载稍后用于创建嵌入的数据。

使用 `msmarco-passagetest2019-top1000` 数据集，它是 MS MARCO Passage Ranking 数据集的一个子集。它包含 200 个查询，每个查询都附有一个相关文本段落列表。所有唯一的段落及其 ID 已从该数据集中提取并编译为一个 tsv 文件。

下载该文件，并使用机器学习 UI 中的 Data Visualizer 将其上传到你的集群。数据被分析后，点击 Override settings。在 Edit field names 下，将第一列命名为 `id`，第二列命名为 `content`。点击 Apply，然后点击 Import。将索引命名为 `test-data`，然后点击 Import。上传完成后，你将看到一个名为 `test-data` 的索引，包含 182,469 个文档。

## 为混合搜索重建索引

将数据从 `test-data` 索引重建索引到 `semantic-embeddings` 索引。源索引中 `content` 字段的数据被复制到目标索引的 `content` 字段。在创建索引映射时设置的 `copy_to` 参数确保内容被复制到 `semantic_text` 字段。数据在摄取时由推理端点处理以生成嵌入。

此步骤使用 reindex API 来模拟数据摄取。如果你处理的是已被索引的数据（而不是使用 test-data 集），仍然需要重建索引，以确保数据由推理端点处理并生成必要的嵌入：

```txt
POST _reindex?wait_for_completion=false
{
  "source": {
    "index": "test-data",
    "size": 10
  },
  "dest": {
    "index": "semantic-embeddings"
  }
}
```

:::note 提示

重建索引的默认批处理大小为 1000。将 `size` 减小为更小的数字可以让重建索引过程的更新更快，使你能够密切跟踪进度并及早发现错误。

:::

该调用返回一个用于监控进度的任务 ID：

```txt
GET _tasks/<task_id>
```

:::note 提示

对大型数据集重建索引可能需要很长时间。你可以只使用数据集的一个子集来测试此工作流。

:::

要取消重建索引过程，仅为已重建索引的子集生成嵌入：

```txt
POST _tasks/<task_id>/_cancel
```

## 执行混合搜索

将数据重建索引到 `semantic-embeddings` 索引后，你可以执行混合搜索。你可以使用检索器语法或 ES|QL 语法来执行搜索。

### 检索器语法

这种方法使用倒数排序融合（RRF）算法。RRF 是一种合并语义查询和词法查询排名的技术，为在任一搜索中排名靠前的结果赋予更高的权重。这确保最终结果是平衡且相关的。

要从原始文本和查询中提取最相关的片段，可以使用 `highlight` 参数：

```txt
GET semantic-embeddings/_search
{
  "retriever": {
    "rrf": {
      "retrievers": [
        {
          "standard": {
            "query": {
              "match": {
                "content": "How to avoid muscle soreness while running?"
              }
            }
          }
        },
        {
          "standard": {
            "query": {
              "semantic": {
                "field": "semantic_text",
                "query": "How to avoid muscle soreness while running?"
              }
            }
          }
        }
      ]
    }
  }
}
```

其中：

- 第一个 `standard` 检索器代表传统的词法搜索。
- 词法搜索使用指定的短语在 `content` 字段上执行。
- 第二个 `standard` 检索器指语义搜索。
- `semantic_text` 字段用于执行语义搜索。

执行混合搜索后，查询将返回同时匹配语义和词法搜索条件的前 10 个文档。结果包含关于每个文档的详细信息：

```json
{
  "took": 107,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 473,
      "relation": "eq"
    },
    "max_score": null,
    "hits": [
      {
        "_index": "semantic-embeddings",
        "_id": "wv65epIBEMBRnhfTsOFM",
        "_score": 0.032786883,
        "_rank": 1,
        "_source": {
          "semantic_text": {
            "inference": {
              "inference_id": "my-elser-endpoint",
              "model_settings": {
                "task_type": "sparse_embedding"
              },
              "chunks": [
                {
                  "text": "What so many out there do not realize is the importance of what you do after you work out. You may have done the majority of the work, but how you treat your body in the minutes and hours after you exercise has a direct effect on muscle soreness, muscle strength and growth, and staying hydrated. Cool Down. After your last exercise, your workout is not over. The first thing you need to do is cool down. Even if running was all that you did, you still should do light cardio for a few minutes. This brings your heart rate down at a slow and steady pace, which helps you avoid feeling sick after a workout.",
                  "embeddings": {
                    "exercise": 1.571044,
                    "after": 1.3603843,
                    "sick": 1.3281639,
                    "...（其余嵌入权重省略）"
                  }
                }
              ]
            }
          },
          "id": 8408852,
          "content": "What so many out there do not realize is the importance of (...)"
        }
      }
    ]
  }
}
```

### ES|QL 语法

ES|QL 方式使用 match 运算符 `:` 和 match 函数 `match()` 的组合来执行混合搜索：

```txt
POST /_query?format=txt
{
  "query": """
    FROM semantic-embeddings METADATA _score
    | WHERE content: "muscle soreness running?" OR match(semantic_text, "How to avoid muscle soreness while running?", { "boost": 0.75 })
    | SORT _score DESC
    | LIMIT 1000
  """
}
```

其中：

- `METADATA _score` 子句用于返回每个文档的评分。
- match（`:`）运算符用于 `content` 字段的标准关键词匹配。
- 使用 `match()` 函数在 `semantic_text` 字段上执行语义搜索，boost 为 0.75。
- 按评分降序排序并将结果限制为 1000 个。

参阅“ES|QL 用于搜索”了解使用 ES|QL 语言进行搜索用例的更多信息。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/semantic-text-hybrid-search.html)
