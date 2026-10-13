# 重置转换 API

重置一个转换。

```txt
POST _transform/<transform_id>/_reset
```

## 前置条件

- 需要 `manage_transform` 集群权限。
- 该权限包含在内置角色 `transform_admin` 中。

## 描述

- 在重置转换之前，必须先**停止它**；或者使用 `force` 查询参数。
- 重置转换会删除：
  - 所有**检查点**。
  - 所有**状态**。
  - **目标索引**（如果它是由转换创建的）。
- 转换会被更新为最新格式，就像使用了更新转换 API 一样。
- 转换即可再次启动，**就像它刚刚被创建一样**。

## 路径参数

`<transform_id>`

（必需，字符串）转换的标识符。

## 查询参数

`force`

（可选，布尔值）默认为 `false`。如果为 `true`，则无论转换当前处于什么状态，都会将其重置。如果为 `false`，则必须先停止转换才能重置。

`timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待响应的期限。如果在超时期限到期之前未收到响应，则请求失败并返回错误。

## 响应体

成功的调用返回以下响应：

```json
{
  "acknowledged": true
}
```

## 示例

以下示例重置名为 `ecommerce_transform` 的转换：

```txt
POST _transform/ecommerce_transform/_reset
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/reset-transform.html)
