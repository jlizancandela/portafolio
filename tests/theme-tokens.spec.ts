import { test, expect } from "@playwright/test";

/*
 * El sitio tiene dos caminos para el tema oscuro: `data-theme="dark"` (lo elige la
 * persona en el conmutador) y `data-theme="system"` con el sistema en oscuro (el
 * defecto de quien nunca tocó el conmutador). Son dos bloques distintos con los
 * mismos valores, y ya se separaron una vez: el bloque del sistema se quedó sin
 * `--outline-variant`, así que las tarjetas y el header mostraban una hairline
 * lavanda clara sobre el fondo casi negro.
 *
 * Este test fija el invariante: los dos caminos declaran exactamente los mismos
 * tokens. Los valores los cubre `theme-contrast.spec.ts`.
 */

test("las dos capas del tema oscuro declaran los mismos tokens", async ({ page }) => {
  await page.goto("/");

  const layers = await page.evaluate(() => {
    const propertiesOf = (rule: CSSStyleRule) =>
      Array.from(rule.style).filter((name) => name.startsWith("--"));
    // El CSSOM serializa el selector con comillas dobles aunque la hoja use simples.
    const normalized = (rule: CSSStyleRule) => rule.selectorText.replace(/["']/g, "");

    let explicit: string[] | null = null;
    const system: string[] = [];

    for (const sheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSStyleRule && normalized(rule) === "html[data-theme=dark]") {
          explicit = propertiesOf(rule);
        }
        if (rule instanceof CSSMediaRule) {
          for (const inner of Array.from(rule.cssRules)) {
            if (inner instanceof CSSStyleRule && normalized(inner) === "html[data-theme=system]") {
              system.push(...propertiesOf(inner));
            }
          }
        }
      }
    }

    return { explicit: (explicit ?? []).sort(), system: [...new Set(system)].sort() };
  });

  expect(layers.explicit.length).toBeGreaterThan(0);
  expect(layers.system).toEqual(layers.explicit);
});
