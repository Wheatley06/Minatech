// Iconos SVG propios en linea (sin dependencias externas), simples y
// consistentes con el estilo general de la plataforma.
const { createElement: h } = React;

function Icono({ children, size = 18 }) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    children
  );
}

const Icons = {
  Logo: (p) => h(Icono, p, h("path", { d: "M3 20h18M6 20V10l6-6 6 6v10M10 20v-6h4v6" })),
  Usuario: (p) => h(Icono, p, [
    h("circle", { key: "c", cx: 12, cy: 8, r: 3.5 }),
    h("path", { key: "p", d: "M5 20c0-3.5 3-6 7-6s7 2.5 7 6" }),
  ]),
  Candado: (p) => h(Icono, p, [
    h("rect", { key: "r", x: 5, y: 11, width: 14, height: 9, rx: 2 }),
    h("path", { key: "p", d: "M8 11V8a4 4 0 0 1 8 0v3" }),
  ]),
  Correo: (p) => h(Icono, p, [
    h("rect", { key: "r", x: 3, y: 5, width: 18, height: 14, rx: 2 }),
    h("path", { key: "p", d: "M4 7l8 6 8-6" }),
  ]),
  Dashboard: (p) => h(Icono, p, [
    h("rect", { key: "a", x: 3, y: 3, width: 7, height: 9, rx: 1.5 }),
    h("rect", { key: "b", x: 14, y: 3, width: 7, height: 5, rx: 1.5 }),
    h("rect", { key: "c", x: 14, y: 12, width: 7, height: 9, rx: 1.5 }),
    h("rect", { key: "d", x: 3, y: 16, width: 7, height: 5, rx: 1.5 }),
  ]),
  Sensor: (p) => h(Icono, p, [
    h("circle", { key: "a", cx: 12, cy: 12, r: 2.5 }),
    h("path", { key: "b", d: "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" }),
  ]),
  Alerta: (p) => h(Icono, p, [
    h("path", { key: "a", d: "M12 3l9 16H3l9-16z" }),
    h("path", { key: "b", d: "M12 10v4" }),
    h("circle", { key: "c", cx: 12, cy: 17.5, r: 0.6, fill: "currentColor" }),
  ]),
  Llave: (p) => h(Icono, p, [
    h("circle", { key: "a", cx: 7, cy: 15, r: 4 }),
    h("path", { key: "b", d: "M10 12l9-9M15 6l2 2M18 3l3 3" }),
  ]),
  Salir: (p) => h(Icono, p, [
    h("path", { key: "a", d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
    h("path", { key: "b", d: "M16 17l5-5-5-5" }),
    h("path", { key: "c", d: "M21 12H9" }),
  ]),
  Vibracion: (p) => h(Icono, p, h("path", { d: "M2 12h3l2-7 3 14 3-10 2 5h7" })),
  Gas: (p) => h(Icono, p, h("path", { d: "M12 2c3 3.5 5 6.5 5 9.5A5 5 0 0 1 7 11.5C7 8.5 9 5.5 12 2z" })),
  Presion: (p) => h(Icono, p, [
    h("circle", { key: "a", cx: 12, cy: 13, r: 7 }),
    h("path", { key: "b", d: "M12 13l3-3M12 3v2" }),
  ]),
  Temperatura: (p) => h(Icono, p, [
    h("rect", { key: "a", x: 10, y: 3, width: 4, height: 12, rx: 2 }),
    h("circle", { key: "b", cx: 12, cy: 18, r: 3 }),
  ]),
  Equipo: (p) => h(Icono, p, [
    h("rect", { key: "a", x: 3, y: 7, width: 18, height: 12, rx: 2 }),
    h("path", { key: "b", d: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
  ]),
  Llave2: (p) => h(Icono, p, h("path", { d: "M14.7 6.3a4 4 0 1 0-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5l-2.6 2.6-2-2z" })),
  Check: (p) => h(Icono, p, h("path", { d: "M5 13l4 4L19 7" })),
  Mapa: (p) => h(Icono, p, [
    h("path", { key: "a", d: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" }),
    h("circle", { key: "b", cx: 12, cy: 9.5, r: 2.3 }),
  ]),
  Reloj: (p) => h(Icono, p, [
    h("circle", { key: "a", cx: 12, cy: 12, r: 9 }),
    h("path", { key: "b", d: "M12 7v5l3.5 2" }),
  ]),
};

window.Icons = Icons;
