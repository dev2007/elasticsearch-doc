# 启动 rollup 作业 API

:::warning 已弃用

在 8.11.0 中已弃用。

Rollup 将在未来版本中移除。请改用[降采样](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/downsampling-data-stream.html)。

:::

启动一个现有的、已停止的 rollup 作业。

- 如果尝试启动一个**不存在**的作业，会发生异常。
- 如果尝试启动一个**已启动**的作业，不会发生任何变化。

```txt
POST _rollup/job/<job_id>/_start
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 或 `manage_rollup` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 路径参数

`<job_id>`

（必需，字符串）rollup 作业的标识符。

## 响应码

- `404`（资源缺失）

  表示没有与请求匹配的资源。尝试启动不存在的作业时会发生。

## 示例

如果已经创建了一个名为 `sensor` 的 rollup 作业，可以使用以下命令启动它：

```txt
POST _rollup/job/sensor/_start
```

响应：

```json
{
  "started": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rollup-start-job.html)
