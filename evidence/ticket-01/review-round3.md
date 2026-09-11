# Ticket 01 双轴复审（第三轮）

固定基线：`d66bc58`
候选提交：`913d0c5`

## Standards

1 项硬违规：选色完成后全局滚动键拦截仍存活，吞掉已聚焦“关闭”按钮的空格激活；判断项 Divergent Change 不单独阻止票 01。

## Spec

Pass。票 01 的 action、像素、缩放、滚动、取消、同名 ID 与重复 action 均已闭环。

## 处理

旧候选真实复现 `buttonFocused=关闭` 后 Space 仍 `panelPresent=true`。用明确 `isPicking` 生命周期只在取色阶段拦截滚动键；修复后取色阶段 PageDown 仍保持 `scrollY=0`，结果阶段 Space 后 `hostPresent=false`。
