# -*- coding: utf-8 -*-
"""La escalera definitiva. Cada nivel: la jugada correcta pasa, la intuitiva falla."""
from cal7 import *
c7,_=mejor_cortes(7); c9,_=mejor_cortes(9); c10,_=mejor_cortes(10)
c5,tk5=mejor_cortes(10,W5)
assert abs(sum(W5)-sum(W0))<1e-9, "la referencia nueva debe tener el mismo trabajo total"
def tramos(c,W): return [round(sum(W[a:b]),1) for a,b in zip([0]+c[:-1],c)]
print("W0 total %.0f s | W5 total %.0f s"%(sum(W0),sum(W5)))
print("cortes HOY      ",HOY," takt %.1f"%max(tramos(HOY,W0)))
print("cortes  7 optimo",c7," takt %.1f"%max(tramos(c7,W0)))
print("cortes  9 optimo",c9," takt %.1f"%max(tramos(c9,W0)))
print("cortes 10 optimo",c10," takt %.1f"%max(tramos(c10,W0)))
print("cortes N5 optimo",c5," takt %.1f"%tk5)
print("N5 con los cortes de ayer:",tramos(c10,W5),"-> takt %.1f"%max(tramos(c10,W5)))

def fmt(nom,r,meta_ok):
    print("   %-44s %5.1f%% %5.1f%% %5.1f%% | OEE %5.1f%% | %5d buenas  %s"%(
        nom,r["D"]*100,r["R"]*100,r["Q"]*100,r["OEE"]*100,r["good"],
        "PASA" if meta_ok(r) else "falla"))

print("\n══ NIVEL 1 · La linea de hoy · 7 personas · meta takt <= 30,0 s")
for n,c in [("correcto: recortar a 7 puestos parejos",c7),("errado: dejar los cortes de hoy",HOY)]:
    r=sim(cortes=c); fmt(n,r,lambda r,c=c: max(tramos(c,W0))<=30.0)

print("\n══ NIVEL 2 · El escalon · hasta 10 personas · meta takt <= 20,0 s")
for n,c in [("correcto: 10 puestos",c10),("errado: 9 puestos",c9),("errado: 8 puestos",mejor_cortes(8)[0])]:
    r=sim(cortes=c); fmt(n,r,lambda r,c=c: max(tramos(c,W0))<=20.0)

M3=lambda r: r["OEE"]>=.72
print("\n══ NIVEL 3 · La propuesta de la IA · reconfigurable · meta OEE >= 72 %")
fmt("correcto: 1 cambio temprano",      jornada([(HOY,.10*T),(c10,T)]),M3)
fmt("errado: 2 cambios tanteando",      jornada([(HOY,.15*T),(c9,.45*T),(c10,T)]),M3)
fmt("errado: 4 cambios tanteando",      jornada([(HOY,.12*T),(c7,.30*T),(c9,.50*T),(mejor_cortes(8)[0],.70*T),(c10,T)]),M3)
fmt("errado: no tocar nada",            jornada([(HOY,T)]),M3)

M4=lambda r: r["OEE"]>=.70
print("\n══ NIVEL 4 · Equipo viejo (el doble de averias) · meta OEE >= 70 %")
fmt("correcto: 1 cambio temprano",      jornada([(HOY,.10*T),(c10,T)],relx=.5),M4)
fmt("errado: 2 cambios",                jornada([(HOY,.15*T),(c9,.45*T),(c10,T)],relx=.5),M4)
fmt("errado: no tocar nada",            jornada([(HOY,T)],relx=.5),M4)

M5=lambda r: r["good"]>=1000
print("\n══ NIVEL 5 · Referencia nueva · arranca con la asignacion de ayer · meta >= 1.000 buenas")
fmt("correcto: 1 cambio al reparto nuevo",jornada([(c10,.10*T),(c5,T)],W=W5),M5)
fmt("errado: quedarse con lo de ayer",    jornada([(c10,T)],W=W5),M5)
fmt("errado: 3 cambios tanteando",        jornada([(c10,.12*T),(c7,.35*T),(c9,.6*T),(c5,T)],W=W5),M5)
