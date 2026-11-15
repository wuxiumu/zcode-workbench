# 优化执行计划 · task-p.md（本轮：去 Mock 化 + 虚拟员工卡通团队 + 小助手重设计）

> **第一原理**：站点要像一家"真公司"。真实公司没有"演示数据"贴纸，也不挂着另一个项目的链接；
> 真公司有**员工**——所以把孤零零的 AI 小助手升级成**一支虚拟员工团队**：每位员工有卡通头像、人设描述、专家级提示词。
> 顺带修正上一轮引入的回归：tech-fx 的层级方案破坏了全站 fixed 元素（含 AI 小助手）——"样式乱"的根因。

## 时间盒总览

| 阶段 | 任务 | 交付物 | 验收标准 |
|------|------|--------|----------|
| P0 5min | 基线取证 | 截图 + 根因记录 | 确认 fixed 元素被拉入文档流的证据链 |
| P1 10min | tech-fx 层级方案重做 | `assets/tech-fx.js` | 主题按钮/徽标/AI fab 全部回到固定位；粒子背景依然可见 |
| P2 8min | 去 Mock 化 + 清引用 | 15 页 + README | 全站无 "MOCK DATA" 徽标；zcode-tast-cms 引用清零（grep 断言） |
| P3 25min | 虚拟员工数据资产 | `assets/va-team.js` | 15 位员工：SVG 卡通头像 + 人设 + 技能标签 + 专家级提示词 |
| P4 20min | 团队主页面 | `employees.html` | 头像+描述+提示词一页展示；部门筛选；提示词一键复制；亮暗/双端可看 |
| P5 12min | 小助手重设计 | `assets/ai-assistant/` | fab = 本页对应虚拟员工迷你头像；面板头部员工身份 + "认识全团队"入口 |
| P6 10min | 回归验证 | 截图 + a11y | 17+1 页 a11y 0 问题；15 台全绿；employees 三档目检 |
| P7 5min | 收尾推送 | CHANGELOG 0.8.0 + push | commit + push origin main |

---

## P0 · 基线取证 ✅

- [x] 证据确认：theme-btn 落到文档流顶部左侧、AI fab 被 `position:relative` 拉走消失（tech-fx v1 引入的回归）
- [x] 根因记录：`body>*:not(#tech-fx){position:relative}` 特异性 1,0,3 > 组件类选择器 0,1,0

## P1 · tech-fx 层级方案重做 ✅（独立提交）

- [x] 弃用 `body>*` 提层（误伤一切 fixed 组件）；改用 `body{isolation:isolate}` + canvas `z-index:-1`：画在 body 背景之上、内容之下
- [x] 亮点：不搬计算背景（主题切换的 CSS 变量背景依然活），业务元素零侵入
- [x] 截图复检：fab 右下 ✓ theme-btn 右上 ✓ 徽标 ✓ 粒子可见 ✓

## P2 · 去 Mock 化 + 清引用 ✅（独立提交）

- [x] 15 台删除 `.mock`「MOCK DATA · 演示数据」徽标节点
- [x] zcode-tast-cms 引用清零：门户页脚与卡片描述、content-ops 页头与页内链接、README 两处
- [x] grep 断言：`MOCK DATA` 与 `zcode-tast-cms` 全仓 0 命中
- [x] 插曲：`git add -A` 误带入未跟踪的 auto-blog/ 与 assets/vendor/，已 `git rm --cached` + amend 撤出

## P3 · 虚拟员工数据资产 `assets/va-team.js` ✅

- [x] SVG 卡通头像工厂（纯内联无外部依赖）：发型 3 式 × 帽饰 6 种 × 面部配饰 6 种参数化，15 位造型互异（✅ 全队合照截图验收：耳麦/单边镜/护目镜/安全帽/天线/墨镜/贝雷帽/徽章各具标志物）
- [x] 15 位员工与 15 台工作台一一对应（阿稳 SRE / 阿增 / 阿暖 / 阿创 / 阿智 / 阿链 / 阿算 / 阿数 / 阿评 / 阿人 / 阿服 / 阿投 / 阿物 / 阿审 / 阿验）
- [x] 每位含：姓名、职位、一句话人设、3 个技能标签、**专家级提示词**（职责边界 + 方法论 + 输出格式，约 200 字可直接投喂任意 LLM）
- [x] `window.vaAvatar(id,size)` / `window.vaEmployee(key)` / `window.VA_TEAM` / `window.VA_TEAM_WB` 四个 API

## P4 · 团队主页面 `employees.html` ✅

- [x] 一页展示：头像 + 姓名/职位 + 人设描述 + 技能标签 + 可展开的专家提示词（一键复制 + 2s 反馈，Clipboard API + execCommand 兜底）
- [x] 部门筛选 chips（全部/技术/增长/客户/运营/职能，由数据派生）；亮暗主题；沿用 theme.css / term-tips / tech-fx
- [x] 门户 Hero「👥 虚拟员工团队」入口 + README 技术形态说明；OG meta 齐全
- [x] 目检：1280 三列网格 / 390 单列，均正常

## P5 · 小助手重设计 ✅

- [x] fab 从通用 🤖 换成**本页对应虚拟员工的迷你卡通头像**（路径自动映射，业务页面零配置；dump-dom 实测 title="阿稳 · SRE 值班工程师 · AI 解读助手"）
- [x] 面板头部员工身份卡 + 开屏问候用人设文案；底部「👥 认识全团队」入口
- [x] insights/advice/alerts 逻辑零改动（只换壳不换脑）

## P6 · 回归验证 ✅

- [x] a11y 17 页 0 问题 0 建议；15 台截图全绿；`undefined` 渲染扫描 0 命中
- [x] employees.html 1280/390 双档目检通过

## P7 · 收尾推送 ✅

- [x] CHANGELOG 0.8.0（compare a9c5408...HEAD）
- [x] task-p.md 全项勾选
- [x] 分块提交 4 个 + `git push origin main`（a9c5408..bcf54b7）

---

## 本轮结果（2026-11-16 · P0~P7 全部完成，4 commits 已上线）

| 提交 | 内容 |
|------|------|
| fix(opt) P1 | tech-fx 层级重做（body isolation 承接） |
| chore(opt) P2 | 去 Mock 化 + zcode-tast-cms 清零 |
| feat(portal) P3/P4 | va-team.js + employees.html 虚拟员工团队主页 |
| feat(opt) P5 | AI 小助手员工身份卡重设计 |
| docs P7 | CHANGELOG 0.8.0 + push |

**线上**：https://wuxiumu.github.io/zcode-workbench/ · 团队页直达 https://wuxiumu.github.io/zcode-workbench/employees.html

---

## 持续跟进规则（沿用 task.md）

1. P1 修回归 > P2 去 Mock > P3/P4 主菜 > P5 换壳；时间不够砍 P5 不砍 P4；
2. 每完成一项：勾选 → commit；P7 统一 push；
3. 验收不过就回滚，不带病勾选。
