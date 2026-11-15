# 更新日志 · CHANGELOG

> 本文件由持续优化流程维护：每轮优化追加一条。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。
> 在线站点：https://wuxiumu.github.io/zcode-workbench/

## [0.6.0] · 2026-11-15 · 真实内容与友好提示（第一原理轮）

按 `task.md` 60 分钟时间盒执行，北极星 = 访客 10 秒被说服。第一原理重审后选定两个最短木板：

### 新增（真实内容 · 因果叙事）
- ops-center 注入「5 幕故障剧本」（约 65s 循环）：pay-svc 抖动 → P1 告警 → 扩容介入 → 恢复，**曲线 ↔ 告警流 ↔ KPI ↔ AI 解读四层联动**（服务错误率/延迟按幕插值逼近，CPU 曲线同步抬升，顶部剧本条同步幕进度）
- AI 解读零改动自动呼应剧本（读 svcs），实测幕 3 自动弹出「pay-svc 错误率超阈值」告警 toast
- 顺带修真实度：基线错误率 0.01–0.6% → 0.01–0.12%（原开机近半服务"异常"，与"平稳运行"自相矛盾）、QPS 基线 ≥80 保幕 1 全绿

### 新增（友好提示 · 零门槛读懂）
- `assets/term-tips.js` 全站术语大白话：24 个词条以真实页面 grep 取证（ROAS/P99/Uplift/CPC/CTR/CPM/SLA/NPS/GMV/MRR/DAU/QPS/IOPS…），KPI 标签/面板标题/表头命中加虚线下划线，hover / 键盘 focus 弹「老板语言」解释
- MutationObserver 防抖补挂（每 2.6s 重绘的动态表格不遗漏）；贴顶自动下翻 + 左右边缘夹紧（两轮视觉验收修复）；fail-silent 绝不影响数据面板
- 16 页接入逐页断言（15 工作台 + 门户；boss 一页纸零术语设计、self-check 工具页跳过）
- 门户首访引导条：「自动导览 / ⌘K 搜索」两条路任选 + 预告术语即译，localStorage 一次性不打扰回头客

### 新增（流程）
- `task.md`：时间盒执行计划 + 持续跟进规则（做完一项勾一项，未完成滚入 roadmap 扩展候选）

### 验证
- `tools/a11y_audit.py` 17 页 0 问题 0 建议；15 台全量截图回归全绿；剧本三幕（平稳/P1/恢复）虚拟时间截图逐幕验收

## [0.7.0] · 2026-11-15 · 上线同步 + 双端适配 + 数据真实化 + 科技动画

按 `task.md` R0~R5 执行，四件事一条线：

### 上线同步
- 0.6.0 全部 5 commits 推上 origin/main（2376227..aacd6fb），GitHub Actions 自动部署 Pages

### 双端适配（大屏 / 手机）
- 修复手机档 H1 被 flex 挤成 1 字宽竖排（15 台全站生效；关键项 !important 钉住，页面级 style 后加载覆盖问题一并解决）
- 底部固定元素（返回 / MOCK 徽标 / AI fab）让位：移动端 body padding-bottom 64px
- 大屏档（1920）审计通过，门户已有 max-width 无需改动
- 390px 截图复检：标题横排、KPI 双列、网格单列、无横向溢出

### 数据真实化（15 台逐台扫过）
- growth-analytics：KPI 与漏斗单源互洽（GMV = 支付 × 客单价、转化率 = 支付/访客，弃硬编码与恒等式凑数）；爆品榜单价固定
- ads-performance：渠道饼图按权重切分 KPI 消耗（原双源对不上）；漏斗从 imps/clicks/conv 推导
- agent-observatory：调用 / Token / P95 从模型占比表推导；7d 成本 = 今日 × 7 × 占比（消除 7d $220 vs 单日 $180 矛盾）
- crm-workbench：NPS KPI 与曲线末位同源
- **预存 bug**：agent-obs ×1、crm ×2 行 4 元素数组配 5 元素模板 → 线上直出 "undefined"，修复并加精确检测（15 台复检全过）
- 其余 9 台审计达标（IoT 设备编号 / 供应商中文名 / 数据表 Owner 等实体命名已就绪）

### 科技动画
- `assets/tech-fx.js`：粒子网格背景（缓慢漂移 + 邻近连线），亮暗双配色，低透明度不喧宾夺主
- 降级三闸：prefers-reduced-motion 静态一帧；<768px 粒子减半；document.hidden 停帧
- 16 页接入逐页断言

### 验证
- `tools/a11y_audit.py` 17 页 0 问题；15 台全量截图全绿；390 / 1280 / 1920 三档目检

## [0.8.0] · 2026-11-16 · 去 Mock 化 + 虚拟员工团队 + 小助手重设计

按 `task-p.md` P0~P7 执行：

### 修复 · tech-fx 层级方案重做（P1）
- v1 的 `body>*` 提层规则特异性 1,0,3 压过组件 `position:fixed`（0,1,0），把 AI 小助手 / 主题按钮 / 徽标拉进文档流——"小助手样式乱"的根因
- v2 改 `body{isolation:isolate}` + canvas `z-index:-1`：画在 body 背景之上、内容之下，业务元素零侵入，主题切换的 CSS 变量背景依然生效

### 去 Mock 化 · 清引用（P2）
- 15 页删除「MOCK DATA · 演示数据」徽标（grep 断言 0 命中）
- zcode-tast-cms 全部引用清除：门户页脚与卡片描述、content-ops 页头与页内链接、README 工作台清单与姊妹项目行

### 新增 · 虚拟员工团队（P3/P4）
- `assets/va-team.js`：15 位与 15 张作战地图一一对应的虚拟员工——参数化 SVG 卡通头像（发型/配饰/工装全参数化，耳麦、单边镜、护目镜、安全帽、天线各具标志物）+ 一句话人设 + 技能标签 + **专家级提示词**（含职责边界/方法论/输出格式，复制即可投喂任意大模型）
- `employees.html` 团队主页：头像 + 描述 + 提示词一键复制（Clipboard API + execCommand 兜底），部门筛选（技术/增长/客户/运营/职能），亮暗主题，OG meta 齐全
- 门户 Hero 加「👥 虚拟员工团队」入口；README 技术形态补说明

### 重设计 · AI 解读助手（P5）
- fab 从通用 🤖 换成**本页对应虚拟员工的迷你卡通头像**（按路径自动映射，业务页面零配置）
- 面板头部显示员工身份（阿稳 · SRE 值班工程师 / 虚拟员工 · OPS CENTER · 在线），开屏问候改用人设文案
- 底部新增「👥 认识全团队」入口；insights/advice/alerts 逻辑零改动（只换壳不换脑）

## [0.5.0] · 2026-11-12 · 展示物料与工程加固（持续优化轮）

自动化定时任务按 `OPTIMIZATION_ROADMAP.md` 队列逐条执行，本轮完成 14 条：

### 新增（老板视角）
- 门户页「30 秒自动导览」：逐卡高亮 + 大白话业务价值字幕 + 进度条，支持 `?tour=auto` 深链自动播放与 `?tour=N` 定格
- `boss-one-pager.html`「一页纸看懂」：零术语三故事（发现问题 → 找到原因 → 挽回损失）+ 滚动触发动态大数字
- 15 个工作台头部副标题接入「一句话价值」（省了什么 / 赚了什么 / 避免了什么损失）
- 门户 Hero 统计条数字滚动动画（easeOutCubic，兼容 prefers-reduced-motion）

### 新增（同行专业性）
- `assets/theme.css`：全站设计令牌单一事实来源（核心色 11 变量 × 亮暗两套），15 工作台 link 引用剥离重复定义
- 门户页 ⌘K / Ctrl+K 命令面板：键盘快速跳转任意工作台（combobox 语义 + aria-activedescendant）
- `assets/export-tools.js`：全工作台图表一键导出 PNG / CSV（按 `_echarts_instance_` 自动发现实例，CSV 泛化提取 4 形态）
- `assets/perf-guard.js`：性能守卫 —— 后台标签页暂停刷新 + `echarts.init` 代理懒初始化（IntersectionObserver，fail-open 全兜底）
- `self-check.html` 回归自检页：真实加载 15 个工作台，结构 / 报错 / 渲染 / 组件接入四类检查红绿灯汇总
- `tools/a11y_audit.py` 可访问性审计工具：交互元素可访问名 + WCAG 对比度（文字 4.5:1 / 图形 3:1）
- 移动端基线 ≤768px：头部换行、价值副标题独占一行、网格防撑破

### 新增（展示物料）
- README「效果速览」：真实截图 ×3 + 30 秒导览 GIF（`docs/showcase.gif`，无头浏览器自动合成）
- `docs/architecture.svg` 系统架构图（浏览器组件图 + 部署链路 + 访客回路）
- `tools/screenshot.sh` / `tools/make_showcase_gif.py`：截图与 GIF 自动化工具
- 全站 18 页补 OG meta（title/description/og:url，三页带真实截图 og:image）—— 分享到聊天工具有规范卡片

### 修复
- **P0**：ops-center 四张图表从未渲染 —— 创建时即存在的非法轴键 `x`/`y`（应为 `xAxis`/`yAxis`），无头截图验证恢复
- boss-one-pager 未定义变量 `--acc2-line`；门户 `reducedMotion` 重复声明
- 可访问性：17 页 theme-btn 补 aria-label；亮色 `--warn` 对比度 2.97→4.49:1；全局 prefers-reduced-motion 支持

## [0.4.0] · 2026-11-11 · AI 解读助手

- 新增 `assets/ai-assistant/` 独立组件：机器人面板 + Toast 系统，一个 `<script>` 接入任意工作台
- 全工作台接入，解读内容由各页实时数据配置注入（非固定文案）
- 数据可达性加固：ECharts CDN 三级回退（jsdelivr → npmmirror → unpkg → cdnjs）+ stub 兜底保住文字数据面板

## [0.3.0] · 2026-11-11 · 亮暗主题全站覆盖

- 15 个工作台 + 门户页分五批（10a–10e）接入亮暗主题切换：变量化取色 + 图表重建
- 主题偏好持久化（localStorage `zwb-theme`），全站互通

## [0.2.0] · 2026-11-11 · 十五张作战地图

15 个业务工作台陆续上线（纯前端单文件，Mock 数据驱动）：

| # | 工作台 | 核心内容 |
|---|--------|----------|
| 01 | 运维监控台 | 实时指标曲线、服务矩阵、告警流 |
| 02 | 增长分析台 | GMV 漏斗、渠道归因、爆品榜、下单热力 |
| 03 | 客户成功台 | MRR、管道漏斗、健康度、流失预警 |
| 04 | 内容运营台 | 素材生命周期、审核队列（联动 zcode-tast-cms） |
| 05 | AI Agent 观测台 | Token 吞吐、Trace 瀑布、成本燃烧 |
| 06 | 供应链协同台 | 库存水位、履约漏斗、缺料预警 |
| 07 | 财务经营驾驶舱 | 三表趋势、现金流预测、账龄分布 |
| 08 | 数据资产目录 | 血缘图谱、质量分趋势、Owner 责任制 |
| 09 | LLM 评测台 | 模型横评雷达、回归趋势、Badcase |
| 10 | HR 人力效能台 | 入离职趋势、招聘漏斗、绩效分布 |
| 11 | 客服工单台 | 工单分时、SLA 达标、坐席负载 |
| 12 | 营销投放台 | 渠道消耗、ROAS 趋势、亏损预警 |
| 13 | IoT 设备监控台 | 在线率、告警流水、固件分布 |
| 14 | 内容审核台 | 机审人审堆叠、违规分布、申诉处理 |
| 15 | A/B 实验台 | Uplift 分布、样本累积、显著性占比 |

门户页同步上线：搜索 + 标签筛选 + 卡片微动效。

## [0.1.0] · 2026-11-11 · 项目奠基

- 门户首页：FDE 工作台矩阵导航
- GitHub Pages 自动部署工作流（`.github/workflows/pages.yml`）+ `.nojekyll`

---

[0.8.0]: https://github.com/wuxiumu/zcode-workbench/compare/a9c5408...HEAD
[0.7.0]: https://github.com/wuxiumu/zcode-workbench/compare/aacd6fb...a9c5408
[0.6.0]: https://github.com/wuxiumu/zcode-workbench/compare/2376227...aacd6fb
[0.5.0]: https://github.com/wuxiumu/zcode-workbench/compare/99f9201...2376227
[0.4.0]: https://github.com/wuxiumu/zcode-workbench/compare/2fa4ddf...99f9201
[0.3.0]: https://github.com/wuxiumu/zcode-workbench/compare/739480a...2fa4ddf
[0.2.0]: https://github.com/wuxiumu/zcode-workbench/compare/9ae3d16...739480a
[0.1.0]: https://github.com/wuxiumu/zcode-workbench/commits/f6be024
