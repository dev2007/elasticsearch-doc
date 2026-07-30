# cat 模板 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[获取索引模板 API](/rest_apis/index_apis/get_index_template)。

::::

返回集群中索引模板的信息。你可以使用索引模板在创建时将索引设置和字段映射应用到新索引。

## 请求

```json
GET /_cat/templates/<template_name>
```

```json
GET /_cat/templates
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<template_name>`（可选，字符串）

  要返回的模板名称。接受通配符表达式。如果省略，则返回所有模板。

## 查询参数

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `local`（可选，布尔值）

  如果为 `true`，请求仅从本地节点检索信息。默认为 `false`，表示从主节点检索信息。

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 示例

```json
GET _cat/templates/my-template-*?v=true&s=name
```

API 返回以下响应：

```text
name          index_patterns order version composed_of
my-template-0 [te*]          500           []
my-template-1 [tea*]         501           []
my-template-2 [teak*]        502   7       []
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-templates.html)
