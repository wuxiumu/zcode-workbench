# ZCode Labs · FDE 工作台矩阵

> 一个「Forward Deployed Engineer」的自我宣传现场：把散落在各处的业务系统，收敛成一组**开箱即用、点开就能看**的工作台。
> 全部纯前端单文件应用，Mock 数据驱动，GitHub Actions 自动部署到 GitHub Pages —— **无需后端、无需数据库、无需配置**。

🌐 **在线入口**：https://wuxiumu.github.io/zcode-workbench/

## 工作台清单

| # | 工作台 | 定位 | 直达 |
|---|--------|------|------|
| 01 | 运维监控台 Ops Center | 服务器指标 · 服务状态 · 告警流 | [打开](https://wuxiumu.github.io/zcode-workbench/workbenches/ops-center/) |
| 02 | 增长分析台 Growth Analytics | GMV 漏斗 · DAU · 渠道归因 · 爆品榜 | [打开](https://wuxiumu.github.io/zcode-workbench/workbenches/growth-analytics/) |
| 03 | 客户成功台 CRM Workbench | 管道漏斗 · MRR · 健康度 · 流失预警 | [打开](https://wuxiumu.github.io/zcode-workbench/workbenches/crm-workbench/) |
| 04 | 内容运营台 Content Ops | 素材任务 · 渠道标签 · 审核队列（联动 zcode-tast-cms） | [打开](https://wuxiumu.github.io/zcode-workbench/workbenches/content-ops/) |
| 05 | AI Agent 观测台 Agent Observatory | Token 吞吐 · 模型延迟 · Trace · 成本燃烧 | [打开](https://wuxiumu.github.io/zcode-workbench/workbenches/agent-observatory/) |
| 06 | 供应链协同台 Supply Chain Hub | 库存水位 · 履约漏斗 · 供应商绩效 · 缺料预警 | [打开](https://wuxiumu.github.io/zcode-workbench/workbenches/supply-chain-hub/) |

## 为什么做这个矩阵

FDE 的价值不在于写代码，而在于**把客户的业务问题翻译成可运行的系统**。这个仓库用最小成本演示这条链路：

- **每个工作台都真实可访问** —— 不是截图，不是 PPT，是跑起来的页面；
- **每个工作台都讲一个业务故事** —— 运维 / 增长 / 客户 / 内容 / AI / 供应链，覆盖一家数字化公司最常见的六张作战地图；
- **每个工作台都是单文件** —— `workbenches/<name>/index.html`，复制粘贴即可嵌入任何系统，替换 Mock 数据源即为生产就绪。

## 技术形态

- 零构建：原生 HTML/CSS/JS + [ECharts](https://echarts.apache.org/)（CDN 引入），单文件交付；
- 零后端：Mock 数据由内置生成器产生，支持定时刷新模拟实时流；
- 零配置：Fork 本仓库即自动获得同款 Pages 站点。

## 持续迭代

路线与 backlog 见 [Issues](https://github.com/wuxiumu/zcode-workbench/issues)。
计划中的工作台：财务经营驾驶舱 · 数据资产目录 · LLM 评测台。

## 本地预览

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080
```

---

**作者**：[五朽木](https://github.com/wuxiumu) · FDE / 全栈工程师  
**姊妹项目**：[zcode-tast-cms](https://github.com/wuxiumu/zcode-tast-cms)（素材库·图文代发任务系统，PHP+React 全栈）
