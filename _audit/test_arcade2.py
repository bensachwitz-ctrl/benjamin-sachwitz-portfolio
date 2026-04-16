"""Sharper investigation of the failing cases + capture the pageerror source."""
import sys, json
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:4201/"
OUT = r"c:/Users/Bensa/OneDrive/Desktop/Claude Coworker/Working/personal website/_audit"

console_msgs = []
page_errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    page.on("console", lambda m: console_msgs.append((m.type, m.text, m.location)))
    page.on("pageerror", lambda e: page_errors.append(str(e) + "\n" + (e.stack or "")))

    page.goto(URL)
    page.wait_for_load_state("networkidle")
    page.evaluate("document.getElementById('arcade').scrollIntoView()")
    page.wait_for_timeout(800)

    # --- Pre-Start snake canvas pixel check (PRESS START TO PLAY text) ---
    pre_snake = page.evaluate(
        """() => {
            const c = document.getElementById('snakeCanvas');
            const ctx = c.getContext('2d');
            const img = ctx.getImageData(0,0,c.width,c.height).data;
            let light=0;
            for (let i=0;i<img.length;i+=4){
              if (img[i]>40 || img[i+1]>40 || img[i+2]>40) light++;
            }
            return {light, total: img.length/4};
        }"""
    )
    print("SNAKE pre-start light pixels:", pre_snake)

    # --- Snake: cause death reliably ---
    # Start
    page.locator("#startBtn").click()
    page.wait_for_timeout(300)
    # Force direction up and let it run into top wall
    page.locator("#snakeCanvas").click()
    page.keyboard.press("ArrowUp")
    died = False
    for i in range(120):  # up to ~12s
        page.wait_for_timeout(100)
        if page.evaluate("document.getElementById('gameOver').classList.contains('show')"):
            died = True
            break
    print("SNAKE died after ArrowUp hold:", died, "iter=", i)

    if died:
        # Play again
        page.locator("#playAgain").click()
        page.wait_for_timeout(500)
        hidden = not page.evaluate("document.getElementById('gameOver').classList.contains('show')")
        print("SNAKE play again hid overlay:", hidden)

    # --- Wordle test: per-tile textContent with direct selector ---
    page.locator('.atab[data-tab="wordle"]').click()
    page.wait_for_timeout(400)
    # Type via keyboard
    page.locator("body").click()
    for ch in "CRANE":
        page.keyboard.press(ch)
        page.wait_for_timeout(50)
    row0 = page.evaluate(
        """() => {
            const out=[];
            for (let c=0;c<5;c++){
              const t=document.querySelector(`#wordleBoard [data-row="0"][data-col="${c}"]`);
              out.push(t ? t.textContent : null);
            }
            return out;
        }"""
    )
    print("WORDLE row0 per-tile:", row0)

    # --- Tetris investigation ---
    page.locator('.atab[data-tab="tetris"]').click()
    page.wait_for_timeout(500)
    # Pre-start canvas pixels
    pre_t = page.evaluate(
        """() => {
            const c = document.getElementById('tetrisCanvas');
            const ctx = c.getContext('2d');
            const img = ctx.getImageData(0,0,c.width,c.height).data;
            let light=0;
            for (let i=0;i<img.length;i+=4){
              if (img[i]>40 || img[i+1]>40 || img[i+2]>40) light++;
            }
            return {light, total: img.length/4};
        }"""
    )
    print("TETRIS pre-start light pixels:", pre_t)

    # Start
    page.locator("#tStartBtn").click()
    page.wait_for_timeout(500)
    before = page.evaluate("document.getElementById('tetrisCanvas').toDataURL()")
    print("TETRIS canvas URL length before moves:", len(before))

    page.locator("#tetrisCanvas").click()  # focus
    page.keyboard.press("ArrowLeft")
    page.wait_for_timeout(200)
    page.keyboard.press("ArrowLeft")
    page.wait_for_timeout(200)
    after = page.evaluate("document.getElementById('tetrisCanvas').toDataURL()")
    print("TETRIS canvas changed after ArrowLeft x2:", before != after)

    page.keyboard.press("ArrowUp")
    page.wait_for_timeout(200)
    after2 = page.evaluate("document.getElementById('tetrisCanvas').toDataURL()")
    print("TETRIS canvas changed after ArrowUp:", after != after2)

    next_before = page.evaluate("document.getElementById('tetrisNext').toDataURL()")
    page.keyboard.press("Space")
    page.wait_for_timeout(600)
    next_after = page.evaluate("document.getElementById('tetrisNext').toDataURL()")
    print("TETRIS next preview changed after Space:", next_before != next_after)

    # Give tetris a real try with window-level keyboard listener
    # Also test if keydown events are being received:
    test_key = page.evaluate(
        """() => {
           let got=null;
           const h=(e)=>{got=e.key;};
           window.addEventListener('keydown', h, {once:true});
           return new Promise(res=>setTimeout(()=>{ res(got); }, 50));
        }"""
    )
    print("TETRIS handler test (should be null before press):", test_key)

    # Now dispatch synthetic key directly to window
    for key in ["ArrowLeft", "ArrowRight", "ArrowUp", " "]:
        page.evaluate(
            """(k) => {
                window.dispatchEvent(new KeyboardEvent('keydown', {key:k, code: k===' '?'Space':k, bubbles:true}));
            }""",
            key,
        )
        page.wait_for_timeout(200)

    canv_final = page.evaluate("document.getElementById('tetrisCanvas').toDataURL()")
    print("TETRIS canvas changed vs initial after synthetic dispatch:", before != canv_final)

    # Print page errors
    print("\n--- PAGE ERRORS ---")
    for e in page_errors:
        print(e)
    print("\n--- CONSOLE ERRORS ---")
    for t, m, loc in console_msgs:
        if t == "error":
            print(t, m, loc)

    browser.close()
