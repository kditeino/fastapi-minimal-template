#!/usr/bin/env bash
# ============================================================================
# First-time database initialization for the docker-compose stack.
#
# Creates all FBA tables, seeds the default admin user, then applies our
# custom menu tree. Safe to re-run — it's destructive, so it wipes any
# existing data in the `fba` database each time.
#
# Usage:
#   ./scripts/docker-init.sh
# ============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

MYSQL_PWD="${MYSQL_ROOT_PASSWORD:-fba_root_pwd}"
MYSQL_DB="${MYSQL_DATABASE:-fba}"

# Pick up host overrides from .env if present
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  set -a; source .env; set +a
  MYSQL_PWD="${MYSQL_ROOT_PASSWORD:-$MYSQL_PWD}"
  MYSQL_DB="${MYSQL_DATABASE:-$MYSQL_DB}"
fi

echo "➜ Checking that the compose stack is running…"
if ! docker compose ps --status running --services | grep -q fba-backend; then
  echo "✗ fba-backend container isn't running. Start it first with:"
  echo "    docker compose up -d --build"
  exit 1
fi

echo "➜ Waiting for MySQL to be healthy…"
for _ in {1..30}; do
  if docker compose exec -T fba-mysql mysqladmin ping -h localhost -uroot "-p${MYSQL_PWD}" --silent 2>/dev/null; then
    break
  fi
  sleep 2
done

echo "➜ Running 'fba init' (drops + recreates tables, seeds default admin)…"
docker compose exec -T fba-backend bash -c 'cd /fba && printf "y\n" | fba init'

echo "➜ Applying custom menu seed (fba-seed/minimal_menus.sql)…"
docker compose exec -T fba-mysql mysql -uroot "-p${MYSQL_PWD}" "${MYSQL_DB}" < fba-seed/minimal_menus.sql

echo "➜ Clearing Redis cache so the sidebar endpoint reloads…"
docker compose exec -T fba-redis sh -c "redis-cli --scan --pattern 'fba:*' | xargs -r redis-cli DEL" >/dev/null || true

cat <<'EOF'

✓ Done. Open the frontend:

    http://localhost:${FRONTEND_PORT:-8080}/

Default admin:  admin / 123456
EOF
