# Elasticsearch 文档翻译格式规约

> 本规约基于项目已翻译文档与 Elasticsearch 官方原页面的对比分析整理而成，作为后续翻译工作的标准参考。
> 与 `docs/vocabulary.md`（术语对照表）配合使用：本规约管**格式**，术语表管**用词**。

---

## 目录

- [一、翻译工作流程](#一翻译工作流程)
- [二、标题层级映射](#二标题层级映射)
- [三、章节名称翻译对照](#三章节名称翻译对照)
- [四、代码块规则](#四代码块规则)
- [五、告示框（Admonition）](#五告示框admonition)
- [六、参数描述格式](#六参数描述格式)
- [七、链接处理规则](#七链接处理规则)
- [八、表格格式](#八表格格式)
- [九、特殊元素处理](#九特殊元素处理)
- [十、翻译质量要求](#十翻译质量要求)
- [十一、术语一致性规则](#十一术语一致性规则)
- [十二、翻译 Prompt 模板](#十二翻译-prompt-模板)

---

## 一、翻译工作流程

每次翻译任务按以下步骤执行，**不得跳过任何环节**：

### 步骤 1：确定翻译目标

- 确认待翻译的文档在 Elastic 官方文档中的 URL（如 `https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-nodes-info.html`）
- 确认目标 Markdown 文件在项目中的路径（如 `docs/rest_apis/cluster_apis/nodes_info.md`）
- 路径规则：`docs/` + 官方文档 URL 中 `reference/8.18/` 之后的部分，将连字符路径改为下划线目录 + 文件名

### 步骤 2：获取原文并翻译

- 从 Elastic 官方文档网站获取原文 HTML 内容
- 按照[本规约](#二标题层级映射)的格式规则进行 HTML → Markdown 转换和中文翻译
- 生成 `.md` 文件，写入对应的 `docs/` 子目录

### 步骤 3：注册侧边栏

- 在 `sidebars.js` 中找到该文档所属的分类（category）
- 将文档 ID（相对于 `docs/` 的路径，不含扩展名）添加到对应 `items` 数组中
- 文档 ID 示例：`"rest_apis/cluster_apis/nodes_info"`
- 添加位置应与官方文档的目录顺序保持一致

### 步骤 4：更新 README 翻译进度

- 在 `README.md` 的「文档列表及进度」中找到对应条目
- 将未翻译的英文标题替换为中文标题
- 在标题前添加 `:heavy_check_mark:` 标记
- 添加在线阅读链接，格式为 `[:link:](https://elasticsearch.bookhub.tech/<路由路径>.html)`
- 路由路径示例：`rest_apis/cluster_apis/nodes_info`

### 步骤 5：编译验证

- 执行 `npm run build` 进行编译
- 确认无报错（broken links 仅 warn 可接受，但应尽量修复）

### 步骤 6：Git 暂存

- 编译成功后，执行 `git add` 将新增的 `.md` 文件暂存
- 仅 add 本次翻译生成的 `.md` 文件，不包含 `sidebars.js`、`README.md` 等其他修改
- 命令示例：`git add docs/rest_apis/cluster_apis/nodes_reload_secure_settings.md`

### 步骤 7：提示用户检查

- 编译和 Git 暂存成功后，**提示用户检查翻译结果**

### 流程示例

```
目标：翻译 cluster-nodes-info.html
├─ 1. 原文 URL：https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-nodes-info.html
├─ 2. 生成文件：docs/rest_apis/cluster_apis/nodes_info.md
├─ 3. sidebars.js：在 "集群 API" category 的 items 中添加 "rest_apis/cluster_apis/nodes_info"
├─ 4. README.md：将 "Nodes info" 改为 "✅ 节点信息 API [:link:](https://elasticsearch.bookhub.tech/rest_apis/cluster_apis/nodes_info.html)"
├─ 5. 执行 npm run build 验证
├─ 6. 执行 git add docs/rest_apis/cluster_apis/nodes_info.md
└─ 7. 提示用户：「翻译完成，请检查 docs/rest_apis/cluster_apis/nodes_info.md」
```

---

## 二、标题层级映射

### 基本规则

| 官方 HTML 标签 | Markdown 输出 | 说明 |
|:--|:--|:--|
| `<h1>` | `#` | 文档标题，每篇文档仅一个 |
| `<h2>` | `##` | 主要章节（请求、描述、参数等） |
| `<h3>` | `###` | 子章节 |
| `<h4>` | `####` | 更细分级 |
| `<h5>` | `#####` | 最细分级 |

### 提级规则

如果原文**不存在 `<h1>` 标签**，则所有标题**提升一级**：

| 官方 HTML 标签 | 正常输出 | 提级输出（无 h1 时） |
|:--|:--|:--|
| `<h2>` | `##` | `#` |
| `<h3>` | `###` | `##` |
| `<h4>` | `####` | `###` |
| `<h5>` | `#####` | `####` |

### 示例

```
原文：
<h1>Nodes info API</h1>
<h2>Request</h2>
<h3>Path parameters</h3>

译文：
# 节点信息 API
## 请求
### 路径参数
```

### 忽略的元素

- `<a class="edit_me">` 及其包裹的内容：**完全删除**，不保留不翻译
- `<a class="edit_me edit_me_private">`：同上

---

## 三、章节名称翻译对照

以下为 Elastic 官方文档中常见的章节名称及其标准中文翻译，**翻译时必须使用此对照表中的译法**：

| 官方英文名称 | 标准中文翻译 | 备注 |
|:--|:--|:--|
| Request | 请求 | |
| Prerequisites | 前置条件 | 统一用「前置条件」，不使用「先决条件」 |
| Description | 描述 | |
| Path parameters | 路径参数 | |
| Query parameters | 查询参数 | |
| Request body | 请求体 | |
| Response body | 响应体 | |
| Examples | 示例 | |
| Response codes | 响应码 | |
| Headers | 请求头 | |
| Authorization | 授权 | |
| URL parameters | URL 参数 | |
| Path parameter | 路径参数 | 单数形式同复数 |
| Query parameter | 查询参数 | 单数形式同复数 |

> **注意**：历史翻译中存在「先决条件」与「前置条件」混用的情况（如 `cluster_health.md` 用「前置条件」，`nodes_info.md` 用「先决条件」）。新翻译统一使用**「前置条件」**。

---

## 四、代码块规则

### 语言标记选择

| 内容类型 | 语言标记 | 示例 |
|:--|:--|:--|
| HTTP 请求（GET/PUT/POST/DELETE） | `bash` | ` ```bash ` |
| JSON 响应/请求体 | `json` | ` ```json ` |
| YAML 配置 | `yaml` | ` ```yaml ` |
| Java 代码 | `java` | ` ```java ` |
| Groovy 代码 | `groovy` | ` ```groovy ` |
| Kotlin 代码 | `kotlin` | ` ```kotlin ` |
| 命令行操作 | `bash` | ` ```bash ` |

### 删除的内容

- **多语言客户端代码**（Ruby、Python、JavaScript 客户端调用代码）：**全部删除**，仅保留原始 HTTP 请求
- `<a class="edit_me">` 编辑链接：删除

### 多示例代码块

当官方文档中连续出现多个独立的 HTTP 请求示例时，合并为一个代码块，每行添加 `#` 注释说明：

````markdown
```bash
# 仅返回进程信息
GET /_nodes/process
# 同上
GET /_nodes/_all/process
# 仅返回 nodeId1 和 nodeId2 的 jvm 和进程信息
GET /_nodes/nodeId1,nodeId2/jvm,process
```
````

### 代码块后的编号说明

如果代码块中包含编号标记（如 `// 1`），在代码块下方使用有序列表解释每一项：

````markdown
```bash
PUT _cluster/settings
{
  "persistent": {
    "action.auto_create_index": "my-index-000001,index10,-index1*,+ind*" 
  }
}
```

1. `"action.auto_create_index": "my-index-000001,index10,-index1*,+ind*"`：允许自动创建名为 `my-index-000001`或 `index10` 的索引...
2. `"action.auto_create_index": "false"`：完全禁用自动索引创建。
3. `"action.auto_create_index": "true"`：允许自动创建任何索引。这是默认设置。
````

### 行内代码

- `<code class="literal">content</code>` → `` `content` ``（**不加粗**，不使用 `**`）
- `<code>content</code>` → `` `content` ``
- HTTP 方法名（GET、POST、PUT、DELETE）在正文中使用行内代码标记

---

## 五、告示框（Admonition）

### 语法格式

Docusaurus 使用 `:::` 语法定义告示框。根据告示框所处的层级选择冒号数量：

| 场景 | 语法 | 说明 |
|:--|:--|:--|
| 顶层告示（文档正文级别） | 4 个冒号 | 项目统一标准，无论内容单段落还是多段落 |
| 嵌套告示（列表项内部等缩进位置） | 3 个冒号 | 仅在缩进位置嵌套使用时 |

> **项目约定**：本项目中顶层告示统一使用 4 个冒号，无论内容是单段落还是多段落。仅在列表项等缩进位置嵌套使用时才用 3 个冒号。

### 类型映射

| 官方 HTML class | Docusaurus 类型 | 中文标题 | 用途 |
|:--|:--|:--|:--|
| `<div class="sidebar">` | `info` | 根据原标题翻译 | 信息提示、新版参考 |
| `<div class="note admon">` | `note` | 提示 | 注意事项 |
| `<div class="tip admon">` | `tip` | 注意 | 建议性提示 |
| `<div class="warning admon">` | `warning` | 警告 | 警告信息 |
| `<div class="caution admon">` | `caution` | 警告 | 谨慎操作 |
| `<div class="important admon">` | `danger` | 重要 | 重要提醒 |

> **注意**：历史翻译中 `note` 存在「提示」与「注意」混用的情况（如 `delete_by_query.md` 用「注意」）。新翻译统一使用**「提示」**。

> **重要**：翻译时必须仔细识别原文中的告示框（Note、Warning、Tip 等），**不得遗漏**。原文描述章节中嵌入的 Note 段落也必须转换为对应的告示框格式，不得作为普通正文处理。

### 转换示例

**示例 1：信息提示（新版 API 参考）**

使用 4 个冒号的 `info` 告示框：

- 开头：4 个冒号 + `info` + 空格 + 标题
- 结尾：4 个冒号

**示例 2：警告**

使用 4 个冒号的 `warning` 告示框，标题为「警告」。

**示例 3：提示**

使用 4 个冒号的 `note` 告示框，标题为「提示」。

**示例 4：谨慎操作**

使用 4 个冒号的 `caution` 告示框，标题为「警告」。

**示例 5：嵌套告示（列表项内部）**

当告示框位于列表项内部（缩进位置）时，使用 3 个冒号：

- 列表项内容
  - 3 个冒号 + `note` + 空格 + `提示`
  - 告示内容
  - 3 个冒号结束

### 特殊 sidebar 告示转换

官方文档中的 sidebar 告示结构：

```html
<div class="sidebar">
  <div class="titlepage"><div><div>
    <p class="title"><strong>$title</strong></p>
  </div></div></div>
  <p>$content</p>
</div>
```

转换为 4 个冒号的 `info` 告示框：

- 开头：4 个冒号 + `info` + 空格 + `$title`
- 内容：`$content`
- 结尾：4 个冒号

---

## 六、参数描述格式

### 标准格式

参数描述使用无序列表，参数名用行内代码标记，描述另起一行缩进：

````markdown
- `param_name`

  （可选，字符串）参数描述文本。
````

### 类型词翻译

| 官方英文 | 中文翻译 | 示例 |
|:--|:--|:--|
| Required | 必需 | （必需，字符串） |
| Optional | 可选 | （可选，字符串） |
| string | 字符串 | （可选，字符串） |
| Boolean | 布尔值 | （可选，布尔值） |
| integer | 整数 | （可选，整数） |
| float | 浮点数 | （可选，浮点数） |
| enum | 枚举 | （可选，枚举） |
| time units | [时间单位](/rest_apis/api_convention/common_options#时间单位) | 带站内链接 |
| object | 对象 | （可选，对象） |
| array | 数组 | （可选，数组） |
| date | 日期 | （可选，日期） |

### 参数层次结构

参数的子选项通过缩进的无序列表表示：

````markdown
- `<metric>`

  （可选，字符串）将返回的信息限制在特定的指标。支持逗号分隔的列表，例如 `http,ingest`。

  - `<metric>` 的有效值

    - `aggregations`

      有关可用聚合类型的信息。

    - `http`

      有关此节点 HTTP 接口的信息。
````

### 格式要点

1. 参数名与描述之间**空一行**
2. 描述行缩进 2 个空格（与 `-` 对齐的内容缩进）
3. 子级列表再缩进 2 个空格
4. 每个参数的描述为一个完整的段落
5. **必须使用 `-` 前缀**，不得遗漏（历史翻译中 `nodes_info.md` 的 `flat_settings` 和 `timeout` 参数缺少 `-` 前缀和缩进，属于格式错误）
6. **所有参数章节均须分行**：路径参数（Path parameters）、查询参数（Query parameters）和响应体（Response body）中的每个参数，参数名与描述之间必须分行（空一行 + 缩进），不得将参数名和描述写在同一行

### 前置条件格式

前置条件使用无序列表，可包含子项：

````markdown
## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。
````

> **注意**：前置条件中出现的「集群权限」**必须添加站内链接**，链接地址为 `/secure_the_elastic_statck/user_authorization/security_privileges#集群权限`，与项目中所有已翻译文件保持一致。不得遗漏链接。

---

## 七、链接处理规则

### 站内链接

将官方文档的内部链接转换为项目内的**相对路径**：

| 官方链接 | 转换规则 | 项目内链接示例 |
|:--|:--|:--|
| 同模块文档 | `/` + 模块路径 | `/rest_apis/cluster_apis/cluster_apis` |
| 跨模块文档 | `/` + 目标模块路径 | `/set_up_elasticsearch/configuring_elasticsearch/indexing_buffer_settings` |
| 锚点链接 | 锚点翻译为中文 | `#时间单位` |

**锚点翻译规则**：
- Docusaurus 的 `write-heading-ids` 插件会根据标题文本自动生成锚点
- 中文标题的锚点就是中文文本本身（如标题「时间单位」的锚点为 `#时间单位`）
- 原文 `#time-units` → 译文 `#时间单位`

### 站外链接

保留原始 URL，链接文本翻译为中文：

````markdown
[Levenshtein编辑距离](https://en.wikipedia.org/wiki/Levenshtein_distance)
````

### 链接文本

- 链接文本必须翻译为中文
- 术语类链接文本参照 `docs/vocabulary.md` 术语对照表

### 原文链接（末尾固定）

每篇翻译文档的**最后一行**必须添加原文链接：

````markdown
> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-nodes-info.html)
````

**URL 版本规则**：
- 8.18 版本固定文档：使用版本化路径 `/reference/8.18/`
- current 版本文档：使用 `/reference/current/`
- 具体使用哪个路径取决于翻译时参考的官方文档 URL

---

## 八、表格格式

### 无表头双列表格

官方文档中的定义列表（术语-解释对）转换为无表头的双列 Markdown 表格：

````markdown
|||
|:--|:--|
|`d`|天|
|`h`|小时|
|`m`|分钟|
|`s`|秒|
|`ms`|毫秒|
|`micros`|微秒|
|`nanos`|纳秒|
````

### 有表头表格

如果原表格有明确的表头，保留表头并翻译：

````markdown
| 参数 | 类型 | 说明 |
|:--|:--|:--|
| `name` | 字符串 | 插件名称 |
| `version` | 字符串 | Elasticsearch 版本 |
````

### 表格对齐

- 左对齐使用 `|:--|`
- 文本列左对齐，数值列可右对齐 `|--:|`

---

## 九、特殊元素处理

### 废弃标记

官方文档中的废弃标记转换为 Markdown 删除线 + 中文说明：

````markdown
- `include_type_name`
  [~~7.0.0~~开始不推荐] （可选，布尔值）如果为 `true`，映射体中需要映射类型。
````

### 状态词双语标注

集群状态等枚举值保留英文原文并附中文注释：

````markdown
`green`（绿色）、`yellow`（黄色）或 `red`（红色）
````

### 上标/下标

使用 HTML 标签保留（Markdown 不原生支持上下标）：

````markdown
|`k`|千（10<sup>3</sup>）|
|`m`|兆（百万 10<sup>6</sup>）|
````

### 换行标记

官方文档中的 `<br />` 转换为 Markdown 换行（行尾两个空格或 `<br/>`）：

````markdown
`AUTO` 应该是 `fuzziness` 首选值。<br/>根据词语的长度生成编辑距离。
````

### 注释行

代码块中的注释保留并翻译为中文：

````bash
# 仅返回进程信息
GET /_nodes/process
````

### 自动编号列表

官方文档中 `<ol>` 有序列表转换为 Markdown 有序列表，编号从 1 开始：

````markdown
1. 只能是小写字符
2. 不能包含字符：`\`、`/`、`*`、`?`、`"`、`<`、`>`、`|`、` `(空格)、`,`、`#`
3. 7.0 之前索引可以包含冒号（:），但在 7.0 之后不推荐。
````

### 数字格式

正文中的数字使用中文习惯，不使用英文千分位逗号分隔。代码块和 JSON 示例中的数字不受此限制。

````markdown
❌ 此 API 最多返回 10,000 个作业。
✅ 此 API 最多返回 10000 个作业。
````

---

## 十、翻译质量要求

### 翻译原则

遵循「**信达雅**」标准：

1. **信**：准确传达原文含义，不遗漏信息，不添加原文没有的内容
2. **达**：符合中文表达习惯，语句通顺，避免翻译腔
3. **雅**：用词得体，行文流畅，专业术语统一

### 禁止事项

- **不得**保留未转换的 HTML 标签（除 `<sup>`、`<br/>` 等必要标签外）
- **不得**翻译 HTML 标签及属性
- **不得**保留多语言客户端代码（Ruby/Python/JavaScript）
- **不得**保留 `edit_me` 编辑链接
- **不得**在输出中添加额外解释说明（翻译结果直接输出，不附带「以下是翻译内容」等前言）
- **不得**遗漏原文链接

### 口语化要求

- 避免「被」字句过度使用，中文偏好主动语态
- 避免「的」字过度堆叠
- 长句适当拆分为短句
- 专业术语保持一致，参照 `docs/vocabulary.md`

---

## 十一、术语一致性规则

### 术语对照

参照 `docs/vocabulary.md` 中的术语对照表。当前已收录的术语：

| 英文 | 中文 |
|:--|:--|
| cluster | 集群 |
| index | 索引 |
| ingest | 摄取 |
| reindex | 重索引，重新索引 |
| scroll | 滚动 |
| shard | 分片 |
| slice | 切片，切分 |
| slicing | 切片 |

### 常见术语翻译参考

以下为翻译中高频出现的术语及其推荐译法：

| 英文 | 推荐中文 | 备注 |
|:--|:--|:--|
| node | 节点 | |
| cluster | 集群 | |
| index | 索引 | |
| shard | 分片 | |
| replica | 副本 | |
| mapping | 映射 | |
| aggregation | 聚合 | |
| query | 查询 | |
| filter | 过滤器/过滤 | 作名词时用「过滤器」，作动词时用「过滤」 |
| pipeline | 管道 | |
| processor | 处理器 | |
| snapshot | 快照 | |
| routing | 路由 | |
| allocation | 分配 | |
| recovery | 恢复 | |
| refresh | 刷新 | |
| flush | 冲刷 | |
| merge | 合并 | |
| timeout | 超时 | |
| privilege | 权限 | |
| data stream | 数据流 | |
| template | 模板 | |
| alias | 别名 | |
| bulk | 批量 | |
| thread pool | 线程池 | |

### 新增术语

翻译过程中遇到 `docs/vocabulary.md` 中未收录的术语时：
1. 先查阅已有翻译文档中的用法
2. 选择最通行的译法
3. 记录到 `docs/vocabulary.md` 中

---

## 十二、翻译 Prompt 模板

以下模板整合了上述所有规则，可直接用于翻译任务：

```text
你是一位 Elasticsearch 文档翻译专家。请将提供的 Elasticsearch 官方 HTML 文档翻译为中文 Markdown 文档，遵循以下规则：

## 格式转换规则

1. 保留符合 Markdown 格式的 HTML 结构：仅将 HTML 标签转换为对应的 Markdown 格式，标签本身及属性不保留且不翻译
2. 标题层级映射：
   - 如果原文存在 <h1>，则 <h1> 对应 #，<h2> 对应 ##，<h3> 对应 ###，以此类推
   - 如果原文不存在 <h1>，则所有标题提升一级：<h2> 对应 #，<h3> 对应 ##，以此类推
   - 翻译标题文本
3. 忽略 <a class="edit_me"> 及 <a class="edit_me edit_me_private"> 标签及其包裹的内容
4. 代码块处理：
   - HTTP 请求（GET/PUT/POST/DELETE）使用 bash 标记
   - JSON 内容使用 json 标记
   - <code>content</code> 转换为行内代码 `content`
   - <code class="literal">content</code> 转换后不加粗
   - 多语言客户端代码（Ruby/Python/JavaScript）全部删除
5. 告示框转换：
   - 顶层告示使用 4 个冒号，嵌套告示（列表项内部）使用 3 个冒号
   - 必须仔细识别原文中的所有告示框（Note、Warning、Tip 等），不得遗漏
   - 原文描述章节中嵌入的 Note 段落也必须转换为告示框，不得作为普通正文处理
   - <div class="sidebar"> 结构转换为 info 类型告示框，标题根据原文翻译
   - <div class="warning admon"> 转换为 warning 类型，标题为「警告」
   - <div class="note admon"> 转换为 note 类型，标题为「提示」
   - <div class="tip admon"> 转换为 tip 类型，标题为「注意」
   - <div class="caution admon"> 转换为 caution 类型，标题为「警告」
   - <div class="important admon"> 转换为 danger 类型，标题为「重要」
6. 参数描述格式：
   - 使用无序列表，参数名用行内代码
   - 格式：减号 + 空格 + 反引号 + 参数名 + 反引号，空行后缩进 2 空格写描述
   - 描述格式：（可选/必需，类型）描述文本
   - 类型翻译：string 对应 字符串, Boolean 对应 布尔值, integer 对应 整数, enum 对应 枚举
   - 路径参数、查询参数和响应体中的所有参数，参数名与描述必须分行（空一行 + 缩进），不得写在同一行
7. 前置条件中的权限必须添加站内链接：
   - 集群权限：[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)
   - 索引权限：[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)
8. 链接处理：
   - 站内链接转为相对路径（如 /rest_apis/cluster_apis/cluster_apis）
   - 锚点翻译为中文（如 #time-units 转为 #时间单位）
   - 站外链接保留原 URL，链接文本翻译
9. 表格：无表头双列表使用空表头 + |:--|:--| 格式
10. 状态词双语标注：green（绿色）、yellow（黄色）、red（红色）
11. 废弃标记：[~~版本号~~开始不推荐]
12. 章节名称翻译对照：
    - Request 对应 请求, Prerequisites 对应 前置条件, Description 对应 描述
    - Path parameters 对应 路径参数, Query parameters 对应 查询参数
    - Request body 对应 请求体, Response body 对应 响应体, Examples 对应 示例
13. 数字格式：正文中的数字使用中文习惯，不使用英文千分位逗号分隔（如 `10,000` 应写为 `10000`）。代码块和 JSON 示例中的数字不受此限制。

## 翻译质量要求

- 遵循「信达雅」标准：准确、通顺、优雅
- 口语化自然表达，专业术语准确，行文优雅流畅
- 完全避免机器翻译痕迹
- 避免过度使用「被」字句和「的」字堆叠
- 长句适当拆分为短句

## 输出要求

- 直接输出转换后的 Markdown 结果
- 不添加任何解释说明
- 保持原始文档的层级结构
- 确保格式转换完整准确
- 在文档最后添加一行：> [原文链接](${原文URL})

## 禁止事项

- 不得翻译 HTML 标签及属性
- 不得保留未转换的 HTML 标签（sup、br 除外）
- 不得保留多语言客户端代码
- 不得在输出中添加额外解释说明

请直接输出符合要求的 Markdown 格式翻译结果。
```

### 使用方式

1. 将上述 Prompt 模板中的 `${原文URL}` 替换为实际的 Elastic 官方文档 URL
2. 将 Elastic 官方文档的 HTML 内容提供给 AI
3. AI 输出的 Markdown 内容直接写入 `docs/` 对应目录的 `.md` 文件
4. 按照翻译工作流程完成后续步骤（注册侧边栏、更新 README、编译验证）
