# Alquimia

## Bitácora MEGA

Plataforma de los talleres del programa **Empresas con Propósito MEGA** de la Cámara de
Comercio del Aburrá Sur. Nace del prototipo `docs/taller-mega-modulo-1.html`, que
convertía el PowerPoint del Módulo 1 en una experiencia guiada pero servía a una sola
persona sin identidad ni aislamiento.

| | |
|---|---|
| Cómo montarla | **[`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md)** — cuentas, esquema, cohorte y costos |
| Probar el motor sin cuentas | `bash scripts/db-local.sh test && pnpm seed && pnpm dev`, y abrir `/estilos` |
| Prototipo original | [`docs/taller-mega-modulo-1.html`](docs/taller-mega-modulo-1.html), conservado como referencia |

### Cómo está armada

- **Los talleres son datos, no código.** Cada taller es un documento de bloques en
  `talleres.definicion`; nueve tipos cubren los once del Módulo 1. Publicar los módulos
  2 a 4 será insertar filas, no escribir funciones de render.
- **Una fila por campo, no un blob.** Es lo que permite que varias personas de la misma
  empresa editen a la vez sin borrarse el trabajo. Las filas dinámicas tienen
  identificador propio, así que agregar un competidor en paralelo no colisiona.
- **El aislamiento vive en Postgres.** Row Level Security decide qué ve cada quien: el
  equipo de la empresa lo suyo, el facilitador su cohorte en lectura más comentarios, y
  nadie alcanza otra cohorte. `supabase/tests/rls.test.sql` lo prueba con 21 afirmaciones.

```
app/          páginas · lib/talleres  motor de talleres · lib/datos  guardado por campo
components/   campos y gamificación   · supabase/  migraciones, pruebas y semilla
scripts/      base local, siembra, carga de cohorte y verificaciones
```

### Verificaciones

```bash
pnpm check    # tipos y compilación
pnpm test:rls # aislamiento entre empresas y entre cohortes
pnpm verify   # el progreso de TypeScript coincide con el de SQL; el importador cae en campos reales
```

---


Empresa de tecnología con base en Medellín, Colombia. Enfoque: resolver problemas
reales con software, como especialista en un ultranicho vertical y no como
generalista.

## Estrategia de entrada al mercado

El documento principal es **[`docs/INFORME-FINAL.md`](docs/INFORME-FINAL.md)** —
el dossier consolidado con la decisión B2B, el ultranicho recomendado, el mapa
competitivo, el modelo financiero y un plan de 18 meses.
La versión navegable con simulador financiero interactivo está en
`docs/dossier-alquimia.html`.

### Conclusiones

| Decisión | Resumen |
|---|---|
| Mercado | **B2B**, no B2C — el churn LatAm (8,2% mensual) y el poder adquisitivo descartan el consumo |
| Segmento | Las **10.128 pequeñas y medianas** de Antioquia, no las 148.014 microempresas |
| Ultranicho | **Cartera y glosas de IPS pequeñas** frente a EPS intervenidas ($58 billones de deuda) |
| Financiación | Consultoría en el mismo vertical + Fondo Emprender ($140.072.400 condonables) |
| Equilibrio | 29 clientes a $890.000/mes con margen del 80% |

## Investigación de respaldo

| Ruta | Contenido |
|---|---|
| [`docs/investigacion/01-mercado-ecosistema.md`](docs/investigacion/01-mercado-ecosistema.md) | Mercado TI de Colombia, tejido empresarial de Antioquia, ecosistema de innovación, macro y regulación 2026 |
| [`docs/investigacion/02-ultranichos.md`](docs/investigacion/02-ultranichos.md) | Doce ultranichos verticales evaluados y puntuados |
| [`docs/investigacion/03-competencia.md`](docs/investigacion/03-competencia.md) | Fábricas de software, SaaS vertical colombiano, tarifas y huecos de mercado |
| [`docs/finanzas/04-esquema-financiero.md`](docs/finanzas/04-esquema-financiero.md) | Constitución, costo laboral, impuestos, opex, financiación y unit economics |

Cada informe marca explícitamente con `[ESTIMADO]` o `[NO VERIFICADO]` los datos
que no se pudieron confirmar en fuente primaria. Verificar antes de usarlos en un
plan de negocio formal, una postulación a convocatoria o una presentación a
inversionistas.
