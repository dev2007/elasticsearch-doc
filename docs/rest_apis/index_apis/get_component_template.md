# 获取组件模板 API

获取一个或多个组件模板的信息。

```bash
GET /_component_template/template_1
```

## 请求

`GET /_component_template/<component-template>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage_index_templates` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=集群权限)。

## 路径参数

- `<component-template>`

（可选，字符串）用于限制请求的，逗号分隔的组件模板名字。支持通配符（*）表达式。

## 查询参数

- `flat_settings`

（可选，布尔值）如果为 `true`，以平面格式返回设置。默认为 `false`。

- `local`

（可选，布尔值）如果为 `true`，请求只从本地节点获取信息。默认为 `false`，意味着信息从主节点获取。

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 示例

### 通过通配符表达式获取组件模板

```bash
GET /_component_template/temp*
```

### 获取所有组件模板

```bash
GET /_component_template
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-component-templates.html#getting-component-templates)
