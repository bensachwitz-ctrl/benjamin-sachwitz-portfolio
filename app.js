/* =============================================================
   BENJAMIN SACHWITZ — PORTFOLIO APP.JS  (Sidebar Edition 2026)
   ============================================================= */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     1. CERTIFICATIONS DATA
  ───────────────────────────────────────────── */
  const CERTS = [
    { icon: 'shield',    label: 'P&C Licensed',            sub: 'South Carolina DOI' },
    { icon: 'globe',     label: 'Lloyd\'s Market',          sub: 'London Placement' },
    { icon: 'chart',     label: 'Loss Control Innovation', sub: 'Swamp Fox Agency' },
    { icon: 'truck',     label: 'Commercial Trucking',     sub: 'Heavy Haul Specialist' },
    { icon: 'tree',      label: 'Logging Risk',            sub: 'Timber Operations' },
    { icon: 'anchor',    label: 'Marine Insurance',        sub: 'Inland & Coastal' },
    { icon: 'gavel',     label: 'Surety Bonds',            sub: 'Contract & Commercial' },
    { icon: 'building',  label: 'Commercial Property',     sub: 'Risk Assessment' },
    { icon: 'code',      label: 'GitHub Development',      sub: 'AI-Driven Workflows' },
    { icon: 'federal',   label: 'Federal Tech Sales',      sub: 'Carahsoft · DC' },
    { icon: 'usc',       label: 'Moore School Graduate',   sub: 'Darla Moore · USC' },
    { icon: 'masters',   label: 'Augusta National',        sub: 'Masters Tournament Ops' },
  ];

  const IC = {
    shield:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    globe:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    chart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    truck:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    tree:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 14l-5-8-5 8h3v6h4v-6z"/></svg>`,
    anchor:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 15H2a10 10 0 0 0 20 0h-3"/><line x1="5" y1="8" x2="19" y2="8"/></svg>`,
    gavel:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3l7 7-1.5 1.5-7-7L14 3z"/><path d="M3 14l7 7 1.5-1.5-7-7L3 14z"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    building: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="2" width="18" height="20"/><line x1="9" y1="22" x2="9" y2="12"/><rect x="9" y="12" width="6" height="10"/><rect x="7" y="6" width="3" height="3"/><rect x="14" y="6" width="3" height="3"/></svg>`,
    code:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    federal:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="10" width="20" height="11" rx="1"/><path d="M12 2L2 7h20L12 2z"/><line x1="7" y1="10" x2="7" y2="21"/><line x1="12" y1="10" x2="12" y2="21"/><line x1="17" y1="10" x2="17" y2="21"/></svg>`,
    usc:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 10v6M2 10l10-7 10 7"/><rect x="6" y="10" width="4" height="8"/><rect x="14" y="10" width="4" height="8"/><rect x="10" y="10" width="4" height="8"/><line x1="2" y1="18" x2="22" y2="18"/></svg>`,
    masters:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3"/><path d="M3 21v-2a8 8 0 0 1 18 0v2"/><path d="M12 11v10M8 21h8"/></svg>`,
  };

  /* ─────────────────────────────────────────────
     2. SIDEBAR TAB SWITCHING
  ───────────────────────────────────────────── */
  const tabs    = document.querySelectorAll('.sb-tab');
  const panels  = document.querySelectorAll('.panel');
  let currentPanel = 'home';

  function switchPanel(targetPanel) {
    if (targetPanel === currentPanel) return;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.panel === targetPanel));
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === targetPanel));
    currentPanel = targetPanel;

    // Panel-specific inits
    if (targetPanel === 'skills')       initSkillBars();
    if (targetPanel === 'credentials')  initCertsPanel();
    if (targetPanel === 'home')         restartTypewriter();

    // Move nav indicator
    const activeTab = document.querySelector('.sb-tab.active');
    moveIndicator(activeTab);

    // Close mobile sidebar
    if (window.innerWidth < 900) closeMobileSidebar();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchPanel(tab.dataset.panel));
  });

  // data-goto buttons in home panel
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.goto));
  });

  /* ─────────────────────────────────────────────
     3. MOBILE SIDEBAR TOGGLE
  ───────────────────────────────────────────── */
  const sidebar   = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('sb-overlay');

  function openMobileSidebar() {
    sidebar && sidebar.classList.add('open');
    overlay && overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileSidebar() {
    sidebar && sidebar.classList.remove('open');
    overlay && overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger && hamburger.addEventListener('click', () => {
    sidebar && sidebar.classList.contains('open') ? closeMobileSidebar() : openMobileSidebar();
  });
  overlay && overlay.addEventListener('click', closeMobileSidebar);

  /* ─────────────────────────────────────────────
     4. PHOTO CAROUSEL (About Panel)
  ───────────────────────────────────────────── */
  const track    = document.getElementById('carousel-track');
  const dotsWrap = document.getElementById('car-dots');
  const prevBtn  = document.getElementById('car-prev');
  const nextBtn  = document.getElementById('car-next');

  if (track) {
    const slides = track.querySelectorAll('.car-slide');
    let current  = 0;
    let autoTimer;

    // Build dots
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'car-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', () => { goTo(i); startAuto(); });
      dotsWrap && dotsWrap.appendChild(d);
    });

    function goTo(idx) {
      slides[current].classList.remove('active');
      const dots = dotsWrap ? dotsWrap.querySelectorAll('.car-dot') : [];
      if (dots[current]) dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    // Init first slide
    if (slides[0]) slides[0].classList.add('active');
    startAuto();

    prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', startAuto);

    // Touch swipe
    let touchX = 0;
    track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) { dx < 0 ? goTo(current + 1) : goTo(current - 1); startAuto(); }
    });
  }

  /* ─────────────────────────────────────────────
     5. SKILL BARS ANIMATION
  ───────────────────────────────────────────── */
  let skillsInited = false;

  function initSkillBars() {
    if (skillsInited) return;
    skillsInited = true;
    setTimeout(() => {
      document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        const pct = bar.dataset.pct || '0';
        bar.style.width = pct + '%';
      });
    }, 120);
  }

  // Skills sub-tabs
  const skTabs  = document.querySelectorAll('.sk-tab');
  const skPanes = document.querySelectorAll('.sk-pane');

  skTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skTabs.forEach(t => t.classList.remove('active'));
      skPanes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const pane = document.querySelector('.sk-pane[data-sk="' + tab.dataset.sk + '"]');
      pane && pane.classList.add('active');
    });
  });

  /* ─────────────────────────────────────────────
     6. CERTIFICATIONS PANEL — Scroll Columns
  ───────────────────────────────────────────── */
  let certsInited = false;

  function initCertsPanel() {
    if (certsInited) return;
    certsInited = true;

    const col1 = document.getElementById('certs-col-1');
    const col2 = document.getElementById('certs-col-2');
    if (!col1 || !col2) return;

    const half = Math.ceil(CERTS.length / 2);

    function buildCard(c) {
      return `<div class="cert-card">
        <span class="cert-icon">${IC[c.icon] || IC.shield}</span>
        <div class="cert-info">
          <div class="cert-label">${c.label}</div>
          <div class="cert-sub">${c.sub}</div>
        </div>
      </div>`;
    }

    const col1Cards = CERTS.slice(0, half).map(buildCard).join('');
    const col2Cards = CERTS.slice(half).map(buildCard).join('');

    // Double for seamless CSS animation loop
    col1.innerHTML = col1Cards + col1Cards;
    col2.innerHTML = col2Cards + col2Cards;
  }

  /* ─────────────────────────────────────────────
     7. TYPEWRITER EFFECT (Home Panel)
  ───────────────────────────────────────────── */
  const phrases = [
    'Insurance Professional.',
    'Lloyd\'s Market Specialist.',
    'Risk Technology Innovator.',
    'Commercial Lines Expert.',
    'Loss Control Strategist.',
  ];

  const twEl   = document.getElementById('typewriter');
  let twPhrase = 0;
  let twChar   = 0;
  let twDel    = false;
  let twTimer;

  function typeStep() {
    if (!twEl) return;
    const phrase = phrases[twPhrase];

    if (!twDel) {
      twEl.textContent = phrase.slice(0, ++twChar);
      if (twChar === phrase.length) {
        twDel = true;
        twTimer = setTimeout(typeStep, 2200);
        return;
      }
    } else {
      twEl.textContent = phrase.slice(0, --twChar);
      if (twChar === 0) {
        twDel = false;
        twPhrase = (twPhrase + 1) % phrases.length;
      }
    }
    twTimer = setTimeout(typeStep, twDel ? 45 : 80);
  }

  function restartTypewriter() {
    clearTimeout(twTimer);
    twChar = 0; twDel = false;
    if (twEl) twEl.textContent = '';
    typeStep();
  }

  restartTypewriter();

  /* ─────────────────────────────────────────────
     8. PARTICLE CANVAS (Home Panel Hero)
  ───────────────────────────────────────────── */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resizeCanvas() {
      W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
      H = canvas.height = canvas.offsetHeight || 500;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(initial) {
        this.x  = Math.random() * W;
        this.y  = initial ? Math.random() * H : (Math.random() > 0.5 ? -5 : H + 5);
        this.r  = Math.random() * 1.5 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.a  = Math.random() * 0.55 + 0.15;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${this.a})`;
        ctx.fill();
      }
    }

    function initParticles() {
      resizeCanvas();
      const count = Math.min(Math.floor((W * H) / 7000), 130);
      particles = Array.from({ length: count }, () => new Particle());
    }

    function drawLines() {
      const MAX_DIST = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(96,165,250,${0.13 * (1 - d / MAX_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animLoop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animLoop);
    }

    initParticles();
    animLoop();
    window.addEventListener('resize', initParticles);
  }

  /* ─────────────────────────────────────────────
     9. 3D CARD TILT
  ───────────────────────────────────────────── */
  function applyTilt(card) {
    card.style.transition = 'transform 0.15s ease';
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = e.clientX - r.left - r.width  / 2;
      const y  = e.clientY - r.top  - r.height / 2;
      const rx = (-y / r.height) * 10;
      const ry = (x  / r.width)  * 10;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  document.querySelectorAll('[data-tilt]').forEach(applyTilt);

  /* ─────────────────────────────────────────────
     10. RIPPLE EFFECT ON BUTTONS
  ───────────────────────────────────────────── */
  function addRipple(el) {
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    el.addEventListener('click', function (e) {
      const r   = el.getBoundingClientRect();
      const rip = document.createElement('span');
      const size = Math.max(r.width, r.height);
      rip.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'background:rgba(255,255,255,0.25)',
        'pointer-events:none',
        'animation:rippleAnim 0.65s ease-out forwards',
        `width:${size}px`,
        `height:${size}px`,
        `left:${e.clientX - r.left - size / 2}px`,
        `top:${e.clientY - r.top  - size / 2}px`,
      ].join(';');
      el.appendChild(rip);
      setTimeout(() => rip.remove(), 700);
    });
  }

  // Inject ripple keyframes once
  if (!document.getElementById('ripple-style')) {
    const st = document.createElement('style');
    st.id = 'ripple-style';
    st.textContent = '@keyframes rippleAnim{from{transform:scale(0);opacity:1}to{transform:scale(2.5);opacity:0}}';
    document.head.appendChild(st);
  }

  document.querySelectorAll('.btn-primary, .btn-ghost, .sb-tab, .booking-topic').forEach(addRipple);

  /* ─────────────────────────────────────────────
     11. CONTACT FORM — mailto fallback
  ───────────────────────────────────────────── */
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name    = (contactForm.querySelector('[name="name"]')?.value    || '').trim();
      const email   = (contactForm.querySelector('[name="email"]')?.value   || '').trim();
      const subject = (contactForm.querySelector('[name="subject"]')?.value || 'Portfolio Inquiry').trim();
      const message = (contactForm.querySelector('[name="message"]')?.value || '').trim();

      const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
      const subj = encodeURIComponent(subject);
      window.location.href = `mailto:bensachwitz@gmail.com?subject=${subj}&body=${body}`;

      if (formStatus) {
        formStatus.textContent = '✓ Opening your email client…';
        formStatus.style.color = '#60a5fa';
        setTimeout(() => { formStatus.textContent = ''; }, 5000);
      }
    });
  }

  /* ─────────────────────────────────────────────
     12. SCROLL PROGRESS BAR (per active panel)
  ───────────────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');

  if (progressBar) {
    function updateProgress() {
      const activePanel = document.querySelector('.panel.active');
      if (!activePanel) return;
      const { scrollTop, scrollHeight, clientHeight } = activePanel;
      const pct = scrollHeight <= clientHeight ? 100 : (scrollTop / (scrollHeight - clientHeight)) * 100;
      progressBar.style.width = Math.min(pct, 100) + '%';
    }
    panels.forEach(p => p.addEventListener('scroll', updateProgress, { passive: true }));
  }

  /* ─────────────────────────────────────────────
     13. CAREER CARD IMAGE PARALLAX ON HOVER
  ───────────────────────────────────────────── */
  document.querySelectorAll('.career-card').forEach(card => {
    const img = card.querySelector('.cc-img');
    if (!img) return;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top)  / r.height;
      img.style.backgroundPosition = `${50 + (x - 0.5) * 8}% ${50 + (y - 0.5) * 8}%`;
    });
    card.addEventListener('mouseleave', () => {
      img.style.backgroundPosition = 'center center';
    });
  });

  /* ─────────────────────────────────────────────
     14. SMOOTH NAV INDICATOR PILL
  ───────────────────────────────────────────── */
  const navIndicator = document.getElementById('nav-indicator');

  function moveIndicator(activeTab) {
    if (!navIndicator || !activeTab) return;
    const nav = activeTab.closest('nav');
    if (!nav) return;
    const tabRect = activeTab.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    navIndicator.style.top    = (tabRect.top - navRect.top + nav.scrollTop) + 'px';
    navIndicator.style.height = tabRect.height + 'px';
    navIndicator.style.opacity = '1';
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => moveIndicator(tab));
  });

  requestAnimationFrame(() => {
    const activeTab = document.querySelector('.sb-tab.active');
    moveIndicator(activeTab);
  });

  /* ─────────────────────────────────────────────
     15. KEYBOARD NAVIGATION (Arrow Keys)
  ───────────────────────────────────────────── */
  const panelOrder = ['home', 'about', 'career', 'education', 'skills', 'portfolio', 'credentials', 'contact'];

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const idx = panelOrder.indexOf(currentPanel);
      if (idx < panelOrder.length - 1) switchPanel(panelOrder[idx + 1]);
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const idx = panelOrder.indexOf(currentPanel);
      if (idx > 0) switchPanel(panelOrder[idx - 1]);
    }
    if (e.key === 'Escape' && window.innerWidth < 900) closeMobileSidebar();
  });

  /* ─────────────────────────────────────────────
     16. PRELOAD CREDENTIALS WHEN IDLE
  ───────────────────────────────────────────── */
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initCertsPanel);
  } else {
    setTimeout(initCertsPanel, 1500);
  }

})();
