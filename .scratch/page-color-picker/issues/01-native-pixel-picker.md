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
- 初审：`../../../evidence/ticket-01/review-initial.md`，发现 Standards 3+1、Spec 3 项，未通过。
- 诊断修复：旧候选真实复现同名 ID 被删、重复 action 采到 `#242A38`；修复后同名元素保留、重复 action 得 `#FFFFFF`，真实 125% zoom 仍精确得 `#EF4444`。
- 当前 candidate：`3e7726a327183e7a6ad92bb11fd2a6397971d7c27e0730566a0234f64954c28b`。
- 当前 gate：`../../../evidence/ticket-01/gate-report-v2.json`，`gate_passed: true`。
- 第二轮复审：Standards 硬规则通过；Spec 发现键盘滚动未锁定，旧候选真实复现 PageDown 导致 `scrollY 0 → 928`，修复后保持 0。
- 第三轮复审：Spec 通过；Standards 发现结果阶段仍吞掉关闭按钮 Space。旧候选真实复现，使用 `isPicking` 生命周期修复后 Space 可关闭、取色阶段 PageDown 仍锁定。
- 当前 candidate：`591313021bfdae10f91a2d4ef6f7d06f971f3c88303bbb152edc3d6afe504a46`。
- 待完成：重新运行门禁、提交并做最终双轴复审。
