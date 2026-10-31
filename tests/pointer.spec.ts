import { test, expect } from "@playwright/test";

test("el cursor propio solo existe donde hay ratón", async ({ page }, testInfo) => {
  await page.goto("/");

  const touch = testInfo.project.use.hasTouch === true;
  const display = await page.locator("[data-cursor]").evaluate((el) => getComputedStyle(el).display);
  const bodyCursor = await page.evaluate(() => getComputedStyle(document.body).cursor);

  expect(display).toBe(touch ? "none" : "block");
  // En táctil el cursor nativo nunca se oculta: no hay cursor que reemplazar.
  expect(bodyCursor).toBe(touch ? "auto" : "none");
});

test("las tarjetas de proyecto se elevan al pasar el ratón", async ({ page }, testInfo) => {
  test.skip(testInfo.project.use.hasTouch === true, "en táctil no hay hover que probar");

  await page.goto("/");
  const card = page.locator(".project-card").first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();

  // La animación de entrada usaba `both`, y su keyframe final pisaba este
  // transform para siempre.
  await expect(card).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -2)");
});
