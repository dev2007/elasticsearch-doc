# 使用情况 API

此 API 提供有关在当前许可证下哪些特性当前已启用并可用的信息，以及有关已安装 X-Pack 特性的一些使用统计信息。

```txt
GET /_xpack/usage
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor` 或 `manage` 集群权限才能使用此 API。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。也可以设置为 `-1`，表示请求永不超时。

## 描述

响应是一个以特性为键（例如 `security`、`monitoring`、`watcher`、`ml`）的顶层对象，而不是 `feature` 包装对象或显式的 `enabled_features` 字段。每个特性部分通常包含 `available` 和 `enabled` 布尔值以及该特性特定的使用统计信息：

- `available`：该特性在当前许可证下可用。
- `enabled`：该特性已开启。

## 示例

以下示例检索 X-Pack 特性的使用信息：

```txt
GET /_xpack/usage
```

API 返回一个以特性为键的响应对象（以下为节选）：

```json
{
  "security": {
    "available": true,
    "enabled": true
  },
  "monitoring": {
    "available": true,
    "enabled": true,
    "collection_enabled": false,
    "enabled_exporters": {
      "local": 1
    }
  },
  "watcher": {
    "available": true,
    "enabled": true,
    "execution": {
      "actions": {
        "_all": {
          "total": 0,
          "total_time_in_ms": 0
        }
      }
    },
    "count": {
      "total": 0,
      "active": 0
    }
  },
  "ml": {
    "available": true,
    "enabled": true,
    "jobs": {
      "_all": {
        "count": 0,
        "detectors": {},
        "created_by": {},
        "model_size": {},
        "forecasts": {
          "total": 0,
          "forecasted_jobs": 0
        }
      }
    },
    "datafeeds": {
      "_all": {
        "count": 0
      }
    },
    "data_frame_analytics_jobs": {
      "_all": {
        "count": 0
      },
      "analysis_counts": {},
      "memory_usage": {
        "peak_usage_bytes": {
          "min": 0.0,
          "max": 0.0,
          "avg": 0.0,
          "total": 0.0
        }
      }
    },
    "node_count": 1,
    "memory": {
      "anomaly_detectors_memory_bytes": 0,
      "data_frame_analytics_memory_bytes": 0,
      "pytorch_inference_memory_bytes": 0,
      "total_used_memory_bytes": 0
    }
  },
  "graph": {
    "available": true,
    "enabled": true
  },
  "logstash": {
    "available": true,
    "enabled": true
  },
  "eql": {
    "available": true,
    "enabled": true
  },
  "sql": {
    "available": true,
    "enabled": true,
    "features": {
      "having": 0,
      "subselect": 0,
      "limit": 0,
      "orderby": 0,
      "where": 0,
      "join": 0,
      "groupby": 0,
      "command": 0,
      "local": 0
    },
    "queries": {
      "rest": {
        "total": 0,
        "paging": 0,
        "failed": 0
      }
    }
  },
  "rollup": {
    "available": true,
    "enabled": true
  },
  "ilm": {
    "policy_count": 3,
    "policy_stats": []
  },
  "slm": {
    "available": true,
    "enabled": true
  },
  "ccr": {
    "available": true,
    "enabled": true,
    "follower_indices_count": 0,
    "auto_follow_patterns_count": 0
  },
  "transform": {
    "available": true,
    "enabled": true
  },
  "voting_only": {
    "available": true,
    "enabled": true
  },
  "searchable_snapshots": {
    "available": true,
    "enabled": true,
    "indices_count": 0,
    "full_copy_indices_count": 0,
    "shared_cache_indices_count": 0
  },
  "frozen_indices": {
    "available": true,
    "enabled": true,
    "indices_count": 0
  },
  "spatial": {
    "available": true,
    "enabled": true
  },
  "analytics": {
    "available": true,
    "enabled": true,
    "stats": {
      "boxplot_usage": 0,
      "top_metrics_usage": 0,
      "normalize_usage": 0,
      "cumulative_cardinality_usage": 0,
      "t_test_usage": 0,
      "rate_usage": 0,
      "string_stats_usage": 0,
      "moving_percentiles_usage": 0,
      "multi_terms_usage": 0
    }
  },
  "data_streams": {
    "available": true,
    "enabled": true,
    "data_streams": 0,
    "indices_count": 0
  },
  "data_tiers": {
    "available": true,
    "enabled": true,
    "data_warm": {
      "node_count": 0,
      "index_count": 0,
      "total_shard_count": 0,
      "primary_shard_count": 0,
      "doc_count": 0,
      "total_size_bytes": 0
    },
    "data_frozen": {
      "node_count": 1,
      "index_count": 0,
      "total_shard_count": 0,
      "primary_shard_count": 0,
      "doc_count": 0,
      "total_size_bytes": 0
    },
    "data_cold": {
      "node_count": 0,
      "index_count": 0,
      "total_shard_count": 0,
      "primary_shard_count": 0,
      "doc_count": 0,
      "total_size_bytes": 0
    },
    "data_content": {
      "node_count": 0,
      "index_count": 0,
      "total_shard_count": 0,
      "primary_shard_count": 0,
      "doc_count": 0,
      "total_size_bytes": 0
    },
    "data_hot": {
      "node_count": 0,
      "index_count": 0,
      "total_shard_count": 0,
      "primary_shard_count": 0,
      "doc_count": 0,
      "total_size_bytes": 0
    }
  },
  "aggregate_metric": {
    "available": true,
    "enabled": true
  },
  "archive": {
    "available": true,
    "enabled": true,
    "indices_count": 0
  },
  "health_api": {
    "available": true,
    "enabled": true,
    "invocations": {
      "total": 0
    }
  },
  "remote_clusters": {
    "size": 0,
    "mode": {
      "proxy": 0,
      "sniff": 0
    },
    "security": {
      "cert": 0,
      "api_key": 0
    }
  },
  "enterprise_search": {
    "available": true,
    "enabled": true,
    "search_applications": {
      "count": 0
    },
    "analytics_collections": {
      "count": 0
    },
    "query_rulesets": {
      "total_rule_count": 0,
      "total_count": 0,
      "min_rule_count": 0,
      "max_rule_count": 0
    }
  },
  "universal_profiling": {
    "available": true,
    "enabled": true
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/usage-api.html)
