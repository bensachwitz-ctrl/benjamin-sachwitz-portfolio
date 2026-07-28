(function() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  // Inject CSS
  const style = document.createElement("style");
  style.textContent = `
    [data-sw-section] {
      opacity: 0;
      transform: translateY(28px) scale(0.985);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: opacity, transform;
    }
    [data-sw-section].sw-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    [data-sw-section].sw-visible img.sw-layer {
      animation: sw-kenburns 22s ease-out forwards;
    }
    @keyframes sw-kenburns {
      0% { transform: scale(1); }
      100% { transform: scale(1.06); }
    }
    .sw-layer { will-change: transform; transition: transform 0.05s linear; }
    html { scroll-behavior: smooth; }
    @media (prefers-reduced-motion: reduce) {
      [data-sw-section] { opacity: 1 !important; transform: none !important; }
      html { scroll-behavior: auto !important; }
    }
  `;
  document.head.appendChild(style);

  // IntersectionObserver for reveals
  let sections = [];
  function initSections() {
    sections = Array.from(document.querySelectorAll("[data-sw-section]"));
    if (!sections.length) return;

    // Seed above-the-fold sections as visible immediately
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) s.classList.add("sw-visible");
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("sw-visible");
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
    sections.forEach((s) => observer.observe(s));

    return observer;
  }

  let observer = initSections();

  // Parallax scroll handler (rAF-throttled)
  let ticking = false;
  function handleScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const center = rect.top + rect.height / 2;
          const distance = center - window.innerHeight / 2;
          section.querySelectorAll(".sw-layer").forEach((layer, i) => {
            layer.style.transform = `translate3d(0, ${distance * (i + 1) * 0.06}px, 0)`;
          });
        }
      });
      ticking = false;
    });
  }
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Re-init on DOMContentLoaded if needed (in case script loads before DOM)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      observer = initSections();
      handleScroll();
    });
  } else {
    handleScroll();
  }
})();
