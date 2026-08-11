// scroll-world.js - vanilla JS cinematic scroll-driven immersive effects for
// Ben's personal website (bensachwitz.vercel.app). Loaded from index.html via
// <script defer>. No framework dependency, no imports.
//
// Cinematic effects (all respect prefers-reduced-motion):
//   - Section reveal: opacity/translate/scale fade-in via IntersectionObserver
//   - Cinematic focus-pull: sections scale + blur + dim as they leave the
//     viewport center, sharpening to full opacity/scale at center
//   - Depth-based parallax: [data-depth="0..5"] elements move at staggered
//     speeds (0.10x to 1.20x scroll speed). Legacy .sw-layer also supported.
//   - Sticky pinning: sections marked [data-sw-sticky] pin to the top and
//     expose a --sw-pin-progress custom property (0..1) for inner reveals
//   - Clip-path birth: sections with [data-sw-reveal="clip"] sweep in
//   - Line-by-line text reveal: [data-sw-text] children stagger in
//
// No progress bar -- the scroll position itself is the indicator.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const DEPTH_TABLE = [0.10, 0.25, 0.50, 0.80, 1.00, 1.20];
  const parallaxIntensity = 0.15;
  const cinematicIntensity = 0.4;

  // Inject CSS
  const style = document.createElement("style");
  style.textContent = `
    [data-sw-section] {
      opacity: 1;
      transform: none;
      transition: opacity 0.35s ease-out, transform 0.35s ease-out;
      will-change: auto;
    }
    [data-sw-section].sw-visible {
      opacity: 1;
      transform: none;
    }
    [data-sw-section].sw-cinematic {
      transition: none;
      opacity: 1;
      transform: none;
      filter: none;
    }
    /* Depth parallax layers */
    [data-depth] { will-change: transform; transition: transform 0.05s linear; }
    .sw-layer { will-change: transform; transition: transform 0.05s linear; }
    /* Sticky pinning */
    [data-sw-section].sw-sticky {
      position: sticky; top: 0; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      z-index: 1; overflow: hidden;
    }
    [data-sw-section].sw-sticky .sw-pin-inner { position: relative; z-index: 2; }
    /* Clip-path birth reveal */
    [data-sw-section][data-sw-reveal="clip"] {
      clip-path: inset(0 0 100% 0);
      transition: clip-path 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1);
    }
    [data-sw-section][data-sw-reveal="clip"].sw-visible {
      clip-path: inset(0 0 0% 0);
    }
    [data-sw-text] > * {
      opacity: 1; transform: none;
      transition: opacity 0.35s ease-out, transform 0.35s ease-out;
    }
    [data-sw-section].sw-visible [data-sw-text] > * {
      opacity: 1; transform: translateY(0);
    }
    [data-sw-section].sw-visible [data-sw-text] > *:nth-child(1) { transition-delay: 0.05s; }
    [data-sw-section].sw-visible [data-sw-text] > *:nth-child(2) { transition-delay: 0.12s; }
    [data-sw-section].sw-visible [data-sw-text] > *:nth-child(3) { transition-delay: 0.19s; }
    [data-sw-section].sw-visible [data-sw-text] > *:nth-child(4) { transition-delay: 0.26s; }
    [data-sw-section].sw-visible [data-sw-text] > *:nth-child(5) { transition-delay: 0.33s; }
    [data-sw-section].sw-visible [data-sw-text] > *:nth-child(6) { transition-delay: 0.40s; }
    /* Section accent glow on entry (Carolina Executive gold) */
    [data-sw-section].sw-visible::before {
      content: ""; position: absolute; inset: 0;
      background: radial-gradient(ellipse at center, rgba(193,162,73,0.05) 0%, transparent 70%);
      pointer-events: none; z-index: 0;
    }
    html { scroll-behavior: smooth; }
    @media (prefers-reduced-motion: reduce) {
      [data-sw-section] { opacity: 1 !important; transform: none !important; filter: none !important; clip-path: none !important; transition: none !important; }
      [data-sw-section].sw-sticky { position: static !important; min-height: auto !important; }
      [data-sw-section] [data-sw-text] > * { opacity: 1 !important; transform: none !important; }
      [data-depth] { transform: none !important; }
      .sw-layer { transform: none !important; }
      html { scroll-behavior: auto !important; }
    }
  `;
  document.head.appendChild(style);

  // IntersectionObserver for reveals
  let sections = [];
  let observer = null;

  function initSections() {
    sections = Array.from(document.querySelectorAll("[data-sw-section]"));
    if (!sections.length) return;

    // Seed above-the-fold sections as visible immediately
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        s.classList.add("sw-visible");
      }
    });

    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("sw-visible");
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
    sections.forEach((s) => observer.observe(s));
  }

  initSections();

  // Cinematic scroll handler (rAF-throttled)
  let ticking = false;
  function handleScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const viewportCenter = vh / 2;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= vh || rect.bottom <= 0) return;

        // --- Cinematic focus-pull ---
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        const maxDistance = vh / 2 + rect.height / 2;
        const edgeFactor = Math.min(distance / maxDistance, 1);

        const ci = cinematicIntensity;
        const opacity = 1 - ci * 0.6 * edgeFactor;
        const scale = 1 - ci * 0.04 * edgeFactor;
        const blur = ci * 6 * edgeFactor;
        const ty = edgeFactor * ci * 20 * (sectionCenter < viewportCenter ? -1 : 1);

        section.style.setProperty("--sw-focus-opacity", opacity.toFixed(3));
        section.style.setProperty("--sw-focus-scale", scale.toFixed(4));
        section.style.setProperty("--sw-focus-blur", blur.toFixed(2) + "px");
        section.style.setProperty("--sw-focus-ty", ty.toFixed(1) + "px");

        if (section.classList.contains("sw-visible")) {
          section.classList.add("sw-cinematic");
        }

        // --- Sticky pin progress ---
        if (section.classList.contains("sw-sticky")) {
          const pinProgress = Math.max(0, Math.min(1,
            (scrollY - section.offsetTop) / Math.max(1, rect.height - vh)
          ));
          section.style.setProperty("--sw-pin-progress", pinProgress.toFixed(4));
        }

        // --- Depth-based parallax ([data-depth]) ---
        const depthEls = section.querySelectorAll("[data-depth]");
        depthEls.forEach((el) => {
          const depthAttr = el.getAttribute("data-depth");
          const depthIdx = Math.max(0, Math.min(5, parseInt(depthAttr || "2", 10)));
          const speed = DEPTH_TABLE[depthIdx] * parallaxIntensity * 4;
          const elCenter = rect.top + rect.height / 2;
          const delta = (elCenter - viewportCenter) * speed;
          el.style.transform = `translate3d(0, ${delta.toFixed(2)}px, 0)`;
        });

        // --- Legacy .sw-layer parallax (backwards compat) ---
        section.querySelectorAll(".sw-layer").forEach((layer, i) => {
          const layerCenter = rect.top + rect.height / 2;
          const delta = (layerCenter - viewportCenter) * (i + 1) * 0.06;
          layer.style.transform = `translate3d(0, ${delta.toFixed(2)}px, 0)`;
        });
      });
      ticking = false;
    });
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll, { passive: true });

  // Re-init on DOMContentLoaded if needed (in case script loads before DOM)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initSections();
      handleScroll();
    });
  } else {
    handleScroll();
  }
})();
