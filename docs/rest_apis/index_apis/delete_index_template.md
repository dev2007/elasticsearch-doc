# 删除索引模板 API

删除[索引模板](/index_templates/index_templates)。

```bash
DELETE /_index_template/my-index-template
```

## 请求

`DELETE /_index_template/<index-template>`

`<index-template>` 可以包含多个用逗号分隔的模板名字。如果指定了多个模板名字，那就不能使用通配符，并且要与已有模板名字完全一样。

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage_index_templates` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。

## 描述

使用删除索引模板 API 去删除一个或多个索引模板。索引模板定义了可以自动用于新索引的[设置](/index_modules#索引设置)、[映射](/mapping/mapping)和[别名](/rest_apis/index_apis/aliases)。

## 路径参数

- `<index-template>`

（必需，字符串）限制请求的逗号分隔的索引名字列表。支持通配符（*）。

## 查询参数

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-delete-template.html)