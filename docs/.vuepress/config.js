module.exports = {
  title: 'Elasticsearch 中文文档',
  description: '基于 v7.11 官方文档开始翻译，持续翻译中',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'keywords', content: 'Elastic,Elasticsearch,ElasticStack,ELK,Document,docs,文档,中文文档,入门' }],
	  ['script',{src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8380975615223941',crossorigin: 'anonymous'}]
  ],
  base: '/',
  markdown: {
    lineNumbers: true
  },
  plugins: [
    [
      '@vuepress/google-analytics', {
        'ga': 'UA-226868573-4'
      }
    ],
    [
      '@renovamen/vuepress-plugin-baidu-tongji', {
        'ba': '085b01fdb8056cdc09e3d19350818e33'
      }
    ]
  ],
  themeConfig: {
    logo: '/favicon.ico',
    sidebarDepth: 3,
    displayAllHeaders: true,
    nav: [
      { text: 'BookHub 首页', link: 'https://www.bookhub.tech' },
      { text: '中文文档', link: 'https://docs.bookhub.tech' },
      { text: '计算机书库', link: 'https://pdf.bookhub.tech' },
      { text: 'GitHub', link: 'https://github.com/dev2007/elasticsearch-doc' }
    ],
    sidebar: [
      ["/","Elasticsearch 翻译说明"],
      {
        title: '什么是 Elasticsearch？',
        path: '/intro',
        children: [
          '/intro/datain',
          '/intro/inforout',
          ['/intro/scalability', '可伸缩性和弹性']
        ]
      },
      {
        title: 'Elasticsearch 入门',
        path: '/getting_started',
        children: [
          ['/getting_started/install', '启动并运行 Elasticsearch'],
          ['/getting_started/esindex', '索引一些文档'],
          ['/getting_started/search', '开始搜索'],
          ['/getting_started/aggregations', '使用聚合分析结果'],
          ['/getting_started/nextstep', '何去何从']
        ]
      },
      {
        title: '设置 Elasticsearch',
        path: '/set_up_elasticsearch',
        children: [
          {
            title: '安装 Elasticsearch',
            path: '/set_up_elasticsearch/installing_elasticsearch/',
            children: [
              ['/set_up_elasticsearch/installing_elasticsearch/linux', '在 Linux 或 MacOS 上用压缩包安装 Elasticsearch'],
              ['/set_up_elasticsearch/installing_elasticsearch/windows', '在 Windows 上用 `.zip` 安装 Elasticsearch'],
              ['/set_up_elasticsearch/installing_elasticsearch/debian', '使用 Debian 包安装 Elasticsearch'],
              ['/set_up_elasticsearch/installing_elasticsearch/rpm', '使用 RPM 安装 Elasticsearch'],
              ['/set_up_elasticsearch/installing_elasticsearch/msi', '使用 Windows MSI 安装程序安装 Elasticsearch'],
              ['/set_up_elasticsearch/installing_elasticsearch/docker', '使用 Docker 安装 Elasticsearch'],
              ['/set_up_elasticsearch/installing_elasticsearch/brew', '使用 Homebrew 在 macOS 上安装 Elasticsearch']
            ]
          },
          {
            title: '配置 Elasticsearch',
            path: '/set_up_elasticsearch/configuring_elasticsearch',
            children: [
              ['/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration', '重要的 Elasticsearch 配置'],
              ['/set_up_elasticsearch/configuring_elasticsearch/secure_settings', '安全设置'],
              ['/set_up_elasticsearch/configuring_elasticsearch/auditing_settings', '审计安全设置'],
              ['/set_up_elasticsearch/configuring_elasticsearch/circuit_breaker_settings','断路器设置'],
              ['/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings','集群级分片分配和路由设置'],
              ['/set_up_elasticsearch/configuring_elasticsearch/cross_cluster_replication_settings','跨集群复制设置'],
              ['/set_up_elasticsearch/configuring_elasticsearch/discovery_and_cluster_formation_settings','发现和集群组成设置'],
              ['/set_up_elasticsearch/configuring_elasticsearch/field_data_cache_settings','字段数据缓存设置'],
              ['/set_up_elasticsearch/configuring_elasticsearch/health_diagnostic_settings_in_elasticsearch','Elasticsearch 中的健康诊断设置']
            ]
          }
        ]
      },
      {
        title: '索引模块',
        path: '/index_modules',
        children: [
          ['/index_modules/analysis', '分析'],
          {
            title: '索引分片分配',
            path: '/index_modules/index_shard_allocation',
            children: [
              ['/index_modules/index_shard_allocation/shard_allocation_filtering', '索引级分片分配过滤'],
              ['/index_modules/index_shard_allocation/delaying_allocation', '当节点离开时延迟分配'],
              ['/index_modules/index_shard_allocation/index_recovery_prioritization', '索引恢复优先级'],
              ['/index_modules/index_shard_allocation/total_shards_per_node', '每节点分片总数'],
              ['/index_modules/index_shard_allocation/data_tier_allocation_filtering', '索引级数据层分配过滤']
            ]
          },
          ['/index_modules/index_blocks', '索引块'],
          ['/index_modules/mapper', '映射器']
        ]
      },
      {
        title: 'REST API',
        path: '/rest_apis',
        children: [
          {
            title: 'API 约定',
            path: '/rest_apis/api_convention',
            children: [
              ['/rest_apis/api_convention/multi_target_syntax', '多目标语法'],
              ['/rest_apis/api_convention/date_math_support_in_index_names', '索引名中的日期数学支持'],
              ['/rest_apis/api_convention/cron_expressions', 'Cron 表达式'],
              ['/rest_apis/api_convention/common_options', '常用选项'],
              ['/rest_apis/api_convention/url-based_access_control', '基于 URL 的访问控制']
            ]
          },
          {
            title: '自动伸缩 API',
            path: '/rest_apis/autoscaling_apis',
            children: [
              ['/rest_apis/autoscaling_apis/create_or_update_autoscaling_policy', '创建或更新自动伸缩策略'],
              ['/rest_apis/autoscaling_apis/get_autoscaling_capacity', '获取自动伸缩容量'],
              ['/rest_apis/autoscaling_apis/delete_autoscaling_policy', '删除自动伸缩策略'],
              ['/rest_apis/autoscaling_apis/get_autoscaling_policy', '获取自动伸缩策略']
            ]
          },
          {
            title: '文档 API',
            path: '/rest_apis/document_apis',
            children: [
              ['/rest_apis/document_apis/esindex', '索引 API']
            ]
          },
          {
            title: '索引 API',
            path: '/rest_apis/index_apis',
            children: [
              ['/rest_apis/index_apis/alias_exists', '别名存在'],
              ['/rest_apis/index_apis/aliases', '别名'],
              ['/rest_apis/index_apis/analyze', '分析'],
              ['/rest_apis/index_apis/analyze_index_disk_usage', '分析索引磁盘的使用'],
              ['/rest_apis/index_apis/clear_cache', '清除缓存'],
              ['/rest_apis/index_apis/clone_index', '复制索引'],
              ['/rest_apis/index_apis/close_index', '关闭索引'],
              ['/rest_apis/index_apis/create_index', '创建索引'],
              ['/rest_apis/index_apis/create_or_update_index_alias', '创建或更新索引别名'],
              ['/rest_apis/index_apis/create_or_update_component_template', '创建或更新组件模板'],
              ['/rest_apis/index_apis/create_or_update_index_template', '创建或更新索引模板'],
              ['/rest_apis/index_apis/delete_component_template', '删除组件模板'],
              ['/rest_apis/index_apis/delete_dangling_index', '删除悬空索引'],
              ['/rest_apis/index_apis/delete_index_alias', '删除索引别名'],
              ['/rest_apis/index_apis/delete_index', '删除索引'],
              ['/rest_apis/index_apis/delete_index_template', '删除索引模板'],
              ['/rest_apis/index_apis/index_exists', '索引存在'],
              ['/rest_apis/index_apis/flush', '冲刷'],
              ['/rest_apis/index_apis/force_merge', '强制合并'],
              ['/rest_apis/index_apis/freeze_index', '冻结索引'],
              ['/rest_apis/index_apis/get_index_alias', '获取索引别名'],
              ['/rest_apis/index_apis/get_component_template', '获取组件模板'],
              ['/rest_apis/index_apis/get_field_mapping', '获取字段映射'],
              ['/rest_apis/index_apis/get_index', '获取索引'],
              ['/rest_apis/index_apis/get_index_settings', '获取索引设置'],
              ['/rest_apis/index_apis/get_index_template', '获取索引模板'],
              ['/rest_apis/index_apis/get_mapping', '获取映射'],
              ['/rest_apis/index_apis/import_dangling_index', '导入悬空索引'],
              ['/rest_apis/index_apis/index_recovery', '索引恢复'],
              ['/rest_apis/index_apis/index_segments', '索引段'],
              ['/rest_apis/index_apis/index_shard_stores', '索引分片存储'],
              ['/rest_apis/index_apis/index_stats', '索引统计'],
              ['/rest_apis/index_apis/list_dangling_indices', '列出悬空索引'],
              ['/rest_apis/index_apis/open_index', '开启索引'],
              ['/rest_apis/index_apis/refresh', '刷新'],
              ['/rest_apis/index_apis/resolve_index', '解析索引'],
              ['/rest_apis/index_apis/rollover_index', '翻转'],
              ['/rest_apis/index_apis/shrink_index', '收缩索引'],
              ['/rest_apis/index_apis/simulate_index', '模拟索引'],
              ['/rest_apis/index_apis/simulate_template', '模拟模板'],
              ['/rest_apis/index_apis/split_index', '拆分索引'],
              ['/rest_apis/index_apis/synced_flush', '同步冲刷'],
              ['/rest_apis/index_apis/type_exists', '类型存在'],
              ['/rest_apis/index_apis/unfreeze_index', '解冻索引'],
              ['/rest_apis/index_apis/update_index_settings', '更新索引设置'],
              ['/rest_apis/index_apis/update_mapping', '更新映射']
            ]
          },
          {
            title: '搜索相关 API',
            path: '/rest_apis/search_apis',
            children: [
              ['/rest_apis/search_apis/search', '搜索'],
              ['/rest_apis/search_apis/multi_search', '多重搜索'],
              ['/rest_apis/search_apis/async_search', '异步搜索'],
              ['/rest_apis/search_apis/point_in_time', '时间点'],
              ['/rest_apis/search_apis/knn_search', 'kNN 搜索'],
              ['/rest_apis/search_apis/suggesters', '建议器'],
              ['/rest_apis/search_apis/terms_enum', '词语枚举'],
              ['/rest_apis/search_apis/scroll', '滚动'],
              ['/rest_apis/search_apis/clear_scroll', '清除滚动'],
              ['/rest_apis/search_apis/explain', '解释'],
              ['/rest_apis/search_apis/field_capabilities', '字段能力'],
              ['/rest_apis/search_apis/profile', '分析'],
              ['/rest_apis/search_apis/ranking_evaluation', '排序评估'],
              ['/rest_apis/search_apis/search_shards', '搜索分片'],
              ['/rest_apis/search_apis/validate', '验证'],
              ['/rest_apis/search_apis/search_template', '搜索模板'],
              ['/rest_apis/search_apis/multi_search_template', '多搜索模板'],
              ['/rest_apis/search_apis/render_search_template', '渲染搜索模板'],
              ['/rest_apis/search_apis/vector_tile_search', '矢量块搜索']
            ]
          }
        ]
      }
    ]

  }
};