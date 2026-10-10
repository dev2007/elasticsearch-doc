# 执行快照保留策略 API

根据策略的保留规则删除任何已过期的快照。手动应用保留策略以强制立即移除过期的快照。保留策略通常会根据其时间表被应用。

```txt
POST /_slm/_execute_retention
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage_slm` 集群权限才能使用此 API。

## 描述

:::note 注意

保留操作在后台异步运行。

:::

## 示例

以下示例强制移除已过期的快照：

```txt
POST /_slm/_execute_retention
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/slm-api-execute-retention.html)
