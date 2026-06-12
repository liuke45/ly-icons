import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  outDir: './dist',
  lang: 'zh-CN',
  title: "ly icons",
  description: "龙鱼图标组件库",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指南', link: '/usage' },
      { text: '图标', link: '/icons' }
    ],

    sidebar: [
      {
        text: '快速导航',
        items: [
          { text: '安装', link: '/install' },
          { text: '使用', link: '/usage' },
          { text: '图标展示', link: '/icons' },
          { text: '帮助', link: '/FAQ' }
        ]
      }
    ],

    socialLinks: [
      {
        icon: {
          svg: '<svg width="24" height="24" class="tanuki-logo" viewBox="0 0 36 36"><path class="tanuki-shape tanuki-left-ear" fill="#e24329" d="M2 14l9.38 9v-9l-4-12.28c-.205-.632-1.176-.632-1.38 0z"></path><path class="tanuki-shape tanuki-right-ear" fill="#e24329" d="M34 14l-9.38 9v-9l4-12.28c.205-.632 1.176-.632 1.38 0z"></path><path class="tanuki-shape tanuki-nose" fill="#e24329" d="M18,34.38 3,14 33,14 Z"></path><path class="tanuki-shape tanuki-left-eye" fill="#fc6d26" d="M18,34.38 11.38,14 2,14 6,25Z"></path><path class="tanuki-shape tanuki-right-eye" fill="#fc6d26" d="M18,34.38 24.62,14 34,14 30,25Z"></path><path class="tanuki-shape tanuki-left-cheek" fill="#fca326" d="M2 14L.1 20.16c-.18.565 0 1.2.5 1.56l17.42 12.66z"></path><path class="tanuki-shape tanuki-right-cheek" fill="#fca326" d="M34 14l1.9 6.16c.18.565 0 1.2-.5 1.56L18 34.38z"></path></svg>'
        }, link: 'https://git-repo.longyu.com/lyNpm/ly-icons'
      },
      {
        icon: {
          svg: '<svg class="." width="38" height="57" viewBox="0 0 38 57" xmlns="http://www.w3.org/2000/svg"><path d="M19 28.5c0-5.247 4.253-9.5 9.5-9.5 5.247 0 9.5 4.253 9.5 9.5 0 5.247-4.253 9.5-9.5 9.5-5.247 0-9.5-4.253-9.5-9.5z" fill-rule="nonzero" fill-opacity="1" fill="#1abcfe" stroke="none"></path><path d="M0 47.5C0 42.253 4.253 38 9.5 38H19v9.5c0 5.247-4.253 9.5-9.5 9.5C4.253 57 0 52.747 0 47.5z" fill-rule="nonzero" fill-opacity="1" fill="#0acf83" stroke="none"></path><path d="M19 0v19h9.5c5.247 0 9.5-4.253 9.5-9.5C38 4.253 33.747 0 28.5 0H19z" fill-rule="nonzero" fill-opacity="1" fill="#ff7262" stroke="none"></path><path d="M0 9.5C0 14.747 4.253 19 9.5 19H19V0H9.5C4.253 0 0 4.253 0 9.5z" fill-rule="nonzero" fill-opacity="1" fill="#f24e1e" stroke="none"></path><path d="M0 28.5C0 33.747 4.253 38 9.5 38H19V19H9.5C4.253 19 0 23.253 0 28.5z" fill-rule="nonzero" fill-opacity="1" fill="#a259ff" stroke="none"></path></svg>'
        }, link: 'https://www.figma.com/file/8BSvBAK31mTt0NY5tw4h0P/%E7%BD%91%E9%A1%B5%E7%AB%AFUI%E7%BB%84%E4%BB%B6%E5%BA%93?type=design&node-id=489-12633&t=RkRGf9JFv0FPNAAz-0'
      }
    ],
  },
})
