# 执行快照生命周期策略 API

根据生命周期策略立即创建快照，而无需等待计划的时间。

```txt
PUT /_slm/policy/<snapshot-lifecycle-policy-id>/_execute
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage_slm` 集群权限才能使用此 API。

## 描述

手动应用快照策略以立即创建快照。快照策略通常会根据其时间表被应用，但你可能希望在执行升级或其他维护之前手动执行策略。

快照在**后台**拍摄。你可以使用快照 API 监视快照的状态。

要查看策略最近一次快照的状态，请使用获取快照生命周期策略 API（`GET /_slm/policy/<policy-id>`）。

## 路径参数

`<snapshot-lifecycle-policy-id>`

（必需，字符串）要执行的快照生命周期策略的 ID。

## 响应体

如果成功，请求返回生成的快照名称：

`snapshot_name`

通过执行策略创建的快照的名称（由策略 ID、日期和随机标识符自动生成）。

## 示例

以下示例根据 `daily-snapshots` 策略立即拍摄快照：

```txt
PUT /_slm/policy/daily-snapshots/_execute
```

API 返回以下响应：

```json
{
  "snapshot_name": "daily-snap-2019.04.24-gwrqoo2xtea3q57vvg0uea"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/slm-api-execute-lifecycle.html)
