/* ============================================================
   coord-demo.js — Coordination Layer demo
   Builds four stacked, scroll-revealed frames (States 03-06)
   inside every .coord-demo container on the page. No iframe, no
   internal scroll: the frames live in the normal page flow and
   inherit the site's fonts.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- isometric helpers ---------- */
  var TILE_W = 44, TILE_H = 20, HEIGHT_UNIT = 22;
  function iso(x, y, z) {
    z = z || 0;
    return { x: (x - y) * TILE_W, y: (x + y) * TILE_H - z * HEIGHT_UNIT };
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function buildingPath(gx, gy, w, d, h) {
    var A = iso(gx, gy, h), B = iso(gx + w, gy, h), Cc = iso(gx + w, gy + d, h), D = iso(gx, gy + d, h);
    var E1 = iso(gx + w, gy, h), E2 = iso(gx + w, gy + d, h), E3 = iso(gx + w, gy + d, 0), E4 = iso(gx + w, gy, 0);
    var S1 = iso(gx, gy + d, h), S2 = iso(gx + w, gy + d, h), S3 = iso(gx + w, gy + d, 0), S4 = iso(gx, gy + d, 0);
    return {
      top: 'M ' + A.x + ' ' + A.y + ' L ' + B.x + ' ' + B.y + ' L ' + Cc.x + ' ' + Cc.y + ' L ' + D.x + ' ' + D.y + ' Z',
      east: 'M ' + E1.x + ' ' + E1.y + ' L ' + E2.x + ' ' + E2.y + ' L ' + E3.x + ' ' + E3.y + ' L ' + E4.x + ' ' + E4.y + ' Z',
      south: 'M ' + S1.x + ' ' + S1.y + ' L ' + S2.x + ' ' + S2.y + ' L ' + S3.x + ' ' + S3.y + ' L ' + S4.x + ' ' + S4.y + ' Z'
    };
  }

  /* ---------- data ---------- */
  var ROUTE_BUILDINGS = [
    { id: 1, gx: 0,  gy: 5, w: 2.5, d: 2,   h: 2.2, label: 'Family Resource Center', short: 'INTAKE' },
    { id: 2, gx: 4,  gy: 5, w: 2,   d: 2,   h: 2.8, label: 'Eligibility Office',     short: 'ASSESS' },
    { id: 3, gx: 7,  gy: 5, w: 2.2, d: 2,   h: 3.4, label: 'Service Match',          short: 'MATCH' },
    { id: 4, gx: 9,  gy: 9, w: 1.6, d: 1.6, h: 2.0, label: 'Handoff & Confirmation', short: 'HANDOFF' },
    { id: 5, gx: 13, gy: 7, w: 2,   d: 2,   h: 2.6, label: 'Service Delivery',       short: 'SERVICE' },
    { id: 6, gx: 16, gy: 4, w: 2,   d: 1.6, h: 2.2, label: 'Resolution & Report',    short: 'RESOLVE' }
  ];
  var AMBIENT_BUILDINGS = [
    { gx: 2,gy:1,w:1.2,d:1.2,h:1.4 },{ gx:0,gy:2,w:1.5,d:1,h:1.0 },
    { gx: 5,gy:1,w:1.4,d:1.2,h:1.6 },{ gx:8,gy:2,w:1.6,d:1.2,h:1.2 },
    { gx:11,gy:1,w:1.2,d:1.4,h:1.8 },{ gx:13,gy:2,w:1.4,d:1.2,h:1.2 },
    { gx:16,gy:1,w:1.2,d:1.2,h:1.4 },
    { gx: 2,gy:8,w:1.2,d:1.2,h:1.2 },{ gx:5,gy:9,w:1.4,d:1.2,h:1.0 },
    { gx:12,gy:10,w:1.4,d:1.2,h:1.4 },{ gx:15,gy:10,w:1.2,d:1.2,h:1.2 },
    { gx:17,gy:8,w:1.5,d:1,h:1.4 },{ gx:18,gy:6,w:1.2,d:1.2,h:1.6 },
    { gx: 0,gy:8,w:1.0,d:1.0,h:0.9 },{ gx:11,gy:6,w:1.2,d:1.2,h:1.0 },
    { gx:14,gy:5,w:1.0,d:1.0,h:1.2 }
  ];
  var TREES = [
    {gx:1.5,gy:0.5,scale:1.0},{gx:7,gy:0.5,scale:0.9},{gx:10,gy:0.5,scale:1.1},
    {gx:14,gy:0.5,scale:1.0},{gx:18,gy:0.5,scale:0.9},
    {gx:1.5,gy:10.5,scale:1.0},{gx:4,gy:11,scale:0.95},{gx:8,gy:11,scale:1.0},
    {gx:14,gy:11.5,scale:1.05},
    {gx:6,gy:7,scale:0.7},{gx:11,gy:3.5,scale:0.75},{gx:15.5,gy:6.5,scale:0.7}
  ];
  var AMB = { top: '#262626', east: '#1c1c1c', south: '#141414' };
  var NODE_COLORS = ['#5cc5c5', '#4ab5b5', '#7dd6d6', '#6acaca'];

  var FRAMES = [
    {
      state: 'overlay', sheet: 'SHEET A · 01/04', counter: false,
      eyebrow: 'STATE 03 · OVERLAY',
      title: 'Place the process on the place.',
      desc: 'Each step lives at an address. The route becomes traceable — not as boxes and arrows, but as the actual journey a family takes through their week, across agencies, in working hours.'
    },
    {
      state: 'flow', sheet: 'SHEET B · 02/04', counter: true,
      eyebrow: 'STATE 04 · LIVE FLOW',
      title: 'Now watch what happens.',
      desc: 'Each dot is a family entering the system. They move through the pathway — step to step, handoff to handoff. When coordination works, this is what it looks like.'
    },
    {
      state: 'stuck', sheet: 'SHEET C · 03/04', counter: true,
      eyebrow: 'STATE 05 · WHERE ACCESS BREAKS',
      title: 'And here’s where it actually breaks.',
      desc: 'Families stall at the handoff. No one is responsible for confirming the catch. Days pass. Some get lost entirely. This isn’t a personnel problem — it’s an infrastructure gap.'
    },
    {
      state: 'reliable', sheet: 'SHEET D · 04/04', counter: true,
      eyebrow: 'STATE 06 · COORDINATION INFRASTRUCTURE',
      title: 'Now make the layer operational.',
      desc: 'Pathways visible. Handoffs owned. Outcomes auditable. The work doesn’t change — it becomes accountable. This is the operating layer the field has been missing.'
    }
  ];

  /* ---------- build a frame's DOM ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function buildCounter() {
    var panel = el('div', 'cd-counter');
    panel.innerHTML =
      '<div class="cd-counter-head"><span class="cd-counter-label">Live Pathway Status</span><div class="cd-live-dot"></div></div>' +
      '<div class="cd-row entered"><span class="cd-row-label">Families entered</span><span class="cd-row-value cd-entered">0</span></div>' +
      '<div class="cd-row inprogress"><span class="cd-row-label">In progress</span><span class="cd-row-value cd-inprogress">0</span></div>' +
      '<div class="cd-row completed"><span class="cd-row-label">Completed</span><span class="cd-row-value cd-completed">0</span></div>' +
      '<div class="cd-row stuck"><span class="cd-row-label">Stuck · 14+ days</span><span class="cd-row-value cd-stuck">0</span></div>' +
      '<div class="cd-counter-divider"></div>' +
      '<div class="cd-counter-summary"><span class="cd-row-label">Resolution rate</span><span class="cd-rate cd-rate-v">—</span></div>';
    return panel;
  }

  function buildFrame(cfg) {
    var frame = el('section', 'cd-frame');
    frame.setAttribute('data-state', cfg.state);

    ['tl', 'tr', 'bl', 'br'].forEach(function (pos) {
      frame.appendChild(el('div', 'cd-corner ' + pos));
    });

    if (cfg.counter) frame.appendChild(buildCounter());

    var mapWrap = el('div', 'cd-map-wrap');
    var svg = svgEl('svg', { class: 'cd-map', viewBox: '0 0 1500 800', preserveAspectRatio: 'xMidYMid meet' });
    svg.setAttribute('data-state', cfg.state);
    mapWrap.appendChild(svg);
    frame.appendChild(mapWrap);

    var narr = el('div', 'cd-narration');
    narr.innerHTML =
      '<div class="cd-eyebrow">' + cfg.eyebrow + '</div>' +
      '<h3 class="cd-title">' + cfg.title + '</h3>' +
      '<p class="cd-desc">' + cfg.desc + '</p>';
    frame.appendChild(narr);

    return { frame: frame, svg: svg, cfg: cfg };
  }

  /* ---------- static map render ---------- */
  function buildStaticMap(svg) {
    svg.appendChild(svgEl('defs'));
    var root = svgEl('g', { transform: 'translate(700, 90)' });
    svg.appendChild(root);

    var gGround = svgEl('g');
    var i, j, p1, p2;
    for (i = -1; i <= 20; i += 2) {
      p1 = iso(i, -1); p2 = iso(i, 13);
      gGround.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: 'cd-ground-line' }));
    }
    for (j = -1; j <= 13; j += 2) {
      p1 = iso(-1, j); p2 = iso(20, j);
      gGround.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: 'cd-ground-line' }));
    }
    root.appendChild(gGround);

    var gRoads = svgEl('g');
    var roads = [
      [{x:0,y:4},{x:20,y:4}],[{x:0,y:7.2},{x:20,y:7.2}],[{x:0,y:11},{x:20,y:11}],
      [{x:3.5,y:0},{x:3.5,y:12}],[{x:6.7,y:0},{x:6.7,y:12}],[{x:10,y:0},{x:10,y:12}],
      [{x:12.5,y:0},{x:12.5,y:12}],[{x:15.5,y:0},{x:15.5,y:12}],[{x:18.5,y:0},{x:18.5,y:12}]
    ];
    roads.forEach(function (r) {
      var a = iso(r[0].x, r[0].y), b = iso(r[1].x, r[1].y);
      gRoads.appendChild(svgEl('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'cd-road' }));
    });
    root.appendChild(gRoads);

    function depth(a, b) { return (a.gx + a.gy) - (b.gx + b.gy); }

    var gAmb = svgEl('g', { class: 'cd-ambient' });
    AMBIENT_BUILDINGS.slice().sort(depth).forEach(function (b) {
      var p = buildingPath(b.gx, b.gy, b.w, b.d, b.h);
      gAmb.appendChild(svgEl('path', { d: p.south, fill: AMB.south, class: 'cd-bldg-south' }));
      gAmb.appendChild(svgEl('path', { d: p.east,  fill: AMB.east,  class: 'cd-bldg-east' }));
      gAmb.appendChild(svgEl('path', { d: p.top,   fill: AMB.top,   class: 'cd-bldg-top' }));
    });
    root.appendChild(gAmb);

    var gTrees = svgEl('g');
    TREES.slice().sort(depth).forEach(function (t) {
      var base = iso(t.gx, t.gy, 0), top = iso(t.gx, t.gy, 0.9 * t.scale);
      gTrees.appendChild(svgEl('rect', { x: base.x - 1, y: base.y - 14 * t.scale, width: 2, height: 14 * t.scale, class: 'cd-tree-trunk' }));
      gTrees.appendChild(svgEl('ellipse', { cx: top.x, cy: top.y - 4 * t.scale, rx: 9 * t.scale, ry: 7 * t.scale, class: 'cd-tree-canopy' }));
    });
    root.appendChild(gTrees);

    var gRoute = svgEl('g');
    var pts = ROUTE_BUILDINGS.map(function (b) { return iso(b.gx + b.w/2, b.gy + b.d/2, 0); });
    var dPath = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (i = 1; i < pts.length; i++) {
      var prev = pts[i-1], curr = pts[i];
      dPath += ' Q ' + ((prev.x+curr.x)/2) + ' ' + ((prev.y+curr.y)/2 + 4) + ' ' + curr.x + ' ' + curr.y;
    }
    gRoute.appendChild(svgEl('path', { d: dPath, class: 'cd-route-line' }));
    root.appendChild(gRoute);

    var gRouteBld = svgEl('g');
    ROUTE_BUILDINGS.slice().sort(depth).forEach(function (b) {
      var p = buildingPath(b.gx, b.gy, b.w, b.d, b.h);
      var grp = svgEl('g', { class: 'cd-route-bldg' });
      grp.appendChild(svgEl('path', { d: p.south, class: 'cd-bldg-south' }));
      grp.appendChild(svgEl('path', { d: p.east,  class: 'cd-bldg-east' }));
      grp.appendChild(svgEl('path', { d: p.top,   class: 'cd-bldg-top' }));
      var c = iso(b.gx + b.w/2, b.gy + b.d/2, b.h);
      grp.appendChild(svgEl('circle', { cx: c.x, cy: c.y, r: 3, fill: '#4cb8b8', opacity: '0.95' }));
      gRouteBld.appendChild(grp);
    });
    root.appendChild(gRouteBld);

    var gPins = svgEl('g');
    ROUTE_BUILDINGS.forEach(function (b) {
      var c = iso(b.gx + b.w/2, b.gy + b.d/2, b.h);
      var pinY = c.y - 32;
      var grp = svgEl('g');
      grp.appendChild(svgEl('line', { x1: c.x, y1: c.y, x2: c.x, y2: pinY + 12, stroke: '#f0eee4', 'stroke-width': '0.6', opacity: 0.5 }));
      grp.appendChild(svgEl('circle', { cx: c.x, cy: pinY, r: 12, class: 'cd-pin-circle' }));
      var num = svgEl('text', { x: c.x, y: pinY, class: 'cd-pin-number' });
      num.textContent = b.id; grp.appendChild(num);
      // Labels sit ABOVE the pin (in open space) so they stay legible
      var lbl = svgEl('text', { x: c.x, y: pinY - 32, class: 'cd-pin-label' });
      lbl.textContent = b.short; grp.appendChild(lbl);
      var sub = svgEl('text', { x: c.x, y: pinY - 20, class: 'cd-pin-label-sub' });
      sub.textContent = b.label; grp.appendChild(sub);
      gPins.appendChild(grp);
    });
    root.appendChild(gPins);

    var gNodes = svgEl('g', { class: 'cd-layer-nodes' });
    root.appendChild(gNodes);

    var state = svg.getAttribute('data-state');

    if (state === 'stuck') {
      var hb = ROUTE_BUILDINGS[3];
      var hc = iso(hb.gx + hb.w/2, hb.gy + hb.d/2, 0);
      var gStuck = svgEl('g');
      gStuck.appendChild(svgEl('circle', { cx: hc.x, cy: hc.y + 8, r: 30, class: 'cd-stuck-warning' }));
      var ring2 = svgEl('circle', { cx: hc.x, cy: hc.y + 8, r: 45, class: 'cd-stuck-warning' });
      ring2.style.animationDelay = '0.9s';
      gStuck.appendChild(ring2);
      var slbl = svgEl('text', { x: hc.x, y: hc.y + 60, class: 'cd-stuck-label' });
      slbl.textContent = 'HANDOFF GAP — NO ONE OWNS THE CATCH';
      gStuck.appendChild(slbl);
      root.appendChild(gStuck);
    }

    if (state === 'reliable') {
      var gGrid = svgEl('g');
      for (i = -2; i <= 22; i += 1) {
        p1 = iso(i, -1); p2 = iso(i, 13);
        gGrid.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: 'cd-reliable-grid' }));
      }
      for (j = -1; j <= 13; j += 1) {
        p1 = iso(-2, j); p2 = iso(22, j);
        gGrid.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: 'cd-reliable-grid' }));
      }
      root.appendChild(gGrid);

      var badge = svgEl('g', { transform: 'translate(0, 40)' });
      badge.appendChild(svgEl('rect', { x: -230, y: 0, width: 460, height: 64, style: 'fill: #1a1a1a; stroke: #4cb8b8; stroke-width: 1.2;', rx: 1 }));
      var t1 = svgEl('text', { x: 0, y: 24, style: 'font-family: "Geist Mono", ui-monospace, monospace; font-size: 10px; fill: #4cb8b8; letter-spacing: 0.22em; font-weight: 500;', 'text-anchor': 'middle' });
      t1.textContent = 'COORDINATION INFRASTRUCTURE · ENGAGED'; badge.appendChild(t1);
      var t2 = svgEl('text', { x: 0, y: 50, style: 'font-family: Georgia, serif; font-size: 20px; fill: #f0eee4; font-style: italic;', 'text-anchor': 'middle' });
      t2.textContent = 'Every pathway visible. Every handoff owned.'; badge.appendChild(t2);
      root.appendChild(badge);
    }

    return gNodes;
  }

  /* ---------- animation controller per frame ---------- */
  function getRoutePoint(segment, t) {
    var from = ROUTE_BUILDINGS[segment], to = ROUTE_BUILDINGS[segment + 1];
    if (!to) return iso(from.gx + from.w/2, from.gy + from.d/2, 0);
    var a = iso(from.gx + from.w/2, from.gy + from.d/2, 0);
    var b = iso(to.gx + to.w/2, to.gy + to.d/2, 0);
    var midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2 + 4;
    return {
      x: (1-t)*(1-t)*a.x + 2*(1-t)*t*midX + t*t*b.x,
      y: (1-t)*(1-t)*a.y + 2*(1-t)*t*midY + t*t*b.y
    };
  }

  function createController(item) {
    var state = item.cfg.state;
    var nodesLayer = buildStaticMap(item.svg);
    if (state === 'overlay') return { start: function () {}, stop: function () {} };

    var frameEl = item.frame;
    var q = function (sel) { return frameEl.querySelector(sel); };
    var cEntered = q('.cd-entered'), cInProg = q('.cd-inprogress'),
        cCompleted = q('.cd-completed'), cStuck = q('.cd-stuck'), cRate = q('.cd-rate-v');

    var nodes = [], stats = { entered:0, inProgress:0, completed:0, stuck:0, lost:0 };
    var spawnAccum = 0, lastT = 0, rafId = null, running = false, total = 0;

    function updateCounters() {
      cEntered.textContent = stats.entered;
      cInProg.textContent = stats.inProgress;
      cCompleted.textContent = stats.completed;
      cStuck.textContent = stats.stuck;
      var tot = stats.completed + stats.stuck + stats.lost;
      if (tot > 5) {
        var rate = Math.round((stats.completed / tot) * 100);
        cRate.textContent = rate + '%';
        cRate.style.color = rate >= 80 ? 'var(--cd-olive)' : (rate >= 50 ? 'var(--cd-ink)' : 'var(--cd-rust)');
      } else { cRate.textContent = '—'; cRate.style.color = 'var(--cd-ink)'; }
    }

    function spawn() {
      total++;
      var n = {
        segment: 0, t: 0,
        speed: 0.0006 + Math.random() * 0.0008,
        status: 'flowing',
        color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
        radius: 4 + Math.random() * 1.2,
        stuckTimer: 0, el: null, willStick: false, willLose: false
      };
      if (state === 'stuck') { var r = Math.random(); n.willStick = r < 0.55; n.willLose = r > 0.92; }
      else if (state === 'reliable') { n.speed *= 1.5; }
      var dot = svgEl('circle', { r: n.radius, fill: n.color, class: 'cd-node', opacity: 0.92 });
      nodesLayer.appendChild(dot); n.el = dot;
      nodes.push(n); stats.entered++; stats.inProgress++;
    }

    function update(dt) {
      for (var i = nodes.length - 1; i >= 0; i--) {
        var n = nodes[i];
        if (n.status === 'completed' || n.status === 'lost') {
          n.fadeOut = (n.fadeOut || 0) + dt;
          if (n.el) n.el.setAttribute('opacity', Math.max(0, 0.92 - n.fadeOut * 0.0015));
          if (n.fadeOut > 700) { if (n.el && n.el.parentNode) n.el.parentNode.removeChild(n.el); nodes.splice(i, 1); }
          continue;
        }
        if (n.status === 'stuck') {
          n.stuckTimer += dt;
          var pulse = 1 + Math.sin(n.stuckTimer / 200) * 0.08;
          if (n.el) {
            n.el.setAttribute('r', n.radius * pulse);
            n.el.setAttribute('fill', '#e07d4a');
            n.el.setAttribute('stroke', '#c4663a');
            var sp = getRoutePoint(3, 0);
            n.el.setAttribute('cx', sp.x + (n.stuckOffsetX || 0));
            n.el.setAttribute('cy', sp.y + (n.stuckOffsetY || 0));
          }
          if (n.stuckTimer > 9000 && Math.random() < 0.002) {
            n.status = 'lost'; stats.stuck--; stats.lost++; stats.inProgress--; updateCounters();
          }
          continue;
        }
        n.t += n.speed * dt;
        if (n.t >= 1) {
          n.segment++; n.t = 0;
          if (n.segment >= ROUTE_BUILDINGS.length - 1) {
            n.status = 'completed'; stats.completed++; stats.inProgress--;
            if (n.el) n.el.setAttribute('fill', '#a3b85a'); updateCounters(); continue;
          }
          if (n.segment === 3 && n.willStick) {
            n.status = 'stuck';
            n.stuckOffsetX = (Math.random() - 0.5) * 38;
            n.stuckOffsetY = (Math.random() - 0.5) * 22;
            stats.stuck++; updateCounters();
          }
        }
        var p = getRoutePoint(n.segment, n.t);
        if (n.el) { n.el.setAttribute('cx', p.x); n.el.setAttribute('cy', p.y); }
      }
    }

    function loop(ts) {
      if (!running) return;
      var dt = ts - (lastT || ts); lastT = ts;
      spawnAccum += dt;
      var interval = state === 'reliable' ? 500 : 700;
      if (spawnAccum > interval && nodes.length < 80) { spawn(); spawnAccum = 0; updateCounters(); }
      update(dt);
      rafId = requestAnimationFrame(loop);
    }

    return {
      start: function () { if (running) return; running = true; lastT = 0; rafId = requestAnimationFrame(loop); },
      stop: function () { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }
    };
  }

  /* ---------- init each container ---------- */
  function initContainer(container) {
    if (container.getAttribute('data-cd-init') === '1') return;
    container.setAttribute('data-cd-init', '1');

    var controllers = [];
    FRAMES.forEach(function (cfg) {
      var item = buildFrame(cfg);
      container.appendChild(item.frame);
      var ctrl = createController(item);
      controllers.push({ el: item.frame, ctrl: ctrl });
    });

    if ('IntersectionObserver' in window) {
      var map = {};
      controllers.forEach(function (c, idx) { c.el.setAttribute('data-cd-idx', idx); map[idx] = c.ctrl; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var idx = e.target.getAttribute('data-cd-idx');
          var ctrl = map[idx];
          if (!ctrl) return;
          if (e.isIntersecting) ctrl.start(); else ctrl.stop();
        });
      }, { threshold: 0.05 });
      controllers.forEach(function (c) { io.observe(c.el); });
    } else {
      controllers.forEach(function (c) { c.ctrl.start(); });
    }
  }

  function init() {
    var nodes = document.querySelectorAll('.coord-demo');
    for (var i = 0; i < nodes.length; i++) initContainer(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
