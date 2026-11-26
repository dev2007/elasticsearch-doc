# Stemmer 词元过滤器

为多种语言提供算法词干提取，其中部分语言带有额外变体。受支持的语言列表见 `language` 参数。

未自定义时，该过滤器默认对英语使用 `porter` 词干提取算法。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 stemmer 过滤器默认的 `porter` 词干提取算法，将 `the foxes jumping quickly` 词干提取为 `the fox jump quickli`：

```bash
GET /_analyze
{
  "tokenizer": "standard",
  "filter": [ "stemmer" ],
  "text": "the foxes jumping quickly"
}
```

该过滤器产生以下词元：

```text
[ the, fox, jump, quickli ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 stemmer 过滤器配置一个新的自定义分析器：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "whitespace",
          "filter": [ "stemmer" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `language`

  （可选，字符串）用于对词元进行词干提取的、与语言相关的词干提取算法。默认为 `english`。

  如果同时指定了 `language` 和 `name` 参数，则使用 `language` 参数的值。

  可用值按语言排序如下：

  | 语言 | 可用值 |
  |---|---|
  | 阿拉伯语（Arabic） | `arabic` |
  | 亚美尼亚语（Armenian） | `armenian` |
  | 巴斯克语（Basque） | `basque` |
  | 孟加拉语（Bengali） | `bengali` |
  | 巴西葡萄牙语（Brazilian Portuguese） | `brazilian` |
  | 保加利亚语（Bulgarian） | `bulgarian` |
  | 加泰罗尼亚语（Catalan） | `catalan` |
  | 捷克语（Czech） | `czech` |
  | 丹麦语（Danish） | `danish` |
  | 荷兰语（Dutch） | `dutch`、`dutch_kp`（自 8.16.0 起弃用） |
  | 英语（English） | `english`、`light_english`、`lovins`（自 8.16.0 起弃用）、`minimal_english`、`porter2`、`possessive_english` |
  | 爱沙尼亚语（Estonian） | `estonian` |
  | 芬兰语（Finnish） | `finnish`、`light_finnish` |
  | 法语（French） | `light_french`、`french`、`minimal_french` |
  | 加利西亚语（Galician） | `galician`、`minimal_galician`（仅复数步骤） |
  | 德语（German） | `light_german`、`german`、`german2`、`minimal_german` |
  | 希腊语（Greek） | `greek` |
  | 印地语（Hindi） | `hindi` |
  | 匈牙利语（Hungarian） | `hungarian`、`light_hungarian` |
  | 印度尼西亚语（Indonesian） | `indonesian` |
  | 爱尔兰语（Irish） | `irish` |
  | 意大利语（Italian） | `light_italian`、`italian` |
  | 库尔德语（索拉尼语，Sorani） | `sorani` |
  | 拉脱维亚语（Latvian） | `latvian` |
  | 立陶宛语（Lithuanian） | `lithuanian` |
  | 挪威语（书面语，Bokmål） | `norwegian`、`light_norwegian`、`minimal_norwegian` |
  | 挪威语（新挪威语，Nynorsk） | `light_nynorsk`、`minimal_nynorsk` |
  | 波斯语（Persian） | `persian` |
  | 葡萄牙语（Portuguese） | `light_portuguese`、`minimal_portuguese`、`portuguese`、`portuguese_rslp` |
  | 罗马尼亚语（Romanian） | `romanian` |
  | 俄语（Russian） | `russian`、`light_russian` |
  | 塞尔维亚语（Serbian） | `serbian` |
  | 西班牙语（Spanish） | `light_spanish`、`spanish`、`spanish_plural` |
  | 瑞典语（Swedish） | `swedish`、`light_swedish` |
  | 土耳其语（Turkish） | `turkish` |

- `name`

  `language` 参数的别名。如果同时指定了 `name` 和 `language` 参数，则使用 `language` 参数的值。

## 自定义并添加到分析器

要自定义 stemmer 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

以下示例创建了一个使用 `light_german` 算法的自定义 stemmer 过滤器：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "filter": [ "lowercase", "my_stemmer" ]
        }
      },
      "filter": {
        "my_stemmer": {
          "type": "stemmer",
          "language": "light_german"
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-stemmer-tokenfilter.html)
