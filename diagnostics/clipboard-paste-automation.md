# 剪贴板粘贴自动化诊断

## 现象

扩展点击复制后显示成功，但 Chrome DevTools MCP 的 `Meta+V` 与 `Control+V` 未向 fixture 输入框写入文本。

## 证据与根因边界

- 候选内记录的实际路径是 `clipboard-api`，即 `navigator.clipboard.writeText` fulfilled，不是 `execCommand` 回退假阳性。
- 页面焦点确认为 fixture 的 `#paste-target`。
- `Shift+Insert` 随后粘入正确文本，证明隔离浏览器剪贴板已有内容。
- 因此问题位于 headless/Linux 键盘粘贴组合，与产品复制实现无关。

## 复验

用 `fill_form` 清空 fixture 输入、`click` 重获焦点、`Shift+Insert` 粘贴。HEX/RGB/HSL 三种文本均逐字通过；原始 JSON 在 `evidence/ticket-02/`。
