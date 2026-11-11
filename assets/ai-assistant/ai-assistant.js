/*!
 * ZCode AI 解读助手 · 独立可复用组件 v1.0
 * ============================================
 * 一个 <script> 引入任意工作台，即可获得：
 *   1. 右下角 🤖 机器人按钮 + 解读对话面板（打字机效果）
 *   2. 友好的 Toast 弹窗提示系统（window.ZToast）
 *   3. 周期性模拟业务事件提醒
 * 数据与解读全部来自宿主工作台 —— 通过 window.AI_ASSISTANT 配置注入：
 *
 *   window.AI_ASSISTANT = {
 *     title: '财务经营驾驶舱',          // 面板标题（必填）
 *     subtitle: 'FINANCE COCKPIT',      // 副标题（可选）
 *     insights() {                      // 数据解读（必填）：返回当前数据的洞察数组
 *       return [{ tag:'净利率', lv:'ok', text:'...' }, ...];   // lv: ok|warn|bad|info
 *     },
 *     advice() {                        // 优化建议（可选）：返回字符串数组
 *       return ['...'];
 *     },
 *     alerts() {                        // 周期事件提醒（可选）：返回一条 {lv,text} 或 null 跳过
 *       return { lv:'warn', text:'...' };
 *     }
 *   };
 *   <script src="path/to/ai-assistant.js" defer><\/script>
 *
 * 主题：组件样式全部引用宿主页面 CSS 变量（--p1/--line/--txt/--sub/--acc/--ok/--warn/--bad/--cyan），
 *       工作台亮/暗主题切换时自动跟随，无需额外处理。
 */
(function () {
  'use strict';
  if (window.__ZAI_LOADED__) return;
  window.__ZAI_LOADED__ = true;

  var cfg = function () { return window.AI_ASSISTANT || {}; };
  var FALLBACK = { p1: '#0d1322', p2: '#0a0f1c', line: '#1c2740', txt: '#dfe7ff', sub: '#8494b8', acc: '#4f8cff', ok: '#34d399', warn: '#fbbf24', bad: '#f87171', cyan: '#22d3ee' };
  var v = function (n, f) {
    try { var x = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return x || FALLBACK[f]; } catch (e) { return FALLBACK[f]; }
  };
  var LV_COLOR = { ok: '--ok', warn: '--warn', bad: '--bad', info: '--acc' };
  var LV_ICON = { ok: '✅', warn: '⚠️', bad: '🔴', info: '💡' };

  /* ---------------- 样式（全部引用宿主 CSS 变量，主题自动跟随） ---------------- */
  var style = document.createElement('style');
  style.textContent =
    '.zai-fab{position:fixed;right:16px;bottom:64px;z-index:9600;width:46px;height:46px;border-radius:50%;border:none;cursor:pointer;font-size:21px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--acc,' + FALLBACK.acc + '),var(--cyan,' + FALLBACK.cyan + '));box-shadow:0 8px 20px -6px rgba(0,0,0,.55);transition:transform .2s;padding:0}' +
    '.zai-fab:hover{transform:scale(1.08)}' +
    '.zai-fab::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--acc,' + FALLBACK.acc + ');opacity:.5;animation:zaipulse 2.4s infinite}' +
    '@keyframes zaipulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.08;transform:scale(1.14)}}' +
    '.zai-panel{position:fixed;right:16px;bottom:118px;z-index:9650;width:min(372px,calc(100vw - 24px));height:min(548px,74vh);display:none;flex-direction:column;background:var(--p1,' + FALLBACK.p1 + ');border:1px solid var(--line,' + FALLBACK.line + ');border-radius:16px;box-shadow:0 24px 60px -20px rgba(0,0,0,.65);overflow:hidden;text-align:left}' +
    '.zai-panel.open{display:flex;animation:zaislide .22s ease}' +
    '@keyframes zaislide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
    '.zai-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line,' + FALLBACK.line + ');background:var(--p2,' + FALLBACK.p2 + ')}' +
    '.zai-ava{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0;background:linear-gradient(135deg,var(--acc,' + FALLBACK.acc + '),var(--cyan,' + FALLBACK.cyan + '))}' +
    '.zai-head .t{flex:1;min-width:0}' +
    '.zai-head .t b{display:block;font-size:13px;color:var(--txt,' + FALLBACK.txt + ')}' +
    '.zai-head .t span{display:block;font-size:10px;color:var(--sub,' + FALLBACK.sub + ');letter-spacing:.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.zai-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;background:var(--ok,' + FALLBACK.ok + ');box-shadow:0 0 8px var(--ok,' + FALLBACK.ok + ');animation:zaipulse 2s infinite}' +
    '.zai-x{border:none;background:none;color:var(--sub,' + FALLBACK.sub + ');font-size:15px;cursor:pointer;padding:2px 6px}' +
    '.zai-x:hover{color:var(--txt,' + FALLBACK.txt + ')}' +
    '.zai-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}' +
    '.zai-msgs::-webkit-scrollbar{width:5px}.zai-msgs::-webkit-scrollbar-thumb{background:var(--line,' + FALLBACK.line + ');border-radius:3px}' +
    '.zai-msg{display:flex;gap:8px;align-items:flex-start}' +
    '.zai-msg .m-ava{width:24px;height:24px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;background:var(--p2,' + FALLBACK.p2 + ');border:1px solid var(--line,' + FALLBACK.line + ')}' +
    '.zai-msg .bubble{background:var(--p2,' + FALLBACK.p2 + ');border:1px solid var(--line,' + FALLBACK.line + ');border-radius:4px 12px 12px 12px;padding:8px 11px;font-size:12px;line-height:1.75;color:var(--txt,' + FALLBACK.txt + ');max-width:calc(100% - 34px);word-break:break-word}' +
    '.zai-msg.user{justify-content:flex-end}' +
    '.zai-msg.user .bubble{background:rgba(79,140,255,.14);border-color:rgba(79,140,255,.35);border-radius:12px 4px 12px 12px}' +
    '.ztag{display:inline-block;font-size:10px;padding:1px 8px;border-radius:99px;margin:0 4px 4px 0;font-weight:600}' +
    '.zai-chips{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px 2px}' +
    '.zai-chip{font-size:11px;color:var(--sub,' + FALLBACK.sub + ');background:var(--p2,' + FALLBACK.p2 + ');border:1px solid var(--line,' + FALLBACK.line + ');border-radius:99px;padding:4px 11px;cursor:pointer;transition:color .2s,border-color .2s;font-family:inherit}' +
    '.zai-chip:hover{color:var(--acc,' + FALLBACK.acc + ');border-color:var(--acc,' + FALLBACK.acc + ')}' +
    '.zai-foot{padding:10px 12px 12px}' +
    '.zai-btn{width:100%;border:none;cursor:pointer;font-size:13px;font-weight:600;color:#fff;background:linear-gradient(92deg,var(--acc,' + FALLBACK.acc + '),var(--cyan,' + FALLBACK.cyan + '));border-radius:10px;padding:9px;font-family:inherit;transition:opacity .2s}' +
    '.zai-btn:disabled{opacity:.55;cursor:wait}' +
    '.zai-typing{display:inline-flex;gap:4px;padding:4px 2px}' +
    '.zai-typing i{width:5px;height:5px;border-radius:50%;background:var(--sub,' + FALLBACK.sub + ');animation:zaidot 1.2s infinite}' +
    '.zai-typing i:nth-child(2){animation-delay:.15s}.zai-typing i:nth-child(3){animation-delay:.3s}' +
    '@keyframes zaidot{0%,60%,100%{opacity:.25;transform:none}30%{opacity:1;transform:translateY(-3px)}}' +
    '.zai-toasts{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:9800;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:max-content;max-width:min(560px,92vw)}' +
    '.zai-toast{pointer-events:auto;display:flex;align-items:flex-start;gap:8px;font-size:12px;line-height:1.6;color:var(--txt,' + FALLBACK.txt + ');background:var(--p1,' + FALLBACK.p1 + ');border:1px solid var(--line,' + FALLBACK.line + ');border-left-width:3px;border-radius:10px;padding:9px 14px;box-shadow:0 10px 30px -12px rgba(0,0,0,.6);animation:zaitoast .3s ease;max-width:100%}' +
    '.zai-toast.out{animation:zaitoastout .3s ease forwards}' +
    '@keyframes zaitoast{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}' +
    '@keyframes zaitoastout{to{opacity:0;transform:translateY(-10px)}}' +
    '.zai-toast.ok{border-left-color:var(--ok,' + FALLBACK.ok + ')}.zai-toast.warn{border-left-color:var(--warn,' + FALLBACK.warn + ')}' +
    '.zai-toast.bad{border-left-color:var(--bad,' + FALLBACK.bad + ')}.zai-toast.info{border-left-color:var(--acc,' + FALLBACK.acc + ')}' +
    '.zai-toast .ic{flex-shrink:0}.zai-toast .zclose{margin-left:6px;color:var(--sub,' + FALLBACK.sub + ');cursor:pointer;font-size:12px;flex-shrink:0}' +
    '@media(max-width:640px){.zai-panel{right:12px;bottom:112px}}';
  document.head.appendChild(style);

  /* ---------------- Toast 弹窗提示系统 ---------------- */
  var toastWrap = document.createElement('div');
  toastWrap.className = 'zai-toasts';
  document.body.appendChild(toastWrap);
  window.ZToast = {
    show: function (text, lv, ms) {
      lv = lv || 'info'; ms = ms || 4500;
      var el = document.createElement('div');
      el.className = 'zai-toast ' + lv;
      el.innerHTML = '<span class="ic">' + (LV_ICON[lv] || '💡') + '</span><span>' + text + '</span><span class="zclose" title="关闭">✕</span>';
      toastWrap.appendChild(el);
      var kill = function () { if (!el.parentNode) return; el.classList.add('out'); setTimeout(function () { el.remove(); }, 300); };
      el.querySelector('.zclose').addEventListener('click', kill);
      setTimeout(kill, ms);
      while (toastWrap.children.length > 4) toastWrap.firstChild.remove();
    },
    ok: function (t, m) { this.show(t, 'ok', m); },
    warn: function (t, m) { this.show(t, 'warn', m); },
    bad: function (t, m) { this.show(t, 'bad', m); },
    info: function (t, m) { this.show(t, 'info', m); }
  };

  /* ---------------- 机器人面板 ---------------- */
  var fab = document.createElement('button');
  fab.className = 'zai-fab'; fab.title = 'AI 解读助手'; fab.textContent = '🤖';
  document.body.appendChild(fab);

  var panel = document.createElement('div');
  panel.className = 'zai-panel';
  panel.innerHTML =
    '<div class="zai-head"><span class="zai-ava">🤖</span><div class="t"><b id="zaiTitle">AI 解读助手</b><span id="zaiSub">等待工作台接入…</span></div><span class="zai-dot" title="在线"></span><button class="zai-x" title="收起">✕</button></div>' +
    '<div class="zai-msgs" id="zaiMsgs"></div>' +
    '<div class="zai-chips" id="zaiChips"></div>' +
    '<div class="zai-foot"><button class="zai-btn" id="zaiBtn">🔄 生成实时解读</button></div>';
  document.body.appendChild(panel);

  var msgs = panel.querySelector('#zaiMsgs');
  var btn = panel.querySelector('#zaiBtn');
  var chipsBox = panel.querySelector('#zaiChips');
  var typingQueue = [], typingBusy = false, greeted = false, firstOpen = true;

  function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }
  function addUser(text) {
    var el = document.createElement('div');
    el.className = 'zai-msg user';
    el.innerHTML = '<div class="bubble">' + text + '</div>';
    msgs.appendChild(el); scrollBottom();
  }
  function addTyping() {
    var el = document.createElement('div');
    el.className = 'zai-msg';
    el.innerHTML = '<span class="m-ava">🤖</span><div class="bubble"><span class="zai-typing"><i></i><i></i><i></i></span></div>';
    msgs.appendChild(el); scrollBottom();
    return el;
  }
  function typeInto(bubbleEl, html, done) {
    // 打字机：按字符渐进展示纯文本（标签在结尾一次性附加）
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    var tagEl = tmp.querySelector('.ztag'); var tagHTML = tagEl ? tagEl.outerHTML : '';
    if (tagEl) tagEl.remove();
    var text = tmp.textContent;
    bubbleEl.innerHTML = tagHTML;
    var span = document.createElement('span'); bubbleEl.appendChild(span);
    var i = 0;
    var timer = setInterval(function () {
      i += 2; span.textContent = text.slice(0, i); scrollBottom();
      if (i >= text.length) { clearInterval(timer); if (done) done(); }
    }, 16);
  }
  function botSay(lv, tag, text, done) {
    typingQueue.push(function (next) {
      var el = addTyping();
      setTimeout(function () {
        var col = v(LV_COLOR[lv] || '--acc', FALLBACK.acc);
        var bubble = el.querySelector('.bubble');
        typeInto(bubble,
          '<span class="ztag" style="color:' + col + ';background:' + col + '1a">' + (LV_ICON[lv] || '') + ' ' + (tag || '解读') + '</span>' + text,
          function () { if (done) done(); next(); });
      }, 420 + Math.random() * 420);
    });
    pump();
  }
  function pump() {
    if (typingBusy || !typingQueue.length) return;
    typingBusy = true;
    typingQueue.shift()(function () { typingBusy = false; pump(); });
  }

  function generate(mode) {
    var c = cfg();
    if (!c.insights) { botSay('info', '提示', '当前页面尚未配置 AI 解读数据。'); return; }
    btn.disabled = true;
    addUser(mode === 'risk' ? '⚠️ 有什么风险？' : mode === 'advice' ? '💡 给点优化建议' : '📊 解读一下当前数据');
    var list = c.insights().slice(0, 6);
    if (mode === 'risk') {
      var risks = list.filter(function (x) { return x.lv === 'warn' || x.lv === 'bad'; });
      if (!risks.length) { botSay('ok', '风险', '当前无显著风险信号，各核心指标均在目标区间内 ✅'); btn.disabled = false; return; }
      list = risks;
    }
    if (mode === 'advice') {
      var adv = c.advice ? c.advice() : [];
      if (!adv.length) { botSay('info', '建议', '暂无补充建议，保持当前节奏 👍'); btn.disabled = false; return; }
      adv.forEach(function (t, i) { botSay(i === 0 ? 'info' : 'info', '建议 ' + (i + 1), t, i === adv.length - 1 ? function () { btn.disabled = false; } : null); });
      if (adv.length) return;
    }
    list.forEach(function (x, i) {
      botSay(x.lv || 'info', x.tag || '解读', x.text, i === list.length - 1 ? function () { btn.disabled = false; } : null);
    });
  }

  function openPanel() {
    panel.classList.add('open');
    if (firstOpen) {
      firstOpen = false;
      var c = cfg();
      panel.querySelector('#zaiTitle').textContent = (c.title || 'AI 解读助手');
      panel.querySelector('#zaiSub').textContent = '小智 · ' + (c.subtitle || 'DATA COPILOT') + ' · 在线';
      botSay('ok', '就绪', '你好，我是小智 🤖 已接入「' + (c.title || '本工作台') + '」的实时数据，点击下方按钮或提问标签获取解读。');
    }
    chipsBox.innerHTML = '';
    ['📊 整体解读', '⚠️ 风险提示', '💡 优化建议'].forEach(function (label) {
      var b = document.createElement('button');
      b.className = 'zai-chip'; b.type = 'button'; b.textContent = label;
      b.addEventListener('click', function () {
        if (btn.disabled) return;
        generate(label.indexOf('风险') >= 0 ? 'risk' : label.indexOf('建议') >= 0 ? 'advice' : 'all');
      });
      chipsBox.appendChild(b);
    });
  }
  fab.addEventListener('click', function () { panel.classList.toggle('open'); if (panel.classList.contains('open')) openPanel(); });
  panel.querySelector('.zai-x').addEventListener('click', function () { panel.classList.remove('open'); });
  btn.addEventListener('click', function () { if (!btn.disabled) generate('all'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') panel.classList.remove('open'); });

  /* ---------------- 欢迎提示 + 周期性业务事件提醒 ---------------- */
  setTimeout(function () {
    var c = cfg();
    window.ZToast.show((c.title ? '「' + c.title + '」' : '') + '🤖 AI 解读助手已就绪 — 点击右下角小智获取数据解读', 'info', 5200);
  }, 900);
  setInterval(function () {
    var c = cfg();
    if (document.hidden || !c.alerts || panel.classList.contains('open')) return;
    var a = c.alerts();
    if (a && a.text) window.ZToast.show(a.text, a.lv || 'info');
  }, 26000 + Math.floor(Math.random() * 9000));

  /* ---------------- 对外 API ---------------- */
  window.ZAI = {
    open: function () { panel.classList.add('open'); openPanel(); },
    close: function () { panel.classList.remove('open'); },
    notify: function (text, lv, ms) { window.ZToast.show(text, lv, ms); }
  };
})();
