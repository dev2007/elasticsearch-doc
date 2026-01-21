// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Elasticsearch 中文文档",
  tagline: "Elasticsearch 中文文档",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://elasticsearch.bookhub.tech",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "dev2007", // Usually your GitHub org/user name.
  projectName: "elasticsearch-doc", // Usually your repo name.

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "zh",
    locales: ["zh"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  scripts: [
    {
      src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8380975615223941",
      crossorigin: "anonymous",
    },
    {
      src: "https://hm.baidu.com/hm.js?085b01fdb8056cdc09e3d19350818e33",
      async: true,
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      docs: {
        sidebar: {
          hideable: true,
        },
      },
      metadata: [
        {
          name: "keywords",
          content:
            "Elastic,Elasticsearch,Elasticsearch api,ElasticStack,ELK,Document,docs,文档,中文文档,入门",
        },
      ],
      navbar: {
        title: "Elasticsearch 中文文档",
        logo: {
          alt: "elasticsearch Logo",
          src: "img/favicon.ico",
        },
        items: [
          {
            href: "https://www.bookhub.tech",
            label: "BookHub 首页",
            position: "right",
          },
          {
            href: "https://dowel.mortnon.tech/",
            label: "翻译工具",
            position: "right",
          },
          {
            href: "https://github.com/dev2007/elasticsearch-doc",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub 仓库",
          },
          {
            type: "search",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "BookHub",
            items: [
              {
                label: "首页",
                href: "https://www.bookhub.tech",
              },
              {
                label: "Dowel AI  工具",
                href: "https://docs.https://dowel.mortnon.tech/.tech",
              },
            ],
          },
          {
            title: "其他文档",
            items: [
              {
                label: "Micronaut",
                href: "https://micronaut.bookhub.tech",
              },
              {
                label: "Pac4j",
                href: "https://pac4j.bookhub.tech",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} bookHub.tech`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: [
          "bash",
          "java",
          "yaml",
          "json",
          "groovy",
          "kotlin",
          "graphql",
          "properties",
          "toml",
          "hoon",
        ],
      },
    }),

  plugins: [
    [
      require.resolve("docusaurus-lunr-search"),
      {
        languages: ["en", "zh"], // language codes
      },
    ],
  ],
};

module.exports = config;
