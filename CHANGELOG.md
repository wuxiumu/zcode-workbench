# 更新日志 · CHANGELOG

> 本文件由持续优化流程维护：每轮优化追加一条。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。
> 在线站点：https://wuxiumu.github.io/zcode-workbench/

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

[0.5.0]: https://github.com/wuxiumu/zcode-workbench/compare/99f9201...HEAD
[0.4.0]: https://github.com/wuxiumu/zcode-workbench/compare/2fa4ddf...99f9201
[0.3.0]: https://github.com/wuxiumu/zcode-workbench/compare/739480a...2fa4ddf
[0.2.0]: https://github.com/wuxiumu/zcode-workbench/compare/9ae3d16...739480a
[0.1.0]: https://github.com/wuxiumu/zcode-workbench/commits/f6be024
