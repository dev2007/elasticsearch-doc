# 创建数据流

创建一个新的[数据流](/data_streams)。

```bash
PUT /_data_stream/my-data-stream
```

## 请求

`PUT /_data_stream/<data-stream>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `create_index` 或 `manage` 的[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)：
- 已启用数据流的匹配[索引模板](/index_templates)。参阅[设置数据流](/data_streams/set_up_a_data_stream)。

## 路径参数

- `<data-stream>`

    (必须，字符串） 要创建的数据流的名称。数据流名称必须符合以下条件：

    - 只能是小写
    - 不能包含 `\`，`/`，`*`，`?`，`"`，`<`，`>`，`|`，`,`，`#`，`:` 或空格符
    - 不能以这些开头：`-`，`_`，`+`，或 `.ds-`
    - 长度不能超过 255 字节。多字节字符的计算速度更快。


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-create-data-stream.html)
