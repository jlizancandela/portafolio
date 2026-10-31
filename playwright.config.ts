import { defineConfig } from "@playwright/test";

// Los tests corren contra el build de producción (`astro preview`), que es lo
// que efectivamente se despliega, no contra el dev server.
const port = 4321;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    // En CI el build es un paso aparte y con su propio error legible; acá
    // alcanza con servir lo ya construido.
    command: process.env.CI
      ? `npm run preview -- --port ${port}`
      : `npm run build && npm run preview -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "escritorio-1280",
      use: { viewport: { width: 1280, height: 800 } },
    },
    {
      name: "movil-360",
      use: { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true },
    },
    {
      // El ancho más chico que se ve en un teléfono real (iPhone SE, Galaxy Fold).
      name: "movil-320",
      use: { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true },
    },
  ],
});
