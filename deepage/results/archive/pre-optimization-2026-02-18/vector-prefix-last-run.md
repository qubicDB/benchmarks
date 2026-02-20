### Latest Benchmark Run
- **Run ID:** vector-prefix-2026-02-18T23-22-52-083Z
- **Timestamp (UTC):** 2026-02-18T23:24:43.129Z
- **Server URL:** http://localhost:6061
- **Iterations per index:** 500
- **Search queries per index:** 900
- **Total writes:** 1000

#### Per-Index Performance
| Metric | vector-prefix-a-mlsnqrlf | vector-prefix-b-mlsnqrlg |
|---|---:|---:|
| Write success rate | 100% | 100% |
| Read exact-content match | 100% | 100% |
| Search non-empty rate | 100% | 100% |
| Top-1 accuracy | 64.444% | 66.333% |
| Top-5 hit rate | 85.111% | 87.111% |
| Precision@5 | 58.2% | 58.933% |
| MRR | 72.656% | 74.144% |
| Context Top-1 (movie/book actor/author/topic) | 67.619% | 70.794% |
| Context Top-5 hit (movie/book actor/author/topic) | 93.016% | 95.873% |
| Avg Top-1 depth | 0 | 0 |
| Top-1 within requested depth | 100% | 100% |

#### Latency (ms)
| Operation | vector-prefix-a-mlsnqrlf p50 / p95 / p99 | vector-prefix-b-mlsnqrlg p50 / p95 / p99 |
|---|---:|---:|
| Write | 17.948 / 37.292 / 41.905 | 17.404 / 36.519 / 38.424 |
| Read | 0.561 / 1.396 / 2.436 | 0.515 / 0.834 / 1.686 |
| Search | 51.217 / 55.822 / 62.04 | 50.896 / 55.409 / 62.229 |

#### Cross-Index Consistency
- **Consistency score:** 67.893/100
- **Average top-topic Jaccard (paired queries):** 36.805% over 900 query pairs
- **Top-1 accuracy delta:** 1.889%
- **Top-5 hit rate delta:** 2%
- **Precision@5 delta:** 0.733%
- **MRR delta:** 1.488%
- **Read exact-match delta:** 0%

