# 创建或更新快照生命周期策略 API

创建或更新快照生命周期策略。如果策略已存在，此请求会递增策略的版本。只有策略的最新版本会被存储。

```txt
PUT /_slm/policy/<snapshot-lifecycle-policy-id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage_slm` 集群权限，以及对任何包含索引的 `manage` 索引权限。

## 路径参数

`<snapshot-lifecycle-policy-id>`

（必需，字符串）要创建或更新的快照生命周期策略的 ID。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。可以设置为 `-1` 表示永不超时。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。在更新集群元数据后，等待集群中所有相关节点响应的期限。如果在超时期限到期之前未收到响应，集群元数据的更新仍然生效，但响应将指示未被完全确认。可以设置为 `-1` 表示永不超时。

## 请求体

`name`

（必需，字符串）自动分配给此策略创建的每个快照的名称。支持[日期运算](/rest_apis/api_convention/date_math_support_in_parameter_values)。为防止快照名称冲突，每个快照名称会自动附加一个 UUID。

`schedule`

（必需，Cron 语法或时间单位）策略创建快照的周期性或绝对时间表。SLM 会立即应用时间表更改。可以是：

- **Cron 时间表**（例如 `0 30 1 * * ?`）；或
- **时间单位间隔**（例如 `1h`）— 使用间隔时，第一个快照被安排在策略修改时间的一个间隔之后，之后每隔一个间隔再拍摄一次。

`repository`

（必需，字符串）用于存储此策略创建的快照的仓库。此仓库**必须在策略创建之前存在**（通过快照仓库 API 创建）。

`config`

（必需，对象）此策略创建的每个快照的配置，包含：

- `expand_wildcards`（可选，字符串）默认为 `all`。确定 `indices` 中的通配符模式如何匹配数据流和索引。支持逗号分隔的值（例如 `open,hidden`）。有效值包括：`all`（匹配任何索引/数据流，包括已关闭和隐藏的）、`open`（打开的索引/数据流）、`closed`（已关闭的索引/数据流）、`hidden`（隐藏的索引/数据流，必须与 `open`、`closed` 或两者组合使用）、`none`（不展开通配符模式）。
- `ignore_unavailable`（可选，布尔值）默认为 `false`。如果为 `false`，则当 `indices` 中指定的任何数据流或索引缺失时，快照将失败。如果为 `true`，则缺失的数据流和索引将被忽略。
- `include_global_state`（可选，布尔值）默认为 `true`。如果为 `true`，则将集群状态包含在快照中。集群状态包括：持久集群设置、索引模板、旧式索引模板、摄取管道、ILM 策略、存储的脚本，以及（对于 7.12.0 之后的快照）功能状态。
- `indices`（可选，字符串或字符串数组）默认为 `[]`（所有常规数据流和索引）。要包含的数据流和索引的逗号分隔列表。支持多目标语法。默认为空数组（`[]`），包含**所有常规**数据流和索引。要排除所有数据流和索引，请使用 `-*`。你不能使用此参数来包含或排除系统索引或系统数据流 — 请改用 `feature_states`。
- `feature_states`（可选，字符串数组）要包含在快照中的功能状态。使用获取功能 API 列出可能的值。如果 `include_global_state` 为 `true`，则默认包含所有功能状态；如果为 `false`，则默认不包含任何功能状态。注意：指定空数组会产生默认行为。要排除所有功能状态（无论 `include_global_state` 的值如何），请指定 `["none"]`。
- `metadata`（可选，对象）为快照附加任意元数据（例如拍摄者以及拍摄原因）。必须小于 1024 字节。
- `partial`（可选，布尔值）默认为 `false`。如果为 `false`，则当一个或多个索引没有所有主分片可用时，整个快照将失败。如果为 `true`，则允许对具有不可用分片的索引拍摄部分快照。

`retention`

（可选，对象）用于保留和删除此策略创建的快照的保留规则，包含：

- `expire_after`（时间单位）快照被视为过期并符合删除条件的时间期限。SLM 基于 `slm.retention_schedule` 删除过期的快照。
- `max_count`（整数）要保留的快照的最大数量，即使它们尚未过期。如果数量超过此限制，则保留最近的快照并删除较旧的快照。**仅统计状态为 `SUCCESS` 的快照。**
- `min_count`（整数）要保留的快照的最小数量，即使它们已经过期。

## 示例

以下示例创建一个使用 Cron 时间表的策略（每天拍摄快照）：

```txt
PUT /_slm/policy/daily-snapshots
{
  "schedule": "0 30 1 * * ?",
  "name": "<daily-snap-{now/d}>",
  "repository": "my_repository",
  "config": {
    "indices": [ "data-*", "important" ],
    "ignore_unavailable": false,
    "include_global_state": false
  },
  "retention": {
    "expire_after": "30d",
    "min_count": 5,
    "max_count": 50
  }
}
```

此示例中各元素的含义：

- `"schedule": "0 30 1 * * ?"` — 拍摄快照的时间：**每天凌晨 1:30**。
- `"name": "<daily-snap-{now/d}>"` — 每个快照应使用的名称（支持日期运算）。
- `"repository": "my_repository"` — 在哪个仓库中拍摄快照。
- `"config"` — 任何额外的快照配置；`indices` 指定要包含的数据流和索引。
- `"retention"`：
  - `"expire_after": "30d"` — 将快照保留 **30 天**。
  - `"min_count": 5` — 始终保留至少 **5 个成功**的快照，即使它们已超过 30 天。
  - `"max_count": 50` — 最多保留 **50 个成功**的快照，即使它们尚未超过 30 天。

以下示例创建一个使用时间单位间隔的策略（每小时拍摄快照）：

```txt
PUT /_slm/policy/hourly-snapshots
{
  "schedule": "1h",
  "name": "<hourly-snap-{now/d}>",
  "repository": "my_repository",
  "config": {
    "indices": [ "data-*", "important" ]
  }
}
```

此策略**每小时**创建一个快照。第一个快照在策略被修改一小时后创建，之后每小时创建一个。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/slm-api-put-policy.html)
