# 机器学习异常检测 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

你可以使用以下 API 来执行机器学习异常检测活动。

另请参阅[机器学习 API](./ml_apis)、[机器学习数据帧分析 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-df-analytics-apis.html) 和[机器学习训练模型 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-trained-model-apis.html)。

## 异常检测作业

- [创建作业 API](./put_job)
- [更新作业 API](./update_job)
- [删除作业 API](./delete_job)
- [获取作业 API](./get_job)
- [获取作业统计 API](./get_job_stats)
- [打开作业 API](./open_job)
- [关闭作业 API](./close_job)
- [向作业推送数据 API](./post_data)
- [刷新作业 API](./flush_job)
- [创建预测 API](./forecast)
- [删除预测 API](./delete_forecast)
- [重置作业 API](./reset_job)
- [估算模型内存 API](./estimate_model_memory)

## 日历

- [创建日历 API](./put_calendar)
- [删除日历 API](./delete_calendar)
- [向日历添加作业 API](./put_calendar_job)
- [从日历删除作业 API](./delete_calendar_job)
- [向日历添加计划事件 API](./post_calendar_event)
- [从日历删除计划事件 API](./delete_calendar_event)
- [获取日历 API](./get_calendar)
- [获取计划事件 API](./get_calendar_event)

## 过滤器

- [创建过滤器 API](./put_filter)
- [更新过滤器 API](./update_filter)
- [删除过滤器 API](./delete_filter)
- [获取过滤器 API](./get_filter)

## 数据源

- [创建数据源 API](./put_datafeed)
- [更新数据源 API](./update_datafeed)
- [删除数据源 API](./delete_datafeed)
- [获取数据源 API](./get_datafeed)
- [获取数据源统计 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-datafeed-stats.html)
- [启动数据源 API](./start_datafeed)
- [停止数据源 API](./stop_datafeed)
- [预览数据源 API](./preview_datafeed)

## 模型快照

- [删除模型快照 API](./delete_snapshot)
- [获取模型快照信息 API](./get_snapshot)
- [获取模型快照升级统计 API](./get_snapshot_upgrade_stats)
- [回滚模型快照 API](./revert_snapshot)
- [更新模型快照 API](./update_snapshot)
- [升级模型快照 API](./upgrade_snapshot)

## 结果

- [获取桶 API](./get_bucket)
- [获取总体桶 API](./get_overall_buckets)
- [获取类别 API](./get_category)
- [获取影响因素 API](./get_influencer)
- [获取记录 API](./get_record)

## 删除过期数据

- [删除过期数据 API](./delete_expired_data)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-ad-apis.html)
