# Benjamin Sachwitz — Personal Portfolio

A high-fidelity, production-ready personal site for **Benjamin Sachwitz** — Risk Management & Insurance graduate of the Darla Moore School of Business, currently an assistant underwriter at **Swamp Fox Agency** specializing in commercial trucking and logging risk.

> Bridging the gap between traditional risk and modern technology.

**Aesthetic:** Carolina Executive — Deep Garnet `#73000A`, Midnight Navy `#002147`, Frost White `#F8F9FA`.
**Typography:** Cormorant Garamond (serif headlines) + Montserrat (sans body).
**Tech:** Pure HTML5 / CSS3 / vanilla JS. Zero build step. Zero dependencies. Fast, accessible, fully responsive.

## Sections

- **Hero** — Headline, first-person narrative, dual CTA, animated scroll cue
- **Stats Band** — Animated counters (cities, certifications, Carahsoft summers, Masters tournaments, Lloyd's est. 1688)
- **Four Legacy Pillars** — Global Standard (Price Forbes) · Southern Root (Masters) · Tech Specialist (Carahsoft) · Strategic Present (Swamp Fox)
- **The Interactive Path** — Six-stop career timeline: McLean officiating → USC Darla Moore → Masters → Carahsoft → Lloyd's of London → Swamp Fox
- **Digital Portfolio** — Swamp Fox Redesign, Loss Control Hub, Summit Portal
- **Expertise Matrix** — Risk Management · Commercial P&C · Sales & Negotiation · AI & Data
- **Credentials Chip Grid** — 14 selected certifications
- **Global Connect Portal** — Contact form + LinkedIn + work email + phone

## Features

- Glassmorphism cards with layered shadows and hover lifts
- Animated stat counters with eased-out timing
- Parallax topographic hero overlay
- Scroll-reveal animations (IntersectionObserver, respects `prefers-reduced-motion`)
- Active-nav scroll spy with animated underline
- Shimmer-effect primary CTAs
- Fully mobile-responsive with animated hamburger nav and tightened breakpoints (860px, 520px)
- Semantic HTML + JSON-LD `Person` schema + Open Graph tags
- SEO-optimized for "Benjamin Sachwitz Risk Management" and related queries
- Keyboard-accessible, visible focus rings, print stylesheet

## Local Preview

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000`. Or just double-click `index.html` — everything works from the file system.

## Deploy to GitHub + GitHub Pages (Secure)

**Never paste a personal access token into a terminal, file, or chat.** Use `gh auth login`, which stores credentials in your OS keychain via a short-lived browser flow.

```bash
# 1. From inside the "personal website" folder
cd "personal website"
git init
git add .
git commit -m "Initial commit: Carolina Executive portfolio"

# 2. Authenticate the GitHub CLI (once per machine)
gh auth login
#   → GitHub.com → HTTPS → Login with a web browser

# 3. Create the repo and push in one shot
gh repo create benjamin-sachwitz-portfolio --public --source=. --remote=origin --push

# 4. Enable GitHub Pages
gh repo edit --enable-pages --pages-branch main --pages-path /
```

Your site will be live at `https://<your-username>.github.io/benjamin-sachwitz-portfolio/` within about two minutes.

### Custom Domain (optional)

1. Buy `benjaminsachwitz.com` (Namecheap / Porkbun / Cloudflare Registrar).
2. In GitHub: Settings → Pages → Custom domain → enter your domain.
3. At your registrar, add these DNS records pointing to GitHub Pages:
   - `A`  @  185.199.108.153
   - `A`  @  185.199.109.153
   - `A`  @  185.199.110.153
   - `A`  @  185.199.111.153
   - `CNAME` www → `<your-username>.github.io`
4. Check "Enforce HTTPS" in GitHub Pages settings.

## File Structure

```
personal website/
├── index.html     # Semantic structure, SEO, JSON-LD, all content sections
├── styles.css     # Carolina Executive theme, glassmorphism, animations, full responsive
├── app.js         # Nav, smooth-scroll, scroll-reveal, counters, active nav, parallax, contact
└── README.md      # This file
```

## Contact

- **Work:** benjamin@swampfoxagency.com
- **Phone:** +1 (571) 385-5134
- **LinkedIn:** https://www.linkedin.com/in/benjamin-sachwitz

Built in the Lowcountry. Inspired by the London market.
