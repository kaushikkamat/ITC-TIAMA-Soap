/* =====================================================================
   Discover Tiama — a scrolling story
   A single fixed canvas renders every 3D scene; editorial plates scroll
   over it. No libraries: the 3D is a small software renderer drawing
   flat-shaded quads with canvas 2D.
   ===================================================================== */
(() => {
"use strict";

/* ============================ palette ============================ */
const C = {
  /* milk + dairy */
  milk:   [252,249,243], cream:  [242,233,218], ivory:[248,242,232],
  /* cow */
  hide:   [246,241,232], hideDk:[214,205,192], spot:[ 58, 48, 52],
  muzzle: [228,198,192], horn:  [214,196,168], hoof:[ 74, 62, 64],
  /* wood + metal */
  wood:   [196,158,110], woodDk:[150,114, 74], steel:[176,180,188],
  steelDk:[128,134,146], pail:  [206,210,216],
  /* land + sea */
  grass:  [122,152, 98], grassDk:[ 86,116, 70], soil:[150,120, 86],
  sea:    [ 96,140,164], seaDk: [ 58, 96,124], sand:[224,198,158],
  /* the three flavours */
  blue:   [ 72, 92, 196], blueLt:[126,142,224],
  goji:   [226,110, 58], gojiLt:[244,150, 98],
  acai:   [140, 44, 96], acaiLt:[176, 78,132],
  /* leaf + fruit */
  leaf:   [ 94,132, 76], leafLt:[128,166, 98],
  /* neutrals */
  ink:    [ 44, 30, 44], slate:[ 92, 78, 92], glass:[216,226,232]
};
const mix = (a,b,t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
const rgb = c => "rgb(" + (c[0]|0) + "," + (c[1]|0) + "," + (c[2]|0) + ")";
const clamp = (v,a,b) => v<a?a:v>b?b:v;
const smooth = t => { t = clamp(t,0,1); return t*t*(3-2*t); };

/* ============ the journey's light: Hokkaido dawn → Indian dusk ============ */
const ARC = [
  {t:0.00, bg:[250,245,235], key:[255,252,244], sh:[162,146,150], gnd:[238,228,214]}, /* the brand's own warm light */
  {t:0.15, bg:[228,236,244], key:[255,253,250], sh:[148,158,172], gnd:[212,222,232]}, /* cold north morning */
  {t:0.31, bg:[234,241,237], key:[255,253,246], sh:[144,158,152], gnd:[210,222,208]}, /* pasture light */
  {t:0.46, bg:[212,230,244], key:[255,254,252], sh:[136,156,176], gnd:[196,216,234]}, /* altitude */
  {t:0.60, bg:[249,234,212], key:[255,244,220], sh:[164,140,124], gnd:[232,212,184]}, /* arrival, warm */
  {t:0.73, bg:[243,221,226], key:[255,236,232], sh:[158,124,140], gnd:[228,200,208]}, /* the berry blend */
  {t:0.87, bg:[250,242,232], key:[255,250,242], sh:[158,142,140], gnd:[236,226,214]}, /* the finished bar */
  {t:1.00, bg:[ 58, 40, 58], key:[228,176,196], sh:[ 48, 36, 50], gnd:[ 52, 38, 54]}  /* close, deep plum */
];
function lightAt(p){
  let i = 0;
  while (i < ARC.length - 2 && p > ARC[i+1].t) i++;
  const a = ARC[i], b = ARC[i+1];
  const t = smooth((p - a.t) / Math.max(1e-6, b.t - a.t));
  return {bg:mix(a.bg,b.bg,t), key:mix(a.key,b.key,t), sh:mix(a.sh,b.sh,t), gnd:mix(a.gnd,b.gnd,t)};
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
/* box rotated about Y (angled legs, wings, arms) */
function boxY(m, cx,cy,cz, w,h,d, ang, col, opt){
  const s=Math.sin(ang), c=Math.cos(ang), b=m.v.length/3;
  const pts=[[-w/2,-h/2, d/2],[ w/2,-h/2, d/2],[ w/2, h/2, d/2],[-w/2, h/2, d/2],
             [-w/2,-h/2,-d/2],[ w/2,-h/2,-d/2],[ w/2, h/2,-d/2],[-w/2, h/2,-d/2]];
  for (const p of pts) vtx(m, cx + p[0]*c + p[2]*s, cy + p[1], cz - p[0]*s + p[2]*c);
  for (const f of QUADS) m.f.push({i:[b+f[0],b+f[1],b+f[2],b+f[3]], c:col, o:opt});
  return m;
}
/* box rotated about Z (raised heads, tilted panels) */
function boxZ(m, cx,cy,cz, w,h,d, ang, col, opt){
  const s=Math.sin(ang), c=Math.cos(ang), b=m.v.length/3;
  const pts=[[-w/2,-h/2, d/2],[ w/2,-h/2, d/2],[ w/2, h/2, d/2],[-w/2, h/2, d/2],
             [-w/2,-h/2,-d/2],[ w/2,-h/2,-d/2],[ w/2, h/2,-d/2],[-w/2, h/2,-d/2]];
  for (const p of pts) vtx(m, cx + p[0]*c - p[1]*s, cy + p[0]*s + p[1]*c, cz + p[2]);
  for (const f of QUADS) m.f.push({i:[b+f[0],b+f[1],b+f[2],b+f[3]], c:col, o:opt});
  return m;
}
/* cylinder along any axis; r1 = base radius, r2 = top radius */
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
  const top=[], bot=[];
  for (let i=0;i<seg;i++){ top.push(b+seg+i); bot.push(b+seg-1-i); }
  m.f.push({i:top, c:col, o:opt});
  m.f.push({i:bot, c:col, o:opt});
  return m;
}
/* a low-poly ball — berries, droplets */
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
      const a = b + j*seg + i,  a2 = b + j*seg + i2;
      const c1 = b + (j+1)*seg + i, c2 = b + (j+1)*seg + i2;
      m.f.push({i:[a, a2, c2, c1], c:col, o:opt});
    }
  }
  return m;
}
/* THE TIAMA BAR — an oval lozenge: elliptical in plan, pillowed in profile */
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
/* leaf cluster for berry sprigs */
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

/* ============================ the scenes ============================ */
/* A cow, built once and reused by the pasture and the milking scene. */
function addCow(m, ox, flip){
  const s = flip ? -1 : 1;
  /* body */
  box(m, ox+0, 96, 0, 128, 74, 62, C.hide);
  box(m, ox+0, 128, 0, 120, 22, 58, C.hideDk);                 /* back shading band */
  /* spots — thin plates proud of the hide */
  box(m, ox-26, 122, 32, 40, 30, 3, C.spot);
  box(m, ox+30, 104, 32, 26, 24, 3, C.spot);
  box(m, ox-14, 100, -32, 34, 28, 3, C.spot);
  box(m, ox+40, 132, 0, 26, 16, 62, C.spot);
  /* legs */
  for (const lx of [-46, 40]) for (const lz of [-20, 20]){
    box(m, ox+lx, 32, lz, 17, 64, 17, C.hide);
    box(m, ox+lx, 6, lz, 19, 14, 19, C.hoof);
  }
  /* No udder — at this scale it just muddies the silhouette, and the pail in
     chapter 02 is what actually says "dairy". */
  /* neck + head */
  boxZ(m, ox+s*76, 124, 0, 44, 40, 44, s*0.34, C.hide);
  box(m, ox+s*104, 142, 0, 46, 40, 42, C.hide);                /* skull */
  box(m, ox+s*126, 127, 0, 22, 21, 29, C.muzzle);              /* muzzle */
  box(m, ox+s*122, 152, 0, 18, 12, 30, C.spot);                /* brow patch */
  /* eyes */
  for (const ez of [-15, 15]) box(m, ox+s*116, 148, ez, 8, 9, 8, C.ink);
  /* ears */
  for (const ez of [-24, 24]) boxY(m, ox+s*98, 158, ez, 24, 10, 12, ez>0?0.5:-0.5, C.hideDk);
  /* horns */
  for (const ez of [-13, 13]) cyl(m, ox+s*104, 170, ez, 5, 2, 20, 8, C.horn);
  /* tail */
  boxZ(m, ox-s*68, 108, 0, 10, 70, 10, s*0.2, C.hide);
  box(m, ox-s*76, 70, 0, 12, 20, 12, C.spot);
  return m;
}

const MODELS = {
  /* 00 — the bar itself, the thing the whole story is about */
  bar(){
    const m = mesh();
    oval(m, 0, 30, 0, 86, 54, 46, 30, 9, C.blue);
    oval(m, 0, 54, 0, 52, 30, 7, 26, 4, C.blueLt);   /* debossed plate */
    oval(m, 0, 57, 0, 34, 17, 4, 22, 3, C.blue);     /* inner mark */
    return m;
  },
  /* 01 — Hokkaido pasture */
  cow(){
    const m = mesh();
    addCow(m, 0, false);
    /* a little pasture underfoot */
    cyl(m, 0, 2, 0, 168, 176, 8, 26, C.grass, {ground:1});
    for (const g of [[-118,40],[126,-54],[-92,-96],[104,86]]){
      cyl(m, g[0], 12, g[1], 13, 9, 18, 10, C.grassDk);
      foliage(m, g[0], 22, g[1], 20, 5, C.leaf);
    }
    return m;
  },
  /* 02 — the milking. Turns only gently, so the pail never hides behind the cow. */
  milking(){
    const m = mesh();
    addCow(m, 44, false);
    /* The pail sits in front of the cow (negative z is toward the camera here)
       and is drawn large — it is the point of this chapter, not a prop. */
    const px = -92, pz = -96;
    cyl(m, px, 32, pz, 46, 52, 64, 22, C.pail);
    cyl(m, px, 64, pz, 52, 52, 5, 22, C.steelDk);          /* rim */
    cyl(m, px, 54, pz, 47, 47, 22, 22, C.milk, {glow:1});  /* milk, nearly to the brim */
    box(m, px-52, 44, pz, 6, 26, 14, C.steelDk);           /* handle lug */
    /* a few drops still falling in */
    for (let i=0;i<3;i++)
      box(m, px+16-i*4, 96 + i*20, pz+14, 7, 14, 7, C.milk, {glow:1});
    /* the milking stool */
    cyl(m, -176, 36, -6, 32, 30, 8, 14, C.wood);
    for (let i=0;i<3;i++){
      const a = i/3*Math.PI*2 + 0.4;
      boxY(m, -176+Math.cos(a)*20, 17, -6+Math.sin(a)*20, 6, 36, 6, -a+0.3, C.woodDk);
    }
    cyl(m, 0, 2, 0, 206, 214, 8, 26, C.grass, {ground:1});
    m.spin = {bias:-0.45, span:0.9};
    return m;
  },
  /* 03 — the crossing, Japan to India */
  plane(){
    const m = mesh();
    /* fuselage along X */
    cyl(m, 0, 110, 0, 26, 26, 150, 20, C.milk, null, "x");
    cyl(m, 92, 110, 0, 26, 6, 34, 20, C.milk, null, "x");     /* nose cone */
    cyl(m, -82, 110, 0, 26, 14, 18, 20, C.milk, null, "x");   /* tail cone */
    /* windows */
    for (let i=-4;i<=4;i++) box(m, i*15, 118, 26, 8, 8, 3, C.glass, {glow:1});
    /* a brand stripe down the side */
    box(m, -6, 100, 25, 150, 10, 3, C.goji);
    /* wings — short chord, long span, swept back a little */
    boxY(m,  8, 102,  74, 56, 7, 124, 0.16, C.steel);
    boxY(m,  8, 102, -74, 56, 7, 124, -0.16, C.steel);
    /* engines, slung under the wings */
    cyl(m, 24, 86,  68, 14, 12, 46, 14, C.steelDk, null, "x");
    cyl(m, 24, 86, -68, 14, 12, 46, 14, C.steelDk, null, "x");
    /* tailplane + fin */
    boxY(m, -74, 118,  36, 34, 6, 58, 0.20, C.steel);
    boxY(m, -74, 118, -36, 34, 6, 58, -0.20, C.steel);
    boxZ(m, -80, 152, 0, 48, 58, 8, 0.44, C.goji);
    /* the two coasts below, small and far */
    cyl(m,  128, 6, 96, 46, 40, 10, 16, C.grassDk);
    cyl(m, -130, 6, -88, 52, 46, 10, 16, C.sand);
    m.spin = {bias:-0.5, span:2.1};
    return m;
  },
  /* 04 — the blend */
  blend(){
    const m = mesh();
    /* the milk jug */
    cyl(m, -34, 54, 0, 46, 52, 104, 22, C.milk);
    cyl(m, -34, 104, 0, 52, 52, 6, 22, C.cream);
    cyl(m, -34, 98, 0, 46, 46, 8, 22, C.milk, {glow:1});   /* the milk surface */
    /* a strap handle, clear of the jug wall so it reads as a handle */
    box(m, 26, 92, 0, 46, 11, 15, C.cream);
    box(m, 46, 72, 0, 11, 51, 15, C.cream);
    box(m, 26, 52, 0, 46, 11, 15, C.cream);
    /* the three berries, one per flavour */
    ball(m,  62, 40, 34, 30, 14, 8, C.blue);
    ball(m,  96, 34, -26, 26, 14, 8, C.goji);
    ball(m,  50, 32, -44, 24, 14, 8, C.acai);
    foliage(m, 62, 66, 34, 24, 5, C.leaf);
    foliage(m, 96, 56, -26, 20, 4, C.leafLt);
    /* a splash ring on the ground */
    cyl(m, 0, 3, 0, 164, 172, 6, 26, C.cream, {ground:1});
    return m;
  },
  /* 05 — milled, cut and ready: the three bars */
  bars(){
    const m = mesh();
    /* Laid out as a triangle rather than a row — a row lines up with the
       camera once per turn and the bars vanish behind each other. */
    const set = [
      [-124, -46, C.blue],
      [ 124, -46, C.goji],
      [   0,  92, C.acai]
    ];
    for (const [x, z, col] of set){
      oval(m, x, 30, z, 78, 48, 44, 26, 8, col);
      oval(m, x, 52, z, 46, 27, 7, 22, 4, mix(col, C.milk, 0.36));
      oval(m, x, 55, z, 30, 16, 4, 20, 3, col);
    }
    cyl(m, 0, 3, 0, 208, 216, 6, 28, C.cream, {ground:1});
    return m;
  }
};

/* auto-fit: centre on x/z, sit on y=0, scale every model to one size */
const BUILT = {};
for (const k in MODELS){
  const m = MODELS[k]();
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
  for (let i=0;i<m.v.length;i+=3){
    x0=Math.min(x0,m.v[i]);   x1=Math.max(x1,m.v[i]);
    y0=Math.min(y0,m.v[i+1]); y1=Math.max(y1,m.v[i+1]);
    z0=Math.min(z0,m.v[i+2]); z1=Math.max(z1,m.v[i+2]);
  }
  const cx=(x0+x1)/2, cz=(z0+z1)/2;
  const span = Math.max(x1-x0, z1-z0, (y1-y0)*1.25);
  const s = 190/span;
  for (let i=0;i<m.v.length;i+=3){
    m.v[i]   = (m.v[i]-cx)*s;
    m.v[i+1] = (m.v[i+1]-y0)*s;
    m.v[i+2] = (m.v[i+2]-cz)*s;
  }
  m.radius = Math.max(x1-x0, z1-z0)/2*s;
  m.height = (y1-y0)*s;
  m.spin = m.spin || {bias:-0.62, span:4.2};
  BUILT[k] = m;
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
    /* Ground planes are big flat quads: their single averaged depth loses to
       objects standing on them, so the disc would paint over its own contents.
       They sit under everything by definition, so force them to the back. */
    const depth = (f.o && f.o.ground) ? 1e9 : zsum/idx.length;
    out.push({z:depth, f:f, nx:nx, ny:ny, nz:nz});
  }
  out.sort((p,q) => q.z - p.z);

  const LX=-0.44, LY=0.78, LZ=-0.45;
  ctx.globalAlpha = alpha;
  ctx.lineJoin = "round";
  for (const o of out){
    const f = o.f, idx = f.i;
    let d = clamp(o.nx*LX + o.ny*LY + o.nz*LZ, -1, 1);
    let lum = 0.16 + 0.84*clamp(d*0.5+0.5, 0, 1);
    if (f.o && f.o.glow) lum = Math.min(1, lum + 0.42);
    const lit = mix(mix(f.c, light.sh, 0.58), mix(f.c, light.key, 0.24), lum);
    ctx.fillStyle = rgb(lit);
    /* Curved surfaces still need a stroke — it closes the hairline seams canvas
       leaves between adjacent fills — but drawn in the fill colour so the quad
       grid disappears and only the shading describes the form. Flat-sided
       pieces keep a darker edge, which is what gives them their drawn look. */
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

let arcP = 0, active = [], needsDraw = true;

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
    const prog = clamp((mid - r.top) / Math.max(1, r.height), 0, 1);
    let vis = smooth(1.6 - (pickD/(vh*0.9))*1.4);
    if (best && best.dataset.model === "none") vis = 0;   /* text-only plates get the stage to themselves */
    if (vis > 0.01) active.push({
      model: pick.s.dataset.model, prog, vis,
      /* a stage may ask for the scene to sit lower on narrow screens, where
         its copy needs the top of the viewport (the hero does) */
      cyNarrow: parseFloat(pick.s.dataset.cyNarrow) || 0
    });
  }
  if (best){
    railNum.textContent  = best.dataset.num  || "";
    railName.textContent = best.dataset.name || "";
  }
  railBar.style.right = (100 - arcP*100).toFixed(1) + "%";
  rail.style.opacity = arcP < 0.012 ? "0" : "1";
  needsDraw = true;
}

function draw(){
  const light = lightAt(arcP);
  ctx.fillStyle = rgb(light.bg);
  ctx.fillRect(0,0,W,H);

  const narrow = W < 820;
  const cx = narrow ? W*0.5  : W*0.68;
  const dist = narrow ? 580 : 350;
  const baseCy = narrow ? 0.24 : 0.50;

  /* a soft pool of light under the scene */
  const poolY = H*baseCy + 60;
  const pool = ctx.createRadialGradient(cx, poolY, 10, cx, poolY, Math.max(W,H)*0.55);
  pool.addColorStop(0, "rgba(255,250,240,0.22)");
  pool.addColorStop(1, "rgba(255,250,240,0)");
  ctx.fillStyle = pool; ctx.fillRect(0,0,W,H);

  for (const a of active){
    const m = BUILT[a.model];
    if (!m || a.vis < 0.012) continue;
    const cy = H * ((narrow && a.cyNarrow) ? a.cyNarrow : baseCy);
    /* Under prefers-reduced-motion the scenes still draw, but they hold a
       fixed three-quarter angle instead of turning with the scroll. */
    const t = reduce.matches ? 0.5 : a.prog;
    const yaw = m.spin.bias + t*m.spin.span;
    const pitch = 0.38 - 0.07*Math.cos(t*Math.PI*2);
    const k = FOCAL/dist;
    contactShadow(cx, cy + m.height*0.46*Math.cos(pitch)*k, m.radius*1.05*k, a.vis, light);
    drawModel(m, {yaw, pitch, cx, cy, dist, alpha:a.vis, light});
  }
}

function frame(){
  if (needsDraw){ draw(); needsDraw = false; }
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
resize(); readScroll(); draw();
requestAnimationFrame(frame);
})();
