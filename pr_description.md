💡 **What:** Replaced `setInterval` with `requestAnimationFrame` for the auto-scrolling carousel animation.
🎯 **Why:** `setInterval` does not sync with the browser's refresh rate and runs even when the tab is inactive, leading to inconsistent frame rates, jank, and wasted CPU cycles. Switching to `requestAnimationFrame` ensures smooth visual updates synchronized with the screen refresh rate, improving performance and battery life.
📊 **Measured Improvement:** We ran a Playwright script measuring performance through Chrome DevTools Protocol (`Performance.getMetrics`) over a 5-second interval during the auto-scroll animation.
- **Baseline:** Total TaskDuration across 5 seconds was 1.2869s.
- **Optimized:** Total TaskDuration across 5 seconds was 0.9523s.
- **Result:** ~26% reduction in main thread task execution time for the scroll animation, yielding smoother frame delivery.

*Note: Also applied the transparent 1x1 GIF fix to the lightbox img `src` based on memory instructions to avoid `src-not-empty` warnings.*
