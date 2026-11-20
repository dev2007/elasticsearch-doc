# Convert 处理器

将摄取文档中的某个字段转换为不同的类型，例如将字符串转换为整数。如果字段值是数组，则所有成员都会被转换。

支持的类型包括：`integer`、`long`、`float`、`double`、`string`、`boolean`、`ip` 和 `auto`。

- 指定 **`boolean`** 时：如果字段的字符串值等于 `true`（不区分大小写），则将字段设置为 `true`；如果字符串值等于 `false`（不区分大小写），则设置为 `false`；否则将抛出异常。
- 指定 **`ip`** 时：如果字段包含可索引到 IP 字段类型的有效 IPv4 或 IPv6 地址，则将目标字段设置为该字段的值。
- 指定 **`auto`** 时：会尝试将字符串值字段转换为最接近的非字符串、非 IP 类型。例如，值为 `"true"` 的字段将被转换为对应的布尔类型 `true`。注意，在 `auto` 模式下 **`float` 优先于 `double`**：值 `"242.15"` 会“自动”转换为 `float` 类型的 `242.15`。如果提供的字段无法被恰当转换，处理器仍会成功处理并将字段值保持原样；这种情况下，`target_field` 会被更新为未转换的字段值。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 需要转换其值的字段。 |
| `target_field` | 否 | `field` | 转换后值所赋给的字段。默认在原字段上就地更新。 |
| `type` | 是 | - | 将现有值转换成的目标类型。 |
| `ignore_missing` | 否 | `false` | 如果为 `true`，且 `field` 不存在或为 `null`，处理器会静默退出而不修改文档。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

```bash
PUT _ingest/pipeline/my-pipeline-id
{
  "description": "converts the content of the id field to an integer",
  "processors" : [
    {
      "convert" : {
        "field" : "id",
        "type": "integer"
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/convert-processor.html)
