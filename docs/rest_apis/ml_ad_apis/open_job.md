# 打开异常检测作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

打开一个或多个异常检测作业。

## 请求

```bash
POST _ml/anomaly_detectors/<job_id>/_open
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

异常检测作业必须打开才能准备好接收和分析数据。作业在其生命周期中可以被多次打开和关闭。

打开新作业时，以空模型开始。

打开现有作业时，自动加载最近的模型状态。一旦接收到新数据，作业即准备好从上次中断处恢复分析。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

## 查询参数

- `timeout`

  （可选，时间值）控制等待作业打开的时间。默认为 30 分钟。

## 请求体

你也可以在请求体中指定 `timeout` 查询参数。

## 响应体

- `node`

  （字符串）作业打开的节点 ID。如果作业允许惰性打开且尚未分配到节点，此值为空字符串。

- `opened`

  （布尔值）对于成功的响应，此值始终为 `true`。失败时，返回异常。

## 示例

```json
POST _ml/anomaly_detectors/low_request_rate/_open
{
  "timeout": "35m"
}
```

作业打开后，你收到以下结果：

```json
{
  "opened" : true,
  "node" : "node-1"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-open-job.html)
