import { test, expect } from "@playwright/test";

test("Safari journey preserves the six approved stages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("CivicAscent AI")).toBeVisible();

  const steps = [
    "ARRIVAL AT THE LODGE",
    "EXPLORE THE ENVIRONMENT",
    "START HERE ACTIVATION",
    "AI LEARNING DEMONSTRATION",
    "LIVING AI LAB TRANSITION",
    "RETURN TO LODGE / NEXT CHOICE"
  ];

  for (let i = 0; i < steps.length; i += 1) {
    await expect(page.getByText(new RegExp(steps[i], "i"))).toBeVisible();
    if (i < steps.length - 1) {
      const primary = page.locator(".primary-action");
      await expect(primary).toBeVisible();
      await primary.click();
    }
  }

  await expect(page.getByRole("button", { name: "Explore More" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Learning Paths" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Programs" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Community" })).toBeVisible();
});

test("keyboard focus and reduced-motion path remain usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();

  await expect(page.locator(".safari-shell")).toHaveClass(/reduced-motion/);
  await expect(page.getByRole("button", { name: /Start Here/i })).toBeVisible();
});

test("mobile viewport keeps the current scene actionable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const primary = page.locator(".primary-action");
  await expect(primary).toBeVisible();
  const box = await primary.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
});
