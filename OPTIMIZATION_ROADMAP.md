# FDE 工作台矩阵 · 持续优化路线图

> 本文件是自动化优化任务的「任务队列」。每轮定时运行：
> 1. 从上往下找第一个未勾选的 `[ ]` 条目（若该条目依赖浏览器截图/录像且环境不可用，则跳过选下一个）；
> 2. **只完成这一个条目**，改动小而聚焦，不顺手大重构；
> 3. 完成后把 `[ ]` 改为 `[x]`，并在条目末尾追加 `（✅ YYYY-MM-DD 完成）`；
> 4. `git add -A && git commit`，提交信息沿用仓库风格（`feat(opt):` / `feat(portal):` / `docs:` + 中文描述），**不要 push**；
> 5. 若所有条目已完成，从「扩展候选」里挑一条追加到对应分区，再执行它。

目标双线：**[老板]** = 不懂技术的人 10 秒看懂价值；**[同行]** = 展示工程与业务专业性；**[物料]** = 对外展示素材。

---

## A. 老板视角 · 一眼看懂

- [x] [老板] 门户页新增「30 秒自动导览」按钮：点击后依次高亮各工作台卡片，配一句大白话业务价值（"这张图告诉你公司每天赚多少钱"），播放时自动轮播，可随时停止（✅ 2026-11-12 完成）
- [x] [老板] 新增 `boss-one-pager.html`「一页纸看懂」：零术语，用 3 个故事讲清 FDE 价值（发现异常 → 定位原因 → 挽回损失），大字号动态数字 + 简单示意图，从门户页入口进入（✅ 2026-11-12 完成）
- [x] [老板] 每个工作台头部副标题改为「一句话价值」：用"省了什么 / 赚了什么 / 避免了什么损失"句式重写（15 个工作台逐个过）（✅ 2026-11-12 完成）
- [x] [老板] 门户页顶部 Hero 区加一行动态数字带（总工作台数 / 覆盖业务域 / 覆盖指标数），数字滚动动画呈现（✅ 2026-11-12 完成：复用现有 Hero 统计条，首渲染数字 0→目标滚动动画，兼容 prefers-reduced-motion，顺带修复 reducedMotion 重复声明）

## B. 同行视角 · 专业性

- [x] [同行] 抽取全站设计变量到 `assets/theme.css`（颜色/间距/圆角统一 token），各工作台引用，消除重复定义（✅ 2026-11-12 完成：核心色 11 变量 × 亮暗两套收编为单一事实来源，15 个工作台 link 引用并剥离内联重复；每页专属强调色与氛围光保留页级；agent-observatory 的 --track 单页特例保留覆盖；顺带修复 boss-one-pager 未定义的 --acc2-line；间距/圆角 token 化为后续迭代）
- [x] [同行] 门户页加 ⌘K / Ctrl+K 命令面板：键盘快速搜索并跳转任意工作台，支持上下键与回车（✅ 2026-11-12 完成：combobox/listbox 语义 + aria-activedescendant，悬停即选中，搜索框旁加 ⌘K 快捷键提示）
- [x] [同行] 每个工作台图表支持「导出 PNG」与「导出 CSV」按钮（ECharts 自带 getDataURL，CSV 由 Mock 数据生成）（✅ 2026-11-12 完成：新建共享组件 assets/export-tools.js，按 _echarts_instance_ 自动发现全部图表实例并注入悬浮按钮（父容器 hover 显示），15 工作台一行接入；PNG 2 倍像素比+当前主题背景，CSV 由 getOption 泛化提取（直角坐标/饼图/对象值/散点对 4 形态，5 组单测），带 BOM 防 Excel 乱码；stub 兜底模式静默退出）
- [x] [同行] 可访问性巡检：交互元素补 aria-label、检查亮暗主题文字对比度、支持 prefers-reduced-motion 关闭动效（✅ 2026-11-12 完成：新增可复用审计工具 tools/a11y_audit.py（结构类检查 + WCAG 对比度：文字 4.5:1 / 图形 1.4.11 3:1）；修复 17 页 theme-btn 无可访问名；theme.css 全局补 prefers-reduced-motion 规则；亮色 --warn #d97706→#b45309 使对比度 2.97→4.49:1；终审 17 页 0 问题 0 建议）
- [x] [同行] 性能优化：图表用 IntersectionObserver 懒初始化，页面不可见时停止实时刷新定时器（document.visibilityState）（✅ 2026-11-12 完成：新建 assets/perf-guard.js 同步加载于 ECharts 加载器后——setInterval 包装使后台标签页跳过刷新回调；echarts.init 代理懒初始化（rootMargin 250px，调用排队、物化按序重放、派发 wb:chart-real 供 export-tools 补挂按钮）；全链路 fail-open（无 IO/stub/detached/异常均退回原生）；6 组 Node mock 行为单测全过；顺带修 export-tools 支持"后物化"图表补挂按钮）
- [x] [同行] 移动端响应式完善：≤768px 下卡片单列、图表高度自适应、筛选栏可横向滚动（✅ 2026-11-12 完成：摸底确认 15 页已有 900/1000px 断点（KPI 双列+网格单列），theme.css 补共享 ≤768px 基线——头部允许换行、一句话价值副标题独占一行、.grid/.panel min-width:0 防内容撑破网格；类名全站同名故一处生效）
- [x] [同行] 新增 `self-check.html` 自检页：iframe 逐个加载 15 个工作台，捕获加载报错并汇总红绿表格，作为回归冒烟工具（✅ 2026-11-12 完成：同源 fetch + 注入 error 钩子与 <base> 后 srcdoc 真实加载；检查结构完整性/运行时报错/canvas 渲染/三组件接入（perf-guard/export-tools/ai-assistant），红绿灯汇总表+总耗时；门户页脚加入口；node --check 拦截并修复了清理死代码时的函数边界错误）

## C. 展示物料 · 图文与动效

- [x] [物料] README 顶部补 badges（Pages 在线 / 工作台数量 / 纯前端 / License）+ 精选 3 张工作台截图（用 Playwright 截图脚本 `tools/screenshot.js`，若环境无浏览器则改为手绘 SVG 示意图）（✅ 2026-11-12 完成：发现本机 Playwright Chromium headless shell 缓存可原生 --screenshot，免装 npm 包；新增 tools/screenshot.sh（自动定位浏览器/15 台全量或指定截图/服务自管）；docs/screens/ 三张真实截图进 README「效果速览」；**过程中揪出并修复 ops-center 图表从未渲染的预存 P0**（非法轴键 x/y），真实截图首次验证全站渲染）
- [x] [物料] 用 Playwright 录制门户页 30 秒导览 GIF 存到 `docs/showcase.gif` 并嵌入 README（环境不可用则制作 CSS 动画演示页替代）（✅ 2026-11-12 完成：无 Playwright npm，改用缓存 Chromium headless shell——门户导览新增 ?tour=auto 自动播放与 ?tour=N 同步定格深链（兼具分享价值），1280x2400 全页帧避开滚动竞态，tools/make_showcase_gif.py 检测聚光灯位置裁窗+PingFang/Hiragino 自绘字幕条+贪心换行，PIL 合成 17 帧 1MB GIF 嵌入 README）
- [x] [物料] 新增 `docs/architecture.svg` 架构图：纯前端单文件 + Mock 生成器 + Pages 部署链路 + AI 解读组件接入方式，嵌入 README（✅ 2026-11-12 完成：手绘 SVG 与站点同款暗色设计语言，两层结构（访客浏览器组件图 + git push→Actions→Pages 部署链路+访客回路），无头浏览器渲染目检通过，XML 校验通过）
- [x] [物料] 新增 `CHANGELOG.md`：按 git 历史回溯整理版本线（01→11b），以后每轮优化追加一条（✅ 2026-11-12 完成：五段版本线 0.1.0→0.5.0（奠基/十五张地图/亮暗主题/AI 助手/持续优化轮），Keep a Changelog 风格 + compare 链接，README「持续迭代」节加入口）
- [x] [物料] 每个工作台 `<head>` 补 OG meta（title/description），分享到聊天工具时出现规范卡片（✅ 2026-11-12 完成：18 页全量（15 工作台+门户+一页纸+自检页），og:description 复用各页一句话价值，og:image 指向已上线真实截图（3 页），og:url 规范地址；脚本注入+逐页断言，C 线全部收官）

## 扩展候选（全部完成后从这里取）

- [ ] [同行] 新增第 16 个工作台候选：安全态势台（攻击地图 / 漏洞 SLA / 权限异常）
- [ ] [老板] 每个工作台加「打印/导出 PDF 友好样式」
- [ ] [同行] ECharts 主题注册中心：亮暗主题色集中管理，一处改全局生效
- [ ] [物料] 门户页接入真实站点健康自检（fetch 各工作台路径，绿点亮起）
- [ ] [同行] AI 解读助手增加「对比解读」模式：同时解读两个指标的变化关系
