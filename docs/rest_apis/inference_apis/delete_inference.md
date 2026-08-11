# 删除推理 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [删除推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-inference-delete)。

:::::

删除推理端点。

## 请求

```bash
DELETE /_inference/<inference_id>
```

```bash
DELETE /_inference/<task_type>/<inference_id>
```

## 前置条件

- 需要 `manage_inference` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)（内置的 `inference_admin` 角色授予此权限）。

## 路径参数

- `<inference_id>`

  （必需，字符串）要删除的推理端点的唯一标识符。

- `<task_type>`

  （可选，字符串）模型执行的推理任务类型。

## 查询参数

- `dry_run`

  （可选，布尔值）当为 `true` 时，检查引用该端点的 `semantic_text` 字段和推理处理器，并以列表形式返回，但不删除端点。默认为 `false`。

- `force`

  （可选，布尔值）无论端点是否在 `semantic_text` 字段或推理管道中使用，都删除该端点。

## 示例

以下 API 调用删除可以执行 `sparse_embedding` 任务的 `my-elser-model` 推理模型。

```bash
DELETE /_inference/sparse_embedding/my-elser-model
```

API 返回以下响应：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-inference-api.html)
