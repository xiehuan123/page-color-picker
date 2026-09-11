# 项目决定

按用户原话、已有记录或实际证据填写；区分用户已确认、AI 暂定、待决定。沉默不等于同意。

| 编号 | 要决定什么 | 答案 | 来源与日期 | 状态 | 影响规格/验收 | 替代旧决定 |
| --- | --- | --- | --- | --- | --- | --- |
| D-001 | 工单位置 | Local Markdown，正式规格与子票位于 `.scratch/page-color-picker/` | 用户要求，2026-09-11 | 已确认 | 全流程 | 无 |
| D-002 | 自动化提供方 | `chrome-devtools-mcp`，项目独立 profile | 用户原始选择，2026-09-11 | 已确认 | AC-09 / 所有真实验收 | 默认 Playwright MCP |
| D-003 | 像素取色方案 | action 手势先 `captureVisibleTab`，后注入 Shadow DOM，按快照/视口比例采样 | AI 可逆技术默认，2026-09-11 | 已采用 | AC-01/02/03 | 原生 EyeDropper 方案 |
| D-004 | 权限 | `activeTab`、`scripting`、`storage`、`clipboardWrite`；不设 host permissions | AI 隐私最小化默认，2026-09-11 | 已采用 | AC-07/08 | 全宽泛站点权限 |
| D-005 | 测试 seams | 颜色模块公开函数 + 真实 native action 最高层 E2E | 用户授权代理决定，2026-09-11 | 已采用 | 所有实施票 | 无 |

初始化未添加任何用户确认。浏览器默认值仅记录在 state.json 与 spec.md 中作为暂定方案。
