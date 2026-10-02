(function(){
'use strict';
var $ = function(s){ return document.querySelector(s); };
var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1. 点阵加载器 ── */
(function(){
  var d = $('#dots');
  for (var i = 0; i < 49; i++) {
    var s = document.createElement('i');
    s.style.animationDelay = ((i % 7) * 0.05 + Math.floor(i / 7) * 0.05) + 's';
    d.appendChild(s);
  }
  window.addEventListener('load', function(){
    setTimeout(function(){ $('#loader').classList.add('off'); }, 420);
  });
  setTimeout(function(){ $('#loader').classList.add('off'); }, 2600);
})();

/* ── 2. 滚动进度 / 导航状态 ── */
var nav = $('#nav'), prog = $('#prog');
function onScroll(){
  var h = document.documentElement.scrollHeight - window.innerHeight;
  prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  nav.classList.toggle('on', window.scrollY > 40);
}
window.addEventListener('scroll', function(){ requestAnimationFrame(onScroll); }, {passive:true});
onScroll();

var nl = $('#navLinks'), burger = $('#burger');
burger.addEventListener('click', function(){
  var open = nl.style.display !== 'flex';
  if (open) {
    nl.style.cssText = 'display:flex;position:absolute;top:70px;left:0;right:0;flex-direction:column;gap:4px;padding:16px 20px;background:rgba(8,10,15,.97);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)';
  } else { nl.style.cssText = ''; }
});
nl.addEventListener('click', function(e){ if (e.target.tagName === 'A') nl.style.cssText = ''; });
window.addEventListener('resize', function(){ if (window.innerWidth > 1000) nl.style.cssText = ''; });

if ('IntersectionObserver' in window) {
  var navIo = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      $$('.nav-links a').forEach(function(a){
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
      });
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  ['about','work','exp','edu','build'].forEach(function(id){
    var el = document.getElementById(id); if (el) navIo.observe(el);
  });
}

/* ── 3. 揭示动画 + 数字滚动 + EQ 条 ── */
var counted = {};
function countUp(el){
  var target = parseInt(el.getAttribute('data-count'), 10) || 0;
  var suffix = el.getAttribute('data-suffix') || '';
  if (counted[target]) { el.textContent = target + suffix; return; }
  counted[target] = 1;
  var t0 = null, dur = 1100;
  function step(ts){
    if (!t0) t0 = ts;
    var p = Math.min((ts - t0) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function fillBars(scope){ $$(scope + ' .eq-bar i').forEach(function(b){ b.style.width = b.getAttribute('data-w') + '%'; }); }

if (REDUCE || !('IntersectionObserver' in window)) {
  $$('.rv').forEach(function(el){ el.classList.add('in'); });
  fillBars('body');
  $$('[data-count]').forEach(countUp);
} else {
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(countUp);
      if (el.hasAttribute('data-count')) countUp(el);
      io.unobserve(el);
    });
  }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
  $$('.rv').forEach(function(el){ io.observe(el); });
  var eqIo = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ fillBars('.hero-card'); eqIo.unobserve(e.target); } });
  }, {threshold:.4});
  var hc = document.querySelector('.hero-card'); if (hc) eqIo.observe(hc);
}

/* ── 4. 鼠标聚光灯 ── */
$$('.spot').forEach(function(el){
  el.addEventListener('pointermove', function(e){
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ── 5. 磁吸按钮 ── */
if (!REDUCE && window.matchMedia('(hover:hover)').matches) {
  $$('.btn').forEach(function(b){
    b.addEventListener('pointermove', function(e){
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width/2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height/2) * 0.28).toFixed(1) + 'px)';
    });
    b.addEventListener('pointerleave', function(){ b.style.transform = ''; });
  });
}

/* ── 6. 手风琴 ── */
$$('.acc-h').forEach(function(h){
  h.addEventListener('click', function(){
    var acc = h.parentNode, open = acc.classList.contains('open');
    var body = acc.querySelector('.acc-b');
    if (open) { acc.classList.remove('open'); body.style.maxHeight = '0px'; }
    else { acc.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
  });
});

/* ── 6b. 简历专属：经历 / 奖项切换、能力条、导出 PDF ── */
(function(){
  var tabs = $('#tlTabs');
  if (tabs) {
    tabs.addEventListener('click', function(e){
      var b = e.target.closest('button'); if (!b) return;
      tabs.querySelectorAll('button').forEach(function(o){ o.classList.remove('on'); o.setAttribute('aria-selected','false'); });
      b.classList.add('on'); b.setAttribute('aria-selected','true');
      var key = b.getAttribute('data-tl');
      $$('#tlBody .res-row').forEach(function(r){
        var on = r.getAttribute('data-tl') === key;
        r.classList.toggle('is-hidden', !on);
        if (on) r.classList.add('in');
      });
    });
  }
  var sb = $$('.skill-bars');
  if (sb.length) {
    function fill(){ sb.forEach(function(s){ s.querySelectorAll('.bar i').forEach(function(b){ b.style.width = b.getAttribute('data-w') + '%'; }); }); }
    if (REDUCE || !('IntersectionObserver' in window)) { fill(); }
    else {
      var o = new IntersectionObserver(function(es){
        es.forEach(function(e){ if (e.isIntersecting) { fill(); o.disconnect(); } });
      }, {threshold:.3});
      sb.forEach(function(s){ o.observe(s); });
    }
  }
})();

/* ── 7. Hero 波形画布 ── */
(function(){
  var c = $('#wave'), x = c.getContext('2d'), t = 0, raf, wrect = null;
  function size(){
    var r = c.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = r.width * dpr; c.height = r.height * dpr; x.setTransform(dpr,0,0,dpr,0,0);
    wrect = r;
  }
  function draw(){
    var w = c.clientWidth, h = c.clientHeight;
    x.clearRect(0,0,w,h);
    var layers = [
      {a:.55, s:1.0, k:0.008, c:'#5B8CFF', o:0.30},
      {a:.40, s:1.4, k:0.011, c:'#8B7CF6', o:0.55},
      {a:.30, s:2.1, k:0.015, c:'#D6B36A', o:0.80}
    ];
    layers.forEach(function(L, li){
      x.beginPath();
      var lmx = (window._mx == null ? -1e5 : window._mx - wrect.left);
      for (var px = 0; px <= w; px += 3) {
        /* 鼠标附近的波形会隆起，像被手拨动 */
        var amp = 1 + 0.85 * Math.exp(-Math.pow(px - lmx, 2) / 16200);
        var y = h * L.o
          + Math.sin(px * L.k + t * L.s) * h * 0.16 * L.a * amp
          + Math.sin(px * L.k * 2.3 + t * L.s * 1.6) * h * 0.07 * L.a
          + Math.sin(px * L.k * 0.4 - t * 0.4) * h * 0.05;
        if (px === 0) x.moveTo(px, y); else x.lineTo(px, y);
      }
      var g = x.createLinearGradient(0,0,w,0);
      g.addColorStop(0, 'rgba(91,140,255,0)');
      g.addColorStop(.2, L.c);
      g.addColorStop(.8, L.c);
      g.addColorStop(1, 'rgba(0,191,255,0)');
      x.strokeStyle = g; x.globalAlpha = .5 - li * 0.1; x.lineWidth = 1.6; x.stroke();
    });
    x.globalAlpha = 1;
    t += REDUCE ? 0 : 0.02;
    raf = requestAnimationFrame(draw);
  }
  size(); draw();
  window.addEventListener('resize', function(){ size(); if (REDUCE) draw(); });
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) { cancelAnimationFrame(raf); } else { draw(); }
  });
})();

/* ── 8. Hero 频谱卡（装饰动画） ── */
(function(){
  var c = $('#spec'), x = c.getContext('2d'), t = 0, raf, srect = null;
  function size(){
    var r = c.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = r.width * dpr; c.height = r.height * dpr; x.setTransform(dpr,0,0,dpr,0,0);
    srect = r;
  }
  function draw(){
    var w = c.clientWidth, h = c.clientHeight, n = 40, bw = w / n;
    x.clearRect(0,0,w,h);
    for (var i = 0; i < n; i++) {
      var base = Math.sin(i * 0.35 + t) * 0.28 + Math.sin(i * 0.13 + t * 1.7) * 0.24 + 0.5;
      var v = Math.max(0.06, Math.min(base * (1 - i / (n * 1.6)), 1));
      var bh = v * (h - 12);
      var g = x.createLinearGradient(0, h, 0, h - bh);
      g.addColorStop(0, '#5B8CFF'); g.addColorStop(1, i % 3 ? '#8B7CF6' : '#D6B36A');
      x.fillStyle = g;
      x.fillRect(i * bw + 1.5, h - bh - 6, bw - 3, bh);
    }
    t += REDUCE ? 0 : 0.05;
    raf = requestAnimationFrame(draw);
  }
  size(); draw();
  window.addEventListener('resize', size);
})();

/* ── 9. 声卡调试自检工具 ── */
(function(){
  if (!$('#toolTitle')) return; /* 板块已移除时直接跳过 */
  var LABEL = {
    os:{win:'Windows', mac:'macOS'},
    card:{entry:'入门 USB 声卡', mid:'中端专业声卡', pro:'高端机架接口'},
    use:{rec:'人声录音', live:'直播', mix:'混音监听', midi:'编曲 / MIDI'}
  };
  var state = {os:'win', card:'entry', use:'rec'};
  var BUF = {
    entry:{rec:128, live:256, mix:256, midi:128},
    mid:{rec:64, live:128, mix:128, midi:64},
    pro:{rec:32, live:64, mix:64, midi:32}
  };
  var BASE = {entry:6, mid:3, pro:1.4};
  var GAIN = {rec:'−12 dBFS', live:'−10 dBFS', mix:'78–83 dB', midi:'−18 dBFS'};

  function tips(){
    var o = [];
    if (state.os === 'win' && state.card === 'entry') o.push('装厂商自带的 ASIO 驱动，别用系统默认的 WDM / MME，延迟能差一倍。');
    if (state.os === 'win' && state.card !== 'entry') o.push('在厂商 ASIO 面板里把采样率锁成 48 kHz，并和 DAW 工程设置保持一致。');
    if (state.os === 'mac') o.push('Core Audio 免驱即用，重点检查「音频 MIDI 设置」里的采样率是否与 DAW 一致。');
    if (state.use === 'rec') o.push('录人声峰值控制在 −12 dBFS 左右，最高不超 −6，留出后期余量，别贴着 0 录。');
    if (state.use === 'live') o.push('直播优先稳定：缓冲区别低于 128，开播前锁死采样率，别在直播中途改设置。');
    if (state.use === 'mix') o.push('把监听音量固定在 78–83 dB 再判断音色，音量一大低频就会"变好"，那是错觉。');
    if (state.use === 'midi') o.push('软音源多开卡顿时，先加缓冲区而不是减轨；还卡再查 DPC 延迟（LatencyMon）。');
    if (state.card === 'entry') o.push('入门声卡别追求 32 的缓冲区，稳定不爆音比数字好看重要得多。');
    if (state.card === 'pro') o.push('高端接口注意话放增益与话筒阻抗匹配，底噪往往来自增益结构而不是设备本身。');
    return o.slice(0, 4);
  }
  function render(){
    var buf = BUF[state.card][state.use];
    var lat = Math.round((buf / 48000 * 1000) * 2 + BASE[state.card]);
    $('#toolTitle').textContent = LABEL.use[state.use] + ' · ' + LABEL.card[state.card];
    $('#oSr').textContent = '48 kHz / 24bit';
    $('#oBuf').textContent = buf + ' samples';
    $('#oLat').textContent = '≈ ' + lat + ' ms';
    $('#oGain').textContent = GAIN[state.use];
    $('#oTips').innerHTML = tips().map(function(s){ return '<li>' + s + '</li>'; }).join('');
  }
  $$('.chips-f').forEach(function(g){
    var key = g.getAttribute('data-g');
    g.addEventListener('click', function(e){
      var b = e.target.closest('button'); if (!b) return;
      g.querySelectorAll('button').forEach(function(o){ o.classList.remove('on'); });
      b.classList.add('on');
      state[key] = b.getAttribute('data-v');
      render();
    });
  });
  render();

  $('#copyCfg').addEventListener('click', function(){
    var gLabel = $('#oGain').textContent;
    var gLine = (state.use === 'mix') ? '监听音量：' + gLabel : '目标电平：' + gLabel;
    var txt = '声卡配置建议（' + LABEL.os[state.os] + ' / ' + LABEL.card[state.card] + ' / ' + LABEL.use[state.use] + '）\n'
      + '采样率：48 kHz / 24bit\n'
      + '缓冲区：' + BUF[state.card][state.use] + ' samples\n'
      + '预估往返延迟：' + $('#oLat').textContent + '\n'
      + gLine + '\n\n'
      + tips().map(function(s, i){ return (i + 1) + '. ' + s; }).join('\n');
    var btn = this, old = btn.textContent;
    function done(){ btn.textContent = '已复制 ✓'; setTimeout(function(){ btn.textContent = old; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, function(){ btn.textContent = '复制失败，请手动选中'; setTimeout(function(){ btn.textContent = old; }, 1600); });
    } else { done(); }
  });
})();

/* ── 10. 播放器：真实频谱 + 三种回放环境模拟 ── */
(function(){
  var audio = new Audio(); audio.preload = 'none';
  var allItems = $$('#plList .pl-i');
  var items = allItems.slice();
  function refreshList(){
    items = allItems.filter(function(el){ return !el.classList.contains('is-hidden'); });
    /* roving tabindex：整个列表只占 1 个 Tab 位，方向键在列表内移动 */
    var first = true;
    items.forEach(function(el){ el.tabIndex = first ? 0 : -1; first = false; });
  }
  var idx = -1, playing = false;
  var ctx = null, srcNode = null, hp = null, lp = null, pk = null, analyser = null;
  var ENV = {
    hp:{hp:20, lp:20000, f:1000, g:0, note:'FLAT · 未做染色'},
    phone:{hp:320, lp:6500, f:2500, g:3, note:'模拟手机：切掉 320Hz 以下 / 6.5kHz 以上'},
    car:{hp:45, lp:13000, f:80, g:5, note:'模拟车载：低频抬 5dB，高频收到 13kHz'}
  };
  var curEnv = 'hp';

  function fmt(s){
    if (!s || !isFinite(s)) return '0:00';
    var m = Math.floor(s / 60), ss = Math.floor(s % 60);
    return m + ':' + (ss < 10 ? '0' : '') + ss;
  }
  function build(){
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    try { if (ctx.state === 'suspended') { ctx.resume().catch(function(){}); } } catch(e){}
    srcNode = ctx.createMediaElementSource(audio);
    hp = ctx.createBiquadFilter(); hp.type = 'highpass';
    lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    pk = ctx.createBiquadFilter(); pk.type = 'peaking'; pk.Q.value = 0.9;
    analyser = ctx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.75;
    srcNode.connect(hp); hp.connect(lp); lp.connect(pk); pk.connect(analyser); analyser.connect(ctx.destination);
    applyEnv();
  }
  function wake(){ try { if (ctx && ctx.state === 'suspended') { ctx.resume().catch(function(){}); } } catch(e){} }
  function applyEnv(){
    if (!ctx) return;
    var e = ENV[curEnv];
    hp.frequency.value = e.hp; lp.frequency.value = e.lp;
    pk.frequency.value = e.f; pk.gain.value = e.g;
    $('#envNote').textContent = e.note;
  }
  /* 无真实封面的曲目：用曲目编号做种子，生成独一无二的频谱指纹图 */
  function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function fpCanvas(seed, size){
    var cv = document.createElement('canvas'); cv.width = size * 2; cv.height = size * 2;
    cv.style.width = size + 'px'; cv.style.height = size + 'px';
    var g = cv.getContext('2d'); g.scale(2, 2);
    g.fillStyle = '#131722'; g.fillRect(0, 0, size, size);
    var rnd = mulberry32(seed * 7919 + 13);
    var cols = ['#5B8CFF', '#8B7CF6', '#D6B36A', '#E8E8E8'];
    var bars = 7, w = size / bars;
    for (var i = 0; i < bars; i++) {
      var h = size * (0.22 + rnd() * 0.62);
      g.fillStyle = cols[Math.floor(rnd() * cols.length) % cols.length];
      g.fillRect(i * w + w * 0.18, size - h - 3, w * 0.64, h);
    }
    return cv;
  }
  function fpSeed(it){
    var n = parseInt((it.getAttribute('data-src') || '').replace(/\D/g, ''), 10);
    return isNaN(n) ? 1 : n;
  }
  function setCover(el, it){
    var cover = it.getAttribute('data-cover');
    if (cover) {
      el.innerHTML = '<img src="' + cover + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px" />';
    } else {
      el.innerHTML = '';
      el.appendChild(fpCanvas(fpSeed(it), 52));
    }
  }
  function load(i){
    idx = i;
    removeEq();
    var it = items[i];
    items.forEach(function(o){ o.classList.remove('on'); });
    it.classList.add('on');
    audio.src = it.getAttribute('data-src');
    $('#nowTitle').textContent = it.getAttribute('data-title');
    $('#nowSub').textContent = it.getAttribute('data-singer');
    setCover($('#nowCover'), it);
  }
  function play(i){
    if (i !== undefined && i !== idx) load(i);
    if (idx < 0) load(0);
    build();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    var p = audio.play();
    if (p && typeof p.then === 'function') { p.then(null, function(){}); }
  }
  function toggle(){ if (audio.paused) play(); else audio.pause(); }

  allItems.forEach(function(it){ it.addEventListener('click', function(){ play(items.indexOf(it)); }); });
  $('#pPlay').addEventListener('click', toggle);
  /* 空格键播放/暂停（输入框和可聚焦元素除外） */
  document.addEventListener('keydown', function(e){
    if (e.code !== 'Space') return;
    var tg = e.target.tagName;
    if (tg === 'INPUT' || tg === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.target.closest && e.target.closest('button, a, [tabindex]')) return;
    e.preventDefault();
    toggle();
  });
  $('#pPrev').addEventListener('click', function(){ play((idx - 1 + items.length) % items.length); });
  $('#pNext').addEventListener('click', function(){ play((idx + 1) % items.length); });
  $('#bar').addEventListener('click', function(e){
    if (!audio.duration) return;
    var r = this.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min((e.clientX - r.left) / r.width, 1)) * audio.duration;
  });
  $('#envs').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    $$('#envs button').forEach(function(o){ o.classList.remove('on'); });
    b.classList.add('on'); curEnv = b.getAttribute('data-env'); applyEnv();
  });

  var plTabs = $('#plTabs');
  if (plTabs) {
    plTabs.addEventListener('click', function(e){
      var b = e.target.closest('button'); if (!b) return;
      plTabs.querySelectorAll('button').forEach(function(o){ o.classList.remove('on'); o.setAttribute('aria-selected','false'); });
      b.classList.add('on'); b.setAttribute('aria-selected','true');
      var cat = b.getAttribute('data-cat');
      allItems.forEach(function(el){
        el.classList.toggle('is-hidden', !(cat === 'all' || el.getAttribute('data-cat') === cat));
      });
      refreshList();
    });
  }
  refreshList();

  /* 无真实封面的曲目：用指纹封面替换首字母占位 */
  allItems.forEach(function(it){
    if (it.getAttribute('data-cover')) return;
    var ini = it.querySelector('.pl-ini');
    if (ini) it.replaceChild(fpCanvas(fpSeed(it), 38), ini);
  });

  /* 歌单键盘操作：Enter/Space 播放，方向键在可见曲目间移动 */
  $('#plList').addEventListener('keydown', function(e){
    var t = e.target.closest('.pl-i'); if (!t) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      play(items.indexOf(t));
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    var vi = items.filter(function(el){ return !el.classList.contains('is-hidden'); });
    var i = vi.indexOf(t);
    var n = vi[(i + (e.key === 'ArrowDown' ? 1 : vi.length - 1)) % vi.length];
    if (n) n.focus();
  });

  var ICON_P = '<path d="M7 4l13 8-13 8z"/>', ICON_S = '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>';
  var eqEl = null;
  function removeEq(){ if (eqEl && eqEl.parentNode) { eqEl.parentNode.removeChild(eqEl); } eqEl = null; }
  function addEq(){
    removeEq();
    if (idx < 0 || !items[idx]) return;
    var s = document.createElement('span');
    s.className = 'mini-eq';
    s.innerHTML = '<i></i><i></i><i></i>';
    items[idx].insertBefore(s, items[idx].querySelector('.k'));
    eqEl = s;
  }
  audio.addEventListener('play', function(){ playing = true; $('#pIcon').innerHTML = ICON_S; addEq(); });
  audio.addEventListener('pause', function(){ playing = false; $('#pIcon').innerHTML = ICON_P; removeEq(); });
  audio.addEventListener('ended', function(){ play((idx + 1) % items.length); });
  audio.addEventListener('playing', wake);
  document.addEventListener('pointerdown', wake);
  audio.addEventListener('loadedmetadata', function(){ $('#tDur').textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', function(){
    var p = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    $('#fill').style.width = p + '%';
    $('#tCur').textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('error', function(){
    if (audio.src) $('#nowSub').textContent = '音频加载失败，请检查网络或稍后再试';
  });

  /* 频谱画布：播放时走真实 AnalyserNode，空闲时走装饰动画 */
  var c = $('#viz'), x = c.getContext('2d'), t = 0, data = null, lastMode = '', vrect = null, idleSkip = 0;
  function size(){
    var r = c.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = r.width * dpr; c.height = r.height * dpr; x.setTransform(dpr,0,0,dpr,0,0);
    vrect = r;
  }
  function draw(){
    /* 先调度下一帧：任何异常都不会终止循环 */
    requestAnimationFrame(draw);
    try {
      var w = c.clientWidth, h = c.clientHeight, n = 48;
      if (!w || !h) { size(); return; }
      var bw = w / n;
      /* 三种模式：real=真实分析数据 / fake=合成频谱兜底 / idle=待机 */
      var mode = 'idle';
      if (analyser && playing) {
        try {
          if (!data || data.length !== analyser.frequencyBinCount) data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          var maxV = 0;
          for (var k = 0; k < data.length; k++) { if (data[k] > maxV) maxV = data[k]; }
          mode = maxV > 0 ? 'real' : 'fake';
        } catch (e) { mode = 'fake'; window.__vizErr = 'analyser: ' + e.message; }
      }
      /* 待机降帧：约 20fps，省电省合成；播放时全帧率 */
      if (mode === 'idle') { idleSkip++; if (idleSkip % 3 !== 0) return; } else { idleSkip = 0; }
      x.clearRect(0, 0, w, h);
      var lmx = (window._mx == null ? -1e5 : window._mx - vrect.left);
      var note = $('#envNote');
      if (note && mode !== 'idle' && mode !== lastMode) {
        note.textContent = mode === 'real' ? ENV[curEnv].note : ENV[curEnv].note + ' · 演示频谱';
      }
      lastMode = mode;
      for (var i = 0; i < n; i++) {
        var v = 0;
        if (mode === 'real') {
          var stepN = Math.max(1, Math.floor(data.length * 0.7 / n));
          v = data[i * stepN] / 255;
        } else if (mode === 'fake') {
          var sec = audio.currentTime || 0;
          var beat = Math.pow(1 - (sec % 0.5) / 0.5, 2.2);
          var f = i / n;
          v = (0.30 + 0.45 * Math.pow(Math.abs(Math.sin(t * 1.9 + i * 0.32)), 2))
            * (0.55 + 0.45 * Math.sin(t * 0.5 + i * 0.12))
            * (0.45 + 0.55 * beat) * (1.15 - f * 0.55);
        } else {
          var base = Math.sin(i * 0.4 + t) * 0.22 + Math.sin(i * 0.11 + t * 1.4) * 0.2 + 0.28;
          var lean = 1 + 0.85 * Math.exp(-Math.pow(i * bw + bw / 2 - lmx, 2) / 12800);
          v = Math.min(Math.max(base, 0), 1) * 0.7 * lean;
        }
        if (!isFinite(v)) v = 0.08;
        v = Math.max(0.06, Math.min(v, 1));
        var bh = Math.max(3, Math.min(v * (h - 14), h - 8));
        var g = x.createLinearGradient(0, h, 0, h - bh);
        if (mode === 'idle') { g.addColorStop(0, '#2a2a33'); g.addColorStop(1, '#3d3d49'); }
        else { g.addColorStop(0, '#5B8CFF'); g.addColorStop(1, i > n * 0.72 ? '#D6B36A' : '#8B7CF6'); }
        x.fillStyle = g;
        x.fillRect(i * bw + 1.5, h - bh - 7, Math.max(1, bw - 3), bh);
      }
      t += REDUCE ? 0 : 0.045;
    } catch (e) {
      window.__vizErr = e.message;
    }
  }
  size(); draw();
  window.addEventListener('resize', size);
})();

/* ── 11. 吉祥物：视线跟随 + 会说话 ── */
(function(){
  if (window._mx == null) { window._mx = window.innerWidth / 2; window._my = window.innerHeight * 0.4; }
  window.addEventListener('pointermove', function(e){ window._mx = e.clientX; window._my = e.clientY; }, {passive:true});

  var m = $('#mascot'); if (!m) return;
  var head = $('#mHead'), pupils = $$('.m-pupil');
  var bubble = $('#mBubble'), cx = 0, cy = 0;

  function measure(){
    var r = m.getBoundingClientRect();
    cx = r.left + r.width / 2; cy = r.top + r.height * 0.34;
  }
  measure();
  window.addEventListener('resize', measure);

  var LINES = [
    '耳机戴好，这段低频有点东西。',
    '人声再抬 1dB，你听。',
    '别催，母带正在压限。',
    '今天混哪首？点歌。',
    '增益别开太大，会爆。',
    '小音箱听不出低频？正常。',
    '11 首精选都在列表里，随便听。'
  ];
  var bi = 0, hideTimer = null;
  function say(){
    bubble.textContent = LINES[bi++ % LINES.length];
    bubble.classList.add('on');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function(){ bubble.classList.remove('on'); }, 3400);
  }
  m.addEventListener('click', function(){
    say();
    m.classList.remove('boing');
    void m.offsetWidth;
    m.classList.add('boing');
  });
  setTimeout(say, 2400);
  setInterval(function(){ if (!document.hidden) say(); }, 12000);

  if (REDUCE || !pupils.length) return;
  var cur = { x: 0, y: 0, r: 0 };
  (function loop(){
    var dx = window._mx - cx, dy = window._my - cy;
    var d = Math.min(Math.hypot(dx, dy) / 42, 1);
    var a = Math.atan2(dy, dx);
    var tx = Math.cos(a) * 3.4 * d, ty = Math.sin(a) * 3.4 * d;
    var tr = Math.max(-5, Math.min(5, dx / 60));
    cur.x += (tx - cur.x) * 0.085; cur.y += (ty - cur.y) * 0.085; cur.r += (tr - cur.r) * 0.085;
    var t = 'translate(' + cur.x.toFixed(2) + ',' + cur.y.toFixed(2) + ')';
    for (var i = 0; i < pupils.length; i++) pupils[i].setAttribute('transform', t);
    head.setAttribute('transform', 'rotate(' + cur.r.toFixed(2) + ' 65 58)');
    requestAnimationFrame(loop);
  })();
})();

/* ── 12. 卡片 3D 视差：随鼠标轻微倾斜 ── */
(function(){
  if (REDUCE || !window.matchMedia('(hover:hover)').matches) return;
  $$('.agent-c, .cred, .hero-card, .stat-c').forEach(function(el){
    el.classList.add('tilt');
    el.addEventListener('pointermove', function(e){
      var r = el.getBoundingClientRect();
      var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
      var ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
      el.style.transform = 'perspective(720px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    });
    el.addEventListener('pointerleave', function(){ el.style.transform = ''; });
  });
})();

/* ── 14. 一键复制（微信 / 邮箱） ── */
(function(){
  $$('[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){
      var txt = b.getAttribute('data-copy');
      var ok = function(){
        b.classList.add('ok');
        var old = b.textContent;
        b.textContent = '已复制 ✓';
        setTimeout(function(){ b.textContent = old; b.classList.remove('ok'); }, 1500);
      };
      var fallback = function(){
        var ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); ok(); } catch (e) {}
        document.body.removeChild(ta);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(ok, fallback);
      } else { fallback(); }
    });
  });
})();

/* ── 13. 尘埃粒子：三层景深 + 滚动视差 ── */
(function(){
  var c = $('#dust'); if (!c) return;
  var x = c.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var N = window.innerWidth < 700 ? 20 : 34;
  var ps = [];
  var TINT = ['255,255,255', '255,255,255', '232,232,232', '214,179,106', '91,140,255'];

  function size(){
    W = window.innerWidth; H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function seed(){
    ps = [];
    for (var i = 0; i < N; i++) {
      var z = Math.random() * 0.85 + 0.15;
      ps.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z: z,
        r: 0.5 + z * 1.7,
        vy: -(0.05 + z * 0.15),
        ph: Math.random() * 6.283,
        tint: TINT[Math.floor(Math.random() * TINT.length)]
      });
    }
  }
  function draw(){
    x.clearRect(0, 0, W, H);
    var sy = window.scrollY || 0;
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      p.y += p.vy;
      var drift = REDUCE ? 0 : Math.sin(p.ph + Date.now() / 2600) * (0.12 + p.z * 0.22);
      p.x += drift;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      /* 视差：远景几乎不动，近景跟着滚动明显位移 */
      var py = p.y + sy * (0.02 + p.z * 0.07);
      py = ((py % (H + 20)) + H + 20) % (H + 20) - 10;
      var a = 0.07 + p.z * 0.2;
      x.beginPath();
      x.fillStyle = 'rgba(' + p.tint + ',' + a.toFixed(3) + ')';
      x.arc(p.x, py, p.r, 0, 6.283);
      x.fill();
      /* 近景颗粒带一点光晕 */
      if (p.z > 0.72) {
        x.beginPath();
        x.fillStyle = 'rgba(' + p.tint + ',' + (a * 0.16).toFixed(3) + ')';
        x.arc(p.x, py, p.r * 3.2, 0, 6.283);
        x.fill();
      }
    }
    if (!REDUCE) requestAnimationFrame(draw);
  }
  size(); seed(); draw();
  window.addEventListener('resize', function(){ size(); seed(); if (REDUCE) draw(); });
})();
})();
