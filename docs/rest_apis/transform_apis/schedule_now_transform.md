# 立即调度转换 API

立即运行一个转换以处理数据。

```txt
POST _transform/<transform_id>/_schedule_now
```

## 前置条件

- 需要 `manage_transform` 集群权限。该权限包含在内置角色 `transform_admin` 中。

## 描述

调用此 API 时，下一个检查点的处理会**立即启动**，无需等待配置的 `frequency` 间隔。

此 API 会立即返回，数据处理在**后台**进行。

此后，转换将在 `now + frequency` 时间再次被处理，除非在此期间再次调用此 API。

## 路径参数

`<transform_id>`

（必需，字符串）转换的标识符。

## 查询参数

`timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待响应的时间。如果在超时期限到期之前未收到响应，则请求失败并返回错误。

## 响应体

转换被调度立即运行时，返回以下结果：

```json
{
  "acknowledged": true
}
```

## 示例

以下示例立即调度名为 `ecommerce_transform` 的转换：

```txt
POST _transform/ecommerce_transform/_schedule_now
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/schedule-now-transform.html)
