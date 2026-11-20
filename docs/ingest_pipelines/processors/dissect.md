# Dissect 处理器

与 [Grok 处理器](/ingest_pipelines/processors/grok)类似，dissect 也可以从文档中的单个文本字段提取结构化字段。但与 Grok 处理器不同的是，dissect **不使用正则表达式**。这使得 dissect 的语法更简单，并且在某些情况下比 Grok 处理器更快。

Dissect 将单个文本字段与定义的模式进行匹配。

例如，以下模式：

```text
%{clientip} %{ident} %{auth} [%{@timestamp}] \"%{verb} %{request} HTTP/%{httpversion}\" %{status} %{size}
```

将匹配如下格式的日志行：

```text
1.2.3.4 - - [30/Apr/1998:22:00:52 +0000] \"GET /english/venues/cities/images/montpellier/18.gif HTTP/1.0\" 200 3171
```

并生成包含以下字段的文档：

```json
"doc":{
  "_index":"_index",
  "_type":"_type",
  "_id":"_id",
  "_source":{
    "request":"/english/venues/cities/images/montpellier/18.gif",
    "auth":"-",
    "ident":"-",
    "verb":"GET",
    "@timestamp":"30/Apr/1998:22:00:52 +0000",
    "size":"3171",
    "clientip":"1.2.3.4",
    "httpversion":"1.0",
    "status":"200"
  }
}
```

dissect 模式由将被**丢弃**的字符串部分定义。在上面的示例中，第一个被丢弃的部分是一个空格。Dissect 找到该空格后，将 `clientip` 的值赋为直到该空格之前的所有内容。接下来，dissect 匹配 `[`，然后匹配 `]`，并将两者之间的内容赋给 `@timestamp`。特别注意模式中需要丢弃的字符串部分，将有助于构建成功的 dissect 模式。

成功的匹配要求模式中的所有键都有值。如果模式中定义的任何 `%{keyname}` 没有值，则会抛出异常，该异常可通过 [`on_failure`](/ingest_pipelines/ingest_pipelines#处理管道失败) 指令处理。可以使用空键 `%{}` 或[命名跳过键](#命名跳过键)来匹配值，但不将该值包含在最终文档中。所有匹配到的值都以字符串数据类型表示。可以使用 [convert 处理器](/ingest_pipelines/processors/convert)转换为预期的数据类型。

Dissect 还支持[键修饰符](#dissect-键修饰符)，可以改变 dissect 的默认行为。例如，你可以指示 dissect 忽略某些字段、追加字段、跳过填充等。更多信息见下文。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要剖析的字段。 |
| `pattern` | 是 | - | 要应用的模式。 |
| `append_separator` | 否 | `""`（空字符串） | 分隔被追加字段的字符。 |
| `ignore_missing` | 否 | `false` | 如果为 `true` 且 `field` 不存在或为 `null`，处理器将静默退出，不修改文档。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

**示例配置：**

```json
{
  "dissect": {
    "field": "message",
    "pattern": "%{clientip} %{ident} %{auth} [%{@timestamp}] \"%{verb} %{request} HTTP/%{httpversion}\" %{status} %{size}"
  }
}
```

## Dissect 键修饰符

键修饰符可以改变剖析的默认行为。键修饰符可以位于 `%{keyname}` 的左侧或右侧，始终位于 `%{` 和 `}` 之内。例如 `%{+keyname ->}` 同时具有追加和右侧填充修饰符。

| 修饰符 | 名称 | 位置 | 示例 | 描述 | 详情 |
|:--|:--|:--|:--|:--|:--|
| `->` | 跳过右侧填充 | （最）右侧 | `%{keyname1->}` | 跳过后面的任何重复字符 | [链接](#右侧填充修饰符) |
| `+` | 追加 | 左侧 | `%{+keyname} %{+keyname}` | 将两个或多个字段追加在一起 | [链接](#追加修饰符) |
| `+` 与 `/n` | 按顺序追加 | 左侧和右侧 | `%{+keyname/2} %{+keyname/1}` | 按指定顺序将两个或多个字段追加在一起 | [链接](#按顺序追加修饰符) |
| `?` | 命名跳过键 | 左侧 | `%{?ignoreme}` | 在输出中跳过匹配的值。行为与 `%{}` 相同 | [链接](#命名跳过键) |
| `*` 和 `&` | 引用键 | 左侧 | `%{*r1} %{&r1}` | 将 `*` 的值设为输出键，将 `&` 的值设为输出值 | [链接](#引用键) |

### 右侧填充修饰符

执行剖析的算法非常严格，要求模式中的所有字符都与源字符串匹配。例如，模式 `%{fookey} %{barkey}`（1 个空格）可以匹配字符串 `"foo bar"`（1 个空格），但不能匹配字符串 `"foo  bar"`（2 个空格），因为模式中只有 1 个空格而源字符串中有 2 个空格。

右侧填充修饰符可以解决这种情况。将右侧填充修饰符添加到模式 `%{fookey->} %{barkey}` 后，它将匹配 `"foo bar"`（1 个空格）、`"foo  bar"`（2 个空格），甚至 `"foo          bar"`（10 个空格）。

使用右侧填充修饰符可以允许 `%{keyname->}` 之后的字符重复出现。

右侧填充修饰符可以与任何其他修饰符一起放在任何键上。它应始终是**最右侧**的修饰符。例如：`%{+keyname/1->}` 和 `%{->}`。

**右侧填充修饰符示例**

|||
|:--|:--|
| **模式** | `%{ts->} %{level}` |
| **输入** | `1998-08-10T17:15:42,466          WARN` |
| **结果** | `ts = 1998-08-10T17:15:42,466`<br/>`level = WARN` |

右侧填充修饰符可与空键一起使用，以帮助跳过不需要的数据。例如，同样的输入字符串，如果用方括号包裹，则需要使用带右侧填充的空键才能获得相同的结果。

**右侧填充修饰符与空键示例**

|||
|:--|:--|
| **模式** | `[%{ts}]%{->}[%{level}]` |
| **输入** | `[1998-08-10T17:15:42,466]         [WARN]` |
| **结果** | `ts = 1998-08-10T17:15:42,466`<br/>`level = WARN` |

### 追加修饰符

Dissect 支持将两个或多个结果追加在一起输出。值从左到右追加。可以指定追加分隔符。在此示例中，追加分隔符定义为空格。

**追加修饰符示例**

|||
|:--|:--|
| **模式** | `%{+name} %{+name} %{+name} %{+name}` |
| **输入** | `john jacob jingleheimer schmidt` |
| **结果** | `name = john jacob jingleheimer schmidt` |

### 按顺序追加修饰符（`+` 和 `/n`）

Dissect 支持将两个或多个结果追加在一起输出。值按照定义的顺序（`/n`）追加。可以指定追加分隔符。在此示例中，追加分隔符定义为逗号。

**按顺序追加修饰符示例**

|||
|:--|:--|
| **模式** | `%{+name/2} %{+name/4} %{+name/3} %{+name/1}` |
| **输入** | `john jacob jingleheimer schmidt` |
| **结果** | `name = schmidt,john,jingleheimer,jacob` |

### 命名跳过键

Dissect 支持在最终结果中忽略某些匹配项。这可以通过空键 `%{}` 实现，但为了可读性，可以为该空键指定一个名称。

**命名跳过键修饰符示例**

|||
|:--|:--|
| **模式** | `%{clientip} %{?ident} %{?auth} [%{@timestamp}]` |
| **输入** | `1.2.3.4 - - [30/Apr/1998:22:00:52 +0000]` |
| **结果** | `clientip = 1.2.3.4`<br/>`@timestamp = 30/Apr/1998:22:00:52 +0000` |

### 引用键

Dissect 支持将解析出的值用作结构化内容的键/值对。设想一个系统以键/值对的形式进行部分日志记录。引用键允许你保持这种键/值关系。

**引用键修饰符示例**

|||
|:--|:--|
| **模式** | `[%{ts}] [%{level}] %{*p1}:%{&p1} %{*p2}:%{&p2}` |
| **输入** | `[2018-08-10T17:15:42,466] [ERR] ip:1.2.3.4 error:REFUSED` |
| **结果** | `ts = 2018-08-10T17:15:42,466`<br/>`level = ERR`<br/>`ip = 1.2.3.4`<br/>`error = REFUSED` |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/dissect-processor.html)
