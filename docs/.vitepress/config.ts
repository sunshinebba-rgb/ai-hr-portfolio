import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    vite: {
      plugins: [tailwindcss() as never]
    },
    base: '/ai-hr-portfolio/',
    lang: 'zh-CN',
    title: '朱雅曼 | HR 架构师',
    description: 'AI 时代的组织与人才实战作品集',

    themeConfig: {
      // 1. 导航栏配置
      nav: [
        { text: '首页', link: '/' },
        { text: '人才系统', link: '/talent-system' },
        { text: 'AI 方法论', link: '/ai-strategy' }
      ],

      // 2. 侧边栏配置
      sidebar: [
        {
          text: '核心作品',
          collapsed: false,
          items: [
            { text: 'AI 驱动的人才盘点系统', link: '/talent-system' }
          ]
        }
      ],

      socialLinks: [
        { icon: 'github', link: 'https://github.com/sunshinebba-rgb/ai-hr-portfolio' }
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