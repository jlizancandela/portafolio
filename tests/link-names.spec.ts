import { test, expect } from "@playwright/test";

/*
 * Guardas del nombre accesible de los enlaces.
 *
 * Los botones de proyecto dicen "Ver Demo" y "Código": cinco y cuatro
 * respectivamente, todos con el mismo texto. Quien navega por la lista de
 * enlaces oye "Ver Demo" cinco veces y no sabe de qué proyecto habla cada
 * uno. El nombre accesible de un enlace sale de su contenido, así que la
 * forma de arreglarlo es que el propio enlace diga a qué proyecto va.
 *
 * Ese texto va oculto a la vista (`.sr-only`): visible para la tecnología
 * asistiva —que también es la que lo lee en el móvil, donde no hay hover— y
 * ausente en pantalla, donde el nombre corto ya está.
 */

/*
 * El nombre accesible de un enlace, como lo calcula el navegador: el
 * `aria-label` si está, y si no el contenido, sin los iconos marcados como
 * decorativos. La cuenta se hace dentro de la página, así que va repetida en
 * cada evaluación: es código de test, y un test se lee mejor entero.
 */
test("los enlaces de proyecto no comparten nombre", async ({ page }) => {
  await page.goto("/");

  const nombres = await page.locator(".project-btn").evaluateAll((els) =>
    els.map((el) => {
      const aria = el.getAttribute("aria-label")?.trim();
      if (aria) return aria;

      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
      return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
    })
  );

  expect(nombres.length).toBeGreaterThan(1);
  expect(new Set(nombres).size, `nombres repetidos: ${nombres.join(" | ")}`).toBe(nombres.length);
});

test("el nombre de cada enlace de proyecto menciona su proyecto", async ({ page }) => {
  await page.goto("/");

  const tarjetas = await page.locator(".project-card").evaluateAll((cards) =>
    cards.map((card) => ({
      proyecto: card.querySelector(".project-name")?.textContent?.trim() ?? "",
      nombres: Array.from(card.querySelectorAll(".project-btn")).map((el) => {
        const aria = el.getAttribute("aria-label")?.trim();
        if (aria) return aria;

        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
        return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
      }),
    }))
  );

  expect(tarjetas.length).toBeGreaterThan(0);

  for (const tarjeta of tarjetas) {
    for (const nombre of tarjeta.nombres) {
      expect(nombre, `el enlace "${nombre}" no menciona ${tarjeta.proyecto}`).toContain(
        tarjeta.proyecto
      );
    }
  }
});

test("el texto para lectores de pantalla no ocupa espacio visible", async ({ page }) => {
  await page.goto("/");

  const cajas = await page.locator(".sr-only").evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { ancho: rect.width, alto: rect.height };
    })
  );

  expect(cajas.length).toBeGreaterThan(0);

  for (const caja of cajas) {
    expect(caja.ancho).toBeLessThanOrEqual(2);
    expect(caja.alto).toBeLessThanOrEqual(2);
  }
});
