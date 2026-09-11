import { defineConfig } from 'wxt';

export default defineConfig({
  browser: 'chrome',
  manifestVersion: 3,
  manifest: {
    name: '网页取色',
    short_name: '网页取色',
    description: '从当前网页真实像素取色，并在本机转换、复制和管理近期颜色。',
    minimum_chrome_version: '120',
    permissions: ['activeTab', 'scripting', 'storage', 'clipboardWrite'],
    action: { default_title: '进入网页取色' },
  },
});
