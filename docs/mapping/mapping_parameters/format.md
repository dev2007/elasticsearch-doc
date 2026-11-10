# format

在 JSON 文档中，日期以字符串表示。Elasticsearch 使用一组预配置的格式来识别这些字符串并将其解析为表示 UTC 下自纪元以来毫秒数的 `long` 值。

除了内置格式，还可以使用熟悉的 `yyyy/MM/dd` 语法指定自定义格式：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "date": {
        "type":   "date",
        "format": "yyyy-MM-dd"
      }
    }
  }
}
```

许多支持日期值的 API 还支持日期数学表达式，例如 `now-1m/d`——当前时间减去一个月，向下舍入到最近的一天。

## 自定义日期格式

支持完全可自定义的日期格式。它们的语法在 `DateTimeFormatter` 文档中有说明。

## 不同 JDK 版本之间的本地化信息差异

不同 JDK 版本和不同本地化设置之间的日期格式可能存在一些差异。特别是，用于文本日期格式的文本字符串可能有差异，周日期计算的结果也可能有差异。

以下字段说明符使用的文本字符串可能存在差异：

- 任意长度的 `B`、`E`、`G`、`O`、`a`、`v`、`z`
- 长度为 3 或更长的 `L`、`M`、`Q`、`q`、`c`、`e`
- 长度为 4 的 `Z`

如果文本格式在 Elasticsearch 或 JDK 版本之间发生变化，可能会给摄取、输出和重索引带来严重问题。建议在自定义日期格式中始终使用数值字段，它们不受本地化信息影响。

使用 `Y`、`W` 和 `w` 字段说明符的周日期计算也可能存在差异。用于计算周日期的底层数据可能因 JDK 版本和本地化设置而异；这可能导致相同日历日期计算出的周日期不同。建议使用内置的周日期格式，它们始终使用 ISO 规则计算周日期。

特别是，JDK 22 和 23 版本之间的本地化信息发生了重大变化。Elasticsearch 在 JDK 22 及更早版本上运行时使用 COMPAT 本地化数据库，在 JDK 23 及以上版本上运行时使用 CLDR 本地化数据库。此更改可能导致 Elasticsearch 接受的文本日期格式以及计算出的周日期出现重大差异。如果你使用了受影响的说明符，可能需要修改你的摄取或输出集成代码，以应对这两个 JDK 版本之间的差异。

## 内置格式

下面的大多数格式都有一个 strict（严格）的伴随格式，这意味着年、月、日的部分必须分别恰好使用 4、2、2 位数字，必要时补零。例如，`5/11/1` 这样的日期会被视为无效，需要重写为 `2005/11/01` 才能被日期解析器接受。

要使用它们，需要在日期格式名称前加上 `strict_`，例如使用 `strict_date_optional_time` 而不是 `date_optional_time`。

这些严格日期格式在动态映射日期字段时特别有用，可以确保不会意外地将不相关的字符串映射为日期。

下表列出了支持的所有默认 ISO 格式：

| 格式 | 描述 |
|:--|:--|
| `epoch_millis` | 自纪元以来毫秒数的格式化器。注意，此时间戳受 Java `Long.MIN_VALUE` 和 `Long.MAX_VALUE` 限制。 |
| `epoch_second` | 自纪元以来秒数的格式化器。注意，此时间戳受 Java `Long.MIN_VALUE` 和 `Long.MAX_VALUE` 除以 1000（每秒的毫秒数）的限制。 |
| `date_optional_time` 或 `strict_date_optional_time` | 通用 ISO 日期时间解析器，日期必须至少包含年份，时间（以 `T` 分隔）是可选的。示例：`yyyy-MM-dd'T'HH:mm:ss.SSSZ` 或 `yyyy-MM-dd`。**注意：** 使用 `date_optional_time` 时，解析是宽松的，会尝试将数字解析为年份（例如 `292278994` 将被解析为年份）。与 `epoch_second` 和 `epoch_millis` 等侧重数字的格式配对时，这可能导致意外结果。建议在与侧重数字的格式配对时使用 `strict_date_optional_time`。 |
| `strict_date_optional_time_nanos` | 通用 ISO 日期时间解析器，日期必须至少包含年份，时间（以 `T` 分隔）是可选的。秒的小数部分具有纳秒精度。示例：`yyyy-MM-dd'T'HH:mm:ss.SSSSSSZ` 或 `yyyy-MM-dd`。 |
| `basic_date` | 完整日期的基本格式化器：四位年份、两位月份、两位日期：`yyyyMMdd`。 |
| `basic_date_time` | 合并基本日期和时间的基本格式化器，以 `T` 分隔：`yyyyMMdd'T'HHmmss.SSSZ`。 |
| `basic_date_time_no_millis` | 合并基本日期和不含毫秒的时间的基本格式化器，以 `T` 分隔：`yyyyMMdd'T'HHmmssZ`。 |
| `basic_ordinal_date` | 完整序数日期的格式化器，使用四位年份和三位年积日：`yyyyDDD`。 |
| `basic_ordinal_date_time` | 完整序数日期和时间的格式化器，使用四位年份和三位年积日：`yyyyDDD'T'HHmmss.SSSZ`。 |
| `basic_ordinal_date_time_no_millis` | 不含毫秒的完整序数日期和时间的格式化器，使用四位年份和三位年积日：`yyyyDDD'T'HHmmssZ`。 |
| `basic_time` | 两位小时、两位分钟、两位秒、三位毫秒和时区偏移的基本格式化器：`HHmmss.SSSZ`。 |
| `basic_time_no_millis` | 两位小时、两位分钟、两位秒和时区偏移的基本格式化器：`HHmmssZ`。 |
| `basic_t_time` | 两位小时、两位分钟、两位秒、三位毫秒和带 `T` 前缀的时区偏移的基本格式化器：`'T'HHmmss.SSSZ`。 |
| `basic_t_time_no_millis` | 两位小时、两位分钟、两位秒和带 `T` 前缀的时区偏移的基本格式化器：`'T'HHmmssZ`。 |
| `basic_week_date` 或 `strict_basic_week_date` | 完整日期的基本格式化器：四位周年、两位周数和一位星期：`xxxx'W'wwe`。 |
| `basic_week_date_time` 或 `strict_basic_week_date_time` | 合并基本周年日期和时间的基本格式化器，以 `T` 分隔：`xxxx'W'wwe'T'HHmmss.SSSZ`。 |
| `basic_week_date_time_no_millis` 或 `strict_basic_week_date_time_no_millis` | 合并基本周年日期和不含毫秒时间的基本格式化器，以 `T` 分隔：`xxxx'W'wwe'T'HHmmssZ`。 |
| `date` 或 `strict_date` | 完整日期的格式化器：四位年份、两位月份和两位日期：`yyyy-MM-dd`。 |
| `date_hour` 或 `strict_date_hour` | 合并完整日期和两位小时数的格式化器：`yyyy-MM-dd'T'HH`。 |
| `date_hour_minute` 或 `strict_date_hour_minute` | 合并完整日期、两位小时数和两位分钟数的格式化器：`yyyy-MM-dd'T'HH:mm`。 |
| `date_hour_minute_second` 或 `strict_date_hour_minute_second` | 合并完整日期、两位小时数、两位分钟数和两位秒数的格式化器：`yyyy-MM-dd'T'HH:mm:ss`。 |
| `date_hour_minute_second_fraction` 或 `strict_date_hour_minute_second_fraction` | 合并完整日期、两位小时数、两位分钟数、两位秒数和三位秒的小数部分的格式化器：`yyyy-MM-dd'T'HH:mm:ss.SSS`。 |
| `date_hour_minute_second_millis` 或 `strict_date_hour_minute_second_millis` | 合并完整日期、两位小时数、两位分钟数、两位秒数和三位秒的小数部分的格式化器：`yyyy-MM-dd'T'HH:mm:ss.SSS`。 |
| `date_time` 或 `strict_date_time` | 合并完整日期和时间的格式化器，以 `T` 分隔：`yyyy-MM-dd'T'HH:mm:ss.SSSZ`。 |
| `date_time_no_millis` 或 `strict_date_time_no_millis` | 合并完整日期和不含毫秒时间的格式化器，以 `T` 分隔：`yyyy-MM-dd'T'HH:mm:ssZ`。 |
| `hour` 或 `strict_hour` | 两位小时数的格式化器：`HH`。 |
| `hour_minute` 或 `strict_hour_minute` | 两位小时数和两位分钟数的格式化器：`HH:mm`。 |
| `hour_minute_second` 或 `strict_hour_minute_second` | 两位小时数、两位分钟数和两位秒数的格式化器：`HH:mm:ss`。 |
| `hour_minute_second_fraction` 或 `strict_hour_minute_second_fraction` | 两位小时数、两位分钟数、两位秒数和三位秒的小数部分的格式化器：`HH:mm:ss.SSS`。 |
| `hour_minute_second_millis` 或 `strict_hour_minute_second_millis` | 两位小时数、两位分钟数、两位秒数和三位秒的小数部分的格式化器：`HH:mm:ss.SSS`。 |
| `ordinal_date` 或 `strict_ordinal_date` | 完整序数日期的格式化器，使用四位年份和三位年积日：`yyyy-DDD`。 |
| `ordinal_date_time` 或 `strict_ordinal_date_time` | 完整序数日期和时间的格式化器，使用四位年份和三位年积日：`yyyy-DDD'T'HH:mm:ss.SSSZ`。 |
| `ordinal_date_time_no_millis` 或 `strict_ordinal_date_time_no_millis` | 不含毫秒的完整序数日期和时间的格式化器，使用四位年份和三位年积日：`yyyy-DDD'T'HH:mm:ssZ`。 |
| `time` 或 `strict_time` | 两位小时数、两位分钟数、两位秒数、三位秒的小数部分和时区偏移的格式化器：`HH:mm:ss.SSSZ`。 |
| `time_no_millis` 或 `strict_time_no_millis` | 两位小时数、两位分钟数、两位秒数和时区偏移的格式化器：`HH:mm:ssZ`。 |
| `t_time` 或 `strict_t_time` | 两位小时数、两位分钟数、两位秒数、三位秒的小数部分和带 `T` 前缀的时区偏移的格式化器：`'T'HH:mm:ss.SSSZ`。 |
| `t_time_no_millis` 或 `strict_t_time_no_millis` | 两位小时数、两位分钟数、两位秒数和带 `T` 前缀的时区偏移的格式化器：`'T'HH:mm:ssZ`。 |
| `week_date` 或 `strict_week_date` | 完整日期的格式化器：四位周年、两位周数和一位星期：`YYYY-'W'ww-e`。使用 ISO 周日期定义。 |
| `week_date_time` 或 `strict_week_date_time` | 合并完整周年日期和时间的格式化器，以 `T` 分隔：`YYYY-'W'ww-e'T'HH:mm:ss.SSSZ`。使用 ISO 周日期定义。 |
| `week_date_time_no_millis` 或 `strict_week_date_time_no_millis` | 合并完整周年日期和不含毫秒时间的格式化器，以 `T` 分隔：`YYYY-'W'ww-e'T'HH:mm:ssZ`。使用 ISO 周日期定义。 |
| `weekyear` 或 `strict_weekyear` | 四位周年的格式化器：`YYYY`。使用 ISO 周日期定义。 |
| `weekyear_week` 或 `strict_weekyear_week` | 四位周年和两位周数的格式化器：`YYYY-'W'ww`。使用 ISO 周日期定义。 |
| `weekyear_week_day` 或 `strict_weekyear_week_day` | 四位周年、两位周数和一位星期的格式化器：`YYYY-'W'ww-e`。使用 ISO 周日期定义。 |
| `year` 或 `strict_year` | 四位年份的格式化器：`yyyy`。 |
| `year_month` 或 `strict_year_month` | 四位年份和两位月份的格式化器：`yyyy-MM`。 |
| `year_month_day` 或 `strict_year_month_day` | 四位年份、两位月份和两位日期的格式化器：`yyyy-MM-dd`。 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-date-format.html)
