# User agent 处理器

`user_agent` 处理器从浏览器随 Web 请求发送的 User Agent 字符串中提取详细信息。该处理器默认将此信息添加在 `user_agent` 字段下。

ingest-user-agent 模块默认内置了 uap-java 提供的 regexes.yaml（Apache 2.0 许可证）。更多详情参阅 https://github.com/ua-parser/uap-core

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 包含 user agent 字符串的字段。 |
| `target_field` | 否 | `user_agent` | 将填充 user agent 详细信息的字段。 |
| `regex_file` | 否 | - | `config/ingest-user-agent` 目录中包含用于解析 user agent 字符串的正则表达式的文件名。目录和文件都必须在启动 Elasticsearch 之前创建。如果未指定，ingest-user-agent 将使用它自带的来自 uap-core 的 regexes.yaml（见下文）。 |
| `properties` | 否 | [`name`, `major`, `minor`, `patch`, `build`, `os`, `os_name`, `os_major`, `os_minor`, `device`] | 控制将哪些属性添加到 `target_field`。 |
| `extract_device_type` | 否 | `false` | [beta] 此功能处于 beta 阶段，可能会发生变化。其设计和代码的成熟度低于正式 GA 功能，按"原样"提供且不附带任何担保。beta 功能不受正式 GA 功能支持 SLA 的约束。以尽力而为的方式从 user agent 字符串中提取设备类型。 |
| `ignore_missing` | 否 | `false` | 设为 `true` 时，如果字段不存在，处理器将安静地退出而不修改文档。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

基于 `agent` 字段将 user agent 详细信息添加到 `user_agent` 字段。创建管道：

```json
PUT _ingest/pipeline/user_agent
{
  "description": "Add user agent information",
  "processors": [
    {
      "user_agent": {
        "field": "agent"
      }
    }
  ]
}
```

使用该管道索引文档：

```json
PUT my-index-000001/_doc/my_id?pipeline=user_agent
{
  "agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
}
```

查询文档：

```json
GET my-index-000001/_doc/my_id
```

返回结果：

```json
{
  "found": true,
  "_index": "my-index-000001",
  "_id": "my_id",
  "_version": 1,
  "_seq_no": 22,
  "_primary_term": 1,
  "_source": {
    "agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
    "user_agent": {
      "name": "Chrome",
      "original": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
      "version": "51.0.2704.103",
      "os": {
        "name": "Mac OS X",
        "version": "10.10.5",
        "full": "Mac OS X 10.10.5"
      },
      "device": {
        "name": "Mac"
      }
    }
  }
}
```

## 使用自定义正则文件

要使用自定义正则文件来解析 user agent，该文件必须放在 `config/ingest-user-agent` 目录中，并且文件扩展名必须为 `.yml`。文件必须在节点启动时就已存在，节点运行期间对文件的任何修改或新增的任何文件都不会生效。

实际上，自定义正则文件最好是默认文件的变体，例如更新的版本或经过定制的版本。

`ingest-user-agent` 中包含的默认文件是来自 uap-core 的 `regexes.yaml`：https://github.com/ua-parser/uap-core/blob/master/regexes.yaml

## 节点设置

- `ingest.user_agent.cache_size`（[静态](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/settings.html#static-cluster-setting)，整数）缓存结果的最大数量。默认为 `1000`。

注意这些设置是节点设置，适用于所有 `user_agent` 处理器，即所有已定义的 `user_agent` 处理器共享同一个缓存。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/user-agent-processor.html)
