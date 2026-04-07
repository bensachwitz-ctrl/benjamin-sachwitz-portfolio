/* ============================================================
   BENJAMIN SACHWITZ — app.js
   Canvas particles | Scroll effects | Gallery lightbox |
   Cert scroller | Stat counters | Skills tabs | Form handler | Nav
   + Scroll progress bar | Cursor glow | Typewriter | Skill bars
   ============================================================ */

/* ============================================================
   3D CARD TILT
   ============================================================ */
(function init3DTilt() {
  const STRENGTH = 10; // max degrees
  function applyTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const rotX = (-dy * STRENGTH).toFixed(2);
    const rotY = ( dx * STRENGTH).toFixed(2);
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    card.style.boxShadow = `${-dx * 20}px ${dy * 18}px 70px rgba(0,0,0,0.55), 0 0 30px rgba(115,0,10,0.18)`;
  }
  function resetTilt(card) {
    card.style.transform = '';
    card.style.boxShadow = '';
  }
  function attachTilt(card) {
    card.addEventListener('mousemove',  e => applyTilt(card, e), { passive: true });
    card.addEventListener('mouseleave', ()  => resetTilt(card));
    card.addEventListener('touchstart', ()  => resetTilt(card), { passive: true });
  }
  // Attach immediately to any existing cards
  document.querySelectorAll('[data-tilt]').forEach(attachTilt);
  // Watch for new cards added after DOM ready (reveal animations)
  const observer = new MutationObserver(() => {
    document.querySelectorAll('[data-tilt]:not([data-tilt-init])').forEach(card => {
      card.setAttribute('data-tilt-init','');
      attachTilt(card);
    });
  });
  observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  // Mark existing
  document.querySelectorAll('[data-tilt]').forEach(c => c.setAttribute('data-tilt-init',''));
})();

/* ============================================================
   HERO PARALLAX MOUSE TRACKING
   ============================================================ */
(function initHeroParallax() {
  const hero    = document.getElementById('hero');
  if (!hero) return;
  const avatar  = hero.querySelector('.hero-avatar-wrap');
  const nameGrp = hero.querySelector('.hero-name-group');
  const credBar = hero.querySelector('.hero-credential-bar');
  let raf = null;
  let tx = 0, ty = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const dx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2; // -1 to 1
    const dy = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    tx = dx; ty = dy;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  });

  function tick() {
    raf = null;
    if (avatar)  avatar.style.transform  = `translate(${tx * 14}px, ${ty * 9}px)`;
    if (nameGrp) nameGrp.style.transform = `translate(${tx * 7}px, ${ty * 5}px)`;
    if (credBar) credBar.style.transform  = `translate(${tx * 4}px, ${ty * 3}px)`;
  }
})();

/* ============================================================
   ANIMATED STAT COUNTERS
   ============================================================ */
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseFloat(el.dataset.count);
      const suffix  = el.dataset.suffix || '';
      const dur     = 1400; // ms
      const step    = 16;
      const inc     = target / (dur / step);
      let   current = 0;
      const isInt   = Number.isInteger(target);
      const timer   = setInterval(() => {
        current += inc;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = (isInt ? Math.floor(current) : current.toFixed(1)) + suffix;
      }, step);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  els.forEach(el => obs.observe(el));
})();

/* ---- SCROLL PROGRESS BAR ---- */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled  = document.documentElement.scrollTop || document.body.scrollTop;
    const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (maxHeight > 0 ? (scrolled / maxHeight) * 100 : 0) + '%';
  }, { passive: true });
})();

/* ---- CURSOR GLOW ---- */
(function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow || window.matchMedia('(pointer:coarse)').matches) return;
  let mx = 0, my = 0, cx = 0, cy = 0, raf;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    glow.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  function lerp(a, b, t) { return a + (b - a) * t; }
  function tick() {
    cx = lerp(cx, mx, 0.08);
    cy = lerp(cy, my, 0.08);
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    raf = requestAnimationFrame(tick);
  }
  tick();
})();

/* ---- TYPEWRITER EFFECT ---- */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = [
    'Assistant Underwriter',
    'Lloyd\'s Trained Broker',
    'E&S Risk Specialist',
    'Federal Sales Pro',
    'Darla Moore \'25',
    'InsurTech Builder',
  ];
  let pi = 0, ci = 0, deleting = false;
  const SPEED_TYPE  = 65;
  const SPEED_DEL   = 35;
  const PAUSE_FULL  = 2200;
  const PAUSE_EMPTY = 400;

  function tick() {
    const current = phrases[pi];
    if (!deleting) {
      el.textContent = current.substring(0, ci + 1);
      ci++;
      if (ci === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_FULL);
        return;
      }
      setTimeout(tick, SPEED_TYPE);
    } else {
      el.textContent = current.substring(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(tick, PAUSE_EMPTY);
        return;
      }
      setTimeout(tick, SPEED_DEL);
    }
  }
  // Start after hero entrance animation completes
  setTimeout(tick, 1200);
})();

/* ---- SKILL BAR ANIMATION ---- */
function animateBarsIn(container) {
  container.querySelectorAll('.skill-bar-fill').forEach((fill, i) => {
    const target = fill.dataset.width;
    setTimeout(() => {
      fill.style.width = target + '%';
      fill.classList.add('animated');
    }, i * 80);
  });
}
function resetBars(container) {
  container.querySelectorAll('.skill-bar-fill').forEach(fill => {
    fill.style.width = '0%';
    fill.classList.remove('animated');
  });
}

/* ---- CANVAS PARTICLE FIELD ---- */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;
  const N = 35;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() { this.reset(); }
  Particle.prototype.reset = function() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r  = Math.random() * 1.5 + 0.5;
    this.a  = Math.random() * 0.5 + 0.1;
  };
  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(115,0,10,${p.a})`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(115,0,10,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    particles = Array.from({ length: N }, () => new Particle());
    cancelAnimationFrame(animId);
    draw();
  }

  window.addEventListener('resize', () => { resize(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(animId); }
    else { draw(); }
  });
  init();
})();

/* ---- NAVBAR SCROLL + ACTIVE LINKS ---- */
(function initNav() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const bookFloat = document.getElementById('book-float');
  const sections  = document.querySelectorAll('section[id]');
  const links     = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', sy > 40);
    if (bookFloat) bookFloat.classList.toggle('show', sy > 600);
  }, { passive: true });

  hamburger && hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks && navLinks.classList.toggle('open');
  });

  navLinks && navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      hamburger && hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });

  // Active link via IntersectionObserver
  if (sections.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(a => a.classList.remove('active'));
          const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-50% 0px -45% 0px' });
    sections.forEach(s => obs.observe(s));
  }
})();

/* ---- SCROLL REVEAL — Nuclear-proof multi-trigger system ---- */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  function revealInView() {
    const vh = window.innerHeight;
    items.forEach(el => {
      if (!el.classList.contains('visible')) {
        const rect = el.getBoundingClientRect();
        // Reveal if top is within viewport + generous 300px buffer below
        if (rect.top < vh + 300) {
          el.classList.add('visible');
        }
      }
    });
  }

  // Belt, suspenders, AND a backup parachute — multiple trigger points
  revealInView();                             // immediate on script parse
  setTimeout(revealInView, 100);             // after first paint
  setTimeout(revealInView, 400);             // after fonts load
  setTimeout(revealInView, 900);             // after images settle
  window.addEventListener('load', revealInView);             // after all resources
  window.addEventListener('scroll', revealInView, { passive: true });
  window.addEventListener('resize', revealInView, { passive: true });
  window.addEventListener('orientationchange', revealInView);

  // Nuclear fallback: ALL elements visible at 2.5s regardless
  setTimeout(() => items.forEach(el => el.classList.add('visible')), 2500);
})();

/* ---- STAT COUNTER ANIMATION ---- */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const target   = +el.dataset.target;
      const suffix   = el.dataset.suffix || '';
      const duration = 1800;
      let start      = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ---- SKILLS TABS ---- */
(function initSkillsTabs() {
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  if (!tabBtns.length) return;

  // Animate bars in active tab when skills section enters view
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const activePane = document.querySelector('.tab-pane.active');
          if (activePane) animateBarsIn(activePane);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    obs.observe(skillsSection);
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Deactivate all — reset bars
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => {
        p.classList.remove('active');
        p.style.animation = '';
        resetBars(p);
      });

      // Activate selected
      btn.classList.add('active');
      const pane = document.getElementById('tab-' + target);
      if (pane) {
        pane.classList.add('active');
        void pane.offsetWidth;
        pane.style.animation = 'fadeSlideIn 0.4s ease forwards';
        // Stagger bar animation
        setTimeout(() => animateBarsIn(pane), 120);
      }
    });
  });
})();

/* ---- STRIP PHOTO ZOOM (About section personal photos) ---- */
(function initStripPhotos() {
  const strips = document.querySelectorAll('.strip-photo');
  strips.forEach(photo => {
    photo.addEventListener('mouseenter', () => {
      photo.style.borderColor = 'rgba(115,0,10,0.45)';
    });
    photo.addEventListener('mouseleave', () => {
      photo.style.borderColor = '';
    });
  });
})();

/* ---- CERTIFICATIONS VERTICAL SCROLL ---- */
(function initCerts() {
  const col1 = document.getElementById('certs-col-1');
  const col2 = document.getElementById('certs-col-2');
  if (!col1 || !col2) return;

  // SVG icon helpers — white stroke on garnet-navy gradient bg
  const IC = {
    ai:      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    shield:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    anchor:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
    globe:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    truck:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    tree:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 20 2 20"/><line x1="12" y1="20" x2="12" y2="22"/></svg>`,
    chart:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    gear:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    signal:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    lock:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    govt:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`,
    dollar:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    grad:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    book:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    star:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    target:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    linkedin:`<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    code:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    rocket:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  };

  const CERTS = [
    // Tech / AI
    { icon: IC.ai,      name: 'Learning Microsoft 365 Copilot',               issuer: 'Microsoft / LinkedIn Learning' },
    { icon: IC.ai,      name: 'Generative AI Skills for Creative Content',     issuer: 'LinkedIn Learning' },
    { icon: IC.ai,      name: 'Introduction to Prompt Engineering for GenAI',  issuer: 'LinkedIn Learning' },
    { icon: IC.chart,   name: 'Qlik Learning Ready, Set, Go!',                 issuer: 'Qlik Analytics' },
    { icon: IC.gear,    name: 'Salesforce Certified Administrator Prep',        issuer: 'Salesforce / LinkedIn Learning' },
    // Insurance / Professional
    { icon: IC.shield,  name: 'Property & Casualty License',                   issuer: 'South Carolina DOI · Active' },
    { icon: IC.anchor,  name: 'Marine & Property Risk Placement',              issuer: 'Price Forbes / Lloyd\'s of London' },
    { icon: IC.globe,   name: 'Lloyd\'s of London Market Orientation',          issuer: 'LM TOM / Price Forbes' },
    { icon: IC.truck,   name: 'Commercial Trucking Risk (E&S)',                issuer: 'Swamp Fox Agency' },
    { icon: IC.tree,    name: 'Logging & Forestry Risk Specialist',            issuer: 'Swamp Fox / SC Timber Producers Assoc.' },
    { icon: IC.chart,   name: 'FMCSA & CAB Fleet Safety Analysis',             issuer: 'Swamp Fox Agency' },
    { icon: IC.gear,    name: 'Applied Epic Agency Management System',         issuer: 'Applied Systems' },
    { icon: IC.signal,  name: 'Samsara Telematics & Fleet Data',               issuer: 'Samsara' },
    // Tech / Sales
    { icon: IC.lock,    name: 'Federal Cybersecurity & IT Sales',              issuer: 'Carahsoft Technology Corp.' },
    { icon: IC.govt,    name: 'Public Sector Sales — Intel Team',              issuer: 'Carahsoft Technology Corp.' },
    { icon: IC.dollar,  name: 'B2B Pipeline Development',                      issuer: 'Carahsoft Technology Corp.' },
    // Education
    { icon: IC.grad,    name: 'B.S. Risk Management & Insurance',              issuer: 'Darla Moore School of Business — USC' },
    { icon: IC.book,    name: 'Financial Planning & Services',                 issuer: 'University of South Carolina' },
    // Operations
    { icon: IC.star,    name: 'Masters Tournament Operations Staff',           issuer: 'Augusta National Golf Club' },
    { icon: IC.target,  name: 'High-Volume Hospitality — Precision Execution', issuer: 'Augusta National' },
    // LinkedIn Top Skills
    { icon: IC.linkedin,name: 'Underwriting — Top LinkedIn Skill',             issuer: 'LinkedIn Skill Assessment' },
    { icon: IC.linkedin,name: 'Global Risk Placement — Top LinkedIn Skill',    issuer: 'LinkedIn Skill Assessment' },
    { icon: IC.linkedin,name: 'Insurance Brokerage — Top LinkedIn Skill',      issuer: 'LinkedIn Skill Assessment' },
    // Web / Personal
    { icon: IC.code,    name: 'Web Development: HTML / CSS / JavaScript',      issuer: 'Self-Directed / GitHub Projects' },
    { icon: IC.rocket,  name: 'Brand Ambassador — Digital Growth',             issuer: 'SSprinting' },
  ];

  function buildCertCard(cert) {
    const card = document.createElement('div');
    card.className = 'cert-card';
    card.innerHTML = `
      <div class="cert-icon">${cert.icon}</div>
      <div class="cert-info">
        <div class="cert-name">${cert.name}</div>
        <div class="cert-issuer">${cert.issuer}</div>
      </div>`;
    return card;
  }

  const half   = Math.ceil(CERTS.length / 2);
  const group1 = CERTS.slice(0, half);
  const group2 = CERTS.slice(half);

  // Duplicate for seamless infinite loop
  [...group1, ...group1].forEach(c => col1.appendChild(buildCertCard(c)));
  [...group2, ...group2].forEach(c => col2.appendChild(buildCertCard(c)));
})();

/* ---- MAGNETIC BUTTONS ---- */
(function initMagnetic() {
  document.querySelectorAll('.btn-primary, .btn-gcal, .form-submit').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.25;
      const dy   = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ---- CONTACT FORM (Formspree backend) ---- */
// TO ACTIVATE: Replace 'YOUR_FORMSPREE_ID' below with your endpoint from formspree.io/new
// Free plan: 50 submissions/month, instant email delivery. Takes 2 minutes to set up.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORMSPREE_ID';

async function handleSubmit(event) {
  event.preventDefault();
  const btn  = event.target.querySelector('.form-submit');
  const form = event.target;
  const orig = btn.textContent;
  const data = new FormData(form);

  btn.textContent = 'Sending…';
  btn.disabled    = true;

  // Fallback to mailto if Formspree not yet configured
  if (FORMSPREE_ENDPOINT.includes('YOUR_FORMSPREE_ID')) {
    const name    = (document.getElementById('name')    || {}).value || '';
    const email   = (document.getElementById('email')   || {}).value || '';
    const subject = (document.getElementById('subject') || {}).value || 'Website Inquiry';
    const message = (document.getElementById('message') || {}).value || '';
    const mailto  = `mailto:bensachwitz@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('From: ' + name.trim() + ' <' + email + '>\n\n' + message)}`;
    setTimeout(() => {
      window.location.href = mailto;
      btn.textContent      = '✓ Opening Mail…';
      btn.style.background = '#16a34a';
      setTimeout(() => {
        btn.textContent      = orig;
        btn.style.background = '';
        btn.disabled         = false;
        form.reset();
      }, 3000);
    }, 500);
    return;
  }

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method:  'POST',
      body:    data,
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      btn.textContent      = '✓ Message Sent';
      btn.style.background = '#16a34a';
      form.reset();
      setTimeout(() => {
        btn.textContent      = orig;
        btn.style.background = '';
        btn.disabled         = false;
      }, 4000);
    } else {
      throw new Error('Network error');
    }
  } catch {
    btn.textContent      = '✗ Try Again';
    btn.style.background = '#dc2626';
    setTimeout(() => {
      btn.textContent      = orig;
      btn.style.background = '';
      btn.disabled         = false;
    }, 3000);
  }
}

/* ---- SMOOTH SCROLL (fallback for older browsers) ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ---- TIMELINE HOVER DEPTH ---- */
(function initTimelineHover() {
  document.querySelectorAll('.tl-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      document.querySelectorAll('.tl-item').forEach(i => i.classList.add('dimmed'));
      item.classList.remove('dimmed');
      item.classList.add('focused');
    });
    item.addEventListener('mouseleave', () => {
      document.querySelectorAll('.tl-item').forEach(i => {
        i.classList.remove('dimmed', 'focused');
      });
    });
  });
})();

/* ---- PROJECT CARD TILT ---- */
(function initCardTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -6;
      const rotateY = ((x - cx) / cx) *  6;
      card.style.transform    = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      card.style.transition   = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.4s ease';
    });
  });
})();

/* ---- SECTION PARALLAX BACKGROUNDS ---- */
(function initParallax() {
  const sections = document.querySelectorAll('#about, #timeline, #skills, #projects, #certifications, #schedule, #contact, .edu-section');
  let ticking = false;
  function update() {
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const vh   = window.innerHeight;
      // Only process sections near viewport
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const progress = (vh - rect.top) / (vh + rect.height); // 0 at entry, 1 at exit
      const shift    = (progress - 0.5) * 40; // max ±20px
      sec.style.backgroundPositionY = `calc(50% + ${shift}px)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
})();

/* ---- ACTIVE NAV HIGHLIGHT (section tracking) ---- */
(function initActiveNav() {
  const sectionIds = ['hero','about','timeline','education','skills','projects','certifications','schedule','contact'];
  const links = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (window.scrollY + 100 >= el.offsetTop) current = id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
})();

/* ---- RIPPLE EFFECT on buttons ---- */
(function initRipple() {
  function ripple(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;
    const el   = document.createElement('span');
    el.style.cssText = `
      position:absolute;border-radius:50%;pointer-events:none;z-index:10;
      width:${size}px;height:${size}px;left:${x}px;top:${y}px;
      background:rgba(255,255,255,0.14);
      transform:scale(0);animation:rippleAnim 0.6s ease forwards;
    `;
    btn.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }
  document.querySelectorAll('.btn-primary,.btn-outline,.btn-book,.btn-gcal,.form-submit,.book-float-btn').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', ripple);
  });
})();

/* ---- STAGGERED GRID REVEALS ---- */
(function initStaggerChildren() {
  // Project cards stagger in sequence when their grid enters view
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.project-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add('visible'), i * 90);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  obs.observe(grid);
})();

/* ---- COUNTER (general-purpose, used by .stat-number[data-target]) ---- */
// initCounters() above handles .stat-number[data-target]. No dead code here.

/* ---- SECTION PROGRESS — dots in nav ---- */
(function initSectionDots() {
  const ids = ['hero','about','timeline','education','skills','projects','certifications','schedule','contact'];
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  let last = '';
  window.addEventListener('scroll', () => {
    let current = '';
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY + window.innerHeight / 3 >= el.offsetTop) current = id;
    });
    if (current === last) return;
    last = current;
    links.forEach(a => {
      const matches = a.getAttribute('href') === '#' + current;
      a.classList.toggle('active', matches);
    });
  }, { passive: true });
})();

/* ---- TIMELINE ITEM GLOW on entry ---- */
(function initTimelineGlow() {
  document.querySelectorAll('.tl-item').forEach(item => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          item.querySelector('.tl-dot')?.classList.add('tl-dot-glow');
          obs.unobserve(item);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(item);
  });
})();

/* ---- ABOUT SECTION hover glow on edu badge ---- */
(function initEduBadge() {
  const badge = document.querySelector('.about-edu-badge');
  if (!badge) return;
  badge.addEventListener('mouseenter', () => {
    badge.style.background = 'linear-gradient(135deg,rgba(115,0,10,.16),rgba(0,33,71,.20))';
  });
  badge.addEventListener('mouseleave', () => {
    badge.style.background = '';
  });
})();
