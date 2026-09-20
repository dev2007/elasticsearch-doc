# 删除搜索应用 API

:::warning Beta

此功能处于 Beta 阶段，可能会发生更改。其设计和代码不如正式 GA 功能成熟，按「原样」提供，不提供任何担保。Beta 功能不受正式 GA 功能的支持 SLA 约束。

:::

移除一个搜索应用及其关联的别名。**搜索应用附加的索引不会被移除。**

```txt
DELETE _application/search_application/<name>
```

## 前置条件

- 需要 `manage_search_application` [集群权限](../security_privileges/cluster_privileges)。
- 还需要对搜索应用中包含的所有索引具有 `manage` [索引权限](../security_privileges/index_privileges)。

## 路径参数

`<name>`

（必需，字符串）要删除的搜索应用的名称。

## 响应码

- `400`

  未提供名称。

- `404`（资源缺失）

  找不到与名称匹配的搜索应用。

## 示例

以下示例删除名为 `my-app` 的搜索应用：

```txt
DELETE _application/search_application/my-app/
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-search-application.html)
