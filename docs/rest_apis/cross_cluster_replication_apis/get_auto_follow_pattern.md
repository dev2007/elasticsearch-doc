# 获取自动关注模式 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](/rest_apis/cross_cluster_replication_apis/cross_cluster_replication_apis)。

::::

获取跨集群复制自动关注模式。

## 请求

```json
GET /_ccr/auto_follow/
```

```json
GET /_ccr/auto_follow/<auto_follow_pattern_name>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有包含关注者索引的集群的 `manage_ccr` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

此 API 获取已配置的自动关注模式。此 API 将返回指定的自动关注模式集合。

## 路径参数

- `<auto_follow_pattern_name>`（可选，字符串）

  指定要检索的自动关注模式集合。如果未指定名称，API 返回所有集合的信息。

## 查询参数

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

## 示例

此示例检索名为 `my_auto_follow_pattern` 的自动关注模式集合的信息：

```json
GET /_ccr/auto_follow/my_auto_follow_pattern
```

API 返回以下结果：

```json
{
  "patterns": [
    {
      "name": "my_auto_follow_pattern",
      "pattern": {
        "active": true,
        "remote_cluster" : "remote_cluster",
        "leader_index_patterns" :
        [
          "leader_index*"
        ],
        "leader_index_exclusion_patterns":
        [
          "leader_index_001"
        ],
        "follow_index_pattern" : "{{leader_index}}-follower"
      }
    }
  ]
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-get-auto-follow-pattern.html)
