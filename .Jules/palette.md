## 2025-01-28 - Button Conversions and Default Styles
**Learning:** When converting non-interactive elements (like `div`) to `<button>` tags for accessibility in this static site, default browser button styles (like background, border, and padding) will cause visual regressions because the site lacks a global CSS reset for buttons.
**Action:** When making these conversions, explicitly reset button styles (`background: transparent; border: none; padding: 0;`) in the CSS classes.
