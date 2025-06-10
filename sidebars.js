/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    "intro",
    {
      type: 'category',
      label: '什么是 Elasticsearch？',
      link: { type: 'doc', id: "intro/intro" },
      items: [
        'intro/datain',
        'intro/inforout',
        {
          type: 'doc',
          id: 'intro/scalability',
          label: '可伸缩性和弹性'
        }
      ],
    },
    {
      type: 'category',
      label: 'Elasticsearch 入门',
      link: { type: 'doc', id: "getting_started/getting_started" },
      items: [
        'getting_started/install',
        'getting_started/esindex',
        'getting_started/search',
        'getting_started/aggregations',
        'getting_started/nextstep'
      ],
    },
    {
      type: 'category',
      label: '设置 Elasticsearch',
      link: { type: 'doc', id: "set_up_elasticsearch/set_up_elasticsearch" },
      items: [
        {
          type: 'category',
          label: '安装 Elasticsearch',
          link: { type: 'doc', id: "set_up_elasticsearch/installing_elasticsearch/installing_elasticsearch" },
          items: [
            'set_up_elasticsearch/installing_elasticsearch/linux',
            'set_up_elasticsearch/installing_elasticsearch/windows',
            'set_up_elasticsearch/installing_elasticsearch/debian',
            'set_up_elasticsearch/installing_elasticsearch/rpm',
            'set_up_elasticsearch/installing_elasticsearch/msi',
            'set_up_elasticsearch/installing_elasticsearch/docker',
            'set_up_elasticsearch/installing_elasticsearch/brew'
          ]
        },
        {
          type: 'category',
          label: '配置 Elasticsearch',
          link: { type: 'doc', id: "set_up_elasticsearch/configuring_elasticsearch/configuring_elasticsearch" },
          items: [
            'set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration',
            'set_up_elasticsearch/configuring_elasticsearch/secure_settings',
            'set_up_elasticsearch/configuring_elasticsearch/auditing_settings',
            'set_up_elasticsearch/configuring_elasticsearch/circuit_breaker_settings',
            'set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings',
            'set_up_elasticsearch/configuring_elasticsearch/cross_cluster_replication_settings',
            'set_up_elasticsearch/configuring_elasticsearch/discovery_and_cluster_formation_settings',
            'set_up_elasticsearch/configuring_elasticsearch/field_data_cache_settings',
            'set_up_elasticsearch/configuring_elasticsearch/health_diagnostic_settings_in_elasticsearch',
            'set_up_elasticsearch/configuring_elasticsearch/index_lifecycle_management_settings',
            'set_up_elasticsearch/configuring_elasticsearch/index_management_settings',
            'set_up_elasticsearch/configuring_elasticsearch/index_recovery_settings',
            'set_up_elasticsearch/configuring_elasticsearch/indexing_buffer_settings',
            'set_up_elasticsearch/configuring_elasticsearch/license_settings',
            'set_up_elasticsearch/configuring_elasticsearch/local_gateway_settings',
            'set_up_elasticsearch/configuring_elasticsearch/logging',
            'set_up_elasticsearch/configuring_elasticsearch/machine_learning_settings_in_elasticsearch',
            'set_up_elasticsearch/configuring_elasticsearch/monitoring_settings_in_elasticsearch',
            'set_up_elasticsearch/configuring_elasticsearch/node',
            'set_up_elasticsearch/configuring_elasticsearch/networking'
          ]
        },
      ],
    },
    {
      type: 'category',
      label: '索引模块',
      link: { type: 'doc', id: "index_modules/index_modules" },
      items: [
        'index_modules/analysis',
        {
          type: 'category',
          label: '索引分片分配',
          link: { type: 'doc', id: "index_modules/index_shard_allocation/index_shard_allocation" },
          items: [
            'index_modules/index_shard_allocation/shard_allocation_filtering',
            'index_modules/index_shard_allocation/delaying_allocation',
            'index_modules/index_shard_allocation/index_recovery_prioritization',
            'index_modules/index_shard_allocation/total_shards_per_node',
            'index_modules/index_shard_allocation/data_tier_allocation_filtering'
          ]
        },
        'index_modules/index_blocks',
        'index_modules/mapper'
      ]
    },
    {
      type: 'category',
      label: 'REST API',
      link: { type: 'doc', id: "rest_apis/rest_apis" },
      items: [
        {
          type: 'category',
          label: 'API 约定',
          link: { type: 'doc', id: "rest_apis/api_convention/api_convention" },
          items: [
            'rest_apis/api_convention/multi_target_syntax',
            'rest_apis/api_convention/date_math_support_in_index_names',
            'rest_apis/api_convention/cron_expressions',
            'rest_apis/api_convention/common_options',
            'rest_apis/api_convention/url-based_access_control',
          ]
        },
        {
          type: 'category',
          label: '自动伸缩 API',
          link: { type: 'doc', id: "rest_apis/autoscaling_apis/autoscaling_apis" },
          items: [
            'rest_apis/autoscaling_apis/create_or_update_autoscaling_policy',
            'rest_apis/autoscaling_apis/get_autoscaling_capacity',
            'rest_apis/autoscaling_apis/delete_autoscaling_policy',
            'rest_apis/autoscaling_apis/get_autoscaling_policy',
          ]
        },
        {
          type: 'category',
          label: '行为分析 API',
          link: { type: 'doc', id: "rest_apis/behavioral_analytics_apis/behavioral_analytics_apis" },
          items: [
            'rest_apis/behavioral_analytics_apis/put-analytics-collection',
            'rest_apis/behavioral_analytics_apis/delete_analytics_collection',
            'rest_apis/behavioral_analytics_apis/list_analytics_collections',
            'rest_apis/behavioral_analytics_apis/post_analytics_collection_event'
          ]
        },
        {
          type: 'category',
          label: '集群 API',
          link: { type: 'doc', id: "rest_apis/cluster_apis/cluster_apis" },
          items: [
            "rest_apis/cluster_apis/cluster_allocation_explain"
          ]
        },
        {
          type: 'category',
          label: '数据流 API',
          link: { type: 'doc', id: "rest_apis/data_stream_apis/data_stream_apis" },
          items: [
            'rest_apis/data_stream_apis/create_data_stream',
            'rest_apis/data_stream_apis/delete_data_stream',
            'rest_apis/data_stream_apis/get_data_stream',
            'rest_apis/data_stream_apis/migrate_to_data_stream',
            'rest_apis/data_stream_apis/data_stream_stats',
            'rest_apis/data_stream_apis/promote_data_stream',
            'rest_apis/data_stream_apis/modify_data_stream',
            'rest_apis/data_stream_apis/put_data_stream_lifecycle',
            'rest_apis/data_stream_apis/get_data_stream_lifecycle',
            'rest_apis/data_stream_apis/delete_data_stream_lifecycle',
            'rest_apis/data_stream_apis/explain_data_stream_lifecycle',
            'rest_apis/data_stream_apis/get_data_stream_lifecycle_state',
            'rest_apis/data_stream_apis/downsample'
          ]
        },
        {
          type: 'category',
          label: '文档 API',
          link: { type: 'doc', id: "rest_apis/document_apis/document_apis" },
          items: [
            'rest_apis/document_apis/replication',
            'rest_apis/document_apis/docs_index',
            'rest_apis/document_apis/get',
            'rest_apis/document_apis/delete',
            'rest_apis/document_apis/delete_by_query',
            'rest_apis/document_apis/update',
            'rest_apis/document_apis/update_by_query',
            'rest_apis/document_apis/multi_get',
            'rest_apis/document_apis/bulk',
            'rest_apis/document_apis/reindex',
            'rest_apis/document_apis/termvectors',
            'rest_apis/document_apis/multi_termvectors',
            'rest_apis/document_apis/refresh',
            'rest_apis/document_apis/optimistic_concurrency_control'
          ]
        },
        {
          type: 'category',
          label: '索引 API',
          link: { type: 'doc', id: "rest_apis/index_apis/index_apis" },
          items: [
            'rest_apis/index_apis/alias_exists',
            'rest_apis/index_apis/aliases',
            'rest_apis/index_apis/analyze',
            'rest_apis/index_apis/analyze_index_disk_usage',
            'rest_apis/index_apis/clear_cache',
            'rest_apis/index_apis/clone_index',
            'rest_apis/index_apis/close_index',
            'rest_apis/index_apis/create_index',
            'rest_apis/index_apis/create_or_update_index_alias',
            'rest_apis/index_apis/create_or_update_component_template',
            'rest_apis/index_apis/create_or_update_index_template',
            'rest_apis/index_apis/delete_component_template',
            'rest_apis/index_apis/delete_dangling_index',
            'rest_apis/index_apis/delete_index_alias',
            'rest_apis/index_apis/delete_index',
            'rest_apis/index_apis/delete_index_template',
            'rest_apis/index_apis/index_exists',
            'rest_apis/index_apis/flush',
            'rest_apis/index_apis/force_merge',
            'rest_apis/index_apis/freeze_index',
            'rest_apis/index_apis/get_index_alias',
            'rest_apis/index_apis/get_component_template',
            'rest_apis/index_apis/get_field_mapping',
            'rest_apis/index_apis/get_index',
            'rest_apis/index_apis/get_index_settings',
            'rest_apis/index_apis/get_index_template',
            'rest_apis/index_apis/get_mapping',
            'rest_apis/index_apis/import_dangling_index',
            'rest_apis/index_apis/index_recovery',
            'rest_apis/index_apis/index_segments',
            'rest_apis/index_apis/index_shard_stores',
            'rest_apis/index_apis/index_stats',
            'rest_apis/index_apis/list_dangling_indices',
            'rest_apis/index_apis/open_index',
            'rest_apis/index_apis/refresh',
            'rest_apis/index_apis/resolve_index',
            'rest_apis/index_apis/rollover_index',
            'rest_apis/index_apis/shrink_index',
            'rest_apis/index_apis/simulate_index',
            'rest_apis/index_apis/simulate_template',
            'rest_apis/index_apis/split_index',
            'rest_apis/index_apis/synced_flush',
            'rest_apis/index_apis/type_exists',
            'rest_apis/index_apis/unfreeze_index',
            'rest_apis/index_apis/update_index_settings',
            'rest_apis/index_apis/update_mapping',
          ]
        },
        {
          type: 'category',
          label: '搜索相关 API',
          link: { type: 'doc', id: "rest_apis/search_apis/search_apis" },
          items: [
            'rest_apis/search_apis/search',
            'rest_apis/search_apis/multi_search',
            'rest_apis/search_apis/async_search',
            'rest_apis/search_apis/point_in_time',
            'rest_apis/search_apis/knn_search',
            'rest_apis/search_apis/suggesters',
            'rest_apis/search_apis/terms_enum',
            'rest_apis/search_apis/scroll',
            'rest_apis/search_apis/clear_scroll',
            'rest_apis/search_apis/explain',
            'rest_apis/search_apis/field_capabilities',
            'rest_apis/search_apis/profile',
            'rest_apis/search_apis/ranking_evaluation',
            'rest_apis/search_apis/search_shards',
            'rest_apis/search_apis/validate',
            'rest_apis/search_apis/search_template',
            'rest_apis/search_apis/multi_search_template',
            'rest_apis/search_apis/render_search_template',
            'rest_apis/search_apis/vector_tile_search',
          ]
        }
      ]
    },
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

module.exports = sidebars;
