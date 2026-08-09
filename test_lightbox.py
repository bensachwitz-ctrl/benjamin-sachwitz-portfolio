import pytest
from playwright.sync_api import Page, expect
import os

def wait_for_loader_to_finish(page: Page):
    """Wait for the initial page loader animation to finish dynamically."""
    loader = page.locator('#pageLoader')
    if loader.is_visible():
        loader.wait_for(state='hidden', timeout=5000)

def test_openLightbox_js(page: Page):
    """Test the openLightbox JS function directly."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"file://{os.getcwd()}/index.html")

    wait_for_loader_to_finish(page)

    # We will simulate openLightbox via evaluate to make sure the function itself is tested
    img = page.locator('.pf img').first
    img.scroll_into_view_if_needed()

    # We call openLightbox directly with the element
    page.evaluate("el => openLightbox(el, 'Test Caption')", img.element_handle())

    lightbox = page.locator('#lightbox')
    expect(lightbox).to_have_class('lightbox open')

    lbImg = page.locator('#lbImg')
    # Use element.src to get absolute path as that's what gets set in the JS function
    expect(lbImg).to_have_attribute('src', img.evaluate("el => el.src"))
    expect(lbImg).to_have_attribute('alt', img.get_attribute('alt'))

    lbCap = page.locator('#lbCap')
    expect(lbCap).to_have_text('Test Caption')

    expect(page.locator('body')).to_have_css('overflow', 'hidden')

def test_closeLightbox_js(page: Page):
    """Test the closeLightbox JS function directly."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"file://{os.getcwd()}/index.html")

    wait_for_loader_to_finish(page)

    img = page.locator('.pf img').first

    # Open the lightbox directly
    page.evaluate("el => openLightbox(el, 'Test Caption')", img.element_handle())

    lightbox = page.locator('#lightbox')
    expect(lightbox).to_have_class('lightbox open')

    # Check close button works which calls closeLightbox()
    page.locator('.lightbox-close').click()

    expect(lightbox).not_to_have_class('lightbox open')

    body = page.locator('body')
    overflow = body.evaluate("el => window.getComputedStyle(el).overflow")
    assert overflow != 'hidden'
