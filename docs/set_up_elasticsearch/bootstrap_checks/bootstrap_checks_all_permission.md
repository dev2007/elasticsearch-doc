# 全部权限检查

全部权限检查确保引导期间使用的安全策略不会向 Elasticsearch 授予 `java.security.AllPermission`。在授予全部权限的情况下运行等同于禁用安全管理器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-all-permission.html)
