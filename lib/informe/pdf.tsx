import {
  Document, Page, Text, View, StyleSheet, Svg, Circle, Path, Font, renderToBuffer,
} from "@react-pdf/renderer";
import type { Documento, Nodo, TallerInforme } from "./documento";
import type { ColorEscala } from "@/lib/talleres/tipos";

/**
 * El informe, en PDF de verdad.
 *
 * Antes se entregaba un .html que había que abrir en el navegador e imprimir
 * a mano; el resultado dependía del navegador de cada quien. Esto arma el PDF
 * en el servidor: mismo archivo para todos, con paginación, encabezado y pie
 * de página reales.
 *
 * Sin navegador sin cabeza. Un Chromium empaquetado son ~50 MB en cada
 * función y segundos de arranque en frío para dibujar texto y rectángulos.
 *
 * Tipografía: las catorce fuentes estándar del formato PDF (Helvetica). No
 * hay que incrustar archivos, pesan cero y se ven igual en cualquier lector
 * —incluido el del celular, que es donde la mitad de la gente lo va a abrir.
 */

/**
 * Sin partir palabras.
 *
 * El renderizador trae silabeo en inglés y lo aplica a todo: partía
 * «operación» como «op-eración» y «sostenibilidad» donde el inglés lo
 * permitiría. Un informe que se entrega a la Cámara no puede tener eso.
 * Devolver la palabra entera desactiva el silabeo; el texto se ajusta
 * dejando el renglón corto, que es lo correcto en español.
 */
Font.registerHyphenationCallback((palabra) => [palabra]);

// Paleta de impresión: tinta sobre papel, sin tema oscuro. Un informe se
// imprime y se entrega; el gris de fondo de la aplicación gastaría tóner.
const C = {
  tinta: "#0F1B2D",
  suave: "#48566B",
  tenue: "#77839A",
  linea: "#D5DCE5",
  lineaSuave: "#E9EDF2",
  papel: "#FFFFFF",
  panel: "#F4F7FA",
  acento: "#14497E",
  acentoSuave: "#E9F0F8",
  fav: "#1C7A4B",
  med: "#8A6206",
  des: "#B3261E",
  na: "#68748A",
};

const TONO: Record<ColorEscala, string> = {
  fav: C.fav, med: C.med, des: C.des, na: C.na, acento: C.acento,
};

const e = StyleSheet.create({
  pagina: {
    paddingTop: 64, paddingBottom: 58, paddingHorizontal: 52,
    fontFamily: "Helvetica", fontSize: 11.5, lineHeight: 1.5, color: C.tinta,
    backgroundColor: C.papel,
  },
  portada: { padding: 52, fontFamily: "Helvetica", color: C.tinta, backgroundColor: C.papel },

  encabezado: {
    position: "absolute", top: 28, left: 52, right: 52,
    flexDirection: "row", justifyContent: "space-between",
    fontSize: 9, color: C.tenue, borderBottomWidth: 0.7, borderBottomColor: C.linea,
    paddingBottom: 7,
  },
  pie: {
    position: "absolute", bottom: 26, left: 52, right: 52,
    flexDirection: "row", justifyContent: "space-between",
    fontSize: 9, color: C.tenue, borderTopWidth: 0.7, borderTopColor: C.linea, paddingTop: 7,
  },

  // Portada
  marca: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 46 },
  marcaTexto: { fontFamily: "Helvetica-Bold", fontSize: 13, letterSpacing: 0.2 },
  sello: {
    fontSize: 9, letterSpacing: 1.6, color: C.acento, fontFamily: "Helvetica-Bold",
    marginBottom: 12,
  },
  empresa: { fontFamily: "Helvetica-Bold", fontSize: 34, lineHeight: 1.12, marginBottom: 14 },
  modulo: { fontSize: 15, color: C.suave, marginBottom: 4 },
  programa: { fontSize: 12, color: C.tenue },

  panel: {
    marginTop: 42, backgroundColor: C.panel, borderRadius: 8, padding: 22,
    flexDirection: "row", alignItems: "center", gap: 26,
  },
  cifra: { fontFamily: "Helvetica-Bold", fontSize: 26, color: C.acento },
  cifraRotulo: { fontSize: 10, color: C.suave, marginTop: 2 },

  indiceTitulo: {
    marginTop: 40, marginBottom: 10, fontSize: 10, letterSpacing: 1.2,
    color: C.tenue, fontFamily: "Helvetica-Bold",
  },
  indiceFila: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 6, borderBottomWidth: 0.7, borderBottomColor: C.lineaSuave,
  },
  indiceNum: { width: 22, fontSize: 10, color: C.tenue, fontFamily: "Helvetica-Bold" },
  indiceNombre: { flexGrow: 1, fontSize: 11.5 },
  indicePc: { width: 42, fontSize: 10.5, color: C.suave, textAlign: "right" },

  // Taller
  tallerNum: {
    fontSize: 10, letterSpacing: 1.4, color: C.acento, fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  tallerCorto: { fontFamily: "Helvetica-Bold", fontSize: 22, lineHeight: 1.2 },
  tallerPregunta: { fontSize: 12.5, color: C.suave, marginTop: 6, lineHeight: 1.45 },
  reglaTaller: {
    borderBottomWidth: 1.4, borderBottomColor: C.tinta, marginTop: 14, marginBottom: 18,
  },

  rotulo: {
    fontFamily: "Helvetica-Bold", fontSize: 9.5, letterSpacing: 1,
    color: C.acento, marginTop: 16, marginBottom: 6,
  },
  parrafo: { marginBottom: 8 },
  vacio: { fontFamily: "Helvetica-Oblique", color: C.tenue, marginBottom: 8 },

  item: { flexDirection: "row", gap: 8, marginBottom: 4 },
  vineta: { color: C.acento, width: 9 },

  tabla: { marginTop: 4, marginBottom: 12, borderWidth: 0.7, borderColor: C.linea, borderRadius: 5 },
  th: {
    flexDirection: "row", backgroundColor: C.panel,
    borderBottomWidth: 0.7, borderBottomColor: C.linea,
  },
  thCelda: {
    padding: 8, fontSize: 8.8, letterSpacing: 0.6, color: C.suave,
    fontFamily: "Helvetica-Bold",
  },
  tr: { flexDirection: "row", borderBottomWidth: 0.7, borderBottomColor: C.lineaSuave },
  trUltima: { flexDirection: "row" },
  tdCelda: { padding: 8, fontSize: 10.5, lineHeight: 1.42 },

  rejilla: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 6, marginBottom: 12 },
  cuadro: {
    width: "47.5%", borderWidth: 0.7, borderColor: C.linea, borderRadius: 6,
    borderLeftWidth: 3.5, padding: 13,
  },
  cuadroTitulo: {
    fontFamily: "Helvetica-Bold", fontSize: 9.5, letterSpacing: 1, marginBottom: 7,
  },
});

/** La brújula de la marca, dibujada en vectores. */
function Brujula({ tamano = 26 }: { tamano?: number }) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 36 36">
      <Circle cx="18" cy="18" r="15" fill="none" stroke={C.acento} strokeWidth={1.8}
              strokeOpacity={0.35} />
      <Path d="M18 1.5v3M18 31.5v3M1.5 18h3M31.5 18h3" stroke={C.acento} strokeWidth={1.8}
            strokeOpacity={0.35} strokeLinecap="round" />
      <Path d="M18 6.5 25 18l-7 11.5L11 18Z" fill={C.acento} fillOpacity={0.22} />
      <Path d="M18 6.5 25 18H11Z" fill={C.acento} />
    </Svg>
  );
}

/** Barra de avance. Es la única figura del informe, y aparece dos veces. */
function Barra({ fraccion, ancho = 78 }: { fraccion: number; ancho?: number }) {
  const pc = Math.max(0, Math.min(1, fraccion));
  return (
    <View style={{ width: ancho, height: 6, backgroundColor: C.lineaSuave, borderRadius: 3 }}>
      <View style={{
        width: ancho * pc, height: 6, backgroundColor: C.acento, borderRadius: 3,
      }} />
    </View>
  );
}

const pct = (f: number) => `${Math.round(f * 100)}%`;

/**
 * Anchos de columna.
 *
 * Una tabla de dos columnas reparte 40/60 y no mitad y mitad: la primera
 * suele ser una etiqueta corta y la segunda el texto que la empresa escribió.
 * Con tres o más, la primera se estrecha por la misma razón.
 */
function anchos(n: number): string[] {
  if (n <= 1) return ["100%"];
  if (n === 2) return ["38%", "62%"];
  const primera = 22;
  const resto = (100 - primera) / (n - 1);
  return [`${primera}%`, ...Array.from({ length: n - 1 }, () => `${resto}%`)];
}

/**
 * Una tabla del informe.
 *
 * Nada lleva `wrap={false}`, y esa es la corrección: un bloque marcado como
 * indivisible que no cabe en una página entera no se mueve a la siguiente
 * —no hay siguiente donde quepa—, así que el motor lo dibuja igual y el
 * texto termina encima del texto. Pasaba con «Cinco fuerzas»: cinco filas
 * con sustentos largos miden más de una página.
 *
 * `minPresenceAhead` hace el trabajo que se le pedía a `wrap={false}`: una
 * fila no empieza a tres renglones del pie, se pasa entera a la página
 * siguiente. Y el encabezado va `fixed`, así que se repite arriba de cada
 * página que la tabla ocupe.
 */
function Tabla({ encabezados, filas }: { encabezados: string[]; filas: string[][] }) {
  const w = anchos(encabezados.length);
  return (
    <View style={e.tabla}>
      <View style={e.th} fixed>
        {encabezados.map((h, i) => (
          <Text key={i} style={[e.thCelda, { width: w[i] }]}>{h.toUpperCase()}</Text>
        ))}
      </View>
      {filas.map((f, i) => (
        <View key={i} style={i === filas.length - 1 ? e.trUltima : e.tr}
              minPresenceAhead={46}>
          {f.map((c, j) => (
            <Text key={j} style={[
              e.tdCelda,
              { width: w[j] },
              j === 0 ? { fontFamily: "Helvetica-Bold" } : {},
            ]}>{c}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function Bloque({ n }: { n: Nodo }) {
  switch (n.tipo) {
    case "rotulo":
      return <Text style={e.rotulo}>{n.texto.toUpperCase()}</Text>;
    case "parrafo":
      return <Text style={e.parrafo}>{n.texto}</Text>;
    case "vacio":
      return <Text style={e.vacio}>Sin responder.</Text>;
    case "lista":
      return (
        <View style={{ marginBottom: 8 }}>
          {n.items.map((it, i) => (
            <View key={i} style={e.item} minPresenceAhead={24}>
              <Text style={e.vineta}>•</Text>
              <Text style={{ flexGrow: 1 }}>{it}</Text>
            </View>
          ))}
        </View>
      );
    case "tabla":
      return <Tabla encabezados={n.encabezados} filas={n.filas} />;
    case "cuadrantes":
      return (
        <View style={e.rejilla}>
          {n.cuadros.map((q, i) => (
            <View key={i} style={[e.cuadro, { borderLeftColor: TONO[q.color] }]}
                  minPresenceAhead={60}>
              <Text style={[e.cuadroTitulo, { color: TONO[q.color] }]}>
                {q.titulo.toUpperCase()}
              </Text>
              {q.items.length === 0
                ? <Text style={e.vacio}>Sin responder.</Text>
                : q.items.map((it, j) => (
                    <View key={j} style={e.item}>
                      <Text style={[e.vineta, { color: TONO[q.color] }]}>•</Text>
                      <Text style={{ flexGrow: 1, fontSize: 10.5 }}>{it}</Text>
                    </View>
                  ))}
            </View>
          ))}
        </View>
      );
  }
}

function Taller({ t }: { t: TallerInforme }) {
  return (
    <View>
      {/* La cabecera no se separa de lo que titula. */}
      <View wrap={false} minPresenceAhead={120}>
        <Text style={e.tallerNum}>TALLER {t.numero}</Text>
        <Text style={e.tallerCorto}>{t.corto}</Text>
        <Text style={e.tallerPregunta}>{t.titulo}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 }}>
          <Barra fraccion={t.avance.fraccion} />
          <Text style={{ fontSize: 9.5, color: C.suave }}>
            {t.avance.resueltos} de {t.avance.total} campos · {pct(t.avance.fraccion)}
          </Text>
        </View>
        <View style={e.reglaTaller} />
      </View>
      {t.nodos.length === 0
        ? <Text style={e.vacio}>Sin responder.</Text>
        : t.nodos.map((n, i) => <Bloque key={i} n={n} />)}
    </View>
  );
}

export function Informe({ d }: { d: Documento }) {
  return (
    <Document
      title={`${d.modulo} — ${d.empresa}`}
      author={d.empresa}
      subject={d.programa}
      creator="Brújula empresarial"
      producer="Brújula empresarial"
    >
      {/* Portada */}
      <Page size="A4" style={e.portada}>
        <View style={e.marca}>
          <Brujula />
          <Text style={e.marcaTexto}>Brújula empresarial</Text>
        </View>

        <Text style={e.sello}>INFORME DEL MÓDULO</Text>
        <Text style={e.empresa}>{d.empresa}</Text>
        <Text style={e.modulo}>{d.modulo}</Text>
        <Text style={e.programa}>{d.programa}</Text>

        <View style={e.panel}>
          <View>
            <Text style={e.cifra}>{pct(d.avance.fraccion)}</Text>
            <Text style={e.cifraRotulo}>del módulo resuelto</Text>
          </View>
          <View>
            <Text style={e.cifra}>{d.avance.resueltos}</Text>
            <Text style={e.cifraRotulo}>de {d.avance.total} campos</Text>
          </View>
          <View>
            <Text style={e.cifra}>{d.talleres.length}</Text>
            <Text style={e.cifraRotulo}>
              {d.talleres.length === 1 ? "taller" : "talleres"}
            </Text>
          </View>
        </View>

        <Text style={e.indiceTitulo}>CONTENIDO</Text>
        {d.talleres.map((t) => (
          <View key={t.numero} style={e.indiceFila}>
            <Text style={e.indiceNum}>{String(t.numero).padStart(2, "0")}</Text>
            <Text style={e.indiceNombre}>{t.corto}</Text>
            <Barra fraccion={t.avance.fraccion} ancho={54} />
            <Text style={e.indicePc}>{pct(t.avance.fraccion)}</Text>
          </View>
        ))}

        <Text style={{ position: "absolute", bottom: 52, left: 52, right: 52,
                       fontSize: 10, color: C.tenue }}>
          Diligenciado en la Brújula empresarial · {d.fecha}
        </Text>
      </Page>

      {/* Un taller por página: el informe se reparte y se comenta por taller. */}
      {d.talleres.map((t) => (
        <Page key={t.numero} size="A4" style={e.pagina}>
          <View style={e.encabezado} fixed>
            <Text>{d.empresa}</Text>
            <Text>{d.modulo}</Text>
          </View>
          <Taller t={t} />
          <View style={e.pie} fixed>
            <Text>Brújula empresarial · {d.programa}</Text>
            <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
  );
}

/** El PDF como bytes, listo para responder una descarga. */
export async function informePdf(d: Documento): Promise<Buffer> {
  return renderToBuffer(<Informe d={d} />);
}

/** Nombre de archivo seguro a partir del nombre de la empresa. */
export function nombreArchivo(modulo: string, empresa: string): string {
  const limpio = (empresa || "empresa")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  const mod = modulo.replace(/[^\w]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${mod}-${limpio}.pdf`;
}
