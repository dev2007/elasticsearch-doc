# Grok 处理器

从文档中的单个文本字段提取结构化字段。你可以选择从哪个字段提取匹配的字段，以及你期望匹配的 grok 模式。grok 模式类似于支持可复用别名的正则表达式。

该处理器内置了大量[可复用模式](https://github.com/elastic/elasticsearch/blob/8.18/libs/grok/src/main/resources/patterns)。

如果你需要构建用于匹配日志的模式，[Grok Debugger](https://www.elastic.co/guide/en/kibana/8.18/xpack-grokdebugger.html) 工具非常有用！[Grok Constructor](https://grokconstructor.appspot.com) 也是一个有用的工具。

## 在管道中使用 Grok 处理器

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 用于 grok 表达式解析的字段。 |
| `patterns` | 是 | - | 一组有序的 grok 表达式，用于匹配并提取命名捕获组。返回列表中第一个匹配的表达式即停止。 |
| `pattern_definitions` | 否 | - | 一个模式名与模式组成的映射，定义当前处理器使用的自定义模式。与现有名称匹配的模式将覆盖原有定义。 |
| `ecs_compatibility` | 否 | `disabled` | 必须为 `disabled` 或 `v1`。若为 `v1`，处理器使用带有 [Elastic Common Schema (ECS)](https://www.elastic.co/guide/en/ecs/8.17/ecs-field-reference.html) 字段名称的模式。 |
| `trace_match` | 否 | `false` | 为 true 时，`_ingest._grok_match_index` 会被插入到匹配文档的元数据中，表示 `patterns` 列表中匹配成功的模式的索引。 |
| `ignore_missing` | 否 | `false` | 为 `true` 且 `field` 不存在或为 `null` 时，处理器静默退出且不修改文档。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

以下示例使用内置模式，从文档的字符串字段中提取并命名结构化字段。

```bash
POST _ingest/pipeline/_simulate
{
  "pipeline": {
    "description": "...",
    "processors": [
      {
        "grok": {
          "field": "message",
          "patterns": ["%{IP:client} %{WORD:method} %{URIPATHPARAM:request} %{NUMBER:bytes:int} %{NUMBER:duration:double}"]
        }
      }
    ]
  },
  "docs": [
    {
      "_source": {
        "message": "55.3.244.1 GET /index.html 15824 0.043"
      }
    }
  ]
}
```

该管道会在文档中插入这些命名捕获组作为新字段，结果如下：

```json
{
  "docs": [
    {
      "doc": {
        "_index": "_index",
        "_id": "_id",
        "_version": "-3",
        "_source": {
          "duration": 0.043,
          "request": "/index.html",
          "method": "GET",
          "bytes": 15824,
          "client": "55.3.244.1",
          "message": "55.3.244.1 GET /index.html 15824 0.043"
        },
        "_ingest": {
          "timestamp": "2016-11-08T19:43:03.850+0000"
        }
      }
    }
  ]
}
```

## 自定义模式

Grok 处理器自带一组基础模式。这些模式不一定总能满足你的需求。模式的格式非常简单：每个条目都有一个名称和模式本身。

你可以在处理器定义的 `pattern_definitions` 选项下添加自定义模式。以下是指定自定义模式定义的管道示例：

```json
{
  "description": "...",
  "processors": [
    {
      "grok": {
        "field": "message",
        "patterns": ["my %{FAVORITE_DOG:dog} is colored %{RGB:color}"],
        "pattern_definitions": {
          "FAVORITE_DOG": "beagle",
          "RGB": "RED|GREEN|BLUE"
        }
      }
    }
  ]
}
```

## 提供多个匹配模式

有时一个模式不足以捕获字段的所有可能结构。假设我们想匹配所有包含你最喜欢的猫或狗品种的消息。一种实现方式是提供两个不同的可匹配模式，而不是用一个极其复杂的表达式来实现相同的 `or` 行为。

以下是对 simulate API 执行的此类配置示例：

```bash
POST _ingest/pipeline/_simulate
{
  "pipeline": {
    "description": "parse multiple patterns",
    "processors": [
      {
        "grok": {
          "field": "message",
          "patterns": ["%{FAVORITE_DOG:pet}", "%{FAVORITE_CAT:pet}"],
          "pattern_definitions": {
            "FAVORITE_DOG": "beagle",
            "FAVORITE_CAT": "burmese"
          }
        }
      }
    ]
  },
  "docs": [
    {
      "_source": {
        "message": "I love burmese cats!"
      }
    }
  ]
}
```

响应：

```json
{
  "docs": [
    {
      "doc": {
        "_index": "_index",
        "_id": "_id",
        "_version": "-3",
        "_source": {
          "message": "I love burmese cats!",
          "pet": "burmese"
        },
        "_ingest": {
          "timestamp": "2016-11-08T19:43:03.850+0000"
        }
      }
    }
  ]
}
```

两个模式都会用相应的匹配结果设置 `pet` 字段。但如果我们想追踪是哪个模式匹配并填充了字段呢？可以使用 `trace_match` 参数。以下是同一管道配置了 `"trace_match": true` 后的输出：

```json
{
  "docs": [
    {
      "doc": {
        "_index": "_index",
        "_id": "_id",
        "_version": "-3",
        "_source": {
          "message": "I love burmese cats!",
          "pet": "burmese"
        },
        "_ingest": {
          "_grok_match_index": "1",
          "timestamp": "2016-11-08T19:43:03.850+0000"
        }
      }
    }
  ]
}
```

在上面的响应中，可以看到匹配的模式索引是 `"1"`，即 `patterns` 中第二个（索引从零开始）匹配的模式。

此追踪元数据可用于调试哪个模式匹配成功。该信息存储在摄取元数据中，不会被索引。

## 从 REST 端点检索模式

Grok 处理器自带一个用于检索其内置模式的 REST 端点。

```bash
GET _ingest/processor/grok
```

上述请求会返回一个包含内置模式字典的键值表示形式的响应体：

```json
{
  "patterns": {
    "BACULA_CAPACITY": "%{INT}{1,3}(,%{INT}{3})*",
    "PATH": "(?:%{UNIXPATH}|%{WINPATH})",
    ...
  }
}
```

默认情况下，该 API 返回一组传统 Grok 模式。这些传统模式早于 [Elastic Common Schema (ECS)](https://www.elastic.co/guide/en/ecs/8.17/ecs-field-reference.html)，不使用 ECS 字段名。要返回提取 ECS 字段名的模式，请在可选的 `ecs_compatibility` 查询参数中指定 `v1`。

```bash
GET _ingest/processor/grok?ecs_compatibility=v1
```

默认情况下，API 按模式从磁盘读取的顺序返回。这种排序方式保留相关模式的分组，例如所有解析 Linux syslog 行相关的模式会保持在一起。

你可以使用可选的布尔型 `s` 查询参数，改为按模式键名排序返回。

```bash
GET _ingest/processor/grok?s
```

API 返回如下响应：

```json
{
  "patterns": {
    "BACULA_CAPACITY": "%{INT}{1,3}(,%{INT}{3})*",
    "BACULA_DEVICE": "%{USER}",
    "BACULA_DEVICEPATH": "%{UNIXPATH}",
    ...
  }
}
```

当跨版本引用内置模式时，这会很有用。

## Grok 看门狗

执行时间过长的 grok 表达式会被中断，grok 处理器随后抛出异常并失败。grok 处理器有一个看门狗线程，用于确定 grok 表达式求值何时耗时过长，由以下设置控制：

| 名称 | 默认值 | 描述 |
|:--|:--|:--|
| `ingest.grok.watchdog.interval` | 1s | 检查是否存在超出最大允许执行时间的 grok 求值的频率。 |
| `ingest.grok.watchdog.max_execution_time` | 1s | grok 表达式求值的最大允许执行时间。 |

## Grok 调试

建议使用 [Grok Debugger](https://www.elastic.co/guide/en/kibana/8.18/xpack-grokdebugger.html) 来调试 grok 模式。在调试器中，你可以在 UI 中用一个或多个模式测试样例数据。其底层使用与摄取节点处理器相同的引擎。

此外，建议为 Grok 启用 debug 日志，以便在 Elasticsearch 服务器日志中查看附加消息：

```bash
PUT _cluster/settings
{
  "persistent": {
    "logger.org.elasticsearch.ingest.common.GrokProcessor": "debug"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/grok-processor.html)
