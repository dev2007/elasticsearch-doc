# Dot expander 处理器

将带点号的字段展开为对象字段。该处理器允许名称中带点的字段被管道中的其他处理器访问；否则这些字段无法被任何处理器访问。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要展开为对象字段的字段。如果设置为 `*`，则所有顶层字段都会被展开。 |
| `path` | 否 | - | 包含待展开字段的字段。仅当待展开字段属于另一个对象字段时才需要，因为 `field` 选项只能理解叶子字段。 |
| `override` | 否 | `false` | 当已存在与展开字段冲突的嵌套对象时控制处理行为。为 `false` 时，处理器通过将旧值和新值合并为数组来处理冲突；为 `true` 时，展开字段的值将覆盖现有值。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 基本示例

```json
{
  "dot_expander": {
    "field": "foo.bar"
  }
}
```

例如，dot expand 处理器会将此文档：

```json
{
  "foo.bar" : "value"
}
```

转换为：

```json
{
  "foo" : {
    "bar" : "value"
  }
}
```

如果 `foo` 下已经存在嵌套的 `bar` 字段，则该处理器会将 `foo.bar` 字段合并到其中。如果该字段是标量值，则会将其转换为数组字段。

例如，以下文档：

```json
{
  "foo.bar" : "value2",
  "foo" : {
    "bar" : "value1"
  }
}
```

会被 `dot_expander` 处理器转换为：

```json
{
  "foo" : {
    "bar" : ["value1", "value2"]
  }
}
```

与之对比，当 `override` 选项设置为 `true` 时：

```json
{
  "dot_expander": {
    "field": "foo.bar",
    "override": true
  }
}
```

在这种情况下，展开字段的值会覆盖嵌套对象的值：

```json
{
  "foo" : {
    "bar" : "value2"
  }
}
```

## 使用 `*` 展开所有顶层带点字段

`field` 的值还可以设置为 `*`，以展开所有顶层带点的字段名：

```json
{
  "dot_expander": {
    "field": "*"
  }
}
```

dot expand 处理器会将此文档：

```json
{
  "foo.bar" : "value",
  "baz.qux" : "value"
}
```

转换为：

```json
{
  "foo" : {
    "bar" : "value"
  },
  "baz" : {
    "qux" : "value"
  }
}
```

## 使用 `path` 选项

如果带点的字段嵌套在一个不带点的结构中，请使用 `path` 选项来定位这个不带点的结构：

```json
{
  "dot_expander": {
    "path": "foo",
    "field": "*"
  }
}
```

dot expand 处理器会将此文档：

```json
{
  "foo" : {
    "bar.one" : "value",
    "bar.two" : "value"
  }
}
```

转换为：

```json
{
  "foo" : {
    "bar" : {
      "one" : "value",
      "two" : "value"
    }
  }
}
```

## 字段冲突时的处理（需先重命名）

如果叶子字段之外的任何字段与已有的同名字段冲突，则需要先重命名该字段。

考虑以下文档：

```json
{
  "foo": "value1",
  "foo.bar": "value2"
}
```

此时需要先重命名 `foo`，然后再应用 `dot_expander` 处理器。为了将 `foo.bar` 字段正确展开为 `foo` 字段下的 `bar` 字段，应使用以下管道：

```json
{
  "processors" : [
    {
      "rename" : {
        "field" : "foo",
        "target_field" : "foo.bar"
      }
    },
    {
      "dot_expander": {
        "field": "foo.bar"
      }
    }
  ]
}
```

原因在于 Ingest 不知道如何自动将标量字段转换为对象字段。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/dot-expand-processor.html)
