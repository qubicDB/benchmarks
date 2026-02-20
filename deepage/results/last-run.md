### Latest Benchmark Run
- **Run ID:** vector-prefix-2026-02-19T17-13-48-995Z
- **Timestamp (UTC):** 2026-02-19T17:17:10.816Z
- **Server URL:** http://localhost:6061
- **Iterations per index:** 500
- **Search queries per index:** 750
- **Total writes:** 1000

#### Per-Index Performance
| Metric | vector-prefix-a-mltq00jr | vector-prefix-b-mltq00js |
|---|---:|---:|
| Write success rate | 100% | 100% |
| Read exact-content match | 100% | 100% |
| Search non-empty rate | 100% | 100% |
| Top-1 accuracy | 87.2% | 85.067% |
| Top-5 hit rate | 98.667% | 98.533% |
| Precision@5 | 78.187% | 77.387% |
| MRR | 91.764% | 90.236% |
| Context Top-1 (movie/book actor/author/topic) | 81.714% | 83.238% |
| Context Top-5 hit (movie/book actor/author/topic) | 98.095% | 97.905% |
| Avg Top-1 depth | 0 | 0 |
| Top-1 within requested depth | 100% | 100% |

#### Latency (ms)
| Operation | vector-prefix-a-mltq00jr p50 / p95 / p99 | vector-prefix-b-mltq00js p50 / p95 / p99 |
|---|---:|---:|
| Write | 115.287 / 172.196 / 207.178 | 111.686 / 172.517 / 194.727 |
| Read | 0.637 / 1.248 / 2.38 | 0.565 / 0.916 / 1.881 |
| Search | 54.711 / 61.767 / 71.33 | 54.2 / 60.942 / 69.239 |

#### Cross-Index Consistency
- **Consistency score:** 75.965/100
- **Average top-topic Jaccard (paired queries):** 52.696% over 750 query pairs
- **Top-1 accuracy delta:** 2.133%
- **Top-5 hit rate delta:** 0.134%
- **Precision@5 delta:** 0.8%
- **MRR delta:** 1.528%
- **Read exact-match delta:** 0%

