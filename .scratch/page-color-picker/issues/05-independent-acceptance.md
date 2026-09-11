# 05 — 独立验证最终本地候选

Parent: `../spec.md`
Status: blocked
Blocked by: 03 — 本机历史、失败边界与本地产物（合并实施票）

## What to build

固定最终候选指纹，在项目专用 Chrome DevTools MCP 中重新安装最终 `extension/`，独立覆盖安装、原生入口、核心流程、失败恢复、关闭重开与持久化，运行最终双轴审查、acceptance gate 和 release bundle。

## Ownership

只写最终验收、审查与发布包证据，不夹带新功能；若发现缺陷退回对应实施票并执行诊断闭环。

## Acceptance criteria

- [ ] AC-09：真实浏览器场景全部有原始工具记录和截图。
- [ ] `browser_choice` 与 `environment.automation_provider='chrome-devtools-mcp'` 指向同目录用户原始选择副本。
- [ ] 最终 candidate 与 `extension/` 完全匹配，`gate_passed: true`。
- [ ] `release_bundle.py check` 与 pack 完成，`FINAL_REPORT.md` 如实区分已验证/未验证和边界。

## Required skills

`code-review`、`browser-extension-launch` 验收流程；失败时 `diagnosing-bugs`。

## Work log

复用合并实施票在同一最终指纹上的集中真实操作，不为工单编号重复。根 `extension/` 已安装；当前 gate v4 通过；`release_bundle.py check` 与 `pack` 均完成，ZIP 为 `release/page-color-picker-0.1.0.zip`。真实验收已执行，但按依赖规则在阻塞票 03 审查完成前保持 blocked；两者由同一最终双轴审查覆盖。
