# 索引 API

:::caution 警告
参阅[移除映射类型](/mapping/removal_of_mapping_types)
:::

将JSON文档添加到指定的数据流或索引，并使其可搜索。如果目标是索引，并且文档已经存在，则请求将更新文档并增加其版本。

:::note 提示
你不能使用索引 API 将现有文档的更新请求发送到数据流。参阅[通过查询更新数据流中的文档](/data_streams/use_a_data_stream#通过查询更新数据流中的文档)以及[更新或删除备份索引中的文档](/data_streams/use_a_data_stream#更新或删除备份索引中的文档)。
:::

## 请求

`PUT /<target>/_doc/<_id>`

`POST /<target>/_doc/`

`PUT /<target>/_create/<_id>`

`POST /<target>/_create/<_id>`

:::caution 警告
不能使用 `PUT /<target>/_doc/<_id>` 请求格式向数据流添加新文档。要指定文档ID，请改用 `PUT/<target>/_create/<_ID>` 格式。参阅[向数据流添加文档](/data_streams/use_a_data_stream#向数据流添加文档)。
:::

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或索引别名必须有[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

  - 要使用 `PUT /<target>/_doc/<_id>` 请求格式添加或覆盖文档，你必须有 `create`、`index` 或 `write` 索引权限。
  - 要使用 `POST /<target>/_ doc/`、`PUT /<target>/_create/<_id>` 或 `POST /<<target>/_create/<_ id>` 请求格式添加文档，你必须有 `create_doc`、`create`、`index` 或 `write` 索引权限。
  - 要使用索引 API 请求自动创建数据流或索引，你必须具有 `auto_configure`、`create_index` 或 `manage` 索引权限。

- 自动数据流创建需要启用数据流的匹配索引模板。参阅[设置数据流](/data_streams/set_up_a_data_stream)。

## 路径参数

- `<target>`

  （必需，字符串）目标的数据流或索引名字。

  如果目标不存在，并且与具有 [`data_stream` 定义的索引模板](/data_streams/set_up_a_data_stream#创建索引模板)的名称或通配符（*）模式匹配，则此请求将创建数据流。参阅[设置数据流](/data_streams/set_up_a_data_stream)。

  如果目标不存在且与数据流模板不匹配，则此请求将创建索引。

  你可以使用解析索引 API 检查现有目标。

- `<_id>`

  （可选，字符串）文档唯一标识。

  参数要符合以下请求格式：

  - `PUT /<target>/_doc/<_id>`
  - `PUT /<target>/_create/<_id>`
  - `POST /<target>/_create/<_id>`

  为了自动生成文档 ID，使用此请求格式并忽略参数： `POST /<target>/_doc/`。

## 查询参数

- `if_seq_no`

  （可选，整数）仅当文档具有此序列号时才执行此操作。参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。

- `if_primary_term`

  （可选，整数）仅当文档具有此主词语时才执行此操作。参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。

- `op_type`

  （可选，枚举）设置为 `create`，仅在文档不存在时为其编制索引（*不存在则放置*）。如果具有指定 `_id` 的文档已经存在，索引操作将失败。与使用 `<index>/_create` 端点相同的逻辑。有效值：`index`, `create`。如果指定了文档 id，则默认为 `index`。否则，它默认为 `create`。

:::note 提示
如果请求以数据流为目标，则 `op_type` 为 `create` 是必需的。参阅[向数据流添加文档](/data_streams/use_a_data_stream#向数据流添加文档)。
:::

- `pipeline`

  （可选，字符串）用于预处理传入文档的管道 ID。

- `refresh`

  （可选，枚举）如果为 `true`，则 Elasticsearch 刷新受影响的分片，以使此操作对搜索可见；如果为 `wait_for`，则等待刷新，以使该操作对搜索可见；如果为 `false`，则不对刷新执行任何操作。有效值：`true`、`false`、`wait_for`。默认值：`false`。

- `routing`

  （可选，字符串）用于将操作路由到特定分片的自定义值。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）请求等待以下操作的时间段：

  - [自动创建索引](/rest_apis/document_apis/docs_index#自动创建数据流和索引)
  - [动态映射](/mapping/dynamic_mapping)更新
  - [等待活动分片](/rest_apis/document_apis/docs_index#活动分片)

  默认为 `1m`（一分钟）。这保证了 Elasticsearch 在失败之前至少要等待超时。实际等待时间可能更长，尤其是在发生多次等待时。

- `version`

  （可选，整数）并发控制的显式版本号。指定的版本必须与文档的当前版本匹配，请求才能成功。

- `version_type`

  （可选，枚举）指定的版本类型：`external`、`external_gte`。

- `wait_for_active_shards`

  （可选，字符串）继续操作前必须处于活动状态的分片副本数。设置为 `all` 或任何正整数，上限为索引中分片的总数（`(number_of_replicas+1`）。默认为：`1`，代表主分片。

  参阅[活动分片](/rest_apis/document_apis/docs_index#活动分片)。

- `require_alias`

（可选，布尔值）如果为 `true`，则目标必须是[索引别名](/aliases/aliases)。默认为`false`。

## 请求体

- `<field>`

  （必填，字符串）请求正文包含文档数据的 JSON 源。

## 响应体

- `_shards`

  提供有关索引操作的复制过程的信息。

- `_shards.total`

  指示应该对多少分片拷贝（主分片和副本分片）执行索引操作。

- `_shards.successful`

  指示索引操作成功的碎片副本数。索引操作成功时，`successful` 至少为1。

:::note 提示
索引操作成功返回时，​默认情况下副本分片可能不会全部启动，只有主节点是必须启动的。设置 `wait_for_active_shards` 以更改此默认行为。参阅[活动分片](/rest_apis/document_apis/docs_index#活动分片)。
:::

- `_shards.failed`

  在副本分片上的索引操作失败时，包含复制相关错误的阵列。0 表示没有故障。

- `_index`

  文档添加到的索引的名称。

- `_type`

  文档类型。Elasticsearch 索引现在支持单个文档类型 `_doc`。

- `_id`

  添加的文档的唯一标识符。

- `_version`

  文档版本。每次更新文档时递增。

- `_seq_no`

  为索引操作分配给文档的序列号。序列号用于确保文档的旧版本不会覆盖新版本。参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。

- `_primary_term`

  为索引操作分配给文档的主要词语。参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。

- `result`

  索引操作的结果，`created` 或 `updated`。

## 描述

可以使用 `_doc` 或 `_create` 资源为新的 JSON 文档编制索引。使用 `_create` 可以确保仅在文档不存在时才对其进行索引。要更新现有文档，必须使用 `_doc` 资源。

### 自动创建数据流和索引

如果请求的目标不存在，并且匹配一个 [带 `data_stream` 定义的索引模板](/data_streams/set_up_a_data_stream#创建一个索引模板)，则索引操作会自动创建数据流。参阅[设置数据流](/data_streams/set_up_a_data_stream)。

如果目标不存在并且与数据流模板不匹配，则操作会自动创建索引并应用任何匹配的[索引模板](/index_templates/index_templates)。

:::note 提示
Elasticsearch包括几个内置索引模板。要避免与这些模板发生命名冲突，参阅[避免索引模式冲突](/index_templates/index_templates)。
:::

如果不存在映射，索引操作将创建动态映射。默认情况下，如果需要，新字段和对象将自动添加到映射中。有关字段映射的更多信息，参阅[映射](/mapping/mapping)和[更新映射](/rest_apis/index_apis/update_mapping) API。

自动创建索引由设置 `action.auto_create_index` 控制。此设置默认为 `true`，允许自动创建任何索引。你可以修改此设置以明确允许或阻止自动创建与指定模式匹配的索引，或者将其设置为 `false` 以完全禁用自动创建索引。指定要允许的模式的逗号分隔列表，或使用 `+` 或 `-` 作为每个模式的前缀，以指示是允许还是阻止该模式。当指定列表时，默认行为是不允许。

:::caution 警告
设置 `action.auto_create_index` 只影响自动创建索引。它不影响创建数据流。
:::

```bash
PUT _cluster/settings
{
  "persistent": {
    "action.auto_create_index": "my-index-000001,index10,-index1*,+ind*" 
  }
}

PUT _cluster/settings
{
  "persistent": {
    "action.auto_create_index": "false" 
  }
}

PUT _cluster/settings
{
  "persistent": {
    "action.auto_create_index": "true" 
  }
}
```

1. `"action.auto_create_index": "my-index-000001,index10,-index1*,+ind*"`：允许自动创建名为 `my-index-000001`或 `index10` 的索引，阻止创建与模式 `index1*` 匹配的索引，并允许创建与 `ind*` 模式匹配的任何其他索引。模式按指定的顺序匹配。
2. `"action.auto_create_index": "false"`：完全禁用自动索引创建。
3. `"action.auto_create_index": "true"`：允许自动创建任何索引。这是默认设置。

#### 不存在则创建

可以使用 `_create` 资源或设置 `op_type` 参数来强制创建操作。在这种情况下，如果索引中已存在具有指定 ID 的文档，则索引操作将失败。

#### 自动创建文档 ID

使用 `POST /<target>/_doc/` 请求格式时，`op_type` 会自动设置为 `create`，索引操作会为文档生成唯一的 ID。

```bash
POST my-index-000001/_doc/
{
  "@timestamp": "2099-11-15T13:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "kimchy"
  }
}
```

此 API 返回以下结果：

```bash
{
  "_shards": {
    "total": 2,
    "failed": 0,
    "successful": 2
  },
  "_index": "my-index-000001",
  "_id": "W0tpsmIBdwcYyG50zbta",
  "_version": 1,
  "_seq_no": 0,
  "_primary_term": 1,
  "result": "created"
}
```

#### 乐观并发控制

索引操作可以是有条件的，只有在为文档的最后一次修改指定了 `if_seq_no` 和 `if_primary_term` 参数指定的序号和主词语时，才能执行索引操作。如果检测到不匹配，该操作将导致 `VersionConflictException` 和状态代码 409。更多信息，参阅[乐观并发控制](/rest_apis/document_apis/optimistic_concurrency_control)。

#### 路由

默认情况下，分片配置——或 `routing` ——通过使用文档 id 值的哈希来控制。为了进行更明确的控制，路由器使用的散列函数中的值可以使用 `routing` 参数直接按操作指定。例如：

```bash
POST my-index-000001/_doc?routing=kimchy
{
  "@timestamp": "2099-11-15T13:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "kimchy"
  }
}
```

在本例中，根据提供的 `routing` 参数：“kimchy”，将文档路由到分片。

设置显式映射时，还可以使用 `_routing` 字段指导索引操作，以从文档本身提取路由值。这需要额外的文档解析传递（非常小的）开销。如果定义了 `_routing` 映射并将其设置为 `required（必需的）`，则如果未提供或提取路由值，索引操作将失败。

:::note 提示
数据流不支持自定义路由，除非它们是在模板中启用 `allow_custom_routing` 设置的情况下创建的。
:::

#### 分布式

索引操作根据主分片的路由定向到主分片（参阅上面的路由部分），并在包含此分片的实际节点上执行。在主分片完成操作后，如果需要，更新将分发到适用的副本。

#### 活动分片

为了提高写入系统的弹性，可以将索引操作配置为在继续操作之前等待一定数量的活动分片拷贝。如果所需数量的活动分片拷贝不可用，则写入操作必须等待并重试，直到所需分片拷贝启动或超时为止。默认情况下，写入操作仅等待主分片处于活动状态，然后再继续（即 `wait_for_active_shards=1`）。通过设置 `index.write.wait_for_active_shards`，可以在索引设置中动态覆盖此默认值。要更改每个操作的行为，可以使用 `wait_for_active_shards` 请求参数。

有效值为索引中每个分片配置的拷贝总数的全部或任何正整数（即 `number_of_replicas+1`）。指定负值或大于分片副本数的数字将引发错误。

例如，假设我们有一个由三个节点（`A`、`B` 和 `C`）组成的集群，我们创建一个 `index` 索引，将副本数设置为 3（结果是 4 个分片拷贝，比节点多一个拷贝）。如果尝试索引操作，默认情况下，该操作将仅确保每个分片的主副本在继续之前可用。这意味着，即使 `B` 和 `C` 停止运行，并且 `A` 托管了主分片副本，索引操作仍将仅使用数据的一个副本进行。如果在请求中将 `wait_for_active_shards` 设置为 3（并且所有 3 个节点都已启动），则索引操作将需要 3 个活动分片副本才能继续，这一要求应该得到满足，因为集群中有 3 个活动节点，每个节点都持有分片的副本。但是，如果将 `wait_for_active_shards` 设置为 `all`（或设置为 `4`，这是相同的），索引操作将不会继续，因为索引中没有每个分片的所有 4 个副本。除非集群中出现新节点来托管碎片的第四个副本，否则操作将超时。

需要注意的是，此设置大大降低了写入操作未写入所需数量的分片副本的可能性，但它并没有完全消除这种可能性，因为此检查发生在写入操作开始之前。一旦写入操作正在进行，仍有可能在任意数量的分片拷贝上复制失败，但在主拷贝上仍能成功。写入操作响应的 `_shards` 部分显示了复制成功/失败的分片拷贝数。

```bash
{
  "_shards": {
    "total": 2,
    "failed": 0,
    "successful": 2
  }
}
```

#### 刷新

控制此请求所做的更改对搜索可见的时间。参阅[刷新](/rest_apis/document_apis/refresh)。

#### 空（noop）更新

使用索引 API 更新文档时，即使文档没有更改，也会始终创建文档的新版本。如果这不可接受，请使用将 `detect_noop` 设置为 `true` 的 `_update` API。此选项在索引 API 上不可用，因为索引 API 不获取旧源，并且无法将其与新源进行比较。

关于何时不接受空更新，没有一个硬性规定。这是许多因素的组合，例如数据源发送实际上是节点的更新的频率，以及每秒在接收更新的分片上运行多少 Elasticsearch 查询。

#### 超时

在执行索引操作时，分配给执行索引操作的主分片可能不可用。这可能是因为主分片当前正在从网关恢复或正在重新定位。默认情况下，索引操作将等待主分片可用长达 1 分钟，然后失败并响应错误。`timeout` 参数可用于明确指定等待的时间。以下是将其设置为 5 分钟的示例：

```bash
PUT my-index-000001/_doc/1?timeout=5m
{
  "@timestamp": "2099-11-15T13:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "kimchy"
  }
}
```

#### 版本控制

每个索引文档都有一个版本号。默认情况下，使用内部版本控制，从 1 开始，每次更新时递增，包括删除。或者，版本号可以设置为外部值（例如，如果在数据库中维护）。要启用此功能，应将 `version_type` 设置为 `external`。提供的值必须是一个大于或等于 0 且小于 9.2e+18 左右的长数值。

使用外部版本类型时，系统会检查传递给索引请求的版本号是否大于当前存储文档的版本。如果为真，则将为文档编制索引并使用新版本号。如果提供的值小于或等于存储文档的版本号，则会发生版本冲突，索引操作将失败。例如：

```bash
PUT my-index-000001/_doc/1?version=2&version_type=external
{
  "user": {
    "id": "elkbee"
  }
}
```

:::note 提示
版本控制是完全实时的，不受搜索操作的近实时方面的影响。如果未提供版本，则执行操作时不进行任何版本检查。
:::

在前面的示例中，操作将成功，因为提供的版本 2 高于当前文档版本 1。如果文档已经更新，并且其版本设置为 2 或更高，索引命令将失败并导致冲突（409  http状态代码）。

一个好的副作用是，只要使用源数据库中的版本号，就不需要维护由于源数据库更改而执行的异步索引操作的严格顺序。如果使用外部版本控制，即使使用数据库中的数据更新 Elasticsearch 索引的简单情况也会得到简化，因为如果索引操作出于任何原因出现故障，则只会使用最新版本。

#### 版本类型

除了 `external` 版本类型外，Elasticsearch 还支持针对特定用例的其他类型：

- `external` 或 `external_gt`

  仅当给定版本严格高于存储文档的版本或没有现有文档时，才为文档编制索引。给定的版本将用作新版本，并与新文档一起存储。提供的版本必须是非负的长数字。

- `external_gte`

  仅当给定版本等于或高于存储文档的版本时，才为文档编制索引。如果没有现有文档，操作也会成功。给定的版本将用作新版本，并与新文档一起存储。提供的版本必须是非负的长数字。

  :::note 提示
  `external_gte` 版本类型用于特殊用例，应谨慎使用。如果使用不当，可能会导致数据丢失。还有另一个选项，`force`，不推荐使用，因为它会导致主分片和副本分片分离。
  :::

## 示例

将 JSON 文档插入 `my-index-000001` 索引，其 `_id` 为 1:

```bash
PUT my-index-000001/_doc/1
{
  "@timestamp": "2099-11-15T13:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "kimchy"
  }
}
```

此 API 返回以下结果：

```bash
{
  "_shards": {
    "total": 2,
    "failed": 0,
    "successful": 2
  },
  "_index": "my-index-000001",
  "_id": "1",
  "_version": 1,
  "_seq_no": 0,
  "_primary_term": 1,
  "result": "created"
}
```

如果不存在具有该 ID 的文档，请使用 `_create` 资源将文档索引到 `my-index-000001` 索引中：

```bash
PUT my-index-000001/_create/1
{
  "@timestamp": "2099-11-15T13:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "kimchy"
  }
}
```

如果不存在具有该 ID 的文档，请设置要创建的 `op_type` 参数，以将文档索引到 `my-index-000001` 索引中：

```bash
PUT my-index-000001/_doc/1?op_type=create
{
  "@timestamp": "2099-11-15T13:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "kimchy"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html)
