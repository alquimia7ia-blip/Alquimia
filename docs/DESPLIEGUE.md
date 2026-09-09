# Poner la Bitácora MEGA en producción

Guía paso a paso. Nada de esto requiere tarjeta para empezar.

## 1. Las tres cuentas

| Servicio | Para qué | Qué crear |
|---|---|---|
| [Supabase](https://supabase.com) | Base de datos, cuentas y tiempo real | Organización `Alquimia`, proyecto `bitacora-mega` |
| [Vercel](https://vercel.com) | Despliegue de la aplicación | Importar el repositorio `alquimia7ia-blip/Alquimia` |
| [Resend](https://resend.com) | Correos de invitación | Una clave de API |

**Región de Supabase: `us-east-1` (N. Virginia).** Desde Medellín son unos 60-80 ms
contra los ~130 ms de São Paulo. Al crear el proyecto, Supabase muestra una vez la
contraseña de la base de datos: guárdala, no se puede recuperar después.

**Por qué Resend y no el correo que trae Supabase.** El envío integrado de Supabase está
limitado a unos pocos correos por hora — suficiente para probar, no para invitar a
treinta empresas la misma tarde. En Supabase se configura en
**Project Settings → Authentication → SMTP Settings**, con el servidor SMTP de Resend.

## 2. Aplicar el esquema

Con la cadena de conexión del proyecto (Supabase → Project Settings → Database →
Connection string → URI):

```bash
export DATABASE_URL="postgresql://postgres:TU-CLAVE@db.xxxx.supabase.co:5432/postgres"

for m in supabase/migrations/*.sql; do psql "$DATABASE_URL" -f "$m"; done
```

No apliques `supabase/tests/00_shim_local.sql`: ese archivo solo existe para desarrollar
sin Supabase y el esquema `auth` real ya está en el proyecto.

Después, verifica el aislamiento contra la base real:

```bash
psql "$DATABASE_URL" -f supabase/tests/rls.test.sql
```

Debe terminar en `Aislamiento verificado`. **Si no pasa, no sigas**: sin esas políticas,
dos empresas de la misma cohorte podrían verse las cifras del Taller 8.

> La prueba borra y vuelve a sembrar datos de ejemplo. Córrela solo antes de cargar la
> cohorte real, nunca sobre una base con trabajo de empresas dentro.

## 3. Sembrar el contenido del programa

```bash
DATABASE_URL="…" pnpm seed
```

Inserta la organización, el programa, los cuatro módulos y los once talleres del Módulo 1.
Es idempotente: se puede repetir cada vez que cambie el contenido.

## 4. Vercel, paso a paso

### 4.1 Importar el repositorio

1. Entra a [vercel.com/new](https://vercel.com/new) con el equipo **Alquimia** seleccionado
   en el menú de arriba a la izquierda.
2. En **Import Git Repository**, si no aparece `alquimia7ia-blip/Alquimia`, pulsa
   **Adjust GitHub App Permissions** (o **Add GitHub Account**). Se abre GitHub para
   autorizar la aplicación de Vercel: concédele acceso al repositorio `Alquimia`.
   Este paso solo lo puede hacer el dueño de la cuenta de GitHub.
3. Pulsa **Import** junto a `Alquimia`.

> Si en la lista de proyectos ya existe uno llamado **`bitacora-mega`** vacío y sin
> repositorio conectado, bórralo antes (**Settings → Advanced → Delete Project**). Quedó
> de un intento fallido de conectarlo por API.

### 4.2 Cambiar la rama de producción — no te saltes esto

La rama por defecto del repositorio es `claude/alquimia-market-strategy-22nbvx`, que **no
tiene la aplicación**: solo documentos. Si despliegas sin cambiarla, la construcción falla
con un error de que no encuentra nada que construir.

En la pantalla de importación, despliega **Git Branch** y elige:

```
claude/alchemy-workshop-interactive-8f4qsp
```

Si ya importaste sin cambiarla, se arregla después en
**Settings → Git → Production Branch**, y luego **Deployments → ⋯ → Redeploy**.

### 4.3 Ajustes de construcción

No toques nada. Vercel detecta Next.js por `next.config.ts` y usa pnpm porque el
repositorio trae `pnpm-lock.yaml`. El directorio raíz es la raíz del repositorio.

### 4.4 Variables de entorno

En la misma pantalla de importación, despliega **Environment Variables**. Si todavía no
tienes el proyecto de Supabase, **puedes desplegar sin ellas**: la aplicación no se cae,
aterriza en `/configuracion` diciendo cuál falta, y desde ahí se llega al taller
funcionando sobre el navegador.

| Variable | De dónde sale | Entornos |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | los tres |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon public` | los tres |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` | los tres |
| `RESEND_API_KEY` | Resend → API Keys | los tres |
| `CORREO_REMITENTE` | p. ej. `Bitácora MEGA <hola@tu-dominio.co>` | los tres |
| `NEXT_PUBLIC_SITIO_URL` | la URL del despliegue (paso 4.6) | los tres |

Las dos que empiezan por `NEXT_PUBLIC_` viajan al navegador por diseño: no son secretas.
**`SUPABASE_SERVICE_ROLE_KEY` sí lo es y salta todas las políticas de seguridad**: no la
renombres nunca con el prefijo `NEXT_PUBLIC_`, no la pegues en un chat y no la subas al
repositorio.

### 4.5 Desplegar

Pulsa **Deploy**. La primera construcción tarda dos o tres minutos. Si falla, casi siempre
es la rama del paso 4.2.

### 4.6 Cerrar el círculo de la URL

Ya con la URL (algo como `https://bitacora-mega.vercel.app`):

1. **En Vercel**, edita `NEXT_PUBLIC_SITIO_URL` con esa URL y vuelve a desplegar
   (**Deployments → ⋯ → Redeploy**). Sin esto, los enlaces de invitación que salen por
   correo apuntan a `localhost`.
2. **En Supabase**, ve a **Authentication → URL Configuration** y pon esa misma URL en
   **Site URL**; en **Redirect URLs** agrega `https://tu-url.vercel.app/invitacion`.
   Sin esto, Supabase rechaza el enlace del correo por venir de un destino no autorizado.

### 4.7 Si la URL pide iniciar sesión en Vercel

Los proyectos nuevos heredan la protección de despliegue del equipo. Si al abrir la URL
aparece una pantalla de Vercel pidiendo autenticación, ve a
**Settings → Deployment Protection** y desactiva **Vercel Authentication** para producción.
De lo contrario nadie de la Cámara podrá abrirla.

### 4.8 Plan

El equipo está hoy en **Hobby**, cuyos términos **prohíben el uso comercial**. Sirve para
probar y para mostrar. En el momento en que se le facture a la Cámara, hay que pasar a
**Pro (USD 20/mes)**.

## 5. Dar de alta la cohorte

Un CSV con encabezado y estas columnas — `empresa` y `correo` son obligatorias:

```csv
empresa,nit,correo,nombre,municipio,sector
Panadería La Espiga,900123456,contacto@laespiga.co,María Restrepo,Envigado,Alimentos
```

```bash
pnpm cohorte -- --csv empresas.csv --cohorte "MEGA 2026-1"
```

Crea las empresas, las inscribe en la cohorte, abre sus bitácoras con las filas iniciales
ya puestas, invita por correo a cada contacto y le deja la membresía como propietario de
su empresa. Es idempotente: volver a correrlo no duplica nada y solo reinvita a quien no
ha entrado todavía.

Cada persona recibe un enlace, define su contraseña, autoriza el tratamiento de datos y
entra directo a su bitácora.

A partir de ahí, **quien administra cada empresa suma a sus compañeros desde `/equipo`**
sin volver a pasar por aquí: escribe el correo, elige si podrá responder o solo leer, y el
sistema envía la invitación. Es lo que hace que el taller lo resuelva un equipo y no una
sola persona.

## 6. Registrar a los facilitadores

Todavía no hay pantalla para esto: se hace con una consulta, una vez por cohorte.

```sql
insert into facilitadores_cohorte (perfil_id, cohorte_id)
select p.id, c.id
from perfiles p, cohortes c
where p.id = (select id from auth.users where email = 'hernando@ejemplo.co')
  and c.nombre = 'MEGA 2026-1';
```

El facilitador debe tener cuenta antes: invítalo con
`db.auth.admin.inviteUserByEmail` o desde el panel de Supabase (Authentication → Users →
Invite).

## 7. Qué cuesta

Mientras solo lo use el equipo, los tres planes gratuitos alcanzan: **USD 0**.

Antes de abrir la cohorte real hay que pasar a pago, por dos razones concretas:

- **Supabase Pro · USD 25/mes.** El plan gratuito **pausa el proyecto tras 7 días de
  inactividad**. El programa deja tres semanas de trabajo autónomo entre sesiones: se
  pausaría con certeza, y las empresas encontrarían la plataforma caída justo cuando se
  sientan a trabajar.
- **Vercel Pro · USD 20/mes.** El plan Hobby **prohíbe el uso comercial**. En cuanto se le
  cobre a la Cámara, hay que estar en Pro.

Total: **~USD 45/mes** para 30 empresas y unos 90 usuarios, muy por debajo de las cuotas
incluidas — Supabase Pro trae 100.000 usuarios activos y 8 GB, y una bitácora completa
pesa menos de 100 KB.

El dominio propio no hace falta al principio: Vercel da un subdominio `.vercel.app`.

## 8. Antes de la primera cohorte real

Esto no es técnico y no se puede saltar:

- [ ] **Contrato de transmisión de datos** firmado con la Cámara. Ella es responsable del
      tratamiento; quien opera la plataforma es encargado. Sin ese contrato, el encargado
      asume responsabilidad de responsable sin quererlo.
- [ ] **Política de tratamiento** revisada y adoptada. La de `/politica-de-datos` es un
      borrador con campos entre corchetes por completar.
- [ ] Confirmar con la Cámara si le aplica el **registro de bases de datos ante la SIC**.
- [ ] Definir **cuánto tiempo se conservan** las respuestas al terminar el programa y qué
      pasa con ellas.

## Desarrollo local sin Supabase

Para trabajar en el motor de talleres no hace falta cuenta ni Docker:

```bash
bash scripts/db-local.sh test   # Postgres local, migraciones y pruebas de RLS
pnpm seed                       # contenido del Módulo 1
pnpm verify                     # progreso e importador
pnpm dev                        # y abre /estilos
```

`/estilos` renderiza los once talleres reales contra una bitácora en memoria, sin sesión
ni base de datos. Es el banco de pruebas para los tipos de bloque nuevos cuando lleguen
los módulos 2 a 4.
