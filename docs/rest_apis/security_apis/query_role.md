# 查询角色 API

以分页方式获取角色。角色管理 API 通常是管理角色的首选方式，而不是使用基于文件的角色管理。查询角色 API **不会**检索角色文件中定义的角色，也不会检索内置角色。你可以选择使用查询过滤结果。结果可以分页和排序。

```txt
POST /_security/_query/role
GET /_security/_query/role
```

## 前置条件

- 要使用此 API，你必须至少具有 `read_security` [集群权限](../security_privileges/cluster_privileges)。

## 请求体

`query`

（可选，对象）用于过滤要返回的角色的查询。如果省略，等效于 `match_all` 查询。支持的查询类型子集：**match_all、bool、term、terms、match、ids、prefix、wildcard、exists、range、simple_query_string**。

可查询字段：`name`、`description`、`metadata`、`applications.application`、`applications.privileges`、`applications.resources`。

查询类型说明：

- **match** — 返回匹配所提供文本、数字、日期或布尔值的角色；文本在匹配前会被分析。
- **prefix** — 返回在所提供字段中包含特定前缀的角色。
- **range** — 返回包含在所提供范围内的词项的角色。
- **term** — 返回包含精确词项的角色（必须精确匹配，包括空格和大小写）。
- **wildcard** — 返回包含匹配通配符模式的词项的角色。

`from`

（可选，数字）起始文档偏移量。不能为负数。默认为 `0`。默认情况下，使用 `from`/`size` 无法翻页超过 10000 个命中；使用 `search_after` 进行更深层次的分页。

`sort`

（可选，字符串或对象或数组）排序定义。可以按以下字段排序：`name`、`description`、`metadata`、`applications.application`、`applications.privileges`、`applications.resources` 或 `_doc`（索引顺序）。排序选项包括 `_score`、`_doc`、`_geo_distance`（含 `ignore_unmapped`）、`_script`。

`size`

（可选，数字）要返回的命中数。不能为负数。默认为 `10`。与 `from` 相同的 10000 个命中的分页限制。

`search_after`

（可选，数组）search after 定义（用于超出 10000 个命中限制的键集分页）。

## 响应体

`total`

（必需，数字）找到的角色总数。

`count`

（必需，数字）响应中返回的角色数量。

`roles`

（必需，对象数组）匹配的角色列表，在角色定义的基础上扩展了 `transient_metadata.enabled` 和 `_sort` 字段。角色对象属性包括：

- `name`（必需，字符串）角色的名称。

- `cluster`（字符串数组）角色可以执行的集群权限。

- `indices`（对象数组）索引权限条目：`names`、`privileges`（必需，索引级权限）、`field_security`、`query`、`allow_restricted_indices`（默认 `false`）。

- `remote_indices`（对象数组）远程集群的索引权限：`clusters`、`field_security`、`names`、`privileges`、`query`、`allow_restricted_indices`。

- `remote_cluster`（对象数组）远程集群的集群权限（有限子集）：`clusters`、`privileges`（有效值为 `monitor_enrich` 或 `monitor_stats`）。

- `global`（对象）请求感知的集群权限；包含用于 ES|QL 数据源访问的 `data_source` 条目。

- `applications`（对象数组）应用程序权限条目：`application`（必需）、`privileges`（必需）、`resources`（必需）。

- `metadata`（对象）可选元数据。以 `_` 开头的键保留供系统使用。

- `run_as`（字符串数组）角色可以模拟的用户。

- `description`（字符串）可选的角色描述。

- `restriction`（对象）限制角色描述符生效的条件：`workflows`（必需，字符串数组）。角色限制要求使用单个角色描述符创建的 API 密钥。

- `transient_metadata`（对象）包含 `enabled`；当角色被自动禁用时（例如，安装的许可证不允许的权限）设置为 `false`。

- `_sort`（数组）当查询按字段排序时出现；包含用于排序的值。

## 示例

以下示例列出所有角色并按名称排序：

```json
POST /_security/_query/role
{
  "sort": [ "name" ]
}
```

响应示例（`total` 为 2，两个角色都返回）：

```json
{
  "total": 2,
  "count": 2,
  "roles": [
    {
      "name": "my_admin_role",
      "cluster": [ "all" ],
      "indices": [
        {
          "names": [ "index1", "index2" ],
          "privileges": [ "all" ],
          "field_security": { "grant": [ "title", "body" ] },
          "allow_restricted_indices": false
        }
      ],
      "applications": [],
      "run_as": [ "other_user" ],
      "metadata": { "version": 1 },
      "transient_metadata": { "enabled": true },
      "description": "Grants full access to all management features within the cluster.",
      "_sort": [ "my_admin_role" ]
    },
    {
      "name": "my_user_role",
      "cluster": [],
      "indices": [
        {
          "names": [ "index1", "index2" ],
          "privileges": [ "all" ],
          "field_security": { "grant": [ "title", "body" ] },
          "allow_restricted_indices": false
        }
      ],
      "applications": [],
      "run_as": [],
      "metadata": { "version": 1 },
      "transient_metadata": { "enabled": true },
      "description": "Grants user access to some indicies.",
      "_sort": [ "my_user_role" ]
    }
  ]
}
```

以下示例按描述查询角色（由于 `size` 为 1，仅返回最佳匹配，`total` 为 2 但 `count` 为 1）：

```json
POST /_security/_query/role
{
  "query": {
    "match": {
      "description": {
        "query": "user access"
      }
    }
  },
  "size": 1
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-query-role.html)
