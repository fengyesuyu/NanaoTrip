/* ==============================================================
   潮汕国庆自驾 · 南澳岛  —  交互脚本
   纯原生 JS，无任何外部依赖
   ============================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 顶部导航 ---------- */
  function header() {
    var hdr = $('.hdr');
    if (!hdr) return;
    var prog = $('.prog', hdr);
    var burger = $('.burger', hdr);
    var nav = $('.nav', hdr);

    if (burger && nav) {
      burger.addEventListener('click', function () {
        nav.classList.toggle('open');
        burger.textContent = nav.classList.contains('open') ? '\u2715' : '\u2630';
      });
    }

    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      hdr.classList.toggle('on', y > 24);
      if (prog) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 2. Hero 视差 ---------- */
  function parallax() {
    var bg = $('.hero-bg img');
    if (!bg || rm) return;
    var ticking = false;
    function upd() {
      var y = window.pageYOffset || 0;
      if (y < window.innerHeight * 1.25) {
        bg.style.setProperty('--py', (y * 0.22).toFixed(1) + 'px');
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(upd); }
    }, { passive: true });
    upd();
  }

  /* ---------- 3. 滚动出现 ---------- */
  function reveal() {
    var els = $$('.rv');
    if (!els.length) return;
    if (rm || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var d = en.target.getAttribute('data-d') || 0;
          setTimeout(function () { en.target.classList.add('in'); }, Number(d) * 70);
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 4. 数字滚动 ---------- */
  function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;
    function run(el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var dec = (el.getAttribute('data-dec') | 0);
      if (rm) { el.textContent = to.toFixed(dec); return; }
      var t0 = null, dur = 1100;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------- 5. Day 切换 ---------- */
  function dayTabs() {
    var tabs = $$('.tab[data-day]');
    if (!tabs.length) return;
    var panels = $$('.panel[data-day]');
    function go(id, push) {
      tabs.forEach(function (t) { t.classList.toggle('act', t.getAttribute('data-day') === id); });
      panels.forEach(function (p) { p.classList.toggle('act', p.getAttribute('data-day') === id); });
      if (push && history.replaceState) history.replaceState(null, '', '#' + id);
      var on = $('.tab.act');
      if (on && on.scrollIntoView) {
        on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: rm ? 'auto' : 'smooth' });
      }
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { go(t.getAttribute('data-day'), true); });
    });
    var want = (location.hash || '').replace('#', '');
    var hit = tabs.filter(function (t) { return t.getAttribute('data-day') === want; })[0];
    go(hit ? want : tabs[0].getAttribute('data-day'), false);

    // 键盘左右切换
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var i = tabs.findIndex(function (t) { return t.classList.contains('act'); });
      var n = e.key === 'ArrowRight' ? i + 1 : i - 1;
      if (n >= 0 && n < tabs.length) go(tabs[n].getAttribute('data-day'), true);
    });
  }

  /* ---------- 6. 美食筛选 + 搜索 ---------- */
  function foodFilter() {
    var box = $('[data-food-grid]');
    if (!box) return;
    var chips = $$('.chip[data-f]');
    var input = $('[data-food-search]');
    var empty = $('[data-food-empty]');
    var cards = $$('.fcard', box);
    var cur = 'all';

    function apply() {
      var q = (input && input.value || '').trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var tags = (c.getAttribute('data-tags') || '') + ' ' + (c.getAttribute('data-txt') || '');
        var okF = cur === 'all' || tags.indexOf(cur) > -1;
        var okQ = !q || tags.toLowerCase().indexOf(q) > -1;
        var vis = okF && okQ;
        c.style.display = vis ? '' : 'none';
        if (vis) shown++;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    }
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.remove('act'); });
        ch.classList.add('act');
        cur = ch.getAttribute('data-f');
        apply();
      });
    });
    if (input) input.addEventListener('input', apply);
    apply();
  }

  /* ---------- 7. 灯箱 ---------- */
  function lightbox() {
    var cards = $$('[data-lb]');
    if (!cards.length) return;
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.innerHTML =
      '<button class="lb-x" aria-label="关闭">\u2715</button>' +
      '<div class="lb-c"><img alt=""><div class="lb-in">' +
      '<h3></h3><div class="row"></div><p class="d1"></p><p class="d2"></p>' +
      '</div></div>';
    document.body.appendChild(lb);

    var img = $('img', lb), h3 = $('h3', lb), row = $('.row', lb);
    var d1 = $('.d1', lb), d2 = $('.d2', lb);

    function open(card) {
      var cimg = $('img', card);
      img.src = cimg ? cimg.getAttribute('src') : '';
      img.alt = cimg ? (cimg.getAttribute('alt') || '') : '';
      h3.textContent = card.getAttribute('data-name') || '';
      row.innerHTML = '';
      (card.getAttribute('data-pills') || '').split('|').forEach(function (t) {
        if (!t) return;
        var s = document.createElement('span');
        s.textContent = t;
        row.appendChild(s);
      });
      d1.textContent = card.getAttribute('data-d1') || '';
      d2.textContent = card.getAttribute('data-d2') || '';
      d2.style.display = d2.textContent ? '' : 'none';
      lb.classList.add('on');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('on');
      document.body.style.overflow = '';
    }
    cards.forEach(function (c) {
      c.addEventListener('click', function () { open(c); });
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb-x')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------- 8. 行前清单（本地存档） ---------- */
  function checklist() {
    var list = $('[data-check]');
    if (!list) return;
    var KEY = 'nanao-check-v1';
    var items = $$('li', list);
    var bar = $('[data-check-bar]');
    var txt = $('[data-check-txt]');
    var reset = $('[data-check-reset]');
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { saved = {}; }

    function sync() {
      var done = items.filter(function (i) { return i.classList.contains('done'); }).length;
      var pct = items.length ? Math.round((done / items.length) * 100) : 0;
      if (bar) bar.style.width = pct + '%';
      if (txt) txt.textContent = done + ' / ' + items.length + ' 项';
    }
    function save() {
      var o = {};
      items.forEach(function (i) {
        if (i.classList.contains('done')) o[i.getAttribute('data-k')] = 1;
      });
      try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
    }
    items.forEach(function (i) {
      if (saved[i.getAttribute('data-k')]) i.classList.add('done');
      i.addEventListener('click', function () {
        i.classList.toggle('done');
        save(); sync();
      });
    });
    if (reset) {
      reset.addEventListener('click', function () {
        items.forEach(function (i) { i.classList.remove('done'); });
        save(); sync();
      });
    }
    sync();
  }

  /* ---------- 9. 预算计算器 ---------- */
  function budget() {
    var root = $('[data-calc]');
    if (!root) return;

    // 汕头东海岸海景房档位（元/间/晚）与人均餐标（元/人/天）
    var TIER = {
      eco:     { name: '经济', room: 300, meal: 150 },
      comfort: { name: '舒适', room: 480, meal: 250 },
      lux:     { name: '品质', room: 750, meal: 350 }
    };
    var st = { tier: 'comfort', people: 3, days: 5, sea: true, charge: false, gift: true };

    var big = $('[data-sum-total]');
    var per = $('[data-sum-per]');
    var lines = $('[data-sum-lines]');
    var pv = $('[data-people]');
    var dv = $('[data-days]');

    var LABEL = {
      charge: '充电（自费快充）',
      toll: '南澳大桥过桥费',
      park: '停车费',
      hotel: '住宿',
      meal: '餐饮',
      ticket: '景点门票',
      sea: '海上项目',
      gift: '手信与备用金'
    };

    function calc() {
      var t = TIER[st.tier];
      var rooms = Math.ceil(st.people / 2);
      var nights = Math.max(1, st.days - 1);
      var o = {};
      o.charge = st.charge ? 260 : 0;
      o.toll = 96;                       // 南澳大桥；节假日可能免，单独说明
      o.park = 150;
      o.hotel = t.room * rooms * nights;
      o.meal = t.meal * st.people * st.days;
      o.ticket = 55 * st.people;
      o.sea = st.sea ? 160 * st.people : 0;
      o.gift = st.gift ? 800 : 600;
      return o;
    }

    function render(animate) {
      var o = calc();
      var total = 0;
      for (var k in o) total += o[k];

      if (big) {
        if (animate && !rm) {
          var from = parseFloat(big.getAttribute('data-v') || '0');
          big.setAttribute('data-v', total);
          var t0 = null;
          (function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min(1, (ts - t0) / 620);
            var e = 1 - Math.pow(1 - p, 3);
            big.textContent = '\u00a5' + Math.round(from + (total - from) * e).toLocaleString('en-US');
            if (p < 1) requestAnimationFrame(step);
          })(performance.now());
        } else {
          big.setAttribute('data-v', total);
          big.textContent = '\u00a5' + total.toLocaleString('en-US');
        }
      }
      if (per) {
        per.textContent = '3 人分摊约 ' + '\u00a5' +
          Math.round(total / st.people).toLocaleString('en-US') + ' / 人';
      }
      if (lines) {
        var html = '';
        var keys = ['hotel', 'meal', 'gift', 'sea', 'charge', 'toll', 'park', 'ticket'];
        keys.forEach(function (k) {
          if (o[k] === 0) return;
          html += '<div class="li"><span>' + LABEL[k] + '</span><b>\u00a5' +
            o[k].toLocaleString('en-US') + '</b></div>';
        });
        lines.innerHTML = html;
      }
    }

    $$('.seg button', root).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.seg button', root).forEach(function (x) { x.classList.remove('act'); });
        b.classList.add('act');
        st.tier = b.getAttribute('data-tier');
        render(true);
      });
    });

    $$('[data-step]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var which = b.getAttribute('data-step');
        var d = which === 'people+' ? 1 : which === 'people-' ? -1
              : which === 'days+' ? 1 : -1;
        if (which.indexOf('people') === 0) {
          st.people = Math.max(1, Math.min(8, st.people + d));
          if (pv) pv.textContent = st.people;
        } else {
          st.days = Math.max(3, Math.min(8, st.days + d));
          if (dv) dv.textContent = st.days;
        }
        render(true);
      });
    });

    $$('.tg[data-key]', root).forEach(function (el) {
      el.addEventListener('click', function () {
        var k = el.getAttribute('data-key');
        st[k] = !st[k];
        el.classList.toggle('on', st[k]);
        render(true);
      });
    });

    // 初始化 toggle 外观
    $$('.tg[data-key]', root).forEach(function (el) {
      el.classList.toggle('on', !!st[el.getAttribute('data-key')]);
    });

    render(false);
  }

  /* ---------- 启动 ---------- */
  function boot() {
    header(); parallax(); reveal(); counters();
    dayTabs(); foodFilter(); lightbox(); checklist(); budget();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
