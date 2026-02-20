#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.vector-prefix.yml"
BASE_URL="${VECTOR_PREFIX_BASE_URL:-http://localhost:${VECTOR_PREFIX_QUBICDB_PORT:-6061}}"
UI_URL="${VECTOR_PREFIX_UI_URL:-http://localhost:${VECTOR_PREFIX_UI_PORT:-8081}}"

cleanup() {
  if [[ "${VECTOR_PREFIX_KEEP_UP:-0}" != "1" ]]; then
    docker compose -f "${COMPOSE_FILE}" down --remove-orphans >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

echo "[vector-prefix] starting qubicdb + ui"
if [[ "${VECTOR_PREFIX_REBUILD:-0}" == "1" ]]; then
  docker compose -f "${COMPOSE_FILE}" up -d --build
else
  docker compose -f "${COMPOSE_FILE}" up -d
fi

echo "[vector-prefix] waiting for backend health"
for _ in $(seq 1 90); do
  if curl -fsS "${BASE_URL}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS "${BASE_URL}/health" >/dev/null 2>&1; then
  echo "[vector-prefix] backend health check failed: ${BASE_URL}" >&2
  exit 1
fi

echo "[vector-prefix] waiting for ui health"
for _ in $(seq 1 60); do
  if curl -fsS "${UI_URL}/healthz" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[vector-prefix] running benchmark"
node "${SCRIPT_DIR}/benchmark.mjs" \
  --base-url="${BASE_URL}" \
  --index-prefix="vector-prefix" \
  "$@" \
  --skip-readme-update

cp "${SCRIPT_DIR}/results/last-run.json" "${SCRIPT_DIR}/results/vector-prefix-last-run.json"
cp "${SCRIPT_DIR}/results/last-run.md" "${SCRIPT_DIR}/results/vector-prefix-last-run.md"

echo "[vector-prefix] done"
if [[ "${VECTOR_PREFIX_KEEP_UP:-0}" == "1" ]]; then
  echo "[vector-prefix] stack left running"
fi
