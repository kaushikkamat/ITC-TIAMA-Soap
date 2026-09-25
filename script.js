/* =====================================================================
   Tiama — interactions
   No libraries. Everything is 2D: SVG scenes scrubbed by scroll, plus
   reveals, a mood switcher, counters and the usual site chrome.
   ===================================================================== */
(() => {
"use strict";

const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const clamp  = (v,a,b) => v<a?a:v>b?b:v;
const sstep  = t => { t = clamp(t,0,1); return t*t*(3-2*t); };
/* remap x from [a,b] to 0..1, smoothed — used to time each beat of a scene */
const span   = (x,a,b) => sstep((x-a)/Math.max(1e-6,(b-a)));
const lerp   = (a,b,t) => a+(b-a)*t;
const $  = (s,r) => (r||document).querySelector(s);
const $$ = (s,r) => [...(r||document).querySelectorAll(s)];

/* rAF-throttled scroll fan-out: one listener, one frame, many readers */
const readers = [];
let queued = false;
function onScroll(fn){ readers.push(fn); }
function pump(){
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; for (const f of readers) f(); });
}
addEventListener("scroll", pump, {passive:true});
addEventListener("resize", pump, {passive:true});

/* ===================== header, progress, mobile nav ===================== */
(function chrome(){
  const header = $("#header");
  const bar    = $("#scrollProgress");
  const toggle = $("#navToggle");
  const links  = $("#navLinks");

  onScroll(() => {
    const y = window.scrollY;
    header.classList.toggle("is-stuck", y > 12);
    const doc = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    bar.style.width = (clamp(y/doc,0,1)*100).toFixed(2) + "%";
  });

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$("a", links).forEach(a => a.addEventListener("click", () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded","false");
  }));
})();

/* ============================ reveal on scroll ============================ */
(function reveals(){
  const items = $$(".reveal");
  if (!items.length) return;
  if (reduce.matches || !("IntersectionObserver" in window)){
    items.forEach(el => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries){
      if (e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target); }
    }
  }, {rootMargin:"0px 0px -12% 0px", threshold:0.12});
  items.forEach(el => io.observe(el));
})();

/* ============================ counters ============================ */
(function counters(){
  const els = $$("[data-count]");
  if (!els.length) return;
  const run = (el) => {
    const to = parseFloat(el.dataset.count);
    const pre = el.dataset.prefix || "";
    const suf = el.dataset.suffix || "";
    if (reduce.matches){ el.innerHTML = pre + to + suf; return; }
    const dur = 1100, t0 = performance.now();
    const tick = (now) => {
      const k = clamp((now-t0)/dur, 0, 1);
      el.innerHTML = pre + Math.round(to * sstep(k)) + suf;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!("IntersectionObserver" in window)){ els.forEach(run); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting){ run(e.target); io.unobserve(e.target); }
  }, {threshold:0.6});
  els.forEach(el => io.observe(el));
})();

/* ============================ the story ============================
   One pinned stage, five scenes. Scroll position inside the track gives a
   global 0..1; that maps to a chapter index plus a local 0..1 which each
   scene uses to animate its own parts.
   ================================================================== */
(function story(){
  const track    = $("#storyTrack");
  const stage    = $("#stage");
  if (!track || !stage) return;

  const scenes   = $$(".scene", stage);
  const chapters = $$(".chapter");
  const railItems= $$("#storyRail li");
  const railBtns = $$("#storyRail button");
  const N = scenes.length;

  /* scene 1 */
  const cowHead = $("#cow1 .cow-head");
  const cowTail = $("#cow1 .cow-tail");
  const clouds  = $$("#sc1 .cloud");
  const pars    = $$("#sc1 .par");
  /* scene 2 */
  const milkFill= $("#milkFill");
  const drop1   = $("#drop1");
  const drop2   = $("#drop2");
  const stream  = $("#stream");
  /* scene 3 */
  const route   = $("#route");
  const plane   = $("#plane");
  const routeLen= route ? route.getTotalLength() : 0;
  /* scene 4 */
  const dropFall= $("#dropFall");
  const splash  = $("#splash");
  const fruits  = [$("#fr1"), $("#fr2"), $("#fr3")];
  /* scene 5 */
  const formFruits   = $("#formFruits");
  const formBar      = $("#formBar");
  const formSiblings = $("#formSiblings");

  if (route) route.style.strokeDasharray = `${routeLen}`;

  let current = -1;
  function setChapter(i){
    if (i === current) return;
    current = i;
    scenes.forEach((s,k) => s.classList.toggle("is-on", k === i));
    chapters.forEach((c,k) => c.classList.toggle("is-on", k === i));
    railItems.forEach((r,k) => r.classList.toggle("is-on", k === i));
  }

  /* per-scene animation, p is 0..1 within that chapter */
  function animate(i, p){
    if (i === 0){
      const graze = Math.sin(p*Math.PI);                 /* dips and lifts once */
      if (cowHead) cowHead.setAttribute("transform", `translate(0 ${(graze*15).toFixed(1)}) rotate(${(graze*7).toFixed(1)} 140 44)`);
      if (cowTail) cowTail.setAttribute("transform", `rotate(${Math.sin(p*Math.PI*4)*9} 20 34)`);
      clouds.forEach(c => {
        const sp = parseFloat(c.dataset.speed) || 1;
        c.setAttribute("transform", `translate(${p*70*sp} 0)`);
      });
      pars.forEach(el => {
        const d = parseFloat(el.dataset.depth) || 0;
        el.setAttribute("transform", `translate(0 ${-p*d})`);
      });
    }
    else if (i === 1){
      const fill = span(p, 0.05, 0.92);
      if (milkFill){
        const h = fill * 78;
        milkFill.setAttribute("height", h.toFixed(1));
        milkFill.setAttribute("y", (448 - h).toFixed(1));
      }
      /* two drops on staggered loops between udder and pail */
      const f1 = (p*4) % 1, f2 = ((p*4)+0.5) % 1;
      if (drop1){ drop1.setAttribute("cy", lerp(342, 372, f1*f1).toFixed(1));
                  drop1.setAttribute("opacity", (1 - f1*0.5).toFixed(2)); }
      if (drop2){ drop2.setAttribute("cy", lerp(346, 374, f2*f2).toFixed(1));
                  drop2.setAttribute("opacity", (1 - f2*0.5).toFixed(2)); }
      if (stream) stream.setAttribute("opacity", (0.55 + Math.sin(p*Math.PI*8)*0.2).toFixed(2));
    }
    else if (i === 2){
      const f = span(p, 0.04, 0.95);
      if (route) route.style.strokeDashoffset = `${routeLen*(1-f)}`;
      if (plane && routeLen){
        const at = route.getPointAtLength(routeLen * f);
        const ahead = route.getPointAtLength(Math.min(routeLen, routeLen*f + 2));
        const ang = Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180/Math.PI;
        plane.setAttribute("transform", `translate(${at.x.toFixed(1)} ${at.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
        plane.setAttribute("opacity", f > 0.002 ? "1" : "0");
      }
    }
    else if (i === 3){
      const LAND = 0.42;
      const fall = span(p, 0.02, LAND);
      const after= span(p, LAND, 1);
      if (dropFall){
        const y = lerp(0, 300, fall*fall);
        dropFall.setAttribute("transform", `translate(0 ${y.toFixed(1)}) scale(1 ${(1+fall*0.5).toFixed(2)})`);
        dropFall.setAttribute("opacity", fall < 0.99 ? "1" : "0");
      }
      if (splash){
        splash.setAttribute("opacity", (after>0 ? (1-after)*0.95 : 0).toFixed(2));
        splash.setAttribute("transform", `translate(320 384) scale(${(0.3+after*1.25).toFixed(2)}) translate(-320 -384)`);
      }
      fruits.forEach((g,k) => {
        if (!g) return;
        const rise = span(p, 0.04 + k*0.07, 0.40 + k*0.07);
        const kick = after>0 ? Math.sin(after*Math.PI*3 + k)*Math.exp(-after*3)*10 : 0;
        g.setAttribute("transform", `translate(0 ${((1-rise)*60 - kick).toFixed(1)})`);
        g.setAttribute("opacity", rise.toFixed(2));
      });
    }
    else if (i === 4){
      const pull  = span(p, 0.00, 0.34);
      const rise  = span(p, 0.20, 0.62);
      const flank = span(p, 0.44, 0.78);
      if (formFruits){
        formFruits.setAttribute("transform",
          `translate(320 340) scale(${(1-pull).toFixed(3)}) translate(-320 -340)`);
        formFruits.setAttribute("opacity", (1-pull).toFixed(2));
      }
      if (formBar){
        const k = rise < 1 ? rise*(1 + 0.14*(1-rise)) : 1;
        formBar.setAttribute("transform",
          `translate(320 348) scale(${k.toFixed(3)}) translate(-320 -348)`);
        formBar.setAttribute("opacity", rise > 0.01 ? "1" : "0");
      }
      if (formSiblings){
        formSiblings.setAttribute("transform",
          `translate(320 404) scale(${flank.toFixed(3)}) translate(-320 -404)`);
        formSiblings.setAttribute("opacity", flank.toFixed(2));
      }
    }
  }

  function read(){
    const r = track.getBoundingClientRect();
    const total = Math.max(1, r.height - innerHeight);
    const g = clamp(-r.top / total, 0, 1);            /* 0..1 across the whole story */
    const scaled = g * N;
    const i = clamp(Math.floor(scaled), 0, N-1);
    const p = reduce.matches ? 0.5 : clamp(scaled - i, 0, 1);
    setChapter(i);
    animate(i, p);
  }
  onScroll(read);

  /* the rail jumps to a chapter */
  railBtns.forEach((b) => b.addEventListener("click", () => {
    const i = parseInt(b.dataset.go, 10);
    const top = track.offsetTop + (track.offsetHeight - innerHeight) * ((i + 0.5)/N);
    window.scrollTo({top, behavior: reduce.matches ? "auto" : "smooth"});
  }));

  setChapter(0);
  read();
})();

/* ============================ mood switcher ============================ */
(function moods(){
  const tabs = $$(".mood-tabs button");
  if (!tabs.length) return;

  const MOODS = [
    { name:"Blueberry",  kicker:"01 · Fresh reset",     hex:"#3D4FC4", edge:"#2F3C9C", soft:"#E9EBFB",
      feel:"Bright & awake", when:"Mornings",
      desc:"A bright, juicy mood for energetic mornings — the one to reach for when you want the day to start properly." },
    { name:"Goji Berry", kicker:"02 · Warm glow",       hex:"#D9622F", edge:"#A8420F", soft:"#FBE9DF",
      feel:"Warm & grounding", when:"Slow evenings",
      desc:"A warm, grounding mood for slow evenings — softer and rounder, for when the day needs closing down gently." },
    { name:"Acai Berry", kicker:"03 · Deep indulgence", hex:"#7E2856", edge:"#631F43", soft:"#F7E5EF",
      feel:"Rich & indulgent", when:"A proper reset",
      desc:"A rich, indulgent mood for a proper reset — the deepest of the three, for baths you actually make time for." }
  ];

  const bar    = $("#moodBar");
  const edge   = $("#moodEdge");
  const bits   = $("#moodBits");
  const name   = $("#moodName");
  const kicker = $("#moodKicker");
  const desc   = $("#moodDesc");
  const feel   = $("#moodFeel");
  const when   = $("#moodWhen");
  const cta    = $("#moodCta");
  const root   = document.documentElement;

  function apply(i){
    const m = MOODS[i];
    tabs.forEach((t,k) => {
      const on = k === i;
      t.classList.toggle("is-on", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    root.style.setProperty("--accent", m.hex);
    root.style.setProperty("--accent-soft", m.soft);
    if (bar) bar.setAttribute("fill", m.hex);
    if (edge) edge.setAttribute("fill", m.edge);
    if (name) name.textContent = m.name;
    if (kicker) kicker.textContent = m.kicker;
    if (desc) desc.textContent = m.desc;
    if (feel) feel.textContent = m.feel;
    if (when) when.textContent = m.when;
    if (cta) cta.textContent = `Get the ${m.name} trial`;

    /* a few accent dots around the bar, redrawn per mood */
    if (bits){
      bits.innerHTML = "";
      const spots = [[52,96,13],[268,110,11],[42,232,9],[280,224,12],[160,74,8]];
      spots.forEach(([cx,cy,r], k) => {
        const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
        c.setAttribute("cx",cx); c.setAttribute("cy",cy); c.setAttribute("r",r);
        c.setAttribute("fill", m.hex);
        c.setAttribute("opacity", k%2 ? ".28" : ".45");
        bits.appendChild(c);
      });
    }
  }

  tabs.forEach((t,i) => t.addEventListener("click", () => apply(i)));
  apply(0);
})();

pump();
})();
