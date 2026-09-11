# 04 — 完成失败恢复、隐私边界与交付打磨

Parent: `../spec.md`
Status: ready-for-agent
Blocked by: 03 — 管理并重开本机近期颜色

## What to build

处理受限制页面、重复启动和运行异常，完成中文使用说明、图标、隐私/权限核对、正式 `extension/` 复制与普通公开网页回归。

## Ownership

后台错误反馈、图标与文档、构建复制脚本、综合 fixtures 和本票回归测试。

## Acceptance criteria

- [ ] AC-07：内部页或无法捕获/注入时给出可恢复反馈且不污染页面。
- [ ] AC-08：`extension/` 对应正式构建，MV3、图标尺寸和最小权限核对通过。
- [ ] 普通公开网页也能从真实 action 完成取色，不依赖 fixture 专用代码。
- [ ] 正式构建、双轴 code-review、真实浏览器证据、门禁报告和可恢复 Git 提交齐全。

## Required skills

`chrome-extensions`、`implement`、`ui-designer`、`code-review`；失败时 `diagnosing-bugs`。

## Work log

等待 03。
