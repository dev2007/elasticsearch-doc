# path_hierarchy 分词器

`path_hierarchy` 分词器接受文件系统路径等分层值，按路径分隔符拆分，并为树中的每个组件产出一个词项。`path_hierarchy` 分词器底层使用 Lucene 的 PathHierarchyTokenizer。

## 示例输出

```bash
POST _analyze
{
  "tokenizer": "path_hierarchy",
  "text": "/one/two/three"
}
```

产出的词项：

```text
[ /one, /one/two, /one/two/three ]
```

## 配置

`path_hierarchy` 分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `delimiter` | 用作路径分隔符的字符。默认为 `/`。 |
| `replacement` | 用于替换分隔符的可选字符。默认为分隔符本身。 |
| `buffer_size` | 单次读取到词项缓冲区中的字符数。默认为 `1024`。词项缓冲区会按此大小增长，直到所有文本被读取完毕。建议不要更改此设置。 |
| `reverse` | 如果为 `true`，则使用 Lucene 的 ReversePathHierarchyTokenizer，适用于域名等类似的层级结构。默认为 `false`。 |
| `skip` | 要跳过的初始词元数量。默认为 `0`。 |

## 配置示例

在本示例中，我们配置 `path_hierarchy` 分词器按 `-` 字符拆分，并将其替换为 `/`。前两个词元被跳过：

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "my_tokenizer"
        }
      },
      "tokenizer": {
        "my_tokenizer": {
          "type": "path_hierarchy",
          "delimiter": "-",
          "replacement": "/",
          "skip": 2
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "one-two-three-four-five"
}
```

产出的词项：

```text
[ /three, /three/four, /three/four/five ]
```

如果我们将 `reverse` 设置为 `true`，则会产出以下内容：

```text
[ one/two/three/, two/three/, three/ ]
```

## 详细示例

`path_hierarchy` 分词器的一个常见用例是按文件路径过滤结果。如果在索引文件路径的同时索引数据，使用 `path_hierarchy` 分词器分析路径，就可以按文件路径字符串的不同部分过滤结果。

本示例将索引配置为拥有两个自定义分析器，并将这些分析器应用于将存储文件名的 `file_path` 文本字段的多字段（multifield）。两个分析器中的一个使用反向分词。随后索引一些示例文档，代表两个不同用户的照片文件夹中的一些照片文件路径。

```bash
PUT file-path-test
{
  "settings": {
    "analysis": {
      "analyzer": {
        "custom_path_tree": {
          "tokenizer": "custom_hierarchy"
        },
        "custom_path_tree_reversed": {
          "tokenizer": "custom_hierarchy_reversed"
        }
      },
      "tokenizer": {
        "custom_hierarchy": {
          "type": "path_hierarchy",
          "delimiter": "/"
        },
        "custom_hierarchy_reversed": {
          "type": "path_hierarchy",
          "delimiter": "/",
          "reverse": "true"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "file_path": {
        "type": "text",
        "fields": {
          "tree": {
            "type": "text",
            "analyzer": "custom_path_tree"
          },
          "tree_reversed": {
            "type": "text",
            "analyzer": "custom_path_tree_reversed"
          }
        }
      }
    }
  }
}

POST file-path-test/_doc/1
{
  "file_path": "/User/alice/photos/2017/05/16/my_photo1.jpg"
}

POST file-path-test/_doc/2
{
  "file_path": "/User/alice/photos/2017/05/16/my_photo2.jpg"
}

POST file-path-test/_doc/3
{
  "file_path": "/User/alice/photos/2017/05/16/my_photo3.jpg"
}

POST file-path-test/_doc/4
{
  "file_path": "/User/alice/photos/2017/05/15/my_photo1.jpg"
}

POST file-path-test/_doc/5
{
  "file_path": "/User/bob/photos/2017/05/16/my_photo1.jpg"
}
```

### 按文件路径搜索（match 查询）

针对 `text` 字段搜索特定文件路径字符串会匹配所有示例文档。由于 Bob 的文档相关性最高而排在最前，这是因为 `bob` 也是标准分析器创建的词项之一，从而提升了 Bob 文档的相关性。

```bash
GET file-path-test/_search
{
  "query": {
    "match": {
      "file_path": "/User/bob/photos/2017/05"
    }
  }
}
```

### 按目录过滤（file_path.tree 上的 term 查询）

使用 `file_path.tree` 字段，可以轻松匹配或过滤存在于特定目录中的文件路径的文档。

```bash
GET file-path-test/_search
{
  "query": {
    "term": {
      "file_path.tree": "/User/alice/photos/2017/05/16"
    }
  }
}
```

### 从路径末尾匹配（reverse 字段）

利用此分词器的 `reverse` 参数，还可以从文件路径的另一端进行匹配，例如单个文件名或深层次的子目录。以下示例通过映射中配置为使用 `reverse` 参数的 `file_path.tree_reversed` 字段，搜索任何目录中所有名为 `my_photo1.jpg` 的文件。

```bash
GET file-path-test/_search
{
  "query": {
    "term": {
      "file_path.tree_reversed": {
        "value": "my_photo1.jpg"
      }
    }
  }
}
```

### 查看词元（正向与反向）

同时查看正向与反向生成的词元，有助于了解为同一个文件路径值创建的词元。

```bash
POST file-path-test/_analyze
{
  "analyzer": "custom_path_tree",
  "text": "/User/alice/photos/2017/05/16/my_photo1.jpg"
}

POST file-path-test/_analyze
{
  "analyzer": "custom_path_tree_reversed",
  "text": "/User/alice/photos/2017/05/16/my_photo1.jpg"
}
```

### 将路径过滤与其他搜索组合

将文件路径过滤与其他类型的搜索组合使用也很有用，例如下例查找文件路径中包含 `16` 且必须位于 Alice 照片目录中的所有文件。

```bash
GET file-path-test/_search
{
  "query": {
    "bool": {
      "must": {
        "match": { "file_path": "16" }
      },
      "filter": {
        "term": { "file_path.tree": "/User/alice" }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-pathhierarchy-tokenizer.html)
