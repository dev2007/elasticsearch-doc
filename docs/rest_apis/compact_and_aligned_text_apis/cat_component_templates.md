# cat 组件模板 API

::::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。
::::

::::caution 警告
cat API 仅用于使用命令行或 Kibana 控制台的人工查看。它们不适用于应用程序。对于应用程序使用，请使用[获取组件模板 API](/rest_apis/index_apis/get_component_template)。
::::

返回集群中有关组件模板的信息。组件模板是构建索引模板的构建块，用于指定索引映射、设置和别名。

## 请求

```bash
GET /_cat/component_templates/<template_name>
```

```bash
GET /_cat/component_templates
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<template_name>`（可选，字符串）

  要返回的组件模板名称。接受通配符表达式。如果省略，返回所有组件模板。

## 查询参数

- `format`（可选，字符串）

  HTTP accept 头的简写版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

- `help`（可选，布尔值）

  如果为 `true`，响应包含帮助信息。默认为 `false`。

- `local`（可选，布尔值）

  如果为 `true`，请求仅从本地节点检索信息。默认为 `false`，表示从主节点检索信息。

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果在超时到期前主节点不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `v`（可选，布尔值）

  如果为 `true`，响应包含列标题。默认为 `false`。

## 示例

```bash
GET _cat/component_templates/my-template-*?v=true&s=name
```

API 返回以下响应：

```bash
name          version alias_count mapping_count settings_count metadata_count included_in
my-template-1         0           0             1              0              [my-index-template]
my-template-2         0           3             0              0              [my-index-template]
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-component-templates.html)
