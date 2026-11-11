/* ============================================================
   FDE 工作台矩阵 · 性能守卫（全工作台共享，fail-open 设计）
   ------------------------------------------------------------
   用法：在 ECharts 加载器（含 stub 兜底）之后、页面内联脚本之前
   同步引入（无 defer）：
     <script src="../../assets/perf-guard.js"></script>
     <link rel="stylesheet" href="../../assets/theme.css">

   能力一：后台标签页暂停实时刷新
     - 包装 setInterval：document.hidden 时跳过本轮回调；
     - 数据 tick / 时钟自然停摆，切回前台自动恢复；
     - 不取消定时器，逻辑零侵入。

   能力二：图表懒初始化（IntersectionObserver）
     - 包装 echarts.init：先返回代理实例，所有方法调用进入队列；
     - 容器距视口 250px 内才真正 init，并按序重放队列；
     - 真实化后向容器派发 wb:chart-real 事件（export-tools 借此
       为后初始化的图表补挂导出按钮）；
     - fail-open：IO 不可用 / stub 兜底 / detached DOM / 任何异常
       均退回原生 echarts.init，最坏情况等同无此脚本。
   ============================================================ */
(function(){
  "use strict";

  /* ---------- 能力一：后台标签页暂停 setInterval ---------- */
  try{
    var rawSetInterval = window.setInterval.bind(window);
    window.setInterval = function(fn, delay){
      var rest = Array.prototype.slice.call(arguments, 2);
      if(typeof fn !== 'function') return rawSetInterval.apply(window, arguments);
      return rawSetInterval(function(){
        if(document.hidden) return; // 后台标签页：跳过本轮，切回自动恢复
        return fn.apply(this, rest);
      }, delay);
    };
  }catch(e){ /* fail-open：包装失败则保持原生定时器 */ }

  /* ---------- 能力二：图表懒初始化 ---------- */
  try{
    if(typeof IntersectionObserver === 'undefined') return;      // 老浏览器：不动
    var echartsRef = window.echarts;
    if(!echartsRef || typeof echartsRef.init !== 'function') return;
    if(String(echartsRef.init).indexOf('图表库加载失败') !== -1) return; // stub 兜底模式：不动

    var realInit = echartsRef.init;       // 原生 init（此时 window.echarts 已定型：真库或 stub）
    var pending = new Map();              // dom -> rec

    function materialize(rec){
      rec.real = realInit(rec.dom, ...rec.initArgs);   // 与原生行为一致：init 失败就抛
      rec.q.forEach(function(item){                    // 按序重放排队的方法调用
        try{ rec.real[item[0]].apply(rec.real, item[1]); }
        catch(e){ console.warn('[perf-guard] 重放 ' + item[0] + ' 失败：', e); }
      });
      rec.q.length = 0;
      try{ rec.dom.dispatchEvent(new CustomEvent('wb:chart-real', { bubbles:true })); }catch(e){}
    }

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        io.unobserve(en.target);
        var rec = pending.get(en.target);
        if(rec && !rec.real) materialize(rec);
      });
    }, { rootMargin:'250px 0px' });       // 提前一屏初始化，滚动无感

    echartsRef.init = function(dom){
      var rest = Array.prototype.slice.call(arguments, 1);
      try{
        if(!dom || !dom.isConnected) return realInit.apply(echartsRef, [dom].concat(rest)); // detached：直接原生
        if(pending.has(dom)) return pending.get(dom).proxy; // 重复 init 同一容器：返回既有代理
        var rec = { dom:dom, initArgs:rest, q:[], real:null, proxy:null };
        rec.proxy = new Proxy({}, { get:function(t, k){
          if(k === '__wbLazy') return true;              // 身份标记（调试/测试用）
          return function(){
            var a = Array.prototype.slice.call(arguments);
            if(rec.real) return rec.real[k].apply(rec.real, a); // 已物化：直通
            rec.q.push([k, a]);                                 // 未物化：入队，物化时按序重放
          };
        }});
        pending.set(dom, rec);
        io.observe(dom);
        return rec.proxy;
      }catch(e){
        return realInit.apply(echartsRef, [dom].concat(rest)); // 任何异常：退回原生
      }
    };
  }catch(e){ /* fail-open：保持原生 echarts */ }
})();
