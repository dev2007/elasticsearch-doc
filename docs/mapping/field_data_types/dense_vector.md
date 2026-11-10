# dense_vector 字段类型

`dense_vector` 字段类型存储由数值组成的稠密向量。稠密向量字段主要用于 k 近邻（kNN）搜索。

`dense_vector` 类型不支持聚合或排序。

你可以基于 `element_type` 将 `dense_vector` 字段添加为一个数值数组，默认为 `float`：

```bash
PUT my-index
{
  "mappings": {
    "properties": {
      "my_vector": {
        "type": "dense_vector",
        "dims": 3
      },
      "my_text" : {
        "type" : "keyword"
      }
    }
  }
}

PUT my-index/_doc/1
{
  "my_text" : "text1",
  "my_vector" : [0.5, 10, 6]
}

PUT my-index/_doc/2
{
  "my_text" : "text2",
  "my_vector" : [-0.5, 10, 10]
}
```

与大多数其他数据类型不同，稠密向量始终是单值的。无法在一个 `dense_vector` 字段中存储多个值。

## 为 kNN 搜索索引向量

k 近邻（kNN）搜索通过相似度度量找出与查询向量最接近的 k 个向量。

稠密向量字段可用于在 `script_score` 查询中对文档排名。这让你可以通过扫描所有文档并按相似度排名来执行暴力（brute-force）kNN 搜索。

在许多情况下，暴力 kNN 搜索的效率不够高。因此，`dense_vector` 类型支持将向量索引到专门的数据结构中，以通过搜索 API 的 `knn` 选项支持快速的 kNN 检索。

大小在 128 到 4096 之间的未映射的 float 元素数组字段会被动态映射为 `dense_vector`，默认相似度为 cosine。你可以通过将字段显式映射为具有所需相似度的 `dense_vector` 来覆盖默认相似度。

稠密向量字段默认启用索引，并以 `int8_hnsw` 方式索引。启用索引后，你可以定义在 kNN 搜索中使用的向量相似度：

```bash
PUT my-index-2
{
  "mappings": {
    "properties": {
      "my_vector": {
        "type": "dense_vector",
        "dims": 3,
        "similarity": "dot_product"
      }
    }
  }
}
```

为近似 kNN 搜索索引向量是一个昂贵的过程。摄取启用了索引的向量字段的文档可能需要大量时间。参阅[k近邻（kNN）搜索](/search/search/knn)了解内存需求的更多信息。

你可以通过将 `index` 参数设置为 `false` 来禁用索引：

```bash
PUT my-index-2
{
  "mappings": {
    "properties": {
      "my_vector": {
        "type": "dense_vector",
        "dims": 3,
        "index": false
      }
    }
  }
}
```

Elasticsearch 使用 HNSW 算法来支持高效的 kNN 搜索。与大多数 kNN 算法一样，HNSW 是一种牺牲结果准确性以换取速度提升的近似方法。

## 为 kNN 搜索自动量化向量

`dense_vector` 类型支持量化，以减少搜索浮点向量时所需的内存占用。支持以下三种量化策略：

- `int8` — 将向量的每个维度量化为 1 字节整数。这可将内存占用减少 75%（即 4 倍），代价是一定的准确性损失。
- `int4` — 将向量的每个维度量化为半字节整数。这可将内存占用减少 87%（即 8 倍），代价是准确性损失。
- `bbq` — 更好的二进制量化（Better binary quantization），将每个维度缩减为单比特精度。这可将内存占用减少 96%（即 32 倍），但准确性损失更大。通常，在查询时进行过采样（oversampling）和重排序（rerank）可以帮助缓解准确性损失。

使用量化格式时，你可能希望对结果进行过采样和重新评分以提高准确性。参阅过采样和重新评分的更多信息。

要使用量化的索引，你可以将索引类型设置为 `int8_hnsw`、`int4_hnsw` 或 `bbq_hnsw`。索引浮点向量时，当前的默认索引类型是 `int8_hnsw`。

量化向量可以使用过采样和重新评分来提高近似 kNN 搜索结果的准确性。

量化会在数据的整个生命周期内继续将原始浮点向量值保留在磁盘上，用于重排序、重索引以及未来的量化改进。这意味着由于存储量化和原始向量的开销，磁盘占用会增加：int8 约 25%，int4 约 12.5%，bbq 约 3.1%。

`int4` 量化要求向量维度数为偶数。

`bbq` 量化仅支持大于 64 的向量维度数。

以下是如何创建字节量化索引的示例：

```bash
PUT my-byte-quantized-index
{
  "mappings": {
    "properties": {
      "my_vector": {
        "type": "dense_vector",
        "dims": 3,
        "index": true,
        "index_options": {
          "type": "int8_hnsw"
        }
      }
    }
  }
}
```

以下是如何创建半字节量化索引的示例：

```bash
PUT my-byte-quantized-index
{
  "mappings": {
    "properties": {
      "my_vector": {
        "type": "dense_vector",
        "dims": 4,
        "index": true,
        "index_options": {
          "type": "int4_hnsw"
        }
      }
    }
  }
}
```

以下是如何创建二进制量化索引的示例：

```bash
PUT my-byte-quantized-index
{
  "mappings": {
    "properties": {
      "my_vector": {
        "type": "dense_vector",
        "dims": 64,
        "index": true,
        "index_options": {
          "type": "bbq_hnsw"
        }
      }
    }
  }
}
```

## 稠密向量字段的参数

接受以下映射参数：

- `element_type`
  （可选，字符串）用于编码向量的数据类型。支持的数据类型为 `float`（默认）、`byte` 和 `bit`。

  `element_type` 的有效值：

  - `float`：每个维度索引一个 4 字节浮点值。这是默认值。
  - `byte`：每个维度索引一个 1 字节整数值。
  - `bit`：每个维度索引一个比特。适用于非常高维的向量或专门支持比特向量的模型。注意：使用 `bit` 时，维度数必须是 8 的倍数，并且必须表示比特的数量。

- `dims`
  （可选，整数）向量维度的数量。不能超过 4096。如果未指定 `dims`，它将被设置为添加到该字段的第一个向量的长度。
- `index`
  （可选，Boolean）如果为 `true`，你可以使用 kNN 搜索 API 搜索此字段。默认为 `true`。
- `similarity`
  （可选*，字符串）kNN 搜索中使用的向量相似度度量。文档按其向量字段与查询向量的相似度排名。每个文档的 `_score` 将从相似度推导而来，确保分数为正数且分数越大排名越高。当 `element_type: bit` 时默认为 `l2_norm`，否则默认为 `cosine`。

  *此参数只能在 `index` 为 `true` 时指定。

  比特向量只支持 `l2_norm` 作为相似度度量。

  `similarity` 的有效值：

  - `l2_norm`：基于向量之间的 L2 距离（也称为欧几里得距离）计算相似度。文档 `_score` 的计算公式为 `1 / (1 + l2_norm(query, vector)^2)`。

    对于比特向量，使用向量之间的汉明距离代替 `l2_norm`。`_score` 转换公式为 `(numBits - hamming(a, b)) / numBits`。
  - `dot_product`：计算两个单位向量的点积。此选项提供了执行余弦相似度的优化方式。约束条件和计算得出的分数由 `element_type` 决定。

    当 `element_type` 为 `float` 时，所有向量必须是单位长度，包括文档向量和查询向量。文档 `_score` 的计算公式为 `(1 + dot_product(query, vector)) / 2`。

    当 `element_type` 为 `byte` 时，所有向量必须具有相同的长度（包括文档向量和查询向量），否则结果将不准确。文档 `_score` 的计算公式为 `0.5 + (dot_product(query, vector) / (32768 * dims))`，其中 `dims` 是每个向量的维度数。
  - `cosine`：计算余弦相似度。在索引期间，Elasticsearch 会自动将使用 cosine 相似度的向量归一化为单位长度。这允许在内部使用更高效的 `dot_product` 来计算相似度。原始的未归一化向量仍然可以通过脚本访问。文档 `_score` 的计算公式为 `(1 + cosine(query, vector)) / 2`。余弦相似度不允许零模长的向量，因为在这种情况下余弦没有定义。
  - `max_inner_product`：计算两个向量的最大内积。这类似于 `dot_product`，但不要求向量归一化。这意味着每个向量的模长会显著影响分数。文档 `_score` 经过调整以防止出现负值。当 max_inner_product 值 < 0 时，`_score` 为 `1 / (1 + -1 * max_inner_product(query, vector))`。对于非负的 max_inner_product 结果，`_score` 的计算方式为 `max_inner_product(query, vector) + 1`。

  尽管 `similarity` 参数在概念上相关，但它不同于 [text 字段的相似度](/mapping/mapping_parameters/similarity)，并接受一组不同的选项。

- `index_options`
  （可选*，对象）配置 kNN 索引算法的可选部分。HNSW 算法有两个影响数据结构构建方式的内部参数。可以调整它们以提高结果的准确性，但代价是较慢的索引速度。

  *此参数只能在 `index` 为 `true` 时指定。

  `index_options` 的属性：

  - `type`
    （必需，字符串）要使用的 kNN 算法类型。可以是以下任意一种：

    - `hnsw`：使用 HNSW 算法进行可扩展的近似 kNN 搜索。支持所有 `element_type` 值。
    - `int8_hnsw`：浮点向量的默认索引类型。在 `element_type` 为 `float` 时，除了 HNSW 算法之外还使用自动标量量化，进行可扩展的近似 kNN 搜索。这可以将内存占用减少 4 倍，代价是一定的准确性损失。参阅[为 kNN 搜索自动量化向量](#为-knn-搜索自动量化向量)。
    - `int4_hnsw`：在 `element_type` 为 `float` 时，除了 HNSW 算法之外还使用自动标量量化，进行可扩展的近似 kNN 搜索。这可以将内存占用减少 8 倍，代价是一定的准确性损失。参阅[为 kNN 搜索自动量化向量](#为-knn-搜索自动量化向量)。
    - `bbq_hnsw`：在 `element_type` 为 `float` 时，除了 HNSW 算法之外还使用自动二进制量化，进行可扩展的近似 kNN 搜索。这可以将内存占用减少 32 倍，代价是准确性损失。参阅[为 kNN 搜索自动量化向量](#为-knn-搜索自动量化向量)。
    - `flat`：使用暴力搜索算法进行精确 kNN 搜索。支持所有 `element_type` 值。
    - `int8_flat`：在暴力搜索算法之外还使用自动标量量化。只支持 `element_type` 为 `float`。
    - `int4_flat`：在暴力搜索算法之外还使用自动半字节标量量化。只支持 `element_type` 为 `float`。
    - `bbq_flat`：在暴力搜索算法之外还使用自动二进制量化。只支持 `element_type` 为 `float`。

  - `m`
    （可选，整数）HNSW 图中每个节点将连接到的邻居数量。默认为 16。仅适用于 `hnsw`、`int8_hnsw`、`int4_hnsw` 和 `bbq_hnsw` 索引类型。
  - `ef_construction`
    （可选，整数）在为每个新节点组装最近邻居列表时要跟踪的候选数量。默认为 100。仅适用于 `hnsw`、`int8_hnsw`、`int4_hnsw` 和 `bbq_hnsw` 索引类型。
  - `confidence_interval`
    （可选，浮点数）仅适用于 `int8_hnsw`、`int4_hnsw`、`int8_flat` 和 `int4_flat` 索引类型。量化向量时使用的置信区间。可以是介于 0.90 和 1.0 之间（含）的任何值，或恰好为 0。当值为 0 时，表示将计算动态分位数以进行优化量化。当值介于 0.90 和 1.0 之间时，此值限制计算量化阈值时使用的值。例如，值 0.95 表示计算量化阈值时只使用中间的 95% 的值（例如，将忽略最高和最低的 2.5% 的值）。对于 int8 量化向量，默认为 `1/(dims + 1)`；对于 int4，默认为 0 以进行动态分位数计算。

## 合成 _source

`dense_vector` 字段支持合成 `_source`。

## 索引和搜索比特向量

使用 `element_type: bit` 时，所有向量都会被视为比特向量。比特向量每个维度只使用一个比特，并在内部编码为字节。这非常适合非常高维的向量或模型。

使用 `bit` 时，维度数必须是 8 的倍数，并且必须表示比特的数量。此外，对于比特向量，典型的向量相似度值实际上都以相同的方式评分，例如汉明距离。

让我们比较两个 `byte[]` 数组，每个数组代表 40 个比特。

`[-127, 0, 1, 42, 127]` 的比特表示 `1000000100000000000000010010101001111111`

`[127, -127, 0, 1, 42]` 的比特表示 `0111111110000001000000000000000100101010`

比较这两个比特向量时，我们首先计算汉明距离。

异或（xor）结果：

```
1000000100000000000000010010101001111111
^
0111111110000001000000000000000100101010
=
1111111010000001000000010010101101010101
```

然后，统计异或结果中 1 比特的数量：18。为了缩放评分，我们用总比特数减去它并除以总比特数：`(40 - 18) / 40 = 0.55`。这就是这两个向量之间的 `_score`。

以下是索引和搜索比特向量的示例：

```bash
PUT my-bit-vectors
{
  "mappings": {
    "properties": {
      "my_vector": {
        "type": "dense_vector",
        "dims": 40,
        "element_type": "bit"
      }
    }
  }
}

# 表示 40 比特维度向量的 5 个字节
# 表示 40 比特维度向量的十六进制字符串
POST /my-bit-vectors/_bulk?refresh
{"index": {"_id" : "1"}}
{"my_vector": [127, -127, 0, 1, 42]}
{"index": {"_id" : "2"}}
{"my_vector": "8100012a7f"}
```

然后，在搜索时，你可以使用 `knn` 查询来搜索相似的比特向量：

```bash
POST /my-bit-vectors/_search?filter_path=hits.hits
{
  "query": {
    "knn": {
      "query_vector": [127, -127, 0, 1, 42],
      "field": "my_vector"
    }
  }
}
```

```json
{
    "hits": {
        "hits": [
            {
                "_index": "my-bit-vectors",
                "_id": "1",
                "_score": 1.0,
                "_source": {
                    "my_vector": [
                        127,
                        -127,
                        0,
                        1,
                        42
                    ]
                }
            },
            {
                "_index": "my-bit-vectors",
                "_id": "2",
                "_score": 0.55,
                "_source": {
                    "my_vector": "8100012a7f"
                }
            }
        ]
    }
}
```

## 可更新的字段类型

为了更好地满足扩展和性能需求，可以通过更新映射 API 更新 `index_options` 中的 `type` 设置，允许的转换路径如下：

```
flat --> int8_flat --> int4_flat --> hnsw --> int8_hnsw --> int4_hnsw
```

更新所有 HNSW 类型（`hnsw`、`int8_hnsw`、`int4_hnsw`）时，连接数 `m` 必须保持不变或增加。对于标量量化格式（`int8_flat`、`int4_flat`、`int8_hnsw`、`int4_hnsw`），`confidence_interval` 必须始终保持一致（一旦定义就不能更改）。

在所有其他情况下，更新 `index_options` 中的 `type` 都会失败。

切换类型不会重新索引已经索引的向量（它们将继续使用其原始类型），在更改之后被索引的向量将改用新类型。

例如，可以先定义一个使用 `flat` 类型（原始 float32 数组）的稠密向量字段，用于第一批要索引的数据：

```bash
PUT my-index-000001
{
    "mappings": {
        "properties": {
            "text_embedding": {
                "type": "dense_vector",
                "dims": 384,
                "index_options": {
                    "type": "flat"
                }
            }
        }
    }
}
```

将类型更改为 `int4_hnsw` 可确保更改后索引的向量使用 int4 标量量化表示和 HNSW（例如用于 kNN 查询）。这包括通过合并先前创建的段而创建的新段。

```bash
PUT /my-index-000001/_mapping
{
    "properties": {
        "text_embedding": {
            "type": "dense_vector",
            "dims": 384,
            "index_options": {
                "type": "int4_hnsw"
            }
        }
    }
}
```

在此更改之前索引的向量将继续使用 `flat` 类型（原始 float32 表示和用于 kNN 查询的暴力搜索）。

为了将所有向量更新为新类型，应使用重新索引或强制合并。

出于调试目的，可以使用索引段 API 检查每种类型存在多少个段（和文档）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/dense-vector.html)
