# 停止 watch 服务 API

如果 Watcher 服务正在运行，则停止它。

```txt
POST _watcher/_stop
```

## 前置条件

- 你必须具有 `manage_watcher` 集群权限才能使用此 API。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。也可以设置为 `-1`，表示请求永不超时。

## 响应体

请求成功时，Watcher 返回以下响应：

```json
{
  "acknowledged": true
}
```

## 示例

以下示例停止 Watcher 服务：

```txt
POST _watcher/_stop
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-stop.html)
