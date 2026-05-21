## 2024-05-21 - Added ARIA labels to modal close buttons
**Learning:** Adding `aria-hidden="true"` to SVGs within button elements that already have an `aria-label` prevents screen readers from redundantly announcing the SVG or encountering issues with it.
**Action:** When adding an `aria-label` to an icon-only button, ensure the inner icon element (like an SVG) has `aria-hidden="true"`.
