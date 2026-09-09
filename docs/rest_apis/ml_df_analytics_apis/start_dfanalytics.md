# 启动数据帧分析作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习数据帧分析 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-dfa)。

:::::

启动一个数据帧分析作业。

## 请求

```bash
POST _ml/data_frame/analytics/<data_frame_analytics_id>/_start
```

## 前置条件

- 需要以下权限：
  - 集群：`manage_ml`（`machine_learning_admin` 内置角色授予此权限）— [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)
  - 源索引：`read`、`view_index_metadata` — [权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)
  - 目标索引：`read`、`create_index`、`manage` 和 `index`

## 描述

数据帧分析作业在其生命周期中可以被多次启动和停止。

如果目标索引不存在，首次启动数据帧分析作业时会自动创建它。目标索引的 `index.number_of_shards` 和 `index.number_of_replicas` 设置从源索引复制。如果有多个源索引，目标索引复制最高的设置值。目标索引的映射也从源索引复制。如果存在映射冲突，作业将无法启动。

如果目标索引已存在，则按原样使用。因此，你可以提前使用自定义设置和映射设置目标索引。

当启用了 Elasticsearch 安全功能时，数据帧分析作业会记住创建它的用户，并使用这些凭据运行作业。如果创建作业时提供了辅助授权头，则使用这些凭据。

## 路径参数

- `<data_frame_analytics_id>`

  （必需，字符串）数据帧分析作业的标识符。此标识符可以包含小写字母数字字符（a-z 和 0-9）、短横线和下划线。必须以字母数字字符开头和结尾。

## 查询参数

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待数据帧分析作业启动的时间。默认为 20 秒。

## 响应体

- `acknowledged`

  （布尔值）对于成功的响应，此值始终为 `true`。失败时，返回异常。

- `node`

  （字符串）作业启动的节点 ID。如果作业允许惰性打开且尚未分配到节点，此值为空字符串。

## 示例

以下示例启动 `loganalytics` 数据帧分析作业：

```bash
POST _ml/data_frame/analytics/loganalytics/_start
```

数据帧分析作业启动后，你收到以下结果：

```json
{
  "acknowledged" : true,
  "node" : "node-1"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/start-dfanalytics.html)
