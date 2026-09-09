# 删除数据帧分析作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习数据帧分析 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-dfa)。

:::::

删除一个已存在的数据帧分析作业。

## 请求

```bash
DELETE _ml/data_frame/analytics/<data_frame_analytics_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 路径参数

- `<data_frame_analytics_id>`

  （必需，字符串）数据帧分析作业的标识符。

## 查询参数

- `force`

  （可选，布尔值）如果为 `true`，删除未停止的作业；此方法比先停止再删除作业更快。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待作业删除的时间。默认为 1 分钟。

## 示例

以下示例删除 `loganalytics` 数据帧分析作业：

```bash
DELETE _ml/data_frame/analytics/loganalytics
```

API 返回以下结果：

```json
{
  "acknowledged" : true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-dfanalytics.html)
