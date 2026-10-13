import { test, expect } from '@playwright/test';

test('homepage has a working, labeled entry to the learning village', async ({ page }) => {
  const response = await page.goto('/index.html');
  expect(response?.ok()).toBeTruthy();

  await expect(page.getByRole('heading', { name: /See what AI can do\./i })).toBeVisible();
  const entry = page.locator('a#enterVillage');
  await expect(entry).toHaveAttribute('href', /village\.html/);
  await entry.click();

  await expect(page).toHaveURL(/\/village\.html/);
  await expect(page.getByRole('heading', { name: /Choose where to explore\./i })).toBeVisible();
});

test('homepage skip link has a keyboard-focusable destination', async ({ page }) => {
  await page.goto('/index.html');
  const skip = page.locator('a.skip');
  await expect(skip).toHaveAttribute('href', '#enterVillage');
  await skip.focus();
  await expect(skip).toBeFocused();
  await expect(page.locator('#enterVillage')).toHaveCount(1);
});

test('village navigation opens and closes without trapping learners', async ({ page }) => {
  await page.goto('/village.html');
  await expect(page.getByRole('navigation', { name: 'Learning destinations' })).toBeVisible();

  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');

  const close = page.getByRole('button', { name: /close/i });
  await close.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});
