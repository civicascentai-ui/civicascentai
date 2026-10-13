import { test, expect } from '@playwright/test';

test('Spanish choice switches language and persists across reloads', async ({ page }) => {
  await page.goto('/index.html');
  const toggle = page.locator('#lang');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(toggle).toHaveText('ES');
  await toggle.click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('.hero h1.lang-es')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('.hero h1.lang-es')).toBeVisible();

  await page.locator('#lang').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#lang')).toHaveAttribute('aria-pressed', 'false');
});

test('homepage honors reduced-motion preference and keeps learner entry available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html');
  await expect(page.locator('body')).toHaveClass(/ready/);
  await expect(page.locator('a#enterVillage')).toBeVisible();
  await expect(page.locator('a#enterVillage')).toHaveAttribute('href', /village\.html/);
});

test('village menu Escape restores focus and blocks hidden links', async ({ page }) => {
  await page.goto('/village.html');
  const menu = page.locator('#menuBtn');
  const panel = page.locator('#menuPanel');

  await expect(panel).toHaveAttribute('aria-hidden', 'true');
  expect(await panel.evaluate(el => el.inert)).toBe(true);
  await menu.click();

  await expect(panel).toHaveAttribute('aria-hidden', 'false');
  expect(await panel.evaluate(el => el.inert)).toBe(false);
  await expect(page.locator('#closeMenu')).toBeFocused();
  await page.keyboard.press('Escape');

  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toHaveAttribute('aria-hidden', 'true');
  expect(await panel.evaluate(el => el.inert)).toBe(true);
});

test('seven learning destinations resolve to local pages', async ({ page, request }) => {
  await page.goto('/village.html');
  const links = page.getByRole('navigation', { name: 'Learning destinations' }).locator('a');
  await expect(links).toHaveCount(7);

  for (const href of await links.evaluateAll(nodes => nodes.map(el => el.getAttribute('href')))) {
    expect(href).toMatch(/^[a-z0-9-]+\.html$/);
    const response = await request.get('/' + href);
    expect(response.status(), href + ' must be available').toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  }
});

test('course purchase CTAs remain hosted by Stripe; browser QA never purchases', async ({ page }) => {
  const response = await page.goto('/course.html');
  expect(response?.ok()).toBeTruthy();
  const purchaseLinks = page.locator('a[href^="https://buy.stripe.com/"]');
  await expect(purchaseLinks).toHaveCount(2);

  const urls = await purchaseLinks.evaluateAll(nodes => nodes.map(el => el.href));
  for (const value of urls) {
    const checkout = new URL(value);
    expect(checkout.protocol).toBe('https:');
    expect(checkout.hostname).toBe('buy.stripe.com');
    expect(checkout.pathname.startsWith('/test_')).toBe(true);
  }

  await expect(page.getByRole('status', { name: 'Sandbox checkout warning' })).toContainText('INTERNAL QA PREVIEW ONLY');

  // We verify only destination metadata. No card is entered, payment submitted,
  // or learner entitlement inferred from this test.
  await expect(page.getByRole('heading', { name: 'Beginner Starter Digital Kit' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Beginner Facilitator Kit' })).toBeVisible();
});

test('learning village navigation stays inside viewport without horizontal overflow', async ({ page }) => {
  await page.goto('/village.html');
  const result = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const links = [...document.querySelectorAll('.waypoints a')].map(el => {
      const box = el.getBoundingClientRect();
      return { name: el.textContent.trim(), left: box.left, right: box.right };
    });
    return { width, links };
  });
  for (const link of result.links) {
    expect(link.left, link.name + ' is clipped on left').toBeGreaterThanOrEqual(-1);
    expect(link.right, link.name + ' is clipped on right').toBeLessThanOrEqual(result.width + 1);
  }
});
