# -*- coding: utf-8 -*-
"""SIN PARAR - calibrador. Se corre ANTES de escribir interfaz.
El motor de aqui debe quedar identico al de sin-parar.html: mismo paso fijo,
misma semilla, mismas reglas. Si no coinciden al decimal, algo esta mal."""

STEP  = 0.25
SEED  = 11
CAP   = 4          # cola entre puestos
T     = 28800.0    # jornada de 8 h
PARADA= 2100.0     # reconfigurar la linea real: 35 min

# ── la cadena: 28 tareas, precedencia estricta ────────────────────────────────
NOM = ["Tomar placa base","Montar esparrago A","Montar esparrago B","Montar esparrago C",
       "Media placa transparente A","Media placa transparente B",
       "Inserto triangulo","Inserto pentagono","Inserto cilindro 1","Inserto cilindro 2",
       "Media placa amarilla A","Media placa amarilla B",
       "Insertos amarillos formas","Insertos amarillos cilindros",
       "Media placa verde A","Media placa verde B",
       "Insertos verdes formas","Insertos verdes cilindros",
       "Media placa azul A","Media placa azul B",
       "Insertos azules formas","Insertos azules cilindros",
       "Tuercas formas 1-2","Tuercas formas 3-4","Tuercas esparragos",
       "Tapa de tres brazos","Tornillo central","Inspeccion final"]
W0 = [4,5,5,5, 8,8, 5,5,5,5, 6.5,6.5,6,6, 6.5,6.5,6,6, 6.5,6.5,6,6, 8,8,9, 9,10,8]
# nivel 5: otra referencia, mismo trabajo total, repartido distinto
W5 = [4,5,5,5, 15,15, 4.5,4.5,4.5,4.5, 5,5,5, 5,5,5, 5,5,5, 5,5,5, 9,8, 9,9, 11,9]

# maquinas: tarea -> (mtbf, mttr). Siguen a la tarea, no al puesto.
MAQ = {4:(2600.0,40.0), 24:(2200.0,55.0), 26:(1800.0,70.0)}
MICRO = (3200.0, 50.0)   # micro-parada de cualquier puesto: material, relevo
# defectos por tarea (probabilidad por unidad)
DEF = [.0004]*28
for i in (6,7,8,9,12,13,16,17,20,21): DEF[i]=.0010   # insertos: se montan chuecos
for i in (22,23,24):                  DEF[i]=.0014   # tuercas: se pasan de rosca
DEF[26]=.0016                                        # torque

SOBRE_K, SOBRE_X = 1.15, 2.5   # puesto sobrecargado -> se equivoca mas
CI_FIJO = sum(W0)/10           # 18,2 s: velocidad de diseno de la linea

def mk(seed):
    a=[seed & 0xFFFFFFFF]
    def r():
        a[0]=(a[0]+0x6D2B79F5)&0xFFFFFFFF
        t=a[0]
        t=(t^(t>>15))*(t|1)&0xFFFFFFFF
        t^=(t+((t^(t>>7))*(t|61)&0xFFFFFFFF))&0xFFFFFFFF
        return (((t^(t>>14))&0xFFFFFFFF))/4294967296.0
    return r

def puestos(cortes):
    """cortes = indices donde termina cada puesto (el ultimo es 28)"""
    r=[];p=0
    for c in cortes: r.append(list(range(p,c))); p=c
    return r

def sim(cortes, W=W0, paradas=0, relx=1.0, defx=1.0, T=T, seed=SEED):
    P   = puestos(cortes)
    N   = len(P)
    cyc = [sum(W[i] for i in p) for p in P]
    bn  = max(range(N), key=lambda i: cyc[i])
    CI  = CI_FIJO                        # ciclo ideal: constante, velocidad de diseno
    ideal_sobre = [c > SOBRE_K*(sum(W)/N) for c in cyc]   # sobrecarga: contra el reparto parejo
    pdef = [sum(DEF[i] for i in p)*defx*(SOBRE_X if ideal_sobre[k] else 1.0)
            for k,p in enumerate(P)]
    maqs = [[(i,MAQ[i][0]*relx,MAQ[i][1]) for i in p if i in MAQ]
            + [(-1,MICRO[0]*relx,MICRO[1])] for p in P]
    rng  = mk(seed)

    st=[{"h":False,"dn":False,"t":0.0,"buf":0,"qb":0,"dt":0.0,"bad":False,
         "down":0.0,"op":0.0,"nxt":{m[0]:m[1] for m in maqs[k]}} for k in range(N)]
    clock = paradas*PARADA               # las paradas se descuentan de la jornada
    parado= paradas*PARADA
    out=good=0

    def push(i,bad):
        nonlocal out,good
        if i==N-1:
            out+=1
            if not bad: good+=1
            return True
        if st[i+1]["buf"]<CAP:
            st[i+1]["buf"]+=1
            if bad: st[i+1]["qb"]+=1
            return True
        return False

    while clock < T:
        clock+=STEP
        for i in range(N-1,-1,-1):
            e=st[i]
            if e["dt"]>0: e["dt"]-=STEP; e["down"]+=STEP; continue
            if e["dn"]:
                if push(i,e["bad"]): e["dn"]=False
                else: continue
            if not e["h"]:
                if i==0: e["h"]=True; e["t"]=0.0; e["bad"]=False
                elif e["buf"]>0:
                    e["buf"]-=1; e["h"]=True; e["t"]=0.0
                    e["bad"]= e["qb"]>0
                    if e["qb"]>0: e["qb"]-=1
            if e["h"]:
                e["t"]+=STEP; e["op"]+=STEP
                for (mi,mb,mr) in maqs[i]:
                    if e["op"]>=e["nxt"][mi]:
                        e["dt"]=mr; e["nxt"][mi]=e["op"]+mb; break
                if e["t"]>=cyc[i]:
                    e["h"]=False; e["t"]=0.0
                    if rng()<pdef[i]: e["bad"]=True
                    if not push(i,e["bad"]): e["dn"]=True

    down = st[bn]["down"] + parado
    oper = T - down
    D = oper/T
    R = (CI*out)/oper if oper>0 else 0.0
    Q = good/out if out else 0.0
    return dict(N=N, cyc=cyc, bn=bn, takt=cyc[bn], CI=CI, out=out, good=good,
                D=D, R=R, Q=Q, OEE=D*R*Q, ctrl=CI*good/T, down=down, parado=parado)

# ── busqueda de cortes ────────────────────────────────────────────────────────
def greedy(cap, W=W0):
    cortes=[];s=0.0
    for i,x in enumerate(W):
        if x>cap: return None
        if s+x>cap: cortes.append(i); s=x
        else: s+=x
    cortes.append(len(W)); return cortes

def mejor_cortes(k, W=W0):
    lo,hi=max(W),sum(W); best=None
    for _ in range(80):
        m=(lo+hi)/2; c=greedy(m,W)
        if c and len(c)<=k: hi=m; best=c
        else: lo=m
    return best, (max(sum(W[a:b]) for a,b in zip([0]+best[:-1],best)) if best else None)

HOY=[4,10,14,18,22,25,28]
if __name__=="__main__":
    print("trabajo total %.1f s en %d tareas\n"%(sum(W0),len(W0)))
    print("%-34s %5s %6s %6s %6s %6s %7s %7s"%("","takt","D","R","C","OEE","prod","buenas"))
    def fila(nom,**kw):
        r=sim(**kw)
        print("%-34s %5.1f %5.1f%% %5.1f%% %5.1f%% %5.1f%% %7d %7d"%(
            nom, r["takt"], r["D"]*100, r["R"]*100, r["Q"]*100, r["OEE"]*100, r["out"], r["good"]))
        assert abs(r["OEE"]-r["ctrl"])<1e-9, "OEE no cuadra con el control"
        return r
    fila("HOY 7 puestos, 0 paradas", cortes=HOY)
    for k in (7,8,9,10,11):
        c,tk = mejor_cortes(k)
        fila("mejor con %2d puestos"%k, cortes=c)
    print()
    c10,_=mejor_cortes(10)
    for p in (0,1,2,4):
        fila("10 puestos optimos, %d paradas"%p, cortes=c10, paradas=p)
    print("\ncortes de hoy      :", HOY)
    print("cortes optimos 10  :", c10)

# ── jornada por fases: esto es lo que de verdad hace el juego ─────────────────
# Reconfigurar la linea real cuesta PARADA segundos Y vacia la linea: el WIP se
# pierde y hay que volver a llenarla. Ese arranque en frio es parte del costo.
def jornada(fases, W=W0, relx=1.0, defx=1.0, T=T, seed=SEED):
    """fases = [(cortes, hasta_t), ...]  -- el primer cambio no cuesta parada
    si ocurre en t=0 no: SIEMPRE cuesta, porque mover mesas siempre para la planta."""
    rng=mk(seed); clock=0.0; parado=0.0; out=good=0
    down_bn=0.0
    for k,(cortes,hasta) in enumerate(fases):
        P=puestos(cortes); N=len(P)
        cyc=[sum(W[i] for i in p) for p in P]
        bn=max(range(N), key=lambda i: cyc[i])
        sobre=[c > SOBRE_K*(sum(W)/N) for c in cyc]
        pdef=[sum(DEF[i] for i in p)*defx*(SOBRE_X if sobre[j] else 1.0) for j,p in enumerate(P)]
        maqs=[[(i,MAQ[i][0]*relx,MAQ[i][1]) for i in p if i in MAQ]
              +[(-1,MICRO[0]*relx,MICRO[1])] for p in P]
        st=[{"h":False,"dn":False,"t":0.0,"buf":0,"qb":0,"dt":0.0,"bad":False,
             "down":0.0,"op":0.0,"nxt":{m[0]:m[1] for m in maqs[j]}} for j in range(N)]
        if k>0:                       # cambiar la linea para la planta
            clock+=PARADA; parado+=PARADA
            if clock>=T: break
        def push(i,bad):
            nonlocal out,good
            if i==N-1:
                out+=1
                if not bad: good+=1
                return True
            if st[i+1]["buf"]<CAP:
                st[i+1]["buf"]+=1
                if bad: st[i+1]["qb"]+=1
                return True
            return False
        fin=min(hasta,T)
        while clock<fin:
            clock+=STEP
            for i in range(N-1,-1,-1):
                e=st[i]
                if e["dt"]>0: e["dt"]-=STEP; e["down"]+=STEP; continue
                if e["dn"]:
                    if push(i,e["bad"]): e["dn"]=False
                    else: continue
                if not e["h"]:
                    if i==0: e["h"]=True; e["t"]=0.0; e["bad"]=False
                    elif e["buf"]>0:
                        e["buf"]-=1; e["h"]=True; e["t"]=0.0
                        e["bad"]= e["qb"]>0
                        if e["qb"]>0: e["qb"]-=1
                if e["h"]:
                    e["t"]+=STEP; e["op"]+=STEP
                    for (mi,mb,mr) in maqs[i]:
                        if e["op"]>=e["nxt"][mi]:
                            e["dt"]=mr; e["nxt"][mi]=e["op"]+mb; break
                    if e["t"]>=cyc[i]:
                        e["h"]=False; e["t"]=0.0
                        if rng()<pdef[i]: e["bad"]=True
                        if not push(i,e["bad"]): e["dn"]=True
        down_bn+=st[bn]["down"]
    down=down_bn+parado; oper=T-down
    D=oper/T; R=(CI_FIJO*out)/oper if oper>0 else 0.0; Q=good/out if out else 0.0
    return dict(D=D,R=R,Q=Q,OEE=D*R*Q,out=out,good=good,parado=parado,cambios=len(fases)-1)

if __name__=="__main__":
    c7 ,_=mejor_cortes(7);  c8,_=mejor_cortes(8)
    c9 ,_=mejor_cortes(9);  c10,_=mejor_cortes(10)
    print("\n── la jornada, por fases ─────────────────────────────────────────")
    print("%-46s %3s %6s %6s %6s %6s %7s"%("","cmb","D","R","C","OEE","buenas"))
    def f(nom,fases,**kw):
        r=jornada(fases,**kw)
        print("%-46s %3d %5.1f%% %5.1f%% %5.1f%% %5.1f%% %7d"%(
            nom,r["cambios"],r["D"]*100,r["R"]*100,r["Q"]*100,r["OEE"]*100,r["good"]))
        return r
    f("no tocar nada (7 puestos de hoy)",        [(HOY,T)])
    f("GEMELO: 1 cambio, al 10% del dia",        [(HOY,.10*T),(c10,T)])
    f("TANTEO: 4 cambios probando en la linea",  [(HOY,.12*T),(c7,.30*T),(c8,.50*T),(c9,.70*T),(c10,T)])
    f("TANTEO corto: 2 cambios",                 [(HOY,.15*T),(c9,.45*T),(c10,T)])
