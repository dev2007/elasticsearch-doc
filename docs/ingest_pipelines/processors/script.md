# Script 处理器

对传入文档运行内联（inline）或已存储（stored）的脚本。脚本运行在 `ingest` 上下文中。

脚本处理器使用脚本缓存来避免对每个传入文档重复编译脚本。为提升性能，在生产环境中使用脚本处理器之前，请确保脚本缓存大小配置得当。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `lang` | 否 | `"painless"` | 脚本语言。参阅[可用脚本语言](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/modules-scripting.html)。 |
| `id` | 否 | - | 已存储脚本的 ID。若未指定 `source`，则此参数为必填。参阅[创建或更新已存储脚本 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/painless-put-script-api.html)。 |
| `source` | 否 | - | 内联脚本。若未指定 `id`，则此参数为必填。 |
| `params` | 否 | - | 包含脚本参数的对象。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 访问源字段

脚本处理器将每个传入文档的 JSON source 字段解析为一组 map、list 和原始类型。要用 Painless 脚本访问这些字段，请使用 map 访问操作符 `ctx['my-field']`，也可以使用简写 `ctx.<my-field>` 语法。

**脚本处理器不支持 `ctx['_source']['my-field']` 或 `ctx._source.<my-field>` 语法。**

## 示例 1：从 env 字段提取 tags 字段

```json
POST _ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      {
        "script": {
          "description": "Extract 'tags' from 'env' field",
          "lang": "painless",
          "source": """
            String[] envSplit = ctx['env'].splitOnToken(params['delimiter']);
            ArrayList tags = new ArrayList();
            tags.add(envSplit[params['position']].trim());
            ctx['tags'] = tags;
          """,
          "params": {
            "delimiter": "-",
            "position": 1
          }
        }
      }
    ]
  },
  "docs": [
    {
      "_source": {
        "env": "es01-prod"
      }
    }
  ]
}
```

输出结果：

```json
{
  "docs": [
    {
      "doc": {
        "...": "...",
        "_source": {
          "env": "es01-prod",
          "tags": ["prod"]
        }
      }
    }
  ]
}
```

## 示例 2：访问元数据字段

也可以使用脚本处理器访问元数据字段。以下处理器使用 Painless 脚本设置传入文档的 `_index`：

```json
POST _ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      {
        "script": {
          "description": "Set index based on `lang` field and `dataset` param",
          "lang": "painless",
          "source": """
            ctx['_index'] = ctx['lang'] + '-' + params['dataset'];
          """,
          "params": {
            "dataset": "catalog"
          }
        }
      }
    ]
  },
  "docs": [
    {
      "_index": "generic-index",
      "_source": {
        "lang": "fr"
      }
    }
  ]
}
```

输出结果：

```json
{
  "docs": [
    {
      "doc": {
        "...": "...",
        "_index": "fr-catalog",
        "_source": {
          "lang": "fr"
        }
      }
    }
  ]
}
```

文档的 `_index` 由 `generic-index` 被改为 `fr-catalog`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/script-processor.html)
