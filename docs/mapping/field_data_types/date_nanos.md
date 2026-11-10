# date_nanos 字段类型

此数据类型是 `date` 数据类型的补充。但两者之间有一个重要区别：现有的 `date` 数据类型以毫秒精度存储日期，而 `date_nanos` 数据类型以纳秒精度存储日期。由于日期仍然存储为表示自纪元以来纳秒数的 `long` 值，其日期范围被限制在大约 1970 到 2262 年之间。

对纳秒的查询会在内部转换为对此 `long` 表示的范围查询，聚合和存储字段的结果会根据与字段关联的日期 `format` 转换回字符串。

日期格式可以自定义，但如果未指定格式，则使用默认格式：

```bash
"strict_date_optional_time_nanos||epoch_millis"
```

例如：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "date": {
        "type": "date_nanos"
      }
    }
  }
}

# 该文档使用普通日期
PUT my-index-000001/_bulk?refresh
{ "index" : { "_id" : "1" } }
{ "date": "2015-01-01" }
# 该文档包含时间
{ "index" : { "_id" : "2" } }
{ "date": "2015-01-01T12:10:30.123456789Z" }
# 该文档使用自纪元以来的毫秒数
{ "index" : { "_id" : "3" } }
{ "date": 1420070400000 }

# 注意返回的 sort 值都是自纪元以来的纳秒数
# 在脚本中使用 .nano 返回日期的纳秒部分
# 使用 fields 参数获取数据时可以指定格式，使用 strict_date_optional_time_nanos，否则会得到四舍五入的结果
GET my-index-000001/_search
{
  "sort": { "date": "asc"},
  "runtime_mappings": {
    "date_has_nanos": {
      "type": "boolean",
      "script": "emit(doc['date'].value.nano != 0)"
    }
  },
  "fields": [
    {
      "field": "date",
      "format": "strict_date_optional_time_nanos"
    },
    {
      "field": "date_has_nanos"
    }
  ]
}
```

你也可以指定多种以 `||` 分隔的日期格式。可以使用与 `date` 字段相同的映射参数。

date nanoseconds 会接受带小数点的数字，例如 `{"date": 1618249875.123456}`，但在某些情况下（[#70085](https://github.com/elastic/elasticsearch/issues/70085)）这些日期会丢失精度，因此应避免使用。

## 限制

即使使用 `date_nanos` 字段，聚合仍然是毫秒精度。此限制同样会影响 transform。

## 合成 _source

合成 source 可能会对 `date_nanos` 字段的值进行排序。例如：

```bash
PUT idx
{
  "settings": {
    "index": {
      "mapping": {
        "source": {
          "mode": "synthetic"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "date": { "type": "date_nanos" }
    }
  }
}

PUT idx/_doc/1
{
  "date": ["2015-01-01T12:10:30.000Z", "2014-01-01T12:10:30.000Z"]
}
```

将变为：

```json
{
  "date": ["2014-01-01T12:10:30.000Z", "2015-01-01T12:10:30.000Z"]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/date_nanos.html)
