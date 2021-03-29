# 索引恢复优先级

无论何时，尽可能的按优先级顺序恢复未分析的分片。索引按优先级顺序排序，如下：

- 可选的 `index.priority` 设置（先高后低）
- 索引创建日期（先高后低）
- 索引名字（先高后低）

这意味着，默认情况下，新索引比旧索引先恢复。

使用每个索引动态可更新的 `index.priority` 设置用于自定义索引优先级顺序。例如：

```bash
PUT index_1

PUT index_2

PUT index_3
{
  "settings": {
    "index.priority": 10
  }
}

PUT index_4
{
  "settings": {
    "index.priority": 5
  }
}
```

在以上例子中：

- `index_3` 会首先恢复，因为它有最高的 `index.priority`。
- `index_4` 会接着恢复，因为它有第二高的优先级。
- `index_2` 会接着恢复，因为它是最近创建的。
- `index_1` 会最后恢复。

这个设置接受一个整数，也可以通过[更新索引设置 API](/rest_apis/index_apis/update_index_settings) 在活动索引中更新。

```bash
PUT index_4/_settings
{
  "index.priority": 1
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/recovery-prioritization.html)
