# 03 — 管理并重开本机近期颜色

Parent: `../spec.md`
Status: ready-for-agent
Blocked by: 02 — 查看、转换并复制常用颜色格式

## What to build

实际取色和用户确认转换后写入本机近期颜色，去重、最新置顶、上限 12；支持单删、清空，关闭面板并再次从原生 action 打开后仍可见。

## Ownership

历史存储契约、历史列表和管理 UI、本票测试及重开证据。

## Acceptance criteria

- [ ] AC-06：新增、去重、置顶、上限、单删和清空行为正确。
- [ ] 关闭取色面板后重新触发原生 action，历史从真实 `chrome.storage.local` 恢复。
- [ ] Esc 取消不新增历史，截图不持久化。
- [ ] 正式构建、双轴 code-review、真实浏览器证据、门禁报告和可恢复 Git 提交齐全。

## Required skills

`chrome-extensions`、`implement`、`tdd`、`ui-designer`、`code-review`；失败时 `diagnosing-bugs`。

## Work log

等待 02。
