import { cuerpoInforme, type DatosInforme } from "./cuerpo";

/**
 * Hoja de estilo del informe.
 *
 * No reutiliza la de la aplicación a propósito: el informe es un documento
 * que se imprime y se entrega, no una interfaz. Va en claro siempre —una
 * entrega en tema oscuro gasta tinta y se lee peor— y es autocontenida, para
 * que el archivo funcione guardado en un escritorio sin conexión.
 */
const ESTILO = `
:root{
  --tinta:#1C1A2E; --suave:#5B5878; --tenue:#8C88A6;
  --linea:#DEDCE8; --linea-2:#EFEEF5; --fondo:#FFFFFF;
  --acento:#4B3FA6; --fav:#2E7D4F; --med:#A9740A; --des:#B93E2B;
}
*{box-sizing:border-box}
body{
  margin:0; padding:40px 24px 64px; background:var(--fondo); color:var(--tinta);
  font-family:"Instrument Sans","Helvetica Neue",Arial,sans-serif;
  font-size:14px; line-height:1.55; max-width:880px; margin-inline:auto;
}
h1,h2,h3,h4{font-family:"Bricolage Grotesque","Trebuchet MS",sans-serif;
  margin:0; line-height:1.2; text-wrap:balance}
.portada-informe{padding-bottom:20px; border-bottom:2px solid var(--tinta); margin-bottom:8px}
.portada-informe h1{font-size:27px; font-weight:800}
.sub{color:var(--suave); font-size:13.5px; margin:5px 0 0}
h2{font-size:18px; font-weight:700; margin:32px 0 2px; padding-top:14px;
  border-top:1px solid var(--linea)}
.pregunta{color:var(--suave); font-size:13.5px; margin:0 0 12px; font-style:italic}
h4{font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--acento);
  margin:18px 0 6px; font-weight:700}
ul{margin:0 0 8px; padding-left:20px}
li{margin-bottom:3px}
p{margin:0 0 8px}
.vacio{color:var(--tenue); font-style:italic}
.tw{overflow-x:auto; margin:0 0 10px}
table{border-collapse:collapse; width:100%; font-size:13px}
th{text-align:left; font-family:"Bricolage Grotesque",sans-serif; font-weight:700;
  font-size:11px; letter-spacing:.05em; text-transform:uppercase; color:var(--suave);
  border-bottom:1.5px solid var(--linea); padding:8px 10px; vertical-align:bottom}
td{padding:7px 10px; border-bottom:1px solid var(--linea-2); vertical-align:top}
tbody tr:last-child td{border-bottom:0}
td:first-child{font-weight:500}
.cuadros{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:8px}
.cuadro{border:1px solid var(--linea); border-radius:10px; padding:13px 15px}
.cuadro h4{margin-top:0}
.cuadro.fav{border-left:4px solid var(--fav)}    .cuadro.fav h4{color:var(--fav)}
.cuadro.des{border-left:4px solid var(--des)}    .cuadro.des h4{color:var(--des)}
.cuadro.acento{border-left:4px solid var(--acento)}
.cuadro.med{border-left:4px solid var(--med)}    .cuadro.med h4{color:var(--med)}
.pie{margin-top:36px; padding-top:14px; border-top:1px solid var(--linea);
  color:var(--tenue); font-size:11.5px}
@media print{
  body{padding:0; font-size:11.5pt}
  h2{page-break-after:avoid; break-after:avoid}
  table, .cuadro{page-break-inside:avoid; break-inside:avoid}
  .cuadros{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:640px){ .cuadros{grid-template-columns:1fr} }
`;

export function informeHtml(d: DatosInforme): string {
  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  });
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${d.modulo} — ${d.empresa || "Empresa"}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap">
<style>${ESTILO}</style>
</head>
<body>
${cuerpoInforme(d)}
<p class="pie">Diligenciado en la Brújula empresarial · ${fecha}</p>
</body>
</html>`;
}

/** Nombre de archivo seguro a partir del nombre de la empresa. */
export function nombreArchivo(modulo: string, empresa: string): string {
  const limpio = (empresa || "empresa")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  const mod = modulo.replace(/[^\w]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${mod}-${limpio}.html`;
}
