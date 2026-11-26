# 词元过滤器参考

词元过滤器（token filter）接受来自分词器的词元流，可以修改词元（如小写化）、删除词元（如移除停用词）或添加词元（如同义词）。

Elasticsearch 提供了许多内置词元过滤器，可用于构建自定义分析器。

## 内置词元过滤器

| 词元过滤器 | 说明 |
|:--|:--|
| [Apostrophe](/text_analysis/analysis_apostrophe_tokenfilter) | 去除撇号后的所有字符 |
| [ASCII folding](/text_analysis/analysis_asciifolding_tokenfilter) | 将非 Basic Latin 字符转换为其 ASCII 等价形式 |
| [CJK bigram](/text_analysis/analysis_cjk_bigram_tokenfilter) | 将 CJK 词元组合成二元组 |
| [CJK width](/text_analysis/analysis_cjk_width_tokenfilter) | 归一化 CJK 字符的宽度差异 |
| [Classic](/text_analysis/analysis_classic_tokenfilter) | 移除英文所有格和缩略词中的点号 |
| [Common grams](/text_analysis/analysis_common_grams_tokenfilter) | 为常见词组合生成二元组 |
| [Conditional](/text_analysis/analysis_condition_tokenfilter) | 仅对满足条件的词元应用其他过滤器 |
| [Decimal digit](/text_analysis/analysis_decimal_digit_tokenfilter) | 将 Unicode 十进制数字转换为 ASCII 数字 |
| [Delimited payload](/text_analysis/analysis_delimited_payload_tokenfilter) | 按分隔符将词元流拆分为词元与载荷 |
| [Dictionary decompounder](/text_analysis/analysis_dict_decomp_tokenfilter) | 基于词典拆分复合词 |
| [Edge n-gram](/text_analysis/analysis_edgengram_tokenfilter) | 从词元开头生成 n 元组 |
| [Elision](/text_analysis/analysis_elision_tokenfilter) | 移除词元开头的省文撇 |
| [Fingerprint](/text_analysis/analysis_fingerprint_tokenfilter) | 将词元流折叠为单个词元 |
| [Flatten graph](/text_analysis/analysis_flatten_graph_tokenfilter) | 将词元图扁平化为单位置词元流 |
| [Hunspell](/text_analysis/analysis_hunspell_tokenfilter) | 基于 Hunspell 词典的词干提取 |
| [Hyphenation decompounder](/text_analysis/analysis_hyp_decomp_tokenfilter) | 基于断字规则拆分复合词 |
| [Keep types](/text_analysis/analysis_keep_types_tokenfilter) | 仅保留指定类型的词元 |
| [Keep words](/text_analysis/analysis_keep_words_tokenfilter) | 仅保留指定词表中的词元 |
| [Keyword marker](/text_analysis/analysis_keyword_marker_tokenfilter) | 标记词元以跳过词干提取 |
| [Keyword repeat](/text_analysis/analysis_keyword_repeat_tokenfilter) | 对每个词元输出两次 |
| [KStem](/text_analysis/analysis_kstem_tokenfilter) | 轻量级英语词干提取 |
| [Length](/text_analysis/analysis_length_tokenfilter) | 移除过长或过短的词元 |
| [Limit token count](/text_analysis/analysis_limit_token_count_tokenfilter) | 限制词元数量 |
| [Lowercase](/text_analysis/analysis_lowercase_tokenfilter) | 将词元小写化 |
| [MinHash](/text_analysis/analysis_minhash_tokenfilter) | 计算 MinHash 签名 |
| [Multiplexer](/text_analysis/analysis_multiplexer_tokenfilter) | 在同一位置输出多个过滤结果 |
| [N-gram](/text_analysis/analysis_ngram_tokenfilter) | 生成 n 元组 |
| [Normalization](/text_analysis/analysis_normalization_tokenfilter) | 语言专用的字符归一化 |
| [Pattern capture](/text_analysis/analysis_pattern_capture_tokenfilter) | 按正则捕获组生成词元 |
| [Pattern replace](/text_analysis/analysis_pattern_replace_tokenfilter) | 按正则替换词元内容 |
| [Phonetic](/text_analysis/analysis_phonetic_tokenfilter) | 语音编码 |
| [Porter stem](/text_analysis/analysis_porterstem_tokenfilter) | Porter 英语词干提取 |
| [Predicate script](/text_analysis/analysis_predicatefilter_tokenfilter) | 移除不满足谓词脚本的词元 |
| [Remove duplicates](/text_analysis/analysis_remove_duplicates_tokenfilter) | 移除相同位置的重复词元 |
| [Reverse](/text_analysis/analysis_reverse_tokenfilter) | 反转词元中的字符 |
| [Shingle](/text_analysis/analysis_shingle_tokenfilter) | 生成词元组合 |
| [Snowball](/text_analysis/analysis_snowball_tokenfilter) | Snowball 词干提取 |
| [Stemmer](/text_analysis/analysis_stemmer_tokenfilter) | 多语言词干提取 |
| [Stemmer override](/text_analysis/analysis_stemmer_override_tokenfilter) | 用规则表覆盖词干提取结果 |
| [Stop](/text_analysis/analysis_stop_tokenfilter) | 移除停用词 |
| [Synonym](/text_analysis/analysis_synonym_tokenfilter) | 同义词扩展 |
| [Synonym graph](/text_analysis/analysis_synonym_graph_tokenfilter) | 支持多词同义词的图形式 |
| [Trim](/text_analysis/analysis_trim_tokenfilter) | 去除词元首尾空白 |
| [Truncate](/text_analysis/analysis_truncate_tokenfilter) | 截断超长词元 |
| [Unique](/text_analysis/analysis_unique_tokenfilter) | 移除重复词元 |
| [Uppercase](/text_analysis/analysis_uppercase_tokenfilter) | 将词元大写化 |
| [Word delimiter](/text_analysis/analysis_word_delimiter_tokenfilter) | 按非字母数字字符拆分词元 |
| [Word delimiter graph](/text_analysis/analysis_word_delimiter_graph_tokenfilter) | 词元拆分的图形式 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-tokenfilters.html)
