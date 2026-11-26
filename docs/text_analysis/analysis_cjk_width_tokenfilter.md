# CJK width 词元过滤器

归一化 CJK（中文、日文、韩文）字符的宽度差异：

- 将全角 ASCII 字符变体折叠为等价的基本拉丁（basic Latin）字符
- 将半角片假名（Katakana）字符变体折叠为等价的假名（Kana）字符

此过滤器已包含在 Elasticsearch 内置的 [CJK 语言分析器](/text_analysis/analysis_lang_analyzer#cjk-分析器)中。它使用 Lucene 的 CJKWidthFilter。

::::note 提示
此词元过滤器可视为 NFKC/NFKD Unicode 归一化的一个子集。如需完整的归一化支持，请参见 `analysis-icu` 插件。
::::

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求演示了 `cjk_width` 词元过滤器的工作方式：

```bash
GET /_analyze
{
  "tokenizer" : "standard",
  "filter" : ["cjk_width"],
  "text" : "ｼｰｻｲﾄﾞﾗｲﾅｰ"
}
```

该过滤器产生以下词元：

```text
シーサイドライナー
```

半角片假名 `ｼｰｻｲﾄﾞﾗｲﾅｰ` 被折叠为全角假名 `シーサイドライナー`。

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 CJK width 词元过滤器配置一个新的自定义分析器：

```bash
PUT /cjk_width_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_cjk_width": {
          "tokenizer": "standard",
          "filter": [ "cjk_width" ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-cjk-width-tokenfilter.html)
