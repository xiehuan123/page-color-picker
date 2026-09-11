# 02 — 查看、转换并复制常用颜色格式

Parent: `../spec.md`
Status: ready-for-agent
Blocked by: 01 — 从原生 action 完成真实页面像素取色

## What to build

在取色结果面板展示 HEX、RGB、HSL 并逐项复制；支持输入合法 CSS 颜色转换，非法输入给中文恢复提示且保留原结果。

## Ownership

颜色解析/格式化公开接口、结果/输入/复制 UI、本票测试与 fixture 粘贴区。

## Acceptance criteria

- [ ] AC-04：三种格式从真实扩展界面复制后可实际粘贴且文本一致。
- [ ] AC-05：合法输入转换正确；非法输入显示错误且不覆盖结果。
- [ ] 键盘焦点、状态提示、小尺寸布局可用。
- [ ] 正式构建、双轴 code-review、真实浏览器证据、门禁报告和可恢复 Git 提交齐全。

## Required skills

`chrome-extensions`、`implement`、`tdd`、`ui-designer`、`code-review`；失败时 `diagnosing-bugs`。

## Work log

等待 01。
