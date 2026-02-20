### Latest Benchmark Run
- **Run ID:** lexical-prefix-2026-02-19T14-16-00-939Z
- **Timestamp (UTC):** 2026-02-19T14:17:46.774Z
- **Server URL:** http://localhost:6060
- **Iterations per index:** 500
- **Search queries per index:** 750
- **Total writes:** 1000

#### Per-Index Performance
| Metric | lexical-prefix-a-mltjnd0y | lexical-prefix-b-mltjnd0z |
|---|---:|---:|
| Write success rate | 100% | 100% |
| Read exact-content match | 100% | 100% |
| Search non-empty rate | 100% | 100% |
| Top-1 accuracy | 65.067% | 66.533% |
| Top-5 hit rate | 85.067% | 86.8% |
| Precision@5 | 58.08% | 59.36% |
| MRR | 73.096% | 74.149% |
| Context Top-1 (movie/book actor/author/topic) | 68.19% | 71.048% |
| Context Top-5 hit (movie/book actor/author/topic) | 92.952% | 95.429% |
| Avg Top-1 depth | 0 | 0 |
| Top-1 within requested depth | 100% | 100% |

#### Latency (ms)
| Operation | lexical-prefix-a-mltjnd0y p50 / p95 / p99 | lexical-prefix-b-mltjnd0z p50 / p95 / p99 |
|---|---:|---:|
| Write | 20.215 / 42.699 / 46.699 | 19.571 / 38.869 / 46.639 |
| Read | 0.829 / 2.355 / 3.363 | 0.712 / 1.83 / 3.378 |
| Search | 55.187 / 62.821 / 85.815 | 54.629 / 69.139 / 101.618 |

#### Cross-Index Consistency
- **Consistency score:** 68.009/100
- **Average top-topic Jaccard (paired queries):** 36.939% over 750 query pairs
- **Top-1 accuracy delta:** 1.466%
- **Top-5 hit rate delta:** 1.733%
- **Precision@5 delta:** 1.28%
- **MRR delta:** 1.053%
- **Read exact-match delta:** 0%

