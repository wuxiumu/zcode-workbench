/* ============================================================
 * FDE 工作台矩阵 · 科技感粒子网格背景（tech-fx.js）
 * ------------------------------------------------------------
 * 固定视口画布：缓慢漂移的粒子 + 邻近连线，低透明度不喧宾夺主。
 * 降级三闸：
 *   1. prefers-reduced-motion → 只画一帧静态网格，不做动画；
 *   2. <768px 粒子减半（省电省帧）；
 *   3. document.hidden → 停帧（与 perf-guard 同思路）。
 * 层级约定：canvas z-index:0 + 内容 body>* 提到 z-index:1，
 * 主题按钮 / AI fab 等自带更高 z-index 不受影响。
 * fail-silent：任何异常静默退出，绝不影响数据面板。
 * 接入：<script src="../../assets/tech-fx.js" defer></script>
 * ============================================================ */
(function () {
  'use strict';
  try {
    var reduced = false;
    try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var cv = document.createElement('canvas');
    cv.id = 'tech-fx';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0';
    var style = document.createElement('style');
    style.textContent = 'body>*:not(#tech-fx):not(script):not(style){position:relative;z-index:1}';
    document.head.appendChild(style);
    document.body.insertBefore(cv, document.body.firstChild);
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var W = 0, H = 0, DPR = 1, dots = [];
    function palette() {
      // 每帧读当前主题：亮暗切换零监听成本
      return document.documentElement.dataset.theme === 'light'
        ? { dot: '47,108,255', line: '47,108,255', dotA: .18, lineA: .10 }
        : { dot: '79,140,255', line: '34,211,238', dotA: .30, lineA: .12 };
    }
    function resize() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var n = Math.max(24, Math.min(70, Math.round(W * H / 26000)));
      if (W < 768) n = Math.round(n / 2);          // 窄屏减半
      while (dots.length < n) dots.push(mk());
      dots.length = n;
    }
    function mk() {
      return { x: Math.random() * innerWidth, y: Math.random() * innerHeight,
               vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
               r: 1 + Math.random() * 1.6 };
    }
    function draw() {
      var pal = palette();
      ctx.clearRect(0, 0, W, H);
      var LINK = 130;
      for (var i = 0; i < dots.length; i++) {
        var a = dots[i];
        for (var j = i + 1; j < dots.length; j++) {
          var b = dots[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            ctx.strokeStyle = 'rgba(' + pal.line + ',' + (pal.lineA * (1 - Math.sqrt(d2) / LINK)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(' + pal.dot + ',' + pal.dotA + ')';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
      }
    }
    function step() {
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
      }
    }
    resize();
    addEventListener('resize', function () { resize(); draw(); });
    draw();
    if (reduced) return;                          // 减动效：静态一帧即止
    var running = true;
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(loop);
    });
    (function loop() {
      if (!running) return;
      step(); draw();
      requestAnimationFrame(loop);
    })();
  } catch (e) { /* fail-silent */ }
})();
