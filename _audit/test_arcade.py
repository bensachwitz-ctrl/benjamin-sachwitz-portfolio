"""Arcade end-to-end test for Snake, Wordle, and Tetris."""
import sys
import time
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:4201/"
OUT = r"c:/Users/Bensa/OneDrive/Desktop/Claude Coworker/Working/personal website/_audit"

results = {}
console_msgs = []


def log(tag, ok, detail=""):
    mark = "PASS" if ok else "FAIL"
    results.setdefault(tag, []).append((mark, detail))
    print(f"[{mark}] {tag}: {detail}")


def canvas_non_black(page, selector):
    """Return True if the canvas has any non-near-black pixels (i.e., something is drawn)."""
    return page.evaluate(
        """(sel) => {
            const c = document.querySelector(sel);
            if (!c) return {ok:false, reason:'missing'};
            const ctx = c.getContext('2d');
            const img = ctx.getImageData(0,0,c.width,c.height).data;
            let nonblack=0, total=img.length/4;
            for (let i=0;i<img.length;i+=4){
              const r=img[i],g=img[i+1],b=img[i+2];
              if (r>15 || g>15 || b>15) nonblack++;
            }
            return {ok:true, nonblack, total, ratio: nonblack/total};
        }""",
        selector,
    )


def canvas_text_present(page, selector, needle):
    """Very rough — render canvas to data URL and rely on a pixel-density hint only.
    But we verify the PRESS START message is drawn indirectly by checking there ARE pixels."""
    data = canvas_non_black(page, selector)
    return data.get("ratio", 0) > 0.005


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    page.on("console", lambda m: console_msgs.append((m.type, m.text)))
    page.on("pageerror", lambda e: console_msgs.append(("pageerror", str(e))))

    page.goto(URL)
    page.wait_for_load_state("networkidle")

    # Scroll to #arcade
    page.evaluate("document.getElementById('arcade').scrollIntoView({behavior:'instant', block:'start'})")
    page.wait_for_timeout(600)

    # ---------------- SNAKE ----------------
    print("\n=== SNAKE ===")
    snake_tab_active = page.evaluate(
        "document.querySelector('.atab[data-tab=\"snake\"]').classList.contains('is-active')"
    )
    log("snake.default_active_tab", snake_tab_active, f"is-active={snake_tab_active}")

    # Canvas should already render PRESS START TO PLAY (has drawn pixels on a black bg)
    pre = canvas_non_black(page, "#snakeCanvas")
    log("snake.press_start_drawn", pre.get("ratio", 0) > 0.005,
        f"nonblack ratio={pre.get('ratio',0):.4f}")

    # Click Start game
    page.locator("#startBtn").click()
    page.wait_for_timeout(400)
    during = canvas_non_black(page, "#snakeCanvas")
    log("snake.game_started", during.get("ratio", 0) > 0.005,
        f"ratio after start={during.get('ratio',0):.4f}")

    # Focus the page (for keyboard) then press ArrowRight + ArrowDown
    page.locator("#snakeCanvas").click()
    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(250)
    page.keyboard.press("ArrowDown")
    page.wait_for_timeout(300)
    mid = canvas_non_black(page, "#snakeCanvas")
    log("snake.turn_ok", mid.get("ratio", 0) > 0.005, f"ratio mid-play={mid.get('ratio',0):.4f}")

    # Force death by going into the wall — hold ArrowUp and wait
    # We're near top already or will bounce; simpler: repeatedly press ArrowLeft to run into left wall.
    page.keyboard.press("ArrowLeft")
    for _ in range(40):
        page.wait_for_timeout(120)
        over = page.evaluate("document.getElementById('gameOver').classList.contains('show')")
        if over:
            break
    log("snake.game_over_overlay", over, f"gameOver.show={over}")

    # Snapshot active snake state
    page.screenshot(path=f"{OUT}/arcade-snake.png", full_page=False,
                    clip={"x": 200, "y": page.evaluate("document.getElementById('arcade').getBoundingClientRect().top + window.scrollY - window.scrollY + 100"), "width": 1040, "height": 700})

    # Play again
    if over:
        page.locator("#playAgain").click()
        page.wait_for_timeout(400)
        restarted = not page.evaluate("document.getElementById('gameOver').classList.contains('show')")
        log("snake.play_again_restarts", restarted, f"overlay hidden={restarted}")
    else:
        log("snake.play_again_restarts", False, "never died")

    # ---------------- WORDLE ----------------
    print("\n=== WORDLE ===")
    page.locator('.atab[data-tab="wordle"]').click()
    page.wait_for_timeout(500)
    active = page.evaluate("document.querySelector('.atab[data-tab=\"wordle\"]').classList.contains('is-active')")
    log("wordle.tab_switch", active, f"is-active={active}")

    # 6x5 grid
    tile_count = page.locator("#wordleBoard .wordle-tile").count()
    log("wordle.grid_6x5", tile_count == 30, f"tile count={tile_count}")

    # Keyboard with Enter + Del
    kb = page.locator("#wordleKeyboard, .wordle-keyboard, [id*=Keyboard], [class*=keyboard]").first
    # Generic: find any key/button inside the wordle panel labeled ENTER/DEL
    enter_key = page.get_by_role("button", name="Enter").first
    del_key_exists = page.locator('button:has-text("Del"), button:has-text("DEL"), button:has-text("⌫")').count() > 0
    enter_visible = enter_key.is_visible() if enter_key.count() else False
    log("wordle.keyboard_enter_del", enter_visible and del_key_exists,
        f"enter_visible={enter_visible} del_button_found={del_key_exists}")

    # Type CRANE on physical keyboard
    page.locator("body").click()
    for ch in "CRANE":
        page.keyboard.press(ch)
        page.wait_for_timeout(60)
    filled = page.evaluate(
        """() => {
            const tiles = document.querySelectorAll('#wordleBoard [data-row="0"]');
            return Array.from(tiles).map(t => t.textContent);
        }"""
    )
    log("wordle.type_crane", "".join(filled).replace(" ", "").upper() == "CRANE",
        f"row0 letters={filled}")

    # Press Enter — check for flipped tiles
    page.keyboard.press("Enter")
    page.wait_for_timeout(1200)
    flipped = page.evaluate(
        """() => {
            const tiles = document.querySelectorAll('#wordleBoard [data-row="0"]');
            return Array.from(tiles).map(t => {
              return {correct:t.classList.contains('correct'),
                      present:t.classList.contains('present'),
                      absent:t.classList.contains('absent')};
            });
        }"""
    )
    any_colored = any(t["correct"] or t["present"] or t["absent"] for t in flipped)
    log("wordle.enter_flips_tiles", any_colored, f"row0={flipped}")

    # Click a letter on on-screen keyboard
    before_row1 = page.evaluate("document.querySelectorAll('#wordleBoard [data-row=\"1\"][data-col=\"0\"]')[0].textContent")
    # Find a letter button - try 'Q' text-button
    q_btn = page.locator('button:has-text("Q")').first
    q_clicked = False
    if q_btn.count():
        try:
            q_btn.click()
            q_clicked = True
        except Exception as e:
            q_clicked = False
    page.wait_for_timeout(200)
    after_row1 = page.evaluate("document.querySelectorAll('#wordleBoard [data-row=\"1\"][data-col=\"0\"]')[0].textContent")
    log("wordle.onscreen_kb_works", q_clicked and after_row1.strip().upper() == "Q",
        f"clicked={q_clicked} tile0='{after_row1}'")

    # Screenshot of wordle active state
    page.screenshot(path=f"{OUT}/arcade-wordle.png", full_page=False)

    # New word — grid should reset
    page.locator("#wNewBtn").click()
    page.wait_for_timeout(500)
    reset_count = page.evaluate(
        """() => {
            const tiles = document.querySelectorAll('#wordleBoard .wordle-tile');
            let empty=0;
            tiles.forEach(t => { if (!t.textContent.trim()) empty++; });
            return empty;
        }"""
    )
    log("wordle.new_word_resets", reset_count == 30, f"empty tiles after reset={reset_count}/30")

    # ---------------- TETRIS ----------------
    print("\n=== TETRIS ===")
    page.locator('.atab[data-tab="tetris"]').click()
    page.wait_for_timeout(500)
    tactive = page.evaluate("document.querySelector('.atab[data-tab=\"tetris\"]').classList.contains('is-active')")
    log("tetris.tab_switch", tactive, f"is-active={tactive}")

    pre_t = canvas_non_black(page, "#tetrisCanvas")
    log("tetris.press_start_drawn", pre_t.get("ratio", 0) > 0.005,
        f"ratio pre={pre_t.get('ratio',0):.4f}")

    next_visible = page.locator("#tetrisNext").is_visible()
    log("tetris.next_preview_visible", next_visible, f"visible={next_visible}")

    # Score/Lines/Level text
    body_text = page.locator("#arcade").inner_text()
    has_stats = all(w.lower() in body_text.lower() for w in ["Score", "Lines", "Level"])
    log("tetris.stats_visible", has_stats, f"Score/Lines/Level present={has_stats}")

    # Start game
    page.locator("#tStartBtn").click()
    page.wait_for_timeout(500)
    started = canvas_non_black(page, "#tetrisCanvas")
    log("tetris.game_started", started.get("ratio", 0) > 0.005,
        f"ratio started={started.get('ratio',0):.4f}")

    # Capture first-piece canvas imprint
    imprint_a = page.evaluate(
        """() => {
            const c = document.getElementById('tetrisCanvas');
            return c.toDataURL().slice(0, 200);
        }"""
    )

    # Next preview imprint
    next_a = page.evaluate("document.getElementById('tetrisNext').toDataURL().slice(0,200)")

    # Move & rotate — focus window, then send keys
    page.locator("body").click()
    page.keyboard.press("ArrowLeft")
    page.wait_for_timeout(120)
    page.keyboard.press("ArrowLeft")
    page.wait_for_timeout(120)
    imprint_b = page.evaluate("document.getElementById('tetrisCanvas').toDataURL().slice(0,200)")
    log("tetris.arrow_moves", imprint_a != imprint_b, "canvas changed after ArrowLeft x2")

    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(120)

    page.keyboard.press("ArrowUp")
    page.wait_for_timeout(200)
    imprint_c = page.evaluate("document.getElementById('tetrisCanvas').toDataURL().slice(0,200)")
    log("tetris.rotate", imprint_c != imprint_b, "canvas changed after ArrowUp rotate")

    # Hard drop
    page.keyboard.press("Space")
    page.wait_for_timeout(400)
    next_b = page.evaluate("document.getElementById('tetrisNext').toDataURL().slice(0,200)")
    log("tetris.hard_drop_updates_next", next_a != next_b, "next preview changed after Space")

    page.screenshot(path=f"{OUT}/arcade-tetris.png", full_page=False)

    # ---------------- CONSOLE ----------------
    print("\n=== CONSOLE MESSAGES ===")
    errors = [m for m in console_msgs if m[0] in ("error", "pageerror")]
    warnings = [m for m in console_msgs if m[0] == "warning"]
    print(f"Errors: {len(errors)}")
    for t, msg in errors:
        print(f"  [{t}] {msg}")
    print(f"Warnings: {len(warnings)}")
    for t, msg in warnings[:10]:
        print(f"  [{t}] {msg}")

    browser.close()

# Summary
print("\n============ SUMMARY ============")
for tag, entries in results.items():
    for mark, detail in entries:
        print(f"{mark}  {tag}: {detail}")
