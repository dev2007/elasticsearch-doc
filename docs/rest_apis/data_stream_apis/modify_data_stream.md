# 修改数据流 API

在单个原子操作中执行一个或多个[数据流](/data_streams)修改操作。

```bash
POST _data_stream/_modify
{
  "actions": [
    {
      "remove_backing_index": {
        "data_stream": "my-logs",
        "index": ".ds-my-logs-2099.01.01-000001"
      }
    },
    {
      "add_backing_index": {
        "data_stream": "my-logs",
        "index": "index-to-add"
      }
    }
  ]
}
```

## 请求

`POST /_data_stream/_modify`

## 请求体

- `actions`

    (必填，对象数组）要执行的操作。

    - `actions` 对象属性

        - `<action>`

            (必填，对象）键是操作类型。至少需要一个操作。

            - 有效的 `<action>` 键
                
                - `add_backing_index`

                添加现有索引作为数据流的后备索引。作为该操作的一部分，索引将被隐藏。

                :::warning 警告
                使用 add_backing_index 操作添加索引可能会导致不当的数据流行为。这应该被视为专家级 API。
                :::
                    
                
                - `remove_backing_index`

                    从数据流中删除一个后备索引。作为该操作的一部分，索引将被取消隐藏。不能删除数据流的写索引。
            
            - `<action>` 属性（对象主体包含的操作选项）

                - `data_stream`

                    (必需*，字符串） 操作所针对的数据流。

                - `index`

                    (必需*，字符串）操作索引。




> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/modify-data-streams-api.html)
