/*!
 * Face + Hand Network Widget
 * Pasang: <script src="/face-hand-widget.js" defer></script>
 * Menambahkan tombol ikon kecil (fixed, kanan bawah) yang membuka overlay kamera
 * dengan efek jaringan di wajah dan tangan. Model baru dimuat saat tombol pertama kali diklik.
 */
(function () {
  'use strict';
  if (window.__faceHandWidget) return;
  window.__faceHandWidget = true;

  // ===== Pengaturan (silakan ubah) =====
  const CONFIG = {
    right: '20px',            // jarak tombol dari kanan
    bottom: '20px',           // jarak tombol dari bawah
    buttonSize: '52px',
    accent: '#7c6cff',        // warna utama (tombol dan bingkai), senada tombol "View My Work"
    face: '#9084ff',          // jaring wajah: violet lembut
    faceOpen: '#77ff00',      // jaring wajah saat mulut terbuka: hijau seperti titik "Available"
    handColors: ['#c4bdff', '#5eead4'],   // tangan 1: lavender, tangan 2: teal
    particle: '#d9d5ff',
    title: 'face-hand.uraex',
    zIndex: 2147483000,
    maxHands: 2,
    mirror: true
  };

  const TASKS = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/';

  const BONES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],
                 [9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
  const TIPS = [4, 8, 12, 16, 20];

  // ===== UI (Shadow DOM agar CSS website tidak bentrok) =====
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const flip = CONFIG.mirror ? 'scaleX(-1)' : 'none';
  root.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; }
      .fab { position: fixed; right: ${CONFIG.right}; bottom: ${CONFIG.bottom};
        width: ${CONFIG.buttonSize}; height: ${CONFIG.buttonSize}; border-radius: 50%;
        display: grid; place-items: center; cursor: pointer; padding: 0; color: #fff;
        background: linear-gradient(135deg, rgba(255,255,255,.28), rgba(255,255,255,0) 55%), ${CONFIG.accent};
        border: 1px solid rgba(255,255,255,.35);
        box-shadow: 0 0 0 5px ${CONFIG.accent}2e, 0 10px 28px ${CONFIG.accent}80;
        z-index: ${CONFIG.zIndex}; transition: transform .15s, box-shadow .15s;
        margin-bottom: env(safe-area-inset-bottom, 0px); }
      .fab:hover { transform: scale(1.07); box-shadow: 0 0 0 7px ${CONFIG.accent}3d, 0 12px 32px ${CONFIG.accent}99; }
      .fab:focus-visible, .close:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
      .fab svg { width: 56%; height: 56%; }

      .overlay { position: fixed; inset: 0; z-index: ${CONFIG.zIndex + 1}; display: none;
        place-items: center; padding: 24px; color: #e8ebff;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        background:
          radial-gradient(ellipse at 75% 15%, ${CONFIG.accent}47, transparent 55%),
          radial-gradient(ellipse at 15% 90%, ${CONFIG.faceOpen}1f, transparent 50%),
          rgba(5,6,12,.9);
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
      .overlay.open { display: grid; }

      .frame { width: min(1100px, 100%); height: min(760px, 100%); display: flex; flex-direction: column;
        border-radius: 24px; overflow: hidden; background: #0a0b15;
        border: 1px solid ${CONFIG.accent}59;
        box-shadow: 0 0 0 1px rgba(255,255,255,.04), 0 30px 80px rgba(0,0,0,.6), 0 0 70px ${CONFIG.accent}38; }
      .bar { display: flex; align-items: center; gap: 14px; padding: 12px 14px 12px 18px;
        border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
      .dots { display: flex; gap: 8px; }
      .dots i { width: 12px; height: 12px; border-radius: 50%; display: block; }
      .dots i:nth-child(1) { background: #ff5f57; } .dots i:nth-child(2) { background: #febc2e; }
      .dots i:nth-child(3) { background: #28c840; }
      .title { flex: 1; text-align: right; font: 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        color: rgba(232,235,255,.55); letter-spacing: .02em; }
      .close { width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 16px; line-height: 1;
        background: rgba(255,255,255,.06); color: #e8ebff; border: 1px solid rgba(255,255,255,.14);
        transition: background .15s, color .15s; }
      .close:hover { background: #fff; color: #0a0b15; }

      .view { position: relative; flex: 1; min-height: 0; overflow: hidden; background-color: #06070e;
        background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
        background-size: 40px 40px; }
      video, canvas { position: absolute; inset: 0; width: 100%; height: 100%;
        object-fit: cover; transform: ${flip}; }
      video { opacity: .5; }
      .corner { position: absolute; width: 28px; height: 28px; pointer-events: none;
        border: 2px solid ${CONFIG.face}; opacity: .85; }
      .tl { top: 14px; left: 14px; border-right: 0; border-bottom: 0; border-top-left-radius: 8px; }
      .tr { top: 14px; right: 14px; border-left: 0; border-bottom: 0; border-top-right-radius: 8px; }
      .bl { bottom: 14px; left: 14px; border-right: 0; border-top: 0; border-bottom-left-radius: 8px; }
      .br { bottom: 14px; right: 14px; border-left: 0; border-top: 0; border-bottom-right-radius: 8px; }
      .status { position: absolute; left: 50%; bottom: 20px; transform: translateX(-50%); white-space: nowrap;
        display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px;
        font: 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: rgba(232,235,255,.85);
        background: rgba(8,9,18,.72); border: 1px solid rgba(255,255,255,.1); }
      .status:empty { display: none; }
      .status::before { content: ''; width: 8px; height: 8px; border-radius: 50%;
        background: ${CONFIG.faceOpen}; box-shadow: 0 0 8px ${CONFIG.faceOpen}; }
      .msg { position: absolute; inset: 0; display: grid; place-items: center; text-align: center;
        padding: 24px; line-height: 1.5; pointer-events: none; }
      .msg span { max-width: 36ch; }
      @media (max-width: 640px) {
        .overlay { padding: 0; } .frame { border-radius: 0; height: 100%; border: 0; }
      }
    </style>
    <button class="fab" type="button" aria-label="Buka efek jaringan wajah dan tangan" title="Efek jaringan wajah dan tangan">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        <circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="5" cy="13" r="2" fill="currentColor"/>
        <circle cx="19" cy="13" r="2" fill="currentColor"/><circle cx="9" cy="20" r="2" fill="currentColor"/>
        <circle cx="16" cy="20" r="2" fill="currentColor"/>
        <path d="M12 7 5 11M12 7l7 4M5 15l4 3M19 15l-3 3M9 20h5M5 13h12"/>
      </svg>
    </button>
    <div class="overlay" role="dialog" aria-modal="true" aria-label="Efek jaringan wajah dan tangan">
      <div class="frame">
        <div class="bar">
          <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="title">${CONFIG.title}</span>
          <button class="close" type="button" aria-label="Tutup">✕</button>
        </div>
        <div class="view">
          <video playsinline muted></video>
          <canvas></canvas>
          <span class="corner tl"></span><span class="corner tr"></span>
          <span class="corner bl"></span><span class="corner br"></span>
          <div class="msg"><span></span></div>
          <div class="status"></div>
        </div>
      </div>
    </div>`;

  const fab = root.querySelector('.fab');
  const overlay = root.querySelector('.overlay');
  const video = root.querySelector('video');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const msgBox = root.querySelector('.msg');
  const msgText = root.querySelector('.msg span');
  const statusEl = root.querySelector('.status');
  const closeBtn = root.querySelector('.close');

  const setMsg = t => { msgText.textContent = t || ''; msgBox.style.display = t ? 'grid' : 'none'; };

  // ===== Logika deteksi dan efek =====
  let faceModel, handModel, stream, rafId, TESS = [];
  let ready = false;
  let running = false, frameN = 0;
  let faceLm = [], handLm = [];
  let particles = [], mouth = 0, smile = 0;

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

  // Batasi resolusi canvas agar tidak terlalu berat di layar retina
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  function resize() {
    canvas.width = canvas.clientWidth * DPR;
    canvas.height = canvas.clientHeight * DPR;
  }

  function toPx(p) {
    const cw = canvas.width, ch = canvas.height;
    const vw = video.videoWidth || cw, vh = video.videoHeight || ch;
    const s = Math.max(cw / vw, ch / vh);
    return { x: p.x * vw * s + (cw - vw * s) / 2, y: p.y * vh * s + (ch - vh * s) / 2 };
  }

  function spawn(pt, n, speed) {
    for (let i = 0; i < n; i++)
      particles.push({ x: pt.x, y: pt.y, life: 1,
        vx: (Math.random() - .5) * speed, vy: (Math.random() - .5) * speed - .5 });
  }

  function drawFace(pts, u) {
    const faceH = dist(pts[10], pts[152]), faceW = dist(pts[234], pts[454]);
    const open = Math.min(dist(pts[13], pts[14]) / faceH / 0.12, 1);
    const wide = Math.min(Math.max((dist(pts[61], pts[291]) / faceW - 0.36) / 0.12, 0), 1);
    mouth = lerp(mouth, open, .25);
    smile = lerp(smile, wide, .2);

    const a = hex2rgb(CONFIG.face), b = hex2rgb(CONFIG.faceOpen);
    const c = a.map((v, i) => Math.round(lerp(v, b[i], mouth)));
    const col = `rgb(${c})`;
    ctx.strokeStyle = col; ctx.fillStyle = col;
    ctx.lineWidth = (0.8 + smile * 0.8) * u;
    ctx.globalAlpha = 0.35 + mouth * 0.3 + smile * 0.15;
    ctx.beginPath();
    for (const [i, j] of TESS) {
      ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
    }
    ctx.stroke();
    ctx.globalAlpha = .9;
    for (let i = 0; i < pts.length; i += 3) ctx.fillRect(pts[i].x - u, pts[i].y - u, 2 * u, 2 * u);
    if (mouth > 0.35) spawn(pts[14], Math.ceil(mouth * 4), 5);
  }

  function drawHand(pts, color, u) {
    ctx.shadowColor = color; ctx.shadowBlur = 16 * u; ctx.lineCap = 'round';
    ctx.strokeStyle = color; ctx.lineWidth = 2.5 * u; ctx.globalAlpha = .95;
    ctx.beginPath();
    BONES.forEach(([i, j]) => { ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); });
    ctx.stroke();
    ctx.shadowBlur = 0;   // shadow sangat berat, matikan untuk garis jaringan
    const maxD = 150 * u; ctx.lineWidth = u; ctx.globalAlpha = .35;
    ctx.beginPath();      // semua garis jaringan digambar dalam satu path
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 2; j < pts.length; j++)
        if (dist(pts[i], pts[j]) < maxD) { ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); }
    ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = '#fff';
    pts.forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, (TIPS.includes(i) ? 6 : 3.2) * u, 0, 6.283); ctx.fill();
    });
    TIPS.forEach(i => spawn(pts[i], 1, 2.2));
    ctx.shadowBlur = 0;
  }

  function render() {
    const u = DPR;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    const faces = faceLm;
    const hs = handLm.map(h => h.map(toPx));

    if (faces.length) drawFace(faces[0].map(toPx), u);
    else { mouth = lerp(mouth, 0, .2); smile = lerp(smile, 0, .2); }
    hs.forEach((pts, i) => drawHand(pts, CONFIG.handColors[i % CONFIG.handColors.length], u));

    if (hs.length === 2) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4 * u; ctx.globalAlpha = .6;
      ctx.beginPath();
      TIPS.forEach(i => { ctx.moveTo(hs[0][i].x, hs[0][i].y); ctx.lineTo(hs[1][i].x, hs[1][i].y); });
      ctx.stroke();
    }

    particles = particles.filter(p => p.life > 0);
    if (particles.length > 300) particles.splice(0, particles.length - 300);
    ctx.fillStyle = CONFIG.particle;
    particles.forEach(p => {
      p.x += p.vx * u; p.y += p.vy * u; p.life -= .025;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.4 * u * p.life, 0, 6.283); ctx.fill();
    });

    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    statusEl.textContent = `${faces.length ? 'Wajah terdeteksi' : 'Mencari wajah…'} · ${hs.length} tangan · ${fps} FPS`;
  }

  // ===== Buka / tutup =====
  async function setupModels() {
    const { FilesetResolver, HandLandmarker, FaceLandmarker } = await import(TASKS + '+esm');   // dimuat saat pertama kali dibuka
    const fileset = await FilesetResolver.forVisionTasks(TASKS + 'wasm');
    const base = 'https://storage.googleapis.com/mediapipe-models/';
    const make = async (Cls, path, extra) => {
      const opts = d => ({ baseOptions: { modelAssetPath: base + path, delegate: d }, runningMode: 'VIDEO', ...extra });
      try { return await Cls.createFromOptions(fileset, opts('GPU')); }       // GPU = jauh lebih ringan di CPU
      catch (e) { return await Cls.createFromOptions(fileset, opts('CPU')); }
    };
    handModel = await make(HandLandmarker, 'hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task', { numHands: CONFIG.maxHands });
    faceModel = await make(FaceLandmarker, 'face_landmarker/face_landmarker/float16/1/face_landmarker.task', { numFaces: 1 });
    TESS = FaceLandmarker.FACE_LANDMARKS_TESSELATION.map(c => [c.start, c.end]);
    ready = true;
  }

  let lastVideoTime = -1, fpsCount = 0, fpsT = performance.now(), fps = 0;
  function loop() {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    // Hanya proses jika ada frame video baru
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      const ts = performance.now();
      handLm = handModel.detectForVideo(video, ts).landmarks || [];
      if (frameN++ % 2 === 0) faceLm = faceModel.detectForVideo(video, ts).faceLandmarks || [];  // wajah tiap 2 frame
      render();
      fpsCount++;
    }
    const now = performance.now();
    if (now - fpsT >= 1000) { fps = fpsCount; fpsCount = 0; fpsT = now; }
  }

  async function open() {
    overlay.classList.add('open');
    running = true;
    resize();
    statusEl.textContent = '';
    setMsg('Melacak server………');
    try {
      if (!ready) await setupModels();
      faceLm = []; handLm = [];
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
      if (!running) { stream.getTracks().forEach(t => t.stop()); return; }
      video.srcObject = stream;
      await video.play();
      lastVideoTime = -1;
      setMsg('');
      loop();
    } catch (e) {
      console.error(e);
      setMsg(e && e.name === 'NotAllowedError'
        ? 'Izin kamera ditolak. Izinkan akses kamera di pengaturan browser, lalu coba lagi.'
        : 'Kamera atau model gagal dimuat. Periksa koneksi internet dan pastikan situs memakai HTTPS.');
    }
    closeBtn.focus();
  }

  function close() {
    running = false;
    cancelAnimationFrame(rafId);
    overlay.classList.remove('open');
    if (stream) stream.getTracks().forEach(t => t.stop());   // lampu kamera mati
    stream = null; video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
    fab.focus();
  }

  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape' && running) close(); });
  addEventListener('resize', () => { if (running) resize(); });

  function mount() { document.body.appendChild(host); }
  if (document.body) mount(); else addEventListener('DOMContentLoaded', mount);
})();