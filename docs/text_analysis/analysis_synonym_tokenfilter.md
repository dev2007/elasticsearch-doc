# Synonym 词元过滤器

使用 synonym 过滤器在分析过程中方便地处理同义词。

## 定义同义词集合

同义词集合中的同义词通过“同义词规则”定义。每条同义词规则包含一组互为同义词的词。

可以使用两种格式定义同义词规则：Solr 格式和 WordNet 格式。

### Solr 格式

Solr 格式使用两类定义。

**等价同义词**：定义一组等价的词，词之间用逗号分隔。

```text
ipod, i-pod, i pod
computer, pc, laptop
```

**显式同义词**：将一组词映射到另一组词。规则左侧的词会被展开为右侧描述的所有可能形式。

```text
personal computer => pc
sea biscuit, sea biscit => seabiscuit
```

### WordNet 格式

WordNet 定义跨多行的同义词集合。每一行包含：

- 同义词集合的数字标识符
- 该同义词在同义词集合中的序号
- 同义词词
- 词性标识符：`n`（名词）、`v`（动词）、`a`（形容词）、`b`（副词）
- 该词在 WordNet 同义词网络中的深度

例如，以下定义为 `come`、`advance`、`approach` 建立一个同义词集合：

```text
s(100000002,1,'come',v,1,0).
s(100000002,2,'advance',v,1,0).
s(100000002,3,'approach',v,1,0).
```

## 配置同义词集合

同义词可以通过 Synonyms API、同义词文件或直接在词元过滤器配置中内联配置。

### 使用 `synonyms_set`

`synonyms_set` 配置项用于提供通过 Synonyms Management APIs 创建的同义词集合：

```json
"filter": {
  "synonyms_filter": {
    "type": "synonym",
    "synonyms_set": "my-synonym-set",
    "updateable": true
  }
}
```

:::::important 重要
同义词集合必须先存在，然后才能添加到索引中。

如果创建索引时引用了一个不存在的同义词集合，该索引会保持为“部分创建”且不可操作的状态。恢复该场景的唯一方式是：先确保同义词集合存在，然后删除并重建索引，或者关闭并重新打开索引。
:::::

### 使用 `synonyms_path`

`synonyms_path` 用于提供同义词文件，路径相对于配置文件位置：

```json
"filter": {
  "synonyms_filter": {
    "type": "synonym",
    "synonyms_path": "analysis/synonym-set.txt"
  }
}
```

### 使用 `synonyms` 内联定义

`synonyms` 用于直接在词元过滤器配置中定义同义词：

```json
"filter": {
  "synonyms_filter": {
    "type": "synonym",
    "synonyms": [ "pc => personal computer", "computer, pc, laptop" ]
  }
}
```

## 可配置参数

- `synonyms_set`

  （可选，字符串）使用 Synonyms Management APIs 创建的同义词集合名称。

- `synonyms_path`

  （可选，字符串）同义词文件路径，路径相对于配置位置。

- `synonyms`

  （可选，字符串数组）在词元过滤器配置中直接内联定义同义词规则。

- `updateable`

  （可选，布尔值）如果为 `true`，允许重新加载 search analyzer，以加载同义词文件的变更。默认为 `false`。

  此参数仅用于 search analyzer。

- `expand`

  （可选，布尔值）控制是否展开等价同义词规则。默认为 `true`。

- `lenient`

  （可选，布尔值）如果为 `true`，解析同义词规则时会忽略错误。默认为 `updateable` 参数的值。

  注意：只有无法解析的规则会被忽略。

- `tokenizer`

  （已弃用，字符串）用于控制解析同义词时使用的分词器。此参数仅为兼容 6.0 之前创建的索引而保留。

- `ignore_case`

  （已弃用，布尔值）仅在与 `tokenizer` 参数一起使用时有效。

## 展开等价同义词规则

`expand` 参数控制是否展开等价同义词规则。

假设定义了规则 `foo, bar, baz`：

当 `expand` 为 `true` 时，该规则会被展开为：

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

当 `expand` 为 `false` 时，规则不会被展开，第一个同义词会被视为规范表示。上述规则等价于：

```text
foo => foo
bar => foo
baz => foo
```

注意：`expand` 参数不影响显式同义词规则。例如 `foo, bar => baz` 这类规则不受 `expand` 影响。

## 在自定义分析器中使用

要应用同义词，需要将 synonym 词元过滤器加入分析器：

```json
"analyzer": {
  "my_analyzer": {
    "type": "custom",
    "tokenizer": "standard",
    "filter": [ "stemmer", "synonym" ]
  }
}
```

## 词元过滤器的顺序

词元过滤器的顺序非常重要。

文本会先经过 synonym 过滤器之前的词元过滤器处理，然后再进入 synonym 过滤器。Elasticsearch 也会使用词元过滤器链中位于 synonym 过滤器之前的词元过滤器来解析同义词文件或同义词集合中的条目。

在上面的示例中，synonym 过滤器位于 `stemmer` 之后，因此词干提取器也会应用到同义词条目上。

## 多词元过滤器与同义词

由于同义词映射中的条目不能具有堆叠位置，某些词元过滤器可能会导致问题：

- 会产生同一词元多个版本的词元过滤器，在解析同义词时可能只能选择其中一个版本输出。例如，`asciifolding` 在解析同义词时只会输出折叠后的版本。
- 其他一些过滤器（如 `multiplexer`、`word_delimiter_graph` 和 `ngram`）可能会抛出错误。

如果分析器中同时需要多词元过滤器和 synonym 过滤器，建议使用 [multiplexer 过滤器](/text_analysis/analysis_multiplexer_tokenfilter)，将多词元过滤器放在一个分支中，将 synonym 过滤器放在另一个分支中。

## 与 stop 词元过滤器的相互影响

### stop 过滤器位于 synonym 过滤器之前

当 stop 过滤器位于 synonym 过滤器之前时，停用词会从同义词规则定义中被移除，这可能导致同义词规则出错。

- 如果 `lenient` 为 `false`，无效的同义词规则在应用分析器变更时会引发错误。对于可重新加载的分析器，这会阻止重新加载并应用变更。必须修正同义词规则中的错误，然后重新加载分析器。
- 当 `lenient` 为 `false` 时，包含无效同义词规则的索引无法重新打开，并在以下情况下处于不可操作状态：包含该索引的节点启动；索引从关闭状态被打开；节点重启，重新打开分配给该节点的分片。

以显式同义词规则 `foo, bar => baz` 为例：

- 如果 stop 过滤器移除了 `bar`：`lenient` 为 `false` 时会抛出错误，因为 `bar` 从规则左侧被移除；`lenient` 为 `true` 时会添加规则 `foo => baz`，并忽略 `bar => baz`。
- 如果 stop 过滤器移除了 `baz`：`lenient` 为 `false` 时会抛出错误，因为 `baz` 从规则右侧被移除；`lenient` 为 `true` 时该同义词不会生效，因为目标词被移除。

以等价同义词规则 `foo, bar, baz`（且 `expand: true`）为例：

- 如果 stop 过滤器移除了 `bar`：`lenient` 为 `false` 时会抛出错误；`lenient` 为 `true` 时添加的同义词等价于以下规则（不包含被移除的词）：

  ```text
  foo => foo
  foo => baz
  baz => foo
  baz => baz
  ```

### stop 过滤器位于 synonym 过滤器之后

当 stop 过滤器位于 synonym 过滤器之后时，stop 过滤器会从同义词展开后的结果中移除词元。

例如规则 `foo, bar => baz`：

- 如果 stop 过滤器移除了 `baz`：搜索 `foo` 或 `bar` 都会被展开为 `baz`，随后 `baz` 被 stop 过滤器移除，因此 `foo` 和 `bar` 都不会获得匹配。
- 如果 stop 过滤器移除的是 `foo`：搜索 `foo` 时仍会先被展开为 `baz`，而 `baz` 不会被该 stop 过滤器移除，因此可能匹配到 `baz` 相关结果。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-synonym-tokenfilter.html)
