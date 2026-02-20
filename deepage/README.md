# Deepage Benchmark

Compares QubicDB retrieval quality, latency, and consistency across two configurations:

- **lexical-prefix** — pure lexical search (vector disabled)
- **vector-prefix** — hybrid search (vector + lexical, `alpha=0.6`)

Each run writes the same synthetic dataset to two independent indexes and measures
Top-1 accuracy, Top-5 hit rate, MRR, Precision@5, latency percentiles, and cross-index
consistency. Results are stored in `results/` and archived per run.

---

## Run

```bash
# From this directory:
bash run-lexical-prefix.sh --iterations=500
bash run-vector-prefix.sh  --iterations=500
```

Force image rebuild (after code changes):

```bash
LEXICAL_PREFIX_REBUILD=1 bash run-lexical-prefix.sh --iterations=500
VECTOR_PREFIX_REBUILD=1  bash run-vector-prefix.sh  --iterations=500
```

Smoke test (quick sanity check):

```bash
bash run-lexical-prefix.sh --iterations=20
bash run-vector-prefix.sh  --iterations=20
```

---

## Results

| File | Description |
|------|-------------|
| `results/lexical-prefix-last-run.md` | Latest lexical run summary |
| `results/vector-prefix-last-run.md` | Latest vector-prefix run summary |
| `results/lexical-prefix-last-run.json` | Full machine-readable lexical run |
| `results/vector-prefix-last-run.json` | Full machine-readable vector-prefix run |
| `results/archive/` | Historical runs |

---

## Latest Results (2026-02-19 — 500 iterations, 750 queries per index)

### Lexical prefix (vector disabled)

| Metric | Index A | Index B | Avg |
|--------|--------:|--------:|----:|
| Top-1 accuracy | 65.067% | 66.533% | 65.800% |
| Top-5 hit rate | 85.067% | 86.800% | 85.934% |
| MRR | 73.096% | 74.149% | 73.623% |
| Precision@5 | 58.080% | 59.360% | 58.720% |
| Context Top-1 | 68.190% | 71.048% | 69.619% |
| Write p50 | 20.2 ms | 19.6 ms | 19.9 ms |
| Search p50 | 55.2 ms | 54.6 ms | 54.9 ms |
| Search p99 | 85.8 ms | 101.6 ms | 93.7 ms |
| Consistency score | **68.009/100** | | |

### Vector prefix (hybrid, alpha=0.6, query_repeat=2)

| Metric | Index A | Index B | Avg |
|--------|--------:|--------:|----:|
| Top-1 accuracy | 65.333% | 66.267% | 65.800% |
| Top-5 hit rate | 85.067% | 86.533% | 85.800% |
| MRR | 73.618% | 73.738% | 73.678% |
| Precision@5 | 58.240% | 58.800% | 58.520% |
| Context Top-1 | 68.952% | 70.667% | 69.810% |
| Write p50 | 16.4 ms | 16.9 ms | 16.6 ms |
| Search p50 | 49.5 ms | 49.5 ms | 49.5 ms |
| Search p99 | 57.8 ms | 60.6 ms | 59.2 ms |
| Consistency score | **67.969/100** | | |

### Summary

- **Accuracy:** tied (Top-1 identical at 65.800%, all other metrics within 0.2pp)
- **Write latency:** vector faster by **−3.3 ms p50** (−16%)
- **Search latency:** vector faster by **−5.4 ms p50** (−10%), **−34.5 ms p99** (−37%)
- **Consistency:** vector more stable — MRR delta 0.12% vs 1.05%, Precision@5 delta 0.56% vs 1.28%

See `results/conclusion.md` for full analysis.

---

## Configuration

Vector parameters are set in `docker-compose.vector-prefix.yml`:

| Parameter | Value | Description |
|-----------|-------|-------------|
| `QUBICDB_VECTOR_ENABLED` | `true` | Enables vector layer |
| `QUBICDB_VECTOR_MODEL_PATH` | `/app/dist/MiniLM-L6-v2.Q8_0.gguf` | GGUF model |
| `QUBICDB_VECTOR_ALPHA` | `0.6` | Hybrid weight (0=lexical, 1=vector) |
| `QUBICDB_VECTOR_QUERY_REPEAT` | `2` | Short query expansion repetitions |
| `QUBICDB_VECTOR_EMBED_CONTEXT_SIZE` | `512` | Token context window |

The model file must exist at `qubicdb/dist/` before running the vector benchmark.

