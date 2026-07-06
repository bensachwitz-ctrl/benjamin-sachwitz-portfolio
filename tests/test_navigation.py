import os
import pytest

def test_togglenav(page):
    # Setup viewport (from memory, must use mobile viewport)
    page.set_viewport_size({"width": 375, "height": 667})

    file_path = f"file://{os.getcwd()}/index.html"
    page.goto(file_path)

    # Wait for loader to disappear (from memory, 4000ms timeout)
    page.wait_for_timeout(4500)

    ham = page.locator('#ham')
    nav_links = page.locator('#navLinks')

    # Check initial state
    assert 'open' not in (ham.get_attribute('class') or "")
    assert 'open' not in (nav_links.get_attribute('class') or "")

    # Click the hamburger menu
    ham.click()

    # Check state after click
    assert 'open' in (ham.get_attribute('class') or "")
    assert 'open' in (nav_links.get_attribute('class') or "")

    # Click again to close
    ham.click()

    # Check state after second click
    assert 'open' not in (ham.get_attribute('class') or "")
    assert 'open' not in (nav_links.get_attribute('class') or "")

def test_nav_links_close_menu(page):
    # Setup viewport
    page.set_viewport_size({"width": 375, "height": 667})

    file_path = f"file://{os.getcwd()}/index.html"
    page.goto(file_path)

    page.wait_for_timeout(4500)

    ham = page.locator('#ham')
    nav_links = page.locator('#navLinks')

    # Open menu
    ham.click()
    assert 'open' in (ham.get_attribute('class') or "")

    # Click a link inside nav (it has class .nav-links)
    first_link = page.locator('.nav-links a').first
    first_link.click()

    # Check if menu closes
    assert 'open' not in (ham.get_attribute('class') or "")
    assert 'open' not in (nav_links.get_attribute('class') or "")
