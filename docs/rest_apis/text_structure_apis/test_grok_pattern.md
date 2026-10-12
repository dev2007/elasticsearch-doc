# 测试 Grok 模式 API

测试 Grok 模式 API 允许你在一行或多行文本上执行 Grok 模式。它返回这些文本行是否匹配该模式，以及匹配子字符串的偏移量和长度。

```txt
GET _text_structure/test_grok_pattern
POST _text_structure/test_grok_pattern
```

## 查询参数

`ecs_compatibility`

（可选，字符串）与 ECS 兼容的 Grok 模式的兼容模式。用于指定结构查找器创建 Grok 模式时是否使用 ECS Grok 模式而非旧版模式。有效值为 `disabled` 或 `v1`。默认为 `disabled`。

## 请求体

`grok_pattern`

（必需，字符串）要在文本行上运行的 Grok 模式。

`text`

（必需，字符串数组）要运行 Grok 模式的文本行。

## 响应体

`matches`

与输入 `text` 数组一一对应的数组，每个元素表示对应文本行的匹配结果，包含：

- `matched`（布尔值）：该文本行是否匹配 Grok 模式。
- `fields`（仅当 `matched` 为 `true` 时出现）：以模式中命名的捕获组为键的对象，每个捕获组包含匹配结果的数组，每一项包含：
  - `match`：实际匹配到的子字符串。
  - `offset`：匹配子串在文本行中的起始偏移量（从 0 开始）。
  - `length`：匹配子串的长度。

## 示例

以下示例在两行文本上运行 Grok 模式：

```txt
POST _text_structure/test_grok_pattern
{
  "grok_pattern": "Hello %{WORD:first_name} %{WORD:last_name}",
  "text": [
    "Hello John Doe",
    "this does not match"
  ]
}
```

API 返回以下响应：

```json
{
  "matches": [
    {
      "matched": true,
      "fields": {
        "first_name": [
          {
            "match": "John",
            "offset": 6,
            "length": 4
          }
        ],
        "last_name": [
          {
            "match": "Doe",
            "offset": 11,
            "length": 3
          }
        ]
      }
    },
    {
      "matched": false
    }
  ]
}
```

示例中第一行 `"Hello John Doe"` 匹配成功（`matched` 为 `true`），第二行 `"this does not match"` 匹配失败（`matched` 为 `false`）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/test-grok-pattern.html)
