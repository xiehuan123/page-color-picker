# Ticket 01 双轴审查（初审）

固定基线：`d66bc58`
候选提交：`b9f7b28`

## Standards

1. 硬违规：异步 `runtime.onMessage` 监听器直接返回 Promise，未按项目 Chrome 规则同步 `return true`。
2. 硬违规：点击选色后闭包仍持有完整页面快照，违反“取色会话结束即释放”的数据边界。
3. 硬违规：action 错误反馈 API 自身拒绝时可能成为未处理异常。
4. 判断项（Divergent Change）：取色入口文件同时承载样式、像素映射、会话和视图职责。

## Spec

1. 缺少真实页面缩放证据。
2. 重复 action 的截图发生在旧覆盖层清理前，可能采进扩展 UI。
3. 通过 `document.getElementById` 清理会误删同 ID 的网页元素。

## 处理

初审未通过。已执行 `diagnosing-bugs`：在旧候选真实复现同名元素被删、重复 action 采到 `#242A38`；修复为扩展自持有宿主引用、截图前清理并等待两帧、同步 `return true`、选色后缩小快照画布、错误反馈保护，并拆出 `domain/pixel.ts` 与 `ui/picker-styles.ts`。真实 125% zoom、DPR2、同名冲突与重复 action 复验均通过，见 `tool-record.md`。
