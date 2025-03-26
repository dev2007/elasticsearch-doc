# 集群 API

:::info 新 API 参考
有关最新 API 的详细信息，参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

## 节点规范

某些集群级 API 可在节点子集上运行，这些节点子集可通过*节点过滤器*指定。例如，[任务管理](./task_management)、[节点统计](./cluster_stats) 和 [节点信息](./nodes_info) API 都可以报告经过筛选的节点集而非全部节点的结果。

*节点过滤器*是以逗号分隔的单个过滤器列表形式编写的，每个过滤器都可从所选子集中添加或删除节点。每个过滤器可以是以下其中之一：

- `_all`，将所有节点添加到子集中。
- `_local`，将本地节点添加到子集中。
- `_master`，将当前选中的主节点加入子集。
- 节点 ID 或名称，将该节点添加到子集中。
- IP 地址或主机名，将所有匹配的节点添加到子集中。
- 模式，使用 `*` 通配符，将名称、地址或主机名与该模式匹配的所有节点添加到子集中。
- `master:true`，`data:true`，`ingest:true`，`voting_only:true`，`ml:true` 或 `coordinating_only:true`，分别将所有符合主节点资格的节点、所有数据节点、所有摄取节点、所有仅投票节点、所有机器学习节点和所有仅协调节点添加到子集中。
- `master:false`，`data:false`，`ingest:false`，`voting_only:false`，`ml:false` 或 `coordinating_only:false`，分别从子集中移除所有符合主节点资格的节点、所有数据节点、所有摄取节点、所有仅投票节点、所有机器学习节点和所有仅协调节点。
- 模式对，使用 `*` 通配符，其形式为 `attrname:attrvalue`，用于将名称和值符合相应模式的自定义节点属性添加到子集中。[自定义节点属性](/set_up_elasticsearch/configuring_elasticsearch/node_settings#自定义节点属性)是通过在配置文件中设置形式为 `node.attr.attrname:attrvalue` 的属性来配置的。

:::note 提示
节点过滤器的运行顺序，这一点在使用从节点集中移除节点的过滤器时非常重要。例如，`_all,master:false` 表示除符合主节点条件的节点外的所有节点，但 `master:false,_all` 的意思与 `_all` 相同，因为 `_all` 过滤器在 `master:false` 过滤器之后运行。
:::

:::note 提示
如果没有给出筛选条件，默认情况下会选择所有节点。但是，如果给定了任何筛选器，它们就会从一个空的所选子集开始运行。这意味着，`master:false` 等从所选子集中移除节点的筛选器只有在其他筛选器之后才有用。单独使用时，`master:false` 不会选择任何节点。
:::

下面是节点过滤器与节点信息 API 配合使用的一些示例。

```bash
# If no filters are given, the default is to select all nodes
GET /_nodes
# Explicitly select all nodes
GET /_nodes/_all
# Select just the local node
GET /_nodes/_local
# Select the elected master node
GET /_nodes/_master
# Select nodes by name, which can include wildcards
GET /_nodes/node_name_goes_here
GET /_nodes/node_name_goes_*
# Select nodes by address, which can include wildcards
GET /_nodes/10.0.0.3,10.0.0.4
GET /_nodes/10.0.0.*
# Select nodes by role
GET /_nodes/_all,master:false
GET /_nodes/data:true,ingest:true
GET /_nodes/coordinating_only:true
GET /_nodes/master:true,voting_only:false
# Select nodes by custom attribute (e.g. with something like `node.attr.rack: 2` in the configuration file)
GET /_nodes/rack:2
GET /_nodes/ra*:2
GET /_nodes/ra*:2*
```



> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster.html)
