#!/usr/bin/env bash
# Levanta un Postgres local y aplica las migraciones, sin Docker ni la CLI
# de Supabase. Sirve para desarrollar y para correr las pruebas de RLS.
#
#   bash scripts/db-local.sh          → recrea la base y aplica migraciones
#   bash scripts/db-local.sh test     → lo anterior y corre las pruebas de RLS
set -euo pipefail

PGBIN=${PGBIN:-/usr/lib/postgresql/16/bin}
PGD=${PGD:-/var/lib/postgresql/bitacora}
PORT=${PGPORT_LOCAL:-5433}
SOCK=/var/run/postgresql
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -d "$PGD/base" ]; then
  echo "→ creando clúster en $PGD"
  mkdir -p "$PGD" "$SOCK"
  chown -R postgres:postgres "$PGD" "$SOCK"
  su postgres -c "$PGBIN/initdb -D $PGD -U postgres --auth=trust" >/dev/null
fi

if ! su postgres -c "$PGBIN/pg_ctl -D $PGD status" >/dev/null 2>&1; then
  echo "→ arrancando Postgres en el puerto $PORT"
  su postgres -c "$PGBIN/pg_ctl -D $PGD -o '-p $PORT' -l $PGD/server.log start" >/dev/null
  sleep 2
fi

export PGHOST=$SOCK PGPORT=$PORT PGUSER=postgres

echo "→ recreando la base 'bitacora'"
psql -q -d postgres -c "drop database if exists bitacora;" >/dev/null
psql -q -d postgres -c "create database bitacora;" >/dev/null

echo "→ shim local del esquema auth (en Supabase ya existe)"
psql -q -d bitacora -v ON_ERROR_STOP=1 -f "$RAIZ/supabase/tests/00_shim_local.sql"

for m in "$RAIZ"/supabase/migrations/*.sql; do
  echo "→ $(basename "$m")"
  psql -q -d bitacora -v ON_ERROR_STOP=1 -f "$m"
done

if [ "${1:-}" = "test" ]; then
  echo ""
  salida=$(psql -d bitacora -f "$RAIZ/supabase/tests/rls.test.sql" 2>&1)
  echo "$salida" | grep -E "ok ·|FALLA|^ERROR|──|═══" || true
  if echo "$salida" | grep -qE "FALLA|^psql.*ERROR"; then
    echo ""; echo "✗ las pruebas de aislamiento NO pasaron"; exit 1
  fi
  echo ""; echo "✓ $(echo "$salida" | grep -c 'ok ·') afirmaciones de aislamiento en verde"
fi
