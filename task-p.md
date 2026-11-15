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

## P0 · 基线取证 ⏳

- [ ] 截图确认：theme-btn 落到文档流顶部左侧、AI fab 消失（被 position:relative 拉走）
- [ ] 根因记录：`body>*:not(#tech-fx){position:relative}` 特异性 1,0,3 > 组件类选择器 0,1,0

## P1 · tech-fx 层级方案重做 ⏳

- [ ] 弃用 `body>*` 提层（误伤一切 fixed 组件）；改为**背景承接法**：把 body 计算出的背景搬到 html，body 背景置空，canvas 用 z-index:-1
- [ ] 好处：内容层零侵入（不再碰任何业务元素），fixed 组件天然在 canvas 之上
- [ ] 亮暗主题 + 门户/工作台截图复检

## P2 · 去 Mock 化 + 清引用 ⏳

- [ ] 15 台删除 `.mock`「MOCK DATA · 演示数据」徽标节点
- [ ] zcode-tast-cms 引用清零：README（姊妹项目/工作台清单）、门户卡片、content-ops 页内引用
- [ ] grep 断言：`MOCK DATA` 与 `zcode-tast-cms` 全仓 0 命中（CHANGELOG 历史记录除外）

## P3 · 虚拟员工数据资产 `assets/va-team.js` ⏳

- [ ] SVG 卡通头像工厂（纯内联无外部依赖）：肤色/发型/配饰/工装渐变参数化，15 位造型互异
- [ ] 15 位员工与 15 台工作台一一对应（SRE 值班、增长分析、客户成功、内容运营、AI 平台、供应链、财务、数据治理、算法评测、HR、客服、投放、IoT 运维、风控审核、实验科学）
- [ ] 每位含：姓名、职位、一句话人设、3 个技能标签、**专家级提示词**（含职责边界/方法论/输出格式，可直接投喂任意 LLM）
- [ ] `window.vaAvatar(id,size)` 渲染助手 + `window.VA_TEAM` 数据

## P4 · 团队主页面 `employees.html` ⏳

- [ ] 一页展示：头像 + 姓名/职位 + 人设描述 + 技能标签 + 可展开的专家提示词（一键复制 + 反馈）
- [ ] 部门筛选 chips（技术 / 增长 / 客户 / 职能）；亮暗主题；沿用 theme.css / term-tips / tech-fx
- [ ] 门户加入口按钮；README 补一句；页面 OG meta 齐全
- [ ] 手机单列 / 大屏网格目检

## P5 · 小助手重设计 ⏳

- [ ] fab 从通用 🤖 换成**本页对应虚拟员工的迷你卡通头像**（按路径自动映射，业务页面零配置）
- [ ] 面板头部：员工头像 + 姓名/职位 + 虚拟工号；底部「认识全团队 →」链到 employees.html
- [ ] insights/advice/alerts 逻辑零改动（只换壳不换脑）

## P6 · 回归验证 ⏳

- [ ] a11y 全页 0 问题；15 台截图全绿；`undefined` 渲染扫描 0 命中
- [ ] employees.html 三档宽度目检；复制功能实测

## P7 · 收尾推送 ⏳

- [ ] CHANGELOG 0.8.0；task-p.md 勾选；commit + push

---

## 持续跟进规则（沿用 task.md）

1. P1 修回归 > P2 去 Mock > P3/P4 主菜 > P5 换壳；时间不够砍 P5 不砍 P4；
2. 每完成一项：勾选 → commit；P7 统一 push；
3. 验收不过就回滚，不带病勾选。
