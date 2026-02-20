# QubicDB Biology Benchmark
- **Run ID:** bio-mltvr0s7
- **Timestamp (UTC):** 2026-02-19T19:54:47.095Z
- **Server:** http://localhost:6062

## Sentiment Alignment
```json
{
  "module": "sentiment_alignment",
  "avgMatchRate": 1,
  "perLabel": {
    "happiness": {
      "returned": 5,
      "matchInTop5": 5,
      "matchRate": 1
    },
    "sadness": {
      "returned": 5,
      "matchInTop5": 5,
      "matchRate": 1
    },
    "anger": {
      "returned": 5,
      "matchInTop5": 5,
      "matchRate": 1
    },
    "fear": {
      "returned": 5,
      "matchInTop5": 5,
      "matchRate": 1
    }
  },
  "elapsedMs": 402.212
}
```

## Spatial Clustering
```json
{
  "module": "spatial_clustering",
  "clusterPurityPct": 100,
  "crossDomainLeakPct": 0,
  "domainA": {
    "returned": 5,
    "correct": 5,
    "leak": 0
  },
  "domainB": {
    "returned": 5,
    "correct": 5,
    "leak": 0
  },
  "elapsedMs": 296.491
}
```

## Memory Persistence
```json
{
  "module": "memory_persistence",
  "anchorCount": 8,
  "noiseCount": 200,
  "recalled": 8,
  "recallRatePct": 100,
  "details": [
    {
      "query": "The ancient library of Alexandria held",
      "found": true
    },
    {
      "query": "Archimedes discovered the principle of buoyancy",
      "found": true
    },
    {
      "query": "Euclid's Elements laid the foundation of",
      "found": true
    },
    {
      "query": "Pythagoras proved the relationship between sides",
      "found": true
    },
    {
      "query": "Aristotle classified living organisms into genera",
      "found": true
    },
    {
      "query": "Hippocrates established medicine as a discipline",
      "found": true
    },
    {
      "query": "Socrates taught through questioning rather than",
      "found": true
    },
    {
      "query": "Plato described the ideal state in",
      "found": true
    }
  ],
  "elapsedMs": 997.969
}
```

## Energy State Effect
```json
{
  "module": "energy_state_effect",
  "totalReturned": 6,
  "hotNeurons": {
    "found": 3,
    "avgRank": 2.333,
    "ranks": [
      1,
      2,
      4
    ]
  },
  "coldNeurons": {
    "found": 3,
    "avgRank": 4.667,
    "ranks": [
      3,
      5,
      6
    ]
  },
  "hotRanksHigherThanCold": true,
  "elapsedMs": 229.707
}
```

## Longform Query
```json
{
  "module": "longform_query",
  "total": 5,
  "shortQueryAccuracyPct": 100,
  "longQueryAccuracyPct": 100,
  "longformAdvantage": true,
  "details": [
    {
      "shortQuery": "hippocampus memory",
      "shortFound": true,
      "longFound": true
    },
    {
      "shortQuery": "dopamine reward",
      "shortFound": true,
      "longFound": true
    },
    {
      "shortQuery": "prefrontal cortex decisions",
      "shortFound": true,
      "longFound": true
    },
    {
      "shortQuery": "adult neurogenesis",
      "shortFound": true,
      "longFound": true
    },
    {
      "shortQuery": "sleep memory consolidation",
      "shortFound": true,
      "longFound": true
    }
  ],
  "elapsedMs": 300.456
}
```

## Contextual Coherence
```json
{
  "module": "contextual_coherence",
  "chainSteps": [
    {
      "query": "Agatha Christie detective novels mystery",
      "returned": 5,
      "mysteryCount": 5,
      "domainPct": 1
    },
    {
      "query": "murder mystery crime fiction whodunit",
      "returned": 5,
      "mysteryCount": 5,
      "domainPct": 1
    },
    {
      "query": "Hercule Poirot Miss Marple detective stories",
      "returned": 5,
      "mysteryCount": 5,
      "domainPct": 1
    },
    {
      "query": "crime thriller suspense plot twist",
      "returned": 5,
      "mysteryCount": 5,
      "domainPct": 1
    }
  ],
  "consecutiveJaccardScores": [
    1,
    1,
    1
  ],
  "avgChainJaccardPct": 100,
  "outOfDomainReturned": 5,
  "domainLeakCount": 0,
  "domainLeakPct": 0,
  "elapsedMs": 293.375
}
```

## Fractal Topology
```json
{
  "module": "fractal_topology",
  "neuronCount": 100,
  "synapseCount": 2451,
  "synapsesPerNeuronRatio": 24.51,
  "powerLawR2": 0.619,
  "interpretation": "moderate power-law",
  "note": "Scale-free networks (R²>0.85) indicate fractal-like preferential attachment topology.",
  "elapsedMs": 349.309
}
```
