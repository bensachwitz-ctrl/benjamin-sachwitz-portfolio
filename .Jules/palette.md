## 2026-05-23 - Accessibility for custom interactive components
**Learning:** Custom interactive elements (like divs acting as buttons or close icons) throughout the app lacked semantic roles (`role="button"`), keyboard accessibility (`tabindex="0"`), and screen-reader names (`aria-label`s).
**Action:** Always verify that elements acting as buttons or interactive triggers either use native `<button>` tags or include proper ARIA roles, tabindex, and descriptive `aria-label`s.
