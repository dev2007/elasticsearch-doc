# 机器学习训练模型 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

你可以使用以下 API 来执行模型管理操作：

- [清除训练模型部署缓存 API](./clear_deployment_cache)
- [创建训练模型 API](./put_trained_models)
- [创建训练模型部分 API](./put_trained_model_definition_part)
- [创建训练模型词表 API](./put_trained_model_vocabulary)
- [创建或更新训练模型别名 API](./put_trained_model_aliases)
- [删除训练模型 API](./delete_trained_models)
- [删除训练模型别名 API](./delete_trained_model_aliases)
- [获取训练模型 API](./get_trained_models)
- [获取训练模型统计 API](./get_trained_models_stats)
- [推理训练模型 API](./infer_trained_model)
- [启动训练模型部署 API](./start_trained_model_deployment)
- [停止训练模型部署 API](./stop_trained_model_deployment)
- [更新训练模型部署 API](./update_trained_model_deployment)

你可以部署训练模型以在摄取管道或聚合中进行预测。有关更多信息，请参阅以下文档：

- [推理桶聚合](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-aggregations-bucket-inference-aggregation.html)
- [推理处理器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/inference-processor.html)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-df-trained-models-apis.html)
