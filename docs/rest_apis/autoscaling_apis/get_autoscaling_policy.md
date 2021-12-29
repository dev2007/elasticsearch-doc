# 获取自动伸缩策略 API

?> 此特性设计用于 [Elasticsearch Service](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)、[Elastic Cloud Enterprise](https://www.elastic.co/guide/en/cloud-enterprise/current) 和 [Kubernetes 上的 Elastic Cloud](https://www.elastic.co/guide/en/cloud-on-k8s/current) 的间接使用。不支持直接用户使用。

## 请求

```bash
GET /_autoscaling/policy/<name>
```

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `manage_autoscaling` 集群权限。更多信息，参阅[安全权限](/secure_the_elastic_statck/user_authorization/security_privileges)。

## 描述

此 API 获取指定名字的自动伸缩策略。

## 示例

此示例获取名为 `my_autoscaling_policy` 自动伸缩策略。

```bash
GET /_autoscaling/policy/my_autoscaling_policy
```

此 API 返回以下结果：

```bash
{
   "roles": <roles>,
   "deciders": <deciders>
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/autoscaling-get-autoscaling-policy.html)
