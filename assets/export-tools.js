/* ============================================================
   FDE 工作台矩阵 · 图表导出工具（全工作台共享）
   ------------------------------------------------------------
   用法：在页面 </body> 前（ai-assistant 之后）引入
     <script src="../../assets/export-tools.js" defer></script>

   工作方式：
   - defer 执行时各工作台图表已初始化；ECharts 会给图表容器
     打上 _echarts_instance_ 属性，据此自动发现所有实例并注入
     「PNG / CSV」悬浮按钮（父容器 hover 显示）；
   - PNG：echarts.getDataURL（2 倍像素比，背景取当前主题 --bg）；
   - CSV：由 getOption() 泛化提取（类目轴 + 各序列一列；
     饼图/雷达类 name-value 结构按 名称,数值 两列）；
   - CDN 加载失败 / stub 兜底模式下无实例，静默退出不报错。
   ============================================================ */
(function(){
  "use strict";

  var CSS = '.wb-export{position:absolute;top:8px;right:8px;display:flex;gap:4px;opacity:0;transition:opacity .2s;z-index:5}' +
            'div:hover>.wb-export{opacity:1}' +
            '.wb-export button{font-size:10px;line-height:1;padding:4px 8px;border-radius:6px;border:1px solid var(--line,#1c2740);background:rgba(13,19,34,.92);color:var(--sub,#8494b8);cursor:pointer;font-family:inherit;letter-spacing:.04em}' +
            '.wb-export button:hover{color:var(--txt,#dfe7ff);border-color:var(--acc,#4f8cff)}';

  function fileName(box, ext){
    var t = (document.title || 'chart').split('·')[0].trim();
    return t + '-' + (box.id || 'chart') + '.' + ext;
  }
  function download(href, name){
    var a = document.createElement('a');
    a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* 由 option 泛化提取二维表：返回 [表头, ...行] 或 null */
  function extractRows(opt){
    var ser = (opt.series || []).filter(function(s){ return s && s.data && s.data.length; });
    if(!ser.length) return null;
    var d0 = ser[0].data[0];
    // 饼图 / 雷达类：数据是 {name, value} 结构 → 名称,数值 两列
    if(d0 && typeof d0 === 'object' && !Array.isArray(d0) && 'name' in d0){
      var rows = [['名称','数值']];
      ser.forEach(function(s){
        s.data.forEach(function(d){
          rows.push([(s.name ? s.name + '-' : '') + d.name,
                     Array.isArray(d.value) ? d.value.join(' ') : d.value]);
        });
      });
      return rows;
    }
    // 直角坐标系：类目轴一列 + 每个序列一列
    var ax = Array.isArray(opt.xAxis) ? opt.xAxis[0] : opt.xAxis;
    var ay = Array.isArray(opt.yAxis) ? opt.yAxis[0] : opt.yAxis;
    var cats = (ax && ax.data) || (ay && ay.data) || ser[0].data.map(function(_, i){ return i + 1; });
    var head = ['类目'].concat(ser.map(function(s, i){ return s.name || ('系列' + (i + 1)); }));
    function cell(v){
      if(v == null) return '';
      if(Array.isArray(v)) return v.length === 2 && typeof v[0] === 'number' ? v[1] : v[v.length - 1];
      if(typeof v === 'object' && 'value' in v) return v.value;
      return v;
    }
    var body = cats.map(function(c, r){
      return [c].concat(ser.map(function(s){ return cell((s.data || [])[r]); }));
    });
    return [head].concat(body);
  }
  function toCsv(rows){
    return rows.map(function(r){
      return r.map(function(v){ v = String(v); return /["\n,]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : v; })
              .join(',');
    }).join('\n');
  }

  function dlPng(inst, box){
    var bg = (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim() || '#0a0e1a';
    var url = inst.getDataURL({ type:'png', pixelRatio:2, backgroundColor:bg });
    download(url, fileName(box, 'png'));
  }
  function dlCsv(inst){
    try{
      var rows = extractRows(inst.getOption());
      if(!rows) return;
      var blob = new Blob(['\ufeff' + toCsv(rows)], { type:'text/csv;charset=utf-8' }); // BOM：Excel 打开不乱码
      download(URL.createObjectURL(blob), fileName(inst.getDom(), 'csv'));
      setTimeout(function(){ URL.revokeObjectURL(blob); }, 4000);
    }catch(e){ console.warn('[export-tools] CSV 导出失败：', e); }
  }

  function init(){
    if(!window.echarts || !echarts.getInstanceByDom) return; // stub 兜底模式：静默退出
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    document.querySelectorAll('[_echarts_instance_]').forEach(function(box){
      if(box.dataset.exportReady) return;
      box.dataset.exportReady = '1';
      var host = box.parentElement;
      if(!host) return;
      if(getComputedStyle(host).position === 'static') host.style.position = 'relative';
      var bar = document.createElement('div');
      bar.className = 'wb-export';
      bar.innerHTML = '<button type="button" data-k="png" title="导出这张图为 PNG" aria-label="导出 PNG">PNG</button>' +
                      '<button type="button" data-k="csv" title="导出这张图的数据为 CSV" aria-label="导出 CSV">CSV</button>';
      host.appendChild(bar);
      bar.addEventListener('click', function(e){
        var b = e.target.closest('button'); if(!b) return;
        var inst = echarts.getInstanceByDom(box); if(!inst) return;
        b.dataset.k === 'png' ? dlPng(inst, box) : dlCsv(inst);
      });
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
