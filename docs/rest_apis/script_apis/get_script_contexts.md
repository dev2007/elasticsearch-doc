# 获取脚本上下文 API

检索支持的**脚本上下文**及其**方法**的列表。

```txt
GET _script_context
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 响应体

`contexts`

（数组）包含支持的脚本上下文。

`contexts` 中对象的属性

`name`

（字符串）脚本上下文的名称。

`methods`

（数组）该上下文支持的方法。

`methods` 中对象的属性

- `name`（字符串）方法的名称。

- `return_type`（字符串）方法的返回类型。

- `params`（数组）方法的参数。

  `params` 中对象的属性

  - `name`（字符串）参数的名称。

  - `type`（字符串）参数的类型。

## 示例

```txt
GET _script_context
```

响应示例：

```json
{
  "contexts": [
    {
      "name": "boolean_field",
      "methods": [
        {
          "name": "execute",
          "return_type": "java.lang.Boolean",
          "params": [
            {
              "name": "vars",
              "type": "java.util.Map<java.lang.String,java.lang.Object>"
            }
          ]
        },
        {
          "name": "execute",
          "return_type": "java.lang.Boolean",
          "params": [
            {
              "name": "varsAsMap",
              "type": "java.util.Map<java.lang.String,java.lang.Object>"
            }
          ]
        }
      ]
    },
    {
      "name": "score",
      "methods": [ "..." ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-script-contexts-api.html)
