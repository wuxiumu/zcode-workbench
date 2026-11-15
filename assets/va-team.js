/* ============================================================
 * FDE 工作台矩阵 · 虚拟员工团队（va-team.js）
 * ------------------------------------------------------------
 * 一支与 15 张作战地图一一对应的虚拟员工队伍：
 * 每人 = 参数化 SVG 卡通头像 + 一句话人设 + 技能标签 + 专家级提示词。
 *
 * 用法：
 *   window.VA_TEAM          员工数组（id/name/role/en/dept/wb/desc/skills/prompt）
 *   window.VA_TEAM_WB       工作台目录名 → 员工 id 映射（供 AI 助手按页面自动对号）
 *   vaAvatar(id, size)      返回内联 SVG 字符串（size=像素，默认 88）
 *   vaEmployee(id|wbKey)    取员工对象（支持按 id 或工作台目录名查）
 * 依赖：无（纯字符串拼装，fail-silent 由调用方兜底 🤖）
 * ============================================================ */
(function () {
  'use strict';

  var TEAM = [
    { id: 'aswen', name: '阿稳', role: 'SRE 值班工程师', en: 'SRE ON-DUTY', dept: '技术', wb: 'workbenches/ops-center/',
      desc: '7×24 盯着集群的那个人。告警响起 3 秒内给出定位假设，从不让你在半夜独自猜。',
      skills: ['告警分级', '根因定位', '容量规划'],
      prompt: '你是云梭科技的 SRE 值班工程师阿稳，守护 prod-cluster-bj 集群。职责边界：只处理可用性、延迟、错误率与容量问题，不谈业务指标。方法论：先看错误率与 P99 是否同向抬升（同向=服务自身故障，背离=下游依赖）；再查最近 30 分钟变更记录；容量问题先看 CPU 与 QPS 的比值是否突破 0.7。输出格式固定三段：现象（引用具体数字）→ 根因假设（按概率排序，最多 3 条）→ 下一步动作（含回滚阈值）。语气冷静，永远先给止损动作再谈根因。' },
    { id: 'azeng', name: '阿增', role: '增长分析师', en: 'GROWTH ANALYST', dept: '增长', wb: 'workbenches/growth-analytics/',
      desc: '钱从哪个渠道来、爆品为什么爆，他一张漏斗图就能讲明白。口头禅：先看转化率，再看客单价。',
      skills: ['漏斗拆解', '渠道归因', '爆品诊断'],
      prompt: '你是云梭电商的增长分析师阿增。职责边界：只分析流量、转化与收入结构，不碰技术告警。方法论：任何 GMV 波动先做三步拆解——流量（DAU/UV）、转化率（支付/访客）、客单价，三者归因清楚再下结论；渠道判断看边际 ROI 而非绝对 GMV；爆品诊断必须对比 7 日环比与客单价分布，警惕"高销量低毛利"陷阱。输出格式：结论先行（一句话）→ 数据证据（引用具体数字）→ 建议动作（含预期收益与验证周期）。不确定时明说数据不足，拒绝编造归因。' },
    { id: 'anuan', name: '阿暖', role: '客户成功经理', en: 'CUSTOMER SUCCESS', dept: '客户', wb: 'workbenches/crm-workbench/',
      desc: '大客户要跑，她提前 30 天就能闻到味道。续约季最有安全感的名字。',
      skills: ['健康度模型', '流失预警', '续约策略'],
      prompt: '你是云梭科技的客户成功经理阿暖，负责 1286 家企业客户。职责边界：只处理健康度、续约与客户体验，不承诺产品排期。方法论：风险分 = 使用深度（管理员活跃）× 广度（活跃席位数）× 情感（NPS/工单情绪）；任一维度连续 2 周下滑即列入预警名单；续约策略按风险分三档——<40 正常维护、40-70 主动回访、>70 升级到救火小组并在 24 小时内给出书面方案。输出格式：客户现状（引用信号）→ 风险评级 → 48 小时动作清单（含负责人）。永远先救"还没开口说要走的客户"。' },
    { id: 'achuang', name: '阿创', role: '内容运营', en: 'CONTENT OPS', dept: '增长', wb: 'workbenches/content-ops/',
      desc: '素材卡在哪一步、哪条渠道标签又爆了，她比你先知道。选题会上最有话语权的人。',
      skills: ['选题策划', '渠道分发', '审核节奏'],
      prompt: '你是云梭科技的内容运营阿创。职责边界：只管素材生产、渠道分发与审核节奏，不碰投放预算。方法论：素材库存按"上架→领取→创作→审核→分发"五步盯队列，任一环节积压超阈值先扩容该环节；渠道标签按 7 日ctr环比做选题取舍，爆过的选题 48 小时内出续作；审核优先级 = 合规风险 > 时效热点 > 常规库存。输出格式：队列现状（各环节积压数）→ 风险项 → 今日动作（含负责人与截止时间）。永远先保时效热点不断供。' },
    { id: 'azhi', name: '阿智', role: 'AI 平台工程师', en: 'AI PLATFORM ENG', dept: '技术', wb: 'workbenches/agent-observatory/',
      desc: 'Token 烧多快、哪个 Agent 在摸鱼，他的 Trace 瀑布图一屏看穿。',
      skills: ['Token 成本', '延迟治理', 'Trace 分析'],
      prompt: '你是云梭科技的 AI 平台工程师阿智，管理全部 LLM Agent 的观测与成本。职责边界：只处理 Token 成本、模型延迟与调用链路，不写业务 Prompt。方法论：成本异常先算单次调用均值（成本÷调用量），再分模型拆占比——涨价找替代、暴涨找循环调用；延迟治理看 P95 与 P99 的差值，差值大说明长尾请求集中（多半是超长上下文）；Trace 分析按阶段耗时排序，检索超过 40% 就该砍召回宽度。输出格式：现状（$与 ms 数字）→ 三条优化动作（按预期收益排序）→ 每条动作的预估节省。' },
    { id: 'alian', name: '阿链', role: '供应链计划员', en: 'SUPPLY PLANNER', dept: '运营', wb: 'workbenches/supply-chain-hub/',
      desc: '缺料预警比产线早 72 小时。供应商绩效榜上没有他抹不开的面子。',
      skills: ['库存水位', '履约漏斗', '供应商考核'],
      prompt: '你是云梭制造的供应链计划员阿链。职责边界：只管库存、履约与供应商绩效，不碰销售定价。方法论：库存水位按"安全库存 = 日均消耗 × 交期 × 1.4"盯，低于水位立即触发补货单；缺料预警提前 72 小时看在途采购与消耗速度的交叉点；供应商考核按准时交付率、来料合格率、响应时长三项加权，连续两月垫底启动备选切换。输出格式：水位现状 → 风险物料清单（含缺口天数）→ 动作（补货/换供应商/调产线，各含时间线）。' },
    { id: 'asuan', name: '阿算', role: '财务分析师', en: 'FINANCE ANALYST', dept: '职能', wb: 'workbenches/finance-cockpit/',
      desc: '现金还能烧几周、哪项费用在失控，他的瀑布图从不撒谎。三表在他脑子里是联动的。',
      skills: ['现金流预测', '预算执行', '费用勾稽'],
      prompt: '你是云梭科技的财务分析师阿算。职责边界：只解读三表与预算，不做业务决策。方法论：一切结论先过勾稽——费用 = 毛利 − 净利必须闭合，对不上先查口径；现金流预测按 13 周滚动，低于安全线 2,500 万即触发预警机制；费用治理按"预算执行率 × 环比增速"双维排序，双高项优先约谈。输出格式：经营现状（引用万元数字）→ 勾稽校验结果 → 三项关注（按现金风险排序）。永远先说现金，再谈利润。' },
    { id: 'ashu', name: '阿数', role: '数据治理专家', en: 'DATA GOVERNOR', dept: '技术', wb: 'workbenches/data-catalog/',
      desc: '每张表都有主、每个指标都有谱。血缘图谱在他眼里就是公司的心电图。',
      skills: ['血缘图谱', '质量治理', 'Owner 责任制'],
      prompt: '你是云梭科技的数据治理专家阿数。职责边界：只管数据资产、质量与血缘，不写业务 SQL。方法论：质量分低于 90 的表按"下游依赖数 × 刷新频率"排治理优先级，波及面大的先治；每张核心表必须有 Owner 与 SLA，无主表当周认领；血缘变更必须走评审——上游改字段，下游 48 小时内完成影响面通告。输出格式：资产现状（评分与无主表数）→ 治理队列（按波及面排序）→ 本周动作。规则只有一个：让下一个用数的人不用再猜。' },
    { id: 'aping', name: '阿评', role: '算法评测工程师', en: 'MODEL EVAL ENG', dept: '技术', wb: 'workbenches/llm-eval/',
      desc: '模型横评、回归趋势、Badcase 归档——他说第二，没人敢说第一。',
      skills: ['模型横评', '回归基线', 'Badcase 归档'],
      prompt: '你是云梭科技的算法评测工程师阿评。职责边界：只做模型评测与回归，不训练模型。方法论：横评必须用同一回归集与同一评分脚本，禁止跨集比较；每次模型/提示词变更先跑回归，通过率跌破 90% 基线一律不放行；Badcase 按 SEV 分级归档，SEV-1 当日复现并写入回归集，永远不让同一个坑塌两次。输出格式：横评结论（引用通过率与置信区间）→ 回归风险 → 放行建议（放行/灰度/驳回，含理由）。数据不支持的偏好一律不写进结论。' },
    { id: 'aren', name: '阿人', role: 'HR 数据分析师', en: 'PEOPLE ANALYST', dept: '职能', wb: 'workbenches/hr-analytics/',
      desc: '离职率抬头、招聘漏斗卡在哪一层，她用数据说话，从不拍脑袋。',
      skills: ['离职预警', '招聘漏斗', '效能分析'],
      prompt: '你是云梭科技的 HR 数据分析师阿人。职责边界：只做人力数据分析与预警，不做人事决定。方法论：离职率按年化口径盯警戒线 15%，先拆部门再拆司龄段，新人 6 个月内流失要重点复盘 onboarding；招聘漏斗看各层转化率，简历→初筛低于 40% 先改 JD 而不是加渠道；人效指标（人均营收）必须与 HC 变动对照着看，警惕"人多账少"。输出格式：趋势（引用数字与环比）→ 结构归因 → 建议（含验证周期）。敏感个体信息一律脱敏。' },
    { id: 'afu', name: '阿服', role: '客服主管', en: 'SUPPORT LEAD', dept: '客户', wb: 'workbenches/support-desk/',
      desc: 'SLA 达标率、坐席负载、满意度分布——工单洪峰来了他先排兵布阵。',
      skills: ['SLA 达标', '坐席排班', '情绪安抚'],
      prompt: '你是云梭科技的客服主管阿服。职责边界：只管工单流转与坐席调度，不承诺产品修复时间。方法论：工单分时 heat 一出现洪峰，先按 SLA 剩余时间重排队而不是先来先得；坐席负载超过 1.2 倍均值即启动二线支援；满意度低的工单先分类（等待久 / 没解决 / 态度问题），三类对策完全不同。输出格式：队列现状（SLA 达标率与积压数）→ 洪峰判断 → 调度动作（含升两级升级路径）。原则：先安抚情绪，再解决问题，最后解释原因。' },
    { id: 'atou', name: '阿投', role: '投放优化师', en: 'ADS OPTIMIZER', dept: '增长', wb: 'workbenches/ads-performance/',
      desc: 'ROAS 跌破目标线 24 小时内必出诊断。亏钱的开支，他一刀都不留情面。',
      skills: ['ROAS 诊断', '素材迭代', '预算再分配'],
      prompt: '你是云梭科技的投放优化师阿投。职责边界：只管广告预算与素材，不碰自然流量。方法论：ROAS 诊断先拆 CPC × CVR × 客单价，涨谁的锅一目了然——CPC 涨做出价与时段调整，CVR 跌先换素材；亏损计划（ROAS < 1）当日暂停，预算按边际 ROAS 再分配给 Top3 渠道；素材迭代每 72 小时一轮，旧素材衰减超 20% 立即上新。输出格式：今日消耗与 ROAS（引用数字）→ 亏损清单 → 调整动作（含预算再分配金额）。原则：先止损，再优化，最后谈放量。' },
    { id: 'awu', name: '阿物', role: 'IoT 运维工程师', en: 'IOT FLEET OPS', dept: '技术', wb: 'workbenches/iot-fleet/',
      desc: '两万台设备的在线率曲线就是他的心跳图。固件分发，永远灰度先行。',
      skills: ['在线率治理', '固件灰度', '现场排障'],
      prompt: '你是云梭科技的 IoT 运维工程师阿物，看管 4 类两万台设备。职责边界：只管设备在线率、固件与现场排障，不碰平台代码。方法论：在线率跌破 95% 先按设备类型与地域双维下钻，网络问题与设备问题分开治；固件升级永远灰度 5% 起步，观察 24 小时无异常再放量；心跳丢失优先查信号强度与电压，温度异常立即派单现场。输出格式：舰队现状（在线率与离线分布）→ 异常清单 → 动作（远程 / 派单 / 灰度回滚，含时限）。' },
    { id: 'ashen', name: '阿审', role: '风控审核专家', en: 'TRUST & SAFETY', dept: '职能', wb: 'workbenches/content-moderation/',
      desc: '机审人审的边界他划得最清。申诉通道里，他是最后的公道。',
      skills: ['机审规则', '人审抽检', '申诉复核'],
      prompt: '你是云梭科技的风控审核专家阿审。职责边界：只管内容风控与申诉，不碰增长指标。方法论：机审拦截率异常波动先查规则误伤（抽检 200 条验证精度），再查黑产新花样；人审抽检比例按机审置信度分层——高置信 5%、边界 30%；申诉处理坚持"宁可错放，不可错杀"，复核时效 < 24 小时；高危账号处置必须留全证据链。输出格式：审核现状（待审/拦截/误伤率）→ 风险类型分布 → 动作（调规则 / 加抽检 / 处置账号）。原则：效率服从准确，准确服从合规。' },
    { id: 'ayan', name: '阿验', role: '实验科学家', en: 'EXPERIMENT SCIENTIST', dept: '增长', wb: 'workbenches/ab-experiments/',
      desc: '显著性不够就不准上线，谁的"我觉得"都不好使。Uplift 是他的信仰。',
      skills: ['实验设计', '显著性检验', 'Uplift 归因'],
      prompt: '你是云梭科技的实验科学家阿验。职责边界：只管 A/B 实验的设计与结论，不做产品拍板。方法论：实验上线前必须过三关——样本量预估、分层冲突检测、指标定义对齐；显著性 p<0.05 且 Uplift 方向连续 3 天一致才可读数，中途偷看结论一律标注"窥视偏差"；新奇效应用 14 天后留存复测排除； inconclusive 的实验不硬解读，缺样本就明说补样本。输出格式：实验结论（显著 / 不显著 / 样本不足）→ Uplift 数字与置信区间 → 建议（全量 / 迭代 / 续跑）。' }
  ];

  var WB_MAP = {};
  TEAM.forEach(function (p) { WB_MAP[p.wb.replace('workbenches/', '').replace(/\/$/, '')] = p.id; });

  /* ---------- 参数化卡通头像工厂 ---------- */
  var COUNTER = 0;
  var SKIN = '#f2c9a4', LINE = '#2b3350', GLASS = '#39435e';

  function avatarSVG(cfg) {
    var uid = 'vag' + (++COUNTER);
    var hair = cfg.hair, cap = cfg.cap || hair, skin = cfg.skin || SKIN;
    var s = '<svg viewBox="0 0 100 100" width="{W}" height="{W}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block">';
    s = s.replace(/\{W\}/g, String(cfg.size || 88));
    // 背景圆
    s += '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="1" y2="1">'
       + '<stop offset="0" stop-color="' + cfg.bg[0] + '"/><stop offset="1" stop-color="' + cfg.bg[1] + '"/></linearGradient></defs>'
       + '<circle cx="50" cy="50" r="48" fill="url(#' + uid + ')"/>';
    // 发型后层（bob / pony）
    if (cfg.style === 'bob') s += '<circle cx="50" cy="40" r="22" fill="' + hair + '"/>';
    if (cfg.style === 'pony') s += '<ellipse cx="71" cy="37" rx="6" ry="11" fill="' + hair + '" transform="rotate(16 71 37)"/>';
    // 躯干 + 领口
    s += '<path d="M20 98 Q22 72 50 72 Q78 72 80 98 Z" fill="' + cfg.shirt + '"/>'
       + '<path d="M42 73 Q50 81 58 73" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="2.4" stroke-linecap="round"/>';
    // 领部配饰
    if (cfg.extra === 'tie') s += '<path d="M48 78 L52 78 L54 92 L50 96 L46 92 Z" fill="' + (cfg.extraC || LINE) + '"/>';
    if (cfg.extra === 'bowtie') s += '<path d="M43 81 L50 77.5 V84.5 Z M57 81 L50 77.5 V84.5 Z" fill="' + (cfg.extraC || '#1e3a8a') + '"/><circle cx="50" cy="81" r="2.2" fill="' + (cfg.extraC || '#1e3a8a') + '"/>';
    if (cfg.extra === 'badge') s += '<path d="M63 82 L70 79.5 V86 Q70 91 63 94 Q56 91 56 86 V79.5 Z" fill="#ffd166"/><path d="M58.6 85.5 L61.4 88.2 L67.6 82" fill="none" stroke="#7a5b0e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
    // 耳朵 + 头
    s += '<circle cx="31.5" cy="46" r="3.2" fill="' + skin + '"/><circle cx="68.5" cy="46" r="3.2" fill="' + skin + '"/>'
       + '<circle cx="50" cy="44" r="19" fill="' + skin + '"/>';
    if (cfg.extra === 'earrings') s += '<circle cx="31.5" cy="51.5" r="1.4" fill="#ffd166"/><circle cx="68.5" cy="51.5" r="1.4" fill="#ffd166"/>';
    // 刘海
    if (cfg.style === 'bob') s += '<path d="M32 40 Q33 26 50 26 Q67 26 68 40 Q60 33 50 35 Q40 33 32 40 Z" fill="' + hair + '"/>';
    else s += '<path d="M31.5 42 Q32 25 50 25 Q68 25 68.5 42 Q64 31.5 50 32.5 Q36 31.5 31.5 42 Z" fill="' + hair + '"/>';
    // 帽 / 头饰（戴在刘海之上）
    if (cfg.acc === 'cap') s += '<path d="M30 32 Q30 17 50 17 Q70 17 70 32 Z" fill="' + cap + '"/><path d="M26.5 32 H73.5 Q78 36.5 50 36.5 Q22 36.5 26.5 32 Z" fill="' + (cfg.capD || cap) + '"/><circle cx="50" cy="18.5" r="2" fill="' + (cfg.capD || cap) + '"/>';
    if (cfg.acc === 'beret') s += '<ellipse cx="53" cy="20.5" rx="15.5" ry="7" fill="' + cap + '" transform="rotate(-9 53 20.5)"/><circle cx="53" cy="13.5" r="2" fill="' + (cfg.capD || cap) + '"/>';
    if (cfg.acc === 'helmet') s += '<path d="M30 34 Q30 16 50 16 Q70 16 70 34 Z" fill="' + cap + '"/><rect x="24" y="33" width="52" height="5.5" rx="2.75" fill="' + (cfg.capD || cap) + '"/><rect x="46.5" y="16" width="7" height="19" rx="3.5" fill="' + (cfg.capD || cap) + '"/>';
    if (cfg.acc === 'visor') s += '<path d="M31 31 Q31 20 50 20 Q69 20 69 31 Z" fill="' + cap + '"/><path d="M31 31 H69 V35.5 Q50 33 31 35.5 Z" fill="' + (cfg.capD || cap) + '"/>';
    if (cfg.acc === 'antenna') s += '<line x1="50" y1="24" x2="50" y2="15" stroke="' + GLASS + '" stroke-width="2.6"/><circle cx="50" cy="13" r="3.2" fill="' + GLASS + '"/><circle cx="50" cy="13" r="1.2" fill="#22d3ee"/>';
    // 表情
    if (cfg.happy) s += '<path d="M40.5 46.5 Q43 44 45.5 46.5 M54.5 46.5 Q57 44 59.5 46.5" stroke="' + LINE + '" stroke-width="1.9" fill="none" stroke-linecap="round"/>';
    else s += '<circle cx="43" cy="46" r="2.1" fill="' + LINE + '"/><circle cx="57" cy="46" r="2.1" fill="' + LINE + '"/>';
    s += '<path d="M40 41.8 Q43 40.2 46 41.8 M54 41.8 Q57 40.2 60 41.8" stroke="' + hair + '" stroke-width="1.7" fill="none" stroke-linecap="round"/>'
       + '<path d="M44.5 52.5 Q50 57.5 55.5 52.5" stroke="' + LINE + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
       + '<ellipse cx="38" cy="51" rx="2.8" ry="1.7" fill="rgba(255,120,120,.42)"/><ellipse cx="62" cy="51" rx="2.8" ry="1.7" fill="rgba(255,120,120,.42)"/>';
    // 面部配饰
    if (cfg.acc === 'headset') s += '<path d="M29 42 Q29 21.5 50 21.5 Q71 21.5 71 42" fill="none" stroke="' + GLASS + '" stroke-width="4" stroke-linecap="round"/>'
       + '<rect x="25.5" y="40" width="7" height="11" rx="3" fill="' + GLASS + '"/><rect x="67.5" y="40" width="7" height="11" rx="3" fill="' + GLASS + '"/>'
       + '<path d="M33 51 Q38 57.5 45.5 56.8" fill="none" stroke="' + GLASS + '" stroke-width="2"/><circle cx="47" cy="56.5" r="2.1" fill="' + GLASS + '"/>';
    if (cfg.acc === 'glasses') s += '<circle cx="42.5" cy="46.5" r="6" fill="rgba(255,255,255,.16)" stroke="' + GLASS + '" stroke-width="2"/><circle cx="57.5" cy="46.5" r="6" fill="rgba(255,255,255,.16)" stroke="' + GLASS + '" stroke-width="2"/><line x1="48.5" y1="46.5" x2="51.5" y2="46.5" stroke="' + GLASS + '" stroke-width="2"/><line x1="36.5" y1="46" x2="31.8" y2="45" stroke="' + GLASS + '" stroke-width="1.8"/><line x1="63.5" y1="46" x2="68.2" y2="45" stroke="' + GLASS + '" stroke-width="1.8"/>';
    if (cfg.acc === 'sunglass') s += '<rect x="34.5" y="41.5" width="14" height="10" rx="4" fill="' + LINE + '"/><rect x="51.5" y="41.5" width="14" height="10" rx="4" fill="' + LINE + '"/><line x1="48.5" y1="44.5" x2="51.5" y2="44.5" stroke="' + LINE + '" stroke-width="2.4"/><line x1="34.5" y1="43.5" x2="30" y2="42" stroke="' + LINE + '" stroke-width="2"/><line x1="65.5" y1="43.5" x2="70" y2="42" stroke="' + LINE + '" stroke-width="2"/>';
    if (cfg.acc === 'monocle') s += '<circle cx="57.5" cy="46.5" r="6.5" fill="rgba(255,255,255,.14)" stroke="#d9a441" stroke-width="2.2"/><path d="M63 51 Q68 58 64.5 64" fill="none" stroke="#d9a441" stroke-width="1.6"/>';
    if (cfg.acc === 'goggles') s += '<rect x="34" y="41.5" width="32" height="10" rx="5" fill="rgba(210,235,255,.22)" stroke="' + GLASS + '" stroke-width="2"/><line x1="34" y1="46" x2="29.5" y2="45" stroke="' + GLASS + '" stroke-width="2"/><line x1="66" y1="46" x2="70.5" y2="45" stroke="' + GLASS + '" stroke-width="2"/>';
    s += '</svg>';
    return s;
  }

  var ART = {
    aswen:  { bg: ['#4f8cff', '#1d3a8f'], hair: '#3d2f23', style: 'short', acc: 'headset', shirt: '#2b3a5e' },
    azeng:  { bg: ['#a3e635', '#3f6212'], hair: '#2b3350', style: 'short', acc: 'glasses', shirt: '#dfe6f3', extra: 'tie', extraC: '#4f8cff' },
    anuan:  { bg: ['#f472b6', '#9d174d'], hair: '#6b4a3a', style: 'pony', acc: 'headset', happy: true, shirt: '#8a3d5e' },
    achuang:{ bg: ['#a78bfa', '#5b21b6'], hair: '#2b3350', style: 'bob', acc: 'beret', cap: '#c4b5fd', capD: '#7c3aed', happy: true, shirt: '#4c3a8c' },
    azhi:   { bg: ['#22d3ee', '#0e7490'], hair: '#2b3350', style: 'short', acc: 'antenna', shirt: '#155e75' },
    alian:  { bg: ['#fb923c', '#c2410c'], hair: '#4a3728', style: 'short', acc: 'cap', cap: '#fdba74', capD: '#9a3412', shirt: '#9a3412' },
    asuan:  { bg: ['#34d399', '#065f46'], hair: '#2b3350', style: 'side', acc: 'none', extra: 'bowtie', extraC: '#1e3a8a', shirt: '#e8edf7' },
    ashu:   { bg: ['#60a5fa', '#1e3a8a'], hair: '#6b7280', style: 'side', acc: 'monocle', shirt: '#27355b' },
    aping:  { bg: ['#fbbf24', '#b45309'], hair: '#7c4a2d', style: 'bob', acc: 'goggles', shirt: '#92400e' },
    aren:   { bg: ['#f87171', '#991b1b'], hair: '#4a3728', style: 'bob', acc: 'none', extra: 'earrings', happy: true, shirt: '#991b1b' },
    afu:    { bg: ['#38bdf8', '#0369a1'], hair: '#2b3350', style: 'short', acc: 'headset', happy: true, shirt: '#075985' },
    atou:   { bg: ['#e879f9', '#86198f'], hair: '#1f2937', style: 'short', acc: 'sunglass', shirt: '#86198f' },
    awu:    { bg: ['#facc15', '#a16207'], hair: '#4a3728', style: 'short', acc: 'helmet', cap: '#fde047', capD: '#a16207', skin: '#d9a06b', shirt: '#713f12' },
    ashen:  { bg: ['#94a3b8', '#334155'], hair: '#2b3350', style: 'short', acc: 'visor', cap: '#475569', capD: '#1e293b', extra: 'badge', shirt: '#1f2937' },
    ayan:   { bg: ['#2dd4bf', '#0f766e'], hair: '#2b3350', style: 'pony', acc: 'goggles', shirt: '#115e59' }
  };

  window.VA_TEAM = TEAM;
  window.VA_TEAM_WB = WB_MAP;
  window.vaEmployee = function (key) {
    if (!key) return null;
    var id = WB_MAP[key.replace(/^workbenches\//, '').replace(/\/$/, '')] || key;
    for (var i = 0; i < TEAM.length; i++) if (TEAM[i].id === id) return TEAM[i];
    return null;
  };
  window.vaAvatar = function (id, size) {
    var p = window.vaEmployee(id);
    if (!p || !ART[p.id]) return '';
    var cfg = Object.assign({ size: size || 88 }, ART[p.id]);
    try { return avatarSVG(cfg); } catch (e) { return ''; }
  };
})();
