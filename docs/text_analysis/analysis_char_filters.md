# 字符过滤器参考

字符过滤器用于在字符流传递给分词器之前对其进行预处理。

字符过滤器接收原始文本字符流，可以通过添加、移除或更改字符来转换该流。例如，字符过滤器可以将印度-阿拉伯数字（٠‎١٢٣٤٥٦٧٨‎٩‎）转换为其对应的阿拉伯-拉丁数字（0123456789），也可以从字符流中剥离 `<b>` 等 HTML 元素。

Elasticsearch 内置了多个字符过滤器，可用于构建自定义分析器。

## 内置字符过滤器

| 字符过滤器 | 描述 |
|:--|:--|
| **[HTML Strip 字符过滤器](/text_analysis/analysis_htmlstrip_charfilter)** | `html_strip` 字符过滤器剥离 `<b>` 等 HTML 元素，并将 `&amp;` 等 HTML 实体解码为其对应的值。 |
| **[Mapping 字符过滤器](/text_analysis/analysis_mapping_charfilter)** | `mapping` 字符过滤器将出现的指定字符串替换为指定的替换内容。 |
| **[Pattern Replace 字符过滤器](/text_analysis/analysis_pattern_replace_charfilter)** | `pattern_replace` 字符过滤器将匹配正则表达式的任何字符替换为指定的替换内容。 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-charfilters.html)
