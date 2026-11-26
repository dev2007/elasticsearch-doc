# MinHash 词元过滤器

使用 MinHash 技术为词元流生成签名（signature）。MinHash 签名可用于估算文档之间的相似度。

min_hash 过滤器按顺序对词元流执行以下操作：

1. 对流中的每个词元进行哈希（hash）
2. 将哈希值分配到各个桶（bucket）中，每个桶只保留最小的哈希值
3. 从每个桶中输出最小的哈希值，形成新的词元流

此过滤器使用 Lucene 的 MinHashFilter。

## 配置 min_hash 过滤器

min_hash 过滤器的输入词元通常应由 [shingle 词元过滤器](/text_analysis/analysis_shingle_tokenfilter)生成的 `k` 个词的 shingle（词组）组成：

- `k` 应足够大，使某个 shingle 出现在文档中的概率较低。
- 同时 `k` 应足够小，因为每个 shingle 会被哈希为 128 位哈希，`k` 太大会导致不同 shingle 之间的哈希冲突。

建议测试不同的 `hash_count`、`bucket_count` 和 `hash_set_size` 参数组合：

- 要提高精确率（precision），可增大 `bucket_count` 或 `hash_set_size`。更高的值使不同词元更可能被分配到不同的桶。
- 要提高召回率（recall），可增大 `hash_count`，例如设为 `2`，这会以两种方式对每个词元进行哈希，从而增加候选数量。

默认情况下，min_hash 过滤器为每个文档生成 512 个词元，每个词元 16 字节，即每个文档体积约增加 8KB。

min_hash 过滤器用于 [Jaccard 相似度](https://en.wikipedia.org/wiki/Jaccard_index)，它只关心文档是否包含某个词元，而不关心该词元包含的次数。

## 可配置参数

- `bucket_count`

  （可选，整数）哈希值分配到的桶的数量。默认为 `512`。

- `hash_count`

  （可选，整数）对流中每个词元进行哈希的方式数量。默认为 `1`。

- `hash_set_size`

  （可选，整数）从每个桶中保留的哈希数量。哈希按升序保留，从桶中最小的哈希开始。默认为 `1`。

- `with_rotation`

  （可选，布尔值）如果为 `true`，当 `hash_set_size` 为 `1` 时，过滤器会用其右侧循环方向上第一个非空桶的值填充空桶。

  当 `bucket_count` 大于 `1` 时，此参数默认为 `true`；否则默认为 `false`。

## 示例

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用两个自定义词元过滤器配置一个新的自定义分析器：

- `my_shingle_filter`：自定义 shingle 过滤器，只输出五个词的 shingle。
- `my_minhash_filter`：自定义 min_hash 过滤器，对流中的每个五词 shingle 哈希一次，将哈希值分配到 512 个桶，并从每个桶中仅保留最小的哈希值。

该请求还将此自定义分析器分配给了 `fingerprint` 字段映射：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "filter": {
        "my_shingle_filter": {
          "type": "shingle",
          "min_shingle_size": 5,
          "max_shingle_size": 5,
          "output_unigrams": false
        },
        "my_minhash_filter": {
          "type": "min_hash",
          "hash_count": 1,
          "bucket_count": 512,
          "hash_set_size": 1,
          "with_rotation": true
        }
      },
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "filter": [ "my_shingle_filter", "my_minhash_filter" ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "fingerprint": {
        "type": "text",
        "analyzer": "my_analyzer"
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-minhash-tokenfilter.html)
