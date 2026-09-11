你是一个全新、独立的 Codex CLI 开发会话，当前目录是唯一负责的插件项目。用户要求真实使用 browser-extension-launch skill 开发，模型必须始终 gpt-5.6-sol，reasoning high（已配置，不得改模型）。主会话负责协调三个项目，你不能编辑其他项目或原来的技能例子。

先读取 .runtime/codex-home/skills/browser-extension-launch/SKILL.md，真正执行对应必需技能。它们都在相邻 skills 目录中。先读 BRIEF.md 和 run-inputs/browser-choice/user-decision.md。不要读取 .runtime/codex-home/auth.json、模型服务配置中的秘密、用户全局指令、私人浏览器数据或其他项目。

执行要求：
1. 这是实际开发而非规划演示。自行判断复杂度；复杂时真实执行 setup-matt-pocock-skills → to-spec 发布正式本地规格工单 → to-tickets 发布独立子票和依赖 → implement 按独立模块/纵向用户功能实施。所有本地工单、技术默认、选票、拆分由你决定，不向新手重复确认。默认Local Markdown，不要GitHub或任何远端。
2. 新建必须真实使用 chrome-extensions 和 extension-create，实际运行脚手架（可自行选择轻量WXT/Vanilla TS）；不要只复制旧样例或只写说明。故障必须 diagnosing-bugs；每票和最终版本真正运行 code-review 的规范/规格两个独立审查，覆盖未提交新文件。tdd等条件依赖按原技能执行。
3. 主会话已为本项目建立Git并有初始提交。记录审查基线，保留可恢复提交。禁止任何git push、建立远端或商店发布。用户本轮只要求本地成品，不提示注册商店或付款。
4. 用户已明确选择独立 Chrome DevTools MCP 替代默认Playwright MCP。服务 chrome_devtools 已专门配置：独立浏览器profile、workspace仅本项目、扩展安装/触发action等工具启用、headless独立浏览器。不得访问日常Chrome，不重复询问同一选择。读取工具实际说明再使用，不虚构API。复制用户原始选择到最终验收JSON同目录范围，填写 browser_choice 与 environment.automation_provider='chrome-devtools-mcp'，不把配置存在当已验收。
5. 必须使用本会话实际 MCP 加载最终构建的扩展，真实触发原生入口或自动内容脚本注册入口，操作核心流程、失败恢复、关闭重开/持久化，保存截图和原始工具记录。静态检查、mock、直接写存储都不算E2E。页面暂时没有popup目标时等待并重新list，不对旧pageId连续失败。可以用真实页面DOM操作触发实际UI处理函数，但不能注入假的Chrome API。若 headless 不支持某个必要原生能力，先按官方资料解决本受控环境；若必须更改MCP启动配置，把准确问题写BLOCKERS.md通知协调者，继续独立工作，不能标完成。
6. 每个项目独立端口和文件；不要关闭或操作其他会话浏览器。浏览器工具允许本项目目录，资源及截图保存在这里。需要网络依赖可在项目安装；shell sandbox是workspace-write且network_access=true，使用自动审批，不要降低sandbox或关闭审批/修改全局配置。
7. 产物至少：可直接加载的最终 extension/ 目录（从正式构建复制并核对，不是开发服务器）、源码/锁文件/构建方式、必要图标、简单中文使用说明、需求/工单/技能调用记录、真实E2E证据及验收门禁结果。生成 FINAL_REPORT.md：实现功能、已验证/未验证、具体加载目录、测试与真实证据路径、Git提交、边界。最终调用 acceptance_gate.py 与 release_bundle.py，候选指纹必须对应最终 extension/，证据不可编造。
8. 当前 conversation.md 由外层runner持续记录你的实际消息，请不要覆盖。你可另外保存 decisions/diagnostics 等记录。任何认证内容不得打印或提交；.runtime/始终Git忽略。遇真实阻塞写BLOCKERS.md且在最后消息明确，不要把未验收代码说成可用。

请持续执行到真实可用及相应验收完成，不停在计划/脚手架/静态测试。没有无法推断的产品决定，不需要提问。所有可逆实现选择你自行决定。

具体项目要求：

# 网页取色

用户原始目标：网页任意位置取色，颜色可在 RGB、HSL、十六进制等格式间转换，一键复制；可合理补充常用功能。

必须能从实际网页像素取色，不能只做输入颜色字符串的转换器。自行研究并选择可靠实现：可以采用真实浏览器取色能力或当前可见网页截图采样；若使用原生EyeDropper，须真实验证，不能mock替代。截图方式须正确处理DPR、缩放、滚动、渐变/图片，并避免把自己的覆盖层采进颜色。

提供清晰中文交互：进入取色、悬停/点击选色、Esc取消、不破坏页面；显示HEX/RGB/HSL，一键复制每种格式；用户输入合法颜色可转换；合理增加近期颜色历史和清空/删除。数据只放本机，最小权限，不联网传输截图或内容。

设计代表性色块/图片/滚动fixtures及普通公开网页，使用本项目Chrome DevTools MCP实际加载扩展，从真实入口操作取色，核对已知像素和转换误差、取消恢复、复制后实际粘贴、历史重开。优先选择能在已授权受控浏览器实际完成验收的实现，不牺牲真实取色。
