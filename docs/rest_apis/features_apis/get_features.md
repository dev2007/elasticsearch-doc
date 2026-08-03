# 获取特性 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [获取特性 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-features-get-features)。

:::::

获取在创建快照时可以使用 `feature_states` 字段包含在快照中的特性列表。

## 请求

```bash
GET /_features
```

## 描述

你可以使用获取特性 API 来确定在创建快照时要包含哪些特性状态。默认情况下，如果快照包含全局状态，则所有特性状态都包含在快照中；如果不包含全局状态，则不包含任何特性状态。

特性状态包含一个或多个系统索引，这些索引是给定特性正常运行所必需的。为了确保数据完整性，构成特性状态的所有系统索引会一起进行快照和恢复。

此 API 列出的特性是内置特性和插件定义的特性的组合。要使特性的状态能在此 API 中列出并被创建快照 API 识别为有效的特性状态，定义该特性的插件必须安装在主节点上。

## 示例

```bash
GET /_features
```

返回的特性列表示例：

```json
{
    "features": [
        {
            "name": "tasks",
            "description": "Manages task results"
        },
        {
            "name": "kibana",
            "description": "Manages Kibana configuration and reports"
        }
    ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-features-api.html)
