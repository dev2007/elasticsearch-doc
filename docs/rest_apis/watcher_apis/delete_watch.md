# 删除 watch API

从 Watcher 中移除一个 watch。

```txt
DELETE _watcher/watch/<watch_id>
```

## 前置条件

- 你必须具有 `manage_watcher` 集群权限才能使用此 API。

## 描述

- watch 被移除后，`.watches` 索引中代表该 watch 的文档会被删除，该 watch 将**永远不会再次运行**。
- 删除 watch **不会**从 **watch 历史**中删除与该 watch 相关的任何 watch 执行记录。
- 删除 watch **只能**通过此 API 完成。不要使用 Elasticsearch 的 DELETE 文档 API 直接从 `.watches` 索引中删除 watch。
- 启用 Elasticsearch 安全功能后，请确保**不向任何人授予**对 `.watches` 索引的写权限。

## 路径参数

`<watch_id>`

（必需，字符串）watch 的标识符。

## 响应体

```json
{
  "found": true,
  "_id": "my_watch",
  "_version": 2
}
```

## 示例

以下示例删除 ID 为 `my_watch` 的 watch：

```txt
DELETE _watcher/watch/my_watch
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-delete-watch.html)
