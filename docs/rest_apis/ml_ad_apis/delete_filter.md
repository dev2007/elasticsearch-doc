# 删除过滤器 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

删除一个过滤器。

## 请求

```bash
DELETE _ml/filters/<filter_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

此 API 删除一个过滤器。如果异常检测作业引用了该过滤器，则无法删除过滤器。必须先更新或删除引用该过滤器的作业，然后才能删除过滤器。有关更多信息，请参阅[自定义规则](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-custom-rules.html)。

## 路径参数

- `<filter_id>`

  （必需，字符串）唯一标识过滤器的字符串。

## 示例

```bash
DELETE _ml/filters/safe_domains
```

过滤器删除后，你收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-delete-filter.html)
