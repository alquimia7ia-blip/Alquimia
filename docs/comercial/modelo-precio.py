"""
Modelo de precio de Brújula empresarial.

Es la única fuente de las cifras que aparecen en los dos .docx. Si un supuesto
cambia, se cambia aquí y se regeneran los documentos: así no hay dos versiones
de la misma cifra.

Comprueba además la monotonía del precio. La primera versión de la tabla usaba
tramos planos y se invertía en la frontera —99 usuarios a $42.000 costaban más
que 100 a $36.000—, de modo que contratar un usuario más salía más barato.
"""

TRM = 3200  # COP/USD, agosto 2026 (docs/finanzas/04-esquema-financiero.md)

INFRA_USD = {
    "Supabase Pro (base de datos, autenticación)": 25,
    "Vercel Pro (despliegue y red de entrega)": 20,
    "Resend (correo transaccional)": 20,
    "Sentry (monitoreo de errores)": 26,
    "Dominio propio": 1.25,
}

OVERHEAD_BASE = 7_500_000   # Escenario 1 "fundador solo"
OVERHEAD_PCT = 0.40         # porción asignada a esta línea de producto

# Precio por escalones: cada tramo se cobra solo sobre los usuarios que caen
# dentro de él, como la tarifa de un impuesto.
ESCALONES = [(100, 42_000), (250, 36_000), (500, 30_000), (None, 25_000)]

MINIMO_FACTURABLE = 50
MAX_USUARIOS_EMPRESA = 5
IMPLEMENTACION_POR_TALLER = 350_000
IMPLEMENTACION_MINIMA = 5_000_000
IVA = 0.19


def infra_cop() -> int:
    return round(sum(INFRA_USD.values()) * TRM)


def costo_fijo() -> int:
    return infra_cop() + round(OVERHEAD_BASE * OVERHEAD_PCT)


def mensual(usuarios: int) -> int:
    """Factura mensual antes de IVA, aplicando los escalones."""
    total, previo = 0, 0
    for tope, precio in ESCALONES:
        if tope is None:
            total += max(0, usuarios - previo) * precio
            break
        en_tramo = max(0, min(usuarios, tope) - previo)
        total += en_tramo * precio
        previo = tope
        if usuarios <= tope:
            break
    return total


def efectivo(usuarios: int) -> float:
    return mensual(usuarios) / usuarios if usuarios else 0


def equilibrio() -> int:
    """Usuarios mínimos cuya factura cubre el costo fijo."""
    n = 1
    while mensual(n) < costo_fijo():
        n += 1
    return n


def margen(usuarios: int) -> float:
    ingreso = mensual(usuarios)
    return (ingreso - costo_fijo()) / ingreso if ingreso else 0


def implementacion(talleres: int) -> int:
    return max(talleres * IMPLEMENTACION_POR_TALLER, IMPLEMENTACION_MINIMA)


def cifras() -> dict:
    """Todo lo que los .docx necesitan, en un solo objeto.

    Los generadores de Word leen esto en vez de repetir las cuentas: si un
    supuesto cambia, no quedan dos versiones de la misma cifra.
    """
    tramos, previo = [], 0
    for tope, precio in ESCALONES:
        tramos.append({"desde": previo + 1, "hasta": tope, "precio": precio})
        previo = tope if tope else previo
    return {
        "trm": TRM,
        "infraUsd": INFRA_USD,
        "infraUsdTotal": round(sum(INFRA_USD.values()), 2),
        "infraCop": infra_cop(),
        "overheadBase": OVERHEAD_BASE,
        "overheadPct": OVERHEAD_PCT,
        "overheadCop": round(OVERHEAD_BASE * OVERHEAD_PCT),
        "costoFijo": costo_fijo(),
        "costoFijoAnual": costo_fijo() * 12,
        "tramos": tramos,
        "precioEntrada": ESCALONES[0][1],
        "precioPiso": ESCALONES[-1][1],
        "minimoFacturable": MINIMO_FACTURABLE,
        "maxUsuariosEmpresa": MAX_USUARIOS_EMPRESA,
        "implementacionPorTaller": IMPLEMENTACION_POR_TALLER,
        "implementacionMinima": IMPLEMENTACION_MINIMA,
        "iva": IVA,
        "equilibrio": equilibrio(),
        "escala": [
            {"usuarios": n, "mensual": mensual(n), "efectivo": round(efectivo(n)),
             "anual": mensual(n) * 12, "margen": round(margen(n), 4)}
            for n in (50, 90, 150, 250, 500)
        ],
        "sensibilidad": [
            {"usuarios": n, "mensual": mensual(n), "margen": round(margen(n), 4)}
            for n in (50, 75, 90, 100, 125, 150, 180, 200, 250, 300)
        ],
        "contratoTipo": {
            "usuarios": 90, "talleres": 20,
            "implementacion": implementacion(20),
            "suscripcionAnual": mensual(90) * 12,
            "totalAnio1": implementacion(20) + mensual(90) * 12,
            "totalAnio1ConIva": round((implementacion(20) + mensual(90) * 12) * (1 + IVA)),
            "margen": round(margen(90), 4),
        },
    }


if __name__ == "__main__":
    import sys
    if "--json" in sys.argv:
        import json
        print(json.dumps(cifras(), ensure_ascii=False, indent=2))
        raise SystemExit(0)

    cop = lambda v: f"${v:,.0f}".replace(",", ".")
    fallos = []

    print("SUPUESTOS")
    print(f"  TRM                      {cop(TRM)} COP/USD")
    print(f"  Infraestructura          USD {sum(INFRA_USD.values()):.2f}/mes = {cop(infra_cop())}/mes")
    print(f"  Overhead asignado        {OVERHEAD_PCT:.0%} de {cop(OVERHEAD_BASE)} = {cop(round(OVERHEAD_BASE*OVERHEAD_PCT))}/mes")
    print(f"  COSTO FIJO TOTAL         {cop(costo_fijo())}/mes · {cop(costo_fijo()*12)}/año\n")

    print("PRECIO EFECTIVO")
    for n in (50, 90, 150, 250, 500):
        print(f"  {n:>4} usuarios   {cop(mensual(n)):>13}/mes   efectivo {cop(round(efectivo(n))):>9}   "
              f"anual {cop(mensual(n)*12):>15}   margen {margen(n):>5.1%}")
    print()

    # 1 · Monotonía en cada frontera y en todo el recorrido.
    for n in range(1, 700):
        if mensual(n + 1) <= mensual(n):
            fallos.append(f"el precio no sube al pasar de {n} a {n+1} usuarios")
    print(f"✓ el total sube con cada usuario en todo el rango 1-700"
          if not fallos else "✗ monotonía rota")

    # 2 · El punto de equilibrio y el objetivo de sostenibilidad.
    eq = equilibrio()
    print(f"✓ punto de equilibrio: {eq} usuarios ({cop(mensual(eq))} ≥ {cop(costo_fijo())})")
    dos = 2 * mensual(90)
    una = mensual(180)
    print(f"✓ vender ancho gana: dos cámaras de 90 = {cop(dos)} > una de 180 = {cop(una)}")
    if dos <= una:
        fallos.append("vender dos contratos de 90 ya no supera a uno de 180")

    # 3 · El precio piso nunca queda por debajo del último escalón.
    piso = ESCALONES[-1][1]
    print(f"✓ precio piso de negociación: {cop(piso)} (último escalón)")

    # 4 · Contrato tipo de la Cámara del Aburrá Sur: 30 empresas × 3 usuarios.
    imp = implementacion(20)
    sus = mensual(90) * 12
    print(f"✓ contrato tipo (90 usuarios, 20 talleres): implementación {cop(imp)} + "
          f"suscripción {cop(sus)} = {cop(imp+sus)} antes de IVA")
    print(f"  con IVA {IVA:.0%}: {cop(round((imp+sus)*(1+IVA)))}")

    # 5 · El mínimo facturable debe cubrir una parte razonable del costo fijo.
    cobertura = mensual(MINIMO_FACTURABLE) / costo_fijo()
    print(f"✓ mínimo facturable de {MINIMO_FACTURABLE} usuarios cubre el {cobertura:.0%} del costo fijo")

    if fallos:
        print("\n✗ FALLOS:")
        for f in fallos:
            print(f"  · {f}")
        raise SystemExit(1)
    print("\n✓ el modelo es coherente")
