# 最大映射数量检查

接上文，为了有效地使用 mmap，Elasticsearch 还需要能够创建许多内存映射区域。最大映射数量检查检查内核是否允许进程拥有至少 262,144 个内存映射区域，并且仅在 Linux 上强制执行。要通过最大映射数量检查，你必须通过 sysctl 将 `vm.max_map_count` 配置为至少 262144。推荐值为 1048576。

或者，只有当你使用 `mmapfs` 或 `hybridfs` 作为索引的存储类型时才需要最大映射数量检查。如果你不允许使用 mmap，则不会强制执行此引导检查。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-max-map-count.html)
