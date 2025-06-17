# 集群分配解释 API

:::info 新 API 参考
有关最新 API 的详细信息，参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

解释分区当前的分配情况。

```bash
GET _cluster/allocation/explain
{
  "index": "my-index-000001",
  "shard": 0,
  "primary": false,
  "current_node": "my-node"
}
```

## 请求

`GET _cluster/allocation/explain`

`POST _cluster/allocation/explain`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `monitor` 或 `manage` 的[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。

## 描述

集群分配解释 API 的目的是为集群中的分片分配提供解释。对于未分配的分片，解释 API 会解释分片未分配的原因。对于已分配的分片，解释 API 会解释分片为何仍留在当前节点上，而没有移动或重新平衡到其他节点。在尝试诊断分片未被分配的原因或碎片为何继续留在当前节点上时，这个 API 可能会非常有用。

## 查询参数

- `include_disk_info`

  （可选，布尔值）如果为 `true`，则返回有关磁盘使用情况和分片大小的信息。默认为 `false`。

- `include_yes_decisions`

  （可选，布尔值） 如果为 `true`，则在解释中返回 YES 的决定。默认为 `false`。

## 请求体

- `current_node`
  （可选，字符串） 指定当前持有要解释的分区的节点 ID 或名称。要解释未指定的分区，请省略此参数。

- `index`
  （可选，字符串） 指定需要解释的索引名称。

- `primary`
  （可选，布尔值） 如果为 `true`，则返回给定分区 ID 的主分区解释。

- `shard`
  （可选，整数） 指定要解释的分区 ID。

## 示例

### 未指定的主分区

#### 冲突的设置

下面的请求会得到一个未指定主分区的分配解释。

```bash
GET _cluster/allocation/explain
{
  "index": "my-index-000001",
  "shard": 0,
  "primary": true
}
```

API 响应显示分区只能分配给一个不存在的节点。

```bash
{
  "index" : "my-index-000001",
  "shard" : 0,
  "primary" : true,
  "current_state" : "unassigned",
  "unassigned_info" : {
    "reason" : "INDEX_CREATED",
    "at" : "2017-01-04T18:08:16.600Z",
    "last_allocation_status" : "no"
  },
  "can_allocate" : "no",
  "allocate_explanation" : "Elasticsearch isn't allowed to allocate this shard to any of the nodes in the cluster. Choose a node to which you expect this shard to be allocated, find this node in the node-by-node explanation, and address the reasons which prevent Elasticsearch from allocating this shard there.",
  "node_allocation_decisions" : [
    {
      "node_id" : "8qt2rY-pT6KNZB3-hGfLnw",
      "node_name" : "node-0",
      "transport_address" : "127.0.0.1:9401",
      "roles" : ["data", "data_cold", "data_content", "data_frozen", "data_hot", "data_warm", "ingest", "master", "ml", "remote_cluster_client", "transform"],
      "node_attributes" : {},
      "node_decision" : "no",
      "weight_ranking" : 1,
      "deciders" : [
        {
          "decider" : "filter",
          "decision" : "NO",
          "explanation" : "node does not match index setting [index.routing.allocation.include] filters [_name:\"nonexistent_node\"]"
        }
      ]
    }
  ]
}
```

1. `"current_state" : "unassigned", `：分块的当前状态。
2. `"reason" : "INDEX_CREATED",`：分区最初成为未指定分区的原因。
3. `"can_allocate" : "no", `：是否分配分区。
4. `"node_decision" : "no",  `：是否将分区分配给特定节点。
5. `"decider" : "filter",`：导致不决定该节点的决定因素。
6. `"explanation" : "node does not match index setting [index.routing.allocation.include] filters [_name:\"nonexistent_node\"]" `：解释判定器为何返回 "否 "判定，并提供指向导致该判定的设置的有用提示。在这个示例中，一个新创建的索引的[索引设置](/rest_apis/index_apis/get_index_settings)要求只能分配给一个名为 `nonexistent_node` 的节点，而这个节点并不存在，因此索引无法分配。

参阅[此视频](https://www.youtube.com/watch?v=5z3n2VgusLE)，了解如何排除节点和索引设置不匹配的故障。

#### 超过最大重试次数

以下响应包含对已达到最大分配重试次数的未分配主分区的分配解释。

```bash
{
  "index" : "my-index-000001",
  "shard" : 0,
  "primary" : true,
  "current_state" : "unassigned",
  "unassigned_info" : {
    "at" : "2017-01-04T18:03:28.464Z",
    "failed shard on node [mEKjwwzLT1yJVb8UxT6anw]: failed recovery, failure RecoveryFailedException",
    "reason": "ALLOCATION_FAILED",
    "failed_allocation_attempts": 5,
    "last_allocation_status": "no",
  },
  "can_allocate": "no",
  "allocate_explanation": "cannot allocate because allocation is not permitted to any of the nodes",
  "node_allocation_decisions" : [
    {
      "node_id" : "3sULLVJrRneSg0EfBB-2Ew",
      "node_name" : "node_t0",
      "transport_address" : "127.0.0.1:9400",
      "roles" : ["data_content", "data_hot"],
      "node_decision" : "no",
      "store" : {
        "matching_size" : "4.2kb",
        "matching_size_in_bytes" : 4325
      },
      "deciders" : [
        {
          "decider": "max_retry",
          "decision" : "NO",
          "explanation": "shard has exceeded the maximum number of retries [5] on failed allocation attempts - manually call [POST /_cluster/reroute?retry_failed&metric=none] to retry, [unassigned_info[[reason=ALLOCATION_FAILED], at[2024-07-30T21:04:12.166Z], failed_attempts[5], failed_nodes[[mEKjwwzLT1yJVb8UxT6anw]], delayed=false, details[failed shard on node [mEKjwwzLT1yJVb8UxT6anw]: failed recovery, failure RecoveryFailedException], allocation_status[deciders_no]]]"
        }
      ]
    }
  ]
}
```

当 Elasticsearch 无法分配分区时，它会尝试重试分配，但最多不超过允许的最大重试次数。之后，Elasticsearch 将停止尝试分配分区，以防止出现可能影响集群性能的无限重试。运行[集群重路由](./cluster_reroute) API 重试分配，如果阻止分配的问题已经解决，则会分配分区。

#### 没有有效的分区副本

以下响应包含对之前分配的未分配主分区的分配解释。

```json
{
  "index" : "my-index-000001",
  "shard" : 0,
  "primary" : true,
  "current_state" : "unassigned",
  "unassigned_info" : {
    "reason" : "NODE_LEFT",
    "at" : "2017-01-04T18:03:28.464Z",
    "details" : "node_left[OIWe8UhhThCK0V5XfmdrmQ]",
    "last_allocation_status" : "no_valid_shard_copy"
  },
  "can_allocate" : "no_valid_shard_copy",
  "allocate_explanation" : "Elasticsearch can't allocate this shard because there are no copies of its data in the cluster. Elasticsearch will allocate this shard when a node holding a good copy of its data joins the cluster. If no such node is available, restore this index from a recent snapshot."
}
```

如果分区未分配且分配状态为 `no_valid_shard_copy`，则应[确保所有节点都在集群中](/trobule_shooting/fix_common_cluster_issues/red_or_yellow_cluster_health_status#恢复丢失节点)。如果包含分片同步副本的所有节点都丢失了，则可以[恢复分片数据](/trobule_shooting/fix_common_cluster_issues/red_or_yellow_cluster_health_status#从丢失的主分片恢复数据)。

有关 `no_valid_shard_copy` 故障排除的视频，参阅[此视频](https://www.youtube.com/watch?v=6OAg9IyXFO4)。

### 未指定副本分片

#### 分配延迟

以下响应包含因[延迟分配](/index_modules/index_shard_allocation/delaying_allocation_when_a_node_leaves)而未分配副本的分配解释。

```json
{
  "index" : "my-index-000001",
  "shard" : 0,
  "primary" : false,
  "current_state" : "unassigned",
  "unassigned_info" : {
    "reason" : "NODE_LEFT",
    "at" : "2017-01-04T18:53:59.498Z",
    "details" : "node_left[G92ZwuuaRY-9n8_tc-IzEg]",
    "last_allocation_status" : "no_attempt"
  },
  "can_allocate" : "allocation_delayed",
  "allocate_explanation" : "The node containing this shard copy recently left the cluster. Elasticsearch is waiting for it to return. If the node does not return within [%s] then Elasticsearch will allocate this shard to another node. Please wait.",
  "configured_delay" : "1m",                      
  "configured_delay_in_millis" : 60000,
  "remaining_delay" : "59.8s",                    
  "remaining_delay_in_millis" : 59824,
  "node_allocation_decisions" : [
    {
      "node_id" : "pmnHu_ooQWCPEFobZGbpWw",
      "node_name" : "node_t2",
      "transport_address" : "127.0.0.1:9402",
      "roles" : ["data_content", "data_hot"],
      "node_decision" : "yes"
    },
    {
      "node_id" : "3sULLVJrRneSg0EfBB-2Ew",
      "node_name" : "node_t0",
      "transport_address" : "127.0.0.1:9400",
      "roles" : ["data_content", "data_hot"],
      "node_decision" : "no",
      "store" : {                                 
        "matching_size" : "4.2kb",
        "matching_size_in_bytes" : 4325
      },
      "deciders" : [
        {
          "decider" : "same_shard",
          "decision" : "NO",
          "explanation" : "a copy of this shard is already allocated to this node [[my-index-000001][0], node[3sULLVJrRneSg0EfBB-2Ew], [P], s[STARTED], a[id=eV9P8BN1QPqRc3B4PLx6cg]]"
        }
      ]
    }
  ]
}
```

1. `"configured_delay" : "1m"`：由于持有副本分片的节点离开集群，在分配不存在的副本分片之前配置的延迟。
2. `"remaining_delay" : "59.8s"`：分配副本分片前的剩余延迟。
3. `"store" : { `：节点上发现的分片数据信息。

#### 分配节流

下面的响应包含一个副本的分配解释，该副本已排队分配，但目前正在等待其他排队的分片。

```json
{
  "index" : "my-index-000001",
  "shard" : 0,
  "primary" : false,
  "current_state" : "unassigned",
  "unassigned_info" : {
    "reason" : "NODE_LEFT",
    "at" : "2017-01-04T18:53:59.498Z",
    "details" : "node_left[G92ZwuuaRY-9n8_tc-IzEg]",
    "last_allocation_status" : "no_attempt"
  },
  "can_allocate": "throttled",
  "allocate_explanation": "Elasticsearch is currently busy with other activities. It expects to be able to allocate this shard when those activities finish. Please wait.",
  "node_allocation_decisions" : [
    {
      "node_id" : "3sULLVJrRneSg0EfBB-2Ew",
      "node_name" : "node_t0",
      "transport_address" : "127.0.0.1:9400",
      "roles" : ["data_content", "data_hot"],
      "node_decision" : "no",
      "deciders" : [
        {
          "decider": "throttling",
          "decision": "THROTTLE",
          "explanation": "reached the limit of incoming shard recoveries [2], cluster setting [cluster.routing.allocation.node_concurrent_incoming_recoveries=2] (can also be set via [cluster.routing.allocation.node_concurrent_recoveries])"
        }
      ]
    }
  ]
}
```

这是一条瞬时消息，在分配大量分片时可能会出现。

### 已分配分区

#### 无法保留在当前节点上

以下响应包含对已分配分区的分配解释。该响应表明分区不允许保留在当前节点上，必须重新分配。

```json
{
  "index" : "my-index-000001",
  "shard" : 0,
  "primary" : true,
  "current_state" : "started",
  "current_node" : {
    "id" : "8lWJeJ7tSoui0bxrwuNhTA",
    "name" : "node_t1",
    "transport_address" : "127.0.0.1:9401",
    "roles" : ["data_content", "data_hot"]
  },
  "can_remain_on_current_node" : "no",            
  "can_remain_decisions" : [                      
    {
      "decider" : "filter",
      "decision" : "NO",
      "explanation" : "node does not match index setting [index.routing.allocation.include] filters [_name:\"nonexistent_node\"]"
    }
  ],
  "can_move_to_other_node" : "no",                
  "move_explanation" : "This shard may not remain on its current node, but Elasticsearch isn't allowed to move it to another node. Choose a node to which you expect this shard to be allocated, find this node in the node-by-node explanation, and address the reasons which prevent Elasticsearch from allocating this shard there.",
  "node_allocation_decisions" : [
    {
      "node_id" : "_P8olZS8Twax9u6ioN-GGA",
      "node_name" : "node_t0",
      "transport_address" : "127.0.0.1:9400",
      "roles" : ["data_content", "data_hot"],
      "node_decision" : "no",
      "weight_ranking" : 1,
      "deciders" : [
        {
          "decider" : "filter",
          "decision" : "NO",
          "explanation" : "node does not match index setting [index.routing.allocation.include] filters [_name:\"nonexistent_node\"]"
        }
      ]
    }
  ]
}
```

1. `"can_remain_on_current_node" : "no"`：是否允许分片留在当前节点上。
2. `"can_remain_decisions"`：决定不允许分块留在当前节点上的决定因素。
3. `"can_move_to_other_node" : "no"`：是否允许将分片分配到其他节点。

#### 必须保留在当前节点上

以下回复包含必须保留在当前节点上的分区的分配解释。将分区移动到其他节点不会改善集群平衡。

```json
{
  "index" : "my-index-000001",
  "shard" : 0,
  "primary" : true,
  "current_state" : "started",
  "current_node" : {
    "id" : "wLzJm4N4RymDkBYxwWoJsg",
    "name" : "node_t0",
    "transport_address" : "127.0.0.1:9400",
    "roles" : ["data_content", "data_hot"],
    "weight_ranking" : 1
  },
  "can_remain_on_current_node" : "yes",
  "can_rebalance_cluster" : "yes",                
  "can_rebalance_to_other_node" : "no",           
  "rebalance_explanation" : "Elasticsearch cannot rebalance this shard to another node since there is no node to which allocation is permitted which would improve the cluster balance. If you expect this shard to be rebalanced to another node, find this node in the node-by-node explanation and address the reasons which prevent Elasticsearch from rebalancing this shard there.",
  "node_allocation_decisions" : [
    {
      "node_id" : "oE3EGFc8QN-Tdi5FFEprIA",
      "node_name" : "node_t1",
      "transport_address" : "127.0.0.1:9401",
      "roles" : ["data_content", "data_hot"],
      "node_decision" : "worse_balance",          
      "weight_ranking" : 1
    }
  ]
}
```

1. `"can_rebalance_cluster" : "yes"`：是否允许在集群上重新平衡。
2. `"can_rebalance_to_other_node" : "no"`：是否可以将分片重新平衡到另一个节点。
3. `"node_decision" : "worse_balance"`：分块不能重新平衡到节点的原因，在这种情况下，表示它不能提供比当前节点更好的平衡。

### 无争论

如果不带参数调用 API，Elasticsearch 会检索任意未分配的主分区或副本分区的分配解释，并首先返回任何未分配的主分区。

```bash
GET _cluster/allocation/explain
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-allocation-explain.html)
