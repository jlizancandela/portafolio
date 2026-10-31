# Portafolio — Jorge Lizán

[![Astro](https://img.shields.io/badge/Astro-5.x-BC52EE?logo=astro&logoColor=fff)](https://astro.build)
[![Preact](https://img.shields.io/badge/Preact-10.x-673AB8?logo=preact&logoColor=fff)](https://preactjs.com)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=fff)](https://www.netlify.com)
[![Licencia](https://img.shields.io/badge/licencia-MIT-blue.svg)](LICENSE)

Portfolio personal de **Jorge Lizán**, desarrollador web junior. Presenta una selección de proyectos con enlaces a sus demos y repositorios, donde se encuentra la documentación técnica de cada aplicación.

👉 **[Ver portfolio](https://jorgelizancandela.com)**

---

## Tecnologías del portfolio

| Frontend | Integraciones | Herramientas |
|----------|---------------|--------------|
| Astro 5 | @astrojs/preact | Git y GitHub |
| Preact 10 | Netlify Forms | Netlify |
| CSS moderno | Honeypot antispam | Linux |

---

## Secciones

- **Presentación** — perfil profesional y accesos principales.
- **Habilidades** — herramientas y lenguajes con los que trabajo.
- **Proyectos** — selección de aplicaciones con demo y repositorio.
- **Contacto** — formulario mediante Netlify Forms.

---

## Proyectos destacados

| Proyecto | Descripción | Stack principal |
|----------|-------------|-----------------|
| [Reservas Peluquería](https://reservas.jorgelizancandela.com/) | Aplicación full stack para gestionar clientes, servicios y reservas. | PHP, Preact, MySQL, Docker |
| [CountryQuiz](https://countryquiz.jorgelizancandela.com/) | Juego de preguntas sobre países con estado global y consumo de APIs. | React, TypeScript, Zustand, Vitest |
| [Podólogos Pérez Guerrero](https://podologosperezguerrero.com/) | Sitio web profesional para una clínica de podología. | WordPress, PHP, JavaScript |
| [4linea](https://4linea.jorgelizancandela.com/) | Juego de Conecta 4 con oponente controlado mediante inteligencia artificial. | React, JavaScript, HTML, CSS |

La documentación detallada, las instrucciones de instalación y las decisiones técnicas se mantienen en el README de cada repositorio.

---

## Desarrollo local

```bash
npm install
npm run dev
```

El servidor de desarrollo se inicia en `http://localhost:4321`.

### Widget del chat

El asistente de Jorge se monta en `src/layouts/Layout.astro` y llega como dependencia de
git (`@jlizancandela/chatbox`). Necesita una variable de entorno **en el build**:

```bash
PUBLIC_CHATBOX_API_URL=https://api.jorgelizancandela.com npm run dev
```

El prefijo `PUBLIC_` no es decorativo: Astro solo entrega al navegador las variables con
ese prefijo, y el widget corre en el navegador. Sin la variable, el sitio se compila y se
sirve **sin chat** — no rompe, pero tampoco aparece.

En Netlify la variable vive en *Site configuration → Environment variables*, con scope
`Builds`.

### Otros comandos

```bash
npm run build
npm run preview
```

### Tests

El layout responsive está cubierto por un smoke de Playwright que corre en tres
viewports: 1280, 360 y 320 con touch. Cubre desbordes horizontales, el header, las
grillas, el menú móvil y el cursor propio en táctil.

```bash
npm test                            # construye el sitio y corre la suite
npx playwright install chromium     # una sola vez, si no tenés el navegador
```

Los specs viven en `tests/` y corren contra `astro preview` (el build real, no el dev
server). En GitHub Actions el job `layout` hace lo mismo en cada pull request y sube
el reporte como artifact si algo falla.

---

## Despliegue

El sitio se despliega automáticamente en **Netlify** desde la rama `master`.

---

## Licencia

MIT
