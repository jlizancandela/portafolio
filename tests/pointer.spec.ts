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

test("el hero aplica la rejilla radial, animaciones ambientales y entrada escalonada con backwards", async ({ page }) => {
  await page.goto("/");

  const heroEffects = await page.evaluate(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return null;

    const before = getComputedStyle(hero, "::before");
    const animatedSelectors = [
      ".hero-ambient--1",
      ".hero-ambient--2",
      ".hero-photo-badge--open",
      ".hero-photo-badge--stack",
      ".hero-title-grad",
      ".hero-scroll-icon",
    ];
    const staggeredSelectors = [
      ".hero-pill",
      ".hero-title",
      ".hero-lead",
      ".hero-actions",
      ".hero-socials",
      ".hero-photo",
    ];

    return {
      beforeBackground: before.backgroundImage,
      beforePointerEvents: before.pointerEvents,
      animated: animatedSelectors.map((selector) => {
        const el = document.querySelector(selector);
        return { selector, animationName: el ? getComputedStyle(el).animationName : null };
      }),
      staggered: staggeredSelectors.map((selector) => {
        const el = document.querySelector(selector);
        return { selector, animationFillMode: el ? getComputedStyle(el).animationFillMode : null };
      }),
    };
  });

  expect(heroEffects).not.toBeNull();
  expect(heroEffects!.beforeBackground).toContain("linear-gradient");
  expect(heroEffects!.beforePointerEvents).toBe("none");

  for (const item of heroEffects!.animated) {
    expect(item.animationName, `${item.selector} sin animación`).not.toBeNull();
    expect(item.animationName, `${item.selector} sin animación`).not.toBe("none");
  }

  for (const item of heroEffects!.staggered) {
    expect(item.animationFillMode, `${item.selector} no usa backwards`).toBe("backwards");
  }
});

test("las animaciones del hero no bloquean el hover de botones ni de la fotografía", async ({ page }, testInfo) => {
  test.skip(testInfo.project.use.hasTouch === true, "en táctil no hay hover que probar");

  await page.goto("/");
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished)
    )
  );

  const btnPrimary = page.locator(".btn-primary");
  await btnPrimary.hover();
  await expect(btnPrimary).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -2)");

  const photoFrame = page.locator(".hero-photo-frame");
  await photoFrame.hover();
  await expect(page.locator(".hero-photo-img")).toHaveCSS("transform", "matrix(1.05, 0, 0, 1.05, 0, 0)");
});

test("prefers-reduced-motion neutraliza las animaciones del hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const reduced = await page.evaluate(() => {
    return [".hero-ambient--1", ".hero-photo-badge--open", ".hero-title"].map((selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const style = getComputedStyle(el);
      return {
        selector,
        iterationCount: style.animationIterationCount,
        duration: Number.parseFloat(style.animationDuration),
      };
    });
  });

  for (const item of reduced) {
    expect(item).not.toBeNull();
    expect(item!.iterationCount, `${item!.selector} sigue repitiendo`).toBe("1");
    expect(item!.duration, `${item!.selector} excede duración reducida`).toBeLessThanOrEqual(0.001);
  }
});
