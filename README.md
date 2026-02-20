# QubicDB Benchmarks

Real-world benchmark suites for [QubicDB](https://github.com/qubicDB/qubicdb) — measuring retrieval quality, latency, concurrency, and hybrid search accuracy.

All results are reproducible via Docker Compose. No cloud dependency.

---

## Suites

### [`biology/`](./biology/)

End-to-end retrieval benchmark using a biology knowledge dataset.
Measures write throughput, search latency percentiles, and Top-K recall against a domain-specific corpus.

**Run:**
```bash
cd biology && bash run.sh
```

---

### [`deepage/`](./deepage/)

Compares **lexical-only** vs **hybrid (vector + lexical)** search across two independent indexes.
Measures Top-1 accuracy, Top-5 hit rate, MRR, Precision@5, latency percentiles, and cross-index consistency.

**Latest results (2026-02-19 — 500 iterations, 750 queries/index):**

| Metric | Lexical | Hybrid (α=0.6) |
|--------|--------:|---------------:|
| Top-1 accuracy | 65.800% | 65.800% |
| Top-5 hit rate | 85.934% | 85.800% |
| MRR | 73.623% | 73.678% |
| Write p50 | 19.9 ms | **16.6 ms** (−16%) |
| Search p50 | 54.9 ms | **49.5 ms** (−10%) |
| Search p99 | 93.7 ms | **59.2 ms** (−37%) |
| Consistency score | 68.009/100 | **67.969/100** |

Hybrid search matches lexical accuracy while delivering significantly lower latency and better cross-index consistency.

**Run:**
```bash
cd deepage
bash run-lexical-prefix.sh --iterations=500
bash run-vector-prefix.sh  --iterations=500
```

See [`deepage/results/conclusion.md`](./deepage/results/conclusion.md) for full analysis.

---

## Go Microbenchmarks

Engine and concurrency microbenchmarks (no Docker, no model required):

```bash
# Engine microbenchmarks
go test -run '^$' -bench 'BenchmarkMatrixEngine' \
  -benchmem ./pkg/engine

# Worker/concurrency path
go test -run '^$' -bench 'BenchmarkBrainWorker' \
  -benchmem ./pkg/concurrency
```

**Results (Apple M3 arm64):**

| Benchmark | ns/op |
|-----------|------:|
| AddNeuron (write + embed + Hebbian) | 704,893 |
| Search — 1K neurons, hybrid | 2,277,576 |
| ParallelSearch — read-lock concurrent | 414,734 |
| BrainWorker AddNeuron (queue round-trip) | 1,394,905 |
| BrainWorker Search (queue + engine) | 1,759,222 |
| Parallel Async Submit (queue only) | **80** |

---

## Requirements

- Docker + Docker Compose (for `biology/` and `deepage/`)
- Go 1.22+ (for microbenchmarks)
- GGUF model file at `qubicdb/dist/MiniLM-L6-v2.Q8_0.gguf` (for vector benchmarks only)

---

## License

MIT

---

Developed by [Deniz Umut Dereli](https://github.com/denizumutdereli)
