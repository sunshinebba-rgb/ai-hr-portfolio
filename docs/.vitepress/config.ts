import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    base: '/ai-hr-portfolio/',
    lang: 'zh-CN',
    title: '朱雅曼 | HR 架构师',
    description: 'AI 时代的组织与人才实战作品集',

    themeConfig: {
      nav: [
        { text: '首页', link: '/' },
        { text: '人才系统', link: '/talent-system' },
        { text: 'AI 方法论', link: '/ai-strategy' }
      ],

      sidebar: [
        {
          text: '核心作品',
          collapsed: false,
          items: [
            { text: 'AI 驱动的人才盘点系统', link: '/talent-system' },
            { text: '绩效运营的自动化重构', link: '/performance-auto' }
          ]
        },
        {
          text: '深度思考',
          collapsed: false,
          items: [
            { text: '2026 HR 转型白皮书', link: '/ai-strategy' },
            { text: '心理学在算法时代的价值', link: '/psychology' }
          ]
        }
      ],

      socialLinks: [
        { icon: 'github', link: 'https://github.com/' }
      ],

      footer: {
        message: '基于 VitePress 构建',
        copyright: 'Copyright © 2026-Present 朱雅曼'
      }
    },

    mermaid: {
      theme: 'default'
    },

    mermaidPlugin: {
      class: 'mermaid'
    }
  })
)
