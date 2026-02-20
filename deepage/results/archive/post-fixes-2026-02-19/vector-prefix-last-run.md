### Latest Benchmark Run
- **Run ID:** vector-prefix-2026-02-19T14-20-21-729Z
- **Timestamp (UTC):** 2026-02-19T14:21:53.965Z
- **Server URL:** http://localhost:6061
- **Iterations per index:** 500
- **Search queries per index:** 750
- **Total writes:** 1000

#### Per-Index Performance
| Metric | vector-prefix-a-mltjsy92 | vector-prefix-b-mltjsy93 |
|---|---:|---:|
| Write success rate | 100% | 100% |
| Read exact-content match | 100% | 100% |
| Search non-empty rate | 100% | 100% |
| Top-1 accuracy | 65.333% | 66.267% |
| Top-5 hit rate | 85.067% | 86.533% |
| Precision@5 | 58.24% | 58.8% |
| MRR | 73.618% | 73.738% |
| Context Top-1 (movie/book actor/author/topic) | 68.952% | 70.667% |
| Context Top-5 hit (movie/book actor/author/topic) | 92.952% | 95.048% |
| Avg Top-1 depth | 0 | 0 |
| Top-1 within requested depth | 100% | 100% |

#### Latency (ms)
| Operation | vector-prefix-a-mltjsy92 p50 / p95 / p99 | vector-prefix-b-mltjsy93 p50 / p95 / p99 |
|---|---:|---:|
| Write | 16.407 / 34.439 / 39.003 | 16.851 / 35.285 / 37.089 |
| Read | 0.682 / 1.383 / 2.046 | 0.848 / 1.273 / 2.349 |
| Search | 49.513 / 53.692 / 57.77 | 49.497 / 54.361 / 60.577 |

#### Cross-Index Consistency
- **Consistency score:** 67.969/100
- **Average top-topic Jaccard (paired queries):** 36.451% over 750 query pairs
- **Top-1 accuracy delta:** 0.934%
- **Top-5 hit rate delta:** 1.466%
- **Precision@5 delta:** 0.56%
- **MRR delta:** 0.12%
- **Read exact-match delta:** 0%

