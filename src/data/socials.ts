export interface SocialLink {
  label: string;
  handle: string;
  href: string;
  icon: string;
  /**
   * Lo que el enlace dice de sí mismo al pasar el puntero: el destino y, si
   * aplica, que abre otra pestaña. El texto visible del enlace es corto
   * ("GitHub", "Ver Demo"), así que el detalle va acá.
   */
  title: string;
  /** El enlace abre otra pestaña. */
  target?: "_blank";
  /** Va junto al `target`: sin destino nuevo no hay ventana ajena que abrir. */
  rel?: "noopener noreferrer";
}

/**
 * Los enlaces sociales del sitio, en un solo lugar. El hero, el contacto y el
 * footer los muestran; antes cada componente llevaba su propia copia y un
 * cambio de destino tenía que tocarse tres veces.
 */
export const socials: SocialLink[] = [
  {
    label: "GitHub",
    handle: "jlizancandela",
    href: "https://github.com/jlizancandela",
    icon: "code",
    title: "Abrir GitHub en una pestaña nueva: github.com/jlizancandela",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    label: "LinkedIn",
    handle: "in/jlizancandela",
    href: "https://www.linkedin.com/in/jlizancandela/",
    icon: "work",
    title: "Abrir LinkedIn en una pestaña nueva: linkedin.com/in/jlizancandela",
    target: "_blank",
    rel: "noopener noreferrer",
  },
];

/**
 * El email no lleva `target`: un `mailto:` con `_blank` abre una pestaña en
 * blanco que no lleva a ningún lado.
 */
export const emailLink: SocialLink = {
  label: "Email",
  handle: "jlizancandela@gmail.com",
  href: "mailto:jlizancandela@gmail.com",
  icon: "mail",
  title: "Escribir un email a jlizancandela@gmail.com",
};
