/* =====================================================================
   Discover Tiama — a scrolling story
   One fixed canvas renders every scene; editorial plates scroll over it.
   No libraries: the 3D is a small software renderer drawing flat-shaded
   quads with canvas 2D.

   Every scene is rebuilt each frame as a function of (p, t) — p being how
   far you have scrolled through that chapter, t elapsed seconds — so the
   story actually plays: the cow is milked, the plane crosses, the milk
   falls, the bar forms.
   ===================================================================== */
(() => {
"use strict";

/* ============================ palette ============================ */
const C = {
  milk:   [252,249,243], cream:  [242,233,218],
  hide:   [246,241,232], hideDk:[214,205,192], spot:[ 58, 48, 52],
  muzzle: [228,198,192], horn:  [214,196,168], hoof:[ 74, 62, 64],
  wood:   [196,158,110], woodDk:[150,114, 74], steel:[176,180,188],
  steelDk:[112,118,132], pail:  [168,176,188],
  grass:  [122,152, 98], grassDk:[ 86,116, 70], sand:[224,198,158],
  blue:   [ 72, 92, 196], goji:  [226,110, 58], acai:[140, 44, 96],
  leaf:   [ 94,132, 76], leafLt:[128,166, 98],
  ink:    [ 44, 30, 44], glass: [216,226,232]
};
const mix = (a,b,t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
const rgb = c => "rgb(" + (c[0]|0) + "," + (c[1]|0) + "," + (c[2]|0) + ")";
const clamp = (v,a,b) => v<a?a:v>b?b:v;
const sstep = t => { t = clamp(t,0,1); return t*t*(3-2*t); };
/* remap x from [a,b] into 0..1, smoothed — the workhorse for timing beats */
const span = (x,a,b) => sstep((x-a)/Math.max(1e-6,b-a));
const lerp = (a,b,t) => a+(b-a)*t;

/* ============ the journey's light: cold north → warm close ============ */
const ARC = [
  {t:0.00, bg:[250,245,235], key:[255,252,244], sh:[162,146,150]},
  {t:0.15, bg:[228,236,244], key:[255,253,250], sh:[148,158,172]},
  {t:0.31, bg:[234,241,237], key:[255,253,246], sh:[144,158,152]},
  {t:0.46, bg:[212,230,244], key:[255,254,252], sh:[136,156,176]},
  {t:0.60, bg:[249,234,212], key:[255,244,220], sh:[164,140,124]},
  {t:0.73, bg:[243,221,226], key:[255,236,232], sh:[158,124,140]},
  {t:0.87, bg:[250,242,232], key:[255,250,242], sh:[158,142,140]},
  {t:1.00, bg:[ 58, 40, 58], key:[228,176,196], sh:[ 48, 36, 50]}
];
function lightAt(p){
  let i = 0;
  while (i < ARC.length - 2 && p > ARC[i+1].t) i++;
  const a = ARC[i], b = ARC[i+1];
  const t = sstep((p - a.t) / Math.max(1e-6, b.t - a.t));
  return {bg:mix(a.bg,b.bg,t), key:mix(a.key,b.key,t), sh:mix(a.sh,b.sh,t)};
}

/* ============================ mesh building ============================ */
function mesh(){ return {v:[], f:[]}; }
function vtx(m,x,y,z){ m.v.push(x,y,z); return (m.v.length/3)-1; }
const QUADS = [[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]];

function box(m, cx,cy,cz, w,h,d, col, opt){
  const x0=cx-w/2, x1=cx+w/2, y0=cy-h/2, y1=cy+h/2, z0=cz-d/2, z1=cz+d/2;
  const b = m.v.length/3;
  vtx(m,x0,y0,z1); vtx(m,x1,y0,z1); vtx(m,x1,y1,z1); vtx(m,x0,y1,z1);
  vtx(m,x0,y0,z0); vtx(m,x1,y0,z0); vtx(m,x1,y1,z0); vtx(m,x0,y1,z0);
  for (const f of QUADS) m.f.push({i:[b+f[0],b+f[1],b+f[2],b+f[3]], c:col, o:opt});
  return m;
}
/* box rotated about Y — angled legs, wings */
function boxY(m, cx,cy,cz, w,h,d, ang, col, opt){
  const s=Math.sin(ang), c=Math.cos(ang), b=m.v.length/3;
  const pts=[[-w/2,-h/2, d/2],[ w/2,-h/2, d/2],[ w/2, h/2, d/2],[-w/2, h/2, d/2],
             [-w/2,-h/2,-d/2],[ w/2,-h/2,-d/2],[ w/2, h/2,-d/2],[-w/2, h/2,-d/2]];
  for (const p of pts) vtx(m, cx + p[0]*c + p[2]*s, cy + p[1], cz - p[0]*s + p[2]*c);
  for (const f of QUADS) m.f.push({i:[b+f[0],b+f[1],b+f[2],b+f[3]], c:col, o:opt});
  return m;
}
/* box rotated about Z — a lowered head, a tilted fin */
function boxZ(m, cx,cy,cz, w,h,d, ang, col, opt){
  const s=Math.sin(ang), c=Math.cos(ang), b=m.v.length/3;
  const pts=[[-w/2,-h/2, d/2],[ w/2,-h/2, d/2],[ w/2, h/2, d/2],[-w/2, h/2, d/2],
             [-w/2,-h/2,-d/2],[ w/2,-h/2,-d/2],[ w/2, h/2,-d/2],[-w/2, h/2,-d/2]];
  for (const p of pts) vtx(m, cx + p[0]*c - p[1]*s, cy + p[0]*s + p[1]*c, cz + p[2]);
  for (const f of QUADS) m.f.push({i:[b+f[0],b+f[1],b+f[2],b+f[3]], c:col, o:opt});
  return m;
}
function cyl(m, cx,cy,cz, r1,r2,len, seg, col, opt, axis){
  axis = axis || "y";
  const b = m.v.length/3, h0 = -len/2, h1 = len/2;
  const put = (ang, r, h) => {
    const u = Math.cos(ang)*r, w = Math.sin(ang)*r;
    if (axis === "y")      vtx(m, cx+u, cy+h, cz+w);
    else if (axis === "x") vtx(m, cx+h, cy+u, cz+w);
    else                   vtx(m, cx+u, cy+w, cz+h);
  };
  for (let i=0;i<seg;i++) put(i/seg*Math.PI*2, r1, h0);
  for (let i=0;i<seg;i++) put(i/seg*Math.PI*2, r2, h1);
  const side = Object.assign({smooth:1}, opt);
  for (let i=0;i<seg;i++){
    const j=(i+1)%seg;
    m.f.push({i:[b+i, b+j, b+seg+j, b+seg+i], c:col, o:side});
  }
  /* open:1 leaves the ends off — needed for anything you look into, like the
     milking basin, whose top cap would otherwise hide the milk inside it */
  if (!(opt && opt.open)){
    const top=[], bot=[];
    for (let i=0;i<seg;i++){ top.push(b+seg+i); bot.push(b+seg-1-i); }
    m.f.push({i:top, c:col, o:opt});
    m.f.push({i:bot, c:col, o:opt});
  }
  return m;
}
function ball(m, cx,cy,cz, r, seg, rings, col, opt){
  const b = m.v.length/3;
  opt = Object.assign({smooth:1}, opt);
  for (let j=0;j<=rings;j++){
    const phi = j/rings*Math.PI;
    const y = Math.cos(phi)*r, rr = Math.sin(phi)*r;
    for (let i=0;i<seg;i++){
      const a = i/seg*Math.PI*2;
      vtx(m, cx+Math.cos(a)*rr, cy+y, cz+Math.sin(a)*rr);
    }
  }
  for (let j=0;j<rings;j++){
    for (let i=0;i<seg;i++){
      const i2=(i+1)%seg;
      m.f.push({i:[b+j*seg+i, b+j*seg+i2, b+(j+1)*seg+i2, b+(j+1)*seg+i], c:col, o:opt});
    }
  }
  return m;
}
/* THE TIAMA BAR — elliptical in plan, pillowed in profile */
function oval(m, cx,cy,cz, rx,rz,h, seg, rings, col, opt){
  const b = m.v.length/3;
  opt = Object.assign({smooth:1}, opt);
  const prof = k => Math.pow(Math.max(0, 1 - Math.pow(Math.abs(k), 3.4)), 0.34);
  for (let j=0;j<rings;j++){
    const k = -1 + 2*(j+0.5)/rings;
    const s = prof(k), y = cy + k*h/2;
    for (let i=0;i<seg;i++){
      const a = i/seg*Math.PI*2;
      vtx(m, cx + Math.cos(a)*rx*s, y, cz + Math.sin(a)*rz*s);
    }
  }
  for (let j=0;j<rings-1;j++){
    for (let i=0;i<seg;i++){
      const i2=(i+1)%seg;
      m.f.push({i:[b+j*seg+i, b+j*seg+i2, b+(j+1)*seg+i2, b+(j+1)*seg+i], c:col, o:opt});
    }
  }
  const top=[], bot=[];
  for (let i=0;i<seg;i++){ top.push(b+(rings-1)*seg+i); bot.push(b+seg-1-i); }
  m.f.push({i:top, c:col, o:opt});
  m.f.push({i:bot, c:col, o:opt});
  return m;
}
/* a Tiama bar with its debossed plate, at any scale */
function tiamaBar(m, x,y,z, k, col){
  if (k <= 0.001) return m;
  oval(m, x, y+30*k, z, 78*k, 48*k, 44*k, 20, 6, col);
  oval(m, x, y+52*k, z, 46*k, 27*k,  7*k, 18, 4, mix(col, C.milk, 0.36));
  oval(m, x, y+55*k, z, 30*k, 16*k,  4*k, 16, 3, col);
  return m;
}
function foliage(m, cx,cy,cz, r, n, col){
  for (let i=0;i<n;i++){
    const a = i/n*Math.PI*2 + 0.4;
    const lean = 0.55 + (i%3)*0.18;
    const len = r*(0.85 + (i%4)*0.12);
    boxY(m, cx+Math.cos(a)*r*0.34, cy + len*0.42*lean, cz+Math.sin(a)*r*0.34,
         r*0.44, len*lean, 2.2, -a, i%2 ? col : mix(col,C.leafLt,0.45));
  }
  return m;
}
/* rotate a point about a pivot in the XY plane — used to swing the cow's head */
function rotXY(x,y, ox,oy, a){
  const dx=x-ox, dy=y-oy, c=Math.cos(a), s=Math.sin(a);
  return [ox + dx*c - dy*s, oy + dx*s + dy*c];
}

/* ============================ the cow ============================ */
/* graze: 0 head up, 1 head down in the grass.  sway: tail swing, radians. */
function addCow(m, ox, o){
  o = o || {};
  const graze = o.graze || 0, sway = o.sway || 0;
  /* body */
  box(m, ox+0, 96, 0, 128, 74, 62, C.hide);
  box(m, ox+0, 128, 0, 120, 22, 58, C.hideDk);
  box(m, ox-26, 122, 32, 40, 30, 3, C.spot);
  box(m, ox+30, 104, 32, 26, 24, 3, C.spot);
  box(m, ox-14, 100, -32, 34, 28, 3, C.spot);
  box(m, ox+40, 132, 0, 26, 16, 62, C.spot);
  /* legs */
  for (const lx of [-46, 40]) for (const lz of [-20, 20]){
    box(m, ox+lx, 32, lz, 17, 64, 17, C.hide);
    box(m, ox+lx, 6, lz, 19, 14, 19, C.hoof);
  }
  /* head, swung about the shoulder so it can reach the grass */
  const px = ox+62, py = 128, a = -graze*0.72;
  const P = (x,y) => rotXY(ox+x, y, px, py, a);
  let q;
  q = P(76, 124);  boxZ(m, q[0], q[1], 0, 44, 40, 44, 0.34 + a, C.hide);
  q = P(104, 142); boxZ(m, q[0], q[1], 0, 46, 40, 42, a, C.hide);
  q = P(126, 127); boxZ(m, q[0], q[1], 0, 22, 21, 29, a, C.muzzle);
  q = P(122, 152); boxZ(m, q[0], q[1], 0, 18, 12, 30, a, C.spot);
  for (const ez of [-15, 15]){ q = P(116, 148); boxZ(m, q[0], q[1], ez, 8, 9, 8, a, C.ink); }
  for (const ez of [-24, 24]){ q = P(98, 158);  boxY(m, q[0], q[1], ez, 24, 10, 12, ez>0?0.5:-0.5, C.hideDk); }
  for (const ez of [-13, 13]){ q = P(104, 170); cyl(m, q[0], q[1], ez, 5, 2, 20, 8, C.horn); }
  /* tail */
  boxZ(m, ox-68, 108, 0, 10, 70, 10, 0.2 + sway, C.hide);
  const t = rotXY(ox-76, 70, ox-68, 138, sway);
  box(m, t[0], t[1], 0, 12, 20, 12, C.spot);
  return m;
}

/* ============================ the scenes ============================ */
const SCENES = {

  /* 00 — the bar itself, turning slowly under its own steam */
  bar: {
    spin:{bias:-0.62, span:4.2},
    build(p, t){
      const m = mesh();
      const bob = Math.sin(t*1.1)*5;
      tiamaBar(m, 0, bob, 0, 1, C.blue);
      return m;
    }
  },

  /* 01 — the pasture. The cow grazes: head down, chews, head up. */
  cow: {
    spin:{bias:-0.62, span:4.2},
    build(p, t){
      const m = mesh();
      /* starts at 0 so the frozen reduced-motion pose is head-up, not mid-graze */
      const cycle = (1 - Math.cos(t*0.5)) / 2;
      addCow(m, 0, { graze: sstep(cycle), sway: Math.sin(t*1.6)*0.22 });
      cyl(m, 0, 2, 0, 168, 176, 8, 26, C.grass, {ground:1});
      for (const g of [[-118,40],[126,-54],[-92,-96],[104,86]]){
        cyl(m, g[0], 12, g[1], 13, 9, 18, 10, C.grassDk);
        foliage(m, g[0], 22, g[1], 20, 5, C.leaf);
      }
      return m;
    }
  },

  /* 02 — the milking. Drops fall from the udder and the pail fills as
     you scroll: p drives the milk level, t drives the falling drops. */
  milking: {
    spin:{bias:-0.45, span:0.9},
    build(p, t){
      const m = mesh();
      addCow(m, 44, { sway: Math.sin(t*1.4)*0.16 });
      /* udder under the belly (belly sits at y≈59, so it hangs 59 → 40) */
      const ud = mix(C.hide, C.muzzle, 0.5);
      box(m, 14, 54, -4, 34, 24, 30, ud);
      for (const tx of [6, 22]) cyl(m, tx, 44, -10, 4, 3, 12, 8, ud);

      /* A wide, shallow milking basin, pulled toward the camera and set low
         so there is real clearance under the udder for the milk to fall. */
      const px = -8, pz = -104;
      cyl(m, px, 3, pz, 52, 52, 6, 24, C.pail);                 /* floor */
      cyl(m, px, 14, pz, 52, 60, 24, 24, C.pail, {open:1});     /* wall, open */
      cyl(m, px, 27, pz, 60, 60, 4, 24, C.steelDk, {open:1});   /* rim band */
      /* milk fills as the chapter scrolls, its surface rising in the basin */
      const fill = span(p, 0.06, 0.9);
      if (fill > 0.01){
        const h = 4 + fill*17;
        cyl(m, px, 5 + h/2, pz, 51, 55, h, 24, C.milk, {glow:1});
      }
      /* drops on a loop, falling from the teats down into the basin */
      for (let i=0;i<4;i++){
        const f = ((t*0.8 + i/4) % 1);
        const dx = lerp(14, px, f);
        const dz = lerp(-10, pz, f);
        const dy = lerp(40, 26, f*f);                    /* accelerating */
        box(m, dx, dy, dz, 7, 11*(1+f*0.6), 7, C.milk, {glow:1});
      }
      /* stool, off to the side */
      cyl(m, -182, 36, 30, 32, 30, 8, 14, C.wood);
      for (let i=0;i<3;i++){
        const a = i/3*Math.PI*2 + 0.4;
        boxY(m, -182+Math.cos(a)*20, 17, 30+Math.sin(a)*20, 6, 36, 6, -a+0.3, C.woodDk);
      }
      cyl(m, 0, 2, 0, 206, 214, 8, 26, C.grass, {ground:1});
      return m;
    }
  },

  /* 03 — the crossing. The plane actually flies: p carries it from the
     northern coast to the Indian one, arcing up and back down. */
  plane: {
    spin:{bias:-0.30, span:0.5},
    noShadow: true,
    build(p, t){
      const m = mesh();
      /* the two coasts */
      cyl(m, -190, 6, -40, 54, 48, 10, 16, C.grassDk, {ground:1});
      cyl(m,  190, 6,  40, 58, 52, 10, 16, C.sand,    {ground:1});

      const f = span(p, 0.06, 0.94);
      const x = lerp(-190, 190, f);
      const z = lerp(-40, 40, f);
      const y = 120 + Math.sin(f*Math.PI)*150;

      /* the trail it has already flown */
      for (let i=0;i<16;i++){
        const g = i/16;
        if (g >= f) break;
        const tx = lerp(-190, 190, g), tz = lerp(-40, 40, g);
        const ty = 120 + Math.sin(g*Math.PI)*150;
        box(m, tx, ty, tz, 9, 4, 4, mix(C.goji, C.milk, 0.35));
      }

      /* climbing then descending, and rocking gently */
      const climb = Math.cos(f*Math.PI)*0.30;
      const roll = Math.sin(t*1.3)*0.05;
      const B = (ax,ay,az, w,h,d, col, o) => {
        const q = rotXY(x+ax, y+ay, x, y, climb);
        box(m, q[0], q[1], z+az, w, h, d, col, o);
      };
      /* fuselage */
      cyl(m, x, y, z, 26, 26, 150, 18, C.milk, null, "x");
      cyl(m, x+92, y+92*Math.tan(climb)*0.2, z, 26, 6, 34, 18, C.milk, null, "x");
      cyl(m, x-82, y, z, 26, 14, 18, 18, C.milk, null, "x");
      for (let i=-3;i<=3;i++) B(i*18, 8, 26, 8, 8, 3, C.glass, {glow:1});
      B(-6, -10, 25, 150, 10, 3, C.goji);
      /* wings, engines, tail */
      boxY(m, x+8, y-8,  z+74, 56, 7, 124, 0.16 + roll, C.steel);
      boxY(m, x+8, y-8,  z-74, 56, 7, 124, -0.16 - roll, C.steel);
      cyl(m, x+24, y-24,  z+68, 14, 12, 46, 12, C.steelDk, null, "x");
      cyl(m, x+24, y-24,  z-68, 14, 12, 46, 12, C.steelDk, null, "x");
      boxY(m, x-74, y+8,  z+36, 34, 6, 58, 0.20, C.steel);
      boxY(m, x-74, y+8,  z-36, 34, 6, 58, -0.20, C.steel);
      boxZ(m, x-80, y+42, z, 48, 58, 8, 0.44, C.goji);
      return m;
    }
  },

  /* 04 — the three moods. A drop of milk falls and lands among the three
     fruits that give each bar its name, and the splash rings out. */
  blend: {
    spin:{bias:-0.5, span:1.2},
    build(p, t){
      const m = mesh();
      const LAND = 0.60;
      const fall = span(p, 0.02, LAND);
      const after = span(p, LAND, 1.0);

      /* the three fruits, named on the bars — a bounce when the drop lands */
      const fruits = [
        [  0, 46,  30, 44, C.blue],
        [ 84, 40, -34, 38, C.goji],
        [-84, 38, -40, 36, C.acai]
      ];
      for (let i=0;i<fruits.length;i++){
        const [fx, fy, fz, fr, col] = fruits[i];
        const kick = after > 0 ? Math.sin(after*Math.PI*3 + i)*Math.exp(-after*3)*18 : 0;
        ball(m, fx, fy + kick, fz, fr, 14, 7, col);
      }
      foliage(m,   0, 82,  30, 26, 4, C.leaf);
      foliage(m,  84, 70, -34, 22, 4, C.leafLt);

      /* the falling drop */
      if (fall < 1){
        const dy = lerp(196, 76, fall*fall);            /* accelerating */
        const st = 1 + fall*0.9;
        box(m, 0, dy, 30, 18, 30*st, 18, C.milk, {glow:1});
      }
      /* the splash: a ring that widens and thins */
      if (after > 0.01){
        const r = 40 + after*104;
        cyl(m, 0, 14 + (1-after)*16, 30, r, r*0.86, 6*(1-after)+1, 20,
            C.milk, {glow:1, open:1});
      }
      cyl(m, 0, 3, 0, 152, 158, 6, 26, C.cream, {ground:1});
      return m;
    }
  },

  /* 05 — the bar comes into existence. The fruits draw inward and fold
     away, and the bar rises out of the milk in their place. */
  form: {
    spin:{bias:-0.5, span:2.0},
    build(p, t){
      const m = mesh();
      const pull  = span(p, 0.00, 0.50);   /* fruits spiral in and shrink */
      const rise  = span(p, 0.42, 0.88);   /* the bar grows */
      const flank = span(p, 0.72, 1.00);   /* its two siblings arrive */

      const fruits = [
        [ 150, 0.0, C.blue],
        [ 150, 2.1, C.goji],
        [ 150, 4.2, C.acai]
      ];
      for (const [r0, a0, col] of fruits){
        const r = r0*(1-pull);
        const a = a0 + pull*2.4;
        const k = 1 - pull;
        if (k > 0.03)
          ball(m, Math.cos(a)*r, 34 + pull*26, Math.sin(a)*r, 27*k, 12, 6, col);
      }
      /* a pool of milk they fold into */
      const pool = 60 + pull*40;
      cyl(m, 0, 8, 0, pool, pool*0.94, 12, 22, C.milk, {glow:1});

      /* the bar, with a little overshoot as it settles */
      if (rise > 0.01){
        const k = rise < 1 ? rise*(1 + 0.16*(1-rise)) : 1;
        tiamaBar(m, 0, 6, 0, k, C.goji);
      }
      if (flank > 0.01){
        tiamaBar(m, -172, 4, -26, 0.84*flank, C.blue);
        tiamaBar(m,  172, 4, -26, 0.84*flank, C.acai);
      }
      cyl(m, 0, 3, 0, 212, 220, 6, 28, C.cream, {ground:1});
      return m;
    }
  },

  /* the finished trio, for the pricing chapter */
  bars: {
    spin:{bias:-0.62, span:4.2},
    build(p, t){
      const m = mesh();
      const set = [[-124,-46,C.blue],[124,-46,C.goji],[0,92,C.acai]];
      for (let i=0;i<set.length;i++){
        const [x, z, col] = set[i];
        tiamaBar(m, x, Math.sin(t*1.0 + i*2.1)*4, z, 1, col);
      }
      cyl(m, 0, 3, 0, 208, 216, 6, 28, C.cream, {ground:1});
      return m;
    }
  }
};

/* ---- one stable fit per scene, from the union of bounds across the whole
   animation, so nothing rescales or drifts as the scene plays ---- */
const FIT = {};
for (const k in SCENES){
  const S = SCENES[k];
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
  for (let i=0;i<=8;i++){
    const m = S.build(i/8, i*0.77);
    for (let j=0;j<m.v.length;j+=3){
      x0=Math.min(x0,m.v[j]);   x1=Math.max(x1,m.v[j]);
      y0=Math.min(y0,m.v[j+1]); y1=Math.max(y1,m.v[j+1]);
      z0=Math.min(z0,m.v[j+2]); z1=Math.max(z1,m.v[j+2]);
    }
  }
  const sp = Math.max(x1-x0, z1-z0, (y1-y0)*1.25);
  FIT[k] = {
    cx:(x0+x1)/2, cz:(z0+z1)/2, y0:y0, s:190/sp,
    radius:Math.max(x1-x0, z1-z0)/2*(190/sp),
    height:(y1-y0)*(190/sp),
    spin:S.spin || {bias:-0.62, span:4.2},
    noShadow:!!S.noShadow
  };
}
function applyFit(m, f){
  for (let i=0;i<m.v.length;i+=3){
    m.v[i]   = (m.v[i]-f.cx)*f.s;
    m.v[i+1] = (m.v[i+1]-f.y0)*f.s;
    m.v[i+2] = (m.v[i+2]-f.cz)*f.s;
  }
  return m;
}

/* ============================ renderer ============================ */
const cv = document.getElementById("scene");
const ctx = cv.getContext("2d", {alpha:false});
let W=0, H=0, DPR=1;

function resize(){
  DPR = Math.min(window.devicePixelRatio||1, 2);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
  cv.style.width = W+"px"; cv.style.height = H+"px";
  ctx.setTransform(DPR,0,0,DPR,0,0);
}

const FOCAL = 780;
function drawModel(m, opt){
  const {yaw, pitch, cx, cy, dist, alpha, light} = opt;
  const cyaw=Math.cos(yaw), syaw=Math.sin(yaw);
  const cp=Math.cos(pitch), sp=Math.sin(pitch);
  const n = m.v.length/3;
  const vx=new Float32Array(n), vy=new Float32Array(n), vz=new Float32Array(n);
  const sx=new Float32Array(n), sy=new Float32Array(n);
  for (let i=0;i<n;i++){
    const x0=m.v[i*3], y0=m.v[i*3+1]-m.height*0.46, z0=m.v[i*3+2];
    const x1 =  x0*cyaw + z0*syaw;
    const z1 = -x0*syaw + z0*cyaw;
    const y2 =  y0*cp + z1*sp;
    const z2 = -y0*sp + z1*cp + dist;
    vx[i]=x1; vy[i]=y2; vz[i]=z2;
    const k = FOCAL / Math.max(60, z2);
    sx[i] = cx + x1*k; sy[i] = cy - y2*k;
  }
  const faces = m.f, out = [];
  for (let fi=0; fi<faces.length; fi++){
    const f = faces[fi], idx = f.i;
    let zsum=0;
    for (let j=0;j<idx.length;j++) zsum += vz[idx[j]];
    const a=idx[0], b=idx[1], c=idx[2];
    let nx=(vy[b]-vy[a])*(vz[c]-vz[a])-(vz[b]-vz[a])*(vy[c]-vy[a]);
    let ny=(vz[b]-vz[a])*(vx[c]-vx[a])-(vx[b]-vx[a])*(vz[c]-vz[a]);
    let nz=(vx[b]-vx[a])*(vy[c]-vy[a])-(vy[b]-vy[a])*(vx[c]-vx[a]);
    const len=Math.hypot(nx,ny,nz)||1; nx/=len; ny/=len; nz/=len;
    if (nz > 0){ nx=-nx; ny=-ny; nz=-nz; }
    /* Ground planes are one big flat quad: their averaged depth loses to the
       objects standing on them, so force them to the back of the sort. */
    const depth = (f.o && f.o.ground) ? 1e9 : zsum/idx.length;
    out.push({z:depth, f:f, nx:nx, ny:ny, nz:nz});
  }
  out.sort((p,q) => q.z - p.z);

  const LX=-0.44, LY=0.78, LZ=-0.45;
  ctx.globalAlpha = alpha;
  ctx.lineJoin = "round";
  for (const o of out){
    const f = o.f, idx = f.i;
    const d = clamp(o.nx*LX + o.ny*LY + o.nz*LZ, -1, 1);
    let lum = 0.16 + 0.84*clamp(d*0.5+0.5, 0, 1);
    if (f.o && f.o.glow) lum = Math.min(1, lum + 0.42);
    const lit = mix(mix(f.c, light.sh, 0.58), mix(f.c, light.key, 0.24), lum);
    ctx.fillStyle = rgb(lit);
    /* Curved surfaces still need a stroke — it closes the hairline seams
       canvas leaves between fills — but in the fill colour, so the quad grid
       disappears. Flat-sided pieces keep a darker edge, which is what gives
       them their drawn look. */
    ctx.strokeStyle = (f.o && f.o.smooth) ? ctx.fillStyle : rgb(mix(lit, C.ink, 0.28));
    ctx.beginPath();
    ctx.moveTo(sx[idx[0]], sy[idx[0]]);
    for (let j=1;j<idx.length;j++) ctx.lineTo(sx[idx[j]], sy[idx[j]]);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 0.6; ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function contactShadow(cx, cy, r, alpha, light){
  ctx.save();
  ctx.globalAlpha = alpha*0.5;
  ctx.translate(cx, cy);
  ctx.scale(1, 0.26);
  const g = ctx.createRadialGradient(0,0,r*0.15, 0,0,r);
  const s = light.sh;
  g.addColorStop(0, "rgba("+(s[0]|0)+","+(s[1]|0)+","+(s[2]|0)+",0.85)");
  g.addColorStop(1, "rgba("+(s[0]|0)+","+(s[1]|0)+","+(s[2]|0)+",0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

/* ============================ scroll wiring ============================ */
const stages   = [...document.querySelectorAll(".stage")];
const railNum  = document.getElementById("rail-num");
const railName = document.getElementById("rail-name");
const railBar  = document.getElementById("rail-bar");
const rail     = document.getElementById("rail");
const reduce   = matchMedia("(prefers-reduced-motion: reduce)");

let arcP = 0, active = [];

function readScroll(){
  const vh = window.innerHeight, mid = vh*0.5;
  const doc = Math.max(1, document.documentElement.scrollHeight - vh);
  arcP = clamp(window.scrollY/doc, 0, 1);

  active = [];
  let best = null, bestD = 1e9;
  let pick = null, pickD = 1e9;
  for (const s of stages){
    const r = s.getBoundingClientRect();
    const model = s.dataset.model;
    const d = Math.abs((r.top + r.height/2) - mid);
    if (d < bestD){ bestD = d; best = s; }
    if (!model || model === "none") continue;
    if (d < pickD){ pickD = d; pick = {s:s, r:r}; }
  }
  if (pick){
    const r = pick.r;
    /* p runs 0..1 as the chapter crosses the middle of the screen — this is
       what drives each scene's animation, so the story is scrubbed by scroll */
    const prog = clamp((mid - r.top) / Math.max(1, r.height), 0, 1);
    let vis = sstep(1.6 - (pickD/(vh*0.9))*1.4);
    if (best && best.dataset.model === "none") vis = 0;
    if (vis > 0.01) active.push({
      model: pick.s.dataset.model, prog, vis,
      cyNarrow: parseFloat(pick.s.dataset.cyNarrow) || 0
    });
  }
  if (best){
    railNum.textContent  = best.dataset.num  || "";
    railName.textContent = best.dataset.name || "";
  }
  railBar.style.right = (100 - arcP*100).toFixed(1) + "%";
  rail.style.opacity = arcP < 0.012 ? "0" : "1";
}

function draw(now){
  /* Under reduced motion the scenes hold still: no idle clock, and each one
     sits at the midpoint of its animation rather than playing through. */
  const t = reduce.matches ? 0 : now/1000;
  const light = lightAt(arcP);
  ctx.fillStyle = rgb(light.bg);
  ctx.fillRect(0,0,W,H);

  const narrow = W < 820;
  const cx = narrow ? W*0.5 : W*0.68;
  const dist = narrow ? 580 : 350;
  const baseCy = narrow ? 0.24 : 0.50;

  const poolY = H*baseCy + 60;
  const pool = ctx.createRadialGradient(cx, poolY, 10, cx, poolY, Math.max(W,H)*0.55);
  pool.addColorStop(0, "rgba(255,250,240,0.22)");
  pool.addColorStop(1, "rgba(255,250,240,0)");
  ctx.fillStyle = pool; ctx.fillRect(0,0,W,H);

  for (const a of active){
    const S = SCENES[a.model], f = FIT[a.model];
    if (!S || a.vis < 0.012) continue;
    const cy = H * ((narrow && a.cyNarrow) ? a.cyNarrow : baseCy);
    const p = reduce.matches ? 0.5 : a.prog;
    const m = applyFit(S.build(p, t), f);
    m.height = f.height;
    const yaw   = f.spin.bias + p*f.spin.span;
    const pitch = 0.38 - 0.07*Math.cos(p*Math.PI*2);
    if (!f.noShadow){
      const k = FOCAL/dist;
      contactShadow(cx, cy + f.height*0.46*Math.cos(pitch)*k, f.radius*1.05*k, a.vis, light);
    }
    drawModel(m, {yaw, pitch, cx, cy, dist, alpha:a.vis, light});
  }
}

function frame(now){
  draw(now);
  requestAnimationFrame(frame);
}

/* ============================ flavour plate ============================ */
const FLAVOURS = [
  {n:"Blueberry",  s:"Fresh reset",     c:"#485CC4", d:"A bright, juicy mood for energetic mornings."},
  {n:"Goji Berry", s:"Warm glow",       c:"#E26E3A", d:"A warm, grounding mood for slow evenings."},
  {n:"Acai Berry", s:"Deep indulgence", c:"#8C2C60", d:"A rich, indulgent mood for a proper reset."}
];
const flavEl = document.getElementById("flavours");
if (flavEl){
  for (const f of FLAVOURS){
    const d = document.createElement("div"); d.className = "flav";
    const chip = document.createElement("div"); chip.className = "chip";
    chip.style.background = f.c;
    const b = document.createElement("b"); b.textContent = f.n;
    const s = document.createElement("span"); s.textContent = f.s;
    const p = document.createElement("p"); p.textContent = f.d;
    d.append(chip, b, s, p); flavEl.append(d);
  }
}

addEventListener("resize", () => { resize(); readScroll(); }, {passive:true});
addEventListener("scroll", readScroll, {passive:true});
resize(); readScroll();
requestAnimationFrame(frame);
})();
