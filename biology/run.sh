#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
BASE_URL="${BIOLOGY_BASE_URL:-http://localhost:${BIOLOGY_QUBICDB_PORT:-6062}}"

cleanup() {
  if [[ "${BIOLOGY_KEEP_UP:-0}" != "1" ]]; then
    docker compose -f "${COMPOSE_FILE}" down --remove-orphans >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "[biology] starting qubicdb"
if [[ "${BIOLOGY_REBUILD:-0}" == "1" ]]; then
  docker compose -f "${COMPOSE_FILE}" up -d --build
else
  docker compose -f "${COMPOSE_FILE}" up -d
fi

echo "[biology] waiting for backend health"
for _ in $(seq 1 90); do
  if curl -fsS "${BASE_URL}/health" >/dev/null 2>&1; then break; fi
  sleep 1
done

if ! curl -fsS "${BASE_URL}/health" >/dev/null 2>&1; then
  echo "[biology] backend health check failed: ${BASE_URL}" >&2
  exit 1
fi

echo "[biology] running benchmark"
node "${SCRIPT_DIR}/benchmark.mjs" --base-url="${BASE_URL}" "$@"

echo "[biology] done"
if [[ "${BIOLOGY_KEEP_UP:-0}" == "1" ]]; then
  echo "[biology] stack left running (BIOLOGY_KEEP_UP=1)"
fi
