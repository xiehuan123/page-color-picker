# Ticket 02 Chrome DevTools MCP 原始操作记录

日期：2026-09-12（Asia/Shanghai）

```text
reload_extension id=lndaldlafagcjfecgngfpagpmbnabccl
navigate_page pageId=2 type=reload
trigger_extension_action id=lndaldlafagcjfecgngfpagpmbnabccl
click pageId=2 uid=4_5
结果面板：HEX/RGB/HSL 三个真实按钮和颜色转换表单出现。

fill_form uid=5_9 value="hsl(210 100% 50%)"; click uid=5_10
结果：#0080FF / rgb(0, 128, 255) / hsl(210, 100%, 50%)。

逐项 click 真实复制按钮；fill_form 清空夹具 #paste-target；click 聚焦；press_key Shift+Insert。
HEX：{"pasted":"#0080FF","method":"clipboard-api","pass":true}
RGB：{"pasted":"rgb(0, 128, 255)","method":"clipboard-api","pass":true}
HSL：{"pasted":"hsl(210, 100%, 50%)","method":"clipboard-api","pass":true}

fill_form value="rebeccapurple"; click 转换
{"hex":"#663399","rgb":"rgb(102, 51, 153)","hsl":"hsl(270, 50%, 40%)","pass":true}

Spec 初审后补做真实输入：
fill_form value="#0ea5e9"; click 转换
{"hex":"#0EA5E9","rgb":"rgb(14, 165, 233)","hsl":"hsl(199, 89%, 48%)","pass":true}
fill_form value="rgb(255, 193, 7)"; click 转换
{"hex":"#FFC107","rgb":"rgb(255, 193, 7)","hsl":"hsl(45, 100%, 51%)","pass":true}

emulate viewport=360x640x2（service worker 中真实页面 zoom 仍为 1.25）
实际 CSS viewport=[288,512]；panel 全部位于 [10,10]..[278,372.2]；输入宽 170.8、按钮宽 55.6；pass=true。

fill_form value="definitely-not-a-color"; click 转换
{"hex":"#663399","status":"无法识别这个颜色，请检查输入","preserved":true,"pass":true}

结果面板打开时再次 trigger_extension_action；保存 reopen-picker.snapshot.txt；按真实 #solid-red DOM 中心坐标操作扩展实际取色层。
{"label":"当前颜色 #EF4444","values":["#EF4444","rgb(239, 68, 68)","hsl(0, 84%, 60%)"],"pass":true}
```

诊断补充：`navigator.clipboard.writeText` 在扩展界面内真实成功，记录的 method 为 `clipboard-api`。隔离的 HeadlessChrome 不响应 `Meta+V` / `Control+V`，但原生 X11/Chromium 粘贴键 `Shift+Insert` 可把同一浏览器剪贴板真实粘入普通网页输入框。首次清空输入框使用了 macOS 选择键导致旧文本残留，该失败原始记录保留；改用 DevTools 表单清空、点击重新聚焦后，三种格式逐字通过。

DOM 读取仅核对扩展实际 Shadow DOM 和 fixture 输入值；未注入、替换或伪造 Chrome/Clipboard API。
