# 索引名中的日期数学支持

日期数学索引名字解析允许你搜索一系列时序索引，而不是搜索所有时序索引并过滤结果或维护别名。限制搜索的索引数可以减少集群上的负载并改进执行性能。例如，如果你在每日日志中搜索错误，你可以使用日期数学名字模板来限制搜索为过去两天。

几乎所有具有 `index`（索引）参数的 API，都支持 `index`（索引）参数值中的日期数学。

日期数学索引名字采用以下形式：

```bash
<static_name{date_math_expr{date_format|time_zone}}>
```

其中：

|||
|:--|:--|
|`static_name`|名字的静态文字部分|
|`date_math_expr`|动态计算日期的动态日期数学表达式|
|`date_format`|显示计算日期的可选格式。默认为 `yyyy.MM.dd`。格式应与 java-time 兼容。[https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html](https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html)|
|`time_zone`|可选的时区。默认为 `utc`。|

:::note 提示
`date_format`（日期格式）中使用的大小写字母。例如，`mm` 表示分钟，`MM`表示月份。类似的，`hh` 表示 `1-12` 范围内的小时，与 `AM/PM` 组合使用，而 `HH` 表示 `0-23` 24小时范围内的小时。
:::

日期数学表达式与区域无关。因此，不以使用格列高利历之外的日历。

必须将日期数学索引名字表达式包在尖括号内，并且所有特殊字符都应进行 URI 编码。例如：

```bash
# PUT /<my-index-{now/d}>
PUT /%3Cmy-index-%7Bnow%2Fd%7D%3E
```

:::note 提示
日期数学字符的百分比编码  
日期格式特定字符必须为 URI 编码，如下：  

|||
|:--|:--|
|<|%3C|
|>|%3E|
|/|%2F|
|{|%7B|
|}|%7D|
|&#124;|%7C|
|+|%2B|
|:|%3A|
|,|%2C|
:::

以下示例显示日期数学索引名字的不同格式，且给定当前时间为 UTC 2024年3月22日中午，它们解析为最终索引名字。

|表达式|解析为|
|:--|:--|
|<logstash-{now/d}>|logstash-2024.03.22|
|<logstash-{now/M}>|logstash-2024.03.01|
|<logstash-{now/M{yyyy.MM}}>|logstash-2024.03|
|<logstash-{now/M-1M{yyyy.MM}}>|logstash-2024.02|
|<logstash-{now/d{yyyy.MM.dd &#124; +12:00}}>|logstash-2024.03.23|

为了在索引名字模板的静态部分中使用字符 { 和 }，请使用反斜杠 \ 转义，例如：

- `<elastic\{ON\}-{now/M}>` 解析为 `elastic{ON}-2024.03.01`

以下例子展示了一个搜索请求，该请求搜索过去三天的 Logstash 索引，假设索引使用默认的 Logstash 索引名字格式 `logstash-yyyy.MM.dd`。

```bash
# GET /<logstash-{now/d-2d}>,<logstash-{now/d-1d}>,<logstash-{now/d}>/_search
GET /%3Clogstash-%7Bnow%2Fd-2d%7D%3E%2C%3Clogstash-%7Bnow%2Fd-1d%7D%3E%2C%3Clogstash-%7Bnow%2Fd%7D%3E/_search
{
  "query" : {
    "match": {
      "test": "data"
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/date-math-index-names.html)
