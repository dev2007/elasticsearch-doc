# Synonym graph 词元过滤器

使用 synonym_graph 过滤器可以在分析过程中方便地处理同义词，尤其是能正确处理**多词同义词**。

为了正确处理多词同义词，该过滤器会在处理期间创建一个**图词元流（graph token stream）**。有关图词元流的复杂性及背景，可参阅 Lucene 的文章 *Lucene’s TokenStreams are actually graphs*。

:::::warning 警告
synonym_graph 过滤器设计为**仅用于 search analyzer（搜索分析器）**。如果要在索引阶段应用同义词，应使用标准的 [synonym 词元过滤器](/text_analysis/analysis_synonym_tokenfilter)。
:::::

## 定义同义词集合

同义词集合中的同义词通过同义词规则定义。每条同义词规则包含一组互为同义词的词。可以使用 Solr 格式或 WordNet 格式定义同义词规则。

### Solr 格式

**等价同义词**：定义一组等价的词，词之间用逗号分隔。

```text
ipod, i-pod, i pod
computer, pc, laptop
```

**显式同义词**：将左侧的一组词映射到右侧的一组词。规则左侧的词会被展开为右侧描述的所有可能形式。

```text
personal computer => pc
sea biscuit, sea biscit => seabiscuit
```

### WordNet 格式

WordNet 定义跨多行的同义词集合。每一行包含同义词集合的数值标识符、该同义词在集合中的序号、同义词单词、词性标识符（`n` 名词、`v` 动词、`a` 形容词、`b` 副词）以及该词在 WordNet 同义词网络中的深度。

例如，以下定义为 `come`、`advance`、`approach` 建立一个同义词集合：

```text
s(100000002,1,'come',v,1,0).
s(100000002,2,'advance',v,1,0).
s(100000002,3,'approach',v,1,0).
```

## 配置同义词集合

同义词可以通过 Synonyms API、同义词文件或直接在词元过滤器配置中内联配置。

### 使用 `synonyms_set`

`synonyms_set` 用于指定通过 Synonyms Management APIs 创建的同义词集合：

```json
"filter": {
  "synonyms_filter": {
    "type": "synonym_graph",
    "synonyms_set": "my-synonym-set",
    "updateable": true
  }
}
```

:::::important 重要
同义词集合必须先存在，然后才能添加到索引中。

如果创建索引时引用了不存在的同义词集合，该索引会处于部分创建且不可操作的状态。恢复该状态的唯一方式是：确保同义词集合存在，然后删除并重建索引，或者关闭并重新打开索引。
:::::

### 使用 `synonyms_path`

`synonyms_path` 用于提供同义词文件，路径相对于 Elasticsearch 的配置位置：

```json
"filter": {
  "synonyms_filter": {
    "type": "synonym_graph",
    "synonyms_path": "analysis/synonym-set.txt"
  }
}
```

### 使用 `synonyms` 内联定义

```json
"filter": {
  "synonyms_filter": {
    "type": "synonym_graph",
    "synonyms": [ "pc => personal computer", "computer, pc, laptop" ]
  }
}
```

## 可配置参数

- `synonyms_set`

  （可选，字符串）通过 Synonyms Management APIs 创建的同义词集合名称。

- `synonyms_path`

  （可选，字符串）同义词文件路径，路径相对于 Elasticsearch 的配置位置。

- `synonyms`

  （可选，字符串数组）直接内联定义同义词规则。

- `updateable`

  （可选，布尔值）如果为 `true`，允许重新加载 search analyzer，以拾取同义词文件的更改。默认为 `false`。此参数只能用于 search analyzer。

- `expand`

  （可选，布尔值）控制是否展开等价同义词规则。默认为 `true`。仅影响等价同义词规则，不影响显式同义词规则。

- `lenient`

  （可选，布尔值）如果为 `true`，解析同义词规则时会忽略错误。默认值与 `updateable` 的值相同。注意：只有无法解析的同义词规则会被忽略。

- `tokenizer`

  （已弃用，字符串）用于控制解析同义词时使用的分词器。此参数只是为了兼容 Elasticsearch 6.0 之前创建的索引而保留。

- `ignore_case`

  （已弃用，布尔值）仅在与 `tokenizer` 参数一起使用时生效。

## 展开等价同义词规则

例如定义规则 `foo, bar, baz`：

当 `expand` 为 `true` 时，该规则会展开为：

```text
foo => foo
foo => bar
foo => baz
bar => foo
bar => bar
bar => baz
baz => foo
baz => bar
baz => baz
```

当 `expand` 为 `false` 时，规则不会展开，第一个同义词会被视为规范表示（canonical representation）。上述规则等价于：

```text
foo => foo
bar => foo
baz => foo
```

`expand` 参数不会影响显式同义词规则，例如 `foo, bar => baz`。

## 在 analyzer 中配置

要使用同义词，需要将 synonym_graph 词元过滤器加入分析器：

```json
"analyzer": {
  "my_analyzer": {
    "type": "custom",
    "tokenizer": "standard",
    "filter": [ "stemmer", "synonym_graph" ]
  }
}
```

## 词元过滤器的顺序

词元过滤器的顺序非常重要。

文本会先经过同义词过滤器之前的过滤器处理，然后再由同义词过滤器处理。Elasticsearch 还会使用词元过滤器链中位于同义词过滤器之前的词元过滤器来解析同义词文件或同义词集合中的条目。

在上面的示例中，synonym_graph 放在 `stemmer` 之后，因此 `stemmer` 也会应用到同义词条目上。

由于同义词映射中的条目不能有堆叠位置（stacked positions），某些词元过滤器可能会导致问题：

- 有些会生成同一词元多个版本的过滤器，可能会选择其中一个版本输出。例如 `asciifolding` 只会输出折叠后的词元版本。
- 其他一些过滤器会抛出错误，如 `multiplexer`、`word_delimiter_graph` 和 `ngram`。

如果需要构建同时包含多词元过滤器和同义词过滤器的分析器，可以使用 [multiplexer 过滤器](/text_analysis/analysis_multiplexer_tokenfilter)：一个分支放多词元过滤器，另一个分支放同义词过滤器。

## 多词同义词与位置处理

synonym_graph 的核心用途是正确处理多词同义词。它通过创建图词元流来表示同义词扩展关系，而不是简单的一维词元流，从而能更准确地处理类似 `personal computer => pc`、`sea biscuit, sea biscit => seabiscuit` 这样的规则。

但需注意：

- 同义词映射条目不能包含堆叠位置。
- 如果同义词过滤器之前的词元过滤器产生多位置或堆叠词元，可能会导致解析同义词条目失败。
- 因此，放置顺序和前置过滤器的选择非常关键。对于复杂场景，应使用 multiplexer 将多词元处理与同义词处理隔离开。

## 与 stop 词元过滤器的相互影响

### stop 过滤器位于同义词过滤器之前

当 stop 过滤器位于同义词过滤器之前时，停用词会从同义词规则定义中被移除，这可能导致同义词规则出错。

- 如果 `lenient` 为 `false`，无效的同义词规则在应用分析器变更时会引发错误。对于可重新加载的分析器，这会阻止重新加载并应用变更；必须修正规则错误，然后重新加载分析器。
- 当 `lenient` 为 `false` 时，包含无效同义词规则的索引在以下情况下无法重新打开，并可能变得不可用：包含该索引的节点启动；索引从关闭状态被打开；节点重启，导致分配给该节点的分片被重新打开。

以显式规则 `foo, bar => baz` 为例：

- 如果 stop 过滤器移除了 `bar`：`lenient` 为 `false` 时会抛出错误，因为 `bar` 从规则左侧被移除；`lenient` 为 `true` 时会添加规则 `foo => baz`，并忽略 `bar => baz`。
- 如果 stop 过滤器移除了 `baz`：`lenient` 为 `false` 时会抛出错误，因为 `baz` 从规则右侧被移除；`lenient` 为 `true` 时该同义词不会生效，因为目标词已被移除。

以等价规则 `foo, bar, baz`（且 `expand: true`）为例，如果 stop 过滤器移除了 `bar`：`lenient` 为 `false` 时会抛出错误；`lenient` 为 `true` 时添加的同义词等价于以下规则（不包含被移除的词）：

```text
foo => foo
foo => baz
baz => foo
baz => baz
```

### stop 过滤器位于同义词过滤器之后

当 stop 过滤器位于同义词过滤器之后时，它会从同义词扩展结果中移除相关词项。

例如规则 `foo, bar => baz`：

- 如果 stop 过滤器移除了 `baz`：搜索 `foo` 或 `bar` 都会先扩展为 `baz`，随后 `baz` 被 stop 过滤器移除，因此 `foo` 和 `bar` 都不会获得匹配。
- 如果 stop 过滤器移除了 `foo`：搜索 `foo` 仍会先被展开为 `baz`，而 `baz` 不会被该 stop 过滤器移除，因此可能提供对 `baz` 的匹配。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-synonym-graph-tokenfilter.html)
