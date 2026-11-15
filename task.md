# 优化执行计划 · task.md（本轮：上线同步 + 大屏/手机适配 + 数据真实化 + 科技动画）

> **第一原理**：线上站点 https://wuxiumu.github.io/zcode-workbench/ 是这个橱窗的门面。
> 访客只分两种设备（大屏 / 手机）和一种判断（数据像不像真的、页面有没有"科技感"）。
> 本轮四件事：**① 先把已完成的 0.6.0 推上 git 让线上更新 → ② 全站响应式双档适配 → ③ 15 台数据逐台真实化 → ④ 全站科技动画（克制、可降级）**。
> 模式不变：做完一项勾一项，每项小步提交，验收不过就回滚。

## 时间盒总览

| 阶段 | 任务 | 交付物 | 验收标准 |
|------|------|--------|----------|
| R0 5min | 推送 git，触发 Pages 部署 | origin/main 同步 | push 成功 + 部署工作流触发 |
| R1 25min | 响应式双档审计与修复（390px 手机 / 1920px 大屏） | theme.css + 逐页修正 | 代表页 390/1920 截图目检：无横向溢出、无元素重叠、大屏不松散 |
| R2 35min | 15 台数据真实化逐台扫过 | 各台 index.html 数据段 | 实体有名字、量纲成体系、口径互洽（KPI 由图表数据推导）、无自相矛盾状态 |
| R3 15min | 科技动画 `assets/tech-fx.js` | 共享组件 + 16 页接入 | 粒子网格背景门户+工作台统一；prefers-reduced-motion / 移动端自动降级；不挡交互 |
| R4 10min | 回归验证 | 三档宽度截图 + a11y | 390/1280/1920 三档截图、a11y 0 问题、15 台全绿 |
| R5 5min | 收尾推送 | CHANGELOG 0.7.0 + push | commit + push origin main |

---

## R0 · 推送 git，线上同步 ✅

- [x] `git push origin main`：2376227..aacd6fb 已推送，GitHub Actions 自动部署 Pages（✅ 2026-11-15 执行，线上几分钟后生效）
- [x] 确认部署链路：.github/workflows/pages.yml 已配置（0.1.0 奠基，历轮验证可用）

## R1 · 响应式双档审计与修复 ✅

- [x] **审计**：门户 + ops-center / growth-analytics / finance-cockpit 在 390×844 与 1920×1200 双档截图（✅ 手机档揪出 H1 竖排 + 徽标压内容；大屏档门户已有 max-width 无需改动）
- [x] **手机档修复**（theme.css ≤768 基线，15 台结构已验证同名故一处生效）：`.top h1 display:block!important` 修复 flex 挤压竖排；body padding-bottom 64px 让位底部固定元素（✅ 关键项 !important 钉住——页面级 style 后加载会覆盖同优先级规则，这是上轮基线失效的根因）
- [x] **复检**：390px 截图标题横排、KPI 双列、无溢出

## R2 · 15 台数据真实化逐台扫过 ✅

- [x] 批量摸底：grep 15 台生成器参数 + KPI 口径（✅ 短板集中在 4 台：growth / ads / agent-obs / crm，其余 9 台实体命名与勾稽子文案已达标）
- [x] growth-analytics：KPI 与漏斗单源互洽（GMV = 支付×客单价、转化率 = 支付/访客），爆品固定单价，趋势今日值 = KPI DAU（✅ dump-dom 实测 ¥434,816 = 87,104×3.90%×¥128 精确勾稽）
- [x] ads-performance：渠道饼按权重切分 KPI spend（消除 ¥48,939 vs ¥49,390 双源）；漏斗从 imps/clicks/conv 推导
- [x] agent-observatory：调用/Token/P95 从模型占比表推导；7d 成本 = 今日×7×占比；Token 单价 $2.3/M 勾稽
- [x] crm-workbench：NPS KPI 与曲线末位同源
- [x] **顺带揪出线上预存 bug**：agent-obs ×1、crm ×2 行 4 元素数组配 5 元素模板 → 线上直出 "undefined" 文本（已修 + 精确检测脚本复检 15 台全过）

## R3 · 科技动画 `assets/tech-fx.js` ✅

- [x] 共享组件：粒子网格画布（缓慢漂移 + 邻近连线），低透明度不喧宾夺主；亮暗双配色逐帧读 data-theme
- [x] 降级三闸：prefers-reduced-motion 静态一帧；<768px 粒子减半；document.hidden 停帧
- [x] 层级约定：canvas z-index:0 + body>* 提 z-index:1，主题按钮/AI fab 不受影响；pointer-events:none
- [x] 16 页接入逐页断言；亮暗两套截图目检通过

## R4 · 回归验证 ✅

- [x] 390 / 1280 / 1920 三档目检（growth 手机档：H1 横排 + KPI 漏斗勾稽 + 粒子入镜）
- [x] `tools/a11y_audit.py`：17 页 0 问题 0 建议
- [x] 15 台全量截图无 ✗

## R5 · 收尾推送 ✅

- [x] `CHANGELOG.md` 追加 0.7.0（compare 链接 aacd6fb...HEAD）
- [x] `task.md` 勾选结果
- [x] commit + `git push origin main`

---

## 本轮结果（2026-11-15 · R0~R5 全部完成）

| 提交 | 内容 |
|------|------|
| （R0）| 0.6.0 五个提交推上 origin/main，Pages 部署触发 |
| fix(opt) R1 | 手机档 H1 竖排修复 + 底部元素让位 |
| fix(opt) R2 | 四台单源改造 + 两台线上 undefined 预存 bug 修复 |
| feat(opt) R3 | tech-fx.js 粒子网格（16 页接入） |
| docs R5 | CHANGELOG 0.7.0 + push |

**线上**：https://wuxiumu.github.io/zcode-workbench/ （push 后 GitHub Actions 自动部署）

## 持续跟进规则（沿用）

1. 执行顺序即优先级：R1 适配 > R2 数据 > R3 动画（时间不够砍 R3 不砍 R1/R2）；
2. 每完成一项：勾选 → commit；R5 统一 push；
3. 验收不通过：回滚该项改动，不带病勾选；
4. 每轮开工前先跑基线（本轮基线 = R0 推送后线上可达）。

## 上一轮结果（0.6.0 · 2026-11-15，详见 CHANGELOG）

ops-center 5 幕故障剧本（四层联动）+ term-tips 术语大白话（16 页）+ 门户首访引导，4 commits，a11y 0 问题、15 台截图全绿。已随 R0 推上线上。
