# 获取索引模板 API

返回一个或多个索引模板的信息。

```bash
GET /_index_template/template_1
```

## 请求

`GET /_index_template/<index-template>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage_index_templates` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=集群权限)。

## 路径参数

- `<index-template>`

（必需，字符串）限制请求的逗号分隔的索引名字列表。支持通配符（*）。

为了获取所有索引模板，忽略此参数或使用 `*` 值。

## 查询参数

- `flat_settings`

（可选，布尔值）如果为 `true`，以平面格式返回设置。默认为 `false`。

- `include_type_name`

[~~7.0.0~~开始不推荐] （可选，布尔值）如果为 `true`，映射体中需要映射类型。默认为 `false`。

- `local`

（可选，布尔值）如果为 `true`，请求只从本地节点获取信息。默认为 `false`，意味着信息从主节点获取。

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 示例

### 使用通配符表达式获取索引模板

```bash
GET /_index_template/temp*
```

### 获取所有索引模板

```bash
GET /_index_template
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-template.html)