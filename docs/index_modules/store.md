# 存储

存储模块允许你控制索引数据在磁盘上的存储和访问方式。

:::note 注意

这是一个底层设置。某些存储实现的并发性较差，或禁用了针对堆内存使用的优化。我们建议坚持使用默认值。

:::

## 文件系统存储类型

有不同的文件系统实现或存储类型。默认情况下，Elasticsearch 会根据运行环境选择最佳实现。

存储类型也可以通过在 `config/elasticsearch.yml` 文件中配置存储类型来为所有索引显式设置：

```yaml
index.store.type: hybridfs
```

这是一个**静态设置**，可以在索引创建时按索引设置：

```txt
PUT /my-index-000001
{
  "settings": {
    "index.store.type": "hybridfs"
  }
}
```

:::warning 注意

这是一个仅限专家使用的设置，将来可能会被移除。

:::

### 支持的存储类型

| 类型 | 描述 |
|------|------|
| **fs** | 默认文件系统实现。这将根据运行环境选择最佳实现，当前在所有受支持的系统上都是 `hybridfs`，但可能会有变化。 |
| **simplefs** | 在 7.15 中已弃用："simplefs 已弃用并将在 8.0 中移除。请改用 niofs 或其他文件系统。Elasticsearch 7.15 或更高版本对 simplefs 存储类型使用 niofs，因为它提供优于或等同于 simplefs 的性能。" 简单文件系统类型是文件系统存储的简单实现（映射到 Lucene `SimpleFsDirectory`），使用随机访问文件。此实现的并发性能较差（多线程会成为瓶颈），并禁用了一些针对堆内存使用的优化。 |
| **niofs** | NIO FS 类型使用 NIO 将分片索引存储在文件系统上（映射到 Lucene `NIOFSDirectory`）。它允许多个线程并发读取同一个文件。由于 SUN Java 实现中的一个 bug，不建议在 Windows 上使用，并且它会禁用一些针对堆内存使用的优化。 |
| **mmapfs** | MMap FS 类型通过将文件映射到内存（mmap）将分片索引存储在文件系统上（映射到 Lucene `MMapDirectory`）。内存映射会占用进程中与被映射文件大小相等的部分虚拟内存地址空间。在使用此类之前，请确保你已允许充足的虚拟地址空间。 |
| **hybridfs** | hybridfs 类型是 `niofs` 和 `mmapfs` 的混合体，它根据读取访问模式为每种类型的文件选择最佳的文件系统类型。当前只有 Lucene 词条字典、norms 和文档值文件会被内存映射。所有其他文件使用 Lucene `NIOFSDirectory` 打开。与 `mmapfs` 类似，请确保你已允许充足的虚拟地址空间。 |

### 相关设置：`node.store.allow_mmap`

你可以通过设置 **`node.store.allow_mmap`** 限制 `mmapfs` 和相关的 `hybridfs` 存储类型的使用。这是一个布尔值设置，指示是否允许内存映射。默认为允许。此设置很有用，例如，如果你所处的环境无法控制创建大量内存映射的能力，因此需要禁用使用内存映射的能力。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-modules-store.html)
