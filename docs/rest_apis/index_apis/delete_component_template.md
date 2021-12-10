# 删除组件模板 API

删除已有的组件模板。

```bash
DELETE _component_template/template_1
```

提供的 <component template> 可以包含多个用逗号分隔的模板名称。如果指定了多个模板名称，则不支持通配符，并且提供的名称应与现有组件模板完全匹配。

## 请求

`DELETE /_component_template/<component-template>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage_index_templates` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=集群权限)。

## 描述

使用删除组件模板 API 可以删除一个或多个组件模板。组件模板是构造[索引模板](/index_templates/index_templates)的构造块，用于指定索引映射、设置和别名。

## 路径参数

- `<component-template>`

（必需，字符串）用于限制请求的，逗号分隔的组件模板名字或通配符表达式。

## 查询参数

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-delete-component-template.html)
