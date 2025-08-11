# 健康 API

:::info 新 API 参考
有关最新 API 的详细信息，参阅[集群健康 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-health_report)。
:::

报告 Elasticsearch 集群健康状况的 API。

## 请求

```bash
GET /_health_report
```

```bash
GET /_health_report/<indicator>
```

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `monitor` 或 `manage` 的[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)以使用此 API。

## 描述

健康 API 返回包含 Elasticsearch 集群健康状况的报告。该报告包含组成 Elasticsearch 功能的指标列表。

每个指示器的运行状况为：`green`（绿色）、`unknown`（未知）、`yellow`（黄色）或 `red`（红色）。该指标将提供解释和元数据，描述其当前健康状态的原因。

集群的状态由最差的指标状态控制。

如果指标的状态为非绿色，则指标结果中可能会出现影响列表，其中详细说明了受健康问题负面影响的功能。每个影响都带有一个严重性级别、受影响的系统区域以及对系统影响的简单描述。

一些健康指标可以确定健康问题的根本原因，并规定一组可以执行的步骤，以改善系统的健康状况。根本原因和修正步骤封装在 `diagnosis`（诊断）中。诊断包含详细说明根本原因分析的原因、包含解决问题的步骤的简要说明、受影响资源的列表（如果适用）以及用于修复已诊断问题的详细分步故障排除指南的作。

:::note 提示
运行状况指示器对非绿色运行状况状态执行根本原因分析。频繁调用时，这可能会造成计算成本。设置运行状况 API 的自动轮询时，请将 `verbose` 设置为 `false` 以禁用更昂贵的分析逻辑。
:::

## 路径参数

- `<indicator>`

  （可选，字符串）将返回的信息限制为特定指标。支持的指标包括：

  - `master_is_stable`

    报告有关节点稳定性的运行状况问题，该节点被处理运行状况请求的节点视为主节点。如果在短时间内观察到足够多的主变化，该指标将旨在诊断并报告有关其检测到的集群形成问题的有用信息。

  - `shards_availability`

    报告有关分片分配的运行状况问题。

  - `disk`

    报告因磁盘空间不足而导致的运行状况问题。

  - `ilm`

    报告与索引生命周期管理相关的运行状况问题。

  - `repository_integrity`

    跟踪存储库完整性并报告存储库损坏、未知或无效时出现的运行状况问题。

  - `slm`

    报告与快照生命周期管理相关的运行状况问题。

  - `shards_capacity`

    报告与群集分片容量相关的运行状况问题。

## 查询参数

- `verbose`

  （可选，布尔值）如果为 `true`，则响应将包含有助于解释每个非绿色指示器的状态的其他详细信息。这些详细信息包括其他故障排除指标，有时还包括运行状况的根本原因分析。默认为 `true`。

- `size`

  （可选，整数）要返回的受影响资源的最大数量。由于诊断可以返回多种类型的受影响资源，因此此参数会将每种类型返回的资源数量限制为配置值（例如，诊断可以返回 `1000` 个受影响的索引和 `1000` 个受影响的节点）。默认为 `1000`。

## 响应体

- `cluster_name`

  （字符串）集群的名称。

- `status`

  （可选，字符串）集群的运行状况，基于集群中所有指标的聚合状态。如果请求特定指标的运行状况，则将省略此顶级状态。状态为：

  - `green`
    集群状态健康
  - `unknown`
    无法检测集群的健康
  - `yellow`
    集群的功能处于降级状态，可能需要修正以避免运行状况变为红色。
  - `red`
    集群正在发生中断或某些功能无法使用。

- `indicators`

  （对象）有关集群指示器运行状况的信息。

  - `indicators` 属性

    - `<indicator>`

      （对象）包含指标的运行状况结果。

      - `<indicator>` 属性

        - `status`
          （字符串）指标的运行状况。状态为：

          - `green`
            集群状态健康
          - `unknown`
            无法检测集群的健康
          - `yellow`
            集群的功能处于降级状态，可能需要修正以避免运行状况变为红色。
          - `red`
            集群正在发生中断或某些功能无法使用。

        - `symptom`

          （字符串）提供有关当前运行状况的信息的消息。

        - `details`

          （可选，对象）一个对象，其中包含有关导致当前运行状况结果的集群的其他信息。此数据是非结构化的，每个指示器返回一组唯一的详细信息。如果 `verbose` 属性设置为 `false`，则不会计算详细信息。

        - `impacts`

          （可选，数组）如果返回非正常状态，则指示器可能包括此运行状况状态将对集群产生的影响列表。

          - `impacts` 属性

            - `severity`

              （整数）这种影响对集群的功能有多重要。值 1 表示最高严重性，值越大表示严重性越低。

            - `description`

              （字符串）对集群的影响的描述。

            - `impact_areas`

              （字符串数组）此影响影响的集群功能领域。可能的值包括：

              - search
              - ingest
              - backup
              - deployment_management

        - `diagnosis`

          （可选，数组）如果返回非正常状态，指示器可能包括封装运行状况问题原因的诊断列表以及为修正问题而要采取的作。如果 `verbose` 属性为 `false`，则不会计算诊断。

          - `diagnosis` 属性

            - `cause`
              （字符串）描述此健康问题的根本原因。
            - `action`
              （字符串）简要说明为修正问题应采取的步骤。`help_url` 字段提供了修复问题的更详细的分步指南
            - `affected_resources`
              （可选，对象）一个对象，其中键表示资源类型（例如索引、分片），值是受问题影响的特定资源的列表。
            - `help_url`
              （字符串）指向解决健康问题的故障排除指南的链接。

## 指标详情

健康 API 中的每个运行状况指示器都会返回一组详细信息，这些详细信息进一步解释了系统的状态。详细信息具有每个指标唯一的内容和结构。

### `master_is_stable`

- `current_master`

  （对象）有关当前当选的主节点的信息。

  - `current_master` 属性

    - `node_id`
      （字符串）当前选择的主节点的节点 ID，如果未选择主节点，则为 null。
    - `name`
      （字符串）当前选择的主节点的节点名称，如果未选择主节点，则为 null

- `recent_masters`

  （可选，数组）在最近一段时间内被选为或替换为主节点的节点列表。如果主站变化得足够快以导致问题，则此字段存在，当指示灯为绿色时，也作为附加信息出现。此数组仅包括当选的主节点，并且不包括没有当选主节点的空条目。

  - `recent_masters` 属性

    - `node_id`
      （字符串）最近活动的主节点的节点 ID。
    - `name`
      （字符串）最近活动的主节点的节点名称。

- `exception_fetching_history`

  （可选，对象）如果被查询的节点发现当选的主节点已反复降级，则会从最近当选的主节点请求主历史记录以进行诊断。如果获取此远程历史记录失败，则在此详细信息字段中返回异常信息。

  - `exception_fetching_history` 属性

    - `message`
      （字符串）失败的历史记录获取作的异常消息。
    - `stack_trace`
      （字符串）失败的历史记录获取作的堆栈跟踪。

- `cluster_formation`

  （可选，数组）如果最近没有选定的主节点，则被查询的节点会尝试收集有关集群无法形成的原因的信息，或者为什么被查询的节点无法加入集群（如果已形成）。此数组可以包含每个符合主条件的节点的集群形成视图的任何条目。

  - `cluster_formation` 属性

    - `node_id`
      （字符串）符合主节点条件的节点 ID
    - `name`
      （可选，字符串）符合主节点条件的节点名称
    - `cluster_formation_message`
      （字符串）详细说明，解释集群形成出了什么问题，或者为什么此节点在集群形成时无法加入集群。

### `shards_availability`

- `unassigned_primaries`
  （整数）由于初始化或重定位以外的原因而未分配的主分片数。
- `initializing_primaries`
  （整数）正在初始化或恢复的主分片数。
- `creating_primaries`
  （整数）由于最近创建的主分片而未分配的主分片数。
- `creating_replicas`
  （整数）由于最近创建的副本分片而未分配的副本分片数。
- `restarting_primaries`
  （整数）由于节点关闭作而重新定位的主分片数。
- `started_primaries`
  （整数）由于节点关闭作而重新定位的主分片数。
- `unassigned_replicas`
  （整数）由于初始化或重定位以外的原因而未分配的副本分片数。
- `initializing_replicas`
  （整数）正在初始化或恢复的副本分片数。
- `restarting_replicas`
  （整数）由于节点关闭作而重新定位的副本分片数。
- `started_replicas`
  （整数）系统上处于活动状态且可用的副本分片数。

### `disk`

- `indices_with_readonly_block`
  （整数）由于集群空间不足，系统强制执行只读索引块 （index.blocks.read_only_allow_delete） 的索引数。
- `nodes_with_enough_disk_space`
  （整数）具有足够可用磁盘空间来运行的节点数。
- `nodes_over_high_watermark`
  （整数）磁盘不足且空间可能不足的节点数。他们的磁盘使用率已超过高水位线阈值。
- `nodes_over_flood_stage_watermark`
  （整数）磁盘不足的节点数。他们的磁盘使用率已超过洪水阶段水印阈值。
- `unknown_nodes`
  （整数）无法确定其磁盘运行状况的节点数。

### `repository_integrity`

- `total_repositories`
  （可选，整数）系统上当前配置的仓库数。如果未配置仓库，则省略此详细信息。
- `corrupted_repositories`
  （可选，整数）系统上已确定为已损坏的仓库数。如果未检测到损坏的仓库，则省略此详细信息。
- `corrupted`
  （可选，字符串数组）如果在系统中检测到损坏的仓库，则此字段中最多会显示 10 个存储库的名称。如果未找到损坏的存储库，则省略此详细信息。
- `unknown_repositories`
  （可选，整数）已被至少一个节点确定为未知的存储库数。如果未检测到未知存储库，则省略此详细信息。
- `invalid_repositories`
  （可选，整数）已被至少一个节点确定为无效的存储库数。如果未检测到无效存储库，则省略此详细信息。

### `ilm`

- `ilm_status`
  （字符串）索引生命周期管理功能的当前状态。STOPPED、STOPPING 或 RUNNING。
- `policies`
  （整数）系统正在管理的索引生命周期策略的数量。
- `stagnating_indices`
  （整数）索引生命周期管理管理的停滞时间超过预期的索引数量。
- `stagnating_indices_per_action`
  （可选，Map）按作分组的指数数量摘要，这些指数的停滞时间超过预期。

  - `stagnating_indices_per_action` 属性

    - `downsample`
      （整数）下采样动作中停滞指数的数量。
    - `allocate`
      （整数）分配作中停滞的索引数。
    - `shrink`
      （整数）收缩作中停滞的索引数。
    - `searchable_snapshot`
      （整数）searchable_snapshot 作中停滞的指数数量。
    - `rollover`
      （整数）滚轮动作中停滞索引的数量。
    - `forcemerge`
      （整数）forcemerge 作中停滞的索引数。
    - `delete`
      （整数）删除作中停滞索引的数量。
    - `migrate`
      （整数）迁移作中停滞的索引数。

### `slm`

- `slm_status`
  （字符串）快照生命周期管理功能的当前状态。`STOPPED`、`STOPPING` 或 `RUNNING`。
- `policies`
  （整数）系统正在管理的快照策略数。
- `unhealthy_policies`
  （映射）由于多次连续调用失败而被视为不正常的策略的详细视图。计数键表示不正常策略的数量 （整数）。`invocations_since_last_success` 键将报告一个映射，其中不正常的策略名称是键，其相应的失败调用数是值。

### `shards_capacity`

- `data`
  （映射）该视图包含有关不属于冻结层的数据节点的分片的当前容量的信息。

  - `data` 属性

    - `max_shards_in_cluster`
      （整数）表示集群可以容纳的最大分片数。
    - `current_used_shards`
      （可选，整数）集群持有的分片总数。仅在指标状态为红色或黄色的情况下显示。

- `frozen`

  （映射）包含有关属于冻结层的数据节点的分片当前容量信息的视图。

  - `frozen` 属性

    - `max_shards_in_cluster`
      （整数）指示集群可以为部分挂载的索引保留的最大分片数。
    - `current_used_shards`
      （可选，整数）部分挂载索引在集群中的分片总数。仅在指标状态为红色或黄色的情况下显示。

## 示例

```bash
GET _health_report
```

无论当前状态如何，API 都会返回包含所有指标的响应。

```bash
GET _health_report/shards_availability
```

API 仅返回分片可用性指示器的响应。

```bash
GET _health_report?verbose=false
```

API 返回包含所有运行状况指标的响应，但不会计算响应的详细信息或根本原因分析。如果要监视运行状况 API，并且不希望每次调用计算其他故障排除详细信息的开销，这将非常有用。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/health-api.html)
