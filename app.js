

/* ===== app.js - shared chrome + arcade (extracted verbatim) ===== */

(function(){
  'use strict';

  /* === SINGLE-VERSION SITE - v3.4.1 ===
     The Underwriter/Builder brains toggle is retired. The site is now ONE
     unified version for Ben Sachwitz: an assistant underwriter who also
     builds (Bar Crawl Golf, My Daily Tool, Greek Stack). data-mode stays
     pinned to "underwriter" so the existing mode-scoped CSS keeps serving
     the merged presentation without any toggle UI. */
  try { document.documentElement.setAttribute('data-mode', 'underwriter'); } catch(_) {}

  /* === SCROLL TO TOP ON LOAD === */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  // If URL has no hash, force top on load
  if (!window.location.hash) {
    window.scrollTo(0, 0);
    window.addEventListener('load', () => window.scrollTo(0, 0), { once: true });
  }

  /* === LOADER === */
  const loader = document.getElementById('loader');
  document.body.style.overflow = 'hidden';
  let loaderHidden = false;
  function hideLoader() {
    if (loaderHidden || !loader) return;
    loaderHidden = true;
    loader.classList.add('hide');
    document.body.style.overflow = '';
    // Wait out the clip-path wipe (.9s) before pulling it from the layout.
    setTimeout(() => { if (loader) loader.style.display = 'none'; }, 1000);
  }
  // Let the cinematic intro play to its beat, then wipe away. Reduced-motion
  // skips the dwell so the content shows almost instantly.
  const _reduceMo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const _introDwell = _reduceMo ? 120 : 600;
  if (document.readyState === 'complete') setTimeout(hideLoader, _introDwell);
  else window.addEventListener('load', () => setTimeout(hideLoader, _introDwell));
  // FAILSAFE: never let the loader trap the user - hard cap regardless of load state
  setTimeout(hideLoader, 2100);

  /* === NAV SCROLL === */
  const nav = document.getElementById('nav');
  const scrollProg = document.getElementById('scrollProg');
  const bookFloat = document.getElementById('bookFloat');
  const heroEl = document.getElementById('top');

  function onScroll(){
    const y = window.scrollY;
    if (y > 40) { nav.classList.remove('nav-hero'); nav.classList.add('nav-scrolled'); }
    else { nav.classList.add('nav-hero'); nav.classList.remove('nav-scrolled'); }
    // Flag the page as scrolled so the fixed mode-toggle can hide on mobile
    // instead of floating over the hero/intro copy as the page scrolls under it.
    document.body.classList.toggle('page-scrolled', y > 40);
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    scrollProg.style.width = docH > 0 ? (y / docH * 100) + '%' : '0%';
    const heroH = heroEl ? heroEl.offsetHeight : window.innerHeight;
    if (bookFloat) bookFloat.classList.toggle('show', y > heroH * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* === MOBILE MENU === */
  const hb = document.getElementById('hb');
  const mmenu = document.getElementById('mmenu');
  if (hb && mmenu) {
    hb.addEventListener('click', () => {
      hb.classList.toggle('open');
      mmenu.classList.toggle('open');
      hb.setAttribute('aria-expanded', String(mmenu.classList.contains('open')));
    });
    mmenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hb.classList.remove('open');
        mmenu.classList.remove('open');
        hb.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* === NAV ACTIVE STATE === */
  (function initNavActive() {
    const normalizePath = (value) => {
      const raw = (value || '/').split('#')[0].split('?')[0];
      return (raw.replace(/\.html$/i, '').replace(/\/+$/, '') || '/');
    };
    const path = normalizePath(window.location.pathname);
    const links = document.querySelectorAll('.nlink[data-nav], #mmenu a.mlink');
    if (!links.length) return;
    const setActive = (key) => {
      links.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === key));
    };

    // Subpages use the URL as the source of truth. This keeps the active
    // indicator correct before the page has any scrollable content.
    if (path !== '/') {
      links.forEach((link) => {
        link.classList.toggle('is-active', normalizePath(link.getAttribute('href')) === path);
      });
      return;
    }

    // The home page maps top-level nav labels to its long-form chapters.
    const navMap = {
      about: '#about',
      career: '#career',
      projects: '#work',
      apps: '#apps',
      arcade: '#arcade'
    };
    const sections = Object.entries(navMap)
      .map(([key, selector]) => ({ key, el: document.querySelector(selector) }))
      .filter(({ el }) => el);
    const spy = () => {
      const y = window.scrollY + 120;
      let active = null;
      for (const section of sections) {
        if (section.el.offsetTop <= y) active = section.key;
      }
      setActive(active);
    };
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  })();

  document.querySelectorAll('[data-page-tabs]').forEach((tabbar) => {
    const tabs = Array.from(tabbar.querySelectorAll('[data-page-tab]'));
    const sections = tabs.map((tab) => {
      const id = (tab.getAttribute('href') || '').slice(1);
      return { tab, section: id ? document.getElementById(id) : null };
    }).filter(({ section }) => section);
    if (!sections.length) return;
    const update = () => {
      const y = window.scrollY + 180;
      let active = sections[0];
      sections.forEach((item) => {
        if (item.section.getBoundingClientRect().top + window.scrollY <= y) active = item;
      });
      sections.forEach(({ tab }) => {
        const isActive = tab === active.tab;
        tab.classList.toggle('is-active', isActive);
        if (isActive) tab.setAttribute('aria-current', 'location');
        else tab.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  });

  /* === SMOOTH SCROLL === */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const id = this.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });

  /* === SCROLL REVEAL === */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .tl-row').forEach(el => {
    if (!el.classList.contains('in')) io.observe(el);
  });

  /* HARD FAILSAFE: After 3 seconds any reveal element still hidden gets force-shown.
     This protects titles and content if IntersectionObserver fires too late, JS errors,
     or the user lands deep-linked at a section the observer hasn't caught up to yet. */
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.in), .reveal-left:not(.in), .reveal-right:not(.in)').forEach(el => {
      el.classList.add('in');
    });
  }, 3000);

  /* INSTANT-SHOW: Anything already in view at page load reveals immediately (no scroll required). */
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
        el.classList.add('in');
      }
    });
  });

  /* === SECTION TITLES ===
     Keep section headings readable on first paint. The shared reveal transition
     provides motion without clipping or delaying the text while scrolling. */
  (function setupTitleTypewriterV2() {
    return;
  })();

  /* OLD typewriter (innerHTML mutation) - kept disabled below for reference */
  (function setupTitleTypewriter_DISABLED() {
    return; // disabled in favor of CSS clip-path version above
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const titles = document.querySelectorAll('.display-h');
    if (!titles.length || prefersReduced) return;

    titles.forEach(title => {
      // Snapshot the title structure into segments preserving <em> / <br>.
      const segments = [];
      [...title.childNodes].forEach(n => {
        if (n.nodeType === Node.TEXT_NODE) {
          segments.push({type: 'text', text: n.textContent});
        } else if (n.tagName === 'EM') {
          segments.push({type: 'em', text: n.textContent, className: n.getAttribute('class') || ''});
        } else if (n.tagName === 'BR') {
          segments.push({type: 'br'});
        } else if (n.nodeType === Node.ELEMENT_NODE) {
          // Any other inline span - preserve as-is
          segments.push({type: 'html', html: n.outerHTML});
        }
      });
      // Skip empty / decorative titles
      const totalChars = segments.reduce((a, s) => a + (s.text?.length || 0), 0);
      if (totalChars === 0) return;
      title._twSegments = segments;
      title._twOriginalHTML = title.innerHTML;
      // Reserve final layout height by rendering at full width invisibly first,
      // then clear and stage the caret. Prevents content-shift during typing.
      title.style.minHeight = title.getBoundingClientRect().height + 'px';
      title.innerHTML = '<span class="tw-caret" aria-hidden="true"></span>';
      title.dataset.twState = 'pending';
      title.setAttribute('aria-label', segments.map(s => s.text || (s.type === 'br' ? ' ' : '')).join(''));
    });

    function escapeHTML(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    async function play(title) {
      title.dataset.twState = 'typing';
      const segments = title._twSegments;
      let html = '';
      const render = () => { title.innerHTML = html + '<span class="tw-caret" aria-hidden="true"></span>'; };
      // Per-char delay: faster on long titles so total stays under ~1.4s.
      const totalChars = segments.reduce((a, s) => a + (s.text?.length || 0), 0);
      const perChar = Math.max(18, Math.min(38, Math.round(1400 / Math.max(1, totalChars))));
      for (const seg of segments) {
        if (seg.type === 'br') { html += '<br/>'; render(); continue; }
        if (seg.type === 'html') { html += seg.html; render(); continue; }
        const openTag = seg.type === 'em' ? `<em class="${seg.className}">` : '';
        const closeTag = seg.type === 'em' ? '</em>' : '';
        for (const ch of seg.text) {
          // Type with the tag open so emphasis renders during the type-out
          const partial = (seg.type === 'em' ? openTag + escapeHTML(html.slice(html.length)) : '') + escapeHTML(ch);
          html += seg.type === 'em' ? `${openTag}${escapeHTML(ch)}${closeTag}` : escapeHTML(ch);
          // Better: rebuild from segments to avoid <em> fragmentation
          html = renderProgress(segments, seg, ch, openTag, closeTag);
          render();
          // Variable speed for natural feel - slow slightly on punctuation
          const pause = /[.,;:]/.test(ch) ? perChar * 3 : perChar + (Math.random() * 8 - 4);
          await new Promise(r => setTimeout(r, pause));
        }
      }
      title.dataset.twState = 'done';
      const caret = title.querySelector('.tw-caret');
      if (caret) caret.classList.add('tw-caret-done');
      // After fade animation, remove the caret entirely
      setTimeout(() => { if (caret && caret.parentNode) caret.remove(); }, 5000);
      // Release reserved min-height once typing is done so content can reflow
      setTimeout(() => { title.style.minHeight = ''; }, 200);
    }

    // Helper: rebuild the HTML up to and including the currently-typed character.
    // Tracks where we are by reference equality of (segment, char-index).
    function renderProgress(segments, currentSeg, currentCh, openTag, closeTag) {
      let out = '';
      let stopped = false;
      for (const s of segments) {
        if (stopped) break;
        if (s.type === 'br') { out += '<br/>'; continue; }
        if (s.type === 'html') { out += s.html; continue; }
        if (s === currentSeg) {
          // Type up to and including currentCh
          const idx = s.text.indexOf(currentCh, s._twPos || 0);
          s._twPos = idx + 1;
          const partial = s.text.slice(0, s._twPos);
          out += s.type === 'em' ? `<em class="${s.className}">${escapeHTML(partial)}</em>` : escapeHTML(partial);
          stopped = true;
        } else {
          // Already fully typed
          out += s.type === 'em' ? `<em class="${s.className}">${escapeHTML(s.text)}</em>` : escapeHTML(s.text);
        }
      }
      return out;
    }

    const twIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const t = e.target;
        if (t.dataset.twState !== 'pending') return;
        twIO.unobserve(t);
        play(t);
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });

    titles.forEach(t => { if (t.dataset.twState === 'pending') twIO.observe(t); });

    // Failsafe: if a title is still pending after 4s, just restore original HTML so
    // it never stays blank for the user.
    setTimeout(() => {
      document.querySelectorAll('.display-h[data-tw-state="pending"]').forEach(t => {
        t.innerHTML = t._twOriginalHTML || '';
        t.dataset.twState = 'done';
        t.style.minHeight = '';
      });
    }, 4000);
  })();

  /* === ANIMATED COUNTERS === */
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      if (!target || el.dataset.counted) return;
      el.dataset.counted = 'true';
      let cur = 0;
      const step = Math.max(1, Math.floor(target / 60));
      const iv = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(iv); }
        el.textContent = cur;
      }, 22);
      cio.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  /* === SCALE ON SCROLL === */
  const sio = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); sio.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('.scale-on-scroll').forEach(el => sio.observe(el));

  /* === LAZY IMAGE FADE-IN === */
  (function initLazyFade() {
    var imgs = document.querySelectorAll('img[loading="lazy"]');
    if (!imgs.length) return;
    imgs.forEach(function(img) {
      img.classList.add('lazy-fade');
      if (img.complete) img.classList.add('loaded');
      else img.addEventListener('load', function() { img.classList.add('loaded'); }, { once: true });
    });
    if (!('IntersectionObserver' in window)) return;
    var lio = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('loaded'); lio.unobserve(e.target); }
      });
    }, { rootMargin: '200px 0px' });
    imgs.forEach(function(img) { lio.observe(img); });
  })();

  /* === CERTS MARQUEE === */
  const CERTS = [
    {n:'Introduction to Agent Skills', o:'Anthropic', d:'Apr 2026', id:'c2oy32kfnk4b', s:['Claude Agent SDK','AI Agents','Skill Architecture']},
    {n:'Claude Code 101', o:'Anthropic', d:'Apr 2026', id:'k6fmw9h533iy', s:['Claude Code','AI-Assisted Development','CLI Workflows']},
    {n:'Claude Code in Action', o:'Anthropic', d:'Apr 2026', id:'e846okxivds6', s:['Claude Code','Applied AI','Prompt Engineering']},
    {n:'Introduction to Claude Cowork', o:'Anthropic', d:'Apr 2026', id:'c2qz8ie6swbd', s:['Claude Cowork','AI Collaboration']},
    {n:'Claude 101', o:'Anthropic', d:'Apr 2026', id:'yk4rmrw6ko53', s:['Claude','LLM Fundamentals','Prompt Design']},
    {n:'Qlik Certified Partner Sales: Data & Analytics', o:'Qlik', d:'May 2025', s:['Data & Analytics','Partner Sales','Qlik Platform']},
    {n:'Qlik Learning: Ready, Set, Go!', o:'Qlik', d:'May 2025', s:['Qlik','Analytics Onboarding']},
    {n:'Google AI Essentials', o:'Coursera · Google', d:'Apr 2025', s:['Generative AI','AI Productivity','Responsible AI']},
    {n:'Digital Literacy', o:'IBM', d:'Jan 2025', s:['Digital Skills','Workplace Tech']},
    {n:'Working in a Digital World: Professional Skills', o:'IBM', d:'Jan 2025', s:['Professional Skills','Digital Workplace']},
    {n:'Getting Started with Artificial Intelligence', o:'IBM', d:'Jan 2025', s:['Artificial Intelligence (AI)']},
    {n:'Build Your Generative AI Productivity Skills', o:'Microsoft & LinkedIn', d:'Jan 2025', s:['Prompt Engineering','Productivity Improvement','Generative AI']},
    {n:'Excel with Copilot: AI-Driven Data Analysis', o:'LinkedIn Learning', d:'Jan 2025', s:['Microsoft Excel','Microsoft Copilot','Data Analysis']},
    {n:'Introduction to Prompt Engineering for Generative AI', o:'LinkedIn Learning', d:'Jan 2025', s:['Prompt Engineering','AI Prompting']},
    {n:'Generative AI Skills for Creative Content', o:'LinkedIn Learning', d:'Jan 2025', s:['AI for Design','Media Ethics','Creative AI']},
    {n:'Copilot in PowerPoint: From Prompt to Presentation', o:'LinkedIn Learning', d:'Jan 2025', s:['Microsoft Copilot','AI for Business','Presentations']},
    {n:'AI Productivity Hacks', o:'LinkedIn Learning', d:'Jan 2025', s:['AI Productivity']},
    {n:'Handling Workplace Change as an Employee', o:'LinkedIn Learning', d:'Oct 2024', s:['Change Readiness']},
    {n:'How to Be a Better Boss', o:'LinkedIn Learning', d:'Oct 2024', s:['Team Management','Team Leadership']},
    {n:'Business Analytics Foundations', o:'LinkedIn Learning', d:'Oct 2024', s:['Business Analytics']},
    {n:'Business Analytics: Sales Data', o:'LinkedIn Learning', d:'Oct 2024', s:['Sales Analysis','Business Analytics']},
    {n:'Influence Skills for Leaders and Managers', o:'LinkedIn Learning', d:'Oct 2024', s:['Influencing Others','Leadership']},
    {n:'Train Your Brain to Unwind Stress & Anxiety', o:'LinkedIn Learning', d:'Oct 2024', s:['Anxiety Management']},
    {n:'Working with Difficult People', o:'LinkedIn Learning', d:'Oct 2024', s:['Emotional Intelligence','Difficult Situations']},
    {n:'Mental Health Awareness for Cybersecurity Professionals', o:'LinkedIn Learning', d:'Oct 2024', s:['Mental Health','Cybersecurity']},
    {n:'Managing Your Emotional Response to Workplace Stress', o:'LinkedIn Learning', d:'Oct 2024', s:['Stress Management']},
    {n:'Building Resilience', o:'LinkedIn Learning', d:'Oct 2024', s:['Grit','Resiliency']},
    {n:'Strategies for Being Happy at Work', o:'LinkedIn Learning', d:'Oct 2024', s:['Emotional Intelligence','Positive Psychology']},
    {n:'Collaborate to Build Psychological Safety', o:'LinkedIn Learning', d:'Oct 2024', s:['Emotional Intelligence','Team Collaboration']},
    {n:'Tips to Build a Positive Mindset', o:'LinkedIn Learning', d:'Oct 2024', s:['Attitude Change','Positive Psychology']},
    {n:'Negotiation Professional Certificate', o:'American Negotiation Institute', d:'Sep 2024', s:['Professional Communication','Negotiation']},
    {n:'Career Essentials in Generative AI', o:'Microsoft & LinkedIn', d:'Sep 2024', s:['Computer Ethics','Generative AI']},
    {n:'Career Essentials in Data Analysis', o:'Microsoft & LinkedIn', d:'Sep 2024', s:['Data Visualization','Data Analysis']},
    {n:'Administrative Professional Tips', o:'LinkedIn Learning', d:'Sep 2024', s:['Administrative Assistance']},
    {n:'Driving Measurable, Sustainable Change', o:'LinkedIn Learning', d:'Sep 2024', s:['Sustainable Business Strategies']},
    {n:'How to Manage Lean Six Sigma Projects: Part II', o:'LinkedIn Learning', d:'Sep 2024', s:['Lean Six Sigma','Lean Projects']},
    {n:'Invest in You: Personal & Professional Development', o:'LinkedIn Learning', d:'Sep 2024', s:['Personal Development','Professional Development']},
    {n:'Service Excellence: Exceed Expectations', o:'LinkedIn Learning', d:'Sep 2024', s:['Customer Service','Service Quality']},
    {n:'Introduction to Career Skills in Data Analytics', o:'LinkedIn Learning', d:'Sep 2024', s:['Data Analytics','Tech Career Skills']},
    {n:'Learning Data Analytics 1: Foundations', o:'LinkedIn Learning', d:'Sep 2024', s:['Data Analytics']},
    {n:'Learning Data Analytics 2: Extending & Applying', o:'LinkedIn Learning', d:'Sep 2024', s:['Data Analytics']},
    {n:"When Negotiation's About More Than Money", o:'LinkedIn Learning', d:'Sep 2024', s:['Negotiation']},
    {n:'Introduction to Artificial Intelligence', o:'LinkedIn Learning', d:'Sep 2024', s:['AI for Business','Artificial Intelligence (AI)']},
    {n:'Excel for Financial Planning & Analysis (FP&A)', o:'LinkedIn Learning', d:'Sep 2024', s:['Microsoft Excel','Financial Analysis','FP&A']},
    {n:'How to Prepare for Your Negotiations', o:'LinkedIn Learning', d:'Sep 2024', s:['Negotiation']},
    {n:'How to Be Both Assertive and Likable', o:'LinkedIn Learning', d:'Sep 2024', s:['Interpersonal Skills']},
    {n:'Negotiating with Agility', o:'LinkedIn Learning', d:'Sep 2024', s:['Negotiation']},
    {n:'Negotiation Foundations', o:'LinkedIn Learning', d:'Sep 2024', s:['Negotiation']},
    {n:'Discovery-Driven Leadership with Rita McGrath', o:'LinkedIn Learning', d:'Sep 2024', s:['Collaborative Leadership']},
    {n:'Program Management for IT Professionals', o:'LinkedIn Learning', d:'Sep 2024', s:['IT Project & Program Management']},
    {n:'Introduction to IT Architecture', o:'LinkedIn Learning', d:'Sep 2024', s:['IT Architectures']},
    {n:'Creating Your IT Strategy', o:'LinkedIn Learning', d:'Sep 2024', s:['IT Strategic Planning']},
    {n:'Succeeding as a First-Time Tech Manager', o:'LinkedIn Learning', d:'Sep 2024', s:['Technical Leadership','Tech Career Skills']},
    {n:'What Is Generative AI?', o:'LinkedIn Learning', d:'Sep 2024', s:['Generative AI Tools','Artificial Intelligence (AI)']},
    {n:'Generative AI: Evolution of Thoughtful Online Search', o:'LinkedIn Learning', d:'Sep 2024', s:['Search Engine Technology','AI for Business']},
    {n:'Streamlining Your Work with Microsoft Copilot', o:'LinkedIn Learning', d:'Sep 2024', s:['Productivity Improvement']},
    {n:'Ethics in the Age of Generative AI', o:'LinkedIn Learning', d:'Sep 2024', s:['Computer Ethics','Responsible AI']},
    {n:'Cert Prep: Salesforce Certified Administrator', o:'LinkedIn Learning', d:'Sep 2024', s:['Salesforce.com']},
    {n:'Learning Microsoft 365 Copilot', o:'LinkedIn Learning', d:'Sep 2024', s:['Microsoft Copilot','Microsoft 365']},
    {n:'Strategic Negotiation', o:'LinkedIn Learning', d:'Sep 2024', s:['Strategic Negotiations']},
    {n:'Introduction to IT Asset Management (ITAM)', o:'LinkedIn Learning', d:'Sep 2024', s:['IT Asset Management']},
    {n:'Becoming an Agile Coach', o:'LinkedIn Learning', d:'Sep 2024', s:['Agile Coaching']},
    {n:'Winning Over Execs: AI-Boosted Sales Presentations', o:'LinkedIn Learning', d:'Sep 2024', s:['Sales Presentations','AI for Business']},
    {n:'Sales Strategies in a New World of Selling', o:'LinkedIn Learning', d:'Sep 2024', s:['Sales Strategy']},
    {n:'Sales Fundamentals', o:'LinkedIn Learning', d:'Sep 2024', s:['Sales Effectiveness']},
    {n:'AI Foundations: Machine Learning', o:'LinkedIn Learning', d:'Sep 2024', s:['Machine Learning']},
    {n:'Marketing Tools: Digital Marketing Tools & Services', o:'LinkedIn Learning', d:'Sep 2024', s:['Digital Marketing']},
    {n:'Developing Adaptability as a Manager', o:'LinkedIn Learning', d:'Sep 2024', s:['Management']},
    {n:'Teamwork Essentials: Stand Out as a Valuable Team Member', o:'LinkedIn Learning', d:'Sep 2024', s:['Teamwork','Personal Branding']},
    {n:'Business Etiquette: Phone, Email, and Text', o:'LinkedIn Learning', d:'Sep 2024', s:['Professional Communication','Phone Etiquette']},
    {n:'LiveAction Partner Sales Certification', o:'LiveAction (acq. BlueCat)', d:'Jul 2024', s:['Customer Service','Communication','Partner Sales']},
    {n:'Sales Certified: LiveAction', o:'LiveAction', d:'2024', s:['Partner Sales Training','Network Performance']},
  ];
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const groupFor = (o) => {
    const s = o.toLowerCase();
    if (s.includes('anthropic')) return 'Anthropic';
    if (s.includes('linkedin')) return 'LinkedIn';
    if (s.includes('microsoft')) return 'Microsoft';
    if (s.includes('ibm')) return 'IBM';
    if (s.includes('qlik')) return 'Qlik';
    if (s.includes('google') || s.includes('coursera')) return 'Google';
    return 'Other';
  };
  CERTS.forEach(c => { c.group = groupFor(c.o); });

  const chipHtml = (c, i) => `
    <button class="cert-chip" data-cert="${i}" data-group="${c.group}" type="button" role="listitem" aria-label="View details for ${esc(c.n)}">
      <span class="dot"></span>
      <div class="cbody">
        <span class="cname">${esc(c.n)}</span>
        <span class="cmeta">${esc(c.o)} · ${esc(c.d)}</span>
      </div>
      <svg class="chev" width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 9L9 1M9 1H2M9 1V8" stroke="currentColor" stroke-width="1.3"/></svg>
    </button>`;

  const grid = document.getElementById('certGrid');
  if (grid) grid.innerHTML = CERTS.map((c, i) => chipHtml(c, i)).join('');

  const countEl = document.getElementById('certCount');
  if (countEl) countEl.textContent = CERTS.length;

  // Populate moving ticker - duplicated for seamless loop
  const pillHtml = (c) => `<span class="cert-pill"><span class="cp-dot"></span>${esc(c.n)} <span class="cp-org">· ${esc(c.o)}</span></span>`;
  const tickerA = document.getElementById('certTickerA');
  const tickerB = document.getElementById('certTickerB');
  if (tickerA && tickerB) {
    const shuf = (arr) => arr.slice().sort(() => Math.random() - 0.5);
    const rowA = shuf(CERTS).slice(0, 24);
    const rowB = shuf(CERTS).slice(0, 24);
    tickerA.innerHTML = [...rowA, ...rowA].map(pillHtml).join('');
    tickerB.innerHTML = [...rowB, ...rowB].map(pillHtml).join('');
  }

  // Filter pills
  const groups = ['All','Anthropic','LinkedIn','Microsoft','Google','Qlik','IBM','Other'];
  const counts = groups.reduce((acc, g) => {
    acc[g] = g === 'All' ? CERTS.length : CERTS.filter(c => c.group === g).length;
    return acc;
  }, {});
  const filterWrap = document.getElementById('certFilters');
  if (filterWrap) {
    filterWrap.innerHTML = groups
      .filter(g => counts[g] > 0)
      .map(g => `<button class="cert-filter${g==='All'?' is-active':''}" data-group="${g}" type="button" role="tab" aria-selected="${g==='All'}">${g} <span class="cf-count">${counts[g]}</span></button>`)
      .join('');
    filterWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.cert-filter');
      if (!btn) return;
      filterWrap.querySelectorAll('.cert-filter').forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected','true');
      const g = btn.dataset.group;
      grid.querySelectorAll('.cert-chip').forEach(ch => {
        ch.dataset.hidden = (g === 'All' || ch.dataset.group === g) ? '0' : '1';
      });
    });
  }

  /* === CERT MODAL === */
  const certModal = document.getElementById('certModal');
  const certModalClose = document.getElementById('certModalClose');
  const certModalTitle = document.getElementById('certModalTitle');
  const certModalOrg = document.getElementById('certModalOrg');
  const certModalDate = document.getElementById('certModalDate');
  const certModalIdLabel = document.getElementById('certModalIdLabel');
  const certModalIdEl = document.getElementById('certModalId');
  const certModalSkills = document.getElementById('certModalSkills');
  const certModalNote = document.getElementById('certModalNote');

  const openCert = (idx) => {
    const c = CERTS[idx];
    if (!c) return;
    certModalTitle.textContent = c.n;
    certModalOrg.textContent = c.o;
    certModalDate.textContent = 'Issued ' + c.d;
    if (c.id) {
      certModalIdLabel.classList.remove('hidden');
      certModalIdEl.textContent = c.id;
    } else {
      certModalIdLabel.classList.add('hidden');
    }
    certModalSkills.innerHTML = (c.s && c.s.length)
      ? c.s.map(s => `<span class="cert-skill">${s}</span>`).join('')
      : '<span class="text-ink/50 text-[12.5px] italic">No specific skills tagged.</span>';
    certModalNote.classList.add('hidden');
    certModal.classList.add('is-open');
    certModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeCert = () => {
    certModal.classList.remove('is-open');
    certModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.cert-chip');
    if (chip) { e.preventDefault(); openCert(parseInt(chip.dataset.cert, 10)); }
  });
  certModalClose?.addEventListener('click', closeCert);
  certModal?.addEventListener('click', (e) => { if (e.target === certModal) closeCert(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && certModal && certModal.classList.contains('is-open')) closeCert(); });

  /* === SNAKE GAME === */
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const scoreDisp = document.getElementById('scoreDisp');
  const highDisp = document.getElementById('highDisp');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const gameOver = document.getElementById('gameOver');
  const finalScore = document.getElementById('finalScore');
  const playAgain = document.getElementById('playAgain');
  const gameContact = document.getElementById('gameContact');

  const GRID = 20;
  const COLS = canvas ? canvas.width / GRID : 20;
  const ROWS = canvas ? canvas.height / GRID : 20;

  let snake = [], food = {}, dx = 1, dy = 0, nextDx = 1, nextDy = 0;
  let score = 0, speed = 120, loop = null, running = false;
  let high = parseInt(localStorage.getItem('snakeHigh') || '0', 10);
  if (isNaN(high)) high = 0;
  if (highDisp) highDisp.textContent = high;

  const GOLD = '#D4A843', GOLD_DEEP = '#B88A2F';
  const SNAKE_HEAD = '#F5F2EC', SNAKE_BODY = 'rgba(245,242,236,';

  function drawBoard(){
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(212,168,67,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
    }
  }
  function drawSnake(){
    snake.forEach((s, i) => {
      const isHead = i === 0;
      const prog = 1 - (i / snake.length);
      const r = isHead ? GRID * 0.45 : GRID * 0.4;
      const px = s.x * GRID + (GRID - r*2)/2;
      const py = s.y * GRID + (GRID - r*2)/2;
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px, py, r*2, r*2, isHead ? 6 : 4);
      else ctx.rect(px, py, r*2, r*2);
      if (isHead) {
        ctx.fillStyle = SNAKE_HEAD;
        ctx.shadowColor = 'rgba(245,242,236,0.5)';
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = SNAKE_BODY + (0.35 + prog * 0.5) + ')';
      }
      ctx.fill();
      ctx.restore();
    });
  }
  function drawFood(){
    const cx = food.x * GRID + GRID/2;
    const cy = food.y * GRID + GRID/2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, GRID*0.55, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(212,168,67,0.15)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, GRID*0.3, 0, Math.PI*2);
    ctx.fillStyle = GOLD;
    ctx.shadowColor = 'rgba(212,168,67,0.6)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }
  function spawnFood(){
    let p;
    do {
      p = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) };
    } while (snake.some(s => s.x===p.x && s.y===p.y));
    food = p;
  }
  function reset(){
    const mx = Math.floor(COLS/2), my = Math.floor(ROWS/2);
    snake = [{x:mx,y:my},{x:mx-1,y:my},{x:mx-2,y:my}];
    dx=1; dy=0; nextDx=1; nextDy=0;
    score=0; speed=120;
    if (scoreDisp) scoreDisp.textContent = '0';
    if (gameOver) gameOver.classList.remove('show');
    spawnFood();
  }
  function snakeStep(){
    dx = nextDx; dy = nextDy;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    if (head.x<0 || head.x>=COLS || head.y<0 || head.y>=ROWS) return snakeOver();
    if (snake.some(s => s.x===head.x && s.y===head.y)) return snakeOver();
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) {
      score++;
      if (scoreDisp) scoreDisp.textContent = score;
      if (score > high) {
        high = score;
        if (highDisp) highDisp.textContent = high;
        localStorage.setItem('snakeHigh', high);
      }
      spawnFood();
      if (speed > 60) speed -= 2;
      clearInterval(loop);
      loop = setInterval(snakeStep, speed);
    } else snake.pop();
    drawBoard(); drawFood(); drawSnake();
  }
  function snakeOver(){
    running = false;
    clearInterval(loop);
    if (finalScore) finalScore.textContent = score;
    if (gameOver) gameOver.classList.add('show');
    if (startBtn) startBtn.classList.add('hidden');
    if (restartBtn) restartBtn.classList.remove('hidden');
  }
  function snakeStart(){
    if (!canvas || !ctx) return;
    reset();
    running = true;
    drawBoard(); drawFood(); drawSnake();
    loop = setInterval(snakeStep, speed);
    if (startBtn) startBtn.classList.add('hidden');
    if (restartBtn) restartBtn.classList.remove('hidden');
  }

  // Initial state
  if (canvas && ctx) {
    drawBoard();
    ctx.fillStyle = 'rgba(212,168,67,0.4)';
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS START TO PLAY', canvas.width/2, canvas.height/2);
  }

  if (startBtn) startBtn.addEventListener('click', snakeStart);
  if (restartBtn) restartBtn.addEventListener('click', snakeStart);
  if (playAgain) playAgain.addEventListener('click', snakeStart);
  if (gameContact) gameContact.addEventListener('click', () => { if (gameOver) gameOver.classList.remove('show'); });

  document.addEventListener('keydown', (e) => {
    if (!running) return;
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': if (dy!==1){nextDx=0;nextDy=-1;} e.preventDefault(); break;
      case 'ArrowDown': case 's': case 'S': if (dy!==-1){nextDx=0;nextDy=1;} e.preventDefault(); break;
      case 'ArrowLeft': case 'a': case 'A': if (dx!==1){nextDx=-1;nextDy=0;} e.preventDefault(); break;
      case 'ArrowRight': case 'd': case 'D': if (dx!==-1){nextDx=1;nextDy=0;} e.preventDefault(); break;
    }
  });

  document.querySelectorAll('.touch-btn[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!running) return;
      const d = btn.dataset.dir;
      if (d==='up' && dy!==1) { nextDx=0; nextDy=-1; }
      if (d==='down' && dy!==-1) { nextDx=0; nextDy=1; }
      if (d==='left' && dx!==1) { nextDx=-1; nextDy=0; }
      if (d==='right' && dx!==-1) { nextDx=1; nextDy=0; }
    });
  });

  let tsx=0, tsy=0;
  if (canvas) {
    canvas.addEventListener('touchstart', (e) => { tsx=e.touches[0].clientX; tsy=e.touches[0].clientY; }, {passive:true});
    canvas.addEventListener('touchend', (e) => {
      if (!running) return;
      const dX = e.changedTouches[0].clientX - tsx;
      const dY = e.changedTouches[0].clientY - tsy;
      if (Math.abs(dX) > Math.abs(dY)) {
        if (dX > 20 && dx!==-1) { nextDx=1; nextDy=0; }
        else if (dX < -20 && dx!==1) { nextDx=-1; nextDy=0; }
      } else {
        if (dY > 20 && dy!==-1) { nextDx=0; nextDy=1; }
        else if (dY < -20 && dy!==1) { nextDx=0; nextDy=-1; }
      }
    }, {passive:true});
  }

  // Register snake into the cabinet module system so switching tabs stops its
  // interval + disables its key handler (running=false) - no background leak / key theft.
  window.__snake = { ready: true, init(){ if (canvas && ctx && !running) { drawBoard(); } }, stop(){ running = false; clearInterval(loop); } };

  /* === ARCADE TABS + CABINET STATE MACHINE === */
  const tabs = document.querySelectorAll('.atab');
  const panels = document.querySelectorAll('.apanel');
  // Game list derived from the DOM tab buttons - add a game = add markup + module, no array edits.
  const GAME_LIST = Array.from(tabs).map(t => t.dataset.tab);
  const GAME_NAMES = {};
  tabs.forEach(t => { const nm = t.querySelector('.atab-name'); GAME_NAMES[t.dataset.tab] = nm ? nm.textContent.trim() : t.dataset.tab; });

  /* --- Themed floating glyphs (recolor + swap symbols per selected game) --- */
  const SHAPE = {
    ship:   '<path d="M12 3l7 16-7-4-7 4z"/>',
    alien:  '<path d="M7 6h2v2h6V6h2v3h2v5h-3v3h-3v-2h-2v2H8v-3H5V9h2z"/>',
    pellet: '<circle cx="12" cy="12" r="3"/>',
    ghost:  '<path d="M5 20V11a7 7 0 0 1 14 0v9l-2.4-2-2.3 2-2.3-2-2.3 2L7.4 18z"/>',
    block:  '<rect x="5" y="5" width="14" height="14" rx="2"/>',
    paddle: '<rect x="10" y="3" width="4" height="18" rx="2"/>',
    ball:   '<circle cx="12" cy="12" r="5"/>',
    star:   '<path d="M12 3l2.4 6H21l-5 4 1.9 7-5.9-4-5.9 4 1.9-7-5-4h6.6z"/>',
    disc:   '<circle cx="12" cy="12" r="6"/>',
    tower:  '<path d="M8 21V9l4-4 4 4v12M6 21h12"/>',
    frog:   '<circle cx="12" cy="13" r="5"/><circle cx="9" cy="8" r="1.6"/><circle cx="15" cy="8" r="1.6"/>',
    snake:  '<path d="M4 6h9a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h11"/>',
    bird:   '<path d="M3 12a6 6 0 0 1 6-6 5 5 0 0 1 5 5l5-2-3 4 3 1-5 1a6 6 0 0 1-11-3z"/>',
    bolt:   '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'
  };
  const FILLED = /pellet|ball|disc|alien|ghost|block|star|frog|bolt/;
  // accent = "r,g,b"; shapes cycle across the glyph nodes
  const ARCADE_THEMES = {
    _default:{ accent:'212,168,67', shapes:['ship','block','pellet','star','disc'] },
    snake:   { accent:'111,207,122', shapes:['snake','pellet','disc'] },
    wordle:  { accent:'120,200,140', shapes:['block','star','disc'] },
    tetris:  { accent:'120,160,255', shapes:['block','block','disc'] },
    dino:    { accent:'170,176,182', shapes:['ship','block','star'] },
    flappy:  { accent:'255,210,80',  shapes:['bird','block','disc'] },
    pong:    { accent:'245,242,236', shapes:['paddle','ball'] },
    breakout:{ accent:'255,140,90',  shapes:['block','ball','paddle'] },
    g2048:   { accent:'237,194,46',  shapes:['block','disc'] },
    mines:   { accent:'255,120,120', shapes:['disc','block','star'] },
    memory:  { accent:'212,168,67',  shapes:['block','disc','star'] },
    reaction:{ accent:'120,230,160', shapes:['disc','star','bolt'] },
    hilo:    { accent:'212,168,67',  shapes:['disc','star','block'] },
    airhockey:{accent:'90,200,250',  shapes:['disc','paddle','ball'] },
    connect4:{ accent:'255,90,90',   shapes:['disc','disc','block'] },
    muncher: { accent:'255,221,87',  shapes:['ghost','pellet','disc'] },
    invaders:{ accent:'120,200,255', shapes:['alien','ship','star'] },
    asteroids:{accent:'200,200,210', shapes:['ship','disc','star'] },
    frogger: { accent:'120,230,140', shapes:['frog','block','disc'] },
    simon:   { accent:'120,230,160', shapes:['disc','block','disc'] },
    tower:   { accent:'200,120,255', shapes:['tower','disc','star'] },
    tron:    { accent:'90,220,210',  shapes:['bolt','block','disc'] },
    whack:   { accent:'212,168,67',  shapes:['disc','star','block'] },
    lightsout:{accent:'237,194,46',  shapes:['block','disc','star'] },
    ttt:{accent:'212,168,67',        shapes:['block','disc','bolt'] },
    fifteen:{accent:'232,223,200',   shapes:['block','star','disc'] },
    sokoban:{accent:'196,154,60',    shapes:['block','disc','bolt'] },
    reversi:{accent:'45,138,126',    shapes:['disc','disc','block'] },
    mastermind:{accent:'212,168,67', shapes:['disc','star','bolt'] },
    vpoker:{accent:'237,194,46',     shapes:['star','disc','block'] },
    checkers:{accent:'196,154,60',   shapes:['disc','disc','block'] },
    blackjack:{accent:'237,194,46',  shapes:['star','disc','block'] },
    gems:{accent:'155,108,232',      shapes:['star','disc','bolt'] },
    hangman:{accent:'79,179,164',    shapes:['block','star','disc'] },
    lights:{accent:'196,154,60',     shapes:['disc','bolt','star'] },
    dice:{accent:'237,194,46',       shapes:['block','disc','block'] },
    battleship:{accent:'79,179,164',  shapes:['block','disc','bolt'] },
    mole:{accent:'196,154,60',        shapes:['disc','star','disc'] },
    hanoi:{accent:'237,194,46',       shapes:['block','block','disc'] },
    minesweeper:{accent:'232,93,93',  shapes:['disc','bolt','block'] }
  };
  const glyphNodes = Array.from(document.querySelectorAll('.arcade-glyph'));
  function themeArcade(name){
    const t = ARCADE_THEMES[name] || ARCADE_THEMES._default;
    document.documentElement.style.setProperty('--arcade-accent', t.accent);
    glyphNodes.forEach((node, i) => {
      const key = t.shapes[i % t.shapes.length];
      const inner = SHAPE[key] || SHAPE.disc;
      const fill = FILLED.test(key) ? 'currentColor' : 'none';
      node.innerHTML = '<svg viewBox="0 0 24 24" fill="' + fill + '" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">' + inner + '</svg>';
      const a = (0.06 + ((i * 37) % 9) / 100).toFixed(2);
      node.style.color = 'rgba(' + t.accent + ',' + a + ')';
    });
  }
  themeArcade('_default');

  function selectGame(name) {
    tabs.forEach(t => {
      const on = t.dataset.tab === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panels.forEach(p => {
      const on = p.dataset.panel === name;
      p.classList.toggle('is-active', on);
      p.classList.toggle('hidden', !on);
      if (on) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
      if (on) {
        // Re-trigger animation
        p.style.animation = 'none';
        void p.offsetWidth;
        p.style.animation = '';
        setTimeout(() => {
          GAME_LIST.forEach(g => {
            const mod = window['__' + g];
            if (!mod) return;
            // Isolate each game's lifecycle so one throwing init/stop can't
            // strand the others (or leave a background loop running).
            try {
              if (g === name) { if (mod.init && !mod.ready) mod.init(); }
              else if (mod.stop) mod.stop();
            } catch (err) { console.warn('arcade lifecycle error for', g, err); }
          });
        }, 10);
      }
    });
    themeArcade(name);
    const np = document.getElementById('arcadeNowPlaying');
    if (np) np.textContent = GAME_NAMES[name] || name;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => selectGame(tab.dataset.tab));
  });

  /* --- Cabinet: attract → select → play --- */
  const cabinet = document.getElementById('arcadeCabinet');
  if (cabinet) {
    const screens = cabinet.querySelectorAll('.arcade-screen');
    const stopAll = () => {
      GAME_LIST.forEach(g => {
        const mod = window['__' + g]; if (mod && mod.stop) mod.stop();
      });
    };
    function setStage(stage) {
      cabinet.dataset.stage = stage;
      screens.forEach(s => {
        const on = s.dataset.screen === stage;
        if (on) s.removeAttribute('hidden'); else s.setAttribute('hidden', '');
      });
      if (stage !== 'play') { stopAll(); themeArcade('_default'); }
      if (stage === 'select') {
        const first = cabinet.querySelector('.cab-tile');
        if (first) first.focus();
      }
    }

    // Populate high-score chips on the cabinet tiles
    cabinet.querySelectorAll('.cab-tile-hi').forEach(el => {
      if (!el.dataset.hi) { el.innerHTML = '<span style="opacity:.5">Insert coin ›</span>'; return; }
      const v = parseInt(localStorage.getItem(el.dataset.hi) || '0', 10);
      const label = el.dataset.hiLabel || 'HI';
      el.innerHTML = v > 0 ? (label + ' <b>' + v + '</b>') : '<span style="opacity:.5">No score yet</span>';
    });

    const startBtn = document.getElementById('arcadeStartBtn');
    if (startBtn) startBtn.addEventListener('click', () => setStage('select'));

    const toAttract = document.getElementById('arcadeToAttract');
    if (toAttract) toAttract.addEventListener('click', () => setStage('attract'));

    const toSelect = document.getElementById('arcadeToSelect');
    if (toSelect) toSelect.addEventListener('click', () => setStage('select'));

    cabinet.querySelectorAll('.cab-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        selectGame(tile.dataset.game);
        setStage('play');
        const head = document.getElementById('arcade-play');
        if (head && head.scrollIntoView) head.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });

    // --- Fullscreen toggle (real Fullscreen API where supported; CSS pseudo-fullscreen
    //     fallback for iOS Safari, which has NO Element.requestFullscreen) ---
    function fsActive(){ return document.fullscreenElement || document.webkitFullscreenElement; }
    function pseudoActive(){ return cabinet.classList.contains('is-pseudo-fs'); }
    function fsAny(){ return !!fsActive() || pseudoActive(); }
    let fsExitFab = null;
    let savedScrollY = 0;
    let fsRequestTimer = null;
    function clearFsRequestTimer(){
      if (fsRequestTimer) { clearTimeout(fsRequestTimer); fsRequestTimer = null; }
    }
    function ensureExitFab(){
      if (fsExitFab) return fsExitFab;
      fsExitFab = document.createElement('button');
      fsExitFab.type = 'button';
      fsExitFab.className = 'arcade-fs-exit';
      fsExitFab.setAttribute('aria-label', 'Exit fullscreen');
      fsExitFab.title = 'Exit fullscreen (Esc)';
      fsExitFab.textContent = '✕';
      fsExitFab.addEventListener('click', (e) => { e.preventDefault(); toggleFullscreen(); });
      cabinet.appendChild(fsExitFab);
      return fsExitFab;
    }
    function syncFsUI(){
      clearFsRequestTimer();
      const on = fsAny();
      cabinet.classList.toggle('is-fullscreen', on);
      document.body.classList.toggle('arcade-fs-lock', pseudoActive());
      ensureExitFab().style.display = on ? 'flex' : 'none';
      cabinet.querySelectorAll('.arcade-fs').forEach(b => {
        b.textContent = on ? 'Exit fullscreen' : 'Fullscreen';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      // let the active game canvas re-fit to the new viewport
      requestAnimationFrame(() => { try { window.dispatchEvent(new Event('resize')); } catch(_){} });
      // keep the active game tab visible in the compact strip so the player
      // always sees which game is running after (pseudo)fullscreen engages
      if (on) {
        const strip = cabinet.querySelector('.arcade-tabs');
        const activeTab = cabinet.querySelector('.atab.is-active');
        if (strip && activeTab && strip.scrollTo) {
          try {
            strip.scrollTo({ left: Math.max(0, activeTab.offsetLeft - strip.clientWidth / 2 + activeTab.clientWidth / 2), behavior: 'smooth' });
          } catch(_) {}
        }
      }
    }
    function enterPseudo(){
      clearFsRequestTimer();
      savedScrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.setProperty('--arcade-fs-scroll-top', `-${savedScrollY}px`);
      cabinet.classList.add('is-pseudo-fs');
      syncFsUI();
      // Scroll the cabinet to top of its play area so the game is visible
      requestAnimationFrame(() => { cabinet.scrollTop = 0; });
    }
    function exitPseudo(){
      clearFsRequestTimer();
      cabinet.classList.remove('is-pseudo-fs');
      document.body.style.removeProperty('--arcade-fs-scroll-top');
      syncFsUI();
      // Restore scroll position after the body unlock
      requestAnimationFrame(() => { window.scrollTo(0, savedScrollY); });
    }
    function toggleFullscreen(){
      if (fsAny()){
        if (pseudoActive()) { exitPseudo(); return; }
        const ex = document.exitFullscreen || document.webkitExitFullscreen;
        if (ex) { try { const r = ex.call(document); if (r && r.catch) r.catch(()=>{}); } catch(_){} }
        return;
      }
      const req = cabinet.requestFullscreen || cabinet.webkitRequestFullscreen;
      if (!req) {
        enterPseudo(); // iOS Safari: no Fullscreen API → CSS pseudo-fullscreen overlay
        return;
      }
      try {
        const r = req.call(cabinet);
        if (r && r.catch) r.catch(() => enterPseudo());
        // Some WebKit implementations expose the method but never resolve the
        // request or emit fullscreenchange. Give them a short, deterministic fallback.
        clearFsRequestTimer();
        fsRequestTimer = setTimeout(() => {
          if (!fsActive() && !pseudoActive()) enterPseudo();
        }, 450);
      } catch(_) { enterPseudo(); }
    }
    Array.from(cabinet.querySelectorAll('.arcade-fs')).forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); toggleFullscreen(); }));
    document.addEventListener('fullscreenchange', syncFsUI);
    document.addEventListener('webkitfullscreenchange', syncFsUI);

    // Keyboard: Enter on attract starts; Esc steps back; F toggles fullscreen
    cabinet.addEventListener('keydown', (e) => {
      const stage = cabinet.dataset.stage;
      if (stage === 'attract' && (e.key === 'Enter')) { e.preventDefault(); setStage('select'); }
      else if (e.key === 'Escape') {
        if (pseudoActive()) { e.preventDefault(); exitPseudo(); }
        else if (!fsActive()) {
          if (stage === 'play') { e.preventDefault(); setStage('select'); }
          else if (stage === 'select') { e.preventDefault(); setStage('attract'); }
        }
      }
      else if (e.key === 'f' || e.key === 'F') {
        // F toggles fullscreen everywhere EXCEPT inside letter-input games (Wordle,
        // Hangman read raw A-Z keys, so "F" must reach them) and form fields.
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        if (stage === 'play') {
          const LETTER_INPUT_GAMES = ['wordle', 'hangman'];
          const active = cabinet.querySelector('.apanel.is-active:not(.hidden)');
          if (active && LETTER_INPUT_GAMES.includes(active.dataset.panel)) return;
        }
        e.preventDefault(); toggleFullscreen();
      }
    });
  }

  /* === REFLEX (reaction test) === */
  (function(){
    const pad = document.getElementById('rxPad');
    const stateEl = document.getElementById('rxState');
    const resultEl = document.getElementById('rxResult');
    const bestEl = document.getElementById('rxBest');
    const bestUnit = document.getElementById('rxBestUnit');
    if (!pad) return;
    const TOTAL = 5;
    let phase = 'idle';   // idle | waiting | go | done
    let timer = null, goAt = 0, round = 0, sum = 0;
    let best = parseInt(localStorage.getItem('pwReactionBest') || '0', 10);

    function renderBest(){ if (best > 0) { bestEl.textContent = best; bestUnit.textContent = ' ms'; } else { bestEl.textContent = ''; bestUnit.textContent = ''; } }
    function clearTimer(){ if (timer) { clearTimeout(timer); timer = null; } }

    function reset(){
      clearTimer(); phase = 'idle'; round = 0; sum = 0;
      pad.classList.remove('rx-wait','rx-go');
      stateEl.textContent = 'Click to begin';
      resultEl.textContent = '';
      renderBest();
    }
    function arm(){
      phase = 'waiting'; pad.classList.remove('rx-go'); pad.classList.add('rx-wait');
      stateEl.textContent = 'Wait for green…';
      resultEl.textContent = 'Round ' + (round + 1) + ' of ' + TOTAL;
      clearTimer();
      timer = setTimeout(() => {
        phase = 'go'; pad.classList.remove('rx-wait'); pad.classList.add('rx-go');
        stateEl.textContent = 'CLICK!';
        goAt = performance.now();
      }, 900 + Math.random() * 2200);
    }
    function finishRound(ms){
      sum += ms; round++;
      pad.classList.remove('rx-go','rx-wait');
      if (round >= TOTAL){
        const avg = Math.round(sum / TOTAL);
        phase = 'done';
        stateEl.textContent = avg + ' ms avg';
        let msg = 'Click to play again';
        if (best === 0 || avg < best){ best = avg; localStorage.setItem('pwReactionBest', String(best)); msg = 'New best! ' + msg; }
        resultEl.textContent = msg;
        renderBest();
      } else {
        phase = 'between'; stateEl.textContent = ms + ' ms';
        resultEl.textContent = 'Click for round ' + (round + 1);
      }
    }
    pad.addEventListener('click', () => {
      if (phase === 'idle' || phase === 'done' || phase === 'between'){
        if (phase === 'done') { round = 0; sum = 0; }
        arm();
      } else if (phase === 'waiting'){
        clearTimer(); pad.classList.remove('rx-wait');
        stateEl.textContent = 'Too soon!';
        resultEl.textContent = 'Click to restart the round';
        phase = 'between';
      } else if (phase === 'go'){
        finishRound(Math.round(performance.now() - goAt));
      }
    });
    window.__reaction = { ready:false, init(){ this.ready = true; reset(); }, stop(){ clearTimer(); phase='idle'; pad.classList.remove('rx-wait','rx-go'); } };
    renderBest();
  })();

  /* === HI-LO === */
  (function(){
    const numEl = document.getElementById('hlNumber');
    const streakEl = document.getElementById('hlStreak');
    const bestEl = document.getElementById('hlBest');
    const finalEl = document.getElementById('hlFinal');
    const overEl = document.getElementById('hlGameOver');
    const higherBtn = document.getElementById('hlHigher');
    const lowerBtn = document.getElementById('hlLower');
    const againBtn = document.getElementById('hlPlayAgain');
    if (!numEl) return;
    let cur = 50, streak = 0, over = false;
    let best = parseInt(localStorage.getItem('pwHiloBest') || '0', 10);
    const rnd = () => Math.floor(Math.random() * 100) + 1;

    function render(){ streakEl.textContent = streak; bestEl.textContent = best; numEl.textContent = cur; }
    function flash(){ numEl.classList.remove('hl-flash'); void numEl.offsetWidth; numEl.classList.add('hl-flash'); }
    function start(){ over = false; streak = 0; cur = rnd(); overEl.classList.remove('show'); higherBtn.disabled = false; lowerBtn.disabled = false; render(); }
    function guess(higher){
      if (over) return;
      let next = rnd();
      // ties count in player's favor regardless of guess
      const win = (next === cur) || (higher ? next > cur : next < cur);
      cur = next; flash();
      if (win){ streak++; if (streak > best){ best = streak; localStorage.setItem('pwHiloBest', String(best)); } render(); }
      else { render(); over = true; higherBtn.disabled = true; lowerBtn.disabled = true; finalEl.textContent = streak; overEl.classList.add('show'); }
    }
    higherBtn.addEventListener('click', () => guess(true));
    lowerBtn.addEventListener('click', () => guess(false));
    if (againBtn) againBtn.addEventListener('click', start);
    window.__hilo = { ready:false, init(){ this.ready = true; start(); }, stop(){ /* no timers */ } };
    render();
  })();

  /* === WORDLE === */
  const WORDS = [
    'AGENT','BLAZE','CLAIM','COVER','CRANE','DRIVE','FORCE','FRAUD','GRACE','HEDGE',
    'HOUSE','INDEX','LATER','LLOYD','NOBLE','OCEAN','PILOT','PRIZE','QUOTE','ROUTE',
    'SMART','SOUTH','STONE','TRUST','UNITY','WORLD','AMBER','BONDS','FLEET','LOGIC',
    'MERGE','BROKE','NORTH','SWAMP','RADAR','EARTH','BRAVE','CHARM','DEPTH','FRONT',
    'GLOBE','HEART','MONEY','LEGAL','MODEL','POINT','RAPID','SHORE','TIGER','VAULT'
  ].filter(w => w.length === 5);

  const wBoard = document.getElementById('wordleBoard');
  const wKb = document.getElementById('wordleKeyboard');
  const wStatus = document.getElementById('wordleStatus');
  const wAttempt = document.getElementById('wAttempt');
  const wStreak = document.getElementById('wStreak');
  const wNewBtn = document.getElementById('wNewBtn');

  let wAnswer = '', wCurRow = 0, wCurCol = 0, wDone = false, wGrid = [], wStreakNum = parseInt(localStorage.getItem('wordleStreak') || '0', 10);

  const wordle = {
    ready: false,
    init() {
      this.ready = true;
      buildBoard(); buildKeyboard(); resetGame();
    },
    stop() {} // keyboard-only, visibility-guarded - nothing to tear down
  };
  window.__wordle = wordle;

  function buildBoard() {
    wBoard.innerHTML = '';
    for (let r = 0; r < 6; r++) {
      const row = document.createElement('div');
      row.className = 'wordle-row';
      row.dataset.row = r;
      for (let c = 0; c < 5; c++) {
        const t = document.createElement('div');
        t.className = 'wordle-tile';
        t.dataset.row = r; t.dataset.col = c;
        row.appendChild(t);
      }
      wBoard.appendChild(row);
    }
  }
  function buildKeyboard() {
    const rows = ['QWERTYUIOP', 'ASDFGHJKL', '⏎ZXCVBNM⌫'];
    wKb.innerHTML = '';
    rows.forEach(r => {
      const rowEl = document.createElement('div');
      rowEl.className = 'wordle-kb-row';
      [...r].forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'wkey';
        if (ch === '⏎') { btn.classList.add('wide'); btn.textContent = 'Enter'; btn.dataset.key = 'ENTER'; }
        else if (ch === '⌫') { btn.classList.add('wide'); btn.textContent = 'Del'; btn.dataset.key = 'BACKSPACE'; }
        else { btn.textContent = ch; btn.dataset.key = ch; }
        btn.addEventListener('click', () => handleWKey(btn.dataset.key));
        rowEl.appendChild(btn);
      });
      wKb.appendChild(rowEl);
    });
  }
  function resetGame() {
    wAnswer = WORDS[Math.floor(Math.random() * WORDS.length)];
    wCurRow = 0; wCurCol = 0; wDone = false;
    wGrid = Array.from({length: 6}, () => ['','','','','']);
    wBoard.querySelectorAll('.wordle-tile').forEach(t => {
      t.textContent = ''; t.className = 'wordle-tile';
    });
    wKb.querySelectorAll('.wkey').forEach(k => k.className = k.classList.contains('wide') ? 'wkey wide' : 'wkey');
    wAttempt.textContent = '1 / 6';
    wStreak.textContent = wStreakNum;
    wStatus.textContent = '';
  }
  function handleWKey(k) {
    if (wDone) return;
    // Guard against a keypress arriving before resetGame() has built the grid
    // (deferred init) - wGrid[wCurRow] would be undefined and throw.
    if (!wGrid.length || !wGrid[wCurRow]) return;
    if (k === 'ENTER') return submitGuess();
    if (k === 'BACKSPACE') {
      if (wCurCol > 0) { wCurCol--; wGrid[wCurRow][wCurCol] = ''; updateTile(wCurRow, wCurCol); }
      return;
    }
    if (/^[A-Z]$/.test(k) && wCurCol < 5) {
      wGrid[wCurRow][wCurCol] = k;
      updateTile(wCurRow, wCurCol);
      wCurCol++;
    }
  }
  function updateTile(r, c) {
    const t = wBoard.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (!t) return;
    t.textContent = wGrid[r][c];
    t.classList.toggle('filled', !!wGrid[r][c]);
  }
  function submitGuess() {
    if (wCurCol !== 5) { flashRow('Not enough letters'); return; }
    const guess = wGrid[wCurRow].join('');
    // Score tiles
    const result = Array(5).fill('absent');
    const answerArr = wAnswer.split('');
    const used = Array(5).fill(false);
    // Pass 1: correct
    for (let i = 0; i < 5; i++) {
      if (guess[i] === answerArr[i]) { result[i] = 'correct'; used[i] = true; }
    }
    // Pass 2: present
    for (let i = 0; i < 5; i++) {
      if (result[i] === 'correct') continue;
      for (let j = 0; j < 5; j++) {
        if (!used[j] && guess[i] === answerArr[j]) { result[i] = 'present'; used[j] = true; break; }
      }
    }
    // Apply with staggered flip
    for (let i = 0; i < 5; i++) {
      const t = wBoard.querySelector(`[data-row="${wCurRow}"][data-col="${i}"]`);
      setTimeout(() => { t.classList.add(result[i]); }, i * 120);
      // Update key state (best state wins)
      const key = wKb.querySelector(`.wkey[data-key="${guess[i]}"]`);
      if (key) {
        if (result[i] === 'correct') { key.classList.remove('present','absent'); key.classList.add('correct'); }
        else if (result[i] === 'present' && !key.classList.contains('correct')) { key.classList.remove('absent'); key.classList.add('present'); }
        else if (result[i] === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) { key.classList.add('absent'); }
      }
    }
    // Check win/lose
    setTimeout(() => {
      if (guess === wAnswer) {
        wDone = true;
        wStreakNum++;
        localStorage.setItem('wordleStreak', wStreakNum);
        wStreak.textContent = wStreakNum;
        const msgs = ['Genius', 'Masterful', 'Brilliant', 'Sharp', 'Clutch', 'Whew'];
        wStatus.innerHTML = `<span class="text-gold">${msgs[Math.min(wCurRow, msgs.length-1)]}.</span> The word was <strong>${wAnswer}</strong>.`;
      } else {
        wCurRow++; wCurCol = 0;
        wAttempt.textContent = `${wCurRow + 1} / 6`;
        if (wCurRow >= 6) {
          wDone = true;
          wStreakNum = 0;
          localStorage.setItem('wordleStreak', 0);
          wStreak.textContent = 0;
          wStatus.innerHTML = `<span class="text-ox">Out of attempts.</span> The word was <strong>${wAnswer}</strong>.`;
        }
      }
    }, 700);
  }
  function flashRow(msg) {
    wStatus.textContent = msg;
    const row = wBoard.querySelector(`[data-row="${wCurRow}"]`);
    if (row) {
      row.classList.add('invalid');
      setTimeout(() => row.classList.remove('invalid'), 550);
    }
    setTimeout(() => { if (wStatus.textContent === msg) wStatus.textContent = ''; }, 1800);
  }

  // Keyboard input for Wordle (when tab is active)
  document.addEventListener('keydown', (e) => {
    const wordleTab = document.querySelector('.apanel[data-panel="wordle"]');
    if (!wordleTab || wordleTab.classList.contains('hidden')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter') { e.preventDefault(); handleWKey('ENTER'); }
    else if (e.key === 'Backspace') { e.preventDefault(); handleWKey('BACKSPACE'); }
    else if (/^[a-zA-Z]$/.test(e.key)) { handleWKey(e.key.toUpperCase()); }
  });

  if (wNewBtn) wNewBtn.addEventListener('click', resetGame);

  // Init wordle lazily - only build when first shown
  // (board built once on first tab activation)

  /* === TETRIS === */
  const tCanvas = document.getElementById('tetrisCanvas');
  const tCtx = tCanvas ? tCanvas.getContext('2d') : null;
  const tNextCanvas = document.getElementById('tetrisNext');
  const tNCtx = tNextCanvas ? tNextCanvas.getContext('2d') : null;
  const tScoreEl = document.getElementById('tScore');
  const tLinesEl = document.getElementById('tLines');
  const tLevelEl = document.getElementById('tLevel');
  const tStartBtn = document.getElementById('tStartBtn');
  const tRestartBtn = document.getElementById('tRestartBtn');
  const tGameOverEl = document.getElementById('tGameOver');
  const tFinalScoreEl = document.getElementById('tFinalScore');
  const tPlayAgain = document.getElementById('tPlayAgain');

  const T_COLS = 10, T_ROWS = 20, T_CELL = 24;
  // Colors tuned to palette
  const T_COLORS = {
    I: '#D4A843', // gold
    O: '#E8C77D', // light gold
    T: '#8B1A1A', // oxblood
    S: '#6B9B6B', // muted green
    Z: '#A83232', // red accent
    J: '#3A5EAF', // deep blue
    L: '#B88A2F'  // amber
  };
  const T_SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]]
  };
  const T_KEYS = Object.keys(T_SHAPES);

  let tBoard = [], tPiece = null, tNext = null, tScore = 0, tLines = 0, tLevel = 1;
  let tDropTimer = null, tDropInterval = 800, tRunning = false, tReady = false;

  const tetris = {
    ready: false,
    init() {
      if (this.ready || !tCanvas || !tCtx) return;
      this.ready = true;
      tBoard = tNewBoard();
      drawTBoard();
      tCtx.fillStyle = 'rgba(212,168,67,0.5)';
      tCtx.font = '600 11px "JetBrains Mono", monospace';
      tCtx.textAlign = 'center';
      tCtx.fillText('PRESS START TO PLAY', tCanvas.width/2, tCanvas.height/2);
    },
    stop() { tRunning = false; clearInterval(tDropTimer); }
  };
  window.__tetris = tetris;

  function tNewBoard() { return Array.from({length: T_ROWS}, () => Array(T_COLS).fill(0)); }
  function tSpawn() {
    const key = tNext || T_KEYS[Math.floor(Math.random() * T_KEYS.length)];
    tNext = T_KEYS[Math.floor(Math.random() * T_KEYS.length)];
    const shape = T_SHAPES[key].map(r => r.slice());
    const piece = { key, shape, x: Math.floor((T_COLS - shape[0].length) / 2), y: 0 };
    drawNextPiece();
    if (collides(piece, tBoard)) { tOver(); return null; }
    return piece;
  }
  function collides(piece, board) {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const nx = piece.x + c, ny = piece.y + r;
        if (nx < 0 || nx >= T_COLS || ny >= T_ROWS) return true;
        if (ny >= 0 && board[ny][nx]) return true;
      }
    }
    return false;
  }
  function merge(piece, board) {
    piece.shape.forEach((row, r) => row.forEach((v, c) => {
      if (v && piece.y + r >= 0) board[piece.y + r][piece.x + c] = piece.key;
    }));
  }
  function clearLines() {
    let cleared = 0;
    for (let r = T_ROWS - 1; r >= 0; r--) {
      if (tBoard[r].every(v => v)) {
        tBoard.splice(r, 1);
        tBoard.unshift(Array(T_COLS).fill(0));
        cleared++;
        r++;
      }
    }
    if (cleared) {
      const pts = [0, 100, 300, 500, 800][cleared] * tLevel;
      tScore += pts;
      tLines += cleared;
      tLevel = Math.floor(tLines / 10) + 1;
      tDropInterval = Math.max(100, 800 - (tLevel - 1) * 60);
      tScoreEl.textContent = tScore;
      tLinesEl.textContent = tLines;
      tLevelEl.textContent = tLevel;
      clearInterval(tDropTimer);
      tDropTimer = setInterval(tick, tDropInterval);
    }
  }
  function rotatePiece() {
    const old = tPiece.shape;
    const rows = old.length, cols = old[0].length;
    const rotated = Array.from({length: cols}, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        rotated[c][rows - 1 - r] = old[r][c];
    const test = { ...tPiece, shape: rotated };
    // Try wall kicks
    for (const dx of [0, -1, 1, -2, 2]) {
      test.x = tPiece.x + dx;
      if (!collides(test, tBoard)) { tPiece.shape = rotated; tPiece.x = test.x; return; }
    }
  }
  function move(dx, dy) {
    const test = { ...tPiece, x: tPiece.x + dx, y: tPiece.y + dy };
    if (!collides(test, tBoard)) { tPiece.x = test.x; tPiece.y = test.y; return true; }
    return false;
  }
  function hardDrop() {
    while (move(0, 1)) { tScore += 2; }
    tScoreEl.textContent = tScore;
    lockPiece();
  }
  function tick() {
    if (!tRunning) return;
    if (!move(0, 1)) lockPiece();
    drawTBoard(); drawPiece();
  }
  function lockPiece() {
    merge(tPiece, tBoard);
    clearLines();
    tPiece = tSpawn();
    if (!tPiece) return;
    drawTBoard(); drawPiece();
  }
  function drawTBoard() {
    if (!tCtx || !tCanvas) return;
    tCtx.fillStyle = '#050505';
    tCtx.fillRect(0, 0, tCanvas.width, tCanvas.height);
    // Grid
    tCtx.strokeStyle = 'rgba(212,168,67,0.05)';
    tCtx.lineWidth = 0.5;
    for (let x = 0; x <= tCanvas.width; x += T_CELL) {
      tCtx.beginPath(); tCtx.moveTo(x, 0); tCtx.lineTo(x, tCanvas.height); tCtx.stroke();
    }
    for (let y = 0; y <= tCanvas.height; y += T_CELL) {
      tCtx.beginPath(); tCtx.moveTo(0, y); tCtx.lineTo(tCanvas.width, y); tCtx.stroke();
    }
    // Settled blocks
    for (let r = 0; r < T_ROWS; r++) {
      for (let c = 0; c < T_COLS; c++) {
        if (tBoard[r][c]) drawBlock(tCtx, c, r, T_COLORS[tBoard[r][c]]);
      }
    }
  }
  function drawBlock(ctx, c, r, color) {
    const x = c * T_CELL, y = r * T_CELL, s = T_CELL;
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
    // Inner bevel
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x + 1, y + 1, s - 2, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 1, y + s - 3, s - 2, 2);
  }
  function drawPiece() {
    if (!tPiece) return;
    const color = T_COLORS[tPiece.key];
    tPiece.shape.forEach((row, r) => row.forEach((v, c) => {
      if (v && tPiece.y + r >= 0) drawBlock(tCtx, tPiece.x + c, tPiece.y + r, color);
    }));
    // Ghost piece
    const ghost = { ...tPiece, y: tPiece.y };
    while (!collides({ ...ghost, y: ghost.y + 1 }, tBoard)) ghost.y++;
    if (ghost.y > tPiece.y) {
      tCtx.save();
      tCtx.globalAlpha = .2;
      ghost.shape = tPiece.shape;
      tPiece.shape.forEach((row, r) => row.forEach((v, c) => {
        if (v) drawBlock(tCtx, ghost.x + c, ghost.y + r, color);
      }));
      tCtx.restore();
    }
  }
  function drawNextPiece() {
    if (!tNCtx || !tNextCanvas) return;
    tNCtx.fillStyle = '#050505';
    tNCtx.fillRect(0, 0, tNextCanvas.width, tNextCanvas.height);
    if (!tNext) return;
    const shape = T_SHAPES[tNext];
    const cell = 18;
    const w = shape[0].length * cell, h = shape.length * cell;
    const ox = (tNextCanvas.width - w) / 2, oy = (tNextCanvas.height - h) / 2;
    const color = T_COLORS[tNext];
    shape.forEach((row, r) => row.forEach((v, c) => {
      if (v) {
        const x = ox + c * cell, y = oy + r * cell;
        tNCtx.fillStyle = color;
        tNCtx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
        tNCtx.fillStyle = 'rgba(255,255,255,0.15)';
        tNCtx.fillRect(x + 1, y + 1, cell - 2, 2);
      }
    }));
  }
  function startTetris() {
    if (!tCanvas || !tCtx) return;
    tBoard = tNewBoard();
    tScore = 0; tLines = 0; tLevel = 1; tDropInterval = 800;
    if (tScoreEl) tScoreEl.textContent = '0';
    if (tLinesEl) tLinesEl.textContent = '0';
    if (tLevelEl) tLevelEl.textContent = '1';
    tNext = null;
    tPiece = tSpawn();
    tRunning = true;
    if (tGameOverEl) tGameOverEl.classList.remove('show');
    if (tStartBtn) tStartBtn.classList.add('hidden');
    if (tRestartBtn) tRestartBtn.classList.remove('hidden');
    clearInterval(tDropTimer);
    tDropTimer = setInterval(tick, tDropInterval);
    drawTBoard(); drawPiece();
  }
  function tOver() {
    tRunning = false;
    clearInterval(tDropTimer);
    if (tFinalScoreEl) tFinalScoreEl.textContent = tScore;
    if (tGameOverEl) tGameOverEl.classList.add('show');
    if (tStartBtn) tStartBtn.classList.add('hidden');
    if (tRestartBtn) tRestartBtn.classList.remove('hidden');
  }

  if (tStartBtn) tStartBtn.addEventListener('click', startTetris);
  if (tRestartBtn) tRestartBtn.addEventListener('click', startTetris);
  if (tPlayAgain) tPlayAgain.addEventListener('click', startTetris);

  document.addEventListener('keydown', (e) => {
    if (!tRunning) return;
    const panel = document.querySelector('.apanel[data-panel="tetris"]');
    if (!panel || panel.classList.contains('hidden')) return;
    if (!tCanvas || !tCtx) return;
    switch (e.key) {
      case 'ArrowLeft': move(-1, 0); drawTBoard(); drawPiece(); e.preventDefault(); break;
      case 'ArrowRight': move(1, 0); drawTBoard(); drawPiece(); e.preventDefault(); break;
      case 'ArrowDown':
        if (move(0, 1)) { tScore += 1; if (tScoreEl) tScoreEl.textContent = tScore; }
        drawTBoard(); drawPiece(); e.preventDefault(); break;
      case 'ArrowUp': rotatePiece(); drawTBoard(); drawPiece(); e.preventDefault(); break;
      case ' ': hardDrop(); e.preventDefault(); break;
    }
  });

  // Tetris touch controls
  document.querySelectorAll('.tetris-touch [data-t]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!tRunning || !tCanvas || !tCtx) return;
      const d = btn.dataset.t;
      if (d === 'left') move(-1, 0);
      else if (d === 'right') move(1, 0);
      else if (d === 'down') { if (move(0, 1)) { tScore += 1; if (tScoreEl) tScoreEl.textContent = tScore; } }
      else if (d === 'rotate') rotatePiece();
      else if (d === 'drop') hardDrop();
      drawTBoard(); drawPiece();
    });
  });

  // Eager init: draw initial board + "PRESS START" so tetris is ready at page load
  if (tCanvas && tCtx) { tetris.init(); }
  if (wBoard && wKb) { wordle.init(); }

  /* === DINOSAUR GAME === */
  const dinoCanvas = document.getElementById('dinoCanvas');
  const dinoCtx = dinoCanvas ? dinoCanvas.getContext('2d') : null;
  let dinoScore = 0, dinoBest = localStorage.getItem('dinoBest') || 0, dinoRunning = false, dinoGameOver = false;
  const dinoScoreEl = document.getElementById('dinoScore');
  const dinoBestEl = document.getElementById('dinoBest');
  const dinoGameOverEl = document.getElementById('dinoGameOver');
  const dinoFinalScoreEl = document.getElementById('dinoFinalScore');
  const dinoStartBtn = document.getElementById('dinoStartBtn');
  const dinoRestartBtn = document.getElementById('dinoRestartBtn');
  const dinoPlayAgain = document.getElementById('dinoPlayAgain');

  if (dinoBestEl) dinoBestEl.textContent = dinoBest;

  // Dino properties
  let dino = { x: 50, y: 0, w: 40, h: 50, vy: 0, jumping: false, ducking: false };
  let obstacles = [];
  let dinoGameSpeed = 6;
  let gameTime = 0;

  function drawDino() {
    if (!dinoCtx) return;
    const canvas = dinoCanvas;
    const ducking = dino.ducking && !dino.jumping;
    const effH = ducking ? 28 : dino.h;
    const groundY = canvas.height - effH - 10 + dino.y;

    // Shadow
    if (!dino.jumping) {
      dinoCtx.fillStyle = 'rgba(10,10,10,0.18)';
      dinoCtx.beginPath();
      dinoCtx.ellipse(dino.x + 22, canvas.height - 8, ducking ? 26 : 22, 3, 0, 0, Math.PI * 2);
      dinoCtx.fill();
    } else {
      const jumpProg = Math.min(Math.abs(dino.y) / 80, 1);
      dinoCtx.fillStyle = `rgba(10,10,10,${0.18 - jumpProg * 0.14})`;
      dinoCtx.beginPath();
      dinoCtx.ellipse(dino.x + 22, canvas.height - 8, 22 - jumpProg * 10, 3 - jumpProg * 1.5, 0, 0, Math.PI * 2);
      dinoCtx.fill();
    }

    const baseColor = '#1a1a1a';
    const accentColor = '#2a2a2a';
    dinoCtx.fillStyle = baseColor;

    if (ducking) {
      // Crouched pose - elongated, lower body, head forward
      dinoCtx.beginPath();
      dinoCtx.roundRect ? dinoCtx.roundRect(dino.x - 2, groundY + 8, 48, 18, 6) : dinoCtx.rect(dino.x - 2, groundY + 8, 48, 18);
      dinoCtx.fill();
      // Head pushed forward
      dinoCtx.beginPath();
      dinoCtx.roundRect ? dinoCtx.roundRect(dino.x + 34, groundY + 2, 22, 16, 4) : dinoCtx.rect(dino.x + 34, groundY + 2, 22, 16);
      dinoCtx.fill();
      // Eye
      dinoCtx.fillStyle = '#F5F2EC';
      dinoCtx.beginPath();
      dinoCtx.arc(dino.x + 48, groundY + 8, 2.5, 0, Math.PI * 2);
      dinoCtx.fill();
      dinoCtx.fillStyle = baseColor;
      dinoCtx.beginPath();
      dinoCtx.arc(dino.x + 49, groundY + 9, 1.3, 0, Math.PI * 2);
      dinoCtx.fill();
      // Little legs (quick shuffle)
      const legFrame = Math.floor(gameTime / 4) % 2;
      dinoCtx.fillRect(dino.x + 8, groundY + 26, 5, 6 - legFrame * 2);
      dinoCtx.fillRect(dino.x + 22, groundY + 26, 5, 4 + legFrame * 2);
      return;
    }

    // Standing pose
    // Tail
    dinoCtx.beginPath();
    dinoCtx.roundRect ? dinoCtx.roundRect(dino.x - 2, groundY + 14, 14, 14, 3) : dinoCtx.rect(dino.x - 2, groundY + 14, 14, 14);
    dinoCtx.fill();
    // Body
    dinoCtx.beginPath();
    dinoCtx.roundRect ? dinoCtx.roundRect(dino.x + 4, groundY + 10, 32, 30, 6) : dinoCtx.rect(dino.x + 4, groundY + 10, 32, 30);
    dinoCtx.fill();
    // Head
    dinoCtx.beginPath();
    dinoCtx.roundRect ? dinoCtx.roundRect(dino.x + 22, groundY - 2, 26, 22, 5) : dinoCtx.rect(dino.x + 22, groundY - 2, 26, 22);
    dinoCtx.fill();
    // Body highlight
    dinoCtx.fillStyle = accentColor;
    dinoCtx.fillRect(dino.x + 6, groundY + 12, 28, 2);
    dinoCtx.fillRect(dino.x + 24, groundY, 22, 2);
    // Eye whites
    dinoCtx.fillStyle = '#F5F2EC';
    dinoCtx.beginPath();
    dinoCtx.arc(dino.x + 40, groundY + 7, 3, 0, Math.PI * 2);
    dinoCtx.fill();
    // Pupil
    dinoCtx.fillStyle = baseColor;
    dinoCtx.beginPath();
    dinoCtx.arc(dino.x + 41, groundY + 8, 1.5, 0, Math.PI * 2);
    dinoCtx.fill();
    // Nostril + teeth
    dinoCtx.fillRect(dino.x + 46, groundY + 10, 2, 1.5);
    dinoCtx.fillStyle = '#F5F2EC';
    dinoCtx.fillRect(dino.x + 45, groundY + 16, 2, 2);
    // Running legs
    dinoCtx.fillStyle = baseColor;
    const legFrame = Math.floor(gameTime / 5) % 2;
    if (!dino.jumping) {
      dinoCtx.fillRect(dino.x + 12, groundY + 40, 6, 10 - legFrame * 3);
      dinoCtx.fillRect(dino.x + 24, groundY + 40, 6, 7 + legFrame * 3);
    } else {
      dinoCtx.fillRect(dino.x + 12, groundY + 40, 6, 5);
      dinoCtx.fillRect(dino.x + 24, groundY + 40, 6, 5);
    }
    // Arms
    dinoCtx.fillRect(dino.x + 34, groundY + 22, 5, 3);
  }

  function updateDino() {
    const groundY = dinoCanvas.height - dino.h - 10;
    if (dino.jumping) {
      dino.vy += 0.5;
      dino.y += dino.vy;
      if (dino.y >= 0) { dino.y = 0; dino.jumping = false; dino.vy = 0; }
    }
  }

  function drawObstacles() {
    if (!dinoCtx) return;
    obstacles.forEach(obs => {
      if (obs.type === 'bird') {
        // Flapping bird - two-frame animation
        obs.flap = (obs.flap || 0) + 1;
        const up = Math.floor(obs.flap / 8) % 2 === 0;
        const bx = obs.x, by = obs.y;
        dinoCtx.fillStyle = '#1a1a1a';
        // Body
        dinoCtx.fillRect(bx + 10, by + 6, 14, 6);
        // Head + beak
        dinoCtx.fillRect(bx + 22, by + 4, 6, 6);
        dinoCtx.fillStyle = '#C49A3C';
        dinoCtx.fillRect(bx + 28, by + 6, 4, 2);
        // Eye
        dinoCtx.fillStyle = '#F5F2EC';
        dinoCtx.fillRect(bx + 24, by + 5, 2, 2);
        // Wings
        dinoCtx.fillStyle = '#1a1a1a';
        if (up) {
          dinoCtx.fillRect(bx + 12, by - 2, 10, 5);
          dinoCtx.fillRect(bx + 8, by - 5, 6, 4);
        } else {
          dinoCtx.fillRect(bx + 12, by + 12, 10, 5);
          dinoCtx.fillRect(bx + 8, by + 14, 6, 4);
        }
        return;
      }
      // Cactus
      const y = dinoCanvas.height - obs.h - 10;
      dinoCtx.fillStyle = '#2d5a3d';
      dinoCtx.fillRect(obs.x + 6, y, 8, obs.h);
      dinoCtx.fillRect(obs.x, y + obs.h * 0.3, 6, 4);
      dinoCtx.fillRect(obs.x, y + obs.h * 0.3, 2, obs.h * 0.5);
      dinoCtx.fillRect(obs.x + 14, y + obs.h * 0.45, 6, 4);
      dinoCtx.fillRect(obs.x + 18, y + obs.h * 0.45, 2, obs.h * 0.4);
      dinoCtx.fillStyle = 'rgba(255,255,255,0.15)';
      dinoCtx.fillRect(obs.x + 6, y, 2, obs.h);
    });
  }

  function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
      obstacles[i].x -= dinoGameSpeed;
      if (obstacles[i].x + obstacles[i].w < 0) { obstacles.splice(i, 1); i--; dinoScore += 10; }
    }
    if (gameTime % 80 === 0) {
      // 70% cactus, 30% bird (after a warm-up)
      if (gameTime > 300 && Math.random() < 0.3) {
        // Bird at head height - must duck to avoid
        const by = dinoCanvas.height - 70 - Math.random() * 20;
        obstacles.push({ x: dinoCanvas.width, w: 32, h: 18, y: by, type: 'bird', flap: 0 });
      } else {
        const h = 36 + Math.random() * 22;
        obstacles.push({ x: dinoCanvas.width, w: 20, h: h, y: dinoCanvas.height - h - 10, type: 'cactus' });
      }
    }
  }

  function checkCollision() {
    const effH = dino.ducking ? 28 : dino.h;
    const dinoTop = dinoCanvas.height - effH - 10 + dino.y;
    const dinoBottom = dinoTop + effH;
    const dinoLeft = dino.x + 4;
    const dinoRight = dino.x + dino.w - 4;
    obstacles.forEach(obs => {
      const obsY = obs.y !== undefined ? obs.y : (dinoCanvas.height - obs.h - 10);
      const obsBottom = obsY + obs.h;
      if (dinoRight > obs.x + 2 && dinoLeft < obs.x + obs.w - 2 &&
          dinoBottom > obsY + 4 && dinoTop < obsBottom) {
        endDino();
      }
    });
  }

  let clouds = [
    { x: 100, y: 30, w: 40, speed: 0.4 },
    { x: 280, y: 50, w: 32, speed: 0.3 },
    { x: 480, y: 25, w: 48, speed: 0.5 }
  ];
  let mountains = [
    { x: 0, w: 180, h: 60 },
    { x: 160, w: 220, h: 80 },
    { x: 360, w: 180, h: 55 },
    { x: 500, w: 200, h: 70 }
  ];

  function drawDinoScene() {
    if (!dinoCtx) return;
    const w = dinoCanvas.width, h = dinoCanvas.height;
    // Gradient sky
    const sky = dinoCtx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#FFD89E');
    sky.addColorStop(0.5, '#FFA970');
    sky.addColorStop(1, '#FFE3C8');
    dinoCtx.fillStyle = sky;
    dinoCtx.fillRect(0, 0, w, h);
    // Sun
    const sunX = w * 0.8, sunY = h * 0.3;
    const sunGrad = dinoCtx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 60);
    sunGrad.addColorStop(0, 'rgba(255,240,200,0.95)');
    sunGrad.addColorStop(0.4, 'rgba(255,200,120,0.4)');
    sunGrad.addColorStop(1, 'rgba(255,200,120,0)');
    dinoCtx.fillStyle = sunGrad;
    dinoCtx.fillRect(sunX - 80, sunY - 80, 160, 160);
    dinoCtx.fillStyle = '#FFE8B8';
    dinoCtx.beginPath();
    dinoCtx.arc(sunX, sunY, 20, 0, Math.PI * 2);
    dinoCtx.fill();
    // Mountains (parallax, slow)
    mountains.forEach(m => {
      const mx = ((m.x - gameTime * 0.3) % (w + m.w) + (w + m.w)) % (w + m.w) - m.w;
      const my = h - m.h - 10;
      dinoCtx.fillStyle = 'rgba(139,26,26,0.35)';
      dinoCtx.beginPath();
      dinoCtx.moveTo(mx, h - 10);
      dinoCtx.lineTo(mx + m.w / 2, my);
      dinoCtx.lineTo(mx + m.w, h - 10);
      dinoCtx.closePath();
      dinoCtx.fill();
      // Snow cap
      dinoCtx.fillStyle = 'rgba(245,242,236,0.5)';
      dinoCtx.beginPath();
      dinoCtx.moveTo(mx + m.w / 2 - 10, my + 14);
      dinoCtx.lineTo(mx + m.w / 2, my);
      dinoCtx.lineTo(mx + m.w / 2 + 10, my + 14);
      dinoCtx.closePath();
      dinoCtx.fill();
    });
    // Clouds
    clouds.forEach(c => {
      c.x -= c.speed;
      if (c.x + c.w < 0) c.x = w + Math.random() * 80;
      drawCloud(c.x, c.y, c.w);
    });
    // Ground
    dinoCtx.fillStyle = '#C49A3C';
    dinoCtx.fillRect(0, h - 10, w, 10);
    dinoCtx.fillStyle = 'rgba(139,26,26,0.25)';
    dinoCtx.fillRect(0, h - 10, w, 1);
    // Ground speckles
    dinoCtx.fillStyle = 'rgba(10,10,10,0.15)';
    for (let i = 0; i < 8; i++) {
      const gx = ((i * 90 - gameTime * 4) % w + w) % w;
      dinoCtx.fillRect(gx, h - 6, 4, 1);
    }
  }

  function drawCloud(x, y, w) {
    dinoCtx.fillStyle = 'rgba(245,242,236,0.85)';
    dinoCtx.beginPath();
    dinoCtx.arc(x, y, w * 0.35, 0, Math.PI * 2);
    dinoCtx.arc(x + w * 0.3, y - 4, w * 0.3, 0, Math.PI * 2);
    dinoCtx.arc(x + w * 0.6, y, w * 0.32, 0, Math.PI * 2);
    dinoCtx.arc(x + w * 0.3, y + 4, w * 0.28, 0, Math.PI * 2);
    dinoCtx.fill();
  }

  function drawDinoGame() {
    if (!dinoCtx) return;
    drawDinoScene();
    drawObstacles();
    drawDino();
    if (dinoScoreEl) dinoScoreEl.textContent = dinoScore;
    if (dinoRunning) {
      updateDino(); updateObstacles(); checkCollision();
      gameTime++;
      dinoGameSpeed = 6 + (gameTime / 500);
      requestAnimationFrame(drawDinoGame);
    }
  }

  function startDino() {
    if (!dinoCanvas || !dinoCtx) return;
    dinoScore = 0; dino = { x: 50, y: 0, w: 40, h: 50, vy: 0, jumping: false, ducking: false };
    obstacles = []; gameTime = 0; dinoGameSpeed = 6; dinoRunning = true; dinoGameOver = false;
    if (dinoGameOverEl) dinoGameOverEl.classList.remove('show');
    if (dinoStartBtn) dinoStartBtn.classList.add('hidden');
    if (dinoRestartBtn) dinoRestartBtn.classList.remove('hidden');
    if (dinoScoreEl) dinoScoreEl.textContent = '0';
    drawDinoGame();
  }

  function endDino() {
    dinoRunning = false;
    if (dinoScore > dinoBest) { dinoBest = dinoScore; localStorage.setItem('dinoBest', dinoBest); if (dinoBestEl) dinoBestEl.textContent = dinoBest; }
    if (dinoFinalScoreEl) dinoFinalScoreEl.textContent = dinoScore;
    if (dinoGameOverEl) dinoGameOverEl.classList.add('show');
  }

  if (dinoStartBtn) dinoStartBtn.addEventListener('click', startDino);
  if (dinoRestartBtn) dinoRestartBtn.addEventListener('click', startDino);
  if (dinoPlayAgain) dinoPlayAgain.addEventListener('click', startDino);

  document.addEventListener('keydown', (e) => {
    if (!dinoRunning) return;
    const panel = document.querySelector('.apanel[data-panel="dino"]');
    if (!panel || panel.classList.contains('hidden')) return;
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !dino.jumping && !dino.ducking) {
      dino.jumping = true; dino.vy = -12; e.preventDefault();
    } else if (e.code === 'ArrowDown') {
      if (dino.jumping) { dino.vy += 3; /* soft drop */ }
      else { dino.ducking = true; }
      e.preventDefault();
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') dino.ducking = false;
  });

  // Touch buttons: jump (tap) + duck (hold)
  document.querySelectorAll('[data-dino]').forEach(btn => {
    const action = btn.dataset.dino;
    if (action === 'jump') {
      btn.addEventListener('click', () => {
        if (!dinoRunning) return;
        if (!dino.jumping && !dino.ducking) { dino.jumping = true; dino.vy = -12; }
      });
    } else if (action === 'duck') {
      const start = (e) => { if (!dinoRunning) return; if (!dino.jumping) dino.ducking = true; e.preventDefault(); };
      const end = () => { dino.ducking = false; };
      btn.addEventListener('pointerdown', start);
      btn.addEventListener('pointerup', end);
      btn.addEventListener('pointerleave', end);
      btn.addEventListener('pointercancel', end);
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end);
    }
  });

  // Register dino into the cabinet module system so switching tabs stops its loop.
  window.__dino = { ready: true, init(){}, stop(){ dinoRunning = false; } };

  /* ============================================================
     PORTED ARCADE GAMES - Flappy · Pong · Breakout · 2048 ·
     Minesweeper · Memory. Each is a self-contained IIFE exposing
     window.__name = { ready, init(), stop() }. init() lazily wires +
     renders on first tab-show; stop() cancels its RAF so background
     games never bleed. Adapted from the Daily Tool React originals.
  ============================================================ */

  /* ---------- FLAPPY ---------- */
  (function(){
    const cv = document.getElementById('flappyCanvas'); if (!cv) return;
    const ctx = cv.getContext('2d'); const W = cv.width, H = cv.height;
    const BIRD_X = 140, BIRD_R = 13, GRAVITY = 1500, FLAP = -400, GROUND = 40;
    const PIPE_W = 64, GAP = 145, SPACING = 220, SPEED = 155;
    const scoreEl = document.getElementById('flScore'), bestEl = document.getElementById('flBest');
    const finalEl = document.getElementById('flFinalScore'), overEl = document.getElementById('flGameOver');
    const startBtn = document.getElementById('flStartBtn'), againBtn = document.getElementById('flPlayAgain');
    let best = parseInt(localStorage.getItem('pwFlappyBest')||'0',10);
    let y, vy, pipes, score, running, raf, last;
    function addPipe(px){ const m=56; const gy=m+Math.random()*(H-GROUND-GAP-m*2); pipes.push({x:px,gapY:gy,passed:false}); }
    function reset(){ y=H/2; vy=0; score=0; pipes=[]; for(let i=0;i<4;i++) addPipe(W+120+i*SPACING); if(scoreEl)scoreEl.textContent='0'; }
    function flap(){ if(running) vy=FLAP; }
    function start(){ reset(); running=true; last=performance.now(); if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.textContent='Restart'; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
    function gameOver(){ running=false; if(score>best){best=score;localStorage.setItem('pwFlappyBest',String(best));} if(bestEl)bestEl.textContent=best; if(finalEl)finalEl.textContent=score; if(overEl)overEl.classList.add('show'); if(startBtn)startBtn.textContent='Start game'; }
    function loop(now){
      raf=requestAnimationFrame(loop);
      if(document.body.classList.contains('arcade-paused')){ last=now; return; }
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      if(running){
        vy+=GRAVITY*dt; y+=vy*dt;
        for(const p of pipes) p.x-=SPEED*dt;
        if(pipes.length && pipes[0].x<-PIPE_W){ pipes.shift(); addPipe(pipes[pipes.length-1].x+SPACING); }
        for(const p of pipes){ if(!p.passed && p.x+PIPE_W<BIRD_X){ p.passed=true; score++; if(scoreEl)scoreEl.textContent=score; } }
        if(y+BIRD_R>H-GROUND || y-BIRD_R<0){ y=Math.max(BIRD_R,Math.min(H-GROUND-BIRD_R,y)); gameOver(); }
        for(const p of pipes){ if(BIRD_X+BIRD_R>p.x && BIRD_X-BIRD_R<p.x+PIPE_W){ if(y-BIRD_R<p.gapY || y+BIRD_R>p.gapY+GAP){ gameOver(); break; } } }
      }
      draw();
    }
    function draw(){
      ctx.fillStyle='#050505'; ctx.fillRect(0,0,W,H);
      for(const p of pipes){
        ctx.fillStyle='#2F6E3B'; ctx.fillRect(p.x,0,PIPE_W,p.gapY); ctx.fillRect(p.x,p.gapY+GAP,PIPE_W,H-GROUND-(p.gapY+GAP));
        ctx.fillStyle='#3C8A4C'; ctx.fillRect(p.x-3,p.gapY-14,PIPE_W+6,14); ctx.fillRect(p.x-3,p.gapY+GAP,PIPE_W+6,14);
      }
      ctx.fillStyle='#1a1204'; ctx.fillRect(0,H-GROUND,W,GROUND); ctx.fillStyle='rgba(212,168,67,.4)'; ctx.fillRect(0,H-GROUND,W,2);
      ctx.save(); ctx.translate(BIRD_X,y); ctx.rotate(Math.max(-0.4,Math.min(0.7,vy/600)));
      ctx.fillStyle='#D4A843'; ctx.beginPath(); ctx.arc(0,0,BIRD_R,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1a1204'; ctx.beginPath(); ctx.arc(5,-3,2.4,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    document.addEventListener('keydown',(e)=>{ const p=document.querySelector('.apanel[data-panel="flappy"]'); if(!p||p.classList.contains('hidden'))return; if(e.code==='Space'||e.code==='ArrowUp'){ e.preventDefault(); if(running)flap(); else start(); } });
    cv.addEventListener('pointerdown',(e)=>{ e.preventDefault(); if(running)flap(); else start(); });
    if(startBtn)startBtn.addEventListener('click',start); if(againBtn)againBtn.addEventListener('click',start);
    window.__flappy={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); draw();
      ctx.fillStyle='rgba(245,242,236,.6)'; ctx.font='600 13px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillText('PRESS START · SPACE / TAP TO FLAP',W/2,26);
      if(bestEl)bestEl.textContent=best; }, stop(){ running=false; cancelAnimationFrame(raf); } };
  })();

  /* ---------- PONG ---------- */
  (function(){
    const cv=document.getElementById('pongCanvas'); if(!cv)return;
    const ctx=cv.getContext('2d'); const W=cv.width, H=cv.height;
    const PW=64, PH=10, PLAYER_Y=H-30, CPU_Y=20, BR=6, WIN=7, MAXB=7, CPUMAX=3.2;
    const pEl=document.getElementById('pgPlayer'), cEl=document.getElementById('pgCpu');
    const finalEl=document.getElementById('pgFinal'), labelEl=document.getElementById('pgResultLabel');
    const overEl=document.getElementById('pgGameOver'), startBtn=document.getElementById('pgStartBtn'), againBtn=document.getElementById('pgPlayAgain');
    let px, cx, ball, ps, cs, running, raf, last, keyL, keyR;
    function freshBall(dirY){ const a=(Math.random()*0.6-0.3), sp=3.2; ball={x:W/2,y:H/2,vx:Math.sin(a)*sp,vy:dirY*Math.abs(Math.cos(a))*sp}; }
    function upd(){ if(pEl)pEl.textContent=ps; if(cEl)cEl.textContent=cs; }
    function reset(){ px=W/2-PW/2; cx=W/2-PW/2; ps=0; cs=0; freshBall(Math.random()<.5?-1:1); upd(); }
    function start(){ reset(); running=true; last=performance.now(); if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.textContent='Restart'; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
    function endMatch(){ running=false; const win=ps>cs; if(labelEl)labelEl.textContent=win?'You win':'CPU wins'; if(finalEl)finalEl.textContent=ps+' '+cs; if(overEl)overEl.classList.add('show'); if(startBtn)startBtn.textContent='Start game'; }
    function score(player){ if(player)ps++; else cs++; upd(); if(ps>=WIN||cs>=WIN){ endMatch(); return; } freshBall(player?1:-1); }
    function clampBall(){ const s=Math.hypot(ball.vx,ball.vy); if(s>MAXB){ ball.vx*=MAXB/s; ball.vy*=MAXB/s; } }
    function loop(now){
      raf=requestAnimationFrame(loop);
      if(document.body.classList.contains('arcade-paused')){ last=now; return; }
      const f=Math.min(2.5,(now-last)/16.6667); last=now;
      if(running){
        if(keyL)px-=6*f; if(keyR)px+=6*f; px=Math.max(0,Math.min(W-PW,px));
        const d=(ball.x-PW/2)-cx; cx+=Math.max(-CPUMAX,Math.min(CPUMAX,d))*f; cx=Math.max(0,Math.min(W-PW,cx));
        ball.x+=ball.vx*f; ball.y+=ball.vy*f;
        if(ball.x-BR<0){ball.x=BR;ball.vx*=-1;} if(ball.x+BR>W){ball.x=W-BR;ball.vx*=-1;}
        if(ball.vy>0 && ball.y+BR>=PLAYER_Y && ball.y+BR<=PLAYER_Y+PH+8 && ball.x>=px-BR && ball.x<=px+PW+BR){ ball.y=PLAYER_Y-BR; const hit=(ball.x-(px+PW/2))/(PW/2); ball.vx=hit*5; ball.vy=-Math.abs(ball.vy)-0.2; clampBall(); }
        if(ball.vy<0 && ball.y-BR<=CPU_Y+PH && ball.y-BR>=CPU_Y-8 && ball.x>=cx-BR && ball.x<=cx+PW+BR){ ball.y=CPU_Y+PH+BR; const hit=(ball.x-(cx+PW/2))/(PW/2); ball.vx=hit*5; ball.vy=Math.abs(ball.vy)+0.2; clampBall(); }
        if(ball.y<-BR) score(true); else if(ball.y>H+BR) score(false);
      }
      draw();
    }
    function draw(){
      ctx.fillStyle='#050505'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(245,242,236,.15)'; ctx.setLineDash([6,8]); ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#D4A843'; ctx.fillRect(px,PLAYER_Y,PW,PH);
      ctx.fillStyle='rgba(245,242,236,.7)'; ctx.fillRect(cx,CPU_Y,PW,PH);
      ctx.fillStyle='#F5F2EC'; ctx.beginPath(); ctx.arc(ball?ball.x:W/2,ball?ball.y:H/2,BR,0,Math.PI*2); ctx.fill();
    }
    document.addEventListener('keydown',(e)=>{ const p=document.querySelector('.apanel[data-panel="pong"]'); if(!p||p.classList.contains('hidden'))return; if(e.code==='ArrowLeft'){keyL=true;e.preventDefault();} if(e.code==='ArrowRight'){keyR=true;e.preventDefault();} if(e.code==='Space'&&!running)start(); });
    document.addEventListener('keyup',(e)=>{ if(e.code==='ArrowLeft')keyL=false; if(e.code==='ArrowRight')keyR=false; });
    function dragTo(clientX){ const r=cv.getBoundingClientRect(); const rel=(clientX-r.left)/r.width*W; px=Math.max(0,Math.min(W-PW,rel-PW/2)); }
    cv.addEventListener('pointerdown',(e)=>{ e.preventDefault(); dragTo(e.clientX); }); cv.addEventListener('pointermove',(e)=>{ if(e.buttons)dragTo(e.clientX); });
    if(startBtn)startBtn.addEventListener('click',start); if(againBtn)againBtn.addEventListener('click',start);
    window.__pong={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); draw();
      ctx.fillStyle='rgba(245,242,236,.6)'; ctx.font='600 12px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillText('PRESS START',W/2,H/2-14); }, stop(){ running=false; cancelAnimationFrame(raf); keyL=keyR=false; } };
  })();

  /* ---------- BREAKOUT ---------- */
  (function(){
    const cv=document.getElementById('breakoutCanvas'); if(!cv)return;
    const ctx=cv.getContext('2d'); const W=cv.width, H=cv.height;
    const PW=70, PH=9, PADDLE_Y=H-36, BR=5;
    const ROWS=5, COLS=9, BW=38, BH=14, PADX=4, PADY=6, TOP=44;
    const colors=['#8B1A1A','#C9952B','#D4A843','#2F6E3B','#3C6E8B'], pts=[50,40,30,20,10];
    const scoreEl=document.getElementById('bkScore'), bestEl=document.getElementById('bkBest'), livesEl=document.getElementById('bkLives');
    const finalEl=document.getElementById('bkFinal'), labelEl=document.getElementById('bkResultLabel');
    const overEl=document.getElementById('bkGameOver'), startBtn=document.getElementById('bkStartBtn'), againBtn=document.getElementById('bkPlayAgain');
    let best=parseInt(localStorage.getItem('pwBreakoutBest')||'0',10);
    let paddleX, ball, bricks, score, lives, running, launched, raf, last, keyL, keyR;
    function makeBricks(){ const arr=[]; const sx=(W-(COLS*BW+(COLS-1)*PADX))/2; for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)arr.push({x:sx+c*(BW+PADX),y:TOP+r*(BH+PADY),w:BW,h:BH,color:colors[r],points:pts[r],alive:true}); return arr; }
    function resetBall(){ ball={x:paddleX+PW/2,y:PADDLE_Y-BR-1,vx:0,vy:0}; launched=false; }
    function upd(){ if(scoreEl)scoreEl.textContent=score; if(livesEl)livesEl.textContent=lives; }
    function reset(){ paddleX=W/2-PW/2; bricks=makeBricks(); score=0; lives=3; resetBall(); upd(); }
    function launch(){ if(launched)return; launched=true; ball.vx=110*(Math.random()<.5?-1:1); ball.vy=-240; }
    function start(){ reset(); running=true; last=performance.now(); if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.textContent='Restart'; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
    function endGame(win){ running=false; if(score>best){best=score;localStorage.setItem('pwBreakoutBest',String(best));} if(bestEl)bestEl.textContent=best; if(labelEl)labelEl.textContent=win?'Cleared!':'Game over'; if(finalEl)finalEl.textContent=score; if(overEl)overEl.classList.add('show'); if(startBtn)startBtn.textContent='Start game'; }
    function ballHits(b){ const cx=Math.max(b.x,Math.min(ball.x,b.x+b.w)), cy=Math.max(b.y,Math.min(ball.y,b.y+b.h)); const dx=ball.x-cx, dy=ball.y-cy; if(dx*dx+dy*dy>=BR*BR)return null; return (BR-Math.abs(dx))<(BR-Math.abs(dy))?'x':'y'; }
    function loop(now){
      raf=requestAnimationFrame(loop);
      if(document.body.classList.contains('arcade-paused')){ last=now; return; }
      const dt=Math.min(0.04,(now-last)/1000); last=now;
      if(running){
        if(keyL)paddleX-=320*dt; if(keyR)paddleX+=320*dt; paddleX=Math.max(0,Math.min(W-PW,paddleX));
        if(!launched){ ball.x=paddleX+PW/2; }
        else{
          ball.x+=ball.vx*dt; ball.y+=ball.vy*dt;
          if(ball.x-BR<0){ball.x=BR;ball.vx*=-1;} if(ball.x+BR>W){ball.x=W-BR;ball.vx*=-1;} if(ball.y-BR<0){ball.y=BR;ball.vy*=-1;}
          if(ball.vy>0 && ball.y+BR>=PADDLE_Y && ball.y+BR<=PADDLE_Y+PH+6 && ball.x>=paddleX-BR && ball.x<=paddleX+PW+BR){ const t=Math.max(0.05,Math.min(0.95,(ball.x-paddleX)/PW)); const ang=(t-0.5)*120*Math.PI/180; const sp=Math.max(260,Math.hypot(ball.vx,ball.vy)); ball.vx=Math.sin(ang)*sp; ball.vy=-Math.abs(Math.cos(ang)*sp); ball.y=PADDLE_Y-BR; }
          for(const b of bricks){ if(!b.alive)continue; const hit=ballHits(b); if(hit){ b.alive=false; score+=b.points; upd(); if(hit==='x')ball.vx*=-1; else ball.vy*=-1; break; } }
          if(bricks.every(b=>!b.alive)) endGame(true);
          if(ball.y-BR>H){ lives--; upd(); if(lives<=0) endGame(false); else resetBall(); }
        }
      }
      draw();
    }
    function draw(){
      ctx.fillStyle='#050505'; ctx.fillRect(0,0,W,H);
      for(const b of bricks){ if(!b.alive)continue; ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,b.w,b.h); }
      ctx.fillStyle='#D4A843'; ctx.fillRect(paddleX,PADDLE_Y,PW,PH);
      if(ball){ ctx.fillStyle='#F5F2EC'; ctx.beginPath(); ctx.arc(ball.x,ball.y,BR,0,Math.PI*2); ctx.fill(); }
    }
    document.addEventListener('keydown',(e)=>{ const p=document.querySelector('.apanel[data-panel="breakout"]'); if(!p||p.classList.contains('hidden'))return; if(e.code==='ArrowLeft'){keyL=true;e.preventDefault();} if(e.code==='ArrowRight'){keyR=true;e.preventDefault();} if(e.code==='Space'){ e.preventDefault(); if(!running)start(); else launch(); } });
    document.addEventListener('keyup',(e)=>{ if(e.code==='ArrowLeft')keyL=false; if(e.code==='ArrowRight')keyR=false; });
    function moveTo(clientX){ const r=cv.getBoundingClientRect(); const rel=(clientX-r.left)/r.width*W; paddleX=Math.max(0,Math.min(W-PW,rel-PW/2)); }
    cv.addEventListener('pointerdown',(e)=>{ e.preventDefault(); moveTo(e.clientX); if(running)launch(); else start(); }); cv.addEventListener('pointermove',(e)=>{ if(e.buttons)moveTo(e.clientX); });
    if(startBtn)startBtn.addEventListener('click',start); if(againBtn)againBtn.addEventListener('click',start);
    window.__breakout={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); draw(); if(bestEl)bestEl.textContent=best;
      ctx.fillStyle='rgba(245,242,236,.6)'; ctx.font='600 12px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillText('PRESS START · SPACE TO LAUNCH',W/2,H-12); }, stop(){ running=false; cancelAnimationFrame(raf); keyL=keyR=false; } };
  })();

  /* ---------- 2048 ---------- */
  (function(){
    const boardEl=document.getElementById('tfBoard'); if(!boardEl)return;
    const scoreEl=document.getElementById('tfScore'), bestEl=document.getElementById('tfBest');
    const finalEl=document.getElementById('tfFinal'), labelEl=document.getElementById('tfResultLabel');
    const overEl=document.getElementById('tfGameOver'), newBtn=document.getElementById('tfNewBtn'), againBtn=document.getElementById('tfPlayAgain');
    const SIZE=4; let grid, score, best=parseInt(localStorage.getItem('pwG2048Best')||'0',10), over, cells=[];
    function empty(){ return Array.from({length:SIZE},()=>Array(SIZE).fill(0)); }
    function build(){ boardEl.innerHTML=''; cells=[]; for(let i=0;i<SIZE*SIZE;i++){ const d=document.createElement('div'); d.className='tf-cell tf-v0'; boardEl.appendChild(d); cells.push(d); } }
    function addTile(){ const free=[]; for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(grid[r][c]===0)free.push([r,c]); if(!free.length)return; const [r,c]=free[Math.floor(Math.random()*free.length)]; grid[r][c]=Math.random()<.9?2:4; }
    function render(){ for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){ const v=grid[r][c], el=cells[r*SIZE+c]; el.textContent=v?v:''; el.className='tf-cell tf-v'+(v>2048?'big':v); } if(scoreEl)scoreEl.textContent=score; if(bestEl)bestEl.textContent=best; }
    function slideRow(row){ const a=row.filter(x=>x); for(let i=0;i<a.length-1;i++){ if(a[i]===a[i+1]){ a[i]*=2; score+=a[i]; a.splice(i+1,1); } } while(a.length<SIZE)a.push(0); return a; }
    function transpose(g){ const n=empty(); for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)n[c][r]=g[r][c]; return n; }
    function moveLeft(g){ return g.map(slideRow); }
    function moveRight(g){ return g.map(r=>slideRow(r.slice().reverse()).reverse()); }
    function moveUp(g){ return transpose(moveLeft(transpose(g))); }
    function moveDown(g){ return transpose(moveRight(transpose(g))); }
    function eq(a,b){ for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(a[r][c]!==b[r][c])return false; return true; }
    function hasMoves(){ for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){ if(grid[r][c]===0)return true; if(c<SIZE-1&&grid[r][c]===grid[r][c+1])return true; if(r<SIZE-1&&grid[r][c]===grid[r+1][c])return true; } return false; }
    function move(dir){ if(over)return; let g; if(dir===0)g=moveLeft(grid); else if(dir===2)g=moveRight(grid); else if(dir===1)g=moveUp(grid); else g=moveDown(grid); if(eq(g,grid))return; grid=g; addTile(); render(); if(!hasMoves()){ over=true; if(score>best){best=score;localStorage.setItem('pwG2048Best',String(best));} if(bestEl)bestEl.textContent=best; if(finalEl)finalEl.textContent=score; if(labelEl)labelEl.textContent='No moves left'; if(overEl)overEl.classList.add('show'); } }
    function reset(){ grid=empty(); score=0; over=false; addTile(); addTile(); if(overEl)overEl.classList.remove('show'); render(); }
    document.addEventListener('keydown',(e)=>{ const p=document.querySelector('.apanel[data-panel="g2048"]'); if(!p||p.classList.contains('hidden'))return; let d=-1; const k=e.key.toLowerCase(); if(e.code==='ArrowLeft'||k==='a')d=0; else if(e.code==='ArrowUp'||k==='w')d=1; else if(e.code==='ArrowRight'||k==='d')d=2; else if(e.code==='ArrowDown'||k==='s')d=3; if(d>=0){ e.preventDefault(); move(d); } });
    let sx,sy; boardEl.addEventListener('touchstart',(e)=>{ sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
    boardEl.addEventListener('touchend',(e)=>{ const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy; if(Math.abs(dx)<24&&Math.abs(dy)<24)return; if(Math.abs(dx)>Math.abs(dy))move(dx>0?2:0); else move(dy>0?3:1); },{passive:true});
    if(newBtn)newBtn.addEventListener('click',reset); if(againBtn)againBtn.addEventListener('click',reset);
    window.__g2048={ ready:false, init(){ if(!this.ready){ this.ready=true; build(); reset(); } }, stop(){} };
  })();

  /* ---------- MINESWEEPER ---------- */
  (function(){
    const boardEl=document.getElementById('msBoard'); if(!boardEl)return;
    const minesEl=document.getElementById('msMines'), timeEl=document.getElementById('msTime');
    const finalEl=document.getElementById('msFinal'), labelEl=document.getElementById('msResultLabel');
    const overEl=document.getElementById('msGameOver'), againBtn=document.getElementById('msPlayAgain'), flagBtn=document.getElementById('msFlagBtn');
    const LEVELS={easy:{rows:9,cols:9,mines:10},medium:{rows:12,cols:10,mines:25},hard:{rows:16,cols:12,mines:45}};
    let level='easy', grid, revealed, flagged, mines, cols, rows, dead, won, timer, time, flagMode=false, firstClick;
    function newGame(){
      const L=LEVELS[level]; rows=L.rows; cols=L.cols; mines=L.mines;
      grid=[]; revealed=[]; flagged=[]; dead=false; won=false; time=0; firstClick=true; clearInterval(timer);
      for(let r=0;r<rows;r++){ grid.push(Array(cols).fill(0)); revealed.push(Array(cols).fill(false)); flagged.push(Array(cols).fill(false)); }
      if(minesEl)minesEl.textContent=mines; if(timeEl)timeEl.textContent='0s'; if(overEl)overEl.classList.remove('show');
      boardEl.style.gridTemplateColumns='repeat('+cols+',1fr)'; boardEl.style.maxWidth=(cols*32)+'px';
      build();
    }
    function placeMines(sr,sc){
      let placed=0;
      while(placed<mines){ const r=Math.floor(Math.random()*rows), c=Math.floor(Math.random()*cols); if(grid[r][c]===-1)continue; if(Math.abs(r-sr)<=1&&Math.abs(c-sc)<=1)continue; grid[r][c]=-1; placed++; }
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ if(grid[r][c]===-1)continue; let n=0; for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){ const nr=r+dr,nc=c+dc; if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&grid[nr][nc]===-1)n++; } grid[r][c]=n; }
    }
    function flood(sr,sc){ const q=[[sr,sc]]; while(q.length){ const [r,c]=q.shift(); if(r<0||r>=rows||c<0||c>=cols||revealed[r][c]||flagged[r][c])continue; revealed[r][c]=true; if(grid[r][c]===0){ for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)q.push([r+dr,c+dc]); } } }
    function reveal(r,c){
      if(dead||won||revealed[r][c]||flagged[r][c])return;
      if(firstClick){ placeMines(r,c); firstClick=false; clearInterval(timer); timer=setInterval(()=>{ time++; if(timeEl)timeEl.textContent=time+'s'; },1000); }
      if(grid[r][c]===-1){ dead=true; revealed[r][c]=true; clearInterval(timer); render(); endGame(false); return; }
      if(grid[r][c]===0)flood(r,c); else revealed[r][c]=true;
      render(); checkWin();
    }
    function toggleFlag(r,c){ if(dead||won||revealed[r][c])return; flagged[r][c]=!flagged[r][c]; render(); }
    function checkWin(){ let safe=0; for(let r=0;r<rows;r++)for(let c=0;c<cols;c++) if(grid[r][c]!==-1&&revealed[r][c])safe++; if(safe===rows*cols-mines){ won=true; clearInterval(timer); endGame(true); } }
    function endGame(victory){ if(labelEl){ labelEl.textContent=victory?'Cleared!':'Boom'; labelEl.className='eyebrow mb-2 '+(victory?'text-gold':'text-ox'); } if(finalEl)finalEl.textContent=time+'s'; if(overEl)overEl.classList.add('show'); }
    function build(){ boardEl.innerHTML=''; for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ const cell=document.createElement('button'); cell.className='ms-cell'; cell.dataset.r=r; cell.dataset.c=c; boardEl.appendChild(cell); } render(); }
    function render(){
      const kids=boardEl.children;
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ const el=kids[r*cols+c]; let cls='ms-cell', txt='';
        if(flagged[r][c]){ cls+=' flagged'; txt='⚑'; }
        if(revealed[r][c]){ cls+=' revealed'; if(grid[r][c]===-1){ cls+=' '+(dead?'exploded':'mine'); txt='✷'; } else if(grid[r][c]>0){ cls+=' ms-n'+grid[r][c]; txt=grid[r][c]; } }
        else if(dead && grid[r][c]===-1 && !flagged[r][c]){ cls+=' mine'; txt='✷'; }
        el.className=cls; el.textContent=txt;
      }
    }
    let lpTimer;
    boardEl.addEventListener('pointerdown',(e)=>{ const cell=e.target.closest('.ms-cell'); if(!cell)return; const r=+cell.dataset.r,c=+cell.dataset.c; lpTimer=setTimeout(()=>{ lpTimer=null; toggleFlag(r,c); },500); });
    boardEl.addEventListener('pointerup',(e)=>{ const cell=e.target.closest('.ms-cell'); if(!cell)return; const r=+cell.dataset.r,c=+cell.dataset.c; if(lpTimer){ clearTimeout(lpTimer); lpTimer=null; if(flagMode)toggleFlag(r,c); else reveal(r,c); } });
    boardEl.addEventListener('pointerleave',()=>{ if(lpTimer){ clearTimeout(lpTimer); lpTimer=null; } });
    boardEl.addEventListener('contextmenu',(e)=>{ e.preventDefault(); const cell=e.target.closest('.ms-cell'); if(!cell)return; toggleFlag(+cell.dataset.r,+cell.dataset.c); });
    document.querySelectorAll('[data-ms-diff]').forEach(b=>b.addEventListener('click',()=>{ level=b.dataset.msDiff; document.querySelectorAll('[data-ms-diff]').forEach(x=>x.classList.toggle('is-active',x===b)); newGame(); }));
    if(flagBtn)flagBtn.addEventListener('click',()=>{ flagMode=!flagMode; flagBtn.textContent='Flag: '+(flagMode?'ON':'OFF'); flagBtn.setAttribute('aria-pressed',flagMode?'true':'false'); });
    if(againBtn)againBtn.addEventListener('click',newGame);
    window.__mines={ ready:false, init(){ if(!this.ready){ this.ready=true; newGame(); } }, stop(){ clearInterval(timer); } };
  })();

  /* ---------- MEMORY MATCH ---------- */
  (function(){
    const boardEl=document.getElementById('mmBoard'); if(!boardEl)return;
    const movesEl=document.getElementById('mmMoves'), bestEl=document.getElementById('mmBest');
    const finalEl=document.getElementById('mmFinal'), overEl=document.getElementById('mmGameOver');
    const newBtn=document.getElementById('mmNewBtn'), againBtn=document.getElementById('mmPlayAgain');
    const SYMBOLS=['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R'];
    const SIZES={'4x3':{cols:4,pairs:6},'4x4':{cols:4,pairs:8},'5x4':{cols:5,pairs:10}};
    let size='4x4', cards, flipped, matched, moves, lock, best=JSON.parse(localStorage.getItem('pwMemoryBest')||'{}');
    function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
    function newGame(){
      const {cols,pairs}=SIZES[size]; const syms=SYMBOLS.slice(0,pairs); let deck=[];
      syms.forEach(s=>{ deck.push(s); deck.push(s); }); cards=shuffle(deck);
      flipped=[]; matched=new Set(); moves=0; lock=false;
      if(movesEl)movesEl.textContent='0'; if(bestEl)bestEl.textContent=best[size]||''; if(overEl)overEl.classList.remove('show');
      boardEl.style.gridTemplateColumns='repeat('+cols+',1fr)';
      build();
    }
    function build(){ boardEl.innerHTML=''; cards.forEach((sym,i)=>{ const c=document.createElement('button'); c.className='mm-card'; c.dataset.i=i; boardEl.appendChild(c); }); }
    function render(){ const kids=boardEl.children; cards.forEach((sym,i)=>{ const el=kids[i]; const isF=flipped.includes(i)||matched.has(i); el.className='mm-card'+(matched.has(i)?' matched':(isF?' flipped':'')); el.textContent=isF?sym:''; }); }
    function flip(i){ if(lock||flipped.includes(i)||matched.has(i))return; flipped.push(i); render();
      if(flipped.length===2){ moves++; if(movesEl)movesEl.textContent=moves; const [a,b]=flipped;
        if(cards[a]===cards[b]){ matched.add(a); matched.add(b); flipped=[]; render(); if(matched.size===cards.length)win(); }
        else{ lock=true; setTimeout(()=>{ flipped=[]; lock=false; render(); },800); }
      }
    }
    function win(){ const prev=best[size]; if(prev==null||moves<prev){ best[size]=moves; localStorage.setItem('pwMemoryBest',JSON.stringify(best)); } if(bestEl)bestEl.textContent=best[size]; if(finalEl)finalEl.textContent=moves; if(overEl)overEl.classList.add('show'); }
    boardEl.addEventListener('click',(e)=>{ const c=e.target.closest('.mm-card'); if(!c)return; flip(+c.dataset.i); });
    document.querySelectorAll('[data-mm-size]').forEach(b=>b.addEventListener('click',()=>{ size=b.dataset.mmSize; document.querySelectorAll('[data-mm-size]').forEach(x=>x.classList.toggle('is-active',x===b)); newGame(); }));
    if(newBtn)newBtn.addEventListener('click',newGame); if(againBtn)againBtn.addEventListener('click',newGame);
    window.__memory={ ready:false, init(){ if(!this.ready){ this.ready=true; newGame(); } }, stop(){} };
  })();

  /* ============================================================
     EXPANSION GAMES - Air Hockey (2P) · Connect Four (2P) ·
     Muncher · Invaders · Asteroids · Crossing · Sequence · Towers.
     Same self-contained-IIFE / window.__name contract as above.
  ============================================================ */

  function panelVisible(name){ const p=document.querySelector('.apanel[data-panel="'+name+'"]'); return p && !p.classList.contains('hidden'); }

  /* ---------- AIR HOCKEY (2 player) ---------- */
  (function(){
    const cv=document.getElementById('ahCanvas'); if(!cv)return;
    const ctx=cv.getContext('2d'); const W=cv.width, H=cv.height;
    const PR=22, KR=9, WIN=7, GW=120, GX0=(W-GW)/2, GX1=(W+GW)/2;
    const p1El=document.getElementById('ahP1'), p2El=document.getElementById('ahP2');
    const overEl=document.getElementById('ahOver'), winEl=document.getElementById('ahWinner');
    const startBtn=document.getElementById('ahStart'), againBtn=document.getElementById('ahAgain');
    let p1,p2,puck,s1,s2,running,raf,last,keys={};
    function reset(serveTo){ p1={x:W/2,y:H-70}; p2={x:W/2,y:70}; puck={x:W/2,y:H/2,vx:0,vy:(serveTo===1?3:-3)}; }
    function full(){ s1=0; s2=0; reset(Math.random()<.5?1:2); upd(); }
    function upd(){ if(p1El)p1El.textContent=s1; if(p2El)p2El.textContent=s2; }
    function start(){ full(); running=true; last=performance.now(); if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.textContent='Restart'; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
    function over(){ running=false; if(winEl)winEl.textContent=(s1>=WIN?'P1 wins':'P2 wins'); if(overEl)overEl.classList.add('show'); if(startBtn)startBtn.textContent='Start match'; }
    function score(forP1){ if(forP1)s1++; else s2++; upd(); if(s1>=WIN||s2>=WIN){ over(); return; } reset(forP1?2:1); }
    function movePaddle(p,dx,dy,loY,hiY){ p.x+=dx; p.y+=dy; p.x=Math.max(PR,Math.min(W-PR,p.x)); p.y=Math.max(loY,Math.min(hiY,p.y)); }
    function collide(p){ const dx=puck.x-p.x, dy=puck.y-p.y, d=Math.hypot(dx,dy); if(d<PR+KR && d>0){ const nx=dx/d, ny=dy/d; puck.x=p.x+nx*(PR+KR); puck.y=p.y+ny*(PR+KR); const sp=Math.max(4,Math.hypot(puck.vx,puck.vy)); puck.vx=nx*sp+ (p._lx||0)*0.4; puck.vy=ny*sp+(p._ly||0)*0.4; } }
    function loop(now){
      raf=requestAnimationFrame(loop);
      if(document.body.classList.contains('arcade-paused')){ last=now; return; }
      const f=Math.min(2.5,(now-last)/16.6667); last=now;
      if(running){
        const sp=5*f;
        const p1px=((keys['d']?1:0)-(keys['a']?1:0))*sp, p1py=((keys['s']?1:0)-(keys['w']?1:0))*sp;
        const p2px=((keys['ArrowRight']?1:0)-(keys['ArrowLeft']?1:0))*sp, p2py=((keys['ArrowDown']?1:0)-(keys['ArrowUp']?1:0))*sp;
        p1._lx=p1px; p1._ly=p1py; p2._lx=p2px; p2._ly=p2py;
        movePaddle(p1,p1px,p1py,H/2+PR,H-PR); movePaddle(p2,p2px,p2py,PR,H/2-PR);
        puck.x+=puck.vx*f; puck.y+=puck.vy*f; puck.vx*=0.997; puck.vy*=0.997;
        if(puck.x-KR<0){puck.x=KR;puck.vx*=-1;} if(puck.x+KR>W){puck.x=W-KR;puck.vx*=-1;}
        if(puck.y-KR<0){ if(puck.x>GX0&&puck.x<GX1) score(true); else {puck.y=KR;puck.vy*=-1;} }
        if(puck.y+KR>H){ if(puck.x>GX0&&puck.x<GX1) score(false); else {puck.y=H-KR;puck.vy*=-1;} }
        collide(p1); collide(p2);
      }
      draw();
    }
    function draw(){
      ctx.fillStyle='#070707'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(245,242,236,.12)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W/2,H/2,46,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle='rgba(212,168,67,.7)'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(GX0,2); ctx.lineTo(GX1,2); ctx.moveTo(GX0,H-2); ctx.lineTo(GX1,H-2); ctx.stroke();
      ctx.fillStyle='#D4A843'; ctx.beginPath(); ctx.arc(p1.x,p1.y,PR,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#9fb7c9'; ctx.beginPath(); ctx.arc(p2.x,p2.y,PR,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#F5F2EC'; ctx.beginPath(); ctx.arc(puck.x,puck.y,KR,0,Math.PI*2); ctx.fill();
    }
    document.addEventListener('keydown',(e)=>{ if(!panelVisible('airhockey'))return; const k=e.key; if(['w','a','s','d'].includes(k.toLowerCase())||k.startsWith('Arrow')){ keys[k.length===1?k.toLowerCase():k]=true; e.preventDefault(); } if(k===' '&&!running){ e.preventDefault(); start(); } });
    document.addEventListener('keyup',(e)=>{ const k=e.key; keys[k.length===1?k.toLowerCase():k]=false; });
    document.querySelectorAll('[data-ah]').forEach(b=>{ const map={p1l:'a',p1r:'d',p2l:'ArrowLeft',p2r:'ArrowRight'}; const key=map[b.dataset.ah]; const dn=(e)=>{e.preventDefault();keys[key]=true;}, up=()=>{keys[key]=false;}; b.addEventListener('pointerdown',dn); b.addEventListener('pointerup',up); b.addEventListener('pointerleave',up); });
    if(startBtn)startBtn.addEventListener('click',start); if(againBtn)againBtn.addEventListener('click',start);
    window.__airhockey={ ready:false, init(){ if(this.ready)return; this.ready=true; full(); draw();
      ctx.fillStyle='rgba(245,242,236,.6)'; ctx.font='600 12px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillText('PRESS START',W/2,H/2-58); }, stop(){ running=false; cancelAnimationFrame(raf); keys={}; } };
  })();

  /* ---------- CONNECT FOUR (2 player) ---------- */
  (function(){
    const boardEl=document.getElementById('c4Board'); if(!boardEl)return;
    const statusEl=document.getElementById('c4Status'), overEl=document.getElementById('c4Over'), winEl=document.getElementById('c4Winner');
    const resetBtn=document.getElementById('c4Reset'), againBtn=document.getElementById('c4Again');
    const COLS=7, ROWS=6; let grid, turn, done, cells=[];
    function build(){ boardEl.innerHTML=''; cells=[]; for(let i=0;i<COLS*ROWS;i++){ const d=document.createElement('div'); d.className='c4-cell'; d.dataset.col=i%COLS; boardEl.appendChild(d); cells.push(d); } }
    function reset(){ grid=Array.from({length:ROWS},()=>Array(COLS).fill(0)); turn=1; done=false; if(overEl)overEl.classList.remove('show'); if(statusEl)statusEl.textContent="Red's turn"; render(); }
    function render(winCells){ for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ const el=cells[r*COLS+c]; el.className='c4-cell'+(grid[r][c]===1?' c4-r':grid[r][c]===2?' c4-y':''); if(winCells&&winCells.some(p=>p[0]===r&&p[1]===c))el.classList.add('c4-win'); } }
    function winLine(r,c,p){ const dirs=[[0,1],[1,0],[1,1],[1,-1]]; for(const [dr,dc] of dirs){ const line=[[r,c]]; for(let s=1;s<4;s++){ const nr=r+dr*s,nc=c+dc*s; if(nr<0||nr>=ROWS||nc<0||nc>=COLS||grid[nr][nc]!==p)break; line.push([nr,nc]); } for(let s=1;s<4;s++){ const nr=r-dr*s,nc=c-dc*s; if(nr<0||nr>=ROWS||nc<0||nc>=COLS||grid[nr][nc]!==p)break; line.push([nr,nc]); } if(line.length>=4)return line.slice(0,4); } return null; }
    function drop(col){ if(done)return; let row=-1; for(let r=ROWS-1;r>=0;r--){ if(grid[r][col]===0){ row=r; break; } } if(row<0)return; grid[row][col]=turn; const el=cells[row*COLS+col]; render(); el.classList.add('c4-drop');
      const line=winLine(row,col,turn);
      if(line){ done=true; render(line); if(winEl)winEl.textContent=(turn===1?'Red wins':'Yellow wins'); if(statusEl)statusEl.textContent=(turn===1?'Red wins':'Yellow wins'); if(overEl)overEl.classList.add('show'); return; }
      if(grid.every(rw=>rw.every(v=>v!==0))){ done=true; if(winEl)winEl.textContent='Draw'; if(overEl)overEl.classList.add('show'); return; }
      turn=turn===1?2:1; if(statusEl)statusEl.textContent=(turn===1?"Red's turn":"Yellow's turn"); }
    boardEl.addEventListener('click',(e)=>{ const cell=e.target.closest('.c4-cell'); if(!cell)return; drop(+cell.dataset.col); });
    if(resetBtn)resetBtn.addEventListener('click',reset); if(againBtn)againBtn.addEventListener('click',reset);
    window.__connect4={ ready:false, init(){ if(!this.ready){ this.ready=true; build(); reset(); } }, stop(){} };
  })();

  /* ---------- MUNCHER (Pac-Man-like) ---------- */
  (function(){
    const cv=document.getElementById('muncherCanvas'); if(!cv)return;
    const ctx=cv.getContext('2d'); const W=cv.width, H=cv.height;
    const COLS=15, ROWS=16, T=Math.floor(Math.min(W/COLS,H/ROWS));
    const OX=Math.floor((W-COLS*T)/2), OY=Math.floor((H-ROWS*T)/2);
    const scoreEl=document.getElementById('muScore'), livesEl=document.getElementById('muLives'), bestEl=document.getElementById('muBest');
    const overEl=document.getElementById('muOver'), finalEl=document.getElementById('muFinal');
    const startBtn=document.getElementById('muStart'), againBtn=document.getElementById('muAgain');
    let best=parseInt(localStorage.getItem('pwMuncherBest')||'0',10);
    let walls,pellets,pelletCount,pac,ghosts,score,lives,level,running,raf,last,acc;
    function isWall(c,r){ if(c<0||c>=COLS||r<0||r>=ROWS)return true; return walls[r][c]; }
    function buildMaze(){
      walls=[]; pellets=[]; pelletCount=0;
      for(let r=0;r<ROWS;r++){ walls.push([]); pellets.push([]); for(let c=0;c<COLS;c++){
        const border=(r===0||c===0||r===ROWS-1||c===COLS-1);
        const pillar=(r%2===0 && c%2===0 && r>0 && c>0 && r<ROWS-1 && c<COLS-1);
        const wall=border||pillar; walls[r].push(wall); pellets[r].push(false);
      } }
      // ghost home clear zone center
      const hc=Math.floor(COLS/2), hr=Math.floor(ROWS/2);
      for(let r=hr-1;r<=hr+1;r++)for(let c=hc-1;c<=hc+1;c++){ if(r>0&&c>0&&r<ROWS-1&&c<COLS-1){ walls[r][c]=false; } }
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ if(!walls[r][c]){ const center=(Math.abs(c-hc)<=1&&Math.abs(r-hr)<=1); if(!center){ pellets[r][c]=true; pelletCount++; } } }
    }
    function center(c,r){ return {x:OX+c*T+T/2, y:OY+r*T+T/2}; }
    function spawn(){
      const hc=Math.floor(COLS/2);
      pac={c:hc,r:ROWS-2,dir:{x:0,y:0},want:{x:0,y:0}}; const pc=center(pac.c,pac.r); pac.x=pc.x; pac.y=pc.y;
      const gpos=[[hc,Math.floor(ROWS/2)],[hc-1,Math.floor(ROWS/2)],[hc+1,Math.floor(ROWS/2)]];
      const cols=['#E05B5B','#5AB0FA','#E6C84A'];
      ghosts=gpos.map((p,i)=>{ const ce=center(p[0],p[1]); return {c:p[0],r:p[1],x:ce.x,y:ce.y,dir:{x:0,y:-1},color:cols[i]}; });
    }
    function full(){ buildMaze(); spawn(); score=0; lives=3; level=1; upd(); }
    function upd(){ if(scoreEl)scoreEl.textContent=score; if(livesEl)livesEl.textContent=lives; if(bestEl)bestEl.textContent=best; }
    function start(){ full(); running=true; last=performance.now(); acc=0; if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.textContent='Restart'; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
    function gameOver(){ running=false; if(score>best){best=score;localStorage.setItem('pwMuncherBest',String(best));} upd(); if(finalEl)finalEl.textContent=score; if(overEl)overEl.classList.add('show'); if(startBtn)startBtn.textContent='Start game'; }
    function atCenter(e){ const ce=center(e.c,e.r); return Math.abs(e.x-ce.x)<2 && Math.abs(e.y-ce.y)<2; }
    function moveEntity(e,spd,chooser){
      const ce=center(e.c,e.r);
      // snap & decide at center
      if(Math.hypot(e.x-ce.x,e.y-ce.y)<=spd){ e.x=ce.x; e.y=ce.y; chooser(e);
        if(isWall(e.c+e.dir.x,e.r+e.dir.y)){ e.dir={x:0,y:0}; } }
      e.x+=e.dir.x*spd; e.y+=e.dir.y*spd;
      // update tile when crossing
      const nc=center(e.c+e.dir.x,e.r+e.dir.y);
      if(e.dir.x===1 && e.x>=nc.x){ e.c++; } else if(e.dir.x===-1 && e.x<=nc.x){ e.c--; }
      if(e.dir.y===1 && e.y>=nc.y){ e.r++; } else if(e.dir.y===-1 && e.y<=nc.y){ e.r--; }
    }
    function loop(now){
      raf=requestAnimationFrame(loop);
      if(document.body.classList.contains('arcade-paused')){ last=now; return; }
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      if(running){
        const spd=(T/0.16)*dt*(1+ (level-1)*0.12);
        moveEntity(pac,spd,(e)=>{ if((e.want.x||e.want.y)&&!isWall(e.c+e.want.x,e.r+e.want.y)){ e.dir={...e.want}; } });
        // eat
        if(atCenter(pac) && pellets[pac.r] && pellets[pac.r][pac.c]){ pellets[pac.r][pac.c]=false; pelletCount--; score+=10; if(score>best){best=score;} upd(); if(pelletCount<=0){ level++; buildMaze(); spawn(); } }
        const gspd=spd*0.92;
        for(const g of ghosts){ moveEntity(g,gspd,(e)=>{
          const opts=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=>!isWall(e.c+d.x,e.r+d.y) && !(d.x===-e.dir.x&&d.y===-e.dir.y));
          const list=opts.length?opts:[{x:-e.dir.x,y:-e.dir.y}];
          if(Math.random()<0.7){ list.sort((a,b)=> (Math.hypot(e.c+a.x-pac.c,e.r+a.y-pac.r)) - (Math.hypot(e.c+b.x-pac.c,e.r+b.y-pac.r)) ); e.dir={...list[0]}; }
          else { e.dir={...list[Math.floor(Math.random()*list.length)]}; }
        });
          if(Math.hypot(g.x-pac.x,g.y-pac.y) < T*0.7){ lives--; upd(); if(lives<=0){ gameOver(); break; } else { spawn(); } }
        }
      }
      draw();
    }
    function draw(){
      ctx.fillStyle='#040406'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
        if(walls[r][c]){ ctx.fillStyle='#163b6e'; ctx.fillRect(OX+c*T+1,OY+r*T+1,T-2,T-2); }
        else if(pellets[r][c]){ ctx.fillStyle='#E6C84A'; ctx.beginPath(); ctx.arc(OX+c*T+T/2,OY+r*T+T/2,2.2,0,Math.PI*2); ctx.fill(); }
      }
      // pac
      ctx.fillStyle='#FFD23F'; ctx.beginPath(); const mouth=0.28; const a=Math.atan2(pac.dir.y,pac.dir.x);
      ctx.moveTo(pac.x,pac.y); ctx.arc(pac.x,pac.y,T*0.42,a+mouth,a-mouth+Math.PI*2); ctx.closePath(); ctx.fill();
      for(const g of ghosts){ ctx.fillStyle=g.color; ctx.beginPath(); ctx.arc(g.x,g.y,T*0.4,Math.PI,0); ctx.lineTo(g.x+T*0.4,g.y+T*0.38); ctx.lineTo(g.x-T*0.4,g.y+T*0.38); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(g.x-3,g.y-2,2.4,0,Math.PI*2); ctx.arc(g.x+3,g.y-2,2.4,0,Math.PI*2); ctx.fill(); }
    }
    function setWant(dx,dy){ pac.want={x:dx,y:dy}; }
    document.addEventListener('keydown',(e)=>{ if(!panelVisible('muncher'))return; const k=e.key.toLowerCase(); if(e.code==='ArrowUp'||k==='w'){setWant(0,-1);e.preventDefault();} else if(e.code==='ArrowDown'||k==='s'){setWant(0,1);e.preventDefault();} else if(e.code==='ArrowLeft'||k==='a'){setWant(-1,0);e.preventDefault();} else if(e.code==='ArrowRight'||k==='d'){setWant(1,0);e.preventDefault();} });
    document.querySelectorAll('[data-mdir]').forEach(b=>b.addEventListener('click',()=>{ const d=b.dataset.mdir; setWant(d==='left'?-1:d==='right'?1:0, d==='up'?-1:d==='down'?1:0); }));
    if(startBtn)startBtn.addEventListener('click',start); if(againBtn)againBtn.addEventListener('click',start);
    window.__muncher={ ready:false, init(){ if(this.ready){ return; } this.ready=true; full(); draw();
      ctx.fillStyle='rgba(245,242,236,.7)'; ctx.font='600 12px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillText('PRESS START',W/2,OY+ROWS*T/2); }, stop(){ running=false; cancelAnimationFrame(raf); } };
  })();

  /* ---------- INVADERS ---------- */
  (function(){
    const cv=document.getElementById('invCanvas'); if(!cv)return;
    const ctx=cv.getContext('2d'); const W=cv.width, H=cv.height;
    const scoreEl=document.getElementById('invScore'), bestEl=document.getElementById('invBest');
    const overEl=document.getElementById('invOver'), finalEl=document.getElementById('invFinal');
    const startBtn=document.getElementById('invStart'), againBtn=document.getElementById('invAgain');
    let best=parseInt(localStorage.getItem('pwInvadersBest')||'0',10);
    const PW=34, PH=12, PY=H-24, IC=8, IR=4, IW=24, IH=16;
    let px,bullets,ebullets,inv,dir,score,running,raf,last,keyL,keyR,fireHeld,cool,stepAcc,wave;
    function makeInv(){ inv=[]; const sx=40, gx=(W-80)/(IC-1); for(let r=0;r<IR;r++)for(let c=0;c<IC;c++){ inv.push({x:sx+c*gx,y:50+r*30,alive:true,row:r}); } }
    function full(){ px=W/2-PW/2; bullets=[]; ebullets=[]; makeInv(); dir=1; score=0; wave=1; stepAcc=0; cool=0; upd(); }
    function upd(){ if(scoreEl)scoreEl.textContent=score; if(bestEl)bestEl.textContent=best; }
    function start(){ full(); running=true; last=performance.now(); if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.textContent='Restart'; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
    function over(){ running=false; if(score>best){best=score;localStorage.setItem('pwInvadersBest',String(best));} upd(); if(finalEl)finalEl.textContent=score; if(overEl)overEl.classList.add('show'); if(startBtn)startBtn.textContent='Start game'; }
    function fire(){ if(cool>0)return; bullets.push({x:px+PW/2,y:PY}); cool=0.35; }
    function loop(now){
      raf=requestAnimationFrame(loop);
      if(document.body.classList.contains('arcade-paused')){ last=now; return; }
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      if(running){
        cool-=dt; if(keyL)px-=260*dt; if(keyR)px+=260*dt; px=Math.max(0,Math.min(W-PW,px)); if(fireHeld)fire();
        const alive=inv.filter(i=>i.alive); const speed=(0.4+0.05*(IC*IR-alive.length)+wave*0.1);
        stepAcc+=dt*speed; let stepDown=false;
        if(stepAcc>=0.5){ stepAcc=0; let minx=1e9,maxx=-1e9; for(const i of alive){ minx=Math.min(minx,i.x); maxx=Math.max(maxx,i.x+IW); } if(maxx+12*dir>W||minx+12*dir<0){ dir*=-1; stepDown=true; } for(const i of inv){ if(stepDown)i.y+=14; else i.x+=12*dir; }
          if(alive.length && Math.random()<0.5){ const s=alive[Math.floor(Math.random()*alive.length)]; ebullets.push({x:s.x+IW/2,y:s.y+IH}); } }
        for(const b of bullets) b.y-=420*dt; for(const b of ebullets) b.y+=240*dt;
        bullets=bullets.filter(b=>b.y>-10); ebullets=ebullets.filter(b=>b.y<H+10);
        for(const b of bullets){ for(const i of inv){ if(i.alive && b.x>i.x&&b.x<i.x+IW&&b.y>i.y&&b.y<i.y+IH){ i.alive=false; b.y=-99; score+=(IR-i.row)*10+10; if(score>best)best=score; upd(); } } }
        for(const b of ebullets){ if(b.x>px&&b.x<px+PW&&b.y>PY&&b.y<PY+PH){ over(); return; } }
        if(inv.some(i=>i.alive && i.y+IH>=PY)){ over(); return; }
        if(!inv.some(i=>i.alive)){ wave++; makeInv(); dir=1; }
      }
      draw();
    }
    function draw(){
      ctx.fillStyle='#040406'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#D4A843'; ctx.fillRect(px,PY,PW,PH); ctx.fillRect(px+PW/2-3,PY-8,6,8);
      for(const i of inv){ if(!i.alive)continue; ctx.fillStyle=['#6FCF7A','#5AB0FA','#E6C84A','#E05B5B'][i.row%4]; ctx.fillRect(i.x,i.y,IW,IH); ctx.fillStyle='#040406'; ctx.fillRect(i.x+5,i.y+5,4,4); ctx.fillRect(i.x+IW-9,i.y+5,4,4); }
      ctx.fillStyle='#F5F2EC'; for(const b of bullets) ctx.fillRect(b.x-1.5,b.y-8,3,10);
      ctx.fillStyle='#ff8585'; for(const b of ebullets) ctx.fillRect(b.x-1.5,b.y,3,10);
    }
    document.addEventListener('keydown',(e)=>{ if(!panelVisible('invaders'))return; if(e.code==='ArrowLeft'){keyL=true;e.preventDefault();} if(e.code==='ArrowRight'){keyR=true;e.preventDefault();} if(e.code==='Space'){ e.preventDefault(); if(!running)start(); else fire(); } });
    document.addEventListener('keyup',(e)=>{ if(e.code==='ArrowLeft')keyL=false; if(e.code==='ArrowRight')keyR=false; });
    document.querySelectorAll('[data-idir]').forEach(b=>{ const d=b.dataset.idir; const dn=(e)=>{e.preventDefault(); if(d==='left')keyL=true; else if(d==='right')keyR=true; else fireHeld=true;}, up=()=>{ if(d==='left')keyL=false; else if(d==='right')keyR=false; else fireHeld=false; }; b.addEventListener('pointerdown',dn); b.addEventListener('pointerup',up); b.addEventListener('pointerleave',up); });
    if(startBtn)startBtn.addEventListener('click',start); if(againBtn)againBtn.addEventListener('click',start);
    window.__invaders={ ready:false, init(){ if(this.ready)return; this.ready=true; full(); draw(); if(bestEl)bestEl.textContent=best;
      ctx.fillStyle='rgba(245,242,236,.6)'; ctx.font='600 12px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillText('PRESS START',W/2,H/2); }, stop(){ running=false; cancelAnimationFrame(raf); keyL=keyR=fireHeld=false; } };
  })();

  /* ---------- ASTEROIDS ---------- */
  (function(){
    const cv=document.getElementById('astCanvas'); if(!cv)return;
    const ctx=cv.getContext('2d'); const W=cv.width, H=cv.height;
    const scoreEl=document.getElementById('astScore'), bestEl=document.getElementById('astBest');
    const overEl=document.getElementById('astOver'), finalEl=document.getElementById('astFinal');
    const startBtn=document.getElementById('astStart'), againBtn=document.getElementById('astAgain');
    let best=parseInt(localStorage.getItem('pwAsteroidsBest')||'0',10);
    let ship,rocks,shots,score,lives,running,raf,last,keys={},inv,wave;
    function wrap(o){ if(o.x<0)o.x+=W; if(o.x>W)o.x-=W; if(o.y<0)o.y+=H; if(o.y>H)o.y-=H; }
    function newRock(x,y,size){ const a=Math.random()*Math.PI*2, sp=(4-size)*16+18; return {x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,size,r:size*12}; }
    function spawnWave(n){ rocks=[]; for(let i=0;i<n;i++){ rocks.push(newRock(Math.random()*W, Math.random()<.5?0:H, 3)); } }
    function full(){ ship={x:W/2,y:H/2,a:-Math.PI/2,vx:0,vy:0}; shots=[]; score=0; lives=3; wave=1; inv=2; spawnWave(4); upd(); }
    function upd(){ if(scoreEl)scoreEl.textContent=score; if(bestEl)bestEl.textContent=best; }
    function start(){ full(); running=true; last=performance.now(); if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.textContent='Restart'; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
    function over(){ running=false; if(score>best){best=score;localStorage.setItem('pwAsteroidsBest',String(best));} upd(); if(finalEl)finalEl.textContent=score; if(overEl)overEl.classList.add('show'); if(startBtn)startBtn.textContent='Start game'; }
    function shoot(){ if(shots.length>4)return; shots.push({x:ship.x+Math.cos(ship.a)*14,y:ship.y+Math.sin(ship.a)*14,vx:Math.cos(ship.a)*420+ship.vx,vy:Math.sin(ship.a)*420+ship.vy,life:0.9}); }
    function loop(now){
      raf=requestAnimationFrame(loop);
      if(document.body.classList.contains('arcade-paused')){ last=now; return; }
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      if(running){
        if(keys.left)ship.a-=4.2*dt; if(keys.right)ship.a+=4.2*dt;
        if(keys.thrust){ ship.vx+=Math.cos(ship.a)*220*dt; ship.vy+=Math.sin(ship.a)*220*dt; }
        ship.vx*=0.99; ship.vy*=0.99; ship.x+=ship.vx*dt; ship.y+=ship.vy*dt; wrap(ship); if(inv>0)inv-=dt;
        for(const s of shots){ s.x+=s.vx*dt; s.y+=s.vy*dt; s.life-=dt; wrap(s); } shots=shots.filter(s=>s.life>0);
        for(const r of rocks){ r.x+=r.vx*dt; r.y+=r.vy*dt; wrap(r); }
        for(const s of shots){ for(let i=rocks.length-1;i>=0;i--){ const r=rocks[i]; if(Math.hypot(s.x-r.x,s.y-r.y)<r.r){ s.life=0; score+=(4-r.size)*20; if(score>best)best=score; upd(); if(r.size>1){ rocks.push(newRock(r.x,r.y,r.size-1),newRock(r.x,r.y,r.size-1)); } rocks.splice(i,1); break; } } }
        if(inv<=0){ for(const r of rocks){ if(Math.hypot(ship.x-r.x,ship.y-r.y)<r.r+8){ lives--; upd(); if(lives<=0){ over(); return; } ship.x=W/2;ship.y=H/2;ship.vx=0;ship.vy=0;inv=2; break; } } }
        if(!rocks.length){ wave++; spawnWave(3+wave); }
      }
      draw();
    }
    function draw(){
      ctx.fillStyle='#040406'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='#9fb7c9'; ctx.lineWidth=1.4;
      for(const r of rocks){ ctx.beginPath(); for(let k=0;k<8;k++){ const ang=k/8*Math.PI*2; const rad=r.r*(0.78+((k*53)%10)/30); const x=r.x+Math.cos(ang)*rad, y=r.y+Math.sin(ang)*rad; k?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.closePath(); ctx.stroke(); }
      ctx.fillStyle='#F5F2EC'; for(const s of shots){ ctx.fillRect(s.x-1.5,s.y-1.5,3,3); }
      if(inv<=0 || Math.floor(inv*8)%2===0){ ctx.save(); ctx.translate(ship.x,ship.y); ctx.rotate(ship.a); ctx.strokeStyle='#D4A843'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(-10,-8); ctx.lineTo(-5,0); ctx.lineTo(-10,8); ctx.closePath(); ctx.stroke(); if(keys.thrust){ ctx.strokeStyle='#ff8585'; ctx.beginPath(); ctx.moveTo(-6,-4); ctx.lineTo(-16,0); ctx.lineTo(-6,4); ctx.stroke(); } ctx.restore(); }
    }
    document.addEventListener('keydown',(e)=>{ if(!panelVisible('asteroids'))return; if(e.code==='ArrowLeft'){keys.left=true;e.preventDefault();} if(e.code==='ArrowRight'){keys.right=true;e.preventDefault();} if(e.code==='ArrowUp'){keys.thrust=true;e.preventDefault();} if(e.code==='Space'){ e.preventDefault(); if(!running)start(); else shoot(); } });
    document.addEventListener('keyup',(e)=>{ if(e.code==='ArrowLeft')keys.left=false; if(e.code==='ArrowRight')keys.right=false; if(e.code==='ArrowUp')keys.thrust=false; });
    document.querySelectorAll('[data-adir]').forEach(b=>{ const d=b.dataset.adir; const dn=(e)=>{e.preventDefault(); if(d==='fire'){ running?shoot():start(); } else keys[d]=true; }, up=()=>{ if(d!=='fire')keys[d]=false; }; b.addEventListener('pointerdown',dn); b.addEventListener('pointerup',up); b.addEventListener('pointerleave',up); });
    if(startBtn)startBtn.addEventListener('click',start); if(againBtn)againBtn.addEventListener('click',start);
    window.__asteroids={ ready:false, init(){ if(this.ready)return; this.ready=true; full(); draw(); if(bestEl)bestEl.textContent=best;
      ctx.fillStyle='rgba(245,242,236,.6)'; ctx.font='600 12px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillText('PRESS START',W/2,H/2+40); }, stop(){ running=false; cancelAnimationFrame(raf); keys={}; } };
  })();

  /* ---------- CROSSING (Frogger) ---------- */
  (function(){
    const cv=document.getElementById('frogCanvas'); if(!cv)return;
    const ctx=cv.getContext('2d'); const W=cv.width, H=cv.height;
    const scoreEl=document.getElementById('frScore'), bestEl=document.getElementById('frBest');
    const overEl=document.getElementById('frOver'), finalEl=document.getElementById('frFinal');
    const startBtn=document.getElementById('frStart'), againBtn=document.getElementById('frAgain');
    let best=parseInt(localStorage.getItem('pwFroggerBest')||'0',10);
    const COLS=10, ROWS=10, T=Math.floor(Math.min(W/COLS,H/ROWS));
    const OX=Math.floor((W-COLS*T)/2);
    let frog,lanes,score,running,raf,last;
    function makeLanes(){ lanes=[]; for(let r=1;r<=8;r++){ if(r===5){ lanes.push(null); continue; } const dir=r%2?1:-1; const speed=(40+Math.random()*60+score*4)*dir; const cars=[]; const gap=2+Math.floor(Math.random()*2); const len=1+Math.floor(Math.random()*2); for(let c=0;c<COLS;c+=gap+len){ cars.push({x:c*T,len:len*T}); } lanes.push({y:r*T,dir,speed,cars,len}); } }
    function full(){ frog={c:Math.floor(COLS/2),r:ROWS-1}; score=0; makeLanes(); upd(); }
    function upd(){ if(scoreEl)scoreEl.textContent=score; if(bestEl)bestEl.textContent=best; }
    function start(){ full(); running=true; last=performance.now(); if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.textContent='Restart'; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
    function over(){ running=false; if(score>best){best=score;localStorage.setItem('pwFroggerBest',String(best));} upd(); if(finalEl)finalEl.textContent=score; if(overEl)overEl.classList.add('show'); if(startBtn)startBtn.textContent='Start game'; }
    function hop(dx,dy){ if(!running)return; frog.c=Math.max(0,Math.min(COLS-1,frog.c+dx)); frog.r=Math.max(0,Math.min(ROWS-1,frog.r+dy)); if(frog.r===0){ score++; if(score>best)best=score; upd(); frog={c:Math.floor(COLS/2),r:ROWS-1}; makeLanes(); } }
    function loop(now){
      raf=requestAnimationFrame(loop);
      if(document.body.classList.contains('arcade-paused')){ last=now; return; }
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      if(running){
        for(const ln of lanes){ if(!ln)continue; for(const car of ln.cars){ car.x+=ln.speed*dt; if(ln.speed>0&&car.x>W)car.x=-car.len; if(ln.speed<0&&car.x+car.len<0)car.x=W; } }
        const fy=frog.r*T; const ln=lanes[frog.r-1];
        if(ln && frog.r>=1 && frog.r<=8 && frog.r!==5){ const fx=OX+frog.c*T; for(const car of ln.cars){ if(fx+T*0.7>car.x && fx+T*0.3<car.x+car.len){ over(); return; } } }
      }
      draw();
    }
    function draw(){
      ctx.fillStyle='#040406'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#143a1f'; ctx.fillRect(0,(ROWS-1)*T,W,T); ctx.fillRect(0,0,W,T); ctx.fillStyle='#1e5c30'; ctx.fillRect(0,5*T,W,T);
      ctx.fillStyle='#1a1a1f'; ctx.fillRect(0,T,W,4*T); ctx.fillRect(0,6*T,W,3*T);
      ctx.strokeStyle='rgba(212,168,67,.3)'; ctx.setLineDash([8,8]); for(let r=1;r<=8;r++){ if(r===5)continue; ctx.beginPath(); ctx.moveTo(0,r*T+T/2); ctx.lineTo(W,r*T+T/2); ctx.stroke(); } ctx.setLineDash([]);
      for(const ln of lanes){ if(!ln)continue; ctx.fillStyle=ln.dir>0?'#5AB0FA':'#E05B5B'; for(const car of ln.cars){ ctx.fillRect(car.x+2,ln.y+4,car.len-4,T-8); } }
      const fx=OX+frog.c*T, fy=frog.r*T; ctx.fillStyle='#6FCF7A'; ctx.beginPath(); ctx.arc(fx+T/2,fy+T/2,T*0.34,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0a2a12'; ctx.fillRect(fx+T*0.36,fy+T*0.34,3,3); ctx.fillRect(fx+T*0.58,fy+T*0.34,3,3);
    }
    document.addEventListener('keydown',(e)=>{ if(!panelVisible('frogger'))return; const k=e.key.toLowerCase(); if(e.code==='ArrowUp'||k==='w'){hop(0,-1);e.preventDefault();} else if(e.code==='ArrowDown'||k==='s'){hop(0,1);e.preventDefault();} else if(e.code==='ArrowLeft'||k==='a'){hop(-1,0);e.preventDefault();} else if(e.code==='ArrowRight'||k==='d'){hop(1,0);e.preventDefault();} });
    document.querySelectorAll('[data-fdir]').forEach(b=>b.addEventListener('click',()=>{ const d=b.dataset.fdir; hop(d==='left'?-1:d==='right'?1:0, d==='up'?-1:d==='down'?1:0); }));
    if(startBtn)startBtn.addEventListener('click',start); if(againBtn)againBtn.addEventListener('click',start);
    window.__frogger={ ready:false, init(){ if(this.ready)return; this.ready=true; full(); draw(); if(bestEl)bestEl.textContent=best;
      ctx.fillStyle='rgba(245,242,236,.7)'; ctx.font='600 12px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillText('PRESS START',W/2,H/2); }, stop(){ running=false; cancelAnimationFrame(raf); } };
  })();

  /* ---------- SEQUENCE (Simon) ---------- */
  (function(){
    const grid=document.querySelector('.simon-pad-grid'); if(!grid)return;
    const pads=Array.from(document.querySelectorAll('.simon-pad'));
    const levelEl=document.getElementById('simonLevel'), bestEl=document.getElementById('simonBest');
    const statusEl=document.getElementById('simonStatus'), overEl=document.getElementById('simonOver'), finalEl=document.getElementById('simonFinal');
    const startBtn=document.getElementById('simonStart'), againBtn=document.getElementById('simonAgain');
    let best=parseInt(localStorage.getItem('pwSimonBest')||'0',10);
    let seq,step,playing,accepting,timers=[];
    function clearTimers(){ timers.forEach(t=>clearTimeout(t)); timers=[]; }
    function setLevel(){ if(levelEl)levelEl.textContent=seq.length; if(bestEl)bestEl.textContent=best; }
    function lit(i,on){ pads[i].classList.toggle('lit',on); }
    function flash(i,dur){ return new Promise(res=>{ lit(i,true); timers.push(setTimeout(()=>{ lit(i,false); timers.push(setTimeout(res,140)); },dur)); }); }
    async function playSeq(){ accepting=false; if(statusEl)statusEl.textContent='Watch…'; await new Promise(r=>timers.push(setTimeout(r,500))); const dur=Math.max(250,520-seq.length*16); for(const i of seq){ await flash(i,dur); } accepting=true; step=0; if(statusEl)statusEl.textContent='Your turn'; }
    function next(){ seq.push(Math.floor(Math.random()*4)); setLevel(); playSeq(); }
    function start(){ clearTimers(); seq=[]; playing=true; if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.textContent='Restart'; next(); }
    function over(){ playing=false; accepting=false; if(seq.length-1>best){ best=seq.length-1; localStorage.setItem('pwSimonBest',String(best)); } setLevel(); if(finalEl)finalEl.textContent=seq.length-1; if(statusEl)statusEl.textContent='Wrong move'; if(overEl)overEl.classList.add('show'); if(startBtn)startBtn.textContent='Start game'; }
    function press(i){ if(!playing||!accepting)return; lit(i,true); timers.push(setTimeout(()=>lit(i,false),160)); if(i!==seq[step]){ over(); return; } step++; if(step>=seq.length){ accepting=false; timers.push(setTimeout(next,600)); } }
    pads.forEach((p,i)=>p.addEventListener('click',()=>press(i)));
    if(startBtn)startBtn.addEventListener('click',start); if(againBtn)againBtn.addEventListener('click',start);
    window.__simon={ ready:false, init(){ if(!this.ready){ this.ready=true; seq=[]; setLevel(); } }, stop(){ clearTimers(); playing=false; accepting=false; pads.forEach((p,i)=>lit(i,false)); } };
  })();

  /* ---------- TOWERS (Tower Defense) ---------- */
  (function(){
    const cv=document.getElementById('towerCanvas'); if(!cv)return;
    const ctx=cv.getContext('2d'); const W=cv.width, H=cv.height;
    const COLS=12, ROWS=9, T=Math.floor(Math.min(W/COLS,H/ROWS));
    const OX=Math.floor((W-COLS*T)/2), OY=Math.floor((H-ROWS*T)/2);
    const waveEl=document.getElementById('twWave'), livesEl=document.getElementById('twLives'), goldEl=document.getElementById('twGold'), bestEl=document.getElementById('twBest');
    const overEl=document.getElementById('twOver'), finalEl=document.getElementById('twFinal');
    const startBtn=document.getElementById('twStart'), waveBtn=document.getElementById('twWaveBtn'), againBtn=document.getElementById('twAgain');
    let best=parseInt(localStorage.getItem('pwTowerBest')||'0',10);
    // path as list of grid cells
    const PATH=[[0,1],[1,1],[2,1],[3,1],[4,1],[4,2],[4,3],[4,4],[5,4],[6,4],[7,4],[7,3],[7,2],[8,2],[9,2],[10,2],[10,3],[10,4],[10,5],[10,6],[9,6],[8,6],[7,6],[6,6],[5,6],[4,6],[3,6],[2,6],[1,6],[1,7],[2,7],[3,7],[11,7]];
    const pathSet=new Set(PATH.map(p=>p[0]+','+p[1]));
    let towers,enemies,bullets,gold,lives,wave,spawnLeft,spawnTimer,running,raf,last,inWave;
    function cellCenter(c,r){ return {x:OX+c*T+T/2,y:OY+r*T+T/2}; }
    function full(){ towers=[]; enemies=[]; bullets=[]; gold=100; lives=20; wave=0; inWave=false; spawnLeft=0; upd(); }
    function upd(){ if(waveEl)waveEl.textContent=wave; if(livesEl)livesEl.textContent=lives; if(goldEl)goldEl.textContent=gold; if(bestEl)bestEl.textContent=best; }
    function start(){ full(); running=true; last=performance.now(); if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.textContent='Restart'; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); sendWave(); }
    function over(){ running=false; if(wave-1>best){ best=wave-1; localStorage.setItem('pwTowerBest',String(best)); } upd(); if(finalEl)finalEl.textContent=wave; if(overEl)overEl.classList.add('show'); if(startBtn)startBtn.textContent='Start defense'; }
    function sendWave(){ if(!running||inWave)return; wave++; inWave=true; spawnLeft=6+wave*2; spawnTimer=0; upd(); }
    function spawnEnemy(){ const hp=18+wave*8; enemies.push({t:0,seg:0,hp,max:hp,x:cellCenter(PATH[0][0],PATH[0][1]).x,y:cellCenter(PATH[0][0],PATH[0][1]).y,speed:34+wave*1.5}); }
    function build(c,r){ if(pathSet.has(c+','+r))return; if(towers.some(t=>t.c===c&&t.r===r))return; if(gold<25)return; gold-=25; towers.push({c,r,range:T*2.3,cool:0,rate:0.6,dmg:9+wave}); upd(); }
    function loop(now){
      raf=requestAnimationFrame(loop);
      if(document.body.classList.contains('arcade-paused')){ last=now; return; }
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      if(running){
        if(inWave && spawnLeft>0){ spawnTimer-=dt; if(spawnTimer<=0){ spawnEnemy(); spawnLeft--; spawnTimer=0.7; } }
        for(const e of enemies){ const target=PATH[e.seg+1]; if(!target){ e.dead=true; e.leaked=true; continue; } const tc=cellCenter(target[0],target[1]); const dx=tc.x-e.x, dy=tc.y-e.y, d=Math.hypot(dx,dy); const mv=e.speed*dt; if(d<=mv){ e.x=tc.x; e.y=tc.y; e.seg++; } else { e.x+=dx/d*mv; e.y+=dy/d*mv; } }
        for(const e of enemies){ if(e.leaked){ lives--; upd(); if(lives<=0){ over(); return; } } }
        enemies=enemies.filter(e=>!e.dead);
        for(const t of towers){ t.cool-=dt; if(t.cool<=0){ let tgt=null,bd=t.range; for(const e of enemies){ const dd=Math.hypot(e.x-(cellCenter(t.c,t.r).x),e.y-(cellCenter(t.c,t.r).y)); if(dd<bd){ bd=dd; tgt=e; } } if(tgt){ const cc=cellCenter(t.c,t.r); bullets.push({x:cc.x,y:cc.y,tgt,dmg:t.dmg}); t.cool=t.rate; } } }
        for(const b of bullets){ if(!b.tgt||b.tgt.dead){ b.dead=true; continue; } const dx=b.tgt.x-b.x, dy=b.tgt.y-b.y, d=Math.hypot(dx,dy); const mv=460*dt; if(d<=mv){ b.tgt.hp-=b.dmg; b.dead=true; if(b.tgt.hp<=0 && !b.tgt.dead){ b.tgt.dead=true; gold+=4+wave; if(wave-1>best)best=wave-1; upd(); } } else { b.x+=dx/d*mv; b.y+=dy/d*mv; } }
        bullets=bullets.filter(b=>!b.dead); enemies=enemies.filter(e=>!e.dead);
        if(inWave && spawnLeft<=0 && enemies.length===0){ inWave=false; gold+=20+wave*2; upd(); }
      }
      draw();
    }
    function draw(){
      ctx.fillStyle='#06080a'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ const onPath=pathSet.has(c+','+r); ctx.fillStyle=onPath?'#3a2a14':'#0f2417'; ctx.fillRect(OX+c*T+1,OY+r*T+1,T-2,T-2); }
      for(const t of towers){ const cc=cellCenter(t.c,t.r); ctx.fillStyle='#D4A843'; ctx.fillRect(cc.x-T*0.32,cc.y-T*0.32,T*0.64,T*0.64); ctx.fillStyle='#06080a'; ctx.beginPath(); ctx.arc(cc.x,cc.y,T*0.16,0,Math.PI*2); ctx.fill(); }
      for(const e of enemies){ ctx.fillStyle='#E05B5B'; ctx.beginPath(); ctx.arc(e.x,e.y,T*0.26,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#040406'; ctx.fillRect(e.x-11,e.y-T*0.4,22,4); ctx.fillStyle='#6FCF7A'; ctx.fillRect(e.x-11,e.y-T*0.4,22*(e.hp/e.max),4); }
      ctx.fillStyle='#F5F2EC'; for(const b of bullets){ ctx.beginPath(); ctx.arc(b.x,b.y,3,0,Math.PI*2); ctx.fill(); }
    }
    cv.addEventListener('click',(e)=>{ if(!running)return; const r=cv.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*H; const c=Math.floor((x-OX)/T), rr=Math.floor((y-OY)/T); if(c>=0&&c<COLS&&rr>=0&&rr<ROWS)build(c,rr); });
    if(startBtn)startBtn.addEventListener('click',start); if(waveBtn)waveBtn.addEventListener('click',sendWave); if(againBtn)againBtn.addEventListener('click',start);
    window.__tower={ ready:false, init(){ if(this.ready)return; this.ready=true; full(); draw();
      ctx.fillStyle='rgba(245,242,236,.7)'; ctx.font='600 12px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillText('PRESS START',W/2,OY+ROWS*T/2); }, stop(){ running=false; cancelAnimationFrame(raf); } };
  })();

  /* ---------- TRON / LIGHT CYCLES (2 Player) ---------- */
  (function(){
    const cv=document.getElementById('tronCanvas'); if(!cv)return;
    const ctx=cv.getContext('2d'); const W=cv.width, H=cv.height;
    const p1El=document.getElementById('trP1'), p2El=document.getElementById('trP2');
    const overEl=document.getElementById('trOver'), winEl=document.getElementById('trWinner');
    const startBtn=document.getElementById('trStart'), againBtn=document.getElementById('trAgain');
    const CELL=7, COLS=Math.floor(W/CELL), ROWS=Math.floor(H/CELL);
    const GOLD='#D4A843', CYAN='#2D8A7E';
    let grid=[], p1=null, p2=null, raf=null, last=0, acc=0, step=0.06, s1=0, s2=0, roundActive=false, matchOver=false;
    function upd(){ if(p1El)p1El.textContent=s1; if(p2El)p2El.textContent=s2; }
    function newRound(){
      grid=Array.from({length:ROWS},()=>Array(COLS).fill(0));
      p1={x:Math.floor(COLS*0.22), y:Math.floor(ROWS/2), dx:1, dy:0, ndx:1, ndy:0, alive:true};
      p2={x:Math.floor(COLS*0.78), y:Math.floor(ROWS/2), dx:-1, dy:0, ndx:-1, ndy:0, alive:true};
      grid[p1.y][p1.x]=1; grid[p2.y][p2.x]=2;
      roundActive=true; if(overEl)overEl.classList.remove('show'); draw();
    }
    function arm(){ last=performance.now(); acc=0; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
    function startMatch(){ s1=0; s2=0; matchOver=false; upd(); if(startBtn)startBtn.classList.add('hidden'); newRound(); arm(); }
    function turn(p,dx,dy){ if(!p)return; if(p.dx===-dx && p.dy===-dy)return; p.ndx=dx; p.ndy=dy; }
    function stepBike(p){ p.dx=p.ndx; p.dy=p.ndy; const nx=p.x+p.dx, ny=p.y+p.dy;
      if(nx<0||nx>=COLS||ny<0||ny>=ROWS||grid[ny][nx]){ p.alive=false; return; }
      p.x=nx; p.y=ny; grid[ny][nx]=(p===p1)?1:2; }
    function endRound(){ roundActive=false; let msg;
      if(!p1.alive && !p2.alive){ msg='Draw, no point'; }
      else if(!p1.alive){ s2++; msg='Cyan scores'; }
      else { s1++; msg='Gold scores'; }
      upd();
      if(s1>=5||s2>=5){ msg=(s1>s2?'Gold':'Cyan')+' wins the match!'; matchOver=true; if(startBtn){ startBtn.textContent='Start match'; startBtn.classList.remove('hidden'); } }
      if(winEl)winEl.textContent=msg; if(overEl)overEl.classList.add('show'); }
    function loop(now){ raf=requestAnimationFrame(loop);
      if(document.body.classList.contains('arcade-paused')){ last=now; return; }
      if(!panelVisible('tron')){ last=now; return; }
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      if(roundActive){ acc+=dt; while(acc>=step){ acc-=step; stepBike(p1); stepBike(p2); if(!p1.alive||!p2.alive){ endRound(); break; } } draw(); }
    }
    function draw(){ ctx.fillStyle='#040406'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ const v=grid[r][c]; if(v){ ctx.fillStyle=v===1?GOLD:CYAN; ctx.fillRect(c*CELL,r*CELL,CELL-1,CELL-1); } }
      if(p1&&p1.alive){ ctx.fillStyle='#fff'; ctx.fillRect(p1.x*CELL,p1.y*CELL,CELL-1,CELL-1); }
      if(p2&&p2.alive){ ctx.fillStyle='#fff'; ctx.fillRect(p2.x*CELL,p2.y*CELL,CELL-1,CELL-1); } }
    document.addEventListener('keydown',(e)=>{ if(!panelVisible('tron')||!roundActive)return;
      switch(e.key){
        case 'w': case 'W': turn(p1,0,-1); e.preventDefault(); break;
        case 's': case 'S': turn(p1,0,1); e.preventDefault(); break;
        case 'a': case 'A': turn(p1,-1,0); e.preventDefault(); break;
        case 'd': case 'D': turn(p1,1,0); e.preventDefault(); break;
        case 'ArrowUp': turn(p2,0,-1); e.preventDefault(); break;
        case 'ArrowDown': turn(p2,0,1); e.preventDefault(); break;
        case 'ArrowLeft': turn(p2,-1,0); e.preventDefault(); break;
        case 'ArrowRight': turn(p2,1,0); e.preventDefault(); break;
      } });
    document.querySelectorAll('[data-tron]').forEach(b=>b.addEventListener('click',()=>{ if(!roundActive)return; const a=b.dataset.tron;
      if(a==='p1up')turn(p1,0,-1); else if(a==='p1down')turn(p1,0,1); else if(a==='p1left')turn(p1,-1,0); else if(a==='p1right')turn(p1,1,0);
      else if(a==='p2up')turn(p2,0,-1); else if(a==='p2down')turn(p2,0,1); else if(a==='p2left')turn(p2,-1,0); else if(a==='p2right')turn(p2,1,0); }));
    if(startBtn)startBtn.addEventListener('click',startMatch);
    if(againBtn)againBtn.addEventListener('click',()=>{ if(matchOver){ startMatch(); } else { newRound(); arm(); } });
    window.__tron={ ready:false, init(){ if(this.ready)return; this.ready=true;
      grid=Array.from({length:ROWS},()=>Array(COLS).fill(0));
      ctx.fillStyle='#040406'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(245,242,236,.7)'; ctx.font='600 13px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillText('PRESS START · 2 PLAYERS',W/2,H/2); },
      stop(){ roundActive=false; cancelAnimationFrame(raf); if(startBtn){ startBtn.textContent='Start match'; startBtn.classList.remove('hidden'); } if(overEl)overEl.classList.remove('show'); } };
  })();

  /* ---------- WHACK-A-MOLE ---------- */
  (function(){
    const grid=document.getElementById('whackGrid'); if(!grid)return;
    const scoreEl=document.getElementById('whScore'), timeEl=document.getElementById('whTime'), bestEl=document.getElementById('whBest');
    const overEl=document.getElementById('whOver'), finalEl=document.getElementById('whFinal');
    const startBtn=document.getElementById('whStart'), againBtn=document.getElementById('whAgain');
    const HOLES=9; let holes=[], score=0, timeLeft=30, running=false, spawnT=null, tickT=null, hideT=null, activeIdx=-1;
    let best=parseInt(localStorage.getItem('pwWhackBest')||'0',10);
    if(bestEl)bestEl.textContent=best;
    function build(){ grid.innerHTML=''; holes=[]; for(let i=0;i<HOLES;i++){ const h=document.createElement('button'); h.className='whack-hole'; h.type='button'; h.setAttribute('aria-label','mole hole'); h.innerHTML='<span class="whack-mole"></span>'; h.addEventListener('click',()=>bonk(i)); grid.appendChild(h); holes.push(h); } }
    function bonk(i){ if(!running)return; const h=holes[i]; if(!h.classList.contains('up')||h.classList.contains('bonk'))return; h.classList.add('bonk'); score++; if(scoreEl)scoreEl.textContent=score; setTimeout(()=>{ if(holes[i])holes[i].classList.remove('up','bonk'); },90); if(i===activeIdx)activeIdx=-1; }
    function popOne(){ holes.forEach(h=>h.classList.remove('up','bonk')); const i=Math.floor(Math.random()*HOLES); activeIdx=i; holes[i].classList.add('up'); clearTimeout(hideT); const dur=Math.max(520,1100-(30-timeLeft)*18); hideT=setTimeout(()=>{ if(holes[i])holes[i].classList.remove('up'); if(activeIdx===i)activeIdx=-1; },dur); }
    function start(){ score=0; timeLeft=30; running=true; if(scoreEl)scoreEl.textContent='0'; if(timeEl)timeEl.textContent='30'; if(overEl)overEl.classList.remove('show'); if(startBtn)startBtn.classList.add('hidden');
      clearInterval(spawnT); clearInterval(tickT); clearTimeout(hideT); popOne();
      spawnT=setInterval(()=>{ if(!document.body.classList.contains('arcade-paused'))popOne(); },900);
      tickT=setInterval(()=>{ if(document.body.classList.contains('arcade-paused'))return; timeLeft--; if(timeEl)timeEl.textContent=Math.max(0,timeLeft); if(timeLeft<=0)end(); },1000); }
    function end(){ running=false; clearInterval(spawnT); clearInterval(tickT); clearTimeout(hideT); holes.forEach(h=>h.classList.remove('up','bonk')); if(score>best){ best=score; localStorage.setItem('pwWhackBest',best); if(bestEl)bestEl.textContent=best; } if(finalEl)finalEl.textContent=score; if(overEl)overEl.classList.add('show'); }
    if(startBtn)startBtn.addEventListener('click',start); if(againBtn)againBtn.addEventListener('click',start);
    window.__whack={ ready:false, init(){ if(this.ready)return; this.ready=true; build(); }, stop(){ running=false; clearInterval(spawnT); clearInterval(tickT); clearTimeout(hideT); if(holes)holes.forEach(h=>h.classList.remove('up','bonk')); if(startBtn)startBtn.classList.remove('hidden'); } };
  })();

  /* ---------- LIGHTS OUT ---------- */
  (function(){
    const grid=document.getElementById('loGrid'); if(!grid)return;
    const movesEl=document.getElementById('loMoves'), bestEl=document.getElementById('loBest');
    const winEl=document.getElementById('loWin'), finalEl=document.getElementById('loFinal');
    const startBtn=document.getElementById('loStart'), againBtn=document.getElementById('loAgain');
    const N=5; let cells=[], state=[], moves=0, solved=false;
    let best=parseInt(localStorage.getItem('pwLightsoutBest')||'0',10);
    if(bestEl)bestEl.textContent= best>0? best : '';
    function build(){ grid.innerHTML=''; cells=[]; for(let i=0;i<N*N;i++){ const c=document.createElement('button'); c.className='lo-cell'; c.type='button'; c.setAttribute('aria-label','light '+(i+1)); c.addEventListener('click',()=>click(i)); grid.appendChild(c); cells.push(c); } }
    function render(){ for(let i=0;i<N*N;i++) cells[i].classList.toggle('on', !!state[i]); }
    function toggle(r,c){ if(r<0||r>=N||c<0||c>=N)return; state[r*N+c]^=1; }
    function applyMove(i){ const r=Math.floor(i/N), c=i%N; toggle(r,c); toggle(r-1,c); toggle(r+1,c); toggle(r,c-1); toggle(r,c+1); }
    function click(i){ if(solved)return; applyMove(i); moves++; if(movesEl)movesEl.textContent=moves; render(); checkWin(); }
    function checkWin(){ if(state.every(v=>!v)){ solved=true; if(best===0||moves<best){ best=moves; localStorage.setItem('pwLightsoutBest',best); if(bestEl)bestEl.textContent=best; } if(finalEl)finalEl.textContent=moves; if(winEl)winEl.classList.add('show'); } }
    function newPuzzle(){ state=Array(N*N).fill(0); const k=8+Math.floor(Math.random()*8); for(let m=0;m<k;m++) applyMove(Math.floor(Math.random()*N*N)); if(state.every(v=>!v)) applyMove(Math.floor(Math.random()*N*N)); moves=0; solved=false; if(movesEl)movesEl.textContent='0'; if(winEl)winEl.classList.remove('show'); render(); }
    if(startBtn)startBtn.addEventListener('click',newPuzzle); if(againBtn)againBtn.addEventListener('click',newPuzzle);
    window.__lightsout={ ready:false, init(){ if(this.ready)return; this.ready=true; build(); newPuzzle(); }, stop(){} };
  })();

  /* ---------- TIC-TAC-TOE ---------- */
  (function(){
    const grid=document.getElementById('tttGrid'); if(!grid)return;
    const turnEl=document.getElementById('tttTurn'), xEl=document.getElementById('tttX'), oEl=document.getElementById('tttO');
    const overEl=document.getElementById('tttOver'), resultEl=document.getElementById('tttResult');
    const againBtn=document.getElementById('tttAgain'), modeBtn=document.getElementById('tttMode'), resetBtn=document.getElementById('tttReset');
    const WINS=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let cells=[], board=Array(9).fill(''), turn='X', over=false, vsCpu=false, xWins=0, oWins=0;
    function build(){ grid.innerHTML=''; cells=[]; for(let i=0;i<9;i++){ const b=document.createElement('button'); b.className='ttt-cell'; b.type='button'; b.setAttribute('aria-label','cell '+(i+1)); b.addEventListener('click',()=>play(i)); grid.appendChild(b); cells.push(b); } }
    function reset(){ board=Array(9).fill(''); turn='X'; over=false; if(turnEl)turnEl.textContent='X'; if(overEl)overEl.classList.remove('show'); cells.forEach(c=>{ c.textContent=''; c.className='ttt-cell'; c.disabled=false; }); }
    function winChk(bd){ for(const w of WINS){ const [a,b,c]=w; if(bd[a]&&bd[a]===bd[b]&&bd[a]===bd[c]) return {p:bd[a], line:w}; } return null; }
    function winner(){ const w=winChk(board); if(w)return w; return board.every(v=>v)? {p:'draw',line:null} : null; }
    function place(i,p){ board[i]=p; cells[i].textContent=p==='X'?'✕':'◯'; cells[i].classList.add(p==='X'?'x':'o'); cells[i].disabled=true; }
    function finish(res){ over=true; cells.forEach(c=>c.disabled=true); if(res.line)res.line.forEach(i=>cells[i].classList.add('win'));
      if(res.p==='draw'){ if(resultEl)resultEl.textContent='Draw'; } else { if(res.p==='X'){ xWins++; if(xEl)xEl.textContent=xWins; } else { oWins++; if(oEl)oEl.textContent=oWins; } if(resultEl)resultEl.textContent=res.p+' wins'; }
      if(overEl)overEl.classList.add('show'); }
    function play(i){ if(over||board[i])return; if(vsCpu&&turn==='O')return; place(i,turn); let res=winner(); if(res){ finish(res); return; } turn=turn==='X'?'O':'X'; if(turnEl)turnEl.textContent=turn; if(vsCpu&&turn==='O')setTimeout(cpuMove,260); }
    function minimax(bd,player){ const w=winChk(bd); if(w)return {score: w.p==='O'?10:-10}; if(bd.every(v=>v))return {score:0};
      const moves=[]; for(let i=0;i<9;i++){ if(!bd[i]){ bd[i]=player; const r=minimax(bd, player==='O'?'X':'O'); moves.push({i:i, score:r.score}); bd[i]=''; } }
      let best=null; if(player==='O'){ let bs=-Infinity; moves.forEach(m=>{ if(m.score>bs){ bs=m.score; best=m; } }); } else { let bs=Infinity; moves.forEach(m=>{ if(m.score<bs){ bs=m.score; best=m; } }); } return best; }
    function cpuMove(){ if(over)return; const m=minimax(board.slice(),'O'); if(m&&m.i!=null){ place(m.i,'O'); const res=winner(); if(res){ finish(res); return; } turn='X'; if(turnEl)turnEl.textContent='X'; } }
    if(againBtn)againBtn.addEventListener('click',reset);
    if(resetBtn)resetBtn.addEventListener('click',()=>{ xWins=0; oWins=0; if(xEl)xEl.textContent='0'; if(oEl)oEl.textContent='0'; reset(); });
    if(modeBtn)modeBtn.addEventListener('click',()=>{ vsCpu=!vsCpu; modeBtn.textContent='vs CPU: '+(vsCpu?'On':'Off'); reset(); });
    window.__ttt={ ready:false, init(){ if(this.ready)return; this.ready=true; build(); reset(); }, stop(){} };
  })();

  /* ---------- 15-PUZZLE ---------- */
  (function(){
    const grid=document.getElementById('fifteenGrid'); if(!grid)return;
    const movesEl=document.getElementById('fifteenMoves'), bestEl=document.getElementById('fifteenBest');
    const winEl=document.getElementById('fifteenWin'), finalEl=document.getElementById('fifteenFinal');
    const startBtn=document.getElementById('fifteenStart'), againBtn=document.getElementById('fifteenAgain');
    const N=4; let tiles=[], order=[], moves=0, solved=false;
    let best=parseInt(localStorage.getItem('pwFifteenBest')||'0',10);
    if(bestEl)bestEl.textContent= best>0? best : '';
    function build(){ grid.innerHTML=''; tiles=[]; for(let i=0;i<N*N;i++){ const t=document.createElement('button'); t.className='fif-tile'; t.type='button'; t.addEventListener('click',()=>click(i)); grid.appendChild(t); tiles.push(t); } }
    function render(){ for(let i=0;i<N*N;i++){ const v=order[i]; if(v===0){ tiles[i].textContent=''; tiles[i].className='fif-tile blank'; } else { tiles[i].textContent=v; tiles[i].className='fif-tile'; } } }
    function click(i){ if(solved)return; const b=order.indexOf(0); const br=Math.floor(b/N), bc=b%N, ir=Math.floor(i/N), ic=i%N; if((Math.abs(br-ir)===1&&bc===ic)||(Math.abs(bc-ic)===1&&br===ir)){ order[b]=order[i]; order[i]=0; moves++; if(movesEl)movesEl.textContent=moves; render(); checkWin(); } }
    function isSolved(arr){ for(let i=0;i<N*N-1;i++){ if(arr[i]!==i+1)return false; } return arr[N*N-1]===0; }
    function checkWin(){ if(!isSolved(order))return; solved=true; if(best===0||moves<best){ best=moves; localStorage.setItem('pwFifteenBest',best); if(bestEl)bestEl.textContent=best; } if(finalEl)finalEl.textContent=moves; if(winEl)winEl.classList.add('show'); }
    function solvable(arr){ let inv=0; const a=arr.filter(v=>v!==0); for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++) if(a[i]>a[j])inv++; if(N%2===1)return inv%2===0; const blankRowFromBottom=N-Math.floor(arr.indexOf(0)/N); return (blankRowFromBottom%2===0)?(inv%2===1):(inv%2===0); }
    function shuffle(){ do { order=[]; for(let i=1;i<N*N;i++)order.push(i); order.push(0); for(let i=order.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const tmp=order[i]; order[i]=order[j]; order[j]=tmp; } } while(!solvable(order)||isSolved(order)); moves=0; solved=false; if(movesEl)movesEl.textContent='0'; if(winEl)winEl.classList.remove('show'); render(); }
    if(startBtn)startBtn.addEventListener('click',shuffle); if(againBtn)againBtn.addEventListener('click',shuffle);
    window.__fifteen={ ready:false, init(){ if(this.ready)return; this.ready=true; build(); shuffle(); }, stop(){} };
  })();

  /* ---------- SOKOBAN ---------- */
  (function(){
    const grid=document.getElementById('sokoGrid'); if(!grid)return;
    const movesEl=document.getElementById('sokoMoves'), levelEl=document.getElementById('sokoLevel');
    const winEl=document.getElementById('sokoWin'), finalEl=document.getElementById('sokoFinal');
    const startBtn=document.getElementById('sokoStart'), againBtn=document.getElementById('sokoAgain');
    const LEVELS=[
      ["#####","#@  #","# $.#","#####"],
      ["#######","#@    #","# $ . #","# $ . #","#######"],
      ["########","#@     #","# $  . #","#      #","# $  . #","########"]
    ];
    let lvl=0, rows=0, colsN=0, gridMap=[], goals=[], boxes=[], px=0, py=0, moves=0, won=false;
    function parse(def){ gridMap=[]; goals=[]; boxes=[]; rows=def.length; colsN=def[0].length;
      for(let r=0;r<rows;r++){ const row=[]; for(let c=0;c<colsN;c++){ const ch=def[r][c]; row.push(ch==='#'?1:0);
        if(ch==='.'||ch==='*'||ch==='+')goals.push(r+','+c);
        if(ch==='$'||ch==='*')boxes.push(r+','+c);
        if(ch==='@'||ch==='+'){ py=r; px=c; } } gridMap.push(row); } }
    function isGoal(r,c){ return goals.indexOf(r+','+c)>=0; }
    function boxAt(r,c){ return boxes.indexOf(r+','+c); }
    function render(){ grid.style.gridTemplateColumns='repeat('+colsN+', 1fr)'; grid.innerHTML='';
      for(let r=0;r<rows;r++)for(let c=0;c<colsN;c++){ const cell=document.createElement('div');
        cell.className='soko-cell '+(gridMap[r][c]?'wall':'floor')+(isGoal(r,c)?' goal':'');
        if(boxAt(r,c)>=0){ const b=document.createElement('div'); b.className='soko-box'+(isGoal(r,c)?' on-goal':''); cell.appendChild(b); }
        else if(r===py&&c===px){ const p=document.createElement('div'); p.className='soko-player'; cell.appendChild(p); }
        grid.appendChild(cell); } }
    function load(){ parse(LEVELS[lvl]); moves=0; won=false; if(movesEl)movesEl.textContent='0'; if(levelEl)levelEl.textContent=(lvl+1); if(winEl)winEl.classList.remove('show'); render(); }
    function checkWin(){ if(boxes.length&&boxes.every(b=>goals.indexOf(b)>=0)){ won=true; try{ const cur=parseInt(localStorage.getItem('pwSokobanLevel')||'0',10); if(lvl+1>cur)localStorage.setItem('pwSokobanLevel',lvl+1); }catch(e){} if(finalEl)finalEl.textContent=(lvl<LEVELS.length-1?'Level '+(lvl+1)+' clear':'All levels clear!'); if(winEl)winEl.classList.add('show'); } }
    function move(dr,dc){ if(won)return; const nr=py+dr, nc=px+dc; if(nr<0||nr>=rows||nc<0||nc>=colsN||gridMap[nr][nc])return;
      const bi=boxAt(nr,nc);
      if(bi>=0){ const br=nr+dr, bc=nc+dc; if(br<0||br>=rows||bc<0||bc>=colsN||gridMap[br][bc]||boxAt(br,bc)>=0)return; boxes[bi]=br+','+bc; }
      py=nr; px=nc; moves++; if(movesEl)movesEl.textContent=moves; render(); checkWin(); }
    function next(){ if(lvl<LEVELS.length-1)lvl++; load(); }
    function onKey(e){ const p=document.querySelector('.apanel[data-panel="sokoban"]'); if(!p||p.classList.contains('hidden'))return;
      let dr=0,dc=0; const k=e.key;
      if(k==='ArrowUp'||k==='w'||k==='W')dr=-1; else if(k==='ArrowDown'||k==='s'||k==='S')dr=1;
      else if(k==='ArrowLeft'||k==='a'||k==='A')dc=-1; else if(k==='ArrowRight'||k==='d'||k==='D')dc=1; else return;
      e.preventDefault(); move(dr,dc); }
    document.addEventListener('keydown',onKey);
    document.querySelectorAll('[data-soko]').forEach(b=>b.addEventListener('click',()=>{ const d=b.dataset.soko; if(d==='up')move(-1,0); else if(d==='down')move(1,0); else if(d==='left')move(0,-1); else if(d==='right')move(0,1); }));
    if(startBtn)startBtn.addEventListener('click',load);
    if(againBtn)againBtn.addEventListener('click',()=>{ if(won)next(); else load(); });
    window.__sokoban={ ready:false, init(){ if(this.ready)return; this.ready=true; lvl=0; load(); }, stop(){} };
  })();

  /* ===== REVERSI / OTHELLO (2P + greedy CPU) ===== */
  (function(){
    const gridEl=document.getElementById('revGrid'), gEl=document.getElementById('revG'), tEl=document.getElementById('revT'),
          turnEl=document.getElementById('revTurn'), overEl=document.getElementById('revOver'), resEl=document.getElementById('revResult'),
          againBtn=document.getElementById('revAgain'), modeBtn=document.getElementById('revMode'), newBtn=document.getElementById('revNew');
    if(!gridEl)return;
    const N=8; let board, turn, vsCpu=true, over=false;
    const DIRS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    function reset(){ board=Array.from({length:N},()=>Array(N).fill(0));
      board[3][3]=2; board[3][4]=1; board[4][3]=1; board[4][4]=2; // 1=gold, 2=teal
      turn=1; over=false; if(overEl)overEl.classList.remove('show'); render(); }
    function inB(r,c){ return r>=0&&r<N&&c>=0&&c<N; }
    function flips(r,c,p){ if(board[r][c])return []; const opp=p===1?2:1; let res=[];
      for(const [dr,dc] of DIRS){ let line=[], rr=r+dr, cc=c+dc;
        while(inB(rr,cc)&&board[rr][cc]===opp){ line.push([rr,cc]); rr+=dr; cc+=dc; }
        if(line.length&&inB(rr,cc)&&board[rr][cc]===p)res=res.concat(line); }
      return res; }
    function legalMoves(p){ const m=[]; for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(flips(r,c,p).length)m.push([r,c]); return m; }
    function place(r,c,p){ const f=flips(r,c,p); if(!f.length)return false; board[r][c]=p; for(const [rr,cc] of f)board[rr][cc]=p; return true; }
    function counts(){ let g=0,t=0; for(let r=0;r<N;r++)for(let c=0;c<N;c++){ if(board[r][c]===1)g++; else if(board[r][c]===2)t++; } return {g,t}; }
    function render(){ gridEl.innerHTML=''; const legal=over?[]:legalMoves(turn); const lset=new Set(legal.map(m=>m[0]+','+m[1]));
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){ const cell=document.createElement('div'); cell.className='rev-cell';
        if(lset.has(r+','+c)&&!(vsCpu&&turn===2))cell.classList.add('legal');
        if(board[r][c]){ const d=document.createElement('div'); d.className='rev-disc '+(board[r][c]===1?'g':'t'); cell.appendChild(d); }
        cell.addEventListener('click',()=>human(r,c)); gridEl.appendChild(cell); }
      const ct=counts(); if(gEl)gEl.textContent=ct.g; if(tEl)tEl.textContent=ct.t;
      if(turnEl)turnEl.textContent=turn===1?'Gold':'Teal'; }
    function nextTurn(){ const other=turn===1?2:1;
      if(legalMoves(other).length){ turn=other; }
      else if(legalMoves(turn).length){ /* opponent passes, same player again */ }
      else { return finish(); }
      render(); maybeCpu(); }
    function finish(){ over=true; const ct=counts(); if(resEl)resEl.textContent=ct.g>ct.t?'Gold wins '+ct.g+'-'+ct.t:ct.t>ct.g?'Teal wins '+ct.t+'-'+ct.g:'Tie '+ct.g+'-'+ct.t;
      if(overEl)overEl.classList.add('show'); render(); }
    function human(r,c){ if(over)return; if(vsCpu&&turn===2)return; if(!flips(r,c,turn).length)return; place(r,c,turn); nextTurn(); }
    function maybeCpu(){ if(over||!vsCpu||turn!==2)return;
      setTimeout(()=>{ const m=legalMoves(2); if(!m.length){ nextTurn(); return; }
        let best=m[0],bestN=-1; for(const [r,c] of m){ const n=flips(r,c,2).length; if(n>bestN){ bestN=n; best=[r,c]; } }
        place(best[0],best[1],2); nextTurn(); }, 380); }
    if(againBtn)againBtn.addEventListener('click',reset);
    if(newBtn)newBtn.addEventListener('click',reset);
    if(modeBtn)modeBtn.addEventListener('click',()=>{ vsCpu=!vsCpu; modeBtn.textContent='vs CPU: '+(vsCpu?'On':'Off'); reset(); });
    window.__reversi={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){} };
  })();

  /* ===== MASTERMIND (6 colors, exact/partial peg feedback) ===== */
  (function(){
    const boardEl=document.getElementById('masBoard'), rowLbl=document.getElementById('masRowLbl'), bestEl=document.getElementById('masBest'),
          overEl=document.getElementById('masOver'), overLabel=document.getElementById('masOverLabel'), resEl=document.getElementById('masResult'),
          revealEl=document.getElementById('masReveal'), againBtn=document.getElementById('masAgain'), paletteEl=document.getElementById('masPalette'),
          clearBtn=document.getElementById('masClear'), guessBtn=document.getElementById('masGuess');
    if(!boardEl)return;
    const COLORS=['#D4A843','#4FB3A4','#E85D5D','#6C8FE8','#E8DFC8','#9B6CE8']; const LEN=4, ROWS=10;
    let code, row, cur, done;
    function best(){ return parseInt(localStorage.getItem('pwMastermindBest')||'0',10); }
    function showBest(){ const b=best(); if(bestEl)bestEl.textContent=b?b:''; }
    function reset(){ code=Array.from({length:LEN},()=>Math.floor(Math.random()*COLORS.length));
      row=0; cur=[]; done=false; if(overEl)overEl.classList.remove('show'); buildBoard(); buildPalette(); showBest(); }
    function buildBoard(){ boardEl.innerHTML=''; for(let r=0;r<ROWS;r++){ const rowEl=document.createElement('div'); rowEl.className='mas-row'; rowEl.dataset.row=r;
      for(let i=0;i<LEN;i++){ const p=document.createElement('div'); p.className='mas-peg'; rowEl.appendChild(p); }
      const fb=document.createElement('div'); fb.className='mas-feedback'; for(let i=0;i<LEN;i++){ const f=document.createElement('div'); f.className='mas-fb'; fb.appendChild(f); } rowEl.appendChild(fb);
      boardEl.appendChild(rowEl); } updateRowLbl(); }
    function buildPalette(){ paletteEl.innerHTML=''; COLORS.forEach((col,idx)=>{ const sw=document.createElement('button'); sw.className='mas-swatch'; sw.style.background=col;
      sw.addEventListener('click',()=>{ if(done||cur.length>=LEN)return; cur.push(idx); paintCur(); }); paletteEl.appendChild(sw); }); }
    function paintCur(){ const rowEl=boardEl.querySelector('.mas-row[data-row="'+row+'"]'); if(!rowEl)return; const pegs=rowEl.querySelectorAll('.mas-peg');
      pegs.forEach((p,i)=>{ if(i<cur.length){ p.style.background=COLORS[cur[i]]; p.classList.add('filled'); } else { p.style.background=''; p.classList.remove('filled'); } }); }
    function updateRowLbl(){ if(rowLbl)rowLbl.textContent=(Math.min(row+1,ROWS))+'/'+ROWS; }
    function score(guess){ let exact=0,partial=0; const cc=code.slice(), gg=guess.slice();
      for(let i=0;i<LEN;i++)if(gg[i]===cc[i]){ exact++; cc[i]=-1; gg[i]=-2; }
      for(let i=0;i<LEN;i++){ if(gg[i]<0)continue; const j=cc.indexOf(gg[i]); if(j>=0){ partial++; cc[j]=-1; } } return {exact,partial}; }
    function submit(){ if(done||cur.length<LEN)return; const {exact,partial}=score(cur);
      const rowEl=boardEl.querySelector('.mas-row[data-row="'+row+'"]'); const fbs=rowEl.querySelectorAll('.mas-fb'); let k=0;
      for(let i=0;i<exact;i++)fbs[k++].classList.add('exact'); for(let i=0;i<partial;i++)fbs[k++].classList.add('partial');
      if(exact===LEN){ done=true; finish(true); return; } row++; cur=[]; updateRowLbl();
      if(row>=ROWS){ done=true; finish(false); } }
    function finish(won){ if(won){ const tries=row+1; const b=best(); if(!b||tries<b)localStorage.setItem('pwMastermindBest',String(tries)); showBest();
        if(overLabel)overLabel.textContent='Cracked'; if(resEl)resEl.textContent='Solved in '+tries; }
      else { if(overLabel)overLabel.textContent='Out of rows'; if(resEl)resEl.textContent='The code was'; }
      if(revealEl){ revealEl.innerHTML=''; code.forEach(ci=>{ const p=document.createElement('div'); p.className='mas-peg filled'; p.style.background=COLORS[ci]; revealEl.appendChild(p); }); }
      if(overEl)overEl.classList.add('show'); }
    if(clearBtn)clearBtn.addEventListener('click',()=>{ if(done)return; cur=[]; paintCur(); });
    if(guessBtn)guessBtn.addEventListener('click',submit);
    if(againBtn)againBtn.addEventListener('click',reset);
    window.__mastermind={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){} };
  })();

  /* ===== VIDEO POKER (Jacks or Better) ===== */
  (function(){
    const credEl=document.getElementById('vpCredits'), bestEl=document.getElementById('vpBest'), resEl=document.getElementById('vpResult'),
          handEl=document.getElementById('vpHand'), dealBtn=document.getElementById('vpDeal'), drawBtn=document.getElementById('vpDraw');
    if(!handEl)return;
    const SUITS=['♠','♥','♦','♣'], RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K','A']; const BET=5;
    let deck, hand, held, credits, phase; // phase: 'deal' | 'draw'
    const PAYOUTS=[ ['Royal Flush',250],['Straight Flush',50],['Four of a Kind',25],['Full House',9],['Flush',6],['Straight',4],['Three of a Kind',3],['Two Pair',2],['Jacks or Better',1] ];
    function best(){ return parseInt(localStorage.getItem('pwVpokerBest')||'100',10); }
    function showBest(){ if(bestEl)bestEl.textContent=best(); }
    function newDeck(){ const d=[]; for(let s=0;s<4;s++)for(let r=0;r<13;r++)d.push({s,r}); for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; }
    function reset(){ credits=100; localStorage.setItem('pwVpokerBest', String(Math.max(best(),100))); phase='deal'; hand=[]; held=[false,false,false,false,false];
      if(credEl)credEl.textContent=credits; showBest(); if(resEl)resEl.textContent='Jacks or Better. Deal to start';
      renderEmpty(); if(dealBtn)dealBtn.disabled=false; if(drawBtn)drawBtn.disabled=true; }
    function renderEmpty(){ handEl.innerHTML=''; for(let i=0;i<5;i++){ const c=document.createElement('div'); c.className='vp-card back'; c.textContent='♦'; handEl.appendChild(c); } }
    function renderHand(){ handEl.innerHTML=''; hand.forEach((card,i)=>{ const c=document.createElement('div'); const red=card.s===1||card.s===2;
      c.className='vp-card'+(red?' red':'')+(held[i]?' held':''); c.innerHTML='<span class="vp-rank">'+RANKS[card.r]+'</span><span class="vp-suit">'+SUITS[card.s]+'</span>'+(held[i]?'<span class="vp-hold-tag">HELD</span>':'');
      c.addEventListener('click',()=>{ if(phase!=='draw')return; held[i]=!held[i]; renderHand(); }); handEl.appendChild(c); }); }
    function deal(){ if(credits<BET){ if(resEl)resEl.textContent='Out of credits. Game resets'; reset(); return; }
      credits-=BET; if(credEl)credEl.textContent=credits; deck=newDeck(); hand=[]; for(let i=0;i<5;i++)hand.push(deck.pop()); held=[false,false,false,false,false];
      phase='draw'; renderHand(); if(resEl)resEl.textContent='Hold cards, then Draw'; if(dealBtn)dealBtn.disabled=true; if(drawBtn)drawBtn.disabled=false; }
    function draw(){ if(phase!=='draw')return; for(let i=0;i<5;i++)if(!held[i])hand[i]=deck.pop(); renderHand();
      const ev=evaluate(hand); if(ev){ const win=ev[1]*BET; credits+=win; if(resEl)resEl.textContent=ev[0]+' +'+win; } else { if(resEl)resEl.textContent='No win - Deal again'; }
      if(credEl)credEl.textContent=credits; if(credits>best())localStorage.setItem('pwVpokerBest',String(credits)); showBest();
      phase='deal'; if(dealBtn)dealBtn.disabled=false; if(drawBtn)drawBtn.disabled=true; }
    function evaluate(h){ const ranks=h.map(c=>c.r).sort((a,b)=>a-b), suits=h.map(c=>c.s);
      const flush=suits.every(s=>s===suits[0]);
      const cnt={}; ranks.forEach(r=>cnt[r]=(cnt[r]||0)+1); const groups=Object.values(cnt).sort((a,b)=>b-a);
      let straight=true; for(let i=1;i<5;i++)if(ranks[i]!==ranks[i-1]+1)straight=false;
      const wheel=ranks.join(',')==='0,1,2,3,12'; // A-2-3-4-5
      const isStraight=straight||wheel;
      const high=ranks[ranks.length-1];
      if(isStraight&&flush&&ranks.join(',')==='8,9,10,11,12')return PAYOUTS[0]; // Royal
      if(isStraight&&flush)return PAYOUTS[1];
      if(groups[0]===4)return PAYOUTS[2];
      if(groups[0]===3&&groups[1]===2)return PAYOUTS[3];
      if(flush)return PAYOUTS[4];
      if(isStraight)return PAYOUTS[5];
      if(groups[0]===3)return PAYOUTS[6];
      if(groups[0]===2&&groups[1]===2)return PAYOUTS[7];
      if(groups[0]===2){ // pair - only Jacks or Better pays (J=9,Q=10,K=11,A=12)
        for(const r in cnt){ if(cnt[r]===2&&(+r>=9))return PAYOUTS[8]; } }
      return null; }
    if(dealBtn)dealBtn.addEventListener('click',deal);
    if(drawBtn)drawBtn.addEventListener('click',draw);
    window.__vpoker={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){} };
  })();

  /* ===== CHECKERS (2P + greedy CPU) ===== */
  (function(){
    const gridEl=document.getElementById('chkGrid'), goldEl=document.getElementById('chkGold'), tealEl=document.getElementById('chkTeal'),
          turnEl=document.getElementById('chkTurn'), overEl=document.getElementById('chkOver'), resEl=document.getElementById('chkResult'),
          againBtn=document.getElementById('chkAgain'), modeBtn=document.getElementById('chkMode'), newBtn=document.getElementById('chkNew');
    if(!gridEl)return;
    const N=8; let board, turn, sel, vsCpu=true, over=false; // turn 1=teal(human, up), 2=gold(cpu, down)
    function reset(){ board=Array.from({length:N},()=>Array(N).fill(null));
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){ if((r+c)%2===1){ if(r<3)board[r][c]={p:2,king:false}; else if(r>4)board[r][c]={p:1,king:false}; } }
      turn=1; sel=null; over=false; if(overEl)overEl.classList.remove('show'); render(); }
    function inB(r,c){ return r>=0&&r<N&&c>=0&&c<N; }
    function dirs(pc){ return pc.king?[[-1,-1],[-1,1],[1,-1],[1,1]]:(pc.p===1?[[-1,-1],[-1,1]]:[[1,-1],[1,1]]); }
    function movesFor(r,c){ const pc=board[r][c]; if(!pc)return []; const out=[];
      for(const [dr,dc] of dirs(pc)){ const nr=r+dr,nc=c+dc;
        if(inB(nr,nc)&&!board[nr][nc])out.push({to:[nr,nc],cap:null});
        const jr=r+2*dr,jc=c+2*dc;
        if(inB(jr,jc)&&!board[jr][jc]&&board[nr][nc]&&board[nr][nc].p!==pc.p)out.push({to:[jr,jc],cap:[nr,nc]}); }
      return out; }
    function allMoves(p){ const res=[]; let hasCap=false;
      for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(board[r][c]&&board[r][c].p===p){ for(const m of movesFor(r,c)){ res.push({from:[r,c],to:m.to,cap:m.cap}); if(m.cap)hasCap=true; } }
      return hasCap?res.filter(m=>m.cap):res; }
    function counts(){ let g=0,t=0; for(let r=0;r<N;r++)for(let c=0;c<N;c++){ const pc=board[r][c]; if(pc){ if(pc.p===2)g++; else t++; } } return {g,t}; }
    function render(){ gridEl.innerHTML=''; const legal=(!over&&!(vsCpu&&turn===2))?allMoves(turn):[];
      const targets=new Set(); if(sel)legal.filter(m=>m.from[0]===sel[0]&&m.from[1]===sel[1]).forEach(m=>targets.add(m.to[0]+','+m.to[1]));
      const selectable=new Set(legal.map(m=>m.from[0]+','+m.from[1]));
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){ const cell=document.createElement('div'); const dark=(r+c)%2===1; cell.className='chk-cell '+(dark?'dark':'light');
        if(sel&&sel[0]===r&&sel[1]===c)cell.classList.add('sel');
        if(targets.has(r+','+c))cell.classList.add('move');
        const pc=board[r][c]; if(pc){ const d=document.createElement('div'); d.className='chk-pc '+(pc.p===2?'g':'t')+(pc.king?' king':''); cell.appendChild(d); }
        cell.addEventListener('click',()=>onCell(r,c,selectable,targets)); gridEl.appendChild(cell); }
      const ct=counts(); if(goldEl)goldEl.textContent=ct.g; if(tealEl)tealEl.textContent=ct.t; if(turnEl)turnEl.textContent=turn===1?'Teal':'Gold'; }
    function onCell(r,c,selectable,targets){ if(over||(vsCpu&&turn===2))return;
      if(sel&&targets.has(r+','+c)){ doMove(sel[0],sel[1],r,c); return; }
      if(board[r][c]&&board[r][c].p===turn&&selectable.has(r+','+c)){ sel=[r,c]; render(); }
      else { sel=null; render(); } }
    function doMove(fr,fc,tr,tc){ const m=allMoves(turn).find(x=>x.from[0]===fr&&x.from[1]===fc&&x.to[0]===tr&&x.to[1]===tc); if(!m)return;
      const pc=board[fr][fc]; board[tr][tc]=pc; board[fr][fc]=null; if(m.cap)board[m.cap[0]][m.cap[1]]=null;
      const promote=(pc.p===1&&tr===0)||(pc.p===2&&tr===N-1); if(promote&&!pc.king)pc.king=true;
      if(!promote&&m.cap){ const more=movesFor(tr,tc).filter(x=>x.cap); if(more.length){ sel=[tr,tc]; render(); return; } }
      sel=null; endTurn(); }
    function endTurn(){ turn=turn===1?2:1; if(checkEnd())return; render(); if(vsCpu&&turn===2)setTimeout(cpuMove,360); }
    function finish(w){ over=true; if(resEl)resEl.textContent=w+' wins'; if(overEl)overEl.classList.add('show'); render(); }
    function checkEnd(){ const ct=counts(); if(ct.t===0){ finish('Gold'); return true; } if(ct.g===0){ finish('Teal'); return true; }
      if(allMoves(turn).length===0){ finish(turn===1?'Gold':'Teal'); return true; } return false; }
    function cpuMove(){ if(over||turn!==2)return; const mv=allMoves(2); if(!mv.length){ checkEnd(); return; }
      const pick=mv[Math.floor(Math.random()*mv.length)]; const pc=board[pick.from[0]][pick.from[1]];
      board[pick.to[0]][pick.to[1]]=pc; board[pick.from[0]][pick.from[1]]=null; if(pick.cap)board[pick.cap[0]][pick.cap[1]]=null;
      const promote=(pick.to[0]===N-1); if(promote&&!pc.king)pc.king=true;
      if(!promote&&pick.cap){ const more=movesFor(pick.to[0],pick.to[1]).filter(x=>x.cap); if(more.length){ sel=[pick.to[0],pick.to[1]]; render(); setTimeout(cpuChain,300); return; } }
      sel=null; endTurn(); }
    function cpuChain(){ if(over||turn!==2||!sel)return; const more=movesFor(sel[0],sel[1]).filter(x=>x.cap); if(!more.length){ sel=null; endTurn(); return; }
      const j=more[Math.floor(Math.random()*more.length)]; const pc=board[sel[0]][sel[1]];
      board[j.to[0]][j.to[1]]=pc; board[sel[0]][sel[1]]=null; board[j.cap[0]][j.cap[1]]=null;
      if(j.to[0]===N-1&&!pc.king)pc.king=true;
      sel=[j.to[0],j.to[1]]; if(movesFor(sel[0],sel[1]).filter(x=>x.cap).length){ render(); setTimeout(cpuChain,300); return; } sel=null; endTurn(); }
    if(againBtn)againBtn.addEventListener('click',reset);
    if(newBtn)newBtn.addEventListener('click',reset);
    if(modeBtn)modeBtn.addEventListener('click',()=>{ vsCpu=!vsCpu; modeBtn.textContent='vs CPU: '+(vsCpu?'On':'Off'); reset(); });
    window.__checkers={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){} };
  })();

  /* ===== BLACKJACK (vs dealer) ===== */
  (function(){
    const chipsEl=document.getElementById('bjChips'), bestEl=document.getElementById('bjBest'), resEl=document.getElementById('bjResult'),
          dealerEl=document.getElementById('bjDealer'), playerEl=document.getElementById('bjPlayer'), dScoreEl=document.getElementById('bjDealerScore'), pScoreEl=document.getElementById('bjPlayerScore'),
          dealBtn=document.getElementById('bjDeal'), hitBtn=document.getElementById('bjHit'), standBtn=document.getElementById('bjStand');
    if(!playerEl)return;
    const SUITS=['♠','♥','♦','♣'], RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K']; const BET=10;
    let deck, dealer, player, chips, phase, hideHole;
    function best(){ return parseInt(localStorage.getItem('pwBlackjackBest')||'100',10); }
    function showBest(){ if(bestEl)bestEl.textContent=best(); }
    function newDeck(){ const d=[]; for(let s=0;s<4;s++)for(let r=0;r<13;r++)d.push({s,r}); for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; }
    function reset(){ chips=100; localStorage.setItem('pwBlackjackBest', String(Math.max(best(),100))); phase='bet'; dealer=[]; player=[]; hideHole=true;
      if(chipsEl)chipsEl.textContent=chips; showBest(); if(resEl)resEl.textContent='Bet '+BET+'. Deal to start'; renderHands(); setBtns(); }
    function val(hand){ let sum=0,aces=0; hand.forEach(c=>{ const r=c.r; if(r===0){ aces++; sum+=11; } else if(r>=9){ sum+=10; } else sum+=r+1; }); while(sum>21&&aces){ sum-=10; aces--; } return sum; }
    function cardHtml(c,hidden){ if(hidden)return '<div class="vp-card back">♦</div>'; const red=c.s===1||c.s===2; return '<div class="vp-card'+(red?' red':'')+'"><span class="vp-rank">'+RANKS[c.r]+'</span><span class="vp-suit">'+SUITS[c.s]+'</span></div>'; }
    function renderHands(){ dealerEl.innerHTML=dealer.map((c,i)=>cardHtml(c, hideHole&&i===1)).join(''); playerEl.innerHTML=player.map(c=>cardHtml(c,false)).join('');
      if(dScoreEl)dScoreEl.textContent= dealer.length? (hideHole? val([dealer[0]]) : val(dealer)) : '';
      if(pScoreEl)pScoreEl.textContent= player.length? val(player) : ''; }
    function setBtns(){ const playing=phase==='play'; if(hitBtn)hitBtn.disabled=!playing; if(standBtn)standBtn.disabled=!playing; if(dealBtn)dealBtn.disabled=playing; }
    function deal(){ if(phase==='play')return; if(chips<BET){ reset(); if(resEl)resEl.textContent='Reset to 100 chips. Deal'; return; }
      chips-=BET; if(chipsEl)chipsEl.textContent=chips; deck=newDeck(); dealer=[deck.pop(),deck.pop()]; player=[deck.pop(),deck.pop()]; hideHole=true; phase='play';
      renderHands(); setBtns(); if(val(player)===21){ stand(); return; } if(resEl)resEl.textContent='Hit or Stand'; }
    function hit(){ if(phase!=='play')return; player.push(deck.pop()); renderHands(); if(val(player)>21)finish(); }
    function stand(){ if(phase!=='play')return; hideHole=false; while(val(dealer)<17)dealer.push(deck.pop()); renderHands(); finish(); }
    function finish(){ hideHole=false; phase='done'; renderHands(); const pv=val(player), dv=val(dealer); let msg, win=0;
      const pBJ=(player.length===2&&pv===21), dBJ=(dealer.length===2&&dv===21);
      if(pv>21)msg='Bust. You lose';
      else if(dv>21){ msg='Dealer busts. You win'; win=BET*2; }
      else if(pBJ&&!dBJ){ msg='Blackjack! 3:2'; win=Math.floor(BET*2.5); }
      else if(pv>dv){ msg='You win, '+pv+' vs '+dv; win=BET*2; }
      else if(pv<dv)msg='Dealer wins, '+dv+' vs '+pv;
      else { msg='Push. Bet returned'; win=BET; }
      chips+=win; if(chipsEl)chipsEl.textContent=chips; if(chips>best())localStorage.setItem('pwBlackjackBest',String(chips)); showBest();
      if(resEl)resEl.textContent=msg+(win>0?' (+'+win+')':''); phase='bet'; setBtns(); }
    if(dealBtn)dealBtn.addEventListener('click',deal);
    if(hitBtn)hitBtn.addEventListener('click',hit);
    if(standBtn)standBtn.addEventListener('click',stand);
    window.__blackjack={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){} };
  })();

  /* ===== GEM CRUSH (Match-3, synchronous cascade) ===== */
  (function(){
    const gridEl=document.getElementById('gemGrid'), scoreEl=document.getElementById('gemScore'), movesEl=document.getElementById('gemMoves'), bestEl=document.getElementById('gemBest'),
          overEl=document.getElementById('gemOver'), resEl=document.getElementById('gemResult'), againBtn=document.getElementById('gemAgain'), newBtn=document.getElementById('gemNew');
    if(!gridEl)return;
    const N=8, COLORS=['#E85D5D','#4FB3A4','#D4A843','#6C8FE8','#9B6CE8','#E8DFC8'], START_MOVES=20;
    let board, score, movesLeft, sel, over;
    function best(){ return parseInt(localStorage.getItem('pwGemsBest')||'0',10); }
    function showBest(){ if(bestEl)bestEl.textContent=best(); }
    function rnd(){ return Math.floor(Math.random()*COLORS.length); }
    function findMatches(){ const m=new Set();
      for(let r=0;r<N;r++)for(let c=0;c<N-2;c++){ const v=board[r][c]; if(v<0)continue; if(board[r][c+1]===v&&board[r][c+2]===v){ m.add(r+','+c); m.add(r+','+(c+1)); m.add(r+','+(c+2)); } }
      for(let c=0;c<N;c++)for(let r=0;r<N-2;r++){ const v=board[r][c]; if(v<0)continue; if(board[r+1][c]===v&&board[r+2][c]===v){ m.add(r+','+c); m.add((r+1)+','+c); m.add((r+2)+','+c); } }
      return m; }
    function reset(){ board=Array.from({length:N},()=>Array.from({length:N},()=>rnd()));
      let guard=0; let m=findMatches(); while(m.size&&guard++<300){ for(const k of m){ const [r,c]=k.split(',').map(Number); board[r][c]=rnd(); } m=findMatches(); }
      score=0; movesLeft=START_MOVES; sel=null; over=false; if(overEl)overEl.classList.remove('show'); update(); render(); }
    function resolve(){ let chain=0; while(true){ const m=findMatches(); if(!m.size)break; chain++;
        score+=m.size*10*chain; for(const k of m){ const [r,c]=k.split(',').map(Number); board[r][c]=-1; }
        for(let c=0;c<N;c++){ const col=[]; for(let r=N-1;r>=0;r--)if(board[r][c]>=0)col.push(board[r][c]); let r=N-1; for(const v of col)board[r--][c]=v; while(r>=0)board[r--][c]=rnd(); } }
      update(); }
    function update(){ if(scoreEl)scoreEl.textContent=score; if(movesEl)movesEl.textContent=movesLeft; if(score>best())localStorage.setItem('pwGemsBest',String(score)); showBest(); }
    function render(){ gridEl.innerHTML=''; for(let r=0;r<N;r++)for(let c=0;c<N;c++){ const cell=document.createElement('div'); cell.className='gem-cell';
        const g=document.createElement('div'); g.className='gem'+(sel&&sel[0]===r&&sel[1]===c?' sel':''); g.style.background=COLORS[board[r][c]]||'transparent';
        g.addEventListener('click',()=>click(r,c)); cell.appendChild(g); gridEl.appendChild(cell); } }
    function adjacent(a,b){ return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])===1; }
    function swap(a,b){ const t=board[a[0]][a[1]]; board[a[0]][a[1]]=board[b[0]][b[1]]; board[b[0]][b[1]]=t; }
    function click(r,c){ if(over)return; if(!sel){ sel=[r,c]; render(); return; }
      if(sel[0]===r&&sel[1]===c){ sel=null; render(); return; }
      if(!adjacent(sel,[r,c])){ sel=[r,c]; render(); return; }
      const a=sel, b=[r,c]; swap(a,b); if(!findMatches().size){ swap(a,b); sel=null; render(); return; }
      sel=null; movesLeft--; resolve(); render();
      if(movesLeft<=0){ over=true; if(resEl)resEl.textContent='Score '+score; if(overEl)overEl.classList.add('show'); } }
    if(againBtn)againBtn.addEventListener('click',reset);
    if(newBtn)newBtn.addEventListener('click',reset);
    window.__gems={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){} };
  })();

  /* ===== HANGMAN (word guess, click-driven) ===== */
  (function(){
    const wordEl=document.getElementById('hangWord'), keysEl=document.getElementById('hangKeys'),
          lifeEl=document.getElementById('hangLives'), msgEl=document.getElementById('hangMsg'),
          overEl=document.getElementById('hangOver'), resEl=document.getElementById('hangResult'),
          againBtn=document.getElementById('hangAgain'), newBtn=document.getElementById('hangNew'),
          streakEl=document.getElementById('hangStreak'), bestEl=document.getElementById('hangBest');
    if(!wordEl)return;
    const WORDS=['ARCADE','CAROLINA','UNDERWRITER','LOGGING','FORESTRY','TRUCKING','PORTFOLIO','JAVASCRIPT','DEVELOPER','INSURANCE','PADDINGTON','BUILDER','SUMMIT','CARGO','POLICY','BROKER','PREMIUM','CLAIMS','WEBSITE','DESIGN','CONSOLE','RETRO','PIXEL','JOYSTICK','SANDLOT','VERCEL','TYPEFACE'];
    const MAX=6;
    let word, guessed, wrong, streak, over;
    function best(){ return parseInt(localStorage.getItem('pwHangmanBest')||'0',10); }
    function showBest(){ if(bestEl)bestEl.textContent=best(); }
    function reset(){
      word=WORDS[Math.floor(Math.random()*WORDS.length)];
      guessed=new Set(); wrong=0; over=false;
      if(overEl)overEl.classList.remove('show'); if(msgEl)msgEl.textContent='';
      buildKeys(); render(); showBest(); if(streakEl)streakEl.textContent=streak||0;
    }
    function buildKeys(){ keysEl.innerHTML='';
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function(ch){
        const b=document.createElement('button'); b.className='hang-key'; b.textContent=ch;
        b.addEventListener('click',function(){ guess(ch,b); }); keysEl.appendChild(b); });
    }
    function render(){ wordEl.innerHTML='';
      word.split('').forEach(function(ch){ const s=document.createElement('div'); s.className='hang-slot'; s.textContent=guessed.has(ch)?ch:''; wordEl.appendChild(s); });
      if(lifeEl){ lifeEl.innerHTML=''; for(var i=0;i<MAX;i++){ const d=document.createElement('div'); d.className='hang-life'+(i<wrong?' lost':''); lifeEl.appendChild(d); } }
    }
    function guess(ch,btn){ if(over||guessed.has(ch))return; guessed.add(ch);
      if(word.indexOf(ch)>=0){ btn.classList.add('good'); btn.disabled=true; render();
        if(word.split('').every(function(c){return guessed.has(c);})) win();
      } else { btn.classList.add('bad'); btn.disabled=true; wrong++; render(); if(wrong>=MAX) lose(); }
    }
    function win(){ over=true; streak=(streak||0)+1; if(streak>best())localStorage.setItem('pwHangmanBest',String(streak));
      if(streakEl)streakEl.textContent=streak; showBest();
      if(resEl)resEl.textContent='Solved!'; if(overEl)overEl.classList.add('show'); disableKeys(); }
    function lose(){ over=true; streak=0; if(streakEl)streakEl.textContent=0;
      if(resEl)resEl.textContent=word; word.split('').forEach(function(ch,i){ wordEl.children[i].textContent=ch; });
      if(overEl)overEl.classList.add('show'); disableKeys(); }
    function disableKeys(){ [].forEach.call(keysEl.children,function(b){b.disabled=true;}); }
    if(againBtn)againBtn.addEventListener('click',reset);
    if(newBtn)newBtn.addEventListener('click',reset);
    window.__hangman={ ready:false, init(){ if(this.ready)return; this.ready=true; streak=0; reset(); }, stop(){} };
  })();

  /* ===== LIGHTS OUT (toggle puzzle, click-driven) ===== */
  (function(){
    const gridEl=document.getElementById('lightsGrid'), movesEl=document.getElementById('lightsMoves'), bestEl=document.getElementById('lightsBest'),
          overEl=document.getElementById('lightsOver'), resEl=document.getElementById('lightsResult'),
          againBtn=document.getElementById('lightsAgain'), newBtn=document.getElementById('lightsNew');
    if(!gridEl)return;
    const N=5;
    let grid, moves, over;
    function best(){ return parseInt(localStorage.getItem('pwLightsBest')||'0',10); }
    function showBest(){ if(bestEl)bestEl.textContent=best()||''; }
    function toggle(r,c){ if(r<0||c<0||r>=N||c>=N)return; grid[r][c]=!grid[r][c]; }
    function press(r,c){ toggle(r,c); toggle(r-1,c); toggle(r+1,c); toggle(r,c-1); toggle(r,c+1); }
    function solved(){ return grid.every(function(row){return row.every(function(v){return !v;});}); }
    function reset(){
      grid=Array.from({length:N},function(){return Array.from({length:N},function(){return false;});});
      var n=8+Math.floor(Math.random()*8);
      for(var i=0;i<n;i++){ press(Math.floor(Math.random()*N),Math.floor(Math.random()*N)); }
      if(solved()) press(0,0);
      moves=0; over=false; if(overEl)overEl.classList.remove('show'); render(); update();
    }
    function update(){ if(movesEl)movesEl.textContent=moves; showBest(); }
    function render(){ gridEl.innerHTML='';
      for(var r=0;r<N;r++)for(var c=0;c<N;c++){ (function(r,c){
        const cell=document.createElement('div'); cell.className='lo-cell'+(grid[r][c]?' on':'');
        cell.addEventListener('click',function(){ click(r,c); }); gridEl.appendChild(cell);
      })(r,c); }
    }
    function click(r,c){ if(over)return; press(r,c); moves++; render(); update();
      if(solved()){ over=true; var b=best(); if(!b||moves<b)localStorage.setItem('pwLightsBest',String(moves));
        showBest(); if(resEl)resEl.textContent=moves+' moves'; if(overEl)overEl.classList.add('show'); } }
    if(againBtn)againBtn.addEventListener('click',reset);
    if(newBtn)newBtn.addEventListener('click',reset);
    window.__lights={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){} };
  })();

  /* ===== DICE POKER (Yahtzee-lite, click-driven) ===== */
  (function(){
    const rowEl=document.getElementById('diceRow'), rollBtn=document.getElementById('diceRoll'), scoreBtn=document.getElementById('diceScore'),
          roundEl=document.getElementById('diceRound'), rollsEl=document.getElementById('diceRolls'), totalEl=document.getElementById('diceTotal'),
          bestEl=document.getElementById('diceBest'), msgEl=document.getElementById('diceMsg'),
          overEl=document.getElementById('diceOver'), resEl=document.getElementById('diceResult'), againBtn=document.getElementById('diceAgain');
    if(!rowEl)return;
    const ROUNDS=6, MAXROLLS=3;
    const PIPS={1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};
    const NAMES={five:'Five of a kind',four:'Four of a kind',full:'Full house',lgstraight:'Large straight',smstraight:'Small straight',three:'Three of a kind',twopair:'Two pair',pair:'Pair',high:'High dice'};
    let dice, held, rollsLeft, round, total, over, rolledThisRound;
    function best(){ return parseInt(localStorage.getItem('pwDiceBest')||'0',10); }
    function showBest(){ if(bestEl)bestEl.textContent=best(); }
    function reset(){ dice=[1,2,3,4,5]; held=[false,false,false,false,false];
      rollsLeft=MAXROLLS; round=1; total=0; over=false; rolledThisRound=false;
      if(overEl)overEl.classList.remove('show'); if(msgEl)msgEl.textContent='Roll to start';
      render(); updateHud(); setBtns(); }
    function render(){ rowEl.innerHTML='';
      dice.forEach(function(v,i){ (function(v,i){
        const d=document.createElement('div'); d.className='die'+(held[i]?' held':'');
        for(var p=1;p<=9;p++){ if(PIPS[v].indexOf(p)>=0){ const pip=document.createElement('span'); pip.className='pip';
          pip.style.gridRow=Math.ceil(p/3); pip.style.gridColumn=((p-1)%3)+1; d.appendChild(pip); } }
        d.addEventListener('click',function(){ if(over||!rolledThisRound)return; held[i]=!held[i]; render(); });
        rowEl.appendChild(d);
      })(v,i); });
    }
    function updateHud(){ if(roundEl)roundEl.textContent=round; if(rollsEl)rollsEl.textContent=rollsLeft; if(totalEl)totalEl.textContent=total;
      if(total>best())localStorage.setItem('pwDiceBest',String(total)); showBest(); }
    function setBtns(){ if(rollBtn)rollBtn.disabled=over||rollsLeft<=0; if(scoreBtn)scoreBtn.disabled=over||!rolledThisRound; }
    function counts(d){ var c={}; d.forEach(function(v){c[v]=(c[v]||0)+1;}); return c; }
    function scoreHand(d){ var c=counts(d); var vals=Object.keys(c).map(function(k){return c[k];}).sort(function(a,b){return b-a;});
      var sum=d.reduce(function(a,b){return a+b;},0);
      if(vals[0]===5)return {pts:50,name:'five'};
      if(vals[0]===4)return {pts:40,name:'four'};
      if(vals[0]===3&&vals[1]===2)return {pts:30,name:'full'};
      var u=Object.keys(c).map(Number).sort(function(a,b){return a-b;}).join('');
      if(u==='12345'||u==='23456')return {pts:35,name:'lgstraight'};
      if(['1234','2345','3456'].some(function(s){return u.indexOf(s)>=0;}))return {pts:20,name:'smstraight'};
      if(vals[0]===3)return {pts:20,name:'three'};
      if(vals[0]===2&&vals[1]===2)return {pts:15,name:'twopair'};
      if(vals[0]===2)return {pts:Math.max(5,sum-10),name:'pair'};
      return {pts:Math.max(2,sum-15),name:'high'};
    }
    function roll(){ if(over||rollsLeft<=0)return;
      for(var i=0;i<5;i++){ if(!held[i])dice[i]=1+Math.floor(Math.random()*6); }
      rollsLeft--; rolledThisRound=true; render(); updateHud(); setBtns();
      if(msgEl)msgEl.textContent='Hold dice, roll again or score · '+NAMES[scoreHand(dice).name]; }
    function score(){ if(over||!rolledThisRound)return;
      var h=scoreHand(dice); total+=h.pts; if(msgEl)msgEl.textContent=NAMES[h.name]+' +'+h.pts;
      round++; held=[false,false,false,false,false]; rollsLeft=MAXROLLS; rolledThisRound=false;
      updateHud(); render(); setBtns();
      if(round>ROUNDS){ over=true; if(resEl)resEl.textContent=total+' pts'; if(overEl)overEl.classList.add('show'); setBtns(); } }
    if(rollBtn)rollBtn.addEventListener('click',roll);
    if(scoreBtn)scoreBtn.addEventListener('click',score);
    if(againBtn)againBtn.addEventListener('click',reset);
    window.__dice={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){} };
  })();

  /* === Battleship (vs CPU) === */
  (function(){
    const N=8, SHIPS=[4,3,3,2,2], TOTAL=SHIPS.reduce((a,b)=>a+b,0);
    const enemyGrid=document.getElementById('bsEnemyGrid'), playerGrid=document.getElementById('bsPlayerGrid');
    const msgEl=document.getElementById('bsMsg'), eHitsEl=document.getElementById('bsEnemyHits'), pHitsEl=document.getElementById('bsPlayerHits');
    const bestEl=document.getElementById('bsBest'), overEl=document.getElementById('bsOver'), resEl=document.getElementById('bsResult');
    const againBtn=document.getElementById('bsAgain'), newBtn=document.getElementById('bsNew');
    let enemy, player, enemyHit, playerHit, shots, cpuQueue, over;
    let best=parseInt(localStorage.getItem('pwBattleshipBest')||'0',10)||0;
    function blank(){ return Array.from({length:N},()=>new Array(N).fill(0)); }
    function place(){ const g=blank(); for(const len of SHIPS){ let ok=false; while(!ok){ const horiz=Math.random()<0.5; const r=Math.floor(Math.random()*(horiz?N:N-len+1)); const c=Math.floor(Math.random()*(horiz?N-len+1:N)); let free=true; for(let i=0;i<len;i++){ const rr=horiz?r:r+i, cc=horiz?c+i:c; if(g[rr][cc]){free=false;break;} } if(free){ for(let i=0;i<len;i++){ const rr=horiz?r:r+i, cc=horiz?c+i:c; g[rr][cc]=1; } ok=true; } } } return g; }
    function build(){
      enemy=place(); player=place(); enemyHit=blank(); playerHit=blank();
      shots=0; cpuQueue=[]; over=false;
      if(bestEl)bestEl.textContent=best>0?best:'';
      renderEnemy(); renderPlayer(); updateHud();
      if(msgEl)msgEl.textContent='Fire on enemy waters';
      if(overEl)overEl.classList.remove('show');
    }
    function renderEnemy(){ if(!enemyGrid)return; enemyGrid.innerHTML=''; for(let r=0;r<N;r++)for(let c=0;c<N;c++){ const cell=document.createElement('div'); cell.className='bs-cell'; if(enemyHit[r][c]===1)cell.classList.add('hit'); else if(enemyHit[r][c]===2)cell.classList.add('miss'); cell.dataset.r=r; cell.dataset.c=c; cell.addEventListener('click',()=>fire(r,c)); enemyGrid.appendChild(cell); } }
    function renderPlayer(){ if(!playerGrid)return; playerGrid.innerHTML=''; for(let r=0;r<N;r++)for(let c=0;c<N;c++){ const cell=document.createElement('div'); cell.className='bs-cell'; if(playerHit[r][c]===1)cell.classList.add('hit'); else if(playerHit[r][c]===2)cell.classList.add('miss'); else if(player[r][c])cell.classList.add('ship'); playerGrid.appendChild(cell); } }
    function updateHud(){ if(eHitsEl)eHitsEl.textContent=count(enemyHit); if(pHitsEl)pHitsEl.textContent=count(playerHit); }
    function count(h){ let n=0; for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(h[r][c]===1)n++; return n; }
    function fire(r,c){ if(over||enemyHit[r][c])return; shots++; enemyHit[r][c]=enemy[r][c]?1:2; if(msgEl)msgEl.textContent=enemy[r][c]?'Hit!':'Miss'; renderEnemy(); updateHud();
      if(count(enemyHit)>=TOTAL){ win(); return; }
      cpuFire();
    }
    function cpuFire(){ let r,c;
      if(cpuQueue.length){ [r,c]=cpuQueue.shift(); if(playerHit[r][c]){ if(cpuQueue.length)return cpuFire(); } }
      if(r===undefined){ do{ r=Math.floor(Math.random()*N); c=Math.floor(Math.random()*N); }while(playerHit[r][c]); }
      playerHit[r][c]=player[r][c]?1:2;
      if(player[r][c]){ [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([rr,cc])=>{ if(rr>=0&&rr<N&&cc>=0&&cc<N&&!playerHit[rr][cc])cpuQueue.push([rr,cc]); }); }
      renderPlayer(); updateHud();
      if(count(playerHit)>=TOTAL)lose();
    }
    function win(){ over=true; if(best===0||shots<best){ best=shots; localStorage.setItem('pwBattleshipBest',best); if(bestEl)bestEl.textContent=best; } if(resEl)resEl.textContent='Victory · '+shots+' shots'; if(overEl)overEl.classList.add('show'); }
    function lose(){ over=true; if(resEl)resEl.textContent='Fleet sunk'; if(overEl)overEl.classList.add('show'); }
    if(againBtn)againBtn.addEventListener('click',build);
    if(newBtn)newBtn.addEventListener('click',build);
    window.__battleship={ ready:false, init(){ if(this.ready)return; this.ready=true; build(); }, stop(){} };
  })();

  /* === Whack-a-Mole === */
  (function(){
    const N=9;
    const grid=document.getElementById('moleGrid'), scoreEl=document.getElementById('moleScore'), timeEl=document.getElementById('moleTime');
    const bestEl=document.getElementById('moleBest'), msgEl=document.getElementById('moleMsg'), startBtn=document.getElementById('moleStart');
    const overEl=document.getElementById('moleOver'), resEl=document.getElementById('moleResult'), againBtn=document.getElementById('moleAgain');
    let score, time, active, running, spawnTimer, clockTimer;
    let best=parseInt(localStorage.getItem('pwMoleBest')||'0',10)||0;
    function buildGrid(){ if(!grid)return; grid.innerHTML=''; for(let i=0;i<N;i++){ const hole=document.createElement('div'); hole.className='mole-hole'; const mole=document.createElement('div'); mole.className='mole-mole'; hole.appendChild(mole); hole.dataset.i=i; hole.addEventListener('click',()=>whack(i)); grid.appendChild(hole); } }
    function reset(){ clearTimers(); score=0; time=30; active=-1; running=false; buildGrid(); if(scoreEl)scoreEl.textContent='0'; if(timeEl)timeEl.textContent='30'; if(bestEl)bestEl.textContent=best; if(msgEl)msgEl.textContent='Press start, then whack the moles'; if(overEl)overEl.classList.remove('show'); }
    function clearTimers(){ if(spawnTimer)clearInterval(spawnTimer); if(clockTimer)clearInterval(clockTimer); spawnTimer=null; clockTimer=null; }
    function start(){ if(running)return; reset(); running=true; if(msgEl)msgEl.textContent='Whack!'; spawn();
      spawnTimer=setInterval(spawn,800);
      clockTimer=setInterval(()=>{ time--; if(timeEl)timeEl.textContent=time; if(time<=0)end(); },1000); }
    function spawn(){ const holes=grid?grid.children:[]; if(active>=0&&holes[active])holes[active].classList.remove('up'); let i; do{ i=Math.floor(Math.random()*N); }while(i===active); active=i; if(holes[i])holes[i].classList.add('up'); }
    function whack(i){ if(!running||i!==active)return; const holes=grid.children; if(holes[i])holes[i].classList.remove('up'); active=-1; score++; if(scoreEl)scoreEl.textContent=score; }
    function end(){ clearTimers(); running=false; const holes=grid?grid.children:[]; if(active>=0&&holes[active])holes[active].classList.remove('up'); active=-1; if(score>best){ best=score; localStorage.setItem('pwMoleBest',best); if(bestEl)bestEl.textContent=best; } if(resEl)resEl.textContent=score+' hits'; if(overEl)overEl.classList.add('show'); }
    if(startBtn)startBtn.addEventListener('click',start);
    if(againBtn)againBtn.addEventListener('click',start);
    window.__mole={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){ clearTimers(); running=false; } };
  })();

  /* === Tower of Hanoi === */
  (function(){
    const NUM=4, OPT=(1<<NUM)-1;
    const board=document.getElementById('hanoiBoard'), movesEl=document.getElementById('hanoiMoves'), minEl=document.getElementById('hanoiMin');
    const bestEl=document.getElementById('hanoiBest'), msgEl=document.getElementById('hanoiMsg');
    const overEl=document.getElementById('hanoiOver'), resEl=document.getElementById('hanoiResult'), againBtn=document.getElementById('hanoiAgain'), newBtn=document.getElementById('hanoiNew');
    const COLORS=['#E85D5D','#D4A843','#4FB3A4','#6C8FE8','#9B6CE8'];
    let pegs, moves, sel, over;
    let best=parseInt(localStorage.getItem('pwHanoiBest')||'0',10)||0;
    function reset(){ pegs=[[],[],[]]; for(let d=NUM;d>=1;d--)pegs[0].push(d); moves=0; sel=-1; over=false; if(minEl)minEl.textContent=OPT; if(bestEl)bestEl.textContent=best>0?best:''; if(movesEl)movesEl.textContent='0'; if(msgEl)msgEl.textContent='Move the whole stack to another peg'; if(overEl)overEl.classList.remove('show'); render(); }
    function render(){ if(!board)return; board.innerHTML=''; for(let p=0;p<3;p++){ const peg=document.createElement('div'); peg.className='hanoi-peg'+(sel===p?' sel':''); peg.dataset.p=p; peg.addEventListener('click',()=>click(p)); for(const d of pegs[p]){ const disk=document.createElement('div'); disk.className='hanoi-disk'; disk.style.width=(28+d*26)+'px'; disk.style.background='linear-gradient(180deg,'+COLORS[d-1]+',rgba(0,0,0,.25))'; peg.appendChild(disk); } board.appendChild(peg); } }
    function click(p){ if(over)return; if(sel<0){ if(!pegs[p].length){ if(msgEl)msgEl.textContent='That peg is empty'; return; } sel=p; render(); return; } if(p===sel){ sel=-1; render(); return; } const from=pegs[sel], to=pegs[p]; const disk=from[from.length-1]; if(to.length&&to[to.length-1]<disk){ if(msgEl)msgEl.textContent="Can't stack a bigger disk on a smaller one"; sel=-1; render(); return; } to.push(from.pop()); moves++; if(movesEl)movesEl.textContent=moves; sel=-1; render();
      if(pegs[1].length===NUM||pegs[2].length===NUM)win(); else if(msgEl)msgEl.textContent='Moves: '+moves; }
    function win(){ over=true; if(best===0||moves<best){ best=moves; localStorage.setItem('pwHanoiBest',best); if(bestEl)bestEl.textContent=best; } if(resEl)resEl.textContent=moves+' moves'; if(overEl)overEl.classList.add('show'); }
    if(againBtn)againBtn.addEventListener('click',reset);
    if(newBtn)newBtn.addEventListener('click',reset);
    window.__hanoi={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){} };
  })();

  /* === Minesweeper === */
  (function(){
    const N=9, MINES=10;
    const grid=document.getElementById('msGrid'), minesEl=document.getElementById('mswMines'), flagsEl=document.getElementById('msFlags');
    const bestEl=document.getElementById('msBest'), msgEl=document.getElementById('msMsg');
    const overEl=document.getElementById('msOver'), labelEl=document.getElementById('msOverLabel'), resEl=document.getElementById('msResult');
    const againBtn=document.getElementById('msAgain'), newBtn=document.getElementById('msNew'), flagModeBtn=document.getElementById('msFlagMode');
    let mine, open, flag, count, over, started, t0, placed, flagMode;
    let best=parseInt(localStorage.getItem('pwMinesBest')||'0',10)||0;
    function blank(){ return Array.from({length:N},()=>new Array(N).fill(0)); }
    function reset(){ mine=blank(); open=blank(); flag=blank(); count=blank(); over=false; started=false; placed=false; flagMode=false;
      if(minesEl)minesEl.textContent=MINES; if(flagsEl)flagsEl.textContent='0'; if(bestEl)bestEl.textContent=best>0?best+'s':'';
      if(flagModeBtn)flagModeBtn.textContent='Flag: off'; if(msgEl)msgEl.textContent='Click to reveal · use Flag toggle to mark';
      if(overEl)overEl.classList.remove('show'); render(); }
    function placeMines(sr,sc){ let n=0; while(n<MINES){ const r=Math.floor(Math.random()*N), c=Math.floor(Math.random()*N); if(mine[r][c]||(Math.abs(r-sr)<=1&&Math.abs(c-sc)<=1))continue; mine[r][c]=1; n++; }
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){ if(mine[r][c]){count[r][c]=-1;continue;} let k=0; nbrs(r,c).forEach(([rr,cc])=>{ if(mine[rr][cc])k++; }); count[r][c]=k; } placed=true; }
    function nbrs(r,c){ const o=[]; for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){ if(!dr&&!dc)continue; const rr=r+dr,cc=c+dc; if(rr>=0&&rr<N&&cc>=0&&cc<N)o.push([rr,cc]); } return o; }
    function reveal(r,c){ if(open[r][c]||flag[r][c])return; open[r][c]=1; if(count[r][c]===0){ nbrs(r,c).forEach(([rr,cc])=>reveal(rr,cc)); } }
    function click(r,c){ if(over)return; if(flagMode){ toggleFlag(r,c); return; } if(flag[r][c])return;
      if(!placed){ placeMines(r,c); started=true; t0=Date.now(); }
      if(mine[r][c]){ over=true; for(let rr=0;rr<N;rr++)for(let cc=0;cc<N;cc++)if(mine[rr][cc])open[rr][cc]=1; render(); if(labelEl)labelEl.textContent='Boom'; if(resEl)resEl.textContent='Hit a mine'; if(overEl)overEl.classList.add('show'); return; }
      reveal(r,c); render(); checkWin(); }
    function toggleFlag(r,c){ if(open[r][c])return; flag[r][c]=flag[r][c]?0:1; let f=0; for(let rr=0;rr<N;rr++)for(let cc=0;cc<N;cc++)if(flag[rr][cc])f++; if(flagsEl)flagsEl.textContent=f; render(); }
    function checkWin(){ let closed=0; for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!open[r][c])closed++; if(closed===MINES){ over=true; const secs=Math.round((Date.now()-t0)/1000); if(best===0||secs<best){ best=secs; localStorage.setItem('pwMinesBest',best); if(bestEl)bestEl.textContent=best+'s'; } if(labelEl)labelEl.textContent='Cleared'; if(resEl)resEl.textContent='Swept in '+secs+'s'; if(overEl)overEl.classList.add('show'); } }
    function render(){ if(!grid)return; grid.style.gridTemplateColumns='repeat('+N+',30px)'; grid.innerHTML=''; for(let r=0;r<N;r++)for(let c=0;c<N;c++){ const cell=document.createElement('div'); cell.className='ms-cell'; if(open[r][c]){ cell.classList.add('open'); if(mine[r][c]){ cell.classList.add('mine'); cell.textContent='✶'; } else if(count[r][c]>0){ cell.classList.add('n'+count[r][c]); cell.textContent=count[r][c]; } } else if(flag[r][c]){ cell.classList.add('flag'); cell.textContent='⚑'; } cell.dataset.r=r; cell.dataset.c=c; cell.addEventListener('click',()=>click(r,c)); cell.addEventListener('contextmenu',(e)=>{ e.preventDefault(); toggleFlag(r,c); }); grid.appendChild(cell); } }
    if(flagModeBtn)flagModeBtn.addEventListener('click',()=>{ flagMode=!flagMode; flagModeBtn.textContent='Flag: '+(flagMode?'on':'off'); });
    if(againBtn)againBtn.addEventListener('click',reset);
    if(newBtn)newBtn.addEventListener('click',reset);
    window.__minesweeper={ ready:false, init(){ if(this.ready)return; this.ready=true; reset(); }, stop(){} };
  })();

  /* === GAME POLISH: pause + new-high celebration =========================
     Lightweight wiring on top of the existing game loops. Doesn't touch their
     internals - just observes score elements and binds a global pause toggle.
  ========================================================================= */
  (function gamePolishLayer() {
    // 1) New-high celebration flash
    const HIGH_TARGETS = ['highDisp', 'wStreak', 'tLines', 'tLevel', 'dinoBest', 'flBest', 'bkBest', 'tfBest'];
    HIGH_TARGETS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      let prev = el.textContent.trim();
      const mo = new MutationObserver(() => {
        const next = el.textContent.trim();
        if (next === prev) return;
        const np = parseInt(next, 10), pp = parseInt(prev, 10);
        if (!isNaN(np) && !isNaN(pp) && np > pp && np > 0) {
          el.classList.remove('new-high-flash');
          void el.offsetWidth;
          el.classList.add('new-high-flash');
          // Also spark the active game container
          const host = el.closest('.apanel') || el.closest('.game-container');
          if (host) {
            host.classList.remove('game-celebrate');
            void host.offsetWidth;
            host.classList.add('game-celebrate');
            setTimeout(() => host.classList.remove('game-celebrate'), 1600);
          }
        }
        prev = next;
      });
      mo.observe(el, { childList: true, characterData: true, subtree: true });
    });

    // 2) Pause toggle: only fires when an arcade panel is visible
    let paused = false;
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'p' && e.key !== 'P') return;
      const arcade = document.getElementById('arcade');
      if (!arcade) return;
      const r = arcade.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      paused = !paused;
      document.body.classList.toggle('arcade-paused', paused);
      // Visual overlay
      let pauseEl = document.getElementById('arcadePauseOverlay');
      if (!pauseEl) {
        pauseEl = document.createElement('div');
        pauseEl.id = 'arcadePauseOverlay';
        pauseEl.className = 'arcade-pause-overlay';
        pauseEl.innerHTML = '<div class="apo-inner"><div class="apo-icon">⏸</div><div class="apo-title">Paused</div><div class="apo-sub">Press P to resume</div></div>';
        document.body.appendChild(pauseEl);
      }
      pauseEl.classList.toggle('show', paused);
    });
  })();

  // Initial dino scene render (so the panel isn't empty before clicking Start)
  if (dinoCtx && dinoCanvas) {
    drawDinoScene();
    drawDino();
    dinoCtx.fillStyle = 'rgba(10,10,10,0.7)';
    dinoCtx.font = '600 14px "JetBrains Mono", monospace';
    dinoCtx.textAlign = 'center';
    dinoCtx.fillText('PRESS START · SPACE = JUMP · ↓ = DUCK', dinoCanvas.width/2, 24);
  }

  /* === SECTION SPOTLIGHT (cursor-tracked radial gradient on dark sections) === */
  if (!window.matchMedia('(hover: none)').matches && !window.matchMedia('(pointer: coarse)').matches) {
    document.querySelectorAll('.spotlight-host').forEach(host => {
      host.addEventListener('mousemove', (e) => {
        const r = host.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%';
        const my = ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
        host.style.setProperty('--mx', mx);
        host.style.setProperty('--my', my);
      });
    });
  }

  /* === SCROLL RING PROGRESS + BACK TO TOP + SECTION RAIL === */
  const scrollRing = document.getElementById('scrollRing');
  const ringProgress = document.getElementById('ringProgress');
  const ringCirc = 2 * Math.PI * 21;
  const sectionRail = document.getElementById('sectionRail');
  const railButtons = sectionRail ? sectionRail.querySelectorAll('button') : [];

  if (sectionRail) {
    railButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.rail);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  if (scrollRing && ringProgress) {
    const sections = ['top','about','career','expertise','work','websites','apps','credentials','arcade','contact'].map(id => document.getElementById(id)).filter(Boolean);
    const handleScroll = () => {
      const st = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      const prog = dh > 0 ? st / dh : 0;
      ringProgress.style.strokeDashoffset = (ringCirc * (1 - prog)).toFixed(2);
      scrollRing.classList.toggle('show', st > 400);
      if (sectionRail) sectionRail.classList.toggle('show', st > 300);

      // Active section
      const viewportMid = st + window.innerHeight * 0.4;
      let activeId = sections[0]?.id;
      for (const s of sections) {
        if (s.offsetTop <= viewportMid) activeId = s.id;
      }
      railButtons.forEach(b => b.classList.toggle('is-active', b.dataset.rail === activeId));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* === COUNT-UP ANIMATION on stats === */
  const countUpIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.parentElement.dataset.count, 10);
      if (isNaN(target)) return;
      const dur = 1200;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
      countUpIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.count-target').forEach(el => countUpIO.observe(el));

  /* === EPIC HERO parallax === */
  const heroPhoto = document.querySelector('.hero-parallax-photo');
  const heroAuroras = document.querySelectorAll('#top .aurora');
  if (!window.matchMedia('(pointer: coarse)').matches) {
    document.addEventListener('mousemove', (e) => {
      if (!heroPhoto) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      heroPhoto.style.transform = `translate(${x*0.4}px, ${y*0.4}px)`;
      heroAuroras.forEach((a, i) => {
        a.style.transform = `translate(${x * (i === 0 ? -0.8 : 0.8)}px, ${y * (i === 0 ? -0.6 : 0.6)}px)`;
      });
    }, { passive: true });
  }
  // Scroll-driven parallax for hero photo
  window.addEventListener('scroll', () => {
    if (!heroPhoto) return;
    const y = Math.min(window.scrollY, 600);
    heroPhoto.style.setProperty('--scrollY', y + 'px');
  }, { passive: true });

  /* === MAGNETIC HOVER on primary CTAs === */
  if (!window.matchMedia('(pointer: coarse)').matches) {
    document.querySelectorAll('.btn-ink, .btn-gold').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.18;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* === SPLIT-TEXT reveal on display headlines === */
  // Intentionally exclude .hero-title - we render it with clean .hero-line blocks
  const splitTargets = document.querySelectorAll('.display-h');
  splitTargets.forEach(h => {
    if (h.dataset.split) return;
    h.dataset.split = '1';
    // Wrap each word in a span
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n; while (n = walker.nextNode()) nodes.push(n);
    nodes.forEach(tn => {
      const words = tn.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(w => {
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
        const wrap = document.createElement('span');
        wrap.className = 'split-word';
        const inner = document.createElement('span');
        inner.textContent = w;
        wrap.appendChild(inner);
        frag.appendChild(wrap);
      });
      tn.parentNode.replaceChild(frag, tn);
    });
  });

  const splitIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const words = e.target.querySelectorAll('.split-word');
      words.forEach((w, idx) => {
        const inner = w.querySelector('span');
        if (inner) inner.style.transitionDelay = (idx * 0.06) + 's';
        setTimeout(() => w.classList.add('go'), 30);
      });
      splitIO.unobserve(e.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
  splitTargets.forEach(h => splitIO.observe(h));

  /* === BRAND CELEBRATION CONFETTI (ox + gold; reduced-motion-safe) ===
     Restrained burst - Carolina Executive = restraint. Skipped entirely when the
     visitor prefers reduced motion. Self-cleans after the longest particle lands. */
  function celebrate(originEl) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const COLORS = ['#8B1A1A', '#D4A843', '#E8C77D', '#6B1111', '#F5F2EC'];
    const layer = document.createElement('div');
    layer.className = 'confetti-layer';
    layer.setAttribute('aria-hidden', 'true');
    // launch from the element's horizontal center if given, else screen center
    let cx = 50;
    if (originEl && originEl.getBoundingClientRect) {
      const r = originEl.getBoundingClientRect();
      cx = ((r.left + r.width / 2) / window.innerWidth) * 100;
    }
    const N = window.innerWidth < 640 ? 36 : 56;
    for (let i = 0; i < N; i++) {
      const bit = document.createElement('span');
      bit.className = 'confetti-bit';
      const spreadFromCenter = (Math.random() - 0.5) * 60;        // start near the origin column
      bit.style.left = Math.max(0, Math.min(100, cx + spreadFromCenter)) + 'vw';
      bit.style.background = COLORS[i % COLORS.length];
      bit.style.setProperty('--cf-x', ((Math.random() - 0.5) * 280).toFixed(0) + 'px');
      bit.style.setProperty('--cf-rot', (360 + Math.random() * 540).toFixed(0) + 'deg');
      bit.style.setProperty('--cf-dur', (2 + Math.random() * 1.4).toFixed(2) + 's');
      bit.style.setProperty('--cf-delay', (Math.random() * 0.25).toFixed(2) + 's');
      if (Math.random() < 0.4) bit.style.borderRadius = '50%';     // mix circles + rectangles
      if (Math.random() < 0.3) { bit.style.width = '6px'; bit.style.height = '6px'; }
      layer.appendChild(bit);
    }
    document.body.appendChild(layer);
    setTimeout(() => { if (layer.parentNode) layer.parentNode.removeChild(layer); }, 4200);
  }
  window.celebrate = celebrate;

  /* === CONTACT FORM - full 4-state (idle / loading / error / success) ===
 - inline validation (validate-on-blur, per-field error text, focus-first-error)
 - loading spinner on submit
 - success card replaces the form + brand confetti
 - explicit error banner with mailto fallback on non-200 / network failure */
  const form = document.getElementById('contactForm');
  if (form) {
    const fName = document.getElementById('fName');
    const fEmail = document.getElementById('fEmail');
    const fMsg = document.getElementById('fMessage');
    const fSubject = document.getElementById('fSubject');
    const btn = document.getElementById('formSubmit');
    const errBanner = document.getElementById('contactError');
    const successCard = document.getElementById('contactSuccess');
    const sendAnother = document.getElementById('contactSendAnother');
    const idleBtnHTML = btn ? btn.innerHTML : 'Send message';

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const RULES = {
      fName:  { el: fName,  msg: 'Your name, please.',        ok: (v) => v.trim().length >= 2 },
      fEmail: { el: fEmail, msg: 'A valid email so I can reply.', ok: (v) => isEmail(v.trim()) },
      fMessage: { el: fMsg, msg: 'Add a short message.',      ok: (v) => v.trim().length >= 2 }
    };
    function setFieldError(key, show) {
      const r = RULES[key]; if (!r || !r.el) return;
      const errEl = document.getElementById('err' + key.slice(1)); // fName -> errName
      r.el.classList.toggle('is-invalid', show);
      r.el.setAttribute('aria-invalid', show ? 'true' : 'false');
      if (errEl) { errEl.textContent = show ? r.msg : ''; errEl.classList.toggle('show', show); }
    }
    function validateField(key) { const r = RULES[key]; const valid = r.ok(r.el.value); setFieldError(key, !valid); return valid; }
    function updateSubmitState() {
      const allValid = Object.keys(RULES).every((k) => RULES[k].ok(RULES[k].el.value));
      if (btn) btn.disabled = !allValid;
    }
    // validate-on-blur; clear error + re-evaluate submit as they type
    Object.keys(RULES).forEach((key) => {
      const el = RULES[key].el; if (!el) return;
      el.addEventListener('blur', () => validateField(key));
      el.addEventListener('input', () => { if (el.classList.contains('is-invalid')) validateField(key); updateSubmitState(); if (errBanner) errBanner.classList.remove('show'); });
    });
    updateSubmitState();

    if (sendAnother && successCard) {
      sendAnother.addEventListener('click', () => {
        successCard.classList.remove('show', 'pop');
        form.style.display = '';
        form.reset();
        Object.keys(RULES).forEach((k) => setFieldError(k, false));
        updateSubmitState();
        if (fName) fName.focus();
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errBanner) errBanner.classList.remove('show');

      // focus-first-error
      let firstInvalid = null;
      Object.keys(RULES).forEach((key) => { const valid = validateField(key); if (!valid && !firstInvalid) firstInvalid = RULES[key].el; });
      if (firstInvalid) { firstInvalid.focus(); return; }

      const n = fName.value.trim(), em = fEmail.value.trim();
      const s = fSubject ? fSubject.value.trim() : '', m = fMsg.value.trim();

      if (btn) {
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        btn.innerHTML = '<span class="btn-spin"></span> Sending…';
      }

      const payload = {
        _subject: s || `Portfolio Inquiry from ${n}`,
        _template: 'table', _captcha: 'false',
        Name: n, Email: em, Subject: s || 'Portfolio Inquiry', Message: m
      };

      let ok = false;
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) { const data = await res.json().catch(() => ({})); ok = data.ok === true; }
      } catch (_) { ok = false; }

      if (btn) { btn.removeAttribute('aria-busy'); btn.innerHTML = idleBtnHTML; }

      if (ok) {
        if (typeof window.track === 'function') window.track('Contact: Sent');
        if (successCard) {
          form.style.display = 'none';
          successCard.classList.add('show');
          // spring pop on the checkmark, then confetti
          requestAnimationFrame(() => successCard.classList.add('pop'));
          celebrate(successCard);
        } else if (btn) {
          btn.innerHTML = 'Sent ✓';
          setTimeout(() => { btn.innerHTML = idleBtnHTML; form.reset(); updateSubmitState(); }, 4000);
        }
      } else {
        if (errBanner) errBanner.classList.add('show');
        if (btn) { btn.disabled = false; }
      }
    });
  }

  /* === APP DETAIL MODAL === */
  const appDetailModal = document.getElementById('appDetailModal');
  const appDetailImage = document.getElementById('appDetailImage');
  const appDetailKicker = document.getElementById('appDetailKicker');
  const appDetailTitle = document.getElementById('appDetailTitle');
  const appDetailBody = document.getElementById('appDetailBody');
  const appDetailList = document.getElementById('appDetailList');
  const appDetailPrimary = document.getElementById('appDetailPrimary');
  let appDetailReturnFocus = null;
  const APP_DETAILS = {
    bcg: {
      kicker: 'Bar Crawl Golf · iOS + web',
      title: 'A night out with a scorecard.',
      body: 'Bar Crawl Golf turns a loose night out into a playable round. I designed the painted product world, the live scorecard, browser join flow, shared lobby, route planning, and the handoff between the native app and a link friends can open on any phone.',
      image: 'assets/screenshots/app-bcg-real.webp?v=mp1',
      imageAlt: 'Bar Crawl Golf app screens showing the lobby and live scorecard',
      primary: 'https://barcrawlgolf.xyz',
      primaryLabel: 'Open Bar Crawl Golf',
      points: ['Painted iOS interface with live scorekeeping and haptics', '6-letter codes, shared links, and QR-based browser joining', 'Supabase-backed crawl state, crew status, tournaments, and share cards', 'Responsible-play surfaces including Designated Driver mode and get-home-safe actions']
    },
    dailytool: {
      kicker: 'My Daily Tool · iOS',
      title: 'The day, without the dashboard feeling.',
      body: 'My Daily Tool is a private command center for the small things that make a day work: health, planning, habits, meals, notes, reminders, reports, and a quiet arcade. I built the product system, the local-first data model, native integrations, and the web marketing surface together.',
      image: 'assets/screenshots/app-dt-real.webp?v=mp1',
      imageAlt: 'My Daily Tool app screens showing the home dashboard and daily utilities',
      primary: 'https://mydailytool.app',
      primaryLabel: 'Open My Daily Tool',
      points: ['Local-first Swift and Capacitor surfaces with offline-safe state', 'HealthKit, notifications, calendar, camera, share sheet, and PDF/report flows', 'Optional AI with user-owned providers and no ad-tech dependency', 'A calm web tour with real iPhone screenshots and feature detail dialogs']
    }
  };
  function openAppDetail(key, trigger) {
    const detail = APP_DETAILS[key];
    if (!detail || !appDetailModal) return;
    appDetailReturnFocus = trigger;
    if (appDetailImage) { appDetailImage.src = detail.image; appDetailImage.alt = detail.imageAlt; }
    if (appDetailKicker) appDetailKicker.textContent = detail.kicker;
    if (appDetailTitle) appDetailTitle.textContent = detail.title;
    if (appDetailBody) appDetailBody.textContent = detail.body;
    if (appDetailList) appDetailList.innerHTML = detail.points.map((point) => `<li>${escapeText(point)}</li>`).join('');
    if (appDetailPrimary) { appDetailPrimary.href = detail.primary; appDetailPrimary.textContent = detail.primaryLabel; }
    appDetailModal.hidden = false;
    appDetailModal.classList.add('is-open');
    appDetailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = appDetailModal.querySelector('button, a');
    if (first) first.focus();
  }
  function closeAppDetail() {
    if (!appDetailModal || appDetailModal.hidden) return;
    appDetailModal.classList.remove('is-open');
    appDetailModal.setAttribute('aria-hidden', 'true');
    appDetailModal.hidden = true;
    document.body.style.overflow = '';
    if (appDetailReturnFocus && document.body.contains(appDetailReturnFocus)) appDetailReturnFocus.focus();
    appDetailReturnFocus = null;
  }
  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }
  document.querySelectorAll('[data-open-app-detail]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => { e.preventDefault(); openAppDetail(trigger.dataset.openAppDetail, trigger); });
  });
  document.querySelectorAll('[data-close-app-detail]').forEach((trigger) => trigger.addEventListener('click', closeAppDetail));
  document.addEventListener('keydown', (e) => {
    if (!appDetailModal || appDetailModal.hidden) return;
    if (e.key === 'Escape') { closeAppDetail(); return; }
    if (e.key !== 'Tab') return;
    const items = Array.from(appDetailModal.querySelectorAll('button, a[href]')).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* === LOCAL PAGE PREVIEW MODAL === */
  const pagePreviewModal = document.getElementById('pagePreviewModal');
  const pagePreviewTitle = document.getElementById('pagePreviewTitle');
  const pagePreviewStatus = document.getElementById('pagePreviewStatus');
  const pagePreviewContent = document.getElementById('pagePreviewContent');
  const pagePreviewOpen = document.getElementById('pagePreviewOpen');
  let pagePreviewReturnFocus = null;
  async function openPagePreview(trigger) {
    if (!pagePreviewModal || !pagePreviewContent) return;
    const rawUrl = trigger.dataset.openPagePreview;
    if (!rawUrl) return;
    const resolvedUrl = new URL(rawUrl, window.location.href);
    if (resolvedUrl.origin !== window.location.origin || !/\.html$/i.test(resolvedUrl.pathname)) return;
    pagePreviewReturnFocus = trigger;
    if (pagePreviewTitle) pagePreviewTitle.textContent = trigger.dataset.previewTitle || 'Interactive page preview';
    if (pagePreviewOpen) pagePreviewOpen.href = resolvedUrl.href;
    pagePreviewContent.innerHTML = '';
    if (pagePreviewStatus) pagePreviewStatus.textContent = 'Loading preview…';
    pagePreviewModal.hidden = false;
    pagePreviewModal.classList.add('is-open');
    pagePreviewModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const close = pagePreviewModal.querySelector('[data-close-page-preview]');
    if (close) close.focus();

    try {
      const response = await fetch(resolvedUrl.href, { headers: { Accept: 'text/html' } });
      if (!response.ok) throw new Error(`Preview returned ${response.status}`);
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const root = doc.querySelector('main') || doc.body;
      if (!root) throw new Error('Preview has no page content');
      const fragment = document.createElement('div');
      fragment.innerHTML = root.innerHTML;
      fragment.querySelectorAll('script, style, link, iframe, [data-close-booking], [data-open-booking]').forEach((el) => el.remove());
      fragment.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
      pagePreviewContent.replaceChildren(fragment);
      if (pagePreviewStatus) pagePreviewStatus.textContent = 'Preview loaded · interactions are available on the full page';
    } catch (error) {
      pagePreviewContent.innerHTML = '<p class="page-preview-error">This preview could not load. Open the full page to continue.</p>';
      if (pagePreviewStatus) pagePreviewStatus.textContent = error instanceof Error ? error.message : 'Preview unavailable';
    }
  }
  function closePagePreview() {
    if (!pagePreviewModal || pagePreviewModal.hidden) return;
    pagePreviewModal.classList.remove('is-open');
    pagePreviewModal.setAttribute('aria-hidden', 'true');
    pagePreviewModal.hidden = true;
    if (pagePreviewContent) pagePreviewContent.innerHTML = '';
    document.body.style.overflow = '';
    if (pagePreviewReturnFocus && document.body.contains(pagePreviewReturnFocus)) pagePreviewReturnFocus.focus();
    pagePreviewReturnFocus = null;
  }
  document.querySelectorAll('[data-open-page-preview]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => { event.preventDefault(); void openPagePreview(trigger); });
  });
  document.querySelectorAll('[data-close-page-preview]').forEach((trigger) => trigger.addEventListener('click', closePagePreview));
  document.addEventListener('keydown', (e) => {
    if (!pagePreviewModal || pagePreviewModal.hidden) return;
    if (e.key === 'Escape') { closePagePreview(); return; }
    if (e.key !== 'Tab') return;
    const items = Array.from(pagePreviewModal.querySelectorAll('button, a[href]')).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* === BOOKING MODAL === */
  const bookingModal = document.getElementById('bookingModal');
  const bookingForm = document.getElementById('bookingForm');
  const bookingBody = document.getElementById('bookingBody');
  const bookingSuccess = document.getElementById('bookingSuccess');
  const daysWrap = document.getElementById('bookingDays');
  const timesWrap = document.getElementById('bookingTimes');

  const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

  // Build next 10 weekdays
  function buildDays() {
    if (!daysWrap) return;
    const now = new Date();
    let added = 0, cursor = new Date(now);
    cursor.setHours(0,0,0,0);
    let html = '';
    while (added < 10) {
      cursor.setDate(cursor.getDate() + 1);
      const day = cursor.getDay();
      if (day === 0 || day === 6) continue; // skip weekends
      const iso = cursor.toISOString().slice(0,10);
      const label = `${WEEKDAYS[day]} ${MONTHS[cursor.getMonth()]} ${cursor.getDate()}`;
      html += `<label class="bday"><input type="radio" name="bDay" value="${iso}" data-label="${label}"/><span>${WEEKDAYS[day]}<strong>${cursor.getDate()}</strong>${MONTHS[cursor.getMonth()]}</span></label>`;
      added++;
    }
    daysWrap.innerHTML = html;
  }
  function buildTimes() {
    if (!timesWrap) return;
    timesWrap.innerHTML = TIME_SLOTS.map(t => `<label class="btime"><input type="radio" name="bTime" value="${t}"/><span>${t}</span></label>`).join('');
  }
  buildDays(); buildTimes();

  /* === CAL.COM CONFIGURATION ===
     Change these two lines to point at your Cal.com event type, or to a self-hosted cal.diy instance.
 - username   : your cal.com username (after signup at https://cal.com)
 - eventSlug  : the event type slug (default Cal.com creates "30min" automatically)
 - origin     : 'https://cal.com' for hosted, or your self-hosted URL
  */
  const CAL_CONFIG = {
    username: 'benjamin-sachwitz-zdbpyc',
    eventSlug: '30min',
    origin: 'https://cal.com',
    namespace: 'ben30'
  };
  let calBootstrapped = false;
  function bootstrapCalEmbed() {
    if (calBootstrapped) return;
    calBootstrapped = true;
    // Inline Cal.com loader (official snippet, minified)
    (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");

    try {
      window.Cal('init', CAL_CONFIG.namespace, { origin: CAL_CONFIG.origin });
      window.Cal.ns[CAL_CONFIG.namespace]('inline', {
        elementOrSelector: '#bookingCalInline',
        calLink: `${CAL_CONFIG.username}/${CAL_CONFIG.eventSlug}`,
        config: { layout: 'month_view', theme: 'light' }
      });
      window.Cal.ns[CAL_CONFIG.namespace]('ui', {
        cssVarsPerTheme: {
          light: { '--cal-brand': '#0A0A0A' },
          dark:  { '--cal-brand': '#E8C77D' }
        },
        hideEventTypeDetails: false,
        layout: 'month_view'
      });
      const target = document.getElementById('bookingCalInline');
      if (target) {
        const fallbackHint = document.querySelector('.booking-cal-fallback');
        // Detect when the iframe injects to flip the loading state.
        const obs = new MutationObserver(() => {
          if (target.querySelector('iframe')) {
            target.classList.add('is-loaded');
            sessionStorage.setItem('cal:active', '1');
            // Calendar arrived - retract any "slow to load" nudge; never yank the tab.
            if (fallbackHint) fallbackHint.classList.remove('is-elevated');
            obs.disconnect();
          }
        });
        obs.observe(target, { childList: true, subtree: true });
        // Cal.com embed.js injects its own <h1 data-testid="event-title"> into
        // the parent DOM. Demote it to h2 so the page keeps exactly one h1
        // (the "Book a call." headline) for SEO and accessibility. The embed
        // script can inject the h1 at any point during/after iframe mount, so
        // poll for up to 30s rather than relying on the MutationObserver
        // (which disconnects once the iframe appears).
        const demoteCalH1 = () => {
          document.querySelectorAll('h1[data-testid="event-title"]').forEach(h => {
            const h2 = document.createElement('h2');
            for (const attr of h.attributes) h2.setAttribute(attr.name, attr.value);
            h2.innerHTML = h.innerHTML;
            h.replaceWith(h2);
          });
        };
        demoteCalH1();
        let demoteTicks = 0;
        const demoteInterval = setInterval(() => {
          demoteCalH1();
          if (++demoteTicks >= 60 || document.querySelector('h2[data-testid="event-title"]')) {
            clearInterval(demoteInterval);
          }
        }, 500);
        // The calendar IS claimed and live. If Cal.com's embed script is slow on a
        // cold network, DON'T switch tabs out from under the visitor - just gently
        // elevate the always-present "slow to load? use the form" hint so they can
        // choose. The calendar stays put and finishes loading.
        setTimeout(() => {
          if (!target.classList.contains('is-loaded')) {
            // #4 - record that the Cal embed failed to mount this session so the
            // next openBooking() defaults straight to the working request form
            // instead of re-showing a blank calendar (the '0' branch was dead
            // because nothing ever wrote '0'). If Cal eventually mounts, the
            // observer above overwrites this back to '1'.
            if (sessionStorage.getItem('cal:active') !== '1') sessionStorage.setItem('cal:active', '0');
            if (fallbackHint) fallbackHint.classList.add('is-elevated');
          }
        }, 9000);
      }
    } catch (err) {
      console.warn('[cal] embed failed:', err);
    }
  }

  function setBookingMode(mode) {
    const m = mode === 'form' ? 'form' : 'cal';
    document.querySelectorAll('.bmtab').forEach(t => {
      const active = t.dataset.bmode === m;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-bmode-pane]').forEach(p => {
      const show = p.dataset.bmodePane === m;
      p.setAttribute('aria-hidden', String(!show));
      if (p.tagName === 'FORM') {
        p.hidden = !show;
      } else {
        p.style.display = show ? '' : 'none';
      }
    });
    // Widen the panel for the calendar (Cal's three-column layout needs ≥768px);
    // narrow it back for the form.
    const panel = document.querySelector('.booking-panel');
    if (panel) panel.classList.toggle('is-cal', m === 'cal');
    if (m === 'cal') bootstrapCalEmbed();
  }

  // Wire up tab clicks (including the fallback link inside the cal pane)
  document.querySelectorAll('[data-bmode]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      setBookingMode(b.dataset.bmode);
    });
  });

  // Open modal - opens on the path we know works for the current session.
  const openBooking = () => {
    if (!bookingModal) return;
    bookingModal.classList.add('is-open');
    bookingModal.setAttribute('aria-hidden', 'false');
    bookingBody.classList.remove('hidden');
    bookingSuccess.classList.add('hidden');
    document.body.style.overflow = 'hidden';
    // If we've already confirmed in this session that Cal.com is unclaimed, jump straight
    // to the form so the visitor never sees a blank calendar. If it's known-good, default
    // to Cal. Otherwise try Cal once with the 6s auto-fallback to form.
    const calState = sessionStorage.getItem('cal:active');
    setBookingMode(calState === '0' ? 'form' : 'cal');
    goStep(1);
    setTimeout(() => {
      const first = bookingModal.querySelector('button, input');
      if (first) first.focus();
    }, 300);
  };
  const closeBooking = () => {
    if (!bookingModal) return;
    bookingModal.classList.remove('is-open');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-open-booking]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); openBooking(); }));
  document.querySelectorAll('[data-close-booking]').forEach(b => b.addEventListener('click', closeBooking));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && bookingModal && bookingModal.classList.contains('is-open')) closeBooking(); });

  // Auto-open the scheduler on the dedicated booking page (/booking in production,
  // /booking.html locally) or when any URL carries a #book / #booking hash. Deferred
  // one frame so the page paints behind the modal first.
  (function autoOpenBooking() {
    if (!bookingModal) return;
    const path = (location.pathname || '').toLowerCase();
    const onBookingPage = /\/booking(\.html)?$/.test(path);
    const hashWantsBooking = /^#book(ing)?$/.test((location.hash || '').toLowerCase());
    if (onBookingPage || hashWantsBooking) {
      requestAnimationFrame(() => setTimeout(openBooking, 300));
    }
  })();

  // Step navigation
  function goStep(n) {
    if (!bookingForm) return;
    bookingForm.querySelectorAll('.booking-step').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== String(n)));
    bookingForm.querySelectorAll('.bstep').forEach(s => {
      const step = parseInt(s.dataset.step, 10);
      s.classList.toggle('is-active', step === n);
      s.classList.toggle('is-done', step < n);
    });
  }
  function getValid(step) {
    if (step === 1) {
      const name = document.getElementById('bName').value.trim();
      const email = document.getElementById('bEmail').value.trim();
      const topic = document.getElementById('bTopic')?.value || '';
      if (!name) { flashField('bName'); return false; }
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { flashField('bEmail'); return false; }
      if (!topic) { flash('Please pick a topic'); return false; }
      return true;
    }
    if (step === 2) {
      const day = document.querySelector('input[name="bDay"]:checked');
      const time = document.querySelector('input[name="bTime"]:checked');
      if (!day) { flash('Pick a day'); return false; }
      if (!time) { flash('Pick a time'); return false; }
      return true;
    }
    return true;
  }
  function flashField(id) {
    const f = document.getElementById(id);
    if (!f) return;
    f.style.borderColor = 'var(--ox)';
    f.focus();
    setTimeout(() => f.style.borderColor = '', 1400);
  }
  function flash(msg) {
    let el = document.getElementById('bookingFlash');
    if (!el) {
      el = document.createElement('div');
      el.id = 'bookingFlash';
      el.style.cssText = 'position:absolute;top:1rem;left:50%;transform:translateX(-50%);padding:.5rem 1rem;background:var(--ox);color:var(--bone);border-radius:6px;font-size:12px;font-family:JetBrains Mono,monospace;letter-spacing:.1em;text-transform:uppercase;z-index:3;animation:bflash 2s ease forwards;box-shadow:0 10px 24px rgba(139,26,26,.35);';
      document.querySelector('.booking-panel')?.appendChild(el);
      if (!document.getElementById('bflashKeys')) {
        const style = document.createElement('style');
        style.id = 'bflashKeys';
        style.textContent = '@keyframes bflash{0%{opacity:0;transform:translate(-50%,-10px)}15%,85%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}';
        document.head.appendChild(style);
      }
    }
    el.textContent = msg;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'bflash 2s ease forwards';
  }

  document.querySelectorAll('[data-booking-next]').forEach(b => b.addEventListener('click', () => {
    const cur = parseInt(b.closest('.booking-step').dataset.panel, 10);
    if (!getValid(cur)) return;
    const next = parseInt(b.dataset.bookingNext, 10);
    if (next === 3) fillReview();
    goStep(next);
  }));
  document.querySelectorAll('[data-booking-back]').forEach(b => b.addEventListener('click', () => {
    goStep(parseInt(b.dataset.bookingBack, 10));
  }));

  function fillReview() {
    const get = (id) => document.getElementById(id).value.trim() || '';
    const topic = document.getElementById('bTopic');
    const day = document.querySelector('input[name="bDay"]:checked');
    const time = document.querySelector('input[name="bTime"]:checked');
    document.getElementById('rvName').textContent = get('bName');
    document.getElementById('rvEmail').textContent = get('bEmail');
    document.getElementById('rvPhone').textContent = get('bPhone');
    document.getElementById('rvCompany').textContent = get('bCompany');
    document.getElementById('rvTopic').textContent = topic && topic.value ? topic.value : '';
    document.getElementById('rvWhen').textContent = (day && time) ? `${day.dataset.label} · ${time.value} ET` : '';
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('bookingSubmit');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending…';
      }
      const name = document.getElementById('bName').value.trim();
      const email = document.getElementById('bEmail').value.trim();
      const phone = document.getElementById('bPhone').value.trim();
      const company = document.getElementById('bCompany').value.trim();
      const topic = document.getElementById('bTopic')?.value || '';
      const day = document.querySelector('input[name="bDay"]:checked');
      const time = document.querySelector('input[name="bTime"]:checked')?.value || '';
      const notes = document.getElementById('bNotes').value.trim();
      const when = day ? `${day.dataset.label} at ${time} ET` : '';

      const payload = {
        _subject: `Call request: ${name} · ${when}`,
        _template: 'table',
        _captcha: 'false',
        Name: name, Email: email, Phone: phone || '',
        Company: company || '', Topic: topic, When: when,
        Notes: notes || ''
      };

      // localStorage fallback so Ben never loses a lead
      try {
        const saved = JSON.parse(localStorage.getItem('bookings') || '[]');
        saved.push({ ...payload, ts: Date.now() });
        localStorage.setItem('bookings', JSON.stringify(saved));
      } catch(_) {}

      // Build mailto fallback up front so we can always offer it in the success state
      const mailBody = Object.entries(payload)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k,v]) => `${k}: ${v}`)
        .join('\n') + `\n\nSent from bensachwitz.vercel.app`;
      const mailtoHref = `mailto:bensachwitz@gmail.com?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(mailBody)}`;

      let formDelivered = false;
      try {
        // First try our own serverless function (Resend → formsubmit relay)
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          formDelivered = data.ok === true;
          if (!formDelivered) console.warn('[booking] /api/contact returned:', data);
        }
      } catch (err) { /* keep formDelivered = false */ }

      // The serverless function auto-sends the request (Resend, with a formsubmit.co
      // relay fallback) and always logs the lead server-side. We NEVER pop the
      // visitor's email client open. If the network call itself failed, the request
      // is still saved locally and offered as an optional manual email link below.
      const sd = document.getElementById('successDetail');
      if (sd) {
        sd.innerHTML = formDelivered
          ? `I got your request for <strong>${when}</strong>.<br/>I'll confirm by email within 24 hours.`
          : `Your request for <strong>${when}</strong> is in. If you don't hear from me within 24 hours, you can email me directly using the link below.`;
      }

      // Subtle, OPTIONAL manual email link (never auto-opened).
      const successPane = document.getElementById('bookingSuccess');
      if (successPane && !successPane.querySelector('.booking-mailto-fallback')) {
        const link = document.createElement('a');
        link.href = mailtoHref;
        link.className = 'booking-mailto-fallback link-line text-[12px] font-mono tracking-widest uppercase text-ink/55 mt-3 inline-block';
        link.textContent = formDelivered ? 'Email me a copy →' : 'Email me directly →';
        link.target = '_blank';
        link.rel = 'noopener';
        successPane.appendChild(link);
      }

      bookingBody.classList.add('hidden');
      bookingSuccess.classList.remove('hidden');
      // celebration: spring-pop the checkmark ring + restrained brand confetti (reduced-motion-safe)
      requestAnimationFrame(() => bookingSuccess.classList.add('pop'));
      if (typeof window.celebrate === 'function') window.celebrate(bookingSuccess);
      if (typeof window.track === 'function') window.track('Booking: Requested');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalBtnHTML; }
    });
  }
})();

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
  const isMobile = window.innerWidth <= 768;

  /* 1. HERO LETTER SPLIT */
  if (!prefersReduced && !isMobile) {
    document.querySelectorAll('[data-hero-line]').forEach((el) => {
      const txt = el.textContent;
      const base = parseFloat(el.dataset.delay || '0');
      el.textContent = '';
      [...txt].forEach((ch, i) => {
        const s = document.createElement('span');
        s.className = 'hl';
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        s.style.animationDelay = (base + i * 0.045).toFixed(3) + 's';
        el.appendChild(s);
      });
    });
  }

    /* ------------------------------------------------------------------
       Floating glyph field. Each glyph (site-wide ambient layer + per-section
       dark layer) drifts gently upward (one direction) at its OWN random speed while
       it fades in and out, then recycles to a fresh spot + symbol.
       We also GENERATE extra cool symbols so the field feels denser/alive.
       Honors prefers-reduced-motion (leaves the static CSS set as-is).
    ------------------------------------------------------------------ */
    (function randomizeGlyphDrift() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rnd = (min, max) => min + Math.random() * (max - min);
      const pm  = (v) => (Math.random() < 0.5 ? -v : v);            // random sign
      const pick = (a) => a[Math.floor(Math.random() * a.length)];
      const isMobile = window.matchMedia('(max-width: 640px)').matches;

      // Symbol pairs - [underwriter glyph, builder token]. The underwriter
      // slot leans into Ben's insurance / E&S underwriting world: ☂ insurance,
      // ⚖ risk & liability, § policy section, ¶ clause, № policy number,
      // ‰ loss-rate, † ‡ endorsements, £ ¢ $ premium, % loss ratio, ✓ bound,
      // ⚓ marine cargo, ⚑ claim flag, ∑ Δ ⊕ aggregation/change. Builder slot
      // stays code-flavored. Browser font-fallback covers any glyph not in the
      // primary face.
      const POOL = [
        ['☂','{}'], ['⚖','</>'], ['§','=>'], ['¶','&&'], ['№','::'], ['‰','||'],
        ['†','++'], ['‡','//'], ['£','##'], ['¢','**'], ['$','=='], ['%','!='],
        ['✓','<>'], ['⚓','fn'], ['⚑',';'],  ['∑','{'],  ['Δ','$'],  ['⊕','*'],
        ['◆','|>'], ['◇','->'], ['✦','%'],  ['✧','()'], ['❖','[]'], ['⟡','~'],
        ['◈','&'],  ['✶','|'],  ['★','^'],   ['⊗','?:'], ['÷','//'], ['№','::']
      ];

      // EXPERIENCE SYMBOLS - Ben's actual journey, drawn as monochrome line icons
      // and painted into each glyph via CSS mask (so they tint with the active mode
      // and stay crisp at any size). The text POOL above is the no-mask fallback.
      // Coverage: The Masters (golf flag + trophy), Lloyd's of London (anchor +
      // columns + £), specialty underwriting (scale + shield), commercial trucking,
      // logging/forestry, Darla Moore (cap), and the maker world he ships in
      // (code, arcade pad, app phone, Instagram camera, trend chart).
      const SVG = (b) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + b + '</svg>';
      const ICONS = [
        SVG('<path d="M7 21V3l8.5 3L7 9"/><path d="M4 21h7"/>'),                                           // golf flag - The Masters
        SVG('<path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3"/><path d="M12 12v4M9 20h6M10 20a2 2 0 0 1 4 0"/>'), // trophy - Augusta
        SVG('<circle cx="12" cy="5" r="2"/><path d="M12 7v13"/><path d="M5 13a7 7 0 0 0 14 0"/><path d="M4 13H6M18 13h2"/>'), // anchor - Lloyd\'s marine
        SVG('<path d="M2 9l10-5 10 5z"/><path d="M5 9v9m4-9v9m6-9v9m4-9v9"/><path d="M3 21h18"/>'),        // columns - Lloyd\'s / institution
        SVG('<path d="M12 4v17M7 21h10M4 8h16"/><path d="M7 8l-3 6h6zM17 8l-3 6h6z"/>'),                   // scale - underwriting
        SVG('<path d="M12 3l8 3v5c0 4.5-3.2 8-8 10-4.8-2-8-5.5-8-10V6z"/>'),                                // shield - insurance
        SVG('<path d="M2 7h12v9H2z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18.5" r="1.5"/><circle cx="17" cy="18.5" r="1.5"/>'), // truck - trucking
        SVG('<path d="M12 3l4 6h-2.5L17 14H7l3.5-5H8z"/><path d="M12 14v6"/>'),                            // pine - logging/forestry
        SVG('<path d="M2 8l10-4 10 4-10 4z"/><path d="M6 10.5V15c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5"/><path d="M22 8v5"/>'), // cap - Darla Moore
        SVG('<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>'),                                                      // code - apps / dev
        SVG('<rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 12h4M9 10v4"/><circle cx="16" cy="11" r=".8"/><circle cx="18" cy="13.5" r=".8"/>'), // gamepad - arcade / BCG
        SVG('<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>'),                    // phone - My Daily Tool
        SVG('<rect x="3" y="7" width="18" height="13" rx="2.5"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8.5 7l1.3-2h4.4l1.3 2"/>'), // camera - Instagram brand
        SVG('<path d="M4 4v16h16"/><path d="M7 14l4-4 3 3 5-6"/>'),                                         // chart - analysis
        SVG('<path d="M15.5 7A3.5 3.5 0 0 0 9 8.7V13H6.5m0 0H13m-6.5 0c2.4 0 2.4 3.3 0 5.3H17"/>')          // £ - Lloyd\'s London market
      ];
      const iconURI = (svg) => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
      const pickIcon = () => iconURI(pick(ICONS));

      // Per-glyph SHADE - mode-aware so builder-green is preserved. We set both
      // --g-uw-color (light-section ink / dark-section bone) and --g-bd-color
      // (green family), each at a random lightness so some symbols read darker,
      // some lighter, for variety.
      const clamp255 = (n) => Math.max(0, Math.min(255, Math.round(n)));
      function scale(rgb, f) { return 'rgb(' + rgb.map((c) => clamp255(c * f)).join(',') + ')'; }
      function applyShade(g, isSection) {
        if (isSection) {
          // dark bg: bone family, dim → bright
          g.style.setProperty('--g-uw-color', scale([245, 242, 236], rnd(0.58, 1.0)));
          g.style.setProperty('--g-bd-color', scale([74, 222, 128], rnd(0.70, 1.18)));
        } else {
          // light bg: grayscale ink, near-black → mid-gray
          const L = clamp255(rnd(8, 82));
          g.style.setProperty('--g-uw-color', 'rgb(' + L + ',' + L + ',' + L + ')');
          g.style.setProperty('--g-bd-color', scale([20, 160, 92], rnd(0.75, 1.30)));
        }
      }
      // Per-glyph SIZE - continuous random range (wider than the 2 CSS tiers) so
      // the field reads as many different sizes scattered across the screen.
      function applySize(g, isNear) {
        let px = isNear ? rnd(54, 134) : rnd(26, 80);
        if (isMobile) px *= 0.7;
        g.style.fontSize = px.toFixed(1) + 'px';
      }

      // Generate extra glyphs into a container to enrich the field.
      function grow(container, cls, count) {
        for (let i = 0; i < count; i++) {
          const sym = pick(POOL);
          const s = document.createElement('span');
          s.className = cls + ' ' + (Math.random() < 0.5 ? 'sg-far' : 'sg-near') + ' glyph-gen';
          s.setAttribute('data-uw', sym[0]);
          s.setAttribute('data-bd', sym[1]);
          s.setAttribute('aria-hidden', 'true');
          s.style.top  = rnd(2, 94).toFixed(1) + '%';
          s.style.left = rnd(2, 94).toFixed(1) + '%';
          container.appendChild(s);
        }
      }
      // For ambient layer, generated spans use ambient-glyph styling; tag them
      // ambient-glyph so color/blend matches the site-wide layer.
      const ambientBg = document.getElementById('ambientBg');
      if (ambientBg) {
        const addA = isMobile ? 7 : 18;
        for (let i = 0; i < addA; i++) {
          const sym = pick(POOL);
          const s = document.createElement('span');
          s.className = 'ambient-glyph ' + (Math.random() < 0.5 ? 'ag-far' : 'ag-near') + ' glyph-gen';
          s.setAttribute('data-uw', sym[0]);
          s.setAttribute('data-bd', sym[1]);
          s.setAttribute('aria-hidden', 'true');
          s.style.top  = rnd(2, 94).toFixed(1) + '%';
          s.style.left = rnd(2, 94).toFixed(1) + '%';
          ambientBg.appendChild(s);
        }
      }
      document.querySelectorAll('.section-glyphs').forEach((c) => grow(c, 'section-glyph', isMobile ? 4 : 9));

      // ANTI-CLUMP DISTRIBUTION - pure-random top/left clusters into clumps with
      // bare patches between. Instead lay each field out on a JITTERED GRID: build
      // ~√n × √n cells, shuffle them, drop one glyph per cell jittered within the
      // cell's inner band. Even spread, still random-looking, no two stacked.
      // Overrides any inline/CSS positions set above so the whole field (static +
      // generated) is evenly scattered.
      function scatter(els) {
        const n = els.length; if (!n) return;
        const cols = Math.max(1, Math.round(Math.sqrt(n)));
        const rows = Math.ceil(n / cols);
        const cells = [];
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r]);
        for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = cells[i]; cells[i] = cells[j]; cells[j] = t; }
        const padX = 3, padY = 3, spanX = 100 - 2 * padX, spanY = 100 - 2 * padY;
        const cellW = spanX / cols, cellH = spanY / rows;
        els.forEach((el, i) => {
          const cell = cells[i % cells.length];
          el.style.left = (padX + (cell[0] + rnd(0.15, 0.85)) * cellW).toFixed(2) + '%';
          el.style.top  = (padY + (cell[1] + rnd(0.15, 0.85)) * cellH).toFixed(2) + '%';
        });
      }
      scatter(Array.from(document.querySelectorAll('.ambient-glyph')));
      document.querySelectorAll('.section-glyphs').forEach((c) => scatter(Array.from(c.querySelectorAll('.section-glyph'))));

      // Give a glyph a brand-new journey: a random start anywhere on screen (corners
      // and edges included), its OWN random direction + distance, a fresh symbol and
      // size. Runs on first paint and every time the glyph fades back out, so each
      // symbol appears somewhere new and drifts a different way across the screen.
      function recycle(g) {
        g.style.left = rnd(-2, 100).toFixed(2) + '%';
        g.style.top  = rnd(-2, 100).toFixed(2) + '%';
        g.style.setProperty('--xp-ic', pickIcon());
        applySize(g, Math.random() < 0.5);   // size re-randomized every cycle
        const ang = rnd(0, Math.PI * 2), dist = rnd(60, 190);
        g.style.setProperty('--mx', (Math.cos(ang) * dist).toFixed(1) + 'px');
        g.style.setProperty('--my', (Math.sin(ang) * dist).toFixed(1) + 'px');
      }

      // Animate EVERY glyph: pure fade in / fade out (no lateral drift), each on its
      // own random clock + random size. They materialize, hold, dissolve, then
      // recycle to a fresh spot while invisible.
      const glyphs = document.querySelectorAll('.ambient-glyph, .section-glyph');
      glyphs.forEach((g) => {
        const isSection = g.classList.contains('section-glyph');
        const isNear = g.classList.contains('ag-near') || g.classList.contains('sg-near');

        applySize(g, isNear);
        applyShade(g, isSection);
        // Paint Ben's experience symbol into this glyph (masked → tints with mode).
        g.classList.add('xp-icon');
        g.style.setProperty('--xp-ic', pickIcon());

        // Peak opacity - meaningful symbols, so readable but well under the copy.
        const opMax = (isSection ? (isNear ? rnd(0.16, 0.26) : rnd(0.11, 0.18))
                                  : (isNear ? rnd(0.13, 0.21) : rnd(0.09, 0.15)));
        g.style.setProperty('--op-max', opMax.toFixed(3));

        // Each symbol travels in its OWN straight line at a random angle (it can come
        // from any corner or side), fading in as it enters and out as it leaves, at its
        // OWN random speed. No back-and-forth. When it fades out it recycles to a fresh
        // start + direction + symbol.
        const ang = rnd(0, Math.PI * 2), dist = rnd(60, 190);
        g.style.setProperty('--mx', (Math.cos(ang) * dist).toFixed(1) + 'px');
        g.style.setProperty('--my', (Math.sin(ang) * dist).toFixed(1) + 'px');
        const bDur = rnd(7, 17);   // varied speeds: some cross quickly, some slowly
        g.style.animation = 'glyphFloat ' + bDur.toFixed(1) + 's ease-in-out -' +
                            rnd(0, bDur).toFixed(1) + 's infinite';
        g.addEventListener('animationiteration', (e) => {
          if (e.animationName === 'glyphFloat') recycle(g);
        });
      });
    })();

  /* 2. TYPEWRITER ROTATOR */
  const twEl = document.getElementById('twPhrase');
  if (twEl && !prefersReduced) {
    const PHRASES = {
      underwriter: [
        'placing Lloyd\u2019s binders.',
        'analyzing loss runs.',
        'interpreting FMCSA data.',
        'modernizing a 38-year-old agency.',
        'profiling 5-year loss trends.',
        'drafting submissions for E&S markets.'
      ],
      builder: [
        'shipping iOS updates.',
        'debugging Swift in Xcode.',
        'wiring Vercel serverless.',
        'designing app icons.',
        'pushing to the App Store.',
        'reading App Store analytics.',
        'prompt-engineering with Claude.'
      ]
    };
    // Single-version site: one merged phrase set (underwriter + builder
    // work shown together). The old per-mode swap is retired.
    let phrases = PHRASES.underwriter;
    let pi = 0;



    const TYPE = 55, ERASE = 28, HOLD = 1700, GAP = 360;
    const type = async (s) => {
      for (let i = 0; i <= s.length; i++) {
        twEl.textContent = s.slice(0, i);
        await new Promise(r => setTimeout(r, TYPE + Math.random() * 45));
      }
    };
    const erase = async () => {
      const s = twEl.textContent;
      for (let i = s.length; i >= 0; i--) {
        twEl.textContent = s.slice(0, i);
        await new Promise(r => setTimeout(r, ERASE));
      }
    };
    (async function loop() {
      while (true) {
        await type(phrases[pi]);
        await new Promise(r => setTimeout(r, HOLD));
        await erase();
        await new Promise(r => setTimeout(r, GAP));
        pi = (pi + 1) % phrases.length;
      }
    })();
  } else if (twEl) {
    twEl.textContent = 'placing Lloyd\u2019s binders.';
  }

  /* 3. SPLIT-LINE REVEAL on display-h headings */
  if (!prefersReduced) {
    document.querySelectorAll('.display-h').forEach((h) => {
      if (h.dataset.split || h.querySelector('[data-hero-line]')) return;
      h.dataset.split = '1';
      const walkChildren = (node) => {
        const children = [...node.childNodes];
        children.forEach((n) => {
          if (n.nodeType === 3) {
            const words = n.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            words.forEach(w => {
              if (w.trim() === '') { frag.appendChild(document.createTextNode(w)); return; }
              const line = document.createElement('span'); line.className = 'sl-line';
              const word = document.createElement('span'); word.className = 'sl-word';
              word.textContent = w;
              line.appendChild(word);
              frag.appendChild(line);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && !['BR'].includes(n.tagName)) {
            walkChildren(n);
          }
        });
      };
      try { walkChildren(h); } catch (e) { /* skip */ }
    });
    const slIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.sl-word').forEach((w, i) => {
          w.style.transitionDelay = (i * 0.05).toFixed(2) + 's';
          w.classList.add('in');
        });
        slIo.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-split]').forEach(el => slIo.observe(el));
  }

  /* 4. IMAGE MASK REVEAL */
  const maskIo = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); maskIo.unobserve(e.target); } });
  }, { threshold: 0.2 });
  document.querySelectorAll('.mask-reveal').forEach(el => maskIo.observe(el));

  /* 5. STAT FLASH when counter lands */
  const flashObserver = new MutationObserver(() => {});
  document.querySelectorAll('.stat-n').forEach((el) => {
    const count = el.querySelector('[data-count]');
    if (!count) return;
    const target = parseInt(count.dataset.count, 10);
    const check = () => {
      if (parseInt(count.textContent, 10) >= target) {
        el.classList.add('is-flashed');
        setTimeout(() => el.classList.remove('is-flashed'), 900);
      } else requestAnimationFrame(check);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setTimeout(check, 300); io.unobserve(el); } });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* 6. CARD TILT - applies to projects, expertise cards, app cards, world tiles, sat frames, booking card */
  if (!isTouch && !prefersReduced) {
    // Tuning per selector: max rotation (deg) and lift (px)
    const TILT_CONFIG = [
      { sel: '.proj',          rx: 5,  ry: 7,  lift: -4,  perspective: 900 },
      { sel: '.exp-card',      rx: 5,  ry: 7,  lift:  0,  perspective: 900 },
      { sel: '.app-visual',    rx: 6,  ry: 9,  lift: -6,  perspective: 1400 },
      { sel: '.world-tile',    rx: 7,  ry: 10, lift: -8,  perspective: 1100 },
      { sel: '.sat-frame',     rx: 3,  ry: 6,  lift: -4,  perspective: 1500 },
      { sel: '.booking-card-3d', rx: 3, ry: 4, lift: -3,  perspective: 1400 },
      { sel: '.life-tile',     rx: 5,  ry: 8,  lift: -6,  perspective: 1000 },
      /* New: stat boxes, timeline rows, booking topic chips, value-prop cards */
      { sel: '.stat-mini',     rx: 4,  ry: 6,  lift: -3,  perspective: 1200 },
      { sel: '.tl-row',        rx: 2,  ry: 3,  lift: -2,  perspective: 1600 },
      { sel: '.bchip',         rx: 8,  ry: 10, lift: -2,  perspective: 800 },
      { sel: '.value-prop-card', rx: 4, ry: 6, lift: -3,  perspective: 1200 },
      { sel: '.cert-chip',     rx: 6,  ry: 8,  lift: -3,  perspective: 900 },
    ];
    TILT_CONFIG.forEach(({ sel, rx: rxM, ry: ryM, lift, perspective: persp }) => {
      document.querySelectorAll(sel).forEach((card) => {
        let raf = null;
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            card.classList.add('is-tilting');
            const rx = (-y * rxM).toFixed(2);
            const ry = ( x * ryM).toFixed(2);
            card.style.transform = `perspective(${persp}px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${lift}px)`;
          });
        });
        card.addEventListener('mouseleave', () => {
          card.classList.remove('is-tilting');
          card.style.transform = '';
        });
      });
    });

    /* 6b. HERO PHOTO 3D TILT - subtle, with light sweep */
    const heroPhoto = document.querySelector('.hero-parallax-photo');
    if (heroPhoto) {
      let raf2 = null;
      heroPhoto.addEventListener('mousemove', (e) => {
        const r = heroPhoto.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = ((0.5 - y) * 8).toFixed(2);
        const ry = ((x - 0.5) * 10).toFixed(2);
        if (raf2) cancelAnimationFrame(raf2);
        raf2 = requestAnimationFrame(() => {
          heroPhoto.classList.add('tilt-active');
          heroPhoto.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
          heroPhoto.style.setProperty('--hx', `${(x*100).toFixed(1)}%`);
          heroPhoto.style.setProperty('--hy', `${(y*100).toFixed(1)}%`);
        });
      });
      heroPhoto.addEventListener('mouseleave', () => {
        heroPhoto.classList.remove('tilt-active');
        heroPhoto.style.transform = '';
      });
    }

    /* 6b-1. CURSOR-FOLLOW GLOW - page-wide signature ambient light */
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow) {
      let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
      let tx = gx, ty = gy;
      let rafGlow = null;
      let active = false;
      const tick = () => {
        gx += (tx - gx) * 0.12;
        gy += (ty - gy) * 0.12;
        cursorGlow.style.setProperty('--cx', gx + 'px');
        cursorGlow.style.setProperty('--cy', gy + 'px');
        rafGlow = requestAnimationFrame(tick);
      };
      document.addEventListener('mousemove', (e) => {
        tx = e.clientX; ty = e.clientY;
        if (!active) {
          active = true;
          cursorGlow.classList.add('active');
          rafGlow = requestAnimationFrame(tick);
        }
      }, { passive: true });
      document.addEventListener('mouseleave', () => {
        cursorGlow.classList.remove('active');
        active = false;
        if (rafGlow) { cancelAnimationFrame(rafGlow); rafGlow = null; }
      });
    }

    /* 6b-2. SCROLL-DRIVEN HERO DEPTH - title pushes back, photo lifts toward camera */
    const heroTitle = document.querySelector('.hero-title');
    const heroPhotoEl = document.querySelector('.hero-parallax-photo');
    const heroSection2 = document.getElementById('top');
    if (heroTitle && heroSection2) {
      let rafScroll = null;
      const updateHeroDepth = () => {
        const rect = heroSection2.getBoundingClientRect();
        // 0 when hero is fully in view at top, 1 when scrolled past
        const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
        // Push title back, lift photo forward slightly
        heroTitle.style.transform = `translateY(${(progress * -40).toFixed(1)}px) translateZ(${(progress * -80).toFixed(0)}px) scale(${(1 - progress * 0.08).toFixed(3)})`;
        heroTitle.style.opacity = (1 - progress * 0.7).toFixed(2);
        if (heroPhotoEl && !heroPhotoEl.classList.contains('tilt-active')) {
          heroPhotoEl.style.transform = `perspective(1100px) translateY(${(progress * -20).toFixed(1)}px) translateZ(${(progress * 30).toFixed(0)}px)`;
        }
        rafScroll = null;
      };
      window.addEventListener('scroll', () => {
        if (rafScroll) return;
        rafScroll = requestAnimationFrame(updateHeroDepth);
      }, { passive: true });
      updateHeroDepth();
    }

    /* 6c. PARALLAX ORBS - drift on cursor across hero */
    const heroSection = document.getElementById('top');
    const orbs = heroSection ? heroSection.querySelectorAll('.depth-orb') : [];
    if (heroSection && orbs.length) {
      let raf3 = null;
      heroSection.addEventListener('mousemove', (e) => {
        const r = heroSection.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        if (raf3) cancelAnimationFrame(raf3);
        raf3 = requestAnimationFrame(() => {
          orbs.forEach((orb, i) => {
            const depth = (i + 1) * 14;
            orb.style.transform = `translate3d(${(-x*depth).toFixed(1)}px, ${(-y*depth).toFixed(1)}px, 0)`;
          });
        });
      });
    }
  }

  /* 7. MAGNETIC BUTTONS */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.magnet').forEach((el) => {
      const k = 0.22;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width/2)*k}px, ${(e.clientY - r.top - r.height/2)*k}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* 8. SCRAMBLE-DECODE eyebrows on reveal */
  if (!prefersReduced) {
    const CHARS = '!<>-_\\/[]{}-=+*^?#________';
    const scramble = (el, original) => {
      let frame = 0;
      const q = [...original].map((c) => ({
        to: c, start: Math.floor(Math.random() * 8), end: Math.floor(Math.random() * 18) + 8,
      }));
      (function tick() {
        let out = '', done = 0;
        q.forEach((it) => {
          if (frame >= it.end) { done++; out += it.to; }
          else if (frame >= it.start) { out += CHARS[Math.floor(Math.random() * CHARS.length)]; }
          else { out += ' '; }
        });
        el.textContent = out;
        if (done < q.length) { frame++; requestAnimationFrame(tick); }
        else { el.textContent = original; }
      })();
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || e.target.dataset.scrambled) return;
        e.target.dataset.scrambled = '1';
        scramble(e.target, e.target.textContent.trim());
        io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.eyebrow').forEach((el) => {
      if (el.children.length > 0) return;
      io.observe(el);
    });
  }

  /* 9. SMOOTH IN-PAGE SCROLL */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* 10. COPYRIGHT EASTER EGG - hover 2s, © 2026 morphs to 1688 */
  const copyEgg = document.getElementById('copyEgg');
  const copyYear = document.getElementById('copyYear');
  if (copyEgg && copyYear) {
    let hoverTimer = null; let original = '2026'; let morphed = false;
    const CHARS = '0123456789';
    const morph = (to) => {
      let frame = 0; const tgt = [...to];
      (function tick() {
        let out = '';
        tgt.forEach((c, i) => {
          if (frame > 8 + i) out += c;
          else out += CHARS[Math.floor(Math.random() * CHARS.length)];
        });
        copyYear.textContent = out;
        if (out !== to) { frame++; requestAnimationFrame(tick); }
      })();
    };
    const start = () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        copyEgg.classList.add('is-unlocked');
        morph('1688');
        morphed = true;
      }, 700);
    };
    const reset = () => {
      clearTimeout(hoverTimer);
      if (morphed) {
        morph('2026');
        morphed = false;
        setTimeout(() => copyEgg.classList.remove('is-unlocked'), 400);
      }
    };
    copyEgg.addEventListener('mouseenter', start);
    copyEgg.addEventListener('focus', start);
    copyEgg.addEventListener('mouseleave', reset);
    copyEgg.addEventListener('blur', reset);
    // Keyboard activation (Enter / Space) mirrors the hover/focus easter-egg trigger
    copyEgg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        start();
      }
    });
  }

  /* 11. KONAMI CODE - triggers glyph rain over hero + toast */
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let ki = 0;
  document.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === KONAMI[ki]) {
      ki++;
      if (ki === KONAMI.length) { ki = 0; triggerGlyphRain(); }
    } else {
      ki = (k === KONAMI[0]) ? 1 : 0;
    }
  });

  function triggerGlyphRain() {
    if (document.querySelector('.glyph-rain')) return;
    const GLYPHS = 'Σ∑πΔ∫∂λΦΨ£€¥$0123456789·◆◇※';
    const wrap = document.createElement('div');
    wrap.className = 'glyph-rain';
    document.body.appendChild(wrap);
    const cols = Math.floor(window.innerWidth / 22);
    for (let i = 0; i < cols; i++) {
      const col = document.createElement('div');
      col.className = 'glyph-col';
      col.style.left = (i * 22 + Math.random() * 8) + 'px';
      const dur = 2 + Math.random() * 2.5;
      col.style.animationDuration = dur + 's';
      col.style.animationDelay = (Math.random() * 1.2) + 's';
      const len = 12 + Math.floor(Math.random() * 14);
      for (let j = 0; j < len; j++) {
        const s = document.createElement('span');
        s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        s.style.animationDelay = (j * 0.12) + 's';
        col.appendChild(s);
      }
      wrap.appendChild(col);
    }
    requestAnimationFrame(() => wrap.classList.add('on'));
    showToast('✓ binding authority unlocked · bensachwitz@gmail.com');
    setTimeout(() => { wrap.classList.remove('on'); setTimeout(() => wrap.remove(), 700); }, 4800);
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'egg-toast';
    t.innerHTML = '<span class="dot"></span><span>' + msg + '</span>';
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('on'));
    setTimeout(() => { t.classList.remove('on'); setTimeout(() => t.remove(), 500); }, 5000);
  }

  /* SAT REVEAL - photos bloom to full color on scroll-in */
  const satIo = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); satIo.unobserve(e.target); } });
  }, { threshold: 0.25 });
  document.querySelectorAll('.sat-reveal').forEach(el => satIo.observe(el));

  /* WORLD TILE STAGGER */
  const worldIo = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('wt-in'); worldIo.unobserve(e.target); } });
  }, { threshold: 0.2 });
  document.querySelectorAll('.world-tile').forEach(el => worldIo.observe(el));

  /* LIFE TILE STAGGER - cascade in on scroll */
  const lifeIo = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lt-in'); lifeIo.unobserve(e.target); } });
  }, { threshold: 0.2 });
  document.querySelectorAll('.life-tile').forEach(el => lifeIo.observe(el));

  /* CAREER TIMELINE LINE DRAW - once the section hits viewport */
  const career = document.getElementById('career');
  if (career) {
    const careerIo = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { career.classList.add('in-view'); careerIo.unobserve(career); } });
    }, { threshold: 0.15 });
    careerIo.observe(career);
  }

  /* 12. Navigation active state is initialized near the top of the app so
     subpages get a URL-based state before their content is measured. */

  /* 13. Expose for mobile trigger (tap-tap-tap on chapter numeral VI) */
  const arcadeChapter = document.querySelector('#arcade .chapter-num');
  if (arcadeChapter) {
    let taps = 0, timer;
    arcadeChapter.addEventListener('click', () => {
      taps++; clearTimeout(timer); timer = setTimeout(() => taps = 0, 1200);
      if (taps >= 3) { taps = 0; triggerGlyphRain(); }
    });
    arcadeChapter.style.cursor = 'pointer';
  }
})();

// Scroll progress bar + Drifting background glyphs dynamic cursor & scroll follow
let targetParallaxX = 0, targetParallaxY = 0;
let currentParallaxX = 0, currentParallaxY = 0;

window.addEventListener('mousemove', (e) => {
  // Normalize cursor coords relative to center: -1 to 1
  const nx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
  const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  // Max drift in pixels
  targetParallaxX = nx * 35;
  targetParallaxY = ny * 35;
});

window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
  const bar = document.getElementById('scrollProgress');
  if (bar) bar.style.width = pct + '%';
}, { passive: true });

function updateParallax() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Smooth interpolation (lerp)
    currentParallaxX += (targetParallaxX - currentParallaxX) * 0.08;
    currentParallaxY += (targetParallaxY - currentParallaxY) * 0.08;
    
    document.documentElement.style.setProperty('--mouse-drift-x', currentParallaxX.toFixed(2) + 'px');
    document.documentElement.style.setProperty('--mouse-drift-y', currentParallaxY.toFixed(2) + 'px');
  }
  requestAnimationFrame(updateParallax);
}
requestAnimationFrame(updateParallax);

/* ============================================================
   ANALYTICS - Plausible custom-event tracking (delegated)
   The Plausible script + window.plausible() queue shim are loaded in <head>.
   Rather than hand-tagging every button across 7 pages with a className,
   we delegate from the document so the money-events fire identically on
   every page. Safe no-op if Plausible is blocked (queue shim swallows it).
============================================================ */
(function () {
  function track(name, props) {
    try { if (typeof window.plausible === 'function') window.plausible(name, props ? { props: props } : undefined); }
    catch (_) { /* analytics must never throw into the UX */ }
  }
  // expose for the form handlers (contact + booking) to call on success
  window.track = track;

  document.addEventListener('click', function (e) {
    const t = e.target.closest('a, button');
    if (!t) return;

    // Open-booking intent (any "book a call" / "start a project" trigger, every page)
    if (t.closest('[data-open-booking]')) { track('Booking: Open'); return; }

    const href = (t.getAttribute && t.getAttribute('href')) || '';

    // App Store badge / app-tile taps
    if (href.indexOf('apps.apple.com') !== -1) {
      const app = href.indexOf('bar-crawl-golf') !== -1 ? 'Bar Crawl Golf'
                : href.indexOf('my-daily-tool') !== -1 ? 'My Daily Tool'
                : 'App';
      track('App Store: Tap', { app: app });
      return;
    }

    // "Launch site" / "Web version" / live-project outbound links
    const label = (t.textContent || '').trim().toLowerCase();
    if (label.indexOf('launch site') !== -1 || label.indexOf('web version') !== -1 || label.indexOf('view project') !== -1) {
      track('Project: Launch', { url: href });
      return;
    }
  }, true);
})();

/* ============================================================
   MAGNETIC BUTTONS - premium micro-interaction.
   Primary CTAs (.btn-ink, .btn-gold) subtly follow the cursor
   when hovered, then spring back on leave. Disabled on touch
   devices and reduced-motion. Pure JS, no library.
============================================================ */
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var MAGNET_RADIUS = 18; // max px displacement
  var LERP = 0.18;

  document.querySelectorAll('.btn-ink, .btn-gold, .book-float a').forEach(function (btn) {
    var tx = 0, ty = 0, cx = 0, cy = 0, rafId = null, hovered = false;

    function animate() {
      cx += (tx - cx) * LERP;
      cy += (ty - cy) * LERP;
      // Use the standalone `translate` property (not `transform`) so the
      // CSS :hover transform (translateY lift) still applies on top.
      btn.style.translate = cx.toFixed(2) + 'px ' + cy.toFixed(2) + 'px';
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    }

    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var px = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      var py = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      tx = px * MAGNET_RADIUS;
      ty = py * MAGNET_RADIUS;
      if (!rafId) animate();
    });

    btn.addEventListener('mouseleave', function () {
      tx = 0; ty = 0;
      if (!rafId) animate();
    });
  });
})();
