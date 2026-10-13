# 删除转换 API

删除一个现有的转换。

```txt
DELETE _transform/<transform_id>
```

## 前置条件

- 需要 `manage_transform` 集群权限。该权限包含在内置角色 `transform_admin` 中。
- 在删除转换之前，必须先停止它。

## 路径参数

`<transform_id>`

（必需，字符串）转换的标识符。

## 查询参数

`force`

（可选，布尔值）默认为 `false`。如果为 `true`，则无论转换当前处于什么状态，都会将其删除。如果为 `false`，则必须先停止转换才能删除。

`delete_dest_index`

（可选，布尔值）默认为 `false`。如果为 `true`，则目标索引会随转换一起被删除。如果为 `false`，则目标索引不会被删除。

`timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待响应的期限。如果在超时期限到期之前未收到响应，则请求失败并返回错误。

## 响应体

当转换被删除时，会返回以下结果：

```json
{
  "acknowledged": true
}
```

## 示例

以下示例删除名为 `ecommerce_transform` 的转换：

```txt
DELETE _transform/ecommerce_transform
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-transform.html)
