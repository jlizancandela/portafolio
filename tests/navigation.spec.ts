import { test, expect } from "@playwright/test";

test("el menú móvil abre, expone los enlaces y cierra al elegir uno", async ({ page }, testInfo) => {
  test.skip(testInfo.project.use.hasTouch !== true, "el menú desplegable solo existe en táctil");

  await page.goto("/");

  const toggle = page.locator("[data-nav-toggle]");
  const panel = page.locator("[data-nav-menu]");

  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.tap();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toBeVisible();

  const links = panel.locator(".nav-link");
  await expect(links).toHaveCount(4);
  for (const link of await links.all()) {
    const box = await link.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await links.nth(2).tap();
  await expect(panel).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(new URL(page.url()).hash).toBe("#proyectos");
});
