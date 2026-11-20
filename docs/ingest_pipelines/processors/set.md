# Set 处理器

设置一个字段并将其与指定值关联。如果该字段已存在，其值将被提供的值替换。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要插入、更新或 upsert 的字段。支持模板片段。 |
| `value` | 是* | - | 要为字段设置的值。支持模板片段。只能指定 `value` 或 `copy_from` 之一。 |
| `copy_from` | 否 | - | 要复制到 `field` 的源字段，不能与 `value` 同时设置。支持的数据类型包括布尔值、数字、数组、对象、字符串、日期等。 |
| `override` | 否 | `true` | 设为 `true` 时，处理器会更新已存在的非空值字段。设为 `false` 时，此类字段不会被改动。 |
| `ignore_empty_value` | 否 | `false` | 设为 `true` 时，如果与 `value`（模板片段求值为 `null` 或空字符串）配合使用，处理器将安静地退出而不修改文档；与 `copy_from` 配合使用时，如果字段不存在或其值求值为 `null` 或空字符串，同样安静退出。 |
| `media_type` | 否 | `application/json` | 用于编码 `value` 的媒体类型。仅在 `value` 为模板片段时适用。必须是 `application/json`、`text/plain` 或 `application/x-www-form-urlencoded` 之一。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例 1：基本用法

```json
{
  "description" : "sets the value of count to 1",
  "set": {
    "field": "count",
    "value": 1
  }
}
```

## 示例 2：使用模板片段设置字段

```json
PUT _ingest/pipeline/set_os
{
  "description": "sets the value of host.os.name from the field os",
  "processors": [
    {
      "set": {
        "field": "host.os.name",
        "value": "{{{os}}}"
      }
    }
  ]
}
```

模拟输入：

```json
POST _ingest/pipeline/set_os/_simulate
{
  "docs": [
    {
      "_source": {
        "os": "Ubuntu"
      }
    }
  ]
}
```

输出结果：

```json
{
  "docs" : [
    {
      "doc" : {
        "_index" : "_index",
        "_id" : "_id",
        "_version" : "-3",
        "_source" : {
          "host" : {
            "os" : {
              "name" : "Ubuntu"
            }
          },
          "os" : "Ubuntu"
        },
        "_ingest" : {
          "timestamp" : "2019-03-11T21:54:37.909224Z"
        }
      }
    }
  ]
}
```

## 示例 3：使用点号表示法访问数组字段

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      {
        "set": {
          "field": "my_field",
          "value": "{{{input_field.1}}}"
        }
      }
    ]
  },
  "docs": [
    {
      "_index": "index",
      "_id": "id",
      "_source": {
        "input_field": [
          "Ubuntu",
          "Windows",
          "Ventura"
        ]
      }
    }
  ]
}
```

输出结果：

```json
{
  "docs": [
    {
      "doc": {
        "_index": "index",
        "_id": "id",
        "_version": "-3",
        "_source": {
          "input_field": [
            "Ubuntu",
            "Windows",
            "Ventura"
          ],
          "my_field": "Windows"
        },
        "_ingest": {
          "timestamp": "2023-05-05T16:04:16.456475214Z"
        }
      }
    }
  ]
}
```

## 示例 4：使用 copy_from 复制复杂值

```json
PUT _ingest/pipeline/set_bar
{
  "description": "sets the value of bar from the field foo",
  "processors": [
    {
      "set": {
        "field": "bar",
        "copy_from": "foo"
      }
    }
  ]
}
```

模拟输入：

```json
POST _ingest/pipeline/set_bar/_simulate
{
  "docs": [
    {
      "_source": {
        "foo": ["foo1", "foo2"]
      }
    }
  ]
}
```

输出结果：

```json
{
  "docs" : [
    {
      "doc" : {
        "_index" : "_index",
        "_id" : "_id",
        "_version" : "-3",
        "_source" : {
          "bar": ["foo1", "foo2"],
          "foo": ["foo1", "foo2"]
        },
        "_ingest" : {
          "timestamp" : "2020-09-30T12:55:17.742795Z"
        }
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/set-processor.html)
