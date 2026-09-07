# 关闭异常检测作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

关闭一个或多个异常检测作业。

## 请求

```bash
POST _ml/anomaly_detectors/<job_id>/_close
```

```bash
POST _ml/anomaly_detectors/<job_id>,<job_id>/_close
```

```bash
POST _ml/anomaly_detectors/_all/_close
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

作业在其生命周期中可以被多次打开和关闭。

已关闭的作业无法接收数据或执行分析操作，但你仍然可以探索和浏览结果。

如果关闭数据源正在运行的异常检测作业，请求会首先尝试停止数据源。此行为等效于使用与关闭作业请求相同的 `timeout` 和 `force` 参数调用停止数据源 API。

关闭作业时，它会运行内务处理任务，如修剪模型历史、刷新缓冲区、计算最终结果和持久化模型快照。根据作业的大小，关闭可能需要几分钟，重新打开也需要相同的时间。

关闭后，除了维护其元数据外，作业对集群的开销最小。因此，最佳实践是关闭不再需要处理数据的作业。

当具有指定结束日期的数据源停止时，它会自动关闭关联的作业。

如果使用 `force` 查询参数，请求将返回而不执行相关操作（如刷新缓冲区和持久化模型快照）。因此，如果你希望在关闭作业 API 返回后作业处于一致状态，请不要使用此参数。`force` 查询参数仅适用于作业已经失败，或者你不在乎作业可能最近产生或将来可能产生的结果的情况。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。可以是作业标识符、组名称或通配符表达式。

  你可以使用 `_all` 或将 `*` 指定为作业标识符来关闭所有作业。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的作业。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空作业数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `force`

  （可选，布尔值）用于关闭失败的作业，或强制关闭未响应初始关闭请求的作业。

- `timeout`

  （可选，时间值）控制等待作业关闭的时间。默认为 30 分钟。

## 响应码

- 404（缺少资源）：如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源或只有部分匹配。

## 示例

```bash
POST _ml/anomaly_detectors/low_request_rate/_close
```

作业关闭后，你收到以下结果：

```json
{
  "closed": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-close-job.html)
