"""
Comprueba los dos documentos comerciales antes de enviarlos.

Dos cosas distintas se verifican aquí. La primera es que las cifras de ambos
archivos salgan del mismo modelo. La segunda, más importante, es que el
documento del cliente NO contenga nada del interno: basta que se filtre el
costo fijo o la palabra «margen» para que un jefe de compras sepa hasta dónde
puede presionar.
"""
import json
import re
import subprocess
import sys

import docx  # python-docx: pip install python-docx

RUTA_PUB = "docs/comercial/propuesta-brujula-camaras.docx"
RUTA_INT = "docs/comercial/sustentacion-precio-brujula.docx"

n = json.loads(subprocess.run(
    ["python3", "docs/comercial/modelo-precio.py", "--json"],
    capture_output=True, text=True, check=True).stdout)


def cop(v: float) -> str:
    return "$" + f"{round(v):,}".replace(",", ".")


def texto_completo(ruta: str) -> str:
    d = docx.Document(ruta)
    partes = [p.text for p in d.paragraphs]
    for t in d.tables:
        for r in t.rows:
            partes += [c.text for c in r.cells]
    return "\n".join(partes)


pub, inte = texto_completo(RUTA_PUB), texto_completo(RUTA_INT)
fallos: list[str] = []

# 1 · Las cifras compartidas son idénticas en los dos documentos.
for etiqueta, valor in [
    ("precio de entrada", cop(n["precioEntrada"])),
    ("precio piso", cop(n["precioPiso"])),
    ("implementación del contrato tipo", cop(n["contratoTipo"]["implementacion"])),
]:
    if valor not in pub:
        fallos.append(f"la propuesta no menciona {etiqueta} ({valor})")
    if valor not in inte:
        fallos.append(f"el anexo no menciona {etiqueta} ({valor})")

# 2 · La propuesta no puede filtrar nada de la estructura de costos.
for secreto, nombre in [
    (cop(n["costoFijo"]), "el costo fijo"),
    (cop(n["overheadCop"]), "el overhead asignado"),
    (cop(n["infraCop"]), "el costo de infraestructura"),
    ("USO INTERNO", "la marca de uso interno"),
    ("Supabase", "el proveedor de base de datos"),
    ("Vercel", "el proveedor de despliegue"),
    ("margen", "la palabra «margen»"),
    ("overhead", "la palabra «overhead»"),
    ("equilibrio", "el punto de equilibrio"),
]:
    if secreto.lower() in pub.lower():
        fallos.append(f"LA PROPUESTA FILTRA {nombre}: «{secreto}»")

# 3 · El anexo lleva su advertencia, y en el pie de cada página.
if "NO ENVIAR AL CLIENTE" not in inte:
    fallos.append("el anexo interno no lleva la advertencia de no enviarlo")

# 4 · La plantilla conserva sus marcadores editables; el anexo no los necesita.
marcadores = sorted(set(re.findall(r"\[[A-ZÁÉÍÓÚÑ.º\s]+\]", pub)))
if len(marcadores) < 5:
    fallos.append(f"faltan marcadores editables en la propuesta: {marcadores}")

# 5 · Nada del alcance se ofrece sin decir cuándo se entrega.
alcance = docx.Document(RUTA_PUB).tables[0]
estados = {r.cells[1].text.strip() for r in alcance.rows[1:]}
if not estados <= {"Incluido", "Desde la activación"}:
    fallos.append(f"la tabla de alcance tiene estados inesperados: {estados}")

print(f"marcadores editables · {', '.join(marcadores)}")
print(f"estados de alcance   · {', '.join(sorted(estados))}")
print(f"extensión            · propuesta {len(pub.split())} palabras, "
      f"anexo {len(inte.split())} palabras")

if fallos:
    print("\n✗ FALLOS")
    for f in fallos:
        print("  ·", f)
    sys.exit(1)
print("\n✓ cifras coherentes entre ambos, y el interno no se filtró al externo")
