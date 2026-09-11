# 网页取色：复杂项目规格入口

本文件仅为调度索引，不是另一份权威规格。尚未执行 to-spec，也未发布主票或创建独立模块工单。

- 需求来源：网页任意位置取色，支持 HEX、RGB、HSL 转换与一键复制，支持合法颜色输入转换及本机近期历史管理；必须真实从网页像素取色。
- 复杂度理由：包含真实网页像素采样、页面取色交互、颜色转换与剪贴板、历史持久化和跨模块真实浏览器验收，存在三个以上可独立验收且有依赖的用户功能。
- 本次交付目标：在本机使用（local；provided）
- 正式规格：待 to-spec 生成 .scratch/<feature>/spec.md 后填入实际路径。
- 正式主票：待 to-spec 发布后记录实际路径/链接和发布证据。
- 子票：待 to-tickets 生成后记录 issues/*.md 的实际路径和模块所有权。

先使用 setup-matt-pocock-skills 完成首次/缺失配置，再执行 to-spec → 发布正式主票 → to-tickets → implement。
默认沿用这些 skills 的 Local Markdown 工作流，由主执行者自行做技术判断和拆分；更新 state.workflow.authoritative_artifacts 指向实际产物。
tasks/T-*.md 仅跟踪阶段依赖和验收证据，实施范围与验收标准以正式规格和子票为准。外部反馈或旧票需要分流时才使用 triage。
每票必须使用 code-review，并通过 Playwright MCP 实际加载插件完成端到端验证；发现问题必须使用 diagnosing-bugs。
