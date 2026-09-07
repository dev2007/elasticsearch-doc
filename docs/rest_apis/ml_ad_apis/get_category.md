# 获取类别 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索一个或多个类别的异常检测作业结果。

## 请求

```bash
GET _ml/anomaly_detectors/<job_id>/results/categories
```

```bash
GET _ml/anomaly_detectors/<job_id>/results/categories/<category_id>
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

当作业配置中指定了 `categorization_field_name` 时，可以查看生成的类别定义。类别定义描述了匹配的公共词项，并包含匹配值的示例。

分类分析的异常结果以桶、影响因素和记录结果的形式提供。例如，结果可能表明在 16:45 时日志消息类别 11 的数量异常。然后你可以查看该类别的描述和示例。有关更多信息，请参阅[日志消息分类](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-log-message-categorization.html)。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

- `<category_id>`

  （可选，长整数）类别的标识符，在作业中唯一。如果不指定类别 ID 和 `partition_field_value`，API 返回所有类别的信息。如果仅指定 `partition_field_value`，返回指定分区的所有类别信息。

## 查询参数

- `from`

  （可选，整数）跳过指定数量的类别。默认为 0。

- `partition_field_value`

  （可选，字符串）仅返回指定分区的类别。

- `size`

  （可选，整数）指定获取的类别的最大数量。默认为 100。

## 请求体

你也可以在请求体中指定 `partition_field_value` 查询参数。

- `page`

  （可选，对象）

  `page` 的属性：

  - `from`

    （可选，整数）跳过指定数量的类别。默认为 0。

  - `size`

    （可选，整数）指定获取的类别的最大数量。默认为 100。

## 响应体

API 返回类别对象数组，每个对象具有以下属性：

- `category_id`

  （无符号整数）类别的唯一标识符。`category_id` 在作业级别唯一，即使启用了按分区分类也是如此。

- `examples`

  （数组）匹配该类别的实际值示例列表。

- `grok_pattern`

  :::::warning 技术预览

  此功能处于技术预览阶段，可能会在未来的版本中更改或移除。Elastic 会努力修复任何问题，但技术预览中的功能不受正式 GA 功能的支持 SLA 约束。

  ::::

  （字符串）可在 Logstash 或摄取管道中使用的 Grok 模式，用于从匹配该类别的消息中提取字段。此字段是实验性的，可能会在未来的版本中更改或移除。发现的 Grok 模式并非最优，但通常是手动调整的良好起点。

- `job_id`

  （字符串）异常检测作业的标识符。

- `max_matching_length`

  （无符号整数）匹配该类别的字段的最大长度。此值增加 10%，以使类似但尚未分析的字段也能匹配。

- `partition_field_name`

  （字符串）如果启用了按分区分类，此属性标识用于分段分类的字段。禁用按分区分类时不出现此属性。

- `partition_field_value`

  （字符串）如果启用了按分区分类，此属性标识该类别的 `partition_field_name` 值。禁用按分区分类时不出现此属性。

- `regex`

  （字符串）用于搜索匹配该类别的值的正则表达式。

- `terms`

  （字符串）该类别值中匹配的公共 token 的空格分隔列表。

- `num_matches`

  （长整数）已被此类别匹配的消息数量。仅在作业执行 `_flush` 或 `_close` 后保证具有最新准确计数。

- `preferred_to_categories`

  （列表）当前类别涵盖的 `category_id` 条目列表。分类器处理的任何新消息将匹配此类别，而不匹配此列表中的任何类别。仅在作业执行 `_flush` 或 `_close` 后保证具有最新准确的类别列表。

## 示例

```json
GET _ml/anomaly_detectors/esxi_log/results/categories
{
  "page": {
    "size": 1
  }
}
```

API 返回以下结果：

```json
{
  "count": 11,
  "categories": [
    {
      "job_id": "esxi_log",
      "category_id": 1,
      "terms": "Vpxa verbose vpxavpxaInvtVm opID VpxaInvtVmChangeListener Guest DiskInfo Changed",
      "regex": ".*?Vpxa.+?verbose.+?vpxavpxaInvtVm.+?opID.+?VpxaInvtVmChangeListener.+?Guest.+?DiskInfo.+?Changed.*",
      "max_matching_length": 154,
      "examples": [
        "Oct 19 17:04:44 esxi1.acme.com Vpxa: [3CB3FB90 verbose 'vpxavpxaInvtVm' opID=WFU-33d82c31] [VpxaInvtVmChangeListener] Guest DiskInfo Changed",
        "Oct 19 17:04:45 esxi2.acme.com Vpxa: [3CA66B90 verbose 'vpxavpxaInvtVm' opID=WFU-33927856] [VpxaInvtVmChangeListener] Guest DiskInfo Changed",
        "Oct 19 17:04:51 esxi1.acme.com Vpxa: [FFDBAB90 verbose 'vpxavpxaInvtVm' opID=WFU-25e0d447] [VpxaInvtVmChangeListener] Guest DiskInfo Changed",
        "Oct 19 17:04:58 esxi2.acme.com Vpxa: [FFDDBB90 verbose 'vpxavpxaInvtVm' opID=WFU-bbff0134] [VpxaInvtVmChangeListener] Guest DiskInfo Changed"
      ],
      "grok_pattern": ".*?%{SYSLOGTIMESTAMP:timestamp}.+?Vpxa.+?%{BASE16NUM:field}.+?verbose.+?vpxavpxaInvtVm.+?opID.+?VpxaInvtVmChangeListener.+?Guest.+?DiskInfo.+?Changed.*"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-category.html)
