/* ============================================================
 * FDE 工作台矩阵 · 术语大白话提示（term-tips.js）
 * ------------------------------------------------------------
 * 给 KPI 标签 / 面板标题 / 表头里的黑话术语加虚线下划线，
 * hover / 键盘 focus 弹出「老板语言」解释——看不懂随时能查。
 *
 * 设计约定：
 * - 术语表集中在本文件顶部，一处补全、全站生效；
 * - 只处理纯文本标签（.kpi .l / .panel h3 / th / .stat .l），
 *   不碰正文段落，绝不破坏子元素结构；
 * - 图表与表格多为动态重绘，MutationObserver 防抖 200ms 自动补挂；
 * - fail-silent：无匹配 / DOM 异常一律静默退出，绝不影响数据面板。
 * 接入：<script src="../../assets/term-tips.js" defer></script>
 * ============================================================ */
(function () {
  'use strict';
  try {
    var TERMS = {
      'P99':   '99% 的请求都比这个快，只有最慢的 1% 超过它——数字大，说明少数用户正在忍受卡顿。',
      'QPS':   '系统每秒处理的请求量，相当于门店「每秒接待多少位客人」，越高越忙。',
      'IOPS':  '硬盘每秒读写次数，相当于仓库打包台每秒处理几件货。',
      'GMV':   '成交总额：一段时间内一共卖出去多少钱，电商最看重的规模数字。',
      'DAU':   '每天有多少人来用（日活跃用户）——产品的「每日进店人数」。',
      'UV':    '有多少个不同的人来访（独立访客），同一个👤反复刷也只算一次。',
      'PV':    '页面被打开的总次数——一个人刷 3 次算 3 次。',
      'MRR':   '每月固定进账（订阅费加总）——SaaS 公司的命脉数字。',
      'ARR':   '年度经常性收入 = MRR × 12，投资人看板上的第一行。',
      'ARPU':  '平均每个用户贡献的收入——判断「谁更值钱」。',
      'Churn': '流失率：这段时间有多少客户离开了。越低越健康。',
      'ROAS':  '广告每花 1 元赚回几元——低于 1 就是在亏钱投放。',
      'CTR':   '看到广告/推荐的人里，有多少比例点了它。',
      'CPC':   '每次点击的成本：有人点我的广告，我付多少钱。',
      'CPM':   '每展示 1000 次的成本——买「曝光」的单价。',
      'CPA':   '每获得一次转化（注册/下单）平均花多少钱。',
      'ROI':   '投入产出比：每投入 1 元赚回几元。',
      'SLA':   '对客户承诺的服务达标线（如「全年可用 99.9%」），达不到要赔钱。',
      'NPS':   '客户愿不愿意推荐你（-100 ~ 100）：越高口碑越好，低于 0 要警惕。',
      'CSAT':  '客户满意度得分：处理完工单后客户的打分。',
      'Uplift':'实验组比对照组多提升多少——A/B 实验里「新方案真的赚了吗」的答案。',
      'SKU':   '商品/物料的最小管理单位：换一个规格就是另一条 SKU。',
      'SEV':   '事故严重级别：SEV-1 最重（全站受影响），数字越大越轻。',
      'MoM':   '环比：和上个月比涨了还是跌了。'
    };
    var KEYS = Object.keys(TERMS).sort(function (a, b) { return b.length - a.length; });
    var RE = new RegExp('(' + KEYS.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'g');
    var SEL = '.kpi .l, .panel h3, .stat .l, th';

    // 主题色经 CSS 变量取自 theme.css，缺失时用站点同款兜底色
    var css = ''
      + '.ztip{position:relative;cursor:help;text-decoration:underline dotted var(--acc,#4f8cff);text-decoration-thickness:1.5px;text-underline-offset:3px;outline:none}'
      + '.ztip::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 9px);transform:translateX(calc(-50% + var(--zx,0px)));width:max-content;max-width:min(260px,72vw);white-space:normal;background:var(--panel,#121829);color:var(--txt,#e8edf7);border:1px solid var(--acc,#4f8cff);border-radius:10px;padding:9px 12px;font-size:12px;line-height:1.65;font-weight:400;letter-spacing:normal;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .15s;z-index:99999;box-shadow:0 12px 30px rgba(0,0,0,.5)}'
      + '.ztip::before{content:"";position:absolute;left:50%;bottom:calc(100% + 3px);transform:translateX(calc(-50% + var(--zx,0px)));border:6px solid transparent;border-top-color:var(--acc,#4f8cff);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .15s;z-index:99999}'
      + '.ztip:hover::after,.ztip:focus::after,.ztip:hover::before,.ztip:focus::before{opacity:1;visibility:visible}'
      + '.ztip.ztip-down::after{bottom:auto;top:calc(100% + 9px)}'
      + '.ztip.ztip-down::before{bottom:auto;top:calc(100% + 3px);border-top-color:transparent;border-bottom-color:var(--acc,#4f8cff)}'
      + '@media(prefers-reduced-motion:reduce){.ztip::after,.ztip::before{transition:none}}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    function decorate(el) {
      if (el.dataset && el.dataset.ztip === '1') return;
      if (el.children.length > 0) return;               // 只处理纯文本标签，避免破坏结构
      var text = el.textContent;
      if (!RE.test(text)) return;
      RE.lastIndex = 0;
      var html = text.replace(RE, function (m) {
        return '<span class="ztip" tabindex="0" data-tip="' + TERMS[m] + '" aria-label="' + m + ' 是什么：' + TERMS[m] + '">' + m + '</span>';
      });
      el.innerHTML = html;
      el.dataset.ztip = '1';
    }

    function scan(root) {
      var nodes = (root || document).querySelectorAll(SEL);
      for (var i = 0; i < nodes.length; i++) decorate(nodes[i]);
    }

    // 图表/表格每 2~3 秒重绘一次，防抖补挂，不给主循环添负担
    var timer = null;
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].target && muts[i].target.dataset && muts[i].target.dataset.ztip === '1') continue; // 自己改的不响应
        clearTimeout(timer);
        timer = setTimeout(function () { scan(document); }, 200);
        return;
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    scan(document);

    // 展开瞬间按视口位置决定朝向与水平偏移：
    // - 贴顶的 KPI 标签向下弹，避免被视口上沿裁掉；
    // - 左右贴边的术语做 --zx 夹紧，tooltip 始终完整落在视口内（箭头随动）。
    var meas = document.createElement('div');
    meas.style.cssText = 'position:fixed;top:-999px;left:0;visibility:hidden;box-sizing:border-box;width:max-content;max-width:min(260px,72vw);padding:9px 12px;font-size:12px;line-height:1.65;border:1px solid;white-space:normal';
    function flip(z) {
      var r = z.getBoundingClientRect();
      z.classList.toggle('ztip-down', r.top < 170);
      var w = 0;
      try {
        meas.textContent = z.getAttribute('data-tip') || '';
        document.body.appendChild(meas);
        w = meas.offsetWidth;
        meas.remove();
      } catch (e2) { return; }
      var cx = r.left + r.width / 2, half = w / 2;
      var lo = 8, hi = Math.max(lo, window.innerWidth - 8 - w);
      var target = Math.min(Math.max(cx - half, lo), hi);
      z.style.setProperty('--zx', (target - (cx - half)) + 'px');
    }
    document.addEventListener('mouseover', function (e) {
      var z = e.target && e.target.closest && e.target.closest('.ztip');
      if (z) flip(z);
    }, true);
    document.addEventListener('focusin', function (e) {
      var z = e.target && e.target.closest && e.target.closest('.ztip');
      if (z) flip(z);
    }, true);
  } catch (e) { /* fail-silent：术语提示绝不影响数据面板 */ }
})();
