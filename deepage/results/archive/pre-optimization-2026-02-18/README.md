# Baseline: Pre-Optimization (2026-02-18)

Benchmark results captured **before** the following optimizations were applied:

## What changed after this baseline

1. **Query Repeat Embedding** (`VectorConfig.QueryRepeat=2`)
   - Query is repeated 2× before embedding (Springer et al. 2024 — "Prompt Repetition Improves Non-Reasoning LLMs")
   - Short queries (≤3 tokens) get verbose expansion: `"search for information about X"`

2. **Hybrid Score tanh normalization**
   - String score normalization changed from `sigmoid(x)` → `tanh(x/5)`
   - Better gradient in typical [0–15] score range, less compression at extremes

3. **EmbedContextSize config** (`VectorConfig.EmbedContextSize=512`)
   - Context window size now configurable, propagated to llama.cpp context pool

4. **Vector layer in Docker** (`Dockerfile.vector`)
   - New multi-stage Dockerfile builds `libllama_go.so` from source (llama.cpp)
   - Previous vector-prefix runs had vector layer silently disabled (library not found)
   - Post-optimization vector runs use **real vector embeddings**

## Baseline numbers (2026-02-18)

### Lexical-prefix (vector layer disabled)
- Top-1 accuracy: ~65.9% avg
- Top-5 hit rate: ~86.2% avg
- MRR: ~73.8% avg
- Consistency score: 68.32/100

### Vector-prefix (vector layer was silently disabled — same as lexical)
- Top-1 accuracy: ~65.4% avg
- Top-5 hit rate: ~86.1% avg
- MRR: ~73.4% avg
- Consistency score: 67.89/100

> Note: vector-prefix baseline numbers are essentially identical to lexical because
> `libllama_go.so` was not available in the container, causing graceful fallback to
> pure lexical search. Post-optimization runs use the real vector layer.
