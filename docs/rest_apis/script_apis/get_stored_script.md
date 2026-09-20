# 获取存储脚本 API

检索一个存储脚本或搜索模板。

```txt
GET _scripts/<script-id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 路径参数

`<script-id>`

（必需，字符串）存储脚本或搜索模板的标识符。

## 查询参数

`master_timeout`

（可选，[时间单位](../api_conventions/time_units)）等待主节点的时长。如果超时前主节点不可用，请求失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永远不超时。

## 示例

```txt
GET _scripts/my-stored-script
```

响应示例：

```json
{
  "_id": "my-stored-script",
  "found": true,
  "script": {
    "lang": "painless",
    "source": "Math.log(_score * 2) + params['my_modifier']"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-stored-script-api.html)
