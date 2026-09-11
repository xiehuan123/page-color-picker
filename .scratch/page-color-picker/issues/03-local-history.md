# 03 — 本机历史、失败边界与本地产物（合并实施票）

Parent: `../spec.md`
Status: in-review
Blocked by: 02 — 查看、转换并复制常用颜色格式

Merged from: `04-boundaries-and-polish.md`

## What to build

实际取色和用户确认转换后写入本机近期颜色，去重、最新置顶、上限 12；支持单删、清空，关闭面板并再次从原生 action 打开后仍可见。处理受限制页面和运行异常，完成中文说明、图标/权限/隐私核对、根目录 `extension/` 正式构建复制与普通公开网页回归。

## Ownership

历史存储契约、历史列表和管理 UI、后台失败反馈、图标与文档、构建产物以及合并实施/最终共享的真实浏览器证据。领域状态、存储适配、UI、后台错误边界保持独立模块。

## Acceptance criteria

- [x] AC-06：新增、去重、置顶、上限、单删和清空行为正确。
- [x] 关闭取色面板后重新触发原生 action，历史从真实 `chrome.storage.local` 恢复。
- [x] Esc 取消不新增历史，截图不持久化。
- [x] AC-07：内部页或无法捕获/注入时给出可恢复反馈且不污染页面。
- [x] AC-08：`extension/` 对应正式构建，MV3、图标尺寸和最小权限核对通过。
- [x] 普通公开网页也能从真实 action 完成取色，不依赖 fixture 专用代码。
- [ ] 正式构建、双轴 code-review、真实浏览器证据、门禁报告和可恢复 Git 提交齐全。

## Required skills

`chrome-extensions`、`implement`、`tdd`、`ui-designer`、`code-review`、`browser-extension-launch` 验收流程；失败时 `diagnosing-bugs`。

## Work log

- 基线：`c1f6899`。
- TDD 红阶段因 `domain/history` 不存在失败；绿阶段 3 组测试覆盖置顶、完整 RGBA 去重、12 条上限、单删/清空及损坏数据清洗。
- 正在接入 `chrome.storage.local` 和近期颜色管理 UI。
- 已合并完成历史 UI/持久化、受限页恢复、中文 README 与根 `extension/`；最终目录加载后集中 E2E 全部通过。
- 初审发现历史 Promise 链不合规范且可能在异常后停摆；已改为纯 async/await 显式队列，快速“取色后立即转换”与扩展重载持久化复验通过。
- 当前指纹 `2bf60d9cd4d7e942a4be4ed2600d23d13cfeb41f8cfa1a884c7dcf01b3e56725`；等待覆盖合并实施和最终 AC 的最终双轴复审。
