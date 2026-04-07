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

  const CERTS = [
    // Tech / AI
    { icon: '🤖', name: 'Learning Microsoft 365 Copilot',                  issuer: 'Microsoft / LinkedIn Learning' },
    { icon: '✨', name: 'Generative AI Skills for Creative Content',        issuer: 'LinkedIn Learning' },
    { icon: '💡', name: 'Introduction to Prompt Engineering for GenAI',     issuer: 'LinkedIn Learning' },
    { icon: '📊', name: 'Qlik Learning Ready, Set, Go!',                    issuer: 'Qlik' },
    { icon: '☁️', name: 'Cert Prep: Salesforce Certified Administrator',    issuer: 'Salesforce / LinkedIn Learning' },
    // Insurance / Professional
    { icon: '🛡️', name: 'Property & Casualty License',                     issuer: 'South Carolina DOI' },
    { icon: '⚓', name: 'Marine & Property Risk Placement',                  issuer: 'Price Forbes / Lloyd\'s of London' },
    { icon: '🌐', name: 'Lloyd\'s of London Market Orientation',             issuer: 'LM TOM / Price Forbes' },
    { icon: '🚛', name: 'Commercial Trucking Risk (E&S)',                   issuer: 'Swamp Fox Agency' },
    { icon: '🌲', name: 'Logging & Forestry Risk Specialist',               issuer: 'Swamp Fox / SC Timber Producers Assoc.' },
    { icon: '📋', name: 'FMCSA & CAB Fleet Safety Analysis',                issuer: 'Swamp Fox Agency' },
    { icon: '⚙️', name: 'Applied Epic Agency Management System',            issuer: 'Applied Systems' },
    { icon: '📡', name: 'Samsara Telematics & Fleet Data',                  issuer: 'Samsara' },
    // Tech / Sales
    { icon: '🔐', name: 'Federal Cybersecurity & IT Sales',                 issuer: 'Carahsoft Technology Corp.' },
    { icon: '🏛️', name: 'Public Sector Sales — Intel Team',                 issuer: 'Carahsoft Technology Corp.' },
    { icon: '📈', name: 'B2B Pipeline Development',                         issuer: 'Carahsoft' },
    // Education
    { icon: '🎓', name: 'B.S. Risk Management & Insurance',                 issuer: 'Darla Moore School of Business — USC' },
    { icon: '📐', name: 'Financial Planning & Services',                    issuer: 'University of South Carolina' },
    // Operations
    { icon: '🏆', name: 'Masters Tournament Operations Staff',              issuer: 'Augusta National Golf Club' },
    { icon: '🎯', name: 'High-Volume Hospitality — Precision Execution',    issuer: 'Augusta National' },
    // LinkedIn Top Skills
    { icon: '🔗', name: 'Underwriting — Top LinkedIn Skill',                issuer: 'LinkedIn Skill Assessment' },
    { icon: '🌍', name: 'Global Risk Placement — Top LinkedIn Skill',       issuer: 'LinkedIn Skill Assessment' },
    { icon: '📦', name: 'Insurance Brokerage — Top LinkedIn Skill',         issuer: 'LinkedIn Skill Assessment' },
    // Web / Personal
    { icon: '💻', name: 'Web Development: HTML / CSS / JavaScript',         issuer: 'Self-Directed / GitHub Projects' },
    { icon: '🚀', name: 'Brand Ambassador — Digital Growth',                issuer: 'SSprinting' },
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

/* ---- PILL TOOLTIP ON HOVER ---- */
(function initPillHighlight() {
  document.querySelectorAll('.pill-hot').forEach(pill => {
    pill.title = 'Core expertise area';
  });
})();

/* ---- SECTION ENTRY GLOW ---- */
(function initSectionGlow() {
  const tl = document.querySelectorAll('.tl-item');
  if (!tl.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('tl-item-glow');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  tl.forEach(el => obs.observe(el));
})();
