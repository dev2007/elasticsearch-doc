# 创建或更新存储脚本 API

创建或更新一个存储脚本或搜索模板。

```txt
PUT _scripts/<script-id>
POST _scripts/<script-id>
PUT _scripts/<script-id>/<context>
POST _scripts/<script-id>/<context>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有**管理**[集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 路径参数

`<script-id>`

（必需，字符串）存储脚本或搜索模板的标识符。在集群内必须唯一。

`<context>`

（可选，字符串）脚本或搜索模板应运行的上下文。为防止错误，API 会立即在此上下文中编译脚本或模板。

## 查询参数

`context`

（可选，字符串）脚本或搜索模板应运行的上下文。为防止错误，API 会立即在此上下文中编译脚本或模板。如果同时指定此参数和 `<context>` 请求路径参数，API 使用请求路径参数。

`master_timeout`

（可选，[时间单位](../api_conventions/time_units)）等待主节点的时长。如果超时前主节点不可用，请求失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永远不超时。

`timeout`

（可选，[时间单位](../api_conventions/time_units)）更新集群元数据后等待集群中所有相关节点响应的时长。如果超时前未收到响应，集群元数据更新仍然应用，但响应会指示它未被完全确认。默认为 `30s`。也可以设置为 `-1` 表示请求永远不超时。

## 请求体

`script`

（必需，对象）包含脚本或搜索模板、其参数及其语言。

`script` 的属性

- `lang`（必需，字符串）脚本语言。对于搜索模板，使用 `mustache`。

- `source`（必需，字符串或对象）

  - 对于脚本：包含脚本的字符串。

  - 对于搜索模板：包含搜索模板的对象。该对象支持与搜索 API 请求体相同的参数。还支持 Mustache 变量。（请参阅[搜索模板](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-template.html)文档。）

- `params`（可选，对象）脚本或搜索模板的参数。

## 示例

```json
PUT _scripts/my-stored-script
{
  "script": {
    "lang": "painless",
    "source": "Math.log(_score * 2) + params['my_modifier']"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/create-stored-script-api.html)
