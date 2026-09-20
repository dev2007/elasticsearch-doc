# 获取搜索应用 API

:::warning Beta

此功能处于 Beta 阶段，可能会发生更改。其设计和代码不如正式 GA 功能成熟，按「原样」提供，不提供任何担保。Beta 功能不受正式 GA 功能的支持 SLA 约束。

:::

检索有关搜索应用的信息。

```txt
GET _application/search_application/<name>
```

## 前置条件

- 需要 `manage_search_application` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<name>`

（必需，字符串）搜索应用的名称。

## 响应码

- `400`

  未提供名称。

- `404`（资源缺失）

  找不到与名称匹配的搜索应用。

## 示例

以下示例获取名为 `my-app` 的搜索应用：

```txt
GET _application/search_application/my-app/
```

响应示例：

```json
{
  "name": "my-app",
  "indices": [ "index1", "index2" ],
  "updated_at_millis": 1682105622204,
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
      "lang": "mustache",
      "options": {
        "content_type": "application/json;charset=utf-8"
      },
      "params": {
        "query_string": "*",
        "default_field": "*"
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-search-application.html)
