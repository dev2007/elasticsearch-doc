# 解释数据流生命周期

:::info 新 API 参考
有关最新 API 的详细信息，参阅[数据流 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-data-stream)。
:::

读取一个或多个数据流后备索引的当前[数据流生命周期](/data_streams/data_stream_lifecycle)状态。

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `manage_data_stream_lifecycle` 的索引权限或 `view_index_metadata` 索引权限来使用此 API。更多信息，参阅[安全权限](/secure_the_elastic_statck/user_authorization/security_privileges)。

## 请求

`GET <target>/_lifecycle/explain`

## 描述

读取有关索引或数据流当前数据流生命周期状态的信息，如创建索引以来的时间、翻转以来的时间、管理索引的生命周期配置，或 Elasticsearch 在生命周期执行期间可能遇到的任何错误。

## 路径参数

- `<target>`

    (必需，字符串） 用逗号分隔的索引或数据流列表。

## 查询参数

- `include_defaults`

    (可选，布尔值）包含与目标生命周期相关的默认配置。默认为 `false`。

- `master_timeout`

    (可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果在超时前主节点不可用，则请求失败并返回错误。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

## 示例

如果要检索数据流中所有后备索引的生命周期状态，可以使用数据流名称。为简单起见，以下示例检索了一个后备索引 `.ds-metrics-2023.03.22-000001` 的生命周期状态：

```bash
GET .ds-metrics-2023.03.22-000001/_lifecycle/explain
```

如果该索引由数据流生命周期管理，则解释将显示 `managed_by_lifecycle` 字段设置为 `true`，响应的其余部分将包含有关该索引生命周期执行状态的信息：

```json
{
  "indices": {
    ".ds-metrics-2023.03.22-000001": {
      "index" : ".ds-metrics-2023.03.22-000001",
      "managed_by_lifecycle" : true,                        
      "index_creation_date_millis" : 1679475563571,   
      "time_since_index_creation" : "843ms",          
      "rollover_date_millis" : 1679475564293,         
      "time_since_rollover" : "121ms",                
      "lifecycle" : { },                              
      "generation_time" : "121ms"                     
  }
}
```
1. `"managed_by_lifecycle" : true`：显示索引是否由数据流生命周期管理。如果索引不是由数据流生命周期管理，则不会显示其他字段
2. `"index_creation_date_millis" : 1679475563571`：创建索引的时间，该时间戳用于确定何时翻转
3. `"time_since_index_creation" : "843ms"`：索引创建后的时间（用于通过 `max_age` 计算何时翻转索引）
4. `"rollover_date_millis" : 1679475564293`：索引翻转的时间。如果索引没有滚动，则不会显示。
5. `"time_since_rollover" : "121ms"`：翻转后的时间。如果索引没有滚动，则不会显示。
6. `"lifecycle" : { }`：适用于该索引的生命周期配置（在父数据流中进行了配置）
7. `"generation_time" : "121ms"`：索引的生成时间表示索引开始进入生命周期中用户可配置/业务特定部分（如保留）的时间。如果存在 `generation_time`，则从该日期开始计算生成时间；如果存在翻转日期，则从该日期开始计算生成时间；如果其他两个日期都不存在，则从创建日期开始计算生成时间。如果该索引是写入索引，则不会报告 `generation_time`，因为它不符合保留或生命周期其他部分的条件。

`explain` 还会报告与目标索引生命周期执行相关的任何错误：

```json
{
  "indices": {
    ".ds-metrics-2023.03.22-000001": {
      "index" : ".ds-metrics-2023.03.22-000001",
      "managed_by_lifecycle" : true,
      "index_creation_date_millis" : 1679475563571,
      "time_since_index_creation" : "843ms",
      "lifecycle" : {
        "enabled": true
      },
      "error": "{\"type\":\"validation_exception\",\"reason\":\"Validation Failed: 1: this action would add [2] shards, but this cluster
currently has [4]/[3] maximum normal shards open;\"}"        
  }
}
```

1. `"error":`：由于集群中允许的分片数量限制，无法翻转目标索引。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/data-streams-explain-lifecycle.html)
