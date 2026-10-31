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
