/** Static build config - replaces the cdn.tailwindcss.com Play CDN on all 10
 *  pages. Merges every per-product palette that appeared in the pages' inline
 *  configs (default ink/bone/ox/gold/mute + crawl/sunrise/greek). Scans HTML +
 *  app.js for class usage; safelist is a net for any dynamically-applied
 *  color/state utility. Build: npx tailwindcss@3 -c tailwind.config.js -i tw-input.css -o tailwind.css --minify */
module.exports = {
  content: ['./*.html', './app.js'],
  safelist: [
    { pattern: /^(bg|text|border|from|via|to|ring|decoration|fill|stroke)-(ink|bone|ox|gold|mute)(-([234]))?$/ },
    { pattern: /^(bg|text|border|from|via|to|ring)-(crawl|sunrise|greek)-[a-z]+$/ },
    { pattern: /^(opacity|scale|translate-[xy]|rotate)-.+$/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces','ui-serif','Georgia','serif'],
        sans: ['Inter','ui-sans-serif','system-ui','sans-serif'],
        mono: ['JetBrains Mono','ui-monospace','Menlo','monospace'],
      },
      colors: {
        ink: { DEFAULT:'#0A0A0A', 2:'#161616', 3:'#1F1F1F', 4:'#2A2A2A' },
        bone: { DEFAULT:'#F5F2EC', 2:'#EAE5DA', 3:'#D9D2C3' },
        ox: { DEFAULT:'#8B1A1A', 2:'#6B1111' },
        gold: { DEFAULT:'#D4A843', 2:'#B88A2F', 3:'#E8C77D' },
        mute: { DEFAULT:'#6B6B6B', 2:'#8A8A8A' },
        crawl: { navy:'#0d1b2a', card:'#1b263b', gold:'#e0a96d', cream:'#ebe4cf', accent:'#31572c', mute:'rgba(235,228,207,0.65)' },
        sunrise: { black:'#120d0a', card:'#1c1612', cream:'#f4e3c1', gold:'#ffbe76', peach:'#ff7979', mute:'rgba(244,227,193,0.65)' },
        greek: { blue:'#0056b3', dark:'#0f172a', light:'#f8fafc', slate:'#64748b' },
      },
      letterSpacing: { tightest: '-0.05em' },
    },
  },
};
