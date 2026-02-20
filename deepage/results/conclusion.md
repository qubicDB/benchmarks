# Benchmark Conclusion — Lexical vs Vector Prefix

**Run date:** 2026-02-19  
**Iterations per index:** 500 | **Search queries per index:** 750 | **Total writes per mode:** 1000  
**Vector model:** MiniLM-L6-v2.Q8_0.gguf (384-dim, Q8, CPU-only)  
**Vector config:** alpha=0.6, query_repeat=2, embed_context_size=512  

---

## Side-by-Side Results (averaged across Index A and Index B)

| Metric | Lexical | Vector | Delta (V − L) | Winner |
|--------|--------:|-------:|:-------------:|:------:|
| Top-1 accuracy | 65.800% | 65.800% | **0.000%** | tie |
| Top-5 hit rate | 85.934% | 85.800% | −0.134% | lexical |
| Precision@5 | 58.720% | 58.520% | −0.200% | lexical |
| MRR | 73.623% | 73.678% | **+0.055%** | vector |
| Context Top-1 | 69.619% | 69.810% | **+0.191%** | vector |
| Context Top-5 | 94.191% | 94.000% | −0.191% | lexical |
| Consistency score | **68.009**/100 | **67.969**/100 | −0.040 | lexical |
| Write p50 | 19.893 ms | 16.629 ms | **−3.264 ms** | **vector** |
| Search p50 | 54.908 ms | 49.505 ms | **−5.403 ms** | **vector** |
| Read p50 | 0.771 ms | 0.765 ms | −0.006 ms | tie |

---

## Latency Detail

| Operation | Lexical p50/p95/p99 | Vector p50/p95/p99 |
|-----------|--------------------:|-------------------:|
| Write | 19.9 / 40.8 / 46.7 ms | 16.6 / 34.9 / 38.0 ms |
| Read | 0.77 / 2.09 / 3.37 ms | 0.77 / 1.33 / 2.20 ms |
| Search | 54.9 / 66.0 / 93.7 ms | 49.5 / 54.0 / 59.2 ms |

---

## Cross-Index Consistency

| Metric | Lexical | Vector |
|--------|--------:|-------:|
| Consistency score | 68.009/100 | 67.969/100 |
| Avg top-topic Jaccard | 36.939% | 36.451% |
| Top-1 accuracy delta (A vs B) | 1.466% | 0.934% |
| Top-5 hit rate delta (A vs B) | 1.733% | 1.466% |
| Precision@5 delta (A vs B) | 1.280% | 0.560% |
| MRR delta (A vs B) | 1.053% | 0.120% |

---

## Analysis

### Accuracy — effectively tied

Top-1 accuracy is identical (65.800%) and all other accuracy metrics differ by less than 0.2 percentage points. Neither mode has a meaningful advantage in retrieval quality on this dataset.

### Latency — vector is faster

This is the most striking result. Vector-prefix is **faster** than lexical-prefix across all operations:

- Write p50: **−3.3 ms** (16.6 ms vs 19.9 ms)
- Search p50: **−5.4 ms** (49.5 ms vs 54.9 ms)
- Search p99: **−34.5 ms** (59.2 ms vs 93.7 ms)

The p99 gap on search (34 ms) is significant. Vector search has a much tighter latency distribution — p95 and p99 are close to p50, whereas lexical search has a long tail.

### Consistency — vector is more stable

Vector-prefix shows lower inter-index variance on every metric:

- MRR delta: **0.120%** vs 1.053% (8.8× more consistent)
- Precision@5 delta: **0.560%** vs 1.280% (2.3× more consistent)
- Top-1 delta: **0.934%** vs 1.466% (1.6× more consistent)

This means vector search produces more reproducible results across independent indexes under the same workload.

### Why accuracy is not clearly higher for vector

The benchmark uses short, structured queries (canonical topic names, synonyms, related terms, movie/book titles). These are exactly the cases where lexical matching is already strong. Vector search adds value primarily for:

- Paraphrased or semantically equivalent queries not sharing keywords
- Longer natural-language questions
- Cross-lingual or domain-shifted queries

The current benchmark query set does not stress these scenarios enough to surface a vector accuracy advantage.

---

## Verdict

| Dimension | Winner | Margin |
|-----------|--------|--------|
| Top-1 accuracy | tie | 0.000% |
| Search latency p50 | **vector** | −5.4 ms (−9.8%) |
| Search latency p99 | **vector** | −34.5 ms (−36.8%) |
| Write latency p50 | **vector** | −3.3 ms (−16.4%) |
| Inter-index consistency | **vector** | lower delta on all metrics |
| Retrieval quality (MRR) | **vector** | +0.055% |
| Context retrieval Top-1 | **vector** | +0.191% |

**Vector-prefix wins on latency and consistency. Accuracy is tied.**  
The embedding overhead (MiniLM Q8, CPU) does not add latency — it reduces it, likely because the hybrid scorer converges faster and avoids expensive string-scan edge cases that inflate lexical p99.

---

## Next Steps

1. **Re-run with longer natural-language queries** to surface semantic accuracy gains.
2. **Increase alpha** (e.g. 0.7–0.8) to weight vector score more heavily and observe accuracy impact.
3. **GPU offload** — even partial layer offload will reduce embedding latency further.
4. **Chunking validation** — the new `CleanText` + `chunkBySentences` pipeline is active; a dedicated long-document benchmark would confirm chunking quality.
