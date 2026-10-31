import { test, expect } from "@playwright/test";

/*
 * Guardas del `title` de los enlaces.
 *
 * El texto visible de un enlace no siempre alcanza para decir adónde lleva: los
 * botones de proyecto dicen "Ver Demo" o "Código" sin decir de qué proyecto, y
 * nada avisa que los enlaces externos abren otra pestaña. El `title` es donde
 * vive esa información extra, así que se fija como contrato: todo enlace tiene
 * uno, aporta algo que su texto visible no dice, y los externos mencionan la
 * pestaña nueva.
 *
 * El `title` no cambia el nombre accesible del enlace (el texto visible manda),
 * así que esto no reemplaza un `aria-label`: es una capa complementaria para
 * quien navega con puntero.
 */

type LinkInfo = {
  href: string;
  target: string | null;
  title: string | null;
  text: string;
};

// El texto visible es el que queda al sacar los iconos: los ligatures de
// Material Symbols son texto en el DOM, pero nadie los ve ni los oye.
const readLinks = async (page: import("@playwright/test").Page): Promise<LinkInfo[]> => {
  await page.goto("/");

  return page.locator("a").evaluateAll((els) =>
    els
      // Los enlaces del widget de chat son de otro paquete: no son del sitio y
      // no tienen por qué seguir las reglas de esta página.
      .filter((el) => el.closest("astro-island") === null)
      .map((el) => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());

        return {
          href: el.getAttribute("href") ?? "",
          target: el.getAttribute("target"),
          title: el.getAttribute("title"),
          text: (clone.textContent ?? "").replace(/\s+/g, " ").trim(),
        };
      })
  );
};

test("todo enlace declara un title que aporta algo más que su texto visible", async ({ page }) => {
  const links = await readLinks(page);
  expect(links.length).toBeGreaterThan(0);

  for (const link of links) {
    const title = link.title?.trim() ?? "";
    expect(title, `falta el title de ${link.href}`).not.toBe("");
    expect(title, `el title de ${link.href} repite el texto visible`).not.toBe(link.text);
  }
});

test("los enlaces externos avisan que abren en otra pestaña", async ({ page }) => {
  const links = await readLinks(page);
  const externos = links.filter((link) => link.target === "_blank" && /^https?:/i.test(link.href));
  expect(externos.length).toBeGreaterThan(0);

  for (const link of externos) {
    expect(
      link.title ?? "",
      `el title de ${link.href} no avisa de la pestaña nueva`
    ).toContain("pestaña nueva");
  }
});

test("el enlace de email no abre una pestaña nueva", async ({ page }) => {
  const links = await readLinks(page);
  const mailto = links.filter((link) => link.href.toLowerCase().startsWith("mailto:"));
  expect(mailto.length).toBeGreaterThan(0);

  for (const link of mailto) {
    expect(link.target, `el mailto de ${link.href} abre una pestaña nueva`).toBeNull();
  }
});
