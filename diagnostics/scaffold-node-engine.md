# WXT 脚手架 Node 引擎诊断

## 反馈循环

原命令：`npx --yes wxt@latest init source --template vanilla --pm pnpm`

首次输出稳定出现：`wxt@0.21.4 required node >=22`，当前默认 `node v20.19.4`；随后依赖安装无进展。

## 排序假设与验证

1. WXT 最新版要求 Node 22：警告直接支持。
2. 仅降 WXT 即可：改用 0.20.x 后，最新传递 CLI 依赖仍要求 Node 22，故不足以修复。
3. registry 不可用：`npm view` 和随后 tarball 下载成功，排除。
4. 项目没有可用 Node 22：查到项目宿主已有 `/Users/xiehuan/.nvm/versions/node/v22.23.2/bin/node`，排除。

## 修复与复验

显式使用宿主已有 Node 22，并把 Corepack 缓存放在项目范围内，WXT 0.21.4 的 `postinstall: wxt prepare` 成功。随后用同一 Node 22 完成 Vitest、TypeScript 与 `wxt build`。没有修改全局 Node 配置。

诊断过程中没有读取认证配置、全局用户指令或私人浏览器数据。
