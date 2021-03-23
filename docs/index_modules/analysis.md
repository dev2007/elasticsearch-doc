# 分析

索引分析模块充当*分析器*的可配置注册表，它可用于将字符串字段转为独立的词语，这些词语包括：

- 添加到倒排索引以使文档可搜索
- 由高级查询，如[匹配查询(`match` query)](/query_dsl/full_text_queries/match)用于生成搜索词

参阅[文本分析](/text_analysis/text_analysis)获取配置详情。
