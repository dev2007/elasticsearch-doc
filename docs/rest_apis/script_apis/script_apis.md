# 脚本 API

使用以下 API 来管理、存储和测试你在 Elasticsearch 中的**脚本**。

::::::info 新版 API 参考

有关最新的 API 详情，请参阅[脚本 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-script)。

::::::

## 脚本支持 API

使用脚本支持 API 获取支持的脚本上下文和语言的列表。

- [获取脚本上下文 API](./get_script_contexts)
- [获取脚本语言 API](./get_script_languages)

## 存储脚本 API

使用存储脚本 API 管理**存储脚本**和**搜索模板**。

- [创建或更新存储脚本 API](./put_stored_script)
- [获取存储脚本 API](./get_stored_script)
- [删除存储脚本 API](./delete_stored_script)

## Painless API

使用 [Painless 执行 API](https://www.elastic.co/guide/en/elasticsearch/painless/8.18/painless-execute-api.html) 在生产环境使用 Painless 脚本之前安全地测试它们。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/script-apis.html)
