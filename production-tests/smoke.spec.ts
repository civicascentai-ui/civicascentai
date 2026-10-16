import { test, expect } from '@playwright/test';

const routes = [
  '/', '/course.html', '/mentor.html', '/programs.html', '/register.html',
  '/veterans.html', '/es.html', '/free-ai-starter.html', '/living-ai-lab.html',
  '/practice-sandbox.html', '/consultation.html', '/capabilities.html',
  '/level2.html', '/learner-questions.html', '/curso-es.html', '/registro.html',
  '/learner-interest.html', '/safari-home.html', '/village.html',
  '/journey-learn.html', '/journey-try.html', '/journey-help.html',
  '/journey-continue.html'
];
for (const route of routes) {
  test('GET-only production smoke: ' + route, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    const response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('body')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    expect(overflow, 'horizontal overflow on ' + route).toBe(false);
    expect(errors, 'JS exceptions on ' + route).toEqual([]);
    // Intentionally no form submission, checkout, mutations or clicks.
  });
}
