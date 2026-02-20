#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.lexical-prefix.yml"
BASE_URL="${LEXICAL_PREFIX_BASE_URL:-http://localhost:${LEXICAL_PREFIX_QUBICDB_PORT:-6060}}"
UI_URL="${LEXICAL_PREFIX_UI_URL:-http://localhost:${LEXICAL_PREFIX_UI_PORT:-8080}}"

cleanup() {
  if [[ "${LEXICAL_PREFIX_KEEP_UP:-0}" != "1" ]]; then
    docker compose -f "${COMPOSE_FILE}" down --remove-orphans >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

echo "[lexical-prefix] starting qubicdb + ui"
if [[ "${LEXICAL_PREFIX_REBUILD:-0}" == "1" ]]; then
  docker compose -f "${COMPOSE_FILE}" up -d --build
else
  docker compose -f "${COMPOSE_FILE}" up -d
fi

echo "[lexical-prefix] waiting for backend health"
for _ in $(seq 1 90); do
  if curl -fsS "${BASE_URL}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS "${BASE_URL}/health" >/dev/null 2>&1; then
  echo "[lexical-prefix] backend health check failed: ${BASE_URL}" >&2
  exit 1
fi

echo "[lexical-prefix] waiting for ui health"
for _ in $(seq 1 60); do
  if curl -fsS "${UI_URL}/healthz" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[lexical-prefix] running benchmark"
node "${SCRIPT_DIR}/benchmark.mjs" \
  --base-url="${BASE_URL}" \
  --index-prefix="lexical-prefix" \
  "$@" \
  --skip-readme-update

cp "${SCRIPT_DIR}/results/last-run.json" "${SCRIPT_DIR}/results/lexical-prefix-last-run.json"
cp "${SCRIPT_DIR}/results/last-run.md" "${SCRIPT_DIR}/results/lexical-prefix-last-run.md"

echo "[lexical-prefix] done"
if [[ "${LEXICAL_PREFIX_KEEP_UP:-0}" == "1" ]]; then
  echo "[lexical-prefix] stack left running"
fi
