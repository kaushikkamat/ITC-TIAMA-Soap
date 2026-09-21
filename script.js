// ============================================================
// Discover Tiama — interactivity (no framework, no build step)
// ============================================================

/* ---------- Bath mood mixer ---------- */
(function mixer() {
  const range = document.getElementById("mixerRange");
  const readout = document.getElementById("mixerReadout");
  const svg = document.getElementById("mixerSvg");
  if (!range) return;

  const labels = [
    { max: 20, text: "Quick rinse, still nice", color: "#4b56c9" },
    { max: 45, text: "Soft everyday reset", color: "#6d5fc9" },
    { max: 70, text: "Leisurely lather", color: "#a53d78" },
    { max: 101, text: "Full indulgent soak", color: "#ff7a45" },
  ];

  function update() {
    const v = Number(range.value);
    const match = labels.find((l) => v <= l.max);
    readout.textContent = match.text;
    readout.style.color = match.color;
    const r = 50 + v * 0.35;
    svg.innerHTML = `<circle cx="100" cy="100" r="${r}" fill="${match.color}22" /><circle cx="100" cy="100" r="${r * 0.6}" fill="${match.color}44" />`;
  }
  range.addEventListener("input", update);
  update();
})();

/* ---------- Mood tabs ---------- */
(function moodTabs() {
  const tabs = document.querySelectorAll(".mood-tab");
  if (!tabs.length) return;

  const data = {
    blueberry: {
      num: "01",
      name: "BLUEBERRY",
      title: "Fresh reset",
      desc: "A bright, juicy mood for energetic mornings.",
      color: "#4b56c9",
      soft: "#e8e9fb",
    },
    goji: {
      num: "02",
      name: "GOJI BERRY",
      title: "Golden lift",
      desc: "A warm, antioxidant-rich mood for slow, mindful evenings.",
      color: "#ff7a45",
      soft: "#ffe9dd",
    },
    acai: {
      num: "03",
      name: "ACAI BERRY",
      title: "Deep indulgence",
      desc: "A rich, velvety mood for a spa-like wind down.",
      color: "#a53d78",
      soft: "#f6e3ee",
    },
  };

  const eyebrow = document.getElementById("moodEyebrow");
  const title = document.getElementById("moodTitle");
  const desc = document.getElementById("moodDesc");
  const swatch = document.getElementById("moodSwatch");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const d = data[tab.dataset.mood];
      eyebrow.textContent = `${d.num}  ${d.name}  ·  YOUR MOOD`;
      eyebrow.style.color = d.color;
      title.textContent = d.title;
      title.style.color = d.color;
      desc.textContent = d.desc;
      swatch.style.background = d.soft;
    });
  });
})();

/* ---------- Pack picker ---------- */
(function packPicker() {
  const btns = document.querySelectorAll(".picker-btn");
  if (!btns.length) return;

  const data = {
    curious: {
      badge: "BEST FOR TRIAL · FIRST-DATE ENERGY",
      size: "50 g",
      price: "₹49",
      note: "A small commitment with the full Tiama mood. Low entry price · easy first experience.",
    },
    convinced: {
      badge: "FULL SIZE · MADE FOR REPEAT USE",
      size: "125 g",
      price: "₹92",
      note: "The complete Bokkaido milk ritual, sized for everyday use. Better value per gram once you're hooked.",
    },
  };

  const badge = document.getElementById("packBadge");
  const size = document.getElementById("packSize");
  const price = document.getElementById("packPrice");
  const note = document.getElementById("packNote");

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const d = data[btn.dataset.pack];
      badge.textContent = d.badge;
      size.textContent = d.size;
      price.textContent = d.price;
      note.textContent = d.note;
    });
  });
})();

/* ---------- Milk-drop quiz ---------- */
(function quiz() {
  const body = document.getElementById("quizBody");
  const progressEl = document.getElementById("quizProgress");
  if (!body) return;

  const questions = [
    {
      q: "What makes Tiama's ingredient story different?",
      options: [
        { label: "Japanese Bokkaido Milk", correct: true },
        { label: "Mint crystals", correct: false },
        { label: "Sea salt", correct: false },
      ],
      feedback: "Bokkaido Milk is the hero ingredient — rich, gentle, and the first of its kind in an Indian soap bar.",
    },
    {
      q: "What's the low-commitment way to try Tiama?",
      options: [
        { label: "The 50 g bar at ₹49", correct: true },
        { label: "A family pack of 6", correct: false },
        { label: "A yearly subscription", correct: false },
      ],
      feedback: "50 g at ₹49 is the easy first step — full Tiama mood, small commitment.",
    },
    {
      q: "How would you describe the Tiama personality?",
      options: [
        { label: "Strictly clinical", correct: false },
        { label: "Young at heart", correct: false },
        { label: "Loud and overpowering", correct: false },
      ],
      feedback: "\"Young at heart\" — playful, expressive, and premium without taking itself too seriously.",
      // note: correct flag set below to keep object concise
    },
  ];
  questions[2].options[1].correct = true;

  let current = 0;
  let score = 0;

  function renderProgress() {
    progressEl.innerHTML = questions
      .map((_, i) => {
        let cls = "quiz-dot";
        if (i < current) cls += " done";
        else if (i === current) cls += " current";
        return `<div class="${cls}"></div>`;
      })
      .join("");
  }

  function renderQuestion() {
    renderProgress();
    if (current >= questions.length) {
      body.innerHTML = `
        <div class="quiz-done">
          <div class="badge">🏆</div>
          <h3 class="h3">${score}/${questions.length} — now you're a Tiama expert!</h3>
          <p>You know the milk, the mood, and the entry price. Time to ask for Tiama at your neighbourhood retailer.</p>
        </div>`;
      return;
    }

    const item = questions[current];
    const letters = ["A", "B", "C"];
    body.innerHTML = `
      <p class="quiz-q-label">QUESTION ${String(current + 1).padStart(2, "0")}</p>
      <p class="quiz-question">${item.q}</p>
      <div class="quiz-options">
        ${item.options
          .map(
            (opt, i) => `
          <button class="quiz-opt" data-index="${i}">
            <span class="letter">${letters[i]}</span>${opt.label}
          </button>`
          )
          .join("")}
      </div>
      <p class="quiz-feedback" id="quizFeedback"></p>
      <div class="quiz-next" id="quizNextWrap"></div>
    `;

    const optButtons = body.querySelectorAll(".quiz-opt");
    optButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        optButtons.forEach((b) => (b.disabled = true));
        const idx = Number(btn.dataset.index);
        const chosen = item.options[idx];
        optButtons.forEach((b, i) => {
          if (item.options[i].correct) b.classList.add("correct");
          else if (i === idx) b.classList.add("wrong");
        });
        if (chosen.correct) score++;
        document.getElementById("quizFeedback").textContent = item.feedback;
        document.getElementById("quizNextWrap").innerHTML =
          `<button class="btn btn-primary" id="quizNextBtn">${current === questions.length - 1 ? "See my score" : "Next question"}</button>`;
        document.getElementById("quizNextBtn").addEventListener("click", () => {
          current++;
          renderQuestion();
        });
      });
    });
  }

  renderQuestion();
})();

/* ---------- Shared scroll-progress engine ----------
   Computes a 0..1 progress value for how far the user has scrolled through
   a tall "track" element (used to drive both the Milk Journey scrollytelling
   and the 3D product showcase). rAF-throttled so both sections share one
   cheap scroll listener pattern instead of each rolling their own. */
function makeScrollProgress(trackEl, onProgress) {
  let trackTop = 0;
  let trackHeight = 0;
  let viewportHeight = window.innerHeight;
  let ticking = false;

  function measure() {
    const rect = trackEl.getBoundingClientRect();
    trackTop = rect.top + window.scrollY;
    trackHeight = trackEl.offsetHeight;
    viewportHeight = window.innerHeight;
  }

  function computeAndEmit() {
    const scrollable = trackHeight - viewportHeight;
    let progress = scrollable > 0 ? (window.scrollY - trackTop) / scrollable : 0;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
    onProgress(progress);
    ticking = false;
  }

  function onScrollOrResize() {
    if (!ticking) {
      window.requestAnimationFrame(computeAndEmit);
      ticking = true;
    }
  }

  measure();
  computeAndEmit();
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    onScrollOrResize();
  });

  return {
    recalc: () => { measure(); onScrollOrResize(); },
  };
}

const prefersReducedMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Below this width the two-column pin layout collapses to a single stacked
// column (same breakpoint used across this file's other grid sections), and
// stacked stage content is taller than a 100vh pinned viewport can hold.
// Evaluated once at load, matching how prefersReducedMotion is handled —
// simpler than tearing down/rebuilding a pinned scrub or a WebGL scene on
// live resize, and a rotate-triggered reload is an acceptable trade-off.
const isNarrowViewport =
  window.matchMedia && window.matchMedia("(max-width: 860px)").matches;
const useStaticLayout = prefersReducedMotion || isNarrowViewport;

function hasWebGL() {
  try {
    const test = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (test.getContext("webgl") || test.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

/* ============================================================
   Shared 3D model builders
   Colourful, low-poly primitive models built directly from Three.js
   geometry (boxes, spheres, cylinders, an extruded oval) — no external
   asset files, so the whole site stays a framework-free static page.
   Reused by the hero visual, the Milk Journey scrollytelling scene, and
   the product showcase.
   ============================================================ */

const TIAMA_FLAVORS = [
  {
    key: "blueberry",
    label: "01",
    name: "Blueberry",
    desc: "A bright, juicy mood for energetic mornings.",
    hex: 0x4b56c9,
    css: "#4b56c9",
  },
  {
    key: "goji",
    label: "02",
    name: "Goji Berry",
    desc: "A warm, antioxidant-rich mood for slow, mindful evenings.",
    hex: 0xff7a45,
    css: "#ff7a45",
  },
  {
    key: "acai",
    label: "03",
    name: "Acai Berry",
    desc: "A rich, velvety mood for a spa-like wind down.",
    hex: 0xa53d78,
    css: "#a53d78",
  },
];

// An oval / lozenge soap-bar shape: an ellipse extruded with bevelled edges,
// then rotated so it lies flat like a real bar of soap (oval outline visible
// from above, thickness running vertically).
function buildOvalBarGeometry(opts) {
  const o = opts || {};
  const rx = o.rx || 1.05;
  const ry = o.ry || 0.55;
  const depth = o.depth || 0.5;
  const bevel = o.bevel || 0.16;

  const shape = new THREE.Shape();
  shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.9,
    bevelSegments: 8,
    curveSegments: 48,
    steps: 1,
  });
  geo.center();
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function buildLabelTexture(flavor) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = flavor.css;
  ctx.globalAlpha = 0.82;
  ctx.font = "700 82px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("TIAMA", c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// An oval soap bar with a soft embossed "TIAMA" label sitting on top —
// used by the hero visual, the journey's finale beat, and the showcase.
function buildSoapBar(flavor, opts) {
  const o = opts || {};
  const rx = o.rx || 1.05;
  const ry = o.ry || 0.55;
  const depth = o.depth || 0.5;
  const bevel = o.bevel || 0.16;

  const group = new THREE.Group();
  const geo = buildOvalBarGeometry(o);
  const mat = new THREE.MeshStandardMaterial({
    color: flavor.hex,
    roughness: 0.42,
    metalness: 0.04,
  });
  const bar = new THREE.Mesh(geo, mat);
  group.add(bar);

  // A rectangular plane (not an oval ShapeGeometry) — PlaneGeometry has
  // guaranteed, correctly-normalized 0..1 UVs, and the label texture's
  // background is fully transparent, so only the wordmark itself is visible.
  const labelGeo = new THREE.PlaneGeometry(rx * 1.15, ry * 1.15);
  labelGeo.rotateX(-Math.PI / 2);
  const labelMat = new THREE.MeshBasicMaterial({
    map: buildLabelTexture(flavor),
    transparent: true,
    depthWrite: false,
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.y = depth / 2 + bevel + 0.012;
  label.renderOrder = 1;
  group.add(label);

  group.userData.bar = bar;
  group.userData.material = mat;
  group.userData.label = label;
  return group;
}

// A small, friendly low-poly cow — built entirely from primitives so it
// stays lightweight and matches the site's playful, rounded illustration
// style even in 3D.
function buildCow() {
  const group = new THREE.Group();
  const cream = new THREE.MeshStandardMaterial({ color: 0xfbf1e6, roughness: 0.75 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2b1c2b, roughness: 0.6 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xe8b7a3, roughness: 0.65 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.95, 0.95), cream);
  torso.position.y = 0.75;
  group.add(torso);

  const head = new THREE.Group();
  head.position.set(1.15, 0.95, 0);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.44, 14, 10), cream);
  skull.scale.set(1, 0.92, 0.85);
  head.add(skull);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), pink);
  snout.position.set(0.36, -0.12, 0);
  snout.scale.set(0.9, 0.65, 0.85);
  head.add(snout);
  const nostrilGeo = new THREE.SphereGeometry(0.035, 6, 6);
  const nostrilL = new THREE.Mesh(nostrilGeo, dark);
  nostrilL.position.set(0.52, -0.1, 0.09);
  head.add(nostrilL);
  const nostrilR = nostrilL.clone();
  nostrilR.position.z = -0.09;
  head.add(nostrilR);
  const eyeGeo = new THREE.SphereGeometry(0.055, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeo, dark);
  eyeL.position.set(0.28, 0.14, 0.32);
  head.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.32;
  head.add(eyeR);
  const earGeo = new THREE.ConeGeometry(0.14, 0.3, 8);
  const earL = new THREE.Mesh(earGeo, cream);
  earL.rotation.z = Math.PI / 2.3;
  earL.position.set(0.05, 0.42, 0.42);
  head.add(earL);
  const earR = earL.clone();
  earR.position.z = -0.42;
  head.add(earR);
  group.add(head);

  const legGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.62, 8);
  [
    [0.62, 0.31, 0.32],
    [0.62, 0.31, -0.32],
    [-0.62, 0.31, 0.32],
    [-0.62, 0.31, -0.32],
  ].forEach((p) => {
    const leg = new THREE.Mesh(legGeo, cream);
    leg.position.set(p[0], p[1], p[2]);
    group.add(leg);
  });

  const spotGeo = new THREE.SphereGeometry(0.22, 8, 6);
  const spot1 = new THREE.Mesh(spotGeo, dark);
  spot1.scale.set(1, 0.5, 0.68);
  spot1.position.set(-0.35, 1.06, 0.4);
  group.add(spot1);
  const spot2 = new THREE.Mesh(spotGeo, dark);
  spot2.scale.set(0.8, 0.4, 0.6);
  spot2.position.set(0.25, 0.72, -0.42);
  group.add(spot2);

  const tail = new THREE.Group();
  tail.position.set(-0.95, 0.98, 0);
  const tailBone = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.03, 0.55, 6), cream);
  tailBone.position.y = -0.25;
  tail.add(tailBone);
  const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), dark);
  tuft.position.y = -0.52;
  tail.add(tuft);
  group.add(tail);

  group.userData.head = head;
  group.userData.tail = tail;
  return group;
}

// Beat 1: the cow being milked, with the stream landing in a pail that
// visibly fills as the story's local "reveal" progress advances.
function buildMilkingScene() {
  const group = new THREE.Group();

  const cow = buildCow();
  cow.scale.setScalar(0.85);
  cow.position.set(-0.35, 0, -0.1);
  cow.rotation.y = Math.PI * 0.12;
  group.add(cow);

  // A straight-walled (not tapered) pail, so the milk fill cylinder inside
  // it can never poke through a narrowing wall as it rises.
  const pailMat = new THREE.MeshStandardMaterial({ color: 0xcabfae, roughness: 0.4, metalness: 0.15, side: THREE.DoubleSide });
  const pail = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.42, 18, 1, true), pailMat);
  pail.position.set(0.62, 0.21, 0.2);
  group.add(pail);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 8, 20), pailMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0.62, 0.42, 0.2);
  group.add(rim);

  const milkFill = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 1, 18),
    new THREE.MeshStandardMaterial({ color: 0xfffdf8, roughness: 0.25 })
  );
  milkFill.position.set(0.62, 0.02, 0.2);
  milkFill.scale.y = 0.02;
  group.add(milkFill);

  const dropGeo = new THREE.SphereGeometry(0.035, 8, 8);
  const dropMat = new THREE.MeshStandardMaterial({ color: 0xfffaf3, roughness: 0.2 });
  const drops = [];
  for (let i = 0; i < 4; i++) {
    const d = new THREE.Mesh(dropGeo, dropMat);
    d.position.set(0.58, 0.78, 0.15);
    d.visible = false;
    group.add(d);
    drops.push(d);
  }

  group.userData.cow = cow;
  group.userData.milkFill = milkFill;
  group.userData.pailBaseY = 0.0;
  group.userData.drops = drops;
  return group;
}

// A small, friendly low-poly airplane, nose along local +X.
function buildAirplane() {
  const group = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0xfffdf9, roughness: 0.32, metalness: 0.12 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xff7a45, roughness: 0.4 });

  const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.46, 4, 8), body);
  fuselage.rotation.z = Math.PI / 2;
  group.add(fuselage);

  const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 8), body);
  noseCone.rotation.z = -Math.PI / 2;
  noseCone.position.x = 0.32;
  group.add(noseCone);

  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.018, 0.72), body);
  group.add(wing);

  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.17, 0.018), accent);
  tailFin.position.set(-0.27, 0.09, 0);
  group.add(tailFin);

  const tailWing = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.015, 0.3), body);
  tailWing.position.set(-0.27, 0.02, 0);
  group.add(tailWing);

  group.scale.setScalar(1.5);
  return group;
}

// Beat 2: a stylised ocean strip with Japan and India landmasses, a dashed
// flight arc between them, and the airplane travelling along that curve.
function buildFlightScene() {
  const group = new THREE.Group();

  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x8fb8c9, roughness: 0.65 })
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = -0.05;
  group.add(ocean);

  function landmass(color, w, d, x, z) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(w, w * 1.1, 0.18, 10),
      new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
    );
    m.position.set(x, 0.02, z);
    m.scale.set(1, 1, d / w);
    return m;
  }
  group.add(landmass(0x9cbba0, 0.34, 0.6, 1.5, -0.22));
  group.add(landmass(0xe3c08a, 0.55, 0.7, -1.4, 0.28));

  const markerGeo = new THREE.ConeGeometry(0.06, 0.2, 8);
  const markerMat = new THREE.MeshStandardMaterial({ color: 0xff7a45 });
  const japanMarker = new THREE.Mesh(markerGeo, markerMat);
  japanMarker.rotation.x = Math.PI;
  japanMarker.position.set(1.5, 0.26, -0.22);
  group.add(japanMarker);
  const indiaMarker = japanMarker.clone();
  indiaMarker.position.set(-1.4, 0.26, 0.28);
  group.add(indiaMarker);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.5, 0.16, -0.22),
    new THREE.Vector3(0.3, 1.15, 0.22),
    new THREE.Vector3(-1.4, 0.16, 0.28),
  ]);
  const curvePoints = curve.getPoints(48);
  const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const curveMat = new THREE.LineDashedMaterial({ color: 0xff7a45, dashSize: 0.12, gapSize: 0.09 });
  const curveLine = new THREE.Line(curveGeo, curveMat);
  curveLine.computeLineDistances();
  group.add(curveLine);

  const plane = buildAirplane();
  group.add(plane);

  group.userData.curve = curve;
  group.userData.plane = plane;
  return group;
}

// Beat 3: three flavour orbs swirling around a milky core.
function buildBlendScene() {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 20, 16),
    new THREE.MeshStandardMaterial({ color: 0xfffaf3, roughness: 0.35 })
  );
  group.add(core);

  const orbitGroup = new THREE.Group();
  group.add(orbitGroup);

  TIAMA_FLAVORS.forEach((f, i) => {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 12),
      new THREE.MeshStandardMaterial({ color: f.hex, roughness: 0.35, metalness: 0.05 })
    );
    const angle = (i / TIAMA_FLAVORS.length) * Math.PI * 2;
    orb.position.set(Math.cos(angle) * 1.02, Math.sin(angle * 0.6) * 0.28, Math.sin(angle) * 1.02);
    orbitGroup.add(orb);
  });

  group.userData.orbitGroup = orbitGroup;
  return group;
}

// Beat 4: the three finished oval bars, fanned out, foreshadowing the
// product showcase section right below the journey.
function buildFinaleScene() {
  const group = new THREE.Group();
  const bars = [];
  TIAMA_FLAVORS.forEach((f, i) => {
    const bar = buildSoapBar(f, { rx: 0.82, ry: 0.42, depth: 0.4, bevel: 0.13 });
    const offset = (i - 1) * 1.05;
    bar.position.set(offset, 0, -Math.abs(i - 1) * 0.3);
    bar.rotation.y = (i - 1) * 0.35;
    group.add(bar);
    bars.push(bar);
  });
  group.userData.bars = bars;
  return group;
}

/* ---------- Milk Journey (scrollytelling, now in 3D) ----------
   One persistent WebGL canvas plays five "beats" — cow, milking, the
   Japan-to-India flight, the flavour blend, and the finished bars — laid
   out along a line in 3D space. The camera dollies smoothly between them
   as the user scrolls, arriving at each beat exactly when that stage's
   text becomes active, then holding there while the beat's own reveal
   animation (milk filling the pail, the plane crossing the arc, ...)
   plays out, before moving on to the next. Falls back to the original
   flat-illustration stacked layout on narrow viewports / reduced motion /
   no WebGL, same as before. */
(function milkJourney() {
  const section = document.getElementById("journey");
  const track = document.getElementById("journeyTrack");
  const canvas = document.getElementById("journeyCanvas");
  const canvasWrap = document.getElementById("journeyCanvasWrap");
  if (!section || !track) return;

  const stages = Array.from(section.querySelectorAll(".journey-stage"));
  const dots = Array.from(section.querySelectorAll(".journey-dot"));
  const hint = document.getElementById("journeyHint");

  let activeIndex = 0;
  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    stages.forEach((el, i) => el.classList.toggle("active", i === index));
    dots.forEach((el, i) => el.classList.toggle("active", i === index));
  }

  const useStatic3D = useStaticLayout || !hasWebGL() || typeof THREE === "undefined" || !canvas;

  if (useStatic3D) {
    section.classList.add("journey--static");
    return;
  }

  const BEAT_X = [0, 5.5, 11, 16.5, 22];
  const beats = []; // { group, revealT }
  let scene, camera, renderer;

  function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const light1 = new THREE.DirectionalLight(0xffffff, 1.1);
    light1.position.set(3, 5, 4);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.4);
    light2.position.set(-4, 2, -3);
    scene.add(light2);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const cowScene = buildCow();
    cowScene.position.x = BEAT_X[0];
    scene.add(cowScene);
    beats.push({ group: cowScene, revealT: 0 });

    const milkScene = buildMilkingScene();
    milkScene.position.x = BEAT_X[1];
    scene.add(milkScene);
    beats.push({ group: milkScene, revealT: 0 });

    const flightScene = buildFlightScene();
    flightScene.position.x = BEAT_X[2];
    scene.add(flightScene);
    beats.push({ group: flightScene, revealT: 0 });

    const blendScene = buildBlendScene();
    blendScene.position.x = BEAT_X[3];
    scene.add(blendScene);
    beats.push({ group: blendScene, revealT: 0 });

    const finaleScene = buildFinaleScene();
    finaleScene.position.x = BEAT_X[4];
    scene.add(finaleScene);
    beats.push({ group: finaleScene, revealT: 0 });

    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    const w = canvasWrap.clientWidth || 1;
    const h = canvasWrap.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  try {
    initScene();
  } catch (e) {
    section.classList.add("journey--static");
    return;
  }

  let latestProgress = 0;
  const HOLD = 0.7; // fraction of each stage's window spent "at" that beat before travelling on

  function updateCameraAndBeats(progress) {
    const n = stages.length;
    const beatProgress = progress * n;
    const stageIndex = Math.min(n - 1, Math.floor(beatProgress));
    const sLocal = beatProgress - stageIndex;

    setActive(stageIndex);
    if (hint) hint.classList.toggle("hidden", progress > 0.04);

    let camX, revealT;
    if (stageIndex >= n - 1) {
      camX = BEAT_X[n - 1];
      revealT = Math.min(1, sLocal / HOLD);
    } else if (sLocal < HOLD) {
      camX = BEAT_X[stageIndex];
      revealT = sLocal / HOLD;
    } else {
      const travelT = (sLocal - HOLD) / (1 - HOLD);
      camX = THREE.MathUtils.lerp(BEAT_X[stageIndex], BEAT_X[stageIndex + 1], travelT);
      revealT = 1;
    }

    camera.position.set(camX + 0.15, 1.1, 5.3);
    camera.lookAt(camX + 0.15, 0.3, 0);

    beats.forEach((b, i) => {
      b.group.visible = Math.abs(i - stageIndex) <= 1;
    });
    beats[stageIndex].revealT = revealT;
  }

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    const cow = beats[0].group;
    if (cow.userData.tail) cow.userData.tail.rotation.z = Math.sin(t * 2) * 0.18;
    if (cow.userData.head) cow.userData.head.rotation.y = Math.sin(t * 0.8) * 0.08;

    const milking = beats[1].group;
    if (milking.userData.cow && milking.userData.cow.userData.tail) {
      milking.userData.cow.userData.tail.rotation.z = Math.sin(t * 2.3) * 0.15;
    }
    const revealMilk = beats[1].revealT || 0;
    if (milking.userData.milkFill) {
      // Pail interior runs from y=0 to y≈0.42 (see buildMilkingScene) — cap
      // well short of the rim so the fill never visibly overflows it.
      const level = 0.02 + Math.min(1, revealMilk * 1.15) * 0.34;
      milking.userData.milkFill.scale.y = level;
      milking.userData.milkFill.position.y = milking.userData.pailBaseY + level * 0.5;
    }
    if (milking.userData.drops) {
      const dropsVisible = revealMilk > 0.08 && revealMilk < 0.97;
      milking.userData.drops.forEach((d, i) => {
        d.visible = dropsVisible;
        if (dropsVisible) {
          const phase = (t * 1.8 + i * 0.27) % 1;
          d.position.y = 0.8 - phase * 0.62;
        }
      });
    }

    const flight = beats[2].group;
    if (flight.userData.plane && flight.userData.curve) {
      const revealFlight = beats[2].revealT || 0;
      const tt = Math.max(0.001, Math.min(1, revealFlight));
      const pos = flight.userData.curve.getPointAt(tt);
      const tangent = flight.userData.curve.getTangentAt(tt);
      flight.userData.plane.position.copy(pos);
      const lookTarget = pos.clone().add(tangent);
      flight.userData.plane.lookAt(lookTarget);
      flight.userData.plane.rotateY(Math.PI / 2);
      flight.userData.plane.rotation.z += Math.sin(t * 3) * 0.05;
    }

    const blend = beats[3].group;
    if (blend.userData.orbitGroup) {
      blend.userData.orbitGroup.rotation.y = t * 0.6;
    }

    const finale = beats[4].group;
    if (finale.userData.bars) {
      finale.userData.bars.forEach((bar, i) => {
        bar.rotation.y += 0.004 + i * 0.0008;
        bar.position.y = Math.sin(t * 1.2 + i) * 0.04;
      });
    }

    updateCameraAndBeats(latestProgress);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  makeScrollProgress(track, (progress) => {
    latestProgress = progress;
  });

  requestAnimationFrame(animate);
})();

/* ---------- 3D Product Showcase ---------- */
(function productShowcase() {
  const section = document.getElementById("showcase");
  const track = document.getElementById("showcaseTrack");
  const canvas = document.getElementById("showcaseCanvas");
  const canvasWrap = document.getElementById("showcaseCanvasWrap");
  const fallbackImg = document.getElementById("showcaseFallbackImg");
  const hint = document.getElementById("showcaseHint");
  const eyebrow = document.getElementById("showcaseEyebrow");
  const nameEl = document.getElementById("showcaseFlavorName");
  const descEl = document.getElementById("showcaseFlavorDesc");
  const flavorDots = Array.from(document.querySelectorAll(".showcase-flavor-dot"));
  if (!section || !track || !canvas) return;

  const FLAVORS = TIAMA_FLAVORS;

  function updatePanel(index) {
    const f = FLAVORS[index];
    if (eyebrow) eyebrow.textContent = `THE TIAMA RANGE · ${f.label}`;
    if (nameEl) { nameEl.textContent = f.name; nameEl.style.color = f.css; }
    if (descEl) descEl.textContent = f.desc;
    flavorDots.forEach((d) => d.classList.toggle("active", d.dataset.flavor === f.key));
  }

  // ---- Fallback path: reduced motion, no WebGL, or Three.js failed to load ----
  const useStatic = useStaticLayout || !hasWebGL() || typeof THREE === "undefined";

  if (useStatic) {
    section.classList.add("showcase--static");
    canvas.hidden = true;
    if (fallbackImg) fallbackImg.hidden = false;

    let current = 0;
    updatePanel(current);
    flavorDots.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        current = i;
        updatePanel(current);
      });
    });
    return;
  }

  // ---- Full 3D path ----
  let scene, camera, renderer, spinGroup, light1, light2;
  let currentFlavor = 0;
  let needsRender = true;
  const BAR_OPTS = { rx: 1.05, ry: 0.55, depth: 0.5, bevel: 0.16 };

  function applyFlavor(index) {
    currentFlavor = index;
    const f = FLAVORS[index];
    if (spinGroup) {
      while (spinGroup.children.length) spinGroup.remove(spinGroup.children[0]);
      spinGroup.add(buildSoapBar(f, BAR_OPTS));
    }
    updatePanel(index);
    needsRender = true;
  }

  function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    spinGroup = new THREE.Group();
    spinGroup.add(buildSoapBar(FLAVORS[0], BAR_OPTS));
    scene.add(spinGroup);

    light1 = new THREE.DirectionalLight(0xffffff, 0.95);
    light1.position.set(2, 2.5, 3);
    scene.add(light1);
    light2 = new THREE.DirectionalLight(0xffffff, 0.35);
    light2.position.set(-3, -1, 2);
    scene.add(light2);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    resize();
    window.addEventListener("resize", () => {
      resize();
      needsRender = true;
    });
  }

  function resize() {
    const w = canvasWrap.clientWidth || 1;
    const h = canvasWrap.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function renderLoop() {
    if (needsRender) {
      renderer.render(scene, camera);
      needsRender = false;
    }
    requestAnimationFrame(renderLoop);
  }

  try {
    initScene();
  } catch (e) {
    // WebGL context creation or Three.js init failed at runtime — degrade gracefully.
    section.classList.add("showcase--static");
    canvas.hidden = true;
    if (fallbackImg) fallbackImg.hidden = false;
    updatePanel(0);
    flavorDots.forEach((btn, i) => {
      btn.addEventListener("click", () => updatePanel(i));
    });
    return;
  }

  updatePanel(0);
  requestAnimationFrame(renderLoop);

  // Re-draw the label texture once the display font has actually loaded,
  // so the "TIAMA" wordmark on the bar isn't stuck on the canvas fallback font.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      applyFlavor(currentFlavor);
    });
  }

  makeScrollProgress(track, (progress) => {
    spinGroup.rotation.y = progress * Math.PI * 4;
    spinGroup.rotation.x = Math.sin(progress * Math.PI * 2) * 0.1;
    needsRender = true;

    const stopIndex = Math.min(FLAVORS.length - 1, Math.floor(progress * FLAVORS.length));
    if (stopIndex !== currentFlavor) applyFlavor(stopIndex);

    if (hint) hint.classList.toggle("hidden", progress > 0.04);
  });

  // Manual override: clicking a flavor dot jumps the bar straight to that
  // flavor without waiting for the next scroll-driven update.
  flavorDots.forEach((btn, i) => {
    btn.addEventListener("click", () => applyFlavor(i));
  });
})();

/* ---------- Nav shrink on scroll (subtle, single deliberate touch) ---------- */
(function navShadow() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.style.boxShadow = window.scrollY > 8 ? "0 8px 24px -18px rgba(43,28,43,0.4)" : "none";
  });
})();

/* ---------- Mobile nav toggle (hamburger menu below the 860px breakpoint) ---------- */
(function mobileNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  function closeMenu() {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  function openMenu() {
    links.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", () => {
    if (links.classList.contains("open")) closeMenu();
    else openMenu();
  });

  // Tapping a link (including the in-menu CTA) jumps the page, so close the menu too.
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  // Tapping outside the open menu closes it.
  document.addEventListener("click", (e) => {
    if (!links.classList.contains("open")) return;
    if (links.contains(e.target) || toggle.contains(e.target)) return;
    closeMenu();
  });

  // Escape key closes it.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Rotating a phone to landscape or resizing past the breakpoint shouldn't
  // leave the dropdown stuck open with no toggle visible to close it.
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 860) closeMenu();
  });
})();

/* ---------- Hero 3D visual (three rotating oval bars) ----------
   Opens the site with the product itself, in 3D, before the scroll story
   begins. Falls back to the flat product photo under reduced motion, no
   WebGL, or narrow viewports — same pattern as the journey and showcase. */
(function heroShowcase() {
  const canvas = document.getElementById("heroCanvas");
  const canvasWrap = document.getElementById("heroCanvasWrap");
  const fallbackImg = document.getElementById("heroFallbackImg");
  if (!canvas || !canvasWrap) return;

  const useStatic = useStaticLayout || !hasWebGL() || typeof THREE === "undefined";

  if (useStatic) {
    canvas.hidden = true;
    if (fallbackImg) fallbackImg.hidden = false;
    return;
  }

  let scene, camera, renderer;
  const bars = [];

  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 1.5, 5.7);
    camera.lookAt(0, -0.05, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const light1 = new THREE.DirectionalLight(0xffffff, 1.05);
    light1.position.set(2.5, 3, 3);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.4);
    light2.position.set(-3, -1, 2);
    scene.add(light2);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    TIAMA_FLAVORS.forEach((f, i) => {
      const bar = buildSoapBar(f, { rx: 0.95, ry: 0.5, depth: 0.46, bevel: 0.15 });
      const offset = (i - 1) * 1.55;
      bar.position.set(offset, -Math.abs(i - 1) * 0.1, -Math.abs(i - 1) * 0.3);
      bar.rotation.y = (i - 1) * 0.22;
      bar.scale.setScalar(i === 1 ? 1 : 0.86);
      scene.add(bar);
      bars.push(bar);
    });

    function resize() {
      const w = canvasWrap.clientWidth || 1;
      const h = canvasWrap.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);
  } catch (e) {
    canvas.hidden = true;
    if (fallbackImg) fallbackImg.hidden = false;
    return;
  }

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    bars.forEach((bar, i) => {
      bar.rotation.y += 0.003 + i * 0.0006;
      bar.position.y = -Math.abs(i - 1) * 0.1 + Math.sin(t * 1.1 + i * 1.4) * 0.05;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
