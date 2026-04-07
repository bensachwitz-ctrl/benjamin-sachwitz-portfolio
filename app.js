/* ============================================================
   BENJAMIN SACHWITZ — app.js
   Canvas particles | Scroll effects | Gallery lightbox |
   Cert scroller | Stat counters | Form handler | Nav
   ============================================================ */

/* ---- CANVAS PARTICLE FIELD ---- */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;
  const N = 60;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.reset();
  }
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
    navbar.classList.toggle('scrolled', sy > 40);
    if (bookFloat) bookFloat.classList.toggle('show', sy > 600);
  }, { passive: true });

  hamburger && hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks && navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });

  // Active link via IntersectionObserver
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
})();

/* ---- SCROLL REVEAL ---- */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => obs.observe(el));
})();

/* ---- STAT COUNTER ANIMATION ---- */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      let start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ---- GALLERY LIGHTBOX ---- */
(function initGallery() {
  const items    = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbClose  = document.getElementById('lb-close');
  const lbPrev   = document.getElementById('lb-prev');
  const lbNext   = document.getElementById('lb-next');
  if (!lightbox || !items.length) return;

  let current = 0;

  function getSrcs() {
    return items.map(el => el.dataset.src || el.querySelector('img').src);
  }

  function open(idx) {
    current = idx;
    const srcs = getSrcs();
    lbImg.src = srcs[current];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  function prev() {
    const srcs = getSrcs();
    current = (current - 1 + srcs.length) % srcs.length;
    lbImg.src = srcs[current];
  }

  function next() {
    const srcs = getSrcs();
    current = (current + 1) % srcs.length;
    lbImg.src = srcs[current];
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
  });

  lbClose && lbClose.addEventListener('click', close);
  lbPrev  && lbPrev.addEventListener('click', prev);
  lbNext  && lbNext.addEventListener('click', next);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });
})();

/* ---- CERTIFICATIONS VERTICAL SCROLL ---- */
(function initCerts() {
  const col1 = document.getElementById('certs-col-1');
  const col2 = document.getElementById('certs-col-2');
  if (!col1 || !col2) return;

  const CERTS = [
    // Verified from LinkedIn profile
    { icon: '🤖', name: 'Learning Microsoft 365 Copilot', issuer: 'Microsoft / LinkedIn Learning' },
    { icon: '✨', name: 'Generative AI Skills for Creative Content', issuer: 'LinkedIn Learning' },
    { icon: '📊', name: 'Qlik Learning Ready, Set, Go!', issuer: 'Qlik' },
    { icon: '☁️', name: 'Cert Prep: Salesforce Certified Administrator', issuer: 'Salesforce / LinkedIn Learning' },
    { icon: '💡', name: 'Introduction to Prompt Engineering for Generative AI', issuer: 'LinkedIn Learning' },
    // Professional / industry
    { icon: '🛡️', name: 'Property & Casualty License', issuer: 'South Carolina DOI' },
    { icon: '⚓', name: 'Marine & Property Risk Placement', issuer: 'Price Forbes / Lloyd\'s of London' },
    { icon: '🌐', name: 'Lloyd\'s of London Market Orientation', issuer: 'LM TOM / Price Forbes' },
    { icon: '🚛', name: 'Commercial Trucking Risk (E&S)', issuer: 'Swamp Fox Agency' },
    { icon: '🌲', name: 'Logging & Forestry Risk Specialist', issuer: 'Swamp Fox / SC Timber Producers Assoc.' },
    { icon: '📋', name: 'FMCSA & CAB Fleet Safety Analysis', issuer: 'Swamp Fox Agency' },
    { icon: '⚙️', name: 'Applied Epic Agency Management System', issuer: 'Applied Systems' },
    { icon: '📡', name: 'Samsara Telematics & Fleet Data', issuer: 'Samsara' },
    // Tech / sales
    { icon: '🔐', name: 'Federal Cybersecurity & IT Sales', issuer: 'Carahsoft Technology Corp.' },
    { icon: '🏛️', name: 'Public Sector Sales — Intel Team', issuer: 'Carahsoft Technology Corp.' },
    { icon: '📈', name: 'B2B Pipeline Development', issuer: 'Carahsoft' },
    // Education
    { icon: '🎓', name: 'B.S. Risk Management & Insurance', issuer: 'Darla Moore School of Business — USC' },
    { icon: '📐', name: 'Financial Planning & Services', issuer: 'University of South Carolina' },
    // Operations
    { icon: '🏆', name: 'Masters Tournament Operations Staff', issuer: 'Augusta National Golf Club' },
    { icon: '🎯', name: 'High-Volume Hospitality — Precision Execution', issuer: 'Augusta National' },
    // Additional professional
    { icon: '🔗', name: 'Underwriting — Top LinkedIn Skill', issuer: 'LinkedIn Skill Assessment' },
    { icon: '🌍', name: 'Global Risk Placement — Top LinkedIn Skill', issuer: 'LinkedIn Skill Assessment' },
    { icon: '📦', name: 'Insurance Brokerage — Top LinkedIn Skill', issuer: 'LinkedIn Skill Assessment' },
    { icon: '💻', name: 'Web Development: HTML / CSS / JavaScript', issuer: 'Self-Directed / GitHub Projects' },
    { icon: '🚀', name: 'Brand Ambassador — Digital Growth', issuer: 'SSprinting' },
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

  // Duplicate for seamless loop
  [...group1, ...group1].forEach(c => col1.appendChild(buildCertCard(c)));
  [...group2, ...group2].forEach(c => col2.appendChild(buildCertCard(c)));
})();

/* ---- MAGNETIC BUTTONS ---- */
(function initMagnetic() {
  document.querySelectorAll('.btn-primary, .btn-gcal, .form-submit').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
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
  const btn    = event.target.querySelector('.form-submit');
  const form   = event.target;
  const orig   = btn.textContent;
  const data   = new FormData(form);

  btn.textContent = 'Sending…';
  btn.disabled    = true;

  // If Formspree not yet configured, fall back to mailto
  if (FORMSPREE_ENDPOINT.includes('YOUR_FORMSPREE_ID')) {
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value;
    const subject = document.getElementById('subject').value || 'Website Inquiry';
    const message = document.getElementById('message').value;
    const mailto  = `mailto:bfsachwitz@icloud.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('From: ' + name + ' <' + email + '>\n\n' + message)}`;
    setTimeout(() => {
      window.location.href = mailto;
      btn.textContent = '✓ Opening Mail…';
      btn.style.background = '#16a34a';
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; form.reset(); }, 3000);
    }, 500);
    return;
  }

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      btn.textContent = '✓ Message Sent';
      btn.style.background = '#16a34a';
      form.reset();
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 4000);
    } else {
      throw new Error('Network error');
    }
  } catch {
    btn.textContent = '✗ Try Again';
    btn.style.background = '#dc2626';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
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
