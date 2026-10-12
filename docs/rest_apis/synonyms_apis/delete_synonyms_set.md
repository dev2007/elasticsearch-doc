# 删除同义词集 API

删除一个同义词集。

```txt
DELETE _synonyms/<synonyms_set>
```

## 前置条件

- 此 API 需要 `manage_search_synonyms` 集群权限。
- 你只能删除**未被**任何索引分析器使用的同义词集。参见下方的「删除同义词集的分析器要求」。

## 路径参数

`<synonyms_set>`

（必需，字符串）要删除的同义词集标识符。

## 响应码

- `400`：未提供 `synonyms_set` 标识符，或者由于同义词集不满足指定的要求而无法删除。
- `404`：（缺少资源）未找到标识符为 `synonyms_set` 的同义词集。

## 示例

以下示例删除名为 `my-synonyms-set` 的同义词集：

```txt
DELETE _synonyms/my-synonyms-set
```

## 删除同义词集的分析器要求

同义词集可用于[同义词图词元过滤器](/text_analysis/token-graph-tokenizers_and_filters)和[同义词词元过滤器](/text_analysis/analysis-tokenizers_and_filters)，这些过滤器可能是搜索分析器的一部分。

当索引被恢复时（例如节点启动或索引变为打开状态），分析器必须被加载 — 即使分析器未在任何字段映射中使用，它在索引恢复阶段也必须是可加载的。

:::important 重要

如果任何分析器无法加载，索引将变得不可用，集群状态会变为**红色或黄色**（分片不可用）。为防止这种情况，正在被分析器使用的同义词集**无法删除**。删除尝试会返回 `400` 响应：

```json
{
  "error": {
    "root_cause": [
      {
        "type": "illegal_argument_exception",
        "reason": "synonyms set [my-synonyms-set] cannot be deleted as it is used in the following indices: index-1, index-2"
      }
    ],
    "type": "illegal_argument_exception",
    "reason": "synonyms set [my-synonyms-set] cannot be deleted as it is used in the following indices: index-1, index-2"
  },
  "status": 400
}
```

:::

**如何移除正在使用中的同义词集：**

1. 创建一个不包含引用该同义词集的词元过滤器的新索引。
2. 使用 reindex API 将数据复制过去。
3. 删除旧索引。
4. 一旦同义词集不再被任何分析器使用，删除请求就会成功。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-synonyms-set.html)
