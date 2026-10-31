import { test, expect } from "@playwright/test";

/*
 * El widget del chat toma sus colores del mapeo de `portfolio.css`
 * (`--chatbox-host-*`), así que la paleta del sitio pasa a ser la del widget. Este
 * test mide el valor resuelto en el navegador y lo contrasta contra los pisos del
 * contrato del chatbox (RF-F61): 4.5:1 para texto y 3:1 para componentes.
 *
 * El widget no se monta en CI porque no hay `PUBLIC_CHATBOX_API_URL`; por eso el
 * test lee los tokens resueltos en `body` en vez de pintar el panel. Que el widget
 * los consuma lo prueba la suite del chatbox.
 */

type Rgb = [number, number, number];

const parse = (value: string): Rgb => {
  const hex = value.trim().match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const number = Number.parseInt(hex[1], 16);
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
  }
  const rgb = value.trim().match(/^rgba?\(([^)]+)\)$/i);
  if (!rgb) throw new Error(`color inesperado: "${value}"`);
  const [r, g, b] = rgb[1].split(/[,/\s]+/).map(Number);
  return [r, g, b];
};

const channel = (value: number) => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = ([r, g, b]: Rgb) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

const ratio = (a: Rgb, b: Rgb) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

const ROLES = [
  "text",
  "surface",
  "primary",
  "link",
  "border",
  "focus",
  "error",
  "surface-subtle",
  "surface-raised",
  "accent-container",
] as const;

type Role = (typeof ROLES)[number];

// El contrato de contraste del widget, repetido aquí a propósito: es la promesa
// que el sitio asume al mapear la paleta. Si el contrato del chatbox cambia, este
// test tiene que cambiar con él.
const PAIRS: { ink: Role; background: Role; floor: number }[] = [
  { ink: "text", background: "surface", floor: 4.5 },
  { ink: "text", background: "surface-subtle", floor: 4.5 },
  { ink: "text", background: "surface-raised", floor: 4.5 },
  { ink: "link", background: "surface", floor: 4.5 },
  { ink: "link", background: "surface-subtle", floor: 4.5 },
  { ink: "surface", background: "primary", floor: 4.5 },
  { ink: "surface", background: "accent-container", floor: 4.5 },
  { ink: "error", background: "surface", floor: 4.5 },
  { ink: "focus", background: "surface", floor: 3 },
  { ink: "focus", background: "surface-subtle", floor: 3 },
  { ink: "focus", background: "surface-raised", floor: 3 },
  { ink: "border", background: "surface", floor: 3 },
  { ink: "border", background: "surface-subtle", floor: 3 },
  { ink: "border", background: "surface-raised", floor: 3 },
  { ink: "primary", background: "surface-raised", floor: 3 },
];

async function openWithTheme(page: import("@playwright/test").Page, theme: string) {
  await page.addInitScript((value) => localStorage.setItem("portfolio-theme", value), theme);
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

test.describe("paleta del widget sobre la del sitio", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`el mapeo del chat cumple el contrato de contraste (${theme})`, async ({ page }) => {
      await openWithTheme(page, theme);

      const tokens = await page.evaluate((roles) => {
        const style = getComputedStyle(document.body);
        return Object.fromEntries(
          roles.map((role) => [role, style.getPropertyValue(`--chatbox-host-${role}`).trim()])
        );
      }, ROLES as unknown as string[]);

      for (const pair of PAIRS) {
        expect(
          ratio(parse(tokens[pair.ink]), parse(tokens[pair.background])),
          `${pair.ink} sobre ${pair.background}`
        ).toBeGreaterThanOrEqual(pair.floor);
      }
    });

    test(`el CTA principal es legible en el tema (${theme})`, async ({ page }) => {
      await openWithTheme(page, theme);

      const cta = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        return {
          ink: style.getPropertyValue("--on-primary-container").trim(),
          background: style.getPropertyValue("--primary-container").trim(),
        };
      });

      // 18 px semibold no llega al umbral de texto grande: el piso es 4.5:1.
      expect(ratio(parse(cta.ink), parse(cta.background))).toBeGreaterThanOrEqual(4.5);
    });
  }
});
