# 01 — 从原生 action 完成真实页面像素取色

Parent: `../spec.md`
Status: review
Blocked by: None — can start immediately

## What to build

用 WXT Vanilla TypeScript 建立 MV3 扩展。从工具栏 action 捕获当前可见网页、注入隔离取色界面，悬停预览并点击已知像素得到颜色；Esc 取消且不影响页面。

## Ownership

脚手架、manifest 配置、后台 action/截图通道、运行时取色脚本、基础颜色领域模块、基础 fixture 与本票测试。

## Acceptance criteria

- [ ] AC-01：真实 action → 已知纯色点击 → 精确颜色。
- [ ] AC-02：DPR/缩放/滚动/渐变/图片坐标映射正确，覆盖层不入样。
- [ ] AC-03：Esc 取消后页面恢复且不产生选择。
- [ ] 正式构建、双轴 code-review、真实浏览器证据、门禁报告和可恢复 Git 提交齐全。

## Required skills

`extension-create`、`chrome-extensions`、`implement`、`tdd`、`ui-designer`、`code-review`；失败时 `diagnosing-bugs`。

## Work log

- 实施基线：`d66bc58`；WXT 脚手架与锁文件位于 `source/`。
- TDD：`source/domain/color.test.ts` 先因模块缺失变红，再因接口名/独立色相基准捕获契约问题，修复后 2/2 通过。
- 构建：WXT 0.21.4 正式构建 `.output/chrome-mv3`，MV3、无 host permissions，图标文件齐全。
- 真实验收：Chrome DevTools MCP 安装 ID `lndaldlafagcjfecgngfpagpmbnabccl`；action 原生入口、纯色、滚动、图片、DPR2 渐变及 Esc 恢复通过。
- 证据：`../../../evidence/ticket-01/acceptance.json`、`tool-record.md`、截图/快照。
- candidate：`d56a112bb6af47f5728b09d8554b76ef194f963efe8690af37bca68a73583e9f`。
- gate：`../../../evidence/ticket-01/gate-report.json`，`gate_passed: true`。
- 待完成：固定提交后执行规范/规格双轴 code-review。
