# 删除存储脚本 API

删除一个存储脚本或搜索模板。

```txt
DELETE _scripts/<script-id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 路径参数

`<script-id>`

（必需，字符串）存储脚本或搜索模板的标识符。

## 查询参数

`master_timeout`

（可选，[时间单位](../api_conventions/time_units)）等待主节点的时长。如果超时前主节点不可用，请求失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永远不超时。

`timeout`

（可选，[时间单位](../api_conventions/time_units)）更新集群元数据后等待集群中所有相关节点响应的时长。如果超时前未收到响应，集群元数据更新仍然应用，但响应会指示它未被完全确认。默认为 `30s`。也可以设置为 `-1` 表示请求永远不超时。

## 示例

```txt
DELETE _scripts/my-stored-script
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-stored-script-api.html)
