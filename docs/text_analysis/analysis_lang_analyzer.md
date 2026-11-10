# 语言分析器

一组用于分析特定语言文本的分析器。支持以下类型：[`arabic`](#arabic-分析器)、[`armenian`](#armenian-分析器)、[`basque`](#basque-分析器)、[`bengali`](#bengali-分析器)、[`brazilian`](#brazilian-分析器)、[`bulgarian`](#bulgarian-分析器)、[`catalan`](#catalan-分析器)、[`cjk`](#cjk-分析器)、[`czech`](#czech-分析器)、[`danish`](#danish-分析器)、[`dutch`](#dutch-分析器)、[`english`](#english-分析器)、[`estonian`](#estonian-分析器)、[`finnish`](#finnish-分析器)、[`french`](#french-分析器)、[`galician`](#galician-分析器)、[`german`](#german-分析器)、[`greek`](#greek-分析器)、[`hindi`](#hindi-分析器)、[`hungarian`](#hungarian-分析器)、[`indonesian`](#indonesian-分析器)、[`irish`](#irish-分析器)、[`italian`](#italian-分析器)、[`latvian`](#latvian-分析器)、[`lithuanian`](#lithuanian-分析器)、[`norwegian`](#norwegian-分析器)、[`persian`](#persian-分析器)、[`portuguese`](#portuguese-分析器)、[`romanian`](#romanian-分析器)、[`russian`](#russian-分析器)、[`serbian`](#serbian-分析器)、[`sorani`](#sorani-分析器)、[`spanish`](#spanish-分析器)、[`swedish`](#swedish-分析器)、[`thai`](#thai-分析器)、[`turkish`](#turkish-分析器)。

## 配置语言分析器

### 停用词

所有分析器都支持在配置中内部设置自定义 `stopwords`，或通过设置 `stopwords_path` 使用外部停用词文件。更多细节参阅 [stop 分析器](/text_analysis/analysis_stop_analyzer)。

### 从词干提取中排除单词

`stem_exclusion` 参数允许你指定一个不应被词干提取的小写单词数组。在内部，此功能通过添加 `keywords` 设置为 `stem_exclusion` 参数值的 [`keyword_marker` 词元过滤器](/text_analysis/analysis_keyword_marker_tokenfilter)来实现。

以下分析器支持设置自定义 `stem_exclusion` 列表：`arabic`、`armenian`、`basque`、`bengali`、`bulgarian`、`catalan`、`czech`、`dutch`、`english`、`finnish`、`french`、`galician`、`german`、`hindi`、`hungarian`、`indonesian`、`irish`、`italian`、`latvian`、`lithuanian`、`norwegian`、`portuguese`、`romanian`、`russian`、`serbian`、`sorani`、`spanish`、`swedish`、`turkish`。

## 重建语言分析器

内置语言分析器可以重建为 `custom` 分析器（如下所述），以便自定义其行为。

如果你不打算将单词排除在词干提取之外（相当于上面的 `stem_exclusion` 参数），则应从自定义分析器配置中移除 `keyword_marker` 词元过滤器。

### `arabic` 分析器

`arabic` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /arabic_example
{
  "settings": {
    "analysis": {
      "filter": {
        "arabic_stop": {
          "type": "stop",
          "stopwords": "_arabic_"
        },
        "arabic_keywords": {
          "type": "keyword_marker",
          "keywords": ["مثال"]
        },
        "arabic_stemmer": {
          "type": "stemmer",
          "language": "arabic"
        }
      },
      "analyzer": {
        "rebuilt_arabic": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "decimal_digit",
            "arabic_stop",
            "arabic_normalization",
            "arabic_keywords",
            "arabic_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `armenian` 分析器

`armenian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /armenian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "armenian_stop": {
          "type": "stop",
          "stopwords": "_armenian_"
        },
        "armenian_keywords": {
          "type": "keyword_marker",
          "keywords": ["օրինակ"]
        },
        "armenian_stemmer": {
          "type": "stemmer",
          "language": "armenian"
        }
      },
      "analyzer": {
        "rebuilt_armenian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "armenian_stop",
            "armenian_keywords",
            "armenian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `basque` 分析器

`basque` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /basque_example
{
  "settings": {
    "analysis": {
      "filter": {
        "basque_stop": {
          "type": "stop",
          "stopwords": "_basque_"
        },
        "basque_keywords": {
          "type": "keyword_marker",
          "keywords": ["Adibidez"]
        },
        "basque_stemmer": {
          "type": "stemmer",
          "language": "basque"
        }
      },
      "analyzer": {
        "rebuilt_basque": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "basque_stop",
            "basque_keywords",
            "basque_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `bengali` 分析器

`bengali` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /bengali_example
{
  "settings": {
    "analysis": {
      "filter": {
        "bengali_stop": {
          "type": "stop",
          "stopwords": "_bengali_"
        },
        "bengali_keywords": {
          "type": "keyword_marker",
          "keywords": ["উদাহরণ"]
        },
        "bengali_stemmer": {
          "type": "stemmer",
          "language": "bengali"
        }
      },
      "analyzer": {
        "rebuilt_bengali": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "decimal_digit",
            "bengali_keywords",
            "indic_normalization",
            "bengali_normalization",
            "bengali_stop",
            "bengali_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `brazilian` 分析器

`brazilian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /brazilian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "brazilian_stop": {
          "type": "stop",
          "stopwords": "_brazilian_"
        },
        "brazilian_keywords": {
          "type": "keyword_marker",
          "keywords": ["exemplo"]
        },
        "brazilian_stemmer": {
          "type": "stemmer",
          "language": "brazilian"
        }
      },
      "analyzer": {
        "rebuilt_brazilian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "brazilian_stop",
            "brazilian_keywords",
            "brazilian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `bulgarian` 分析器

`bulgarian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /bulgarian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "bulgarian_stop": {
          "type": "stop",
          "stopwords": "_bulgarian_"
        },
        "bulgarian_keywords": {
          "type": "keyword_marker",
          "keywords": ["пример"]
        },
        "bulgarian_stemmer": {
          "type": "stemmer",
          "language": "bulgarian"
        }
      },
      "analyzer": {
        "rebuilt_bulgarian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "bulgarian_stop",
            "bulgarian_keywords",
            "bulgarian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `catalan` 分析器

`catalan` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /catalan_example
{
  "settings": {
    "analysis": {
      "filter": {
        "catalan_elision": {
          "type": "elision",
          "articles": [ "d", "l", "m", "n", "s", "t" ],
          "articles_case": true
        },
        "catalan_stop": {
          "type": "stop",
          "stopwords": "_catalan_"
        },
        "catalan_keywords": {
          "type": "keyword_marker",
          "keywords": ["example"]
        },
        "catalan_stemmer": {
          "type": "stemmer",
          "language": "catalan"
        }
      },
      "analyzer": {
        "rebuilt_catalan": {
          "tokenizer": "standard",
          "filter": [
            "catalan_elision",
            "lowercase",
            "catalan_stop",
            "catalan_keywords",
            "catalan_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `cjk` 分析器

你可能会发现 ICU 分析插件中的 `icu_analyzer` 对 CJK 文本的处理效果优于 `cjk` 分析器。请用你的文本和查询进行实验。

`cjk` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /cjk_example
{
  "settings": {
    "analysis": {
      "filter": {
        "english_stop": {
          "type": "stop",
          "stopwords": [
            "a", "and", "are", "as", "at", "be", "but", "by", "for", "if",
            "in", "into", "is", "it", "no", "not", "of", "on", "or", "s",
            "such", "t", "that", "the", "their", "then", "there", "these",
            "they", "this", "to", "was", "will", "with", "www"
          ]
        }
      },
      "analyzer": {
        "rebuilt_cjk": {
          "tokenizer": "standard",
          "filter": [
            "cjk_width",
            "lowercase",
            "cjk_bigram",
            "english_stop"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。默认停用词与 `_english_` 集合**几乎**相同，但不完全相同。

### `czech` 分析器

`czech` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /czech_example
{
  "settings": {
    "analysis": {
      "filter": {
        "czech_stop": {
          "type": "stop",
          "stopwords": "_czech_"
        },
        "czech_keywords": {
          "type": "keyword_marker",
          "keywords": ["příklad"]
        },
        "czech_stemmer": {
          "type": "stemmer",
          "language": "czech"
        }
      },
      "analyzer": {
        "rebuilt_czech": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "czech_stop",
            "czech_keywords",
            "czech_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `danish` 分析器

`danish` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /danish_example
{
  "settings": {
    "analysis": {
      "filter": {
        "danish_stop": {
          "type": "stop",
          "stopwords": "_danish_"
        },
        "danish_keywords": {
          "type": "keyword_marker",
          "keywords": ["eksempel"]
        },
        "danish_stemmer": {
          "type": "stemmer",
          "language": "danish"
        }
      },
      "analyzer": {
        "rebuilt_danish": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "danish_stop",
            "danish_keywords",
            "danish_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `dutch` 分析器

`dutch` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /dutch_example
{
  "settings": {
    "analysis": {
      "filter": {
        "dutch_stop": {
          "type": "stop",
          "stopwords": "_dutch_"
        },
        "dutch_keywords": {
          "type": "keyword_marker",
          "keywords": ["voorbeeld"]
        },
        "dutch_stemmer": {
          "type": "stemmer",
          "language": "dutch"
        },
        "dutch_override": {
          "type": "stemmer_override",
          "rules": [
            "fiets=>fiets",
            "bromfiets=>bromfiets",
            "ei=>eier",
            "kind=>kinder"
          ]
        }
      },
      "analyzer": {
        "rebuilt_dutch": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "dutch_stop",
            "dutch_keywords",
            "dutch_override",
            "dutch_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `english` 分析器

`english` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /english_example
{
  "settings": {
    "analysis": {
      "filter": {
        "english_stop": {
          "type": "stop",
          "stopwords": "_english_"
        },
        "english_keywords": {
          "type": "keyword_marker",
          "keywords": ["example"]
        },
        "english_stemmer": {
          "type": "stemmer",
          "language": "english"
        },
        "english_possessive_stemmer": {
          "type": "stemmer",
          "language": "possessive_english"
        }
      },
      "analyzer": {
        "rebuilt_english": {
          "tokenizer": "standard",
          "filter": [
            "english_possessive_stemmer",
            "lowercase",
            "english_stop",
            "english_keywords",
            "english_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `estonian` 分析器

`estonian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /estonian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "estonian_stop": {
          "type": "stop",
          "stopwords": "_estonian_"
        },
        "estonian_keywords": {
          "type": "keyword_marker",
          "keywords": ["näide"]
        },
        "estonian_stemmer": {
          "type": "stemmer",
          "language": "estonian"
        }
      },
      "analyzer": {
        "rebuilt_estonian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "estonian_stop",
            "estonian_keywords",
            "estonian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `finnish` 分析器

`finnish` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /finnish_example
{
  "settings": {
    "analysis": {
      "filter": {
        "finnish_stop": {
          "type": "stop",
          "stopwords": "_finnish_"
        },
        "finnish_keywords": {
          "type": "keyword_marker",
          "keywords": ["esimerkki"]
        },
        "finnish_stemmer": {
          "type": "stemmer",
          "language": "finnish"
        }
      },
      "analyzer": {
        "rebuilt_finnish": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "finnish_stop",
            "finnish_keywords",
            "finnish_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `french` 分析器

`french` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /french_example
{
  "settings": {
    "analysis": {
      "filter": {
        "french_elision": {
          "type": "elision",
          "articles_case": true,
          "articles": [
            "l", "m", "t", "qu", "n", "s", "j", "d", "c", "jusqu", "quoiqu",
            "lorsqu", "puisqu"
          ]
        },
        "french_stop": {
          "type": "stop",
          "stopwords": "_french_"
        },
        "french_keywords": {
          "type": "keyword_marker",
          "keywords": ["Example"]
        },
        "french_stemmer": {
          "type": "stemmer",
          "language": "light_french"
        }
      },
      "analyzer": {
        "rebuilt_french": {
          "tokenizer": "standard",
          "filter": [
            "french_elision",
            "lowercase",
            "french_stop",
            "french_keywords",
            "french_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `galician` 分析器

`galician` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /galician_example
{
  "settings": {
    "analysis": {
      "filter": {
        "galician_stop": {
          "type": "stop",
          "stopwords": "_galician_"
        },
        "galician_keywords": {
          "type": "keyword_marker",
          "keywords": ["exemplo"]
        },
        "galician_stemmer": {
          "type": "stemmer",
          "language": "galician"
        }
      },
      "analyzer": {
        "rebuilt_galician": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "galician_stop",
            "galician_keywords",
            "galician_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `german` 分析器

`german` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /german_example
{
  "settings": {
    "analysis": {
      "filter": {
        "german_stop": {
          "type": "stop",
          "stopwords": "_german_"
        },
        "german_keywords": {
          "type": "keyword_marker",
          "keywords": ["Beispiel"]
        },
        "german_stemmer": {
          "type": "stemmer",
          "language": "light_german"
        }
      },
      "analyzer": {
        "rebuilt_german": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "german_stop",
            "german_keywords",
            "german_normalization",
            "german_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `greek` 分析器

`greek` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /greek_example
{
  "settings": {
    "analysis": {
      "filter": {
        "greek_stop": {
          "type": "stop",
          "stopwords": "_greek_"
        },
        "greek_lowercase": {
          "type": "lowercase",
          "language": "greek"
        },
        "greek_keywords": {
          "type": "keyword_marker",
          "keywords": ["παράδειγμα"]
        },
        "greek_stemmer": {
          "type": "stemmer",
          "language": "greek"
        }
      },
      "analyzer": {
        "rebuilt_greek": {
          "tokenizer": "standard",
          "filter": [
            "greek_lowercase",
            "greek_stop",
            "greek_keywords",
            "greek_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `hindi` 分析器

`hindi` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /hindi_example
{
  "settings": {
    "analysis": {
      "filter": {
        "hindi_stop": {
          "type": "stop",
          "stopwords": "_hindi_"
        },
        "hindi_keywords": {
          "type": "keyword_marker",
          "keywords": ["उदाहरण"]
        },
        "hindi_stemmer": {
          "type": "stemmer",
          "language": "hindi"
        }
      },
      "analyzer": {
        "rebuilt_hindi": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "decimal_digit",
            "hindi_keywords",
            "indic_normalization",
            "hindi_normalization",
            "hindi_stop",
            "hindi_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `hungarian` 分析器

`hungarian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /hungarian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "hungarian_stop": {
          "type": "stop",
          "stopwords": "_hungarian_"
        },
        "hungarian_keywords": {
          "type": "keyword_marker",
          "keywords": ["példa"]
        },
        "hungarian_stemmer": {
          "type": "stemmer",
          "language": "hungarian"
        }
      },
      "analyzer": {
        "rebuilt_hungarian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "hungarian_stop",
            "hungarian_keywords",
            "hungarian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `indonesian` 分析器

`indonesian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /indonesian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "indonesian_stop": {
          "type": "stop",
          "stopwords": "_indonesian_"
        },
        "indonesian_keywords": {
          "type": "keyword_marker",
          "keywords": ["contoh"]
        },
        "indonesian_stemmer": {
          "type": "stemmer",
          "language": "indonesian"
        }
      },
      "analyzer": {
        "rebuilt_indonesian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "indonesian_stop",
            "indonesian_keywords",
            "indonesian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `irish` 分析器

`irish` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /irish_example
{
  "settings": {
    "analysis": {
      "filter": {
        "irish_hyphenation": {
          "type": "stop",
          "stopwords": [ "h", "n", "t" ],
          "ignore_case": true
        },
        "irish_elision": {
          "type": "elision",
          "articles": [ "d", "m", "b" ],
          "articles_case": true
        },
        "irish_stop": {
          "type": "stop",
          "stopwords": "_irish_"
        },
        "irish_lowercase": {
          "type": "lowercase",
          "language": "irish"
        },
        "irish_keywords": {
          "type": "keyword_marker",
          "keywords": ["sampla"]
        },
        "irish_stemmer": {
          "type": "stemmer",
          "language": "irish"
        }
      },
      "analyzer": {
        "rebuilt_irish": {
          "tokenizer": "standard",
          "filter": [
            "irish_hyphenation",
            "irish_elision",
            "irish_lowercase",
            "irish_stop",
            "irish_keywords",
            "irish_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `italian` 分析器

`italian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /italian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "italian_elision": {
          "type": "elision",
          "articles": [
            "c", "l", "all", "dall", "dell", "nell", "sull", "coll", "pell",
            "gl", "agl", "dagl", "degl", "negl", "sugl", "un", "m", "t", "s",
            "v", "d"
          ],
          "articles_case": true
        },
        "italian_stop": {
          "type": "stop",
          "stopwords": "_italian_"
        },
        "italian_keywords": {
          "type": "keyword_marker",
          "keywords": ["esempio"]
        },
        "italian_stemmer": {
          "type": "stemmer",
          "language": "light_italian"
        }
      },
      "analyzer": {
        "rebuilt_italian": {
          "tokenizer": "standard",
          "filter": [
            "italian_elision",
            "lowercase",
            "italian_stop",
            "italian_keywords",
            "italian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `latvian` 分析器

`latvian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /latvian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "latvian_stop": {
          "type": "stop",
          "stopwords": "_latvian_"
        },
        "latvian_keywords": {
          "type": "keyword_marker",
          "keywords": ["piemērs"]
        },
        "latvian_stemmer": {
          "type": "stemmer",
          "language": "latvian"
        }
      },
      "analyzer": {
        "rebuilt_latvian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "latvian_stop",
            "latvian_keywords",
            "latvian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `lithuanian` 分析器

`lithuanian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /lithuanian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "lithuanian_stop": {
          "type": "stop",
          "stopwords": "_lithuanian_"
        },
        "lithuanian_keywords": {
          "type": "keyword_marker",
          "keywords": ["pavyzdys"]
        },
        "lithuanian_stemmer": {
          "type": "stemmer",
          "language": "lithuanian"
        }
      },
      "analyzer": {
        "rebuilt_lithuanian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "lithuanian_stop",
            "lithuanian_keywords",
            "lithuanian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `norwegian` 分析器

`norwegian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /norwegian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "norwegian_stop": {
          "type": "stop",
          "stopwords": "_norwegian_"
        },
        "norwegian_keywords": {
          "type": "keyword_marker",
          "keywords": ["eksempel"]
        },
        "norwegian_stemmer": {
          "type": "stemmer",
          "language": "norwegian"
        }
      },
      "analyzer": {
        "rebuilt_norwegian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "norwegian_stop",
            "norwegian_keywords",
            "norwegian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `persian` 分析器

`persian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /persian_example
{
  "settings": {
    "analysis": {
      "char_filter": {
        "zero_width_spaces": {
          "type": "mapping",
          "mappings": [ "\\u200C=>\\u0020" ]
        }
      },
      "filter": {
        "persian_stop": {
          "type": "stop",
          "stopwords": "_persian_"
        }
      },
      "analyzer": {
        "rebuilt_persian": {
          "tokenizer": "standard",
          "char_filter": [ "zero_width_spaces" ],
          "filter": [
            "lowercase",
            "decimal_digit",
            "arabic_normalization",
            "persian_normalization",
            "persian_stop"
          ]
        }
      }
    }
  }
}
```

1. 用 ASCII 空格替换零宽不连字（zero-width non-joiner）。
2. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。

### `portuguese` 分析器

`portuguese` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /portuguese_example
{
  "settings": {
    "analysis": {
      "filter": {
        "portuguese_stop": {
          "type": "stop",
          "stopwords": "_portuguese_"
        },
        "portuguese_keywords": {
          "type": "keyword_marker",
          "keywords": ["exemplo"]
        },
        "portuguese_stemmer": {
          "type": "stemmer",
          "language": "light_portuguese"
        }
      },
      "analyzer": {
        "rebuilt_portuguese": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "portuguese_stop",
            "portuguese_keywords",
            "portuguese_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `romanian` 分析器

`romanian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /romanian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "romanian_stop": {
          "type": "stop",
          "stopwords": "_romanian_"
        },
        "romanian_keywords": {
          "type": "keyword_marker",
          "keywords": ["exemplu"]
        },
        "romanian_stemmer": {
          "type": "stemmer",
          "language": "romanian"
        }
      },
      "analyzer": {
        "rebuilt_romanian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "romanian_stop",
            "romanian_keywords",
            "romanian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `russian` 分析器

`russian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /russian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "russian_stop": {
          "type": "stop",
          "stopwords": "_russian_"
        },
        "russian_keywords": {
          "type": "keyword_marker",
          "keywords": ["пример"]
        },
        "russian_stemmer": {
          "type": "stemmer",
          "language": "russian"
        }
      },
      "analyzer": {
        "rebuilt_russian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "russian_stop",
            "russian_keywords",
            "russian_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `serbian` 分析器

`serbian` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /serbian_example
{
  "settings": {
    "analysis": {
      "filter": {
        "serbian_stop": {
          "type": "stop",
          "stopwords": "_serbian_"
        },
        "serbian_keywords": {
          "type": "keyword_marker",
          "keywords": ["пример"]
        },
        "serbian_stemmer": {
          "type": "stemmer",
          "language": "serbian"
        }
      },
      "analyzer": {
        "rebuilt_serbian": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "serbian_stop",
            "serbian_keywords",
            "serbian_stemmer",
            "serbian_normalization"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `sorani` 分析器

`sorani` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /sorani_example
{
  "settings": {
    "analysis": {
      "filter": {
        "sorani_stop": {
          "type": "stop",
          "stopwords": "_sorani_"
        },
        "sorani_keywords": {
          "type": "keyword_marker",
          "keywords": ["mînak"]
        },
        "sorani_stemmer": {
          "type": "stemmer",
          "language": "sorani"
        }
      },
      "analyzer": {
        "rebuilt_sorani": {
          "tokenizer": "standard",
          "filter": [
            "sorani_normalization",
            "lowercase",
            "decimal_digit",
            "sorani_stop",
            "sorani_keywords",
            "sorani_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `spanish` 分析器

`spanish` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /spanish_example
{
  "settings": {
    "analysis": {
      "filter": {
        "spanish_stop": {
          "type": "stop",
          "stopwords": "_spanish_"
        },
        "spanish_keywords": {
          "type": "keyword_marker",
          "keywords": ["ejemplo"]
        },
        "spanish_stemmer": {
          "type": "stemmer",
          "language": "light_spanish"
        }
      },
      "analyzer": {
        "rebuilt_spanish": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "spanish_stop",
            "spanish_keywords",
            "spanish_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `swedish` 分析器

`swedish` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /swedish_example
{
  "settings": {
    "analysis": {
      "filter": {
        "swedish_stop": {
          "type": "stop",
          "stopwords": "_swedish_"
        },
        "swedish_keywords": {
          "type": "keyword_marker",
          "keywords": ["exempel"]
        },
        "swedish_stemmer": {
          "type": "stemmer",
          "language": "swedish"
        }
      },
      "analyzer": {
        "rebuilt_swedish": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "swedish_stop",
            "swedish_keywords",
            "swedish_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

### `thai` 分析器

`thai` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /thai_example
{
  "settings": {
    "analysis": {
      "filter": {
        "thai_stop": {
          "type": "stop",
          "stopwords": "_thai_"
        }
      },
      "analyzer": {
        "rebuilt_thai": {
          "tokenizer": "thai",
          "filter": [
            "lowercase",
            "decimal_digit",
            "thai_stop"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。

### `turkish` 分析器

`turkish` 分析器可以按如下方式重建为 `custom` 分析器：

```bash
PUT /turkish_example
{
  "settings": {
    "analysis": {
      "filter": {
        "turkish_stop": {
          "type": "stop",
          "stopwords": "_turkish_"
        },
        "turkish_lowercase": {
          "type": "lowercase",
          "language": "turkish"
        },
        "turkish_keywords": {
          "type": "keyword_marker",
          "keywords": ["örnek"]
        },
        "turkish_stemmer": {
          "type": "stemmer",
          "language": "turkish"
        }
      },
      "analyzer": {
        "rebuilt_turkish": {
          "tokenizer": "standard",
          "filter": [
            "apostrophe",
            "turkish_lowercase",
            "turkish_stop",
            "turkish_keywords",
            "turkish_stemmer"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 除非有单词应被排除在词干提取之外，否则应移除此过滤器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-lang-analyzer.html)
