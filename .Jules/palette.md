## 2026-06-14 - Explicit CSS Resets for Button Conversions
**Learning:** When converting non-interactive structural elements (like `div`) to `button` tags for accessibility in environments without a global CSS reset, visual regressions will occur because buttons come with default browser styles (backgrounds, borders, padding).
**Action:** Always explicitly reset default button styles (e.g., `background: transparent; border: none; padding: 0;`) when making these semantic conversions to prevent breaking existing layouts.
