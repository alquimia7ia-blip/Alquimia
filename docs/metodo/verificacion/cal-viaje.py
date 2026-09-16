# -*- coding: utf-8 -*-
"""VIAJE AL FUTURO - calibrador. Se corre ANTES de escribir interfaz.

Tres diferencias con cal7.py, y las tres salen de la pieza real:

1. La cadena son los 15 pasos OFICIALES del documento de la Fabrica, no 28 inventadas.
2. NO HAY MAQUINAS. Las tuercas se aprietan a mano: es ensamble 100% manual. Las unicas
   paradas son micro-paradas de puesto (falta material, relevo, reproceso) y su frecuencia
   NO se inventa: se deriva de los paros que el participante midio en la corrida real.
3. El indicador que decide no es el OEE sino el COSTO POR PIEZA, que es gente/produccion.

El motor debe quedar identico al de viaje-al-futuro.html: mismo paso, misma semilla.
"""

STEP = 0.25
SEED = 11
CAP  = 4          # cola entre puestos
T    = 28800.0    # jornada de 8 h
PARADA = 2100.0   # reconfigurar la linea real: 35 min

# ── los 15 pasos oficiales (Pasos_Ensamble_Rompecabezas.pdf, una pagina por paso) ──────
NOM = [
 "Base y los 3 esparragos",              # 1
 "Capa transparente (2 mitades)",        # 2
 "Transicion transparente + amarilla",   # 3
 "Capa amarilla (2 mitades)",            # 4
 "Capa verde (2 mitades)",               # 5
 "Transicion verde + azul",              # 6
 "Capa azul (2 mitades)",                # 7
 "Columnas: circulo grande y triangulo", # 8
 "Columnas: circulo pequeno y pentagono",# 9
 "Tuerca 1 (a mano)",                    # 10
 "Tuerca 2 (a mano)",                    # 11
 "Tuerca 3 (a mano)",                    # 12
 "Colocar la helice",                    # 13
 "2 tuercas de la helice",               # 14
 "Ultima tuerca y almacenar",            # 15
]
# ESTIMADOS de las fotos. Solo sirven para precargar el formulario: el dato real lo pone
# el participante con cronometro. El barrido de abajo prueba que la leccion no depende
# de estos numeros exactos.
W0 = [14, 18, 16, 16, 16, 16, 16, 10, 10, 7, 7, 7, 9, 12, 9]

# a que capa de la torre pertenece cada paso: sirve para dibujarla
CAPA = [1, 2, 2, 3, 4, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7]

# defectos por paso. Apretar a mano castiga la CALIDAD, no el tiempo: la rosca se pasa
# o queda floja. Las capas fallan cuando las dos mitades quedan chuecas.
DEF = [.0008] * 15
for i in (1, 2, 3, 4, 5, 6): DEF[i] = .0015   # capas: mitades en zigzag mal encajadas
for i in (7, 8):             DEF[i] = .0010   # columnas
for i in (9, 10, 11, 13, 14):DEF[i] = .0018   # tuercas a mano: se pasa la rosca
DEF[12] = .0012                               # helice

# Un puesto con muchos pasos encima se equivoca mas: se le olvida una tuerca, monta una
# capa antes que la otra. Hasta PASOS_LIBRES pasos la persona los tiene en la cabeza; de
# ahi en adelante cada paso extra suma PEN_PASO al riesgo.
#
# Antes esto se media comparando el puesto contra el promedio de la linea, como en
# SIN PARAR. Con 15 pasos indivisibles eso daba un artefacto feo: al agregar gente baja el
# promedio, y puestos que no habian cambiado de trabajo quedaban marcados como
# sobrecargados. El resultado era que contratar a alguien EMPEORABA la calidad, que es
# falso. El numero de pasos es absoluto y no depende de cuanta gente haya.
PASOS_LIBRES, PEN_PASO = 3, 0.25

# ── datos de la corrida real que trae el informe (precarga del Paso 1) ────────────────
BASE = dict(puestos=7, cortes=[2, 4, 6, 8, 10, 12, 15],
            lote_piezas=10, lote_seg=660.0,   # 10 piezas en 11 min
            buenas=8, malas=2,
            paros=3, paro_seg=40.0)           # la duracion NO esta en el informe: se mide


def carga(ntareas):
    """Cuanto se multiplica el riesgo de error en un puesto que acumula n pasos."""
    return 1.0 + PEN_PASO * max(0, ntareas - PASOS_LIBRES)


def ciclo_ideal(W):
    """El ciclo ideal de esta linea es SU PASO MAS LARGO.

    Los pasos no se pueden partir: por mas gente que contrate, la linea nunca saca una
    pieza mas rapido que el paso mas lento del ensamble. Esa es la placa de la linea.
    Con CI = trabajo/puestos el OEE se iba por encima del 100% al pasar de cierto numero
    de puestos, porque el ideal se movia junto con la gente. CI es CONSTANTE: se fija con
    los tiempos del Paso 1 y no se vuelve a tocar."""
    return max(W)


def mk(seed):
    a = [seed & 0xFFFFFFFF]
    def r():
        a[0] = (a[0] + 0x6D2B79F5) & 0xFFFFFFFF
        t = a[0]
        t = (t ^ (t >> 15)) * (t | 1) & 0xFFFFFFFF
        t ^= (t + ((t ^ (t >> 7)) * (t | 61) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return (((t ^ (t >> 14)) & 0xFFFFFFFF)) / 4294967296.0
    return r


def puestos(cortes):
    r = []; p = 0
    for c in cortes: r.append(list(range(p, c))); p = c
    return r


def micro_de_datos(d):
    """La frecuencia de micro-paradas NO se inventa: sale de lo que midieron.
    n paros repartidos entre N puestos durante el lote -> un paro cada MTBF segundos
    de operacion de un puesto. MTTR = lo que duro el paro promedio."""
    N = d["puestos"]
    if d["paros"] <= 0: return (1e12, 0.0)
    return ((N * d["lote_seg"]) / d["paros"], d["paro_seg"])


def sim(cortes, W, micro, T=T, seed=SEED, defx=1.0, CI=None, paradas=0):
    P   = puestos(cortes)
    N   = len(P)
    cyc = [sum(W[i] for i in p) for p in P]
    bn  = max(range(N), key=lambda i: cyc[i])
    if CI is None: CI = ciclo_ideal(W)
    pdef  = [sum(DEF[i] for i in p) * defx * carga(len(p)) for p in P]
    rng = mk(seed)

    st = [{"h": False, "dn": False, "t": 0.0, "buf": 0, "qb": 0, "dt": 0.0, "bad": False,
           "down": 0.0, "op": 0.0, "nxt": micro[0]} for _ in range(N)]
    clock = paradas * PARADA
    parado = paradas * PARADA
    out = good = 0

    def push(i, bad):
        nonlocal out, good
        if i == N - 1:
            out += 1
            if not bad: good += 1
            return True
        if st[i + 1]["buf"] < CAP:
            st[i + 1]["buf"] += 1
            if bad: st[i + 1]["qb"] += 1
            return True
        return False

    while clock < T:
        clock += STEP
        for i in range(N - 1, -1, -1):
            e = st[i]
            if e["dt"] > 0: e["dt"] -= STEP; e["down"] += STEP; continue
            if e["dn"]:
                if push(i, e["bad"]): e["dn"] = False
                else: continue
            if not e["h"]:
                if i == 0: e["h"] = True; e["t"] = 0.0; e["bad"] = False
                elif e["buf"] > 0:
                    e["buf"] -= 1; e["h"] = True; e["t"] = 0.0
                    e["bad"] = e["qb"] > 0
                    if e["qb"] > 0: e["qb"] -= 1
            if e["h"]:
                e["t"] += STEP; e["op"] += STEP
                if e["op"] >= e["nxt"]:
                    e["dt"] = micro[1]; e["nxt"] = e["op"] + micro[0]
                if e["t"] >= cyc[i]:
                    e["h"] = False; e["t"] = 0.0
                    if rng() < pdef[i]: e["bad"] = True
                    if not push(i, e["bad"]): e["dn"] = True

    down = st[bn]["down"] + parado
    oper = T - down
    D = oper / T
    R = (CI * out) / oper if oper > 0 else 0.0
    Q = good / out if out else 0.0
    return dict(N=N, cyc=cyc, bn=bn, takt=cyc[bn], CI=CI, out=out, good=good,
                D=D, R=R, Q=Q, OEE=D * R * Q, down=down)


# ── Paso 1: el OEE a mano, tal como lo hace el participante ───────────────────────────
def oee_manual(d, CI):
    plan  = d["lote_seg"]
    paros = d["paros"] * d["paro_seg"]
    oper  = plan - paros
    tot   = d["buenas"] + d["malas"]
    D = oper / plan
    R = (CI * tot) / oper
    Q = d["buenas"] / tot
    return dict(D=D, R=R, Q=Q, OEE=D * R * Q, oper=oper, paros=paros, tot=tot)


# ── Paso 2: cuanto DEBERIA haberse demorado el lote, segun la sombra ──────────────────
def lote_sombra(W, cortes, d):
    """trabajo total + (n-1) x ciclo del puesto mas lento + paros.
    La diferencia contra lo medido son 'los minutos que no aparecen'."""
    cyc = [sum(W[i] for i in p) for p in puestos(cortes)]
    takt = max(cyc)
    n = d["buenas"] + d["malas"]
    return sum(W) + (n - 1) * takt + d["paros"] * d["paro_seg"]


# ── reparto de cortes ─────────────────────────────────────────────────────────────────
def greedy(cap, W):
    cortes = []; s = 0.0
    for i, x in enumerate(W):
        if x > cap: return None
        if s + x > cap: cortes.append(i); s = x
        else: s += x
    cortes.append(len(W)); return cortes


def mejor_cortes(k, W):
    """el mejor reparto en a lo sumo k puestos (busqueda binaria sobre el ciclo)"""
    lo, hi = max(W), sum(W); best = None
    for _ in range(90):
        m = (lo + hi) / 2; c = greedy(m, W)
        if c and len(c) <= k: hi = m; best = c
        else: lo = m
    if best is None: return None, None
    return best, max(sum(W[a:b]) for a, b in zip([0] + best[:-1], best))


def escalera(W, micro, CI, kmax=None):
    """para cada numero de puestos: el mejor reparto y lo que produce en un turno"""
    kmax = kmax or len(W)
    filas = []
    for k in range(1, kmax + 1):
        c, tk = mejor_cortes(k, W)
        if c is None or len(c) < k:      # k puestos no aporta nada nuevo
            if filas and len(c or []) == filas[-1]["N"]: continue
        r = sim(c, W, micro, CI=CI)
        r["k"] = k
        r["porpersona"] = r["good"] / r["N"]
        filas.append(r)
    return filas


def desperdicio(filas):
    """LA TRAMPA DE ESTE JUEGO, y no es la que yo esperaba.

    No es que mas gente siempre sea peor: es que hay dotaciones que se pagan solas y
    otras que le queman sueldos, y desde afuera no se distinguen. Busca el par
    (pocos, muchos) donde contratar mas gente hunde las piezas por persona."""
    peor = None
    for i in range(len(filas)):
        for j in range(i + 1, len(filas)):
            if filas[j]["porpersona"] < 0.80 * filas[i]["porpersona"]:
                caida = filas[j]["porpersona"] / filas[i]["porpersona"]
                if peor is None or caida < peor[2]:
                    peor = (filas[i], filas[j], caida)
    return peor


def escalon(filas):
    """El momento que hace el nivel: una tanda de gente no compra casi nada y la
    siguiente persona dispara la produccion. Se mide por PERSONA agregada."""
    g = [(f["N"], f["good"]) for f in filas]
    por = [(g[i + 1][1] - g[i][1]) / max(1, g[i + 1][0] - g[i][0]) for i in range(len(g) - 1)]
    mejor = None
    for i in range(len(por) - 1):
        if por[i + 1] >= 3 * max(por[i], 1.0):
            r = por[i + 1] / max(por[i], 1.0)
            if mejor is None or r > mejor[-1]:
                mejor = (g[i][0], g[i + 1][0], por[i], g[i + 1][0], g[i + 2][0], por[i + 1], r)
    return mejor


def meta_del_dia(base_good, filas):
    """La meta del Paso 3 sale de SU dato, no de un numero quemado: entregar una cuarta
    parte mas de lo que da su linea de hoy, redondeado hacia abajo a la cincuentena.

    Con dos topes, porque el juego tiene que poderse ganar y tiene que costar:
      - nunca por debajo de lo que ya produce hoy (si no, no hay reto);
      - nunca por encima de lo que se logra con el 80% de los puestos posibles (si no,
        el juego se reduce a poner toda la gente, que es lo contrario de lo que ensena).

    Se probo con 1,5x y quedaba pegada al tope."""
    meta = int(base_good * 1.25 // 50) * 50
    tope_k = filas[-1]["N"] * 0.8
    alcanzable = [f["good"] for f in filas if f["N"] <= tope_k]
    if alcanzable:
        meta = min(meta, int(max(alcanzable) // 50) * 50)
    return max(50, meta)


def analisis(W, d, etiqueta="", verbose=True):
    micro = micro_de_datos(d)
    CI    = ciclo_ideal(W)
    base  = sim(d["cortes"], W, micro, CI=CI)
    filas = []
    vistos = set()
    for k in range(1, len(W) + 1):
        c, tk = mejor_cortes(k, W)
        if c is None: continue
        key = tuple(c)
        if key in vistos: continue     # k puestos que no compra nada nuevo
        vistos.add(key)
        r = sim(c, W, micro, CI=CI)
        r["cortes"] = c
        r["porpersona"] = r["good"] / r["N"]
        filas.append(r)
    meta = meta_del_dia(base["good"], filas)
    cumplen = [f for f in filas if f["good"] >= meta]
    kopt = cumplen[0]["N"] if cumplen else None
    if verbose:
        print("\n%s" % etiqueta)
        print("  trabajo total %.0f s en %d pasos - paso mas largo %.0f s (piso del ciclo)"
              % (sum(W), len(W), max(W)))
        print("  micro-parada derivada de sus datos: una cada %.0f s, dura %.0f s"
              % (micro[0], micro[1]))
        m = oee_manual(d, CI)
        print("  PASO 1 - OEE a mano: D %.1f%% x R %.1f%% x C %.1f%% = %.1f%%"
              % (m["D"] * 100, m["R"] * 100, m["Q"] * 100, m["OEE"] * 100))
        pred = lote_sombra(W, d["cortes"], d)
        print("  PASO 2 - el lote deberia durar %.0f s; se demoro %.0f s -> %.0f s sin explicar"
              % (pred, d["lote_seg"], d["lote_seg"] - pred))
        print("  PASO 2 - su linea de hoy, proyectada al turno: %d buenas" % base["good"])
        print("  PASO 3 - meta del dia: %d buenas\n" % meta)
        print("  %-3s %6s %8s %9s %8s %7s" % ("pst", "ciclo", "buenas", "x persona", "vs meta", "OEE"))
        for f in filas:
            print("  %-3d %6.1f %8d %9.1f %8s %6.1f%%"
                  % (f["N"], f["takt"], f["good"], f["porpersona"],
                     "PASA" if f["good"] >= meta else "-", f["OEE"] * 100))
    return dict(filas=filas, meta=meta, kopt=kopt, base=base, micro=micro, CI=CI)


if __name__ == "__main__":
    print("=" * 78)
    print("VIAJE AL FUTURO - calibracion con los tiempos de referencia")
    print("=" * 78)
    a = analisis(W0, BASE, "REFERENCIA (estimados de las fotos)")

    # ── lo que tiene que ser cierto para que el Paso 3 ensene ─────────────────────────
    filas = a["filas"]
    goods = [f["good"] for f in filas]
    pp    = [f["porpersona"] for f in filas]

    print("\n" + "-" * 78)
    print("INVARIANTES")
    ok = True
    def chk(nombre, cond, detalle=""):
        global ok
        print("  [%s] %s %s" % ("ok" if cond else "FALLA", nombre, detalle))
        if not cond: ok = False

    print("  DUROS - si alguno falla, el modelo esta mal")
    outs = [f["out"] for f in filas]
    chk("mas puestos nunca produce menos",
        all(outs[i] <= outs[i + 1] for i in range(len(outs) - 1)))
    # las buenas llevan azar: se admite 2% de ruido, no una caida real
    chk("las piezas buenas tampoco caen (con 2% de tolerancia por el azar)",
        all(goods[i + 1] >= goods[i] * 0.98 for i in range(len(goods) - 1)))
    chk("la meta se alcanza sin usar todos los puestos",
        a["kopt"] is not None and a["kopt"] <= 0.85 * filas[-1]["N"],
        "meta %d se logra con %s puestos de %d posibles"
        % (a["meta"], a["kopt"], filas[-1]["N"]))
    chk("la meta NO se logra con la linea de hoy",
        a["base"]["good"] < a["meta"])

    print("  BLANDOS - enriquecen la leccion; dependen de como caigan los tiempos")
    des = desperdicio(filas)
    chk("existe una dotacion que quema sueldos (la trampa)",
        des is not None,
        ("pasar de %d a %d puestos baja las piezas por persona de %.0f a %.0f"
         % (des[0]["N"], des[1]["N"], des[0]["porpersona"], des[1]["porpersona"]))
        if des else "")
    esc = escalon(filas)
    chk("existe el escalon: una tanda de gente no compra nada y la siguiente si",
        esc is not None,
        ("de %d a %d puestos, %.0f piezas por persona nueva; de %d a %d, %.0f (x%.0f)" % esc)
        if esc else "")
    # ── el barrido: la leccion no puede depender de mis estimados ─────────────────────
    # Manana miden con cronometro y los tiempos van a ser otros. Si el juego solo funciona
    # con MIS numeros, no sirve. Se prueban 40 juegos de tiempos a +-40%.
    print("\n" + "-" * 78)
    print("BARRIDO - 40 juegos de tiempos a +-40% de la referencia")
    rng = mk(7)
    duros, con_trampa, con_escalon, kopts = [], 0, 0, []
    for it in range(40):
        W = [max(3.0, round(w * (0.6 + 0.8 * rng()), 1)) for w in W0]
        d = dict(BASE)
        # el lote medido escala con el trabajo: se mantiene la proporcion del informe
        d["lote_seg"] = round(BASE["lote_seg"] * sum(W) / sum(W0), 0)
        r = analisis(W, d, verbose=False)
        f = r["filas"]
        g = [x["good"] for x in f]
        o = [x["out"] for x in f]
        kopts.append(r["kopt"])
        mal = []
        if not all(o[i] <= o[i + 1] for i in range(len(o) - 1)): mal.append("produccion no monotona")
        if not all(g[i + 1] >= g[i] * 0.98 for i in range(len(g) - 1)): mal.append("buenas caen mas de 2%")
        if r["kopt"] is None: mal.append("meta inalcanzable")
        elif r["kopt"] > 0.85 * f[-1]["N"]: mal.append("meta exige el tope")
        elif r["kopt"] < 0.35 * f[-1]["N"]: mal.append("meta trivial")
        if r["base"]["good"] >= r["meta"]: mal.append("la linea de hoy ya cumple")
        if mal: duros.append((it, sum(W), mal))
        if desperdicio(f): con_trampa += 1
        if escalon(f):     con_escalon += 1

    print("  DUROS  - juegos con el modelo roto: %d de 40" % len(duros))
    for it, w, mal in duros[:6]:
        print("    #%-2d trabajo %.0f s -> %s" % (it, w, ", ".join(mal)))
    validos = [k for k in kopts if k]
    if validos:
        print("    puestos necesarios para la meta: min %d, max %d, tipico %d"
              % (min(validos), max(validos), sorted(validos)[len(validos) // 2]))
    print("  BLANDOS - cuantas veces aparece cada leccion:")
    print("    la dotacion que quema sueldos: %d de 40" % con_trampa)
    print("    el escalon:                    %d de 40" % con_escalon)
    print("    (cuando no aparecen, el Paso 3 sigue ensenando balanceo y meta;")
    print("     la app detecta si estan en SUS datos y solo entonces los muestra)")

    chk("el modelo aguanta el barrido (cero juegos rotos)", len(duros) == 0,
        "%d/40 rotos" % len(duros))
    chk("la trampa aparece en la mayoria de los casos", con_trampa >= 24,
        "%d/40" % con_trampa)

    print("\n" + "=" * 78)
    print("RESULTADO:", "LISTO PARA INTERFAZ" if ok else "NO PASA - hay que rediseniar")
    print("=" * 78)


# ── contrato para drive-viaje.mjs ─────────────────────────────────────────────────────
# Los valores que la interfaz TIENE que mostrar con su configuracion de arranque.
# Si el navegador no reproduce esto al decimal, la sombra no es espejo y la app miente.
def contrato(seg=None, cortes=None):
    import json
    cortes = cortes or [2, 4, 6, 8, 10, 12, 15]
    seg    = seg or [32, 32, 32, 26, 17, 14, 30]
    W = [0.0] * len(W0); p = 0
    for k, c in enumerate(cortes):
        ref = sum(W0[i] for i in range(p, c))
        for i in range(p, c): W[i] = seg[k] * W0[i] / ref
        p = c
    d = dict(BASE); d["cortes"] = cortes; d["puestos"] = len(cortes)
    mic = micro_de_datos(d); CI = ciclo_ideal(W)
    man = oee_manual(d, CI)
    base = sim(cortes, W, mic, CI=CI)
    vistos, filas = set(), []
    for k in range(1, len(W0) + 1):
        c, _ = mejor_cortes(k, W)
        if c is None or tuple(c) in vistos: continue
        vistos.add(tuple(c))
        r = sim(c, W, mic, CI=CI)
        filas.append(dict(N=len(c), cortes=c, takt=round(max(sum(W[a:b])
                     for a, b in zip([0] + c[:-1], c)), 6),
                     good=r["good"], out=r["out"], OEE=round(r["OEE"], 9),
                     pp=round(r["good"] / len(c), 6)))
    meta = meta_del_dia(base["good"], [dict(N=f["N"], good=f["good"]) for f in filas])
    minimo = next((f for f in filas if f["good"] >= meta), None)
    # lo alcanzable con EXACTAMENTE n personas: cuando contratar no compra nada, la fila
    # repite el numero anterior y ahi se ve el escalon.
    por_gente = []
    for n in range(1, len(W0) + 1):
        f = None
        for x in filas:
            if x["N"] <= n: f = x
        por_gente.append(dict(N=n, good=f["good"] if f else 0, repite=bool(f and f["N"] < n)))
    return dict(
        CI=CI, trabajo=round(sum(W), 6), takt_base=round(max(sum(W[a:b])
            for a, b in zip([0] + cortes[:-1], cortes)), 6),
        micro=list(mic),
        manual=dict(D=round(man["D"], 9), R=round(man["R"], 9), Q=round(man["Q"], 9),
                    OEE=round(man["OEE"], 9)),
        lote_predicho=round(lote_sombra(W, cortes, d), 6),
        lote_medido=d["lote_seg"],
        turno=dict(good=base["good"], out=base["out"], OEE=round(base["OEE"], 9)),
        meta=meta, minimo=minimo, filas=filas, por_gente=por_gente)


if __name__ == "__main__":
    import json, os
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), "esperado-viaje.json")
    with open(ruta, "w") as f:
        json.dump(contrato(), f, indent=1, ensure_ascii=False)
    print("\ncontrato escrito en", os.path.basename(ruta))
