# 删除自动伸缩策略 API

?> 此特性设计用于 [Elasticsearch Service](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)、[Elastic Cloud Enterprise](https://www.elastic.co/guide/en/cloud-enterprise/current) 和 [Kubernetes 上的 Elastic Cloud](https://www.elastic.co/guide/en/cloud-on-k8s/current) 的间接使用。不支持直接用户使用。

删除自动伸缩策略。

## 请求

```bash
DELETE /_autoscaling/policy/<name>
```

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `manage_autoscaling` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=集群权限)来使用此 API。

- 如果启用了[操作员权限特性](/secure_the_elastic_stack/operator_privileges/operator_privileges)，则只有操作员用户可以使用此 API。

## 描述

此 API 使用提供的名称删除一个自动伸缩策略。

## 示例

此示例删除一个名为 `my_autoscaling_policy` 的 自动伸缩策略。

```bash
DELETE /_autoscaling/policy/my_autoscaling_policy
```

此 API 返回以下结果：

```bash
{
  "acknowledged": true
}
```

此示例删除所有自动伸缩策略。

```bash
DELETE /_autoscaling/policy/*
```

此 API 返回以下结果：

```bash
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/autoscaling-delete-autoscaling-policy.html)
