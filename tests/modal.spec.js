const { test, expect } = require('@playwright/test');
const path = require('path');

test('openModal() and closeModal() functions correctly', async ({ page }) => {
  // Set viewport to desktop
  await page.setViewportSize({ width: 1280, height: 720 });

  // Go to local index.html
  const fileUrl = `file://${path.resolve('index.html')}`;
  await page.goto(fileUrl);

  // Wait for the initial 4-second loading animation
  await page.waitForTimeout(4500);

  // Focus on an element before opening the modal
  await page.focus('a.btn.bp');

  // Click the book a call button to trigger openModal
  await page.click('a.btn.bp');

  // Wait for modal to be open
  const modal = page.locator('#bookModal');
  await expect(modal).toHaveClass(/open/);

  // Verify modal attributes
  await expect(modal).toHaveAttribute('role', 'dialog');
  await expect(modal).toHaveAttribute('aria-modal', 'true');

  // Verify body style
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  expect(bodyOverflow).toBe('hidden');

  // Wait for setTimeout to execute focus
  await page.waitForTimeout(200);

  // Verify that focus is on the first focusable element inside the modal
  const activeClass = await page.evaluate(() => document.activeElement.className);
  expect(activeClass).toBe('modal-close');

  // Test closing the modal sets the focus back to the previously focused element
  await page.click('button.modal-close');
  await page.waitForTimeout(200);

  const bodyOverflowAfter = await page.evaluate(() => document.body.style.overflow);
  expect(bodyOverflowAfter).toBe('');
  await expect(modal).not.toHaveClass(/open/);

  // The previously focused element was "a.btn.bp"
  const focusedHref = await page.evaluate(() => document.activeElement.href);
  expect(focusedHref).toContain('javascript:void(0)');
});
