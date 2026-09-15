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

> **Ya está aplicado** en el proyecto `bitacora-mega` (`chrxwcffqugyikvhmfbb`), junto con
> los cuatro módulos y los once talleres del Módulo 1. Esta sección queda para el segundo
> cliente. Si no tienes el puerto 5432 alcanzable, `pnpm seed:sql` emite el mismo contenido
> como guion SQL para pegar en el editor del panel, y `supabase/tests/aislamiento-remoto.sql`
> verifica las políticas sin borrar nada.

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
3. Pulsa **Import** junto a `Alquimia`. El proyecto queda con el nombre `alquimia`.

### 4.2 Cambiar la rama de producción — no te saltes esto

La rama por defecto del repositorio es `claude/alquimia-market-strategy-22nbvx`, que **no
tiene la aplicación**: solo documentos. Desplegarla no da un error de construcción — da
algo peor, porque pasa desapercibido: la construcción termina en verde y la URL responde
**404 NOT_FOUND**, porque no hay ninguna página que servir.

La pantalla de importación de Vercel **no ofrece elegir rama** (comprobado en el import
real de septiembre de 2026), así que esto se arregla siempre después de importar:

1. Proyecto → **Settings** → **Environments** → **Production**
2. Tarjeta **Branch Tracking** → `claude/alchemy-workshop-interactive-8f4qsp` → **Save**
3. **Deployments** → en el último, menú **`···`** → **Redeploy**

No está en *Settings → Git*, que es donde lo pone casi toda la documentación vieja:
Vercel lo movió a *Environments*. Y ojo con **Settings** del equipo frente a **Settings**
del proyecto — son dos páginas distintas con el mismo nombre; la buena cuelga del nombre
del proyecto, no del equipo.

> **Desactiva la traducción automática del navegador antes de tocar nada.** Chrome traduce
> los nombres de rama y de dominio que aparecen en pantalla: `claude/alchemy-workshop-...`
> se lee como `claude/taller-de-alquimia-...` y `alquimia-eight.vercel.app` como
> `alquimia-ocho.vercel.app`. Ninguno de los dos existe. Copiar uno de esos nombres
> traducidos a un campo de configuración deja el proyecto apuntando a la nada.

Una vez guardada la rama, cada `git push` a `claude/alchemy-workshop-interactive-8f4qsp`
genera un despliegue de producción por sí solo. No hay que volver a entrar aquí.

Y antes de tener eso resuelto, cada rama con un commit nuevo recibe igualmente su propia
**vista previa**: es la vía rápida para ver la aplicación viva sin tocar producción.

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
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → `service_role` | los tres |
| `NEXT_PUBLIC_SITIO_URL` | la URL del despliegue (paso 4.6) | los tres |

Son cuatro y no más. **La clave de Resend no va aquí**: quien manda las
invitaciones y los enlaces de recuperación es Supabase Auth, así que Resend se
configura en el panel de Supabase (**Authentication → SMTP Settings**). Ponerla
en Vercel no haría nada — ningún código de la aplicación la lee.

Las dos que empiezan por `NEXT_PUBLIC_` viajan al navegador por diseño: no son secretas.
**`SUPABASE_SERVICE_ROLE_KEY` sí lo es y salta todas las políticas de seguridad**: no la
renombres nunca con el prefijo `NEXT_PUBLIC_`, no la pegues en un chat y no la subas al
repositorio.

### 4.5 Desplegar

Pulsa **Deploy**. La primera construcción tarda dos o tres minutos.

Si termina en verde pero la URL responde **404 NOT_FOUND**, la construcción no falló: está
sirviendo la rama equivocada. Vuelve al paso 4.2.

### 4.6 Cerrar el círculo de la URL

Ya con la URL que Vercel asignó (en el despliegue de la Cámara fue
`https://alquimia-eight.vercel.app`):

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
