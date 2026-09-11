# 网页取色

一个本地 Chrome 扩展：点击工具栏图标后，从当前网页的真实可见像素取色，显示 HEX、RGB、HSL，可逐项复制，也可输入 CSS 颜色转换。近期颜色只保存在本机，支持复用、单删和清空。

## 本地加载

1. 打开 Chrome 的“扩展程序”页面并启用开发者模式。
2. 选择“加载已解压的扩展程序”。
3. 选择本项目根目录下的 `extension/`。
4. 打开普通网页，点击工具栏中的“网页取色”图标。

`extension/` 是正式构建产物，不需要开发服务器。Chrome 内部页、扩展商店等受限页面不能注入取色层；此时图标会显示红色 `!`，切换到普通网页重试即可。

## 使用

- 进入取色后移动鼠标预览，点击确定颜色，按 `Esc` 取消。
- 结果面板显示 HEX、RGB、HSL；点击任一行复制。
- 输入 HEX、RGB、HSL 或常见 CSS 颜色名后点击“转换”。
- 近期颜色最新置顶、自动去重，最多 12 条；可点击复用、单条删除或全部清空。

## 从源码构建

需要 Node.js 22 和 pnpm。源码与锁文件位于 `source/`：

```bash
cd source
pnpm install --frozen-lockfile
pnpm test
pnpm compile
pnpm build
```

WXT 正式构建输出为 `source/.output/chrome-mv3/`；交付时将该目录内容原样复制到根目录 `extension/`。最终核验与 ZIP 见 `FINAL_REPORT.md`。

## 隐私与权限

- `activeTab`：仅在点击工具栏图标后访问当前标签页。
- `scripting`：在当前页临时注入取色界面。
- `storage`：在本机保存规范化的近期颜色数组。
- `clipboardWrite`：复制用户点击的颜色文本。

没有常驻站点权限，不上传页面截图、网页内容或历史，不包含遥测、账号、远程代码或网络请求。项目仅使用本地 Git，不配置远端、不发布商店。
