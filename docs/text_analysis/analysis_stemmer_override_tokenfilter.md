# Stemmer override 词元过滤器

覆盖词干提取算法：应用自定义映射，并保护这些词项不被词干提取器修改。

此过滤器必须放在任何词干提取过滤器之前。

规则的形式如下：

```text
token1[, ..., tokenN] => override
```

## 可配置参数

- `rules`

  要使用的映射规则列表。

- `rules_path`

  指向映射规则列表文件的路径。此路径可以是相对于 `config` 位置的相对路径，也可以是绝对路径。

## 示例

### 示例 1：通过 `rules_path` 使用规则文件

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求定义了一个自定义分析器 `my_analyzer`，它使用 `standard` 分词器，并按顺序应用 `lowercase`、`custom_stems` 和 `porter_stem` 过滤器。其中 `custom_stems` 是 `stemmer_override` 过滤器，位于 `porter_stem` 之前，其规则从文件中加载：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "filter": [ "lowercase", "custom_stems", "porter_stem" ]
        }
      },
      "filter": {
        "custom_stems": {
          "type": "stemmer_override",
          "rules_path": "analysis/stemmer_override.txt"
        }
      }
    }
  }
}
```

`analysis/stemmer_override.txt` 文件的内容为：

```text
running, runs => run

stemmer => stemmer
```

### 示例 2：通过 `rules` 内联定义规则

也可以直接使用 `rules` 参数内联定义覆盖规则：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "filter": [ "lowercase", "custom_stems", "porter_stem" ]
        }
      },
      "filter": {
        "custom_stems": {
          "type": "stemmer_override",
          "rules": [ "running, runs => run", "stemmer => stemmer" ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-stemmer-override-tokenfilter.html)
