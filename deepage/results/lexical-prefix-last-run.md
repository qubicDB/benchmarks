### Latest Benchmark Run
- **Run ID:** lexical-prefix-2026-02-19T16-56-28-025Z
- **Timestamp (UTC):** 2026-02-19T16:58:13.750Z
- **Server URL:** http://localhost:6060
- **Iterations per index:** 500
- **Search queries per index:** 750
- **Total writes:** 1000

#### Per-Index Performance
| Metric | lexical-prefix-a-mltpdpc0 | lexical-prefix-b-mltpdpc1 |
|---|---:|---:|
| Write success rate | 100% | 100% |
| Read exact-content match | 100% | 100% |
| Search non-empty rate | 100% | 100% |
| Top-1 accuracy | 64.8% | 67.867% |
| Top-5 hit rate | 84.8% | 87.467% |
| Precision@5 | 57.547% | 58.853% |
| MRR | 72.496% | 75.449% |
| Context Top-1 (movie/book actor/author/topic) | 68.19% | 72.952% |
| Context Top-5 hit (movie/book actor/author/topic) | 92.571% | 96.381% |
| Avg Top-1 depth | 0 | 0 |
| Top-1 within requested depth | 100% | 100% |

#### Latency (ms)
| Operation | lexical-prefix-a-mltpdpc0 p50 / p95 / p99 | lexical-prefix-b-mltpdpc1 p50 / p95 / p99 |
|---|---:|---:|
| Write | 18.135 / 41.614 / 51.136 | 20.034 / 40.176 / 44.394 |
| Read | 0.648 / 1.754 / 2.699 | 0.746 / 1.925 / 2.746 |
| Search | 55.479 / 65.49 / 76.132 | 55.147 / 65.342 / 111.366 |

#### Cross-Index Consistency
- **Consistency score:** 66.978/100
- **Average top-topic Jaccard (paired queries):** 35.621% over 750 query pairs
- **Top-1 accuracy delta:** 3.067%
- **Top-5 hit rate delta:** 2.667%
- **Precision@5 delta:** 1.306%
- **MRR delta:** 2.953%
- **Read exact-match delta:** 0%

