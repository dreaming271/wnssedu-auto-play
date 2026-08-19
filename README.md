# wnssedu 课程自动连播

[![Install](https://img.shields.io/badge/安装-一键安装脚本-blue)](https://github.com/dreaming271/wnssedu-auto-play/raw/main/wnssedu-auto-play.user.js)

华南理工大学网络教育平台（`scut.wnssedu.com`）看课任务自动连播油猴脚本。

> **挂机真播，不刷进度、不加速、不伪造观看记录** —— 视频按原速真实播放完，脚本只负责帮你完成「点下一节 / 切下一章」这个重复动作，稳、慢、但省心。

## ✨ 功能

- 视频**原速真实播放**（静音），播完自动切到下一小节
- 一章播完自动返回任务列表，弹窗定位并切到下一章继续
- 面板输入框指定**从第几章开始**
- 进度存 `localStorage`，刷新 / 重开页面不丢
- 悬浮面板一键「开始 / 停止 / 重置」

## 🖥️ 适用平台

| 项目 | 说明 |
| --- | --- |
| 站点 | `https://scut.wnssedu.com`（华南理工大学网络教育） |
| 播放器 | 保利威（Polyv） |
| 课程结构 | 章节（Chapter）→ 小节（Section） |

## 📦 安装

1. 安装浏览器扩展 **Tampermonkey**（篡改猴）：
   - Chrome / Edge：[Chrome 应用商店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox：[Firefox 附加组件](https://addons.mozilla.org/firefox/addon/tampermonkey/)
2. 安装本脚本（任选其一）：
   - **一键安装**：点击 [安装 wnssedu-auto-play.user.js](https://github.com/dreaming271/wnssedu-auto-play/raw/main/wnssedu-auto-play.user.js)，Tampermonkey 自动弹出安装页，点「安装」
   - 或下载仓库里的 `wnssedu-auto-play.user.js`，在 Tampermonkey 管理面板「新建脚本」里整体粘贴保存

## 🚀 使用

1. 登录平台，进入「看课任务列表」页（`studytasklist.htm`）
2. 右下角出现「wnssedu 自动连播」悬浮面板
3. 从第一章开始：点「重置」→ 点「开始」
4. 从第 N 章开始：输入框填 `N` → 点「从这章开始」
5. 挂机即可，视频自动播放、自动切下一节 / 下一章

## ❓ 常见问题

- **日志显示「全部章节已完成 / 章节索引越界」**：进度记录错乱，点「重置」清空，再重新指定起始章节。
- **日志显示「未找到视频」**：视频页的播放器还没加载出来，刷新一次视频页即可。
- **想让脚本暂停**：点「停止」，脚本不会再切页。

## ⚠️ 免责声明

- 本脚本仅供**个人学习、提升听课效率**使用。
- 视频以**原速真实播放**，不伪造观看进度、不加速、不绕过任何考核。
- 可能违反平台用户协议，使用后果由使用者自负。
- 请仅用于你有权访问的课程内容，**勿用于刷课、代刷、代挂等违规用途**。

## 📄 License

[MIT](LICENSE)
