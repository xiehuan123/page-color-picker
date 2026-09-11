# 合并实施与最终候选初审（554fcb1）

固定基线：`c1f6899`。两个独立代理审查合并票 03/04、最终票 05、根 `extension/` 和全部 AC。

## Standards — Fail

1. `picker.ts` 使用 `.then()` 历史队列，违反既有 Chrome 扩展 async/await 规范，且未隔离异常会导致队列永久 rejected。
2. 票 05 在 blocker 票 03 尚为 `in-review` 时也标为 `in-review`，违反工单依赖规则。

处理：历史队列改为纯 async/await 显式 FIFO，逐操作捕获后继续；票 05 恢复 `blocked`，仅在票 03 审查通过后关闭。

## Spec — Fail（收口缺口）

- 功能 AC-01..09 未见硬缺陷。
- `release_bundle.py check` 已通过，但尚未执行 pack，`FINAL_REPORT.md` 仍为审查前草稿。

处理：在最终复审前生成 ZIP 和 pack 报告；报告审查状态在复审通过后做归档更新，不重复产品测试。
