# 启动转换 API

启动一个转换。

```txt
POST _transform/<transform_id>/_start
```

## 前置条件

需要以下权限：

- **`manage_transform` 集群权限** — 内置角色 `transform_admin` 授予此权限。

## 描述

- **目标索引创建**：启动转换时，如果目标索引尚不存在，它会创建该索引。`number_of_shards` 被设置为 **1**，`auto_expand_replicas` 被设置为 **0-1**。
- **pivot 转换**：目标索引的映射定义会从源索引和转换聚合中推断得出。如果字段是由脚本派生的（例如 `scripted_metric` 或 `bucket_script` 聚合），则转换会使用**动态映射**（除非存在索引模板）。
- **latest 转换**：映射定义**不会**被推断；会使用动态映射。
- **显式映射**：要使用显式映射，请在启动转换*之前*创建目标索引。或者，创建一个索引模板 — 但它不会影响 pivot 转换中推断的映射。
- **验证**：启动时会进行一系列验证以确保成功。如果在创建转换时验证被延迟，则会在启动转换时进行 — 权限检查除外。
- **安全/角色**：启用 Elasticsearch 安全功能后，转换会记住创建用户在创建时拥有的角色并使用这些相同的角色。如果这些角色缺乏对源索引/目标索引的所需权限，则转换在尝试执行未授权操作时会**失败**。

## 路径参数

`<transform_id>`

（必需，字符串）转换的标识符。

## 查询参数

`from`

（可选，字符串）将转换的实体集限制为在此时间之后发生更改的实体。支持 `now-30d` 等相对时间。**仅适用于持续运行的转换。**

`timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待响应的期限。如果在超时期限到期之前未收到响应，则请求失败并返回错误。

## 响应体

```json
{
  "acknowledged": true
}
```

## 示例

以下示例启动名为 `ecommerce_transform` 的转换：

```txt
POST _transform/ecommerce_transform/_start
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/start-transform.html)
