# 语义搜索

本教程演示如何使用语义文本（semantic text）功能对数据进行语义搜索。

:::note 提示

语义文本通过在摄取时提供推理并自动提供合理的默认值，简化了推理工作流。你不需要定义模型相关的设置和参数，也不需要创建推理摄取管道。

:::

在 Elastic Stack 中使用语义搜索的推荐方式是遵循 `semantic_text` 工作流。当你需要对索引和查询设置进行更多控制时，仍可以使用完整的推理工作流。

本教程使用 **elasticsearch 服务**进行演示，但你可以使用推理 API 提供的任何服务及其支持的模型。

## 要求

本教程使用 elasticsearch 服务进行演示，该服务会根据需要自动创建。要将 `semantic_text` 字段类型与其他推理服务一起使用，你必须使用**创建推理 API** 创建一个推理端点。

## 步骤 1：创建索引映射

必须创建目标索引的映射 — 目标索引是包含推理端点根据你的输入文本生成的嵌入的索引。目标索引必须有一个 `semantic_text` 类型的字段，用于索引所用推理端点的输出：

```txt
PUT semantic-embeddings
{
  "mappings": {
    "properties": {
      "content": {
        "type": "semantic_text"
      }
    }
  }
}
```

说明：

- `content`：包含生成的嵌入的字段名称。
- 该字段是 `semantic_text` 字段。由于未提供 `inference_id`，因此使用 elasticsearch 服务的默认端点 `.elser-2-elasticsearch`。要使用其他推理服务，你必须先使用创建推理 API 创建一个推理端点，然后在 `semantic_text` 字段映射中通过 `inference_id` 参数指定它。
- 如果你使用网络爬虫或连接器生成索引，则必须更新这些索引的映射以包含 `semantic_text` 字段。映射更新后，你需要运行一次完整的网络爬取或完整的连接器同步。这确保所有现有文档都会被重新处理并用新的语义嵌入更新，从而可以对更新后的数据执行语义搜索。

## 步骤 2：加载数据

在此步骤中，你将加载稍后用于创建嵌入的数据。

使用 **msmarco-passagetest2019-top1000** 数据集，它是 MS MARCO Passage Ranking 数据集的一个子集。它包含 200 个查询，每个查询都附有一个相关文本段落列表。所有唯一的段落及其 ID 已从该数据集中提取并编译为一个 tsv 文件。

步骤：

1. 下载该文件，并使用机器学习 UI 中的 **Data Visualizer** 将其上传到你的集群。
2. 数据被分析后，点击 **Override settings**。
3. 在 **Edit field names** 下，将第一列命名为 `id`，第二列命名为 `content`。点击 **Apply**，然后点击 **Import**。
4. 将索引命名为 `test-data`，然后点击 **Import**。

上传完成后，你将看到一个名为 `test-data` 的索引，包含 **182,469 个文档**。

## 步骤 3：重建索引（Reindex）

通过将数据从 `test-data` 索引重建索引到 `semantic-embeddings` 索引，从文本创建嵌入。`content` 字段中的数据将被重建索引到目标索引的 `content` 语义文本字段中。被重建索引的数据将由与 `content` 语义文本字段关联的推理端点处理：

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

说明：

- 重建索引的默认批处理大小为 1000。将 `size` 减小为更小的数字可以让重建索引过程的更新更快，使你能够密切跟踪进度并及早发现错误。
- 该调用返回一个用于监控进度的任务 ID：

```txt
GET _tasks/<task_id>
```

- 对大型数据集重建索引可能需要很长时间。你可以只使用数据集的一个子集来测试此工作流。方法是取消重建索引过程，仅为已重建索引的子集生成嵌入。以下 API 请求将取消重建索引任务：

```txt
POST _tasks/<task_id>/_cancel
```

## 步骤 4：语义搜索

在数据集被嵌入充实后，你可以使用语义搜索来查询数据。你可以使用 **Query DSL** 或 **ES|QL** 语法。

### 选项 A：Query DSL 语法

在 `semantic` 查询类型中提供 `semantic_text` 字段名称和查询文本。用于为 `semantic_text` 字段生成嵌入的推理端点将被用于处理查询文本：

```txt
GET semantic-embeddings/_search
{
  "query": {
    "semantic": {
      "field": "content",
      "query": "How to avoid muscle soreness while running?"
    }
  }
}
```

- `field`：要执行搜索的 `semantic_text` 字段。
- `query`：查询文本。

最终，你将从 `semantic-embeddings` 索引中收到与查询在含义上最接近的前 10 个文档。

### 选项 B：ES|QL 语法

ES|QL 方式使用 match（`:`）运算符，它会自动检测 `semantic_text` 字段并在其上执行搜索。查询使用 `METADATA _score` 按 `_score` 降序排序：

```txt
POST /_query?format=txt
{
  "query": """
    FROM semantic-embeddings METADATA _score
    | WHERE content: "How to avoid muscle soreness while running?"
    | SORT _score DESC
    | LIMIT 1000
  """
}
```

- `METADATA _score` 子句用于返回每个文档的评分。
- match（`:`）运算符用于 `content` 字段的标准关键词匹配。
- 按评分降序排序，优先显示最相关的结果。
- 将结果限制为 1000 个文档。

参阅“ES|QL 用于搜索”了解使用 ES|QL 语言进行搜索用例的更多信息。

## 更多示例和阅读

- 如果你想在混合搜索中使用 `semantic_text`，请参阅链接的笔记本以获取分步指南。
- 有关如何优化 ELSER 端点的更多信息，请参阅模型文档中的 ELSER 建议部分。
- 要了解有关模型自动伸缩的更多信息，请参阅训练模型自动伸缩页面。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/semantic-search-semantic-text.html)
