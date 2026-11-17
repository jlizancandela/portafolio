import { test, expect } from "@playwright/test";

// Las fuentes cambian el ancho del texto. Sin esperarlas, lo que se mide no es
// el layout que ve una persona (y los íconos de Material Symbols pueden estar
// mostrando su ligadura como texto, que es mucho más ancho).
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("no desborda horizontalmente", async ({ page }) => {
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));

  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
});

test("el header entra completo en el viewport", async ({ page }) => {
  const leaks = await page.evaluate(() => {
    const pill = document.querySelector(".nav-pill");
    if (!pill) return ["no existe .nav-pill"];

    const bounds = pill.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const found: string[] = [];
    if (bounds.left < 0 || bounds.right > viewport) found.push("nav-pill fuera del viewport");

    for (const child of [...pill.children]) {
      const box = child.getBoundingClientRect();
      if (box.width === 0) continue;
      if (box.right > bounds.right + 0.5 || box.left < bounds.left - 0.5) {
        found.push((child as HTMLElement).className || child.tagName.toLowerCase());
      }
    }

    return found;
  });

  expect(leaks).toEqual([]);
});

test("las columnas no se salen de su grilla", async ({ page }) => {
  const leaks = await page.evaluate(() => {
    const grids = [".hero-grid", ".contact-grid", ".skills-grid", ".projects-list"];
    const found: string[] = [];

    for (const selector of grids) {
      const grid = document.querySelector(selector);
      if (!grid) continue;

      const bounds = grid.getBoundingClientRect();
      for (const child of [...grid.children]) {
        const box = child.getBoundingClientRect();
        if (box.width === 0) continue;
        if (box.right > bounds.right + 0.5 || box.left < bounds.left - 0.5) {
          found.push(`${selector} > ${(child as HTMLElement).className}`);
        }
      }
    }

    return found;
  });

  expect(leaks).toEqual([]);
});

test("la foto del hero reserva su espacio, es cuadrada y tiene texto alternativo", async ({ page }) => {
  const img = page.locator(".hero-photo-img");
  await expect(img).toHaveAttribute("alt", /Jorge Lizán/);

  const attrs = await img.evaluate((el) => ({
    width: Number(el.getAttribute("width")),
    height: Number(el.getAttribute("height")),
  }));
  expect(attrs.width).toBeGreaterThan(0);
  expect(attrs.height).toBeGreaterThan(0);

  const frame = await page.locator(".hero-photo-frame").boundingBox();
  expect(frame).not.toBeNull();
  expect(Math.abs(frame!.width - frame!.height)).toBeLessThanOrEqual(1);

  const photo = await img.boundingBox();
  expect(photo!.width).toBeGreaterThan(0);
  expect(photo!.height).toBeGreaterThan(0);
});

test("el hero cubre el alto disponible del viewport inicial sin asomar la siguiente sección", async ({ page }) => {
  const metrics = await page.evaluate(() => {
    const hero = document.querySelector(".hero");
    const skills = document.querySelector("#habilidades");
    if (!hero || !skills) return null;

    const heroRect = hero.getBoundingClientRect();
    const skillsRect = skills.getBoundingClientRect();

    return {
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      heroBottom: heroRect.bottom,
      skillsTop: skillsRect.top,
    };
  });

  expect(metrics).not.toBeNull();
  expect(metrics!.scrollY).toBe(0);
  expect(metrics!.heroBottom).toBeGreaterThanOrEqual(metrics!.viewportHeight - 1);
  expect(metrics!.skillsTop).toBeGreaterThanOrEqual(metrics!.viewportHeight - 1);
});

test("el indicador de scroll es visible, apunta a habilidades y no desborda del hero", async ({ page }) => {
  const scrollLink = page.locator(".hero-scroll");
  await expect(scrollLink).toBeVisible();
  await expect(scrollLink).toHaveAttribute("href", "#habilidades");

  const bounds = await page.evaluate(() => {
    const hero = document.querySelector(".hero");
    const link = document.querySelector(".hero-scroll");
    if (!hero || !link) return null;

    const heroRect = hero.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    return {
      hero: {
        left: heroRect.left,
        right: heroRect.right,
        top: heroRect.top,
        bottom: heroRect.bottom,
      },
      link: {
        left: linkRect.left,
        right: linkRect.right,
        top: linkRect.top,
        bottom: linkRect.bottom,
        width: linkRect.width,
        height: linkRect.height,
      },
    };
  });

  expect(bounds).not.toBeNull();
  expect(bounds!.link.width).toBeGreaterThan(0);
  expect(bounds!.link.height).toBeGreaterThan(0);
  expect(bounds!.link.left).toBeGreaterThanOrEqual(bounds!.hero.left - 0.5);
  expect(bounds!.link.right).toBeLessThanOrEqual(bounds!.hero.right + 0.5);
  expect(bounds!.link.top).toBeGreaterThanOrEqual(bounds!.hero.top - 0.5);
  expect(bounds!.link.bottom).toBeLessThanOrEqual(bounds!.hero.bottom + 0.5);
});
