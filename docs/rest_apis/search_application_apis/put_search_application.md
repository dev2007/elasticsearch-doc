# 创建或更新搜索应用 API

:::warning Beta

此功能处于 Beta 阶段，可能会发生更改。其设计和代码不如正式 GA 功能成熟，按「原样」提供，不提供任何担保。Beta 功能不受正式 GA 功能的支持 SLA 约束。

:::

创建或更新一个搜索应用。

```txt
PUT _application/search_application/<name>
```

## 前置条件

- 需要 `manage_search_application` [集群权限](../security_privileges/cluster_privileges)。
- 还需要对添加到搜索应用的所有索引具有**管理**[索引权限](../security_privileges/index_privileges)。

## 路径参数

`<name>`

（必需，字符串）搜索应用的名称。

`create`

（可选，布尔值）如果为 `true`，此请求不能替换或更新现有的搜索应用。默认为 `false`。

## 请求体

`indices`

（必需，字符串数组）与此搜索应用关联的索引。所有索引必须已存在才能添加到搜索应用。

`template`

（可选，对象）与此搜索应用关联的搜索模板。

- 搜索应用的模板只能通过搜索应用存储和访问

- 必须是 **Mustache 模板**

- 必须包含 Mustache 脚本和脚本源

- 可以通过后续的 put search application 请求进行修改

- 如果创建搜索应用时未指定模板，或模板被移除，则使用模板示例中定义的 `query_string` 作为默认值

- 由搜索应用搜索 API 用于执行搜索

`template` 的属性

- `script`（必需，对象）关联的 Mustache 模板。

- `dictionary`（可选，对象）用于验证搜索应用搜索 API 所用参数的有效 JSON 模式。如果未指定，参数在应用到模板之前不会被验证。

## 响应码

- `404`

  搜索应用 `<name>` 不存在。

- `409`

  搜索应用 `<name>` 已存在且 `create` 为 `true`。

## 示例

以下示例创建一个名为 `my-app` 的搜索应用：

```json
PUT _application/search_application/my-app
{
  "indices": [ "index1", "index2" ],
  "template": {
    "script": {
      "source": {
        "query": {
          "query_string": {
            "query": "{{query_string}}",
            "default_field": "{{default_field}}"
          }
        }
      },
      "params": {
        "query_string": "*",
        "default_field": "*"
      }
    },
    "dictionary": {
      "properties": {
        "query_string": {
          "type": "string"
        },
        "default_field": {
          "type": "string",
          "enum": [ "title", "description" ]
        },
        "additionalProperties": false
      },
      "required": [ "query_string" ]
    }
  }
}
```

指定上述 `dictionary` 参数后，搜索应用搜索 API 将执行以下验证：

- **仅**接受 `query_string` 和 `default_field` 参数
- 验证 `query_string` 和 `default_field` 均为**字符串**
- 仅当 `default_field` 取值为 `title` 或 `description` 时才接受

如果参数无效，搜索应用搜索 API 将返回错误：

```json
POST _application/search_application/my-app/_search
{
  "params": {
    "default_field": "author",
    "query_string": "Jane"
  }
}
```

将返回以下错误：

```json
{
  "error": {
    "root_cause": [
      {
        "type": "validation_exception",
        "reason": "Validation Failed: 1: $.default_field: does not have a value in the enumeration [title, description];",
        "stack_trace": "..."
      }
    ],
    "type": "validation_exception",
    "reason": "Validation Failed: 1: $.default_field: does not have a value in the enumeration [title, description];",
    "stack_trace": "..."
  },
  "status": 400
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-search-application.html)
