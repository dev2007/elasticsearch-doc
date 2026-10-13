# 停止转换 API

停止一个或多个转换。

```txt
POST _transform/<transform_id>/_stop
POST _transform/<transform_id1>,<transform_id2>/_stop
POST _transform/_all/_stop
```

## 前置条件

- 需要 `manage_transform` 集群权限。该权限包含在内置角色 `transform_admin` 中。

## 路径参数

`<transform_id>`

（必需，字符串）转换的标识符。要停止多个转换，可以使用逗号分隔的列表或通配符表达式。要停止所有转换，请使用 `_all` 或 `*` 作为标识符。

## 查询参数

`allow_no_match`

（可选，布尔值）默认为 `true`。指定当请求出现以下情况时的处理方式：(1) 包含通配符表达式但没有匹配的转换；(2) 包含 `_all` 字符串或未指定标识符且没有匹配项；或 (3) 包含只有部分匹配的通配符表达式。如果为 `true`，则当没有匹配项时返回成功的确认。当只有部分匹配时，此 API 会停止相应的转换（例如，使用 `test-id1*,test-id2*` 时，如果没有匹配 `test-id2*` 的转换，则匹配 `test-id1*` 的转换仍会被停止）。如果为 `false`，则当没有匹配项或只有部分匹配时，请求返回 **404** 状态码。

`force`

（可选，布尔值）设置为 `true` 可以停止一个已失败的转换，或强制停止一个对初始停止请求没有响应的转换。

`timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。如果 `wait_for_completion` 为 `true`，则此 API 在等待转换停止时最多阻塞指定的时长。如果超过 `timeout` 时间，此 API 会抛出超时异常。即使抛出了超时异常，停止请求仍在继续处理并最终会将转换移动到 `STOPPED` 状态 — 超时仅表示 API 调用本身在等待状态更改时超时。

`wait_for_checkpoint`

（可选，布尔值）默认为 `false`。如果为 `true`，则转换在当前检查点完成之前不会完全停止。如果为 `false`，则转换会尽快停止。

`wait_for_completion`

（可选，布尔值）默认为 `false`。如果为 `true`，会使此 API 阻塞直到索引器状态完全停止。如果为 `false`，此 API 会立即返回，索引器会在后台异步停止。

## 响应码

- `404`（缺少资源）— 如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源，或只有部分匹配。

## 响应体

当转换停止时，会返回以下结果：

```json
{
  "acknowledged": true
}
```

## 示例

以下示例停止名为 `ecommerce_transform` 的转换：

```txt
POST _transform/ecommerce_transform/_stop
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/stop-transform.html)
