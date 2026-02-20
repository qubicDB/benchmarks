### Latest Benchmark Run
- **Run ID:** lexical-prefix-2026-02-18T23-20-23-955Z
- **Timestamp (UTC):** 2026-02-18T23:22:15.878Z
- **Server URL:** http://localhost:6062
- **Iterations per index:** 500
- **Search queries per index:** 900
- **Total writes:** 1000

#### Per-Index Performance
| Metric | lexical-prefix-a-mlsnnlar | lexical-prefix-b-mlsnnlas |
|---|---:|---:|
| Write success rate | 100% | 100% |
| Read exact-content match | 100% | 100% |
| Search non-empty rate | 100% | 100% |
| Top-1 accuracy | 65.111% | 66.667% |
| Top-5 hit rate | 85.444% | 87% |
| Precision@5 | 58.4% | 59.311% |
| MRR | 73.454% | 74.191% |
| Context Top-1 (movie/book actor/author/topic) | 68.254% | 71.27% |
| Context Top-5 hit (movie/book actor/author/topic) | 93.492% | 95.714% |
| Avg Top-1 depth | 0 | 0 |
| Top-1 within requested depth | 100% | 100% |

#### Latency (ms)
| Operation | lexical-prefix-a-mlsnnlar p50 / p95 / p99 | lexical-prefix-b-mlsnnlas p50 / p95 / p99 |
|---|---:|---:|
| Write | 17.346 / 37.142 / 41.785 | 17.465 / 36.606 / 39.254 |
| Read | 0.551 / 1.386 / 2.691 | 0.508 / 0.79 / 2.411 |
| Search | 51.823 / 56.996 / 63.043 | 51.35 / 55.759 / 60.505 |

#### Cross-Index Consistency
- **Consistency score:** 68.319/100
- **Average top-topic Jaccard (paired queries):** 37.431% over 900 query pairs
- **Top-1 accuracy delta:** 1.556%
- **Top-5 hit rate delta:** 1.556%
- **Precision@5 delta:** 0.911%
- **MRR delta:** 0.737%
- **Read exact-match delta:** 0%

