# 解释生命周期 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [解释生命周期 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-ilm-explain-lifecycle)。

:::::

检索一个或多个索引的当前生命周期状态。对于数据流，该 API 检索数据流后备索引的当前生命周期状态。

## 请求

```bash
GET <target>/_ilm/explain
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对受管理的索引拥有 `view_index_metadata` 或 `manage_ilm` 或两者的[权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

检索有关索引当前生命周期状态的信息，例如当前正在执行的阶段、操作和步骤。显示索引进入每个阶段的时间、运行阶段的定义以及任何故障的信息。

## 路径参数

- `<target>`

  （必需，字符串）要目标定位的数据流、索引和别名的逗号分隔列表。支持通配符（`*`）。要目标定位所有数据流和索引，使用 `*` 或 `_all`。

## 查询参数

- `only_managed`

  （可选，布尔值）过滤返回的索引，仅返回由 ILM 管理的索引。

- `only_errors`

  （可选，布尔值）过滤返回的索引，仅返回由 ILM 管理且处于错误状态的索引（由于执行策略时遇到错误，或尝试使用不存在的策略）。

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

以下示例检索 `my-index-000001` 的生命周期状态：

```bash
GET my-index-000001/_ilm/explain?human
```

当索引的管理首次由 ILM 接管时，解释显示该索引已被管理并处于 new 阶段：

```json
{
  "indices": {
    "my-index-000001": {
      "index": "my-index-000001",
      "index_creation_date_millis": 1538475653281,        
      "index_creation_date": "2018-10-15T13:45:21.981Z",
      "time_since_index_creation": "15s",                 
      "managed": true,                                   
      "policy": "my_policy",                              
      "lifecycle_date_millis": 1538475653281,             
      "lifecycle_date": "2018-10-15T13:45:21.981Z",
      "age": "15s",                                       
      "phase": "new",
      "phase_time_millis": 1538475653317,                 
      "phase_time": "2018-10-15T13:45:22.577Z",
      "action": "complete"
      "action_time_millis": 1538475653317,                
      "action_time": "2018-10-15T13:45:22.577Z",
      "step": "complete",
      "step_time_millis": 1538475653317,                 
      "step_time": "2018-10-15T13:45:22.577Z"
    }
  }
}
```

1. 索引创建时间，此时间戳用于确定何时滚动。
2. 自索引创建以来的时间（用于计算何时通过 `max_age` 滚动索引）。
3. 显示索引是否由 ILM 管理。如果索引不由 ILM 管理，则不会显示其他字段。
4. ILM 用于此索引的策略名称。
5. 用于 `min_age` 的时间戳。
6. 索引的年龄（用于计算何时进入下一个阶段）。
7. 索引进入当前阶段的时间。
8. 索引进入当前操作的时间。
9. 索引进入当前步骤的时间。

一旦策略在索引上运行，响应将包含一个 `phase_execution` 对象，显示当前阶段的定义。对底层策略的更改在当前阶段完成之前不会影响此索引。

```json
{
  "indices": {
    "test-000069": {
      "index": "test-000069",
      "index_creation_date_millis": 1538475653281,
      "time_since_index_creation": "25.14s",
      "managed": true,
      "policy": "my_lifecycle3",
      "lifecycle_date_millis": 1538475653281,
      "lifecycle_date": "2018-10-15T13:45:21.981Z",
      "age": "25.14s",
      "phase": "hot",
      "phase_time_millis": 1538475653317,
      "phase_time": "2018-10-15T13:45:22.577Z",
      "action": "rollover",
      "action_time_millis": 1538475653317,
      "action_time": "2018-10-15T13:45:22.577Z",
      "step": "attempt-rollover",
      "step_time_millis": 1538475653317,
      "step_time": "2018-10-15T13:45:22.577Z",
      "phase_execution": {
        "policy": "my_lifecycle3",
        "phase_definition": { 
          "min_age": "0ms",
          "actions": {
            "rollover": {
              "max_age": "30s",
              "max_primary_shard_docs": 200000000, 
              "min_docs": 1
            }
          }
        },
        "version": 3, 
        "modified_date": "2018-10-15T13:21:41.576Z", 
        "modified_date_in_millis": 1539609701576 
      }
    }
  }
}
```

1. 当索引进入此阶段时从指定策略加载的 JSON 阶段定义。
2. rollover 操作包含默认的 `max_primary_shard_docs` 和 `min_docs` 条件。有关更多信息，请参阅 [ILM 滚动选项](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-rollover.html)。
3. 已加载策略的版本。
4. 已加载策略的最后修改日期。
5. 已加载策略最后修改的纪元时间。

如果 ILM 正在等待某个步骤完成，响应将包含正在索引上执行的步骤的状态信息。

```json
{
  "indices": {
    "test-000020": {
      "index": "test-000020",
      "index_creation_date_millis": 1538475653281,
      "time_since_index_creation": "4.12m",
      "managed": true,
      "policy": "my_lifecycle3",
      "lifecycle_date_millis": 1538475653281,
      "lifecycle_date": "2018-10-15T13:45:21.981Z",
      "age": "4.12m",
      "phase": "warm",
      "phase_time_millis": 1538475653317,
      "phase_time": "2018-10-15T13:45:22.577Z",
      "action": "allocate",
      "action_time_millis": 1538475653317,
      "action_time": "2018-10-15T13:45:22.577Z",
      "step": "check-allocation",
      "step_time_millis": 1538475653317,
      "step_time": "2018-10-15T13:45:22.577Z",
      "step_info": { 
        "message": "Waiting for all shard copies to be active",
        "shards_left_to_allocate": -1,
        "all_shards_active": false,
        "number_of_replicas": 2
      },
      "phase_execution": {
        "policy": "my_lifecycle3",
        "phase_definition": {
          "min_age": "0ms",
          "actions": {
            "allocate": {
              "number_of_replicas": 2,
              "include": {
                "box_type": "warm"
              },
              "exclude": {},
              "require": {}
            },
            "forcemerge": {
              "max_num_segments": 1
            }
          }
        },
        "version": 2,
        "modified_date": "2018-10-15T13:20:02.489Z",
        "modified_date_in_millis": 1539609602489
      }
    }
  }
}
```

1. 正在进行的步骤的状态。

如果索引处于 ERROR 步骤，说明在执行策略中的某个步骤时出了问题，你需要采取措施才能让索引继续到下一步。某些步骤在特定情况下可以安全地自动重试。为帮助你诊断问题，解释响应显示失败的步骤、提供错误信息的 `step_info`，以及如果适用的话，还会显示失败步骤的已执行重试尝试信息。

```json
{
  "indices": {
    "test-000056": {
      "index": "test-000056",
      "index_creation_date_millis": 1538475653281,
      "time_since_index_creation": "50.1d",
      "managed": true,
      "policy": "my_lifecycle3",
      "lifecycle_date_millis": 1538475653281,
      "lifecycle_date": "2018-10-15T13:45:21.981Z",
      "age": "50.1d",
      "phase": "hot",
      "phase_time_millis": 1538475653317,
      "phase_time": "2018-10-15T13:45:22.577Z",
      "action": "rollover",
      "action_time_millis": 1538475653317,
      "action_time": "2018-10-15T13:45:22.577Z",
      "step": "ERROR",
      "step_time_millis": 1538475653317,
      "step_time": "2018-10-15T13:45:22.577Z",
      "failed_step": "check-rollover-ready", 
      "is_auto_retryable_error": true, 
      "failed_step_retry_count": 1, 
      "step_info": { 
        "type": "cluster_block_exception",
        "reason": "index [test-000057/H7lF9n36Rzqa-KfKcnGQMg] blocked by: [FORBIDDEN/5/index read-only (api)",
        "index_uuid": "H7lF9n36Rzqa-KfKcnGQMg",
        "index": "test-000057"
      },
      "previous_step_info": { 
        "type": "cluster_block_exception",
        "reason": "index [test-000057/H7lF9n36Rzqa-KfKcnGQMg] blocked by: [FORBIDDEN/5/index read-only (api)",
        "index_uuid": "H7lF9n36Rzqa-KfKcnGQMg",
        "index": "test-000057"
      },
      "phase_execution": {
        "policy": "my_lifecycle3",
        "phase_definition": {
          "min_age": "0ms",
          "actions": {
            "rollover": {
              "max_age": "30s"
            }
          }
        },
        "version": 3,
        "modified_date": "2018-10-15T13:21:41.576Z",
        "modified_date_in_millis": 1539609701576
      }
    }
  }
}
```

1. 导致错误的步骤。
2. 指示重试失败步骤是否能克服错误。如果为 `true`，ILM 将自动重试失败的步骤。
3. 显示已尝试的自动重试执行失败步骤的次数。
4. 出了什么问题。
5. 包含上次尝试或执行步骤的 `step_info` 字段（如果存在）的副本，用于诊断目的，因为 `step_info` 在每次新尝试期间会被覆盖。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ilm-explain-lifecycle.html)
