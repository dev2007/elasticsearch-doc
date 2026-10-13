# 启动 watch 服务 API

如果 Watcher 服务尚未运行，则启动它。

```txt
POST _watcher/_start
```

## 前置条件

- 你必须具有 `manage_watcher` 集群权限才能使用此 API。

## 响应体

请求成功时，Watcher 返回以下响应：

```json
{
  "acknowledged": true
}
```

## 示例

以下示例启动 Watcher 服务：

```txt
POST _watcher/_start
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-start.html)
