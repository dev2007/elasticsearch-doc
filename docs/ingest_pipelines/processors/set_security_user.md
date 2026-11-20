# Set security user 处理器

从当前已认证用户设置用户相关的详细信息（如 `username`、`roles`、`email`、`full_name`、`metadata`、`api_key`、`realm` 和 `authentication_type`）。

`api_key` 属性仅在用户使用 API 密钥认证时存在。它是一个包含 API 密钥的 `id`、`name` 和 `metadata`（若存在且非空）字段的对象。`realm` 属性同样是一个包含 `name` 和 `type` 两个字段的对象。使用 API 密钥认证时，`realm` 属性指创建该 API 密钥的 realm。`authentication_type` 属性是一个字符串，取值可为 `REALM`、`API_KEY`、`TOKEN` 和 `ANONYMOUS`。

索引请求需要已认证的用户。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 存储用户信息的字段。 |
| `properties` | 否 | [`username`, `roles`, `email`, `full_name`, `metadata`, `api_key`, `realm`, `authentication_type`] | 控制将哪些用户相关属性添加到 `field`。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

以下示例将当前已认证用户的所有用户详细信息添加到 `user` 字段，适用于被该管道处理的所有文档：

```json
{"processors":[{"set_security_user":{"field":"user"}}]}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ingest-node-set-security-user-processor.html)
