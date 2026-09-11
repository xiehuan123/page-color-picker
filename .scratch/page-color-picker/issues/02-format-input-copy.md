# 02 — 查看、转换并复制常用颜色格式

Parent: `../spec.md`
Status: in-review
Blocked by: 01 — 从原生 action 完成真实页面像素取色

## What to build

在取色结果面板展示 HEX、RGB、HSL 并逐项复制；支持输入合法 CSS 颜色转换，非法输入给中文恢复提示且保留原结果。

## Ownership

颜色解析/格式化公开接口、结果/输入/复制 UI、本票测试与 fixture 粘贴区。

## Acceptance criteria

- [x] AC-04：三种格式从真实扩展界面复制后可实际粘贴且文本一致。
- [x] AC-05：合法输入转换正确；非法输入显示错误且不覆盖结果。
- [x] 键盘焦点、状态提示、小尺寸布局可用。
- [ ] 正式构建、双轴 code-review、真实浏览器证据、门禁报告和可恢复 Git 提交齐全。

## Required skills

`chrome-extensions`、`implement`、`tdd`、`ui-designer`、`code-review`；失败时 `diagnosing-bugs`。

## Work log

- 基线：`ae7ce37`。
- TDD 增加规范化颜色解析测试；实现浏览器原生 CSS 颜色解析、三格式结果面板与真实剪贴板复制。
- Chrome DevTools MCP 从原生 action 进入结果面板；三种格式均真实复制后粘贴通过；合法颜色名/HSL 与非法恢复通过。
- 诊断并确认 headless 环境粘贴键为 `Shift+Insert`；未增加 `clipboardRead` 等额外权限。
- 正在进行双轴独立 code-review。
- 初审 Standards Pass；Spec 发现 HEX/RGB 输入与窄视口证据缺口，补验后又发现 HSL 在窄屏省略。
- 窄屏改为两列格式行并隐藏重复“复制”字样；真实 288×512 CSS viewport 下全文、复制粘贴与非法恢复通过，等待最终复审。
