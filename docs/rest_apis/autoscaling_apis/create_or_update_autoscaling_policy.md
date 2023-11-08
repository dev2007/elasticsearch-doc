# 创建或更新自动伸缩策略 API

:::note 提示
此特性设计用于 [Elasticsearch Service](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)、[Elastic Cloud Enterprise](https://www.elastic.co/guide/en/cloud-enterprise/current) 和 [Kubernetes 上的 Elastic Cloud](https://www.elastic.co/guide/en/cloud-on-k8s/current) 的间接使用。不支持直接用户使用。
:::

创建或更新一个自动伸缩策略。

## 请求

```bash
PUT /_autoscaling/policy/<name>
{
  "roles": [],
  "deciders": {
    "fixed": {
    }
  }
}
```

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `manage_autoscaling` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges.html#集群权限)来使用此 API。

- 如果启用了[操作员权限特性](/secure_the_elastic_stack/operator_privileges/operator_privileges)，则只有操作员用户可以使用此 API。

## 描述

此 API 使用提供的名称修改自动伸缩策略。关于可用的决策器，参阅[自动伸缩决策器](/autoscaling/autoscaling_deciders)。

## 示例

此示例使用固定的自动缩放决策器，将名为 `my_autoscaling_policy` 的自动缩放策略应用于（仅）具有 “data_hot” 角色的节点集。

```bash
PUT /_autoscaling/policy/my_autoscaling_policy
{
  "roles" : [ "data_hot" ],
  "deciders": {
    "fixed": {
    }
  }
}
```

此 API 返回以下结果：

```bash
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/autoscaling-put-autoscaling-policy.html)
