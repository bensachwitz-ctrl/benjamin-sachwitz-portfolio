/* =============================================================
   BENJAMIN SACHWITZ — app.js
   Top-nav scroll site · 2026
   ============================================================= */
(function () {
  'use strict';

  /* ──── CERT DATA ──── */
  const CERTS = [
    { icon: 'shield', label: 'P&C Licensed', sub: 'South Carolina DOI' },
    { icon: 'globe', label: "Lloyd's Market", sub: 'London Placement' },
    { icon: 'chart', label: 'Loss Control Innovation', sub: 'Swamp Fox Agency' },
    { icon: 'truck', label: 'Commercial Trucking', sub: 'Heavy Haul Specialist' },
    { icon: 'tree', label: 'Logging Risk', sub: 'Timber Operations' },
    { icon: 'anchor', label: 'Marine Insurance', sub: 'Inland & Coastal' },
    { icon: 'gavel', label: 'Surety Bonds', sub: 'Contract & Commercial' },
    { icon: 'building', label: 'Commercial Property', sub: 'Risk Assessment' },
    { icon: 'code', label: 'GitHub Development', sub: 'AI-Driven Workflows' },
    { icon: 'federal', label: 'Federal Tech Sales', sub: 'Carahsoft · DC' },
    { icon: 'usc', label: 'Moore School Graduate', sub: 'Darla Moore · USC' },
    { icon: 'masters', label: 'Augusta National', sub: 'Masters Tournament Ops' },
  ];
  const IC = {
    shield:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    globe:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    chart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
    truck:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    tree:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 14l-5-8-5 8h3v6h4v-6z"/></svg>',
    anchor:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 15H2a10 10 0 0 0 20 0h-3"/></svg>',
    gavel:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3l7 7-1.5 1.5-7-7L14 3z"/><path d="M3 14l7 7 1.5-1.5-7-7L3 14z"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="2" width="18" height="20"/><rect x="9" y="12" width="6" height="10"/><rect x="7" y="6" width="3" height="3"/><rect x="14" y="6" width="3" height="3"/></svg>',
    code:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    federal:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="10" width="20" height="11" rx="1"/><path d="M12 2L2 7h20L12 2z"/><line x1="7" y1="10" x2="7" y2="21"/><line x1="12" y1="10" x2="12" y2="21"/><line x1="17" y1="10" x2="17" y2="21"/></svg>',
    usc:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 10v6M2 10l10-7 10 7"/><rect x="6" y="10" width="4" height="8"/><rect x="14" y="10" width="4" height="8"/><line x1="2" y1="18" x2="22" y2="18"/></svg>',
    masters:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3"/><path d="M3 21v-2a8 8 0 0 1 18 0v2"/></svg>',
  };

  /* ──── 1. NAVBAR SCROLL ──── */
  const topnav = document.getElementById('topnav');
  const progressBar = document.getElementById('scroll-progress');
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    const sy = window.scrollY;
    // Sticky
    topnav.classList.toggle('scrolled', sy > 60);
    // Progress
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && h > 0) progressBar.style.width = (sy / h * 100) + '%';
    // Active link
    let current = '';
    sections.forEach(s => {
      if (sy >= s.offsetTop - 200) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ──── 2. MOBILE NAV ──── */
  const hamburger = document.getElementById('hamburger');
  const navLinksWrap = document.getElementById('nav-links');

  function closeMobile() {
    navLinksWrap && navLinksWrap.classList.remove('open');
    hamburger && hamburger.classList.remove('open');
  }
  hamburger && hamburger.addEventListener('click', () => {
    navLinksWrap.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
  navLinks.forEach(l => l.addEventListener('click', closeMobile));

  /* ──── 3. SMOOTH SCROLL ──── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 64, behavior: 'smooth' });
      }
    });
  });

  /* ──── 4. SCROLL REVEAL ──── */
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(r => revealObs.observe(r));

  /* ──── 5. CAROUSEL ──── */
  const track = document.getElementById('carousel-track');
  const dotsWrap = document.getElementById('car-dots');
  if (track) {
    const slides = track.querySelectorAll('.car-slide');
    let cur = 0, timer;

    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'car-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => { goTo(i); startAuto(); });
      dotsWrap && dotsWrap.appendChild(d);
    });

    function goTo(i) {
      slides[cur].classList.remove('active');
      const dots = dotsWrap ? dotsWrap.querySelectorAll('.car-dot') : [];
      dots[cur] && dots[cur].classList.remove('active');
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.add('active');
      dots[cur] && dots[cur].classList.add('active');
    }
    function startAuto() { clearInterval(timer); timer = setInterval(() => goTo(cur + 1), 5000); }
    startAuto();

    const prev = document.getElementById('car-prev');
    const next = document.getElementById('car-next');
    prev && prev.addEventListener('click', () => { goTo(cur - 1); startAuto(); });
    next && next.addEventListener('click', () => { goTo(cur + 1); startAuto(); });

    track.addEventListener('mouseenter', () => clearInterval(timer));
    track.addEventListener('mouseleave', startAuto);

    let tx = 0;
    track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) { dx < 0 ? goTo(cur + 1) : goTo(cur - 1); startAuto(); }
    });
  }

  /* ──── 6. TYPEWRITER ──── */
  const phrases = [
    'Insurance Professional.',
    "Lloyd's Market Specialist.",
    'Risk Technology Innovator.',
    'Commercial Lines Expert.',
    'Loss Control Strategist.',
  ];
  const twEl = document.getElementById('typewriter');
  let pi = 0, ci = 0, del = false, twT;
  function typeStep() {
    if (!twEl) return;
    const p = phrases[pi];
    if (!del) {
      twEl.textContent = p.slice(0, ++ci);
      if (ci === p.length) { del = true; twT = setTimeout(typeStep, 2200); return; }
    } else {
      twEl.textContent = p.slice(0, --ci);
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    }
    twT = setTimeout(typeStep, del ? 40 : 75);
  }
  typeStep();

  /* ──── 7. PARTICLE CANVAS ──── */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, pts = [];
    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    class P {
      constructor() { this.r(); }
      r() { this.x = Math.random() * W; this.y = Math.random() * H; this.s = Math.random() * 1.4 + 0.4; this.vx = (Math.random() - 0.5) * 0.4; this.vy = (Math.random() - 0.5) * 0.4; this.a = Math.random() * 0.5 + 0.15; }
      u() { this.x += this.vx; this.y += this.vy; if (this.x < -5 || this.x > W + 5 || this.y < -5 || this.y > H + 5) this.r(); }
      d() { ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2); ctx.fillStyle = 'rgba(96,165,250,' + this.a + ')'; ctx.fill(); }
    }
    function init() { resize(); const n = Math.min(Math.floor(W * H / 7000), 120); pts = Array.from({ length: n }, () => new P()); }
    function loop() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) { pts[i].u(); pts[i].d(); }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = 'rgba(96,165,250,' + (0.12 * (1 - d / 110)) + ')'; ctx.lineWidth = 0.5; ctx.stroke(); }
        }
      }
      requestAnimationFrame(loop);
    }
    init(); loop();
    window.addEventListener('resize', init);
  }

  /* ──── 8. SKILL TABS + BARS ──── */
  const skTabs = document.querySelectorAll('.sk-tab');
  const skPanes = document.querySelectorAll('.sk-pane');
  skTabs.forEach(t => t.addEventListener('click', () => {
    skTabs.forEach(x => x.classList.remove('active'));
    skPanes.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('sk-' + t.dataset.sk)?.classList.add('active');
    animateBars();
  }));

  let barsAnimated = false;
  function animateBars() {
    document.querySelectorAll('.sk-pane.active .sk-fill').forEach(f => {
      f.style.width = f.dataset.w + '%';
    });
    barsAnimated = true;
  }
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    new IntersectionObserver((e) => {
      if (e[0].isIntersecting && !barsAnimated) animateBars();
    }, { threshold: 0.2 }).observe(skillsSection);
  }

  /* ──── 9. CERTS ──── */
  let certsBuilt = false;
  function buildCerts() {
    if (certsBuilt) return;
    certsBuilt = true;
    const c1 = document.getElementById('certs-col-1');
    const c2 = document.getElementById('certs-col-2');
    if (!c1 || !c2) return;
    const half = Math.ceil(CERTS.length / 2);
    function card(c) {
      return '<div class="cert-card"><span class="cert-icon">' + (IC[c.icon] || IC.shield) + '</span><div><div class="cert-label">' + c.label + '</div><div class="cert-sub">' + c.sub + '</div></div></div>';
    }
    const h1 = CERTS.slice(0, half).map(card).join('');
    const h2 = CERTS.slice(half).map(card).join('');
    c1.innerHTML = h1 + h1;
    c2.innerHTML = h2 + h2;
  }
  const credSection = document.getElementById('credentials');
  if (credSection) {
    new IntersectionObserver((e) => {
      if (e[0].isIntersecting) buildCerts();
    }, { threshold: 0.1 }).observe(credSection);
  }

  /* ──── 10. 3D TILT ──── */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.style.transition = 'transform 0.15s ease';
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = (-(e.clientY - r.top - r.height / 2) / r.height) * 8;
      const ry = ((e.clientX - r.left - r.width / 2) / r.width) * 8;
      card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(1.01)';
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ──── 11. CONTACT FORM ──── */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const n = (form.querySelector('[name="name"]')?.value || '').trim();
      const em = (form.querySelector('[name="email"]')?.value || '').trim();
      const su = (form.querySelector('[name="subject"]')?.value || 'Portfolio Inquiry').trim();
      const msg = (form.querySelector('[name="message"]')?.value || '').trim();
      window.location.href = 'mailto:bensachwitz@gmail.com?subject=' + encodeURIComponent(su) + '&body=' + encodeURIComponent('From: ' + n + ' <' + em + '>\n\n' + msg);
      if (status) { status.textContent = 'Opening your email client...'; setTimeout(() => { status.textContent = ''; }, 5000); }
    });
  }

  /* ──── 12. RIPPLE ──── */
  if (!document.getElementById('rip-css')) {
    const s = document.createElement('style');
    s.id = 'rip-css';
    s.textContent = '@keyframes rip{from{transform:scale(0);opacity:1}to{transform:scale(2.5);opacity:0}}';
    document.head.appendChild(s);
  }
  document.querySelectorAll('.btn-primary,.btn-outline,.btn-submit,.sk-tab,.ci-soc').forEach(el => {
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    el.addEventListener('click', e => {
      const r = el.getBoundingClientRect();
      const sz = Math.max(r.width, r.height);
      const sp = document.createElement('span');
      sp.style.cssText = 'position:absolute;border-radius:50%;background:rgba(255,255,255,0.2);pointer-events:none;animation:rip .6s ease-out forwards;width:' + sz + 'px;height:' + sz + 'px;left:' + (e.clientX - r.left - sz / 2) + 'px;top:' + (e.clientY - r.top - sz / 2) + 'px';
      el.appendChild(sp);
      setTimeout(() => sp.remove(), 650);
    });
  });

})();
