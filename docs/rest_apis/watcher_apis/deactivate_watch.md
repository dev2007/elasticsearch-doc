# 停用 watch API

一个 watch 可以处于**活动**或**非活动**状态。此 API 使你能够停用当前处于活动状态的 watch。

```txt
PUT _watcher/watch/<watch_id>/_deactivate
```

## 前置条件

- 你必须具有 `manage_watcher` 集群权限才能使用此 API。

## 路径参数

`<watch_id>`

（必需，字符串）watch 的标识符。

## 示例

以下示例展示停用一个 watch 的步骤：

1. 通过获取 watch API 检查 watch 的状态：

```txt
GET _watcher/watch/my_watch
```

响应显示该 watch 处于活动状态（`active` 为 `true`）：

```json
{
  "found": true,
  "_id": "my_watch",
  "_version": 1,
  "_seq_no": 0,
  "_primary_term": 1,
  "status": {
    "state": {
      "active": true,
      "timestamp": "2015-08-20T12:21:32.734Z"
    },
    "actions": "...",
    "version": 1
  },
  "watch": "..."
}
```

2. 停用该 watch：

```txt
PUT _watcher/watch/my_watch/_deactivate
```

响应将 watch 的新状态作为其整体状态的一部分返回（`active` 为 `false`）：

```json
{
  "status": {
    "state": {
      "active": false,
      "timestamp": "2015-09-04T08:39:46.816Z"
    },
    "actions": "...",
    "version": 1
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-deactivate-watch.html)
