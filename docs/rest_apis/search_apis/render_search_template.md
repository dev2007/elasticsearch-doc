# 渲染搜索模板 API

将[搜索模板](/rest_apis/search_apis/search_template)呈现为[搜索请求体](/rest_apis/search_apis/search)。

```bash
POST _render/template
{
  "id": "my-search-template",
  "params": {
    "query_string": "hello world",
    "from": 20,
    "size": 10
  }
}
```

## 请求

`GET _render/template`

`GET _render/template/<template-id>`

`POST _render/template`

`POST _render/template/<template-id>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对至少一个索引模型必须有 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<template-id>`
  （必需，字符串）待渲染的搜索模板 ID。如果 `source` 未指定，此参数或请求体中的 `id` 将是必需的。

## 请求体

- `id`
  （必需，字符串）待渲染的搜索模板的 ID。如果 `source` 未指定，则此参数或请求路径参数 `<template-id>` 是必需的。如果同时指定此参数和 `<template id>` 参数，则 API 仅使用 `<template id>`。

- `params`
  (可选，对象)用于替换模板中 Mustache 变量的键值对。键是变量名。值是可变值。

- `source`
  （必需，对象）内联搜索模板。支持与搜索 API 的请求体相同的参数。这些参数还支持 Mustache 变量。如果未指定 `id` 或 `<templated id>`，则此参数是必需的。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/render-search-template-api.html)
