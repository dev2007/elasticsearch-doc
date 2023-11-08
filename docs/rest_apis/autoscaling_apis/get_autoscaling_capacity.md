# 获取自动伸缩容量 API

:::note 提示
此特性设计用于 [Elasticsearch Service](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)、[Elastic Cloud Enterprise](https://www.elastic.co/guide/en/cloud-enterprise/current) 和 [Kubernetes 上的 Elastic Cloud](https://www.elastic.co/guide/en/cloud-on-k8s/current) 的间接使用。不支持直接用户使用。
:::

获取自动伸缩容量。

## 请求

```bash
GET /_autoscaling/capacity/
```

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `manage_autoscaling` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)来使用此 API。

## 描述

此 API 根据配置的自动伸缩策略获取当前自动缩放容量。此 API 将返回信息，以根据当前工作负载适当调整集群大小。

`required_capacity` 计算为针对策略启用的所有单个决策者的 `required_capacity` 结果的最大值。

操作员应验证 `current_nodes` 是否与操作员对集群的了解相匹配，以避免根据陈旧或不完整的信息做出自动伸缩决策。

响应包含特定于决策者的信息，你可以使用这些信息诊断自动缩放如何以及为什么确定需要某个容量。此信息仅用于诊断。不要使用此信息进行自动伸缩决策。

## 响应体

- `policies`

  （对象）包含策略名称到容量结果的映射
  - `policies` 属性
    - `<policy_name>`
      （对象）包含策略的容量信息。
      - `<policy_name>` 属性

        - `required_capacity`
          （对象）包含策略所需的容量。
          - `required_capacity` 属性
            - `node`
              （对象）包含每个节点所需的最小节点大小，确保单个碎片或机器学习（ML）作业可以装入单个节点。
              - `node` 属性
                - `storage`
                  （整数）每个节点所需的存储字节数。
                - `memory`
                  （整数）每个节点所需的内存字节数。
            - `total`
              （对象）包含策略所需的总大小。
              - `total` 属性
                - `storage`
                  （整数）策略所需的总存储字节数。
                - `memory`
                  （整数）策略所需的总内存字节数。

        - `current_capacity`
          （对象）包含受策略控制的节点的当前容量，即 Elasticsearch 计算所基于的节点。
          - `current_capacity` 属性
            - `node`
              （对象）包含由策略管理的节点的最大大小。
              - `node` 属性
                - `storage`
                  （整数）节点的最大存储字节数。
                - `memory`
                  （整数）节点的最大内存字节数。
            - `total`
              （对象）包含受策略控制的节点的当前总存储和内存大小。
              - `total` 属性
                - `storage`
                  （整数）可用于策略的当前存储字节数。
                - `memory`
                  （整数）可用于策略的当前内存字节数。

        - `current_nodes`
          （对象数组）用于容量计算的节点列表。
          - `current_nodes` 中元素的属性
            - `name`
              （字符串）节点名字。

        - `deciders`
          （对象）容量是由单个决策者得出的结果，允许深入了解外部级别 `required_capacity` 是如何计算的。
          - `deciders` 属性
            - `<decider_name>`
              （对象）为策略启用的特定决策器的容量结果。
              - `<decider_name>` 属性
                - `required_capacity`
                  （对象）由决策器确定的所需容量。
                  - `required_capacity` 属性
                    - `node`
                      （对象）包含每个节点所需的最小节点大小，确保单个分片或机器学习作业可以装入单个节点。
                      - `node` 属性
                        - `storage`
                          （整数）每个节点所需的存储字节数。
                        - `memory`
                          （整数）每个节点所需的内存字节数。
                    - `total`
                      （对象）包含策略所需的总大小。
                      - `total` 属性
                        - `storage`
                          （整数）策略所需的总存储字节数。
                        - `memory`
                          （整数）策略所需的总内存字节数。
                  - `reason_summary`
                    （字符串）描述决策器结果的依据。
                  - `reason_details`
                    （对象）每个决策器的结构，包含决策器结果基础的详细信息。内容不应用于应用目的，也不受向后兼容性保证的约束。

## 示例

此示例获取当前自动伸缩容量。

```bash
GET /_autoscaling/capacity
```

此 API 返回以下结果：

```bash
{
  policies: {}
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/autoscaling-get-autoscaling-capacity.html)
