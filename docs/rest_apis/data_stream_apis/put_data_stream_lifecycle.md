# 设置数据流生命周期

为目标[数据流](/data-streams)配置数据流[生命周期](/data-streams/data-stream-lifecycle)。

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage_data_stream_lifecycle` 或更高的[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。更多信息，参阅[安全权限](/secure_the_elastic_statck/user_authorization/security_privileges)。

## 请求

`PUT _data_stream/<data-stream>/_lifecycle`

## 描述

为目标数据流配置数据流生命周期。如果提供了多个数据流，但其中有一个以上不存在，那么生命周期的更新将对所有数据流都失败，API 将响应 `404`。

## 路径参数

- `<data-stream>`

    (必需，字符串) 用于限制请求的数据流的逗号分隔列表。支持通配符 (`*`)。要针对所有数据流，请使用 `*` 或 `_all`。

## 查询参数

- `expand_wildcards`

    （可选，字符串）通配符模式可以匹配的数据流类型。支持逗号分隔值，例如 `open,hidden`。有效值为：

    - `all`，`hidden`

        匹配任何数据流或索引，包括[隐藏的](/rest_apis/api_conventions/multi_target_syntax#隐藏数据流和索引)。

    - `open`，`closed`

        匹配任何非隐藏的数据流。无法关闭 Data Streams。

    - `none`

        不接受通配符模式。

    默认为 `open`。

## 请求体

- `lifecycle`

    （必需，对象）

    - `lifecycle` 的属性

        - `data_retention`

            (可选，字符串）如果定义，则添加到此数据流中的每个文档都将至少在此时间段内保存。在此期限之后的任何时间，文档都可能被删除。如果为空，则该数据流中的每份文档都将无限期存储。

        - `enabled`

            (可选，布尔值）如果定义，则打开/关闭（`true`/`false`）该数据流的数据流生命周期。禁用（`enabled: false`）的数据流生命周期对数据流没有任何影响。默认为 `true`。

        - `downsampling`

            (可选，数组）一个可选的下采样配置对象数组，每个对象都定义了一个后间隔（`after`）和一个固定间隔（`fixed_interval`），后间隔代表何时要对后备索引进行下采样（时间范围从索引滚动开始计算，即生成时间），`fixed_interval` 代表下采样间隔（`fixed_interval` 最小值为 `5m`）。最多可配置 10 轮向下采样。参阅下面的[配置](#示例)示例。

## 示例

下面的示例设置了 `my-data-stream` 的生命周期：

```bash
PUT _data_stream/my-data-stream/_lifecycle
{
  "data_retention": "7d"
}
```

当生命周期在所有数据流中更新成功后，你会收到以下结果：

```json
{
  "acknowledged": true
}
```

下面的示例配置了两轮下采样，第一轮在后备索引滚动一天后开始（或更晚，如果索引仍在其写入接受时间范围内），间隔为 `10m`，第二轮在滚动 7 天后开始，间隔为 `1d`：

```bash
PUT _data_stream/my-weather-sensor-data-stream/_lifecycle
{
    "downsampling": [
      {
        "after": "1d",
        "fixed_interval": "10m"
      },
      {
        "after": "7d",
        "fixed_interval": "1d"
      }
    ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/data-streams-put-lifecycle.html)
