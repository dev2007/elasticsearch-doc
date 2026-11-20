# 修改数据流

## 更改数据流的映射和设置

每个数据流都有一个匹配的索引模板。来自此模板的映射和索引设置会应用到为该流创建的新支持索引。这包括流的第一个支持索引，它是在流创建时自动生成的。

在创建数据流之前，我们建议你仔细考虑要在此模板中包含哪些映射和设置。

如果之后需要更改数据流的映射或设置，你有以下几个选择：

- [向数据流添加新的字段映射](#向数据流添加新的字段映射)
- [更改数据流中现有的字段映射](#更改数据流中现有的字段映射)
- [更改数据流的动态索引设置](#更改数据流的动态索引设置)
- [更改数据流的静态索引设置](#更改数据流的静态索引设置)

如果你的更改包括对现有字段映射或静态索引设置的修改，通常需要重索引才能将更改应用到数据流的支持索引。如果你已经在执行重索引，可以使用相同的过程来添加新的字段映射并更改动态索引设置。参阅[使用重索引更改映射或设置](#使用重索引更改映射或设置)。

### 向数据流添加新的字段映射

要向数据流添加新字段的映射，请按以下步骤操作：

1. 更新数据流使用的索引模板。这确保新的字段映射会添加到未来为该流创建的支持索引中。

   例如，`my-data-stream-template` 是 `my-data-stream` 使用的一个现有索引模板。

   以下创建或更新索引模板请求向模板添加了新字段 `message` 的映射。

   ```bash
   PUT /_index_template/my-data-stream-template
   {
     "index_patterns": [ "my-data-stream*" ],
     "data_stream": { },
     "priority": 500,
     "template": {
       "mappings": {
         "properties": {
           "message": {
             "type": "text"
           }
         }
       }
     }
   }
   ```

   添加新 `message` 字段的映射。

2. 使用更新映射 API 将新的字段映射添加到数据流。默认情况下，这会将映射添加到流的现有支持索引，包括写索引。

   以下更新映射 API 请求将新的 `message` 字段映射添加到 `my-data-stream`。

   ```bash
   PUT /my-data-stream/_mapping
   {
     "properties": {
       "message": {
         "type": "text"
       }
     }
   }
   ```

   要仅将映射添加到流的写索引，请将更新映射 API 的 `write_index_only` 查询参数设置为 `true`。

   以下更新映射请求仅将新的 `message` 字段映射添加到 `my-data-stream` 的写索引。新字段映射不会添加到流的其他支持索引。

   ```bash
   PUT /my-data-stream/_mapping?write_index_only=true
   {
     "properties": {
       "message": {
         "type": "text"
       }
     }
   }
   ```

### 更改数据流中现有的字段映射

每个映射参数的文档都说明了是否可以使用更新映射 API 为现有字段更新该参数。要为现有字段更新这些参数，请按以下步骤操作：

1. 更新数据流使用的索引模板。这确保更新后的字段映射会添加到未来为该流创建的支持索引中。

   例如，`my-data-stream-template` 是 `my-data-stream` 使用的一个现有索引模板。

   以下创建或更新索引模板请求将 `host.ip` 字段的 `ignore_malformed` 映射参数的值更改为 `true`。

   ```bash
   PUT /_index_template/my-data-stream-template
   {
     "index_patterns": [ "my-data-stream*" ],
     "data_stream": { },
     "priority": 500,
     "template": {
       "mappings": {
         "properties": {
           "host": {
             "properties": {
               "ip": {
                 "type": "ip",
                 "ignore_malformed": true
               }
             }
           }
         }
       }
     }
   }
   ```

   将 `host.ip` 字段的 `ignore_malformed` 值更改为 `true`。

2. 使用更新映射 API 将映射更改应用到数据流。默认情况下，这会将更改应用到流的现有支持索引，包括写索引。

   以下更新映射 API 请求以 `my-data-stream` 为目标。该请求将 `host.ip` 字段的 `ignore_malformed` 映射参数的值更改为 `true`。

   ```bash
   PUT /my-data-stream/_mapping
   {
     "properties": {
       "host": {
         "properties": {
           "ip": {
             "type": "ip",
             "ignore_malformed": true
           }
         }
       }
     }
   }
   ```

   要仅将映射更改应用到流的写索引，请将 put mapping API 的 `write_index_only` 查询参数设置为 `true`。

   以下更新映射请求仅为 `my-data-stream` 的写索引更改 `host.ip` 字段的映射。此更改不会应用到流的其他支持索引。

   ```bash
   PUT /my-data-stream/_mapping?write_index_only=true
   {
     "properties": {
       "host": {
         "properties": {
           "ip": {
             "type": "ip",
             "ignore_malformed": true
           }
         }
       }
     }
   }
   ```

除受支持的映射参数外，我们不建议你更改现有字段的映射或字段数据类型，即使在数据流的匹配索引模板或其支持索引中也是如此。更改现有字段的映射可能会使已索引的数据无效。

如果需要更改现有字段的映射，请创建一个新的数据流并将你的数据重索引到其中。参阅[使用重索引更改映射或设置](#使用重索引更改映射或设置)。

### 更改数据流的动态索引设置

要更改数据流的动态索引设置，请按以下步骤操作：

1. 更新数据流使用的索引模板。这确保该设置会应用到未来为该流创建的支持索引中。

   例如，`my-data-stream-template` 是 `my-data-stream` 使用的一个现有索引模板。

   以下创建或更新索引模板请求将模板的 `index.refresh_interval` 索引设置更改为 `30s`（30 秒）。

   ```bash
   PUT /_index_template/my-data-stream-template
   {
     "index_patterns": [ "my-data-stream*" ],
     "data_stream": { },
     "priority": 500,
     "template": {
       "settings": {
         "index.refresh_interval": "30s"
       }
     }
   }
   ```

   将 `index.refresh_interval` 设置更改为 `30s`（30 秒）。

2. 使用更新索引设置 API 为数据流更新该索引设置。默认情况下，这会将该设置应用到流的现有支持索引，包括写索引。

   以下更新索引设置 API 请求更新了 `my-data-stream` 的 `index.refresh_interval` 设置。

   ```bash
   PUT /my-data-stream/_settings
   {
     "index": {
       "refresh_interval": "30s"
     }
   }
   ```

要更改 `index.lifecycle.name` 设置，请先使用移除策略 API 移除现有的 ILM 策略。参阅[切换生命周期策略](/ILM_manage_the_index_lifecycle/index_lifecycle_management)。

### 更改数据流的静态索引设置

静态索引设置只能在创建支持索引时设置。你无法使用更新索引设置 API 更新静态索引设置。

要将新的静态设置应用到未来的支持索引，请更新数据流使用的索引模板。该设置会自动应用到更新之后创建的任何支持索引。

例如，`my-data-stream-template` 是 `my-data-stream` 使用的一个现有索引模板。

以下创建或更新索引模板 API 请求向模板添加了新的 `sort.field` 和 `sort.order` 索引设置。

```bash
PUT /_index_template/my-data-stream-template
{
  "index_patterns": [ "my-data-stream*" ],
  "data_stream": { },
  "priority": 500,
  "template": {
    "settings": {
      "sort.field": [ "@timestamp"],
      "sort.order": [ "desc"]
    }
  }
}
```

1. 添加 `sort.field` 索引设置。
2. 添加 `sort.order` 索引设置。

如果需要，你可以[翻转](/data_streams/use_a_data_stream#手动翻转数据流)数据流，以立即将设置应用到数据流的写索引。这会影响翻转之后添加到流中的任何新数据。但是，它不会影响数据流现有的支持索引或现有数据。

要将静态设置的更改应用到现有的支持索引，你必须创建一个新的数据流并将你的数据重索引到其中。参阅[使用重索引更改映射或设置](#使用重索引更改映射或设置)。

### 使用重索引更改映射或设置

你可以使用重索引来更改数据流的映射或设置。更改现有字段的数据类型或更新支持索引的静态索引设置时，通常需要这样做。

要重索引数据流，请首先创建或更新索引模板，使其包含所需的映射或设置更改。然后，你可以将现有数据流重索引到匹配该模板的新流。这会将模板中的映射和设置更改应用到添加到新数据流的每个文档和支持索引。这些更改还会影响新流未来创建的任何支持索引。

按以下步骤操作：

1. 为新的数据流选择一个名称或索引模式。这个新的数据流将包含你现有流的数据。

   你可以使用 resolve index API 检查该名称或模式是否与任何现有的索引、别名或数据流匹配。如果匹配，你应该考虑使用其他名称或模式。

   以下 resolve index API 请求检查是否有任何以 `new-data-stream` 开头的现有索引、别名或数据流。如果没有，则可以使用 `new-data-stream*` 索引模式创建新的数据流。

   ```bash
   GET /_resolve/index/new-data-stream*
   ```

   该 API 返回以下响应，表明没有现有的目标匹配此模式。

   ```json
   {
     "indices": [ ],
     "aliases": [ ],
     "data_streams": [ ]
   }
   ```

2. 创建或更新索引模板。此模板应包含你希望应用到新数据流支持索引的映射和设置。

   此索引模板必须满足数据流模板的要求。它还应在 `index_patterns` 属性中包含你之前选择的名称或索引模式。

   如果只是添加或更改少量内容，我们建议你通过复制现有模板并根据需要进行修改来创建新模板。

   例如，`my-data-stream-template` 是 `my-data-stream` 使用的一个现有索引模板。

   以下创建或更新索引模板 API 请求创建了一个新的索引模板 `new-data-stream-template`。`new-data-stream-template` 以 `my-data-stream-template` 为基础，做了以下更改：

   - `index_patterns` 中的索引模式匹配任何以 `new-data-stream` 开头的索引或数据流。
   - `@timestamp` 字段映射使用 `date_nanos` 字段数据类型，而不是 `date` 数据类型。
   - 模板包含 `sort.field` 和 `sort.order` 索引设置，这些设置不在原始的 `my-data-stream-template` 模板中。

   ```bash
   PUT /_index_template/new-data-stream-template
   {
     "index_patterns": [ "new-data-stream*" ],
     "data_stream": { },
     "priority": 500,
     "template": {
       "mappings": {
         "properties": {
           "@timestamp": {
             "type": "date_nanos"
           }
         }
       },
       "settings": {
         "sort.field": [ "@timestamp"],
         "sort.order": [ "desc"]
       }
     }
   }
   ```

   1. 将 `@timestamp` 字段映射更改为 `date_nanos` 字段数据类型。
   2. 添加 `sort.field` 索引设置。
   3. 添加 `sort.order` 索引设置。

3. 使用创建数据流 API 手动创建新的数据流。数据流的名称必须与新模板的 `index_patterns` 属性中定义的索引模式匹配。

   我们不建议通过索引新数据来创建此数据流。之后，你将把现有数据流中的旧数据重索引到这个新流中。这可能导致一个或多个支持索引中混杂新数据和旧数据。

   ::::note 提示
   数据流中混杂新数据和旧数据

   虽然混合新旧数据是安全的，但可能会干扰数据保留。如果你删除较旧的索引，可能会意外删除同时包含新旧数据和支持索引。为防止过早丢失数据，你需要保留这样的支持索引，直到你准备删除其最新数据为止。
   ::::

   以下创建数据流 API 请求以 `new-data-stream` 为目标，它匹配 `new-data-stream-template` 的索引模式。因为没有现有的索引或数据流使用此名称，此请求会创建 `new-data-stream` 数据流。

   ```bash
   PUT /_data_stream/new-data-stream
   ```

4. 如果你不希望在新的数据流中混合新旧数据，请暂停新文档的索引。虽然混合新旧数据是安全的，但可能会干扰数据保留。参阅[数据流中混杂新数据和旧数据](#数据流中混杂新数据和旧数据)。

5. 如果你使用 ILM 自动化翻转，请降低 ILM 轮询间隔。这可以确保当前的写索引在等待翻转检查时不会增长得过大。默认情况下，ILM 每 10 分钟检查一次翻转条件。

   以下集群更新设置 API 请求将 `indices.lifecycle.poll_interval` 设置降低为 `1m`（1 分钟）。

   ```bash
   PUT /_cluster/settings
   {
     "persistent": {
       "indices.lifecycle.poll_interval": "1m"
     }
   }
   ```

6. 使用 `op_type` 为 `create` 的操作将你的数据重索引到新的数据流。

   如果想按最初索引数据的顺序对数据进行分区，可以运行单独的重索引请求。这些重索引请求可以使用单个支持索引作为源。你可以使用获取数据流 API 检索支持索引的列表。

   例如，你计划将 `my-data-stream` 中的数据重索引到 `new-data-stream`。但是，你希望为 `my-data-stream` 中的每个支持索引提交一个单独的重索引请求，从最旧的支持索引开始。这样可以保留数据最初被索引的顺序。

   以下获取数据流 API 请求检索 `my-data-stream` 的信息，包括其支持索引的列表。

   ```bash
   GET /_data_stream/my-data-stream
   ```

   响应的 `indices` 属性包含一个由该流当前支持索引组成的数组。数组的第一项包含该流最旧支持索引的信息。

   ```json
   {
     "data_streams": [
       {
         "name": "my-data-stream",
         "timestamp_field": {
           "name": "@timestamp"
         },
         "indices": [
           {
             "index_name": ".ds-my-data-stream-2099.03.07-000001",
             "index_uuid": "Gpdiyq8sRuK9WuthvAdFbw",
             "prefer_ilm": true,
             "managed_by": "Unmanaged"
           },
           {
             "index_name": ".ds-my-data-stream-2099.03.08-000002",
             "index_uuid": "_eEfRrFHS9OyhqWntkgHAQ",
             "prefer_ilm": true,
             "managed_by": "Unmanaged"
           }
         ],
         "generation": 2,
         "status": "GREEN",
         "next_generation_managed_by": "Unmanaged",
         "prefer_ilm": true,
         "template": "my-data-stream-template",
         "hidden": false,
         "system": false,
         "allow_custom_routing": false,
         "replicated": false,
         "rollover_on_write": false
       }
     ]
   }
   ```

   `my-data-stream` 的 `indices` 数组中的第一项。此项包含该流最旧支持索引 `.ds-my-data-stream-2099.03.07-000001` 的信息。

   以下重索引 API 请求将文档从 `.ds-my-data-stream-2099.03.07-000001` 复制到 `new-data-stream`。请求的 `op_type` 为 `create`。

   ```bash
   POST /_reindex
   {
     "source": {
       "index": ".ds-my-data-stream-2099.03.07-000001"
     },
     "dest": {
       "index": "new-data-stream",
       "op_type": "create"
     }
   }
   ```

   你还可以使用查询，让每个请求只重索引一部分文档。

   以下重索引 API 请求将文档从 `my-data-stream` 复制到 `new-data-stream`。该请求使用 range 查询只重索引时间戳在过去一周内的文档。注意请求的 `op_type` 为 `create`。

   ```bash
   POST /_reindex
   {
     "source": {
       "index": "my-data-stream",
       "query": {
         "range": {
           "@timestamp": {
             "gte": "now-7d/d",
             "lte": "now/d"
           }
         }
       }
     },
     "dest": {
       "index": "new-data-stream",
       "op_type": "create"
     }
   }
   ```

7. 如果之前更改过 ILM 轮询间隔，请在重索引完成后将其改回原始值。这可以避免给主节点带来不必要的负载。

   以下集群更新设置 API 请求将 `indices.lifecycle.poll_interval` 设置重置为其默认值。

   ```bash
   PUT /_cluster/settings
   {
     "persistent": {
       "indices.lifecycle.poll_interval": null
     }
   }
   ```

8. 使用新的数据流恢复索引。对该流的搜索现在将同时查询你的新数据和重索引的数据。

9. 一旦确认所有重索引的数据在新数据流中都可用，你就可以安全地移除旧的流。

   以下删除数据流 API 请求删除 `my-data-stream`。此请求还会删除流的支持索引及其包含的任何数据。

   ```bash
   DELETE /_data_stream/my-data-stream
   ```

## 更新数据流的别名或为数据流添加别名

使用 [aliases API](/rest_apis/index_apis/aliases) 更新现有数据流的别名。在索引模式中更改现有数据流的别名没有效果。

例如，`logs` 别名指向一个单一的数据流。以下请求为该别名更换了流。在此次更换期间，`logs` 别名没有停机时间，也从未同时指向两个流。

```bash
POST _aliases
{
  "actions": [
    {
      "remove": {
        "index": "logs-nginx.access-prod",
        "alias": "logs"
      }
    },
    {
      "add": {
        "index": "logs-my_app-default",
        "alias": "logs"
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/modify-data-streams.html)
