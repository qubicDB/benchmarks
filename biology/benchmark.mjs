#!/usr/bin/env node
/**
 * QubicDB Biology Benchmark
 *
 * Measures brain-like properties of the memory system:
 *   1. Sentiment Alignment       — does sentiment matching improve recall?
 *   2. Spatial Clustering        — do related neurons cluster (domain purity)?
 *   3. Memory Persistence/Decay  — are old neurons still retrievable after noise writes?
 *   4. Energy State Effect       — do frequently-fired neurons rank higher?
 *   5. Long-form Query           — short vs long query accuracy
 *   6. Contextual Domain Coherence — domain-chain Jaccard + out-of-domain leak
 *   7. Fractal Topology          — synapse weight power-law fit via brain/stats
 */

import { performance } from "node:perf_hooks";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  let baseUrl = "http://localhost:6062";
  let iterations = 1;
  for (const arg of args) {
    if (arg.startsWith("--base-url=")) baseUrl = arg.slice("--base-url=".length);
    if (arg.startsWith("--iterations=")) iterations = Math.max(1, parseInt(arg.slice("--iterations=".length), 10));
  }
  return { baseUrl, iterations };
}

const cfg = parseArgs();
const INDEX_PREFIX = "biology";

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function round3(v) { return Math.round(v * 1000) / 1000; }
function uid() { return Math.random().toString(36).slice(2, 10); }

async function req(method, endpoint, options = {}) {
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  let body;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  for (let attempt = 0; attempt <= 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30_000);
    try {
      const res = await fetch(`${cfg.baseUrl}${endpoint}`, { method, headers, body, signal: ctrl.signal });
      clearTimeout(timer);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) return data;
      if (res.status === 429 && attempt < 3) { await sleep(500 * (attempt + 1)); continue; }
      throw new Error(`${method} ${endpoint} -> ${res.status}: ${text}`);
    } catch (err) {
      clearTimeout(timer);
      if (attempt < 3) { await sleep(500 * (attempt + 1)); continue; }
      throw err;
    }
  }
}

async function writeNeuron(indexId, content) {
  return req("POST", "/v1/write", { headers: { "X-Index-ID": indexId }, body: { content } });
}

async function searchNeurons(indexId, query, depth = 1, limit = 10) {
  return req("POST", "/v1/search", { headers: { "X-Index-ID": indexId }, body: { query, depth, limit } });
}

async function ensureIndex(indexId) {
  return req("POST", "/v1/registry/find-or-create", { body: { uuid: indexId, metadata: { source: "biology-benchmark" } } });
}

async function getBrainStats(indexId) {
  return req("GET", "/v1/brain/stats", { headers: { "X-Index-ID": indexId } }).catch(() => null);
}

function neurons(hits) {
  return Array.isArray(hits) ? hits : (hits?.neurons || hits?.results || []);
}

async function waitForHealth() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const d = await req("GET", "/health");
      if (String(d?.status).toLowerCase().includes("healthy")) return;
    } catch { /* retry */ }
    await sleep(1500);
  }
  throw new Error(`Health check timed out: ${cfg.baseUrl}`);
}

// ---------------------------------------------------------------------------
// 1. SENTIMENT ALIGNMENT
// ---------------------------------------------------------------------------
async function runSentimentAlignment(iterations = 1) {
  const indexId = `${INDEX_PREFIX}-sentiment-${uid()}`;
  await ensureIndex(indexId);

  const corpus = {
    happiness: [
      "The team celebrated a brilliant breakthrough with joy and excitement.",
      "She felt overwhelming happiness when the project succeeded beyond expectations.",
      "Everyone was thrilled and delighted by the wonderful experimental results.",
      "The discovery brought immense joy and optimism to the entire research group.",
      "A cheerful atmosphere filled the lab after the successful validation experiment.",
    ],
    sadness: [
      "The experiment failed and the researchers were deeply disappointed and grief-stricken.",
      "A sense of loss settled over the team after the devastating setback.",
      "The disheartening results left everyone feeling hopeless and despondent.",
      "She mourned the wasted months of effort after the project completely collapsed.",
      "The gloomy outcome cast a long shadow of despair over the entire department.",
    ],
    anger: [
      "The repeated failures infuriated the lead scientist beyond all tolerance.",
      "He was furious that the critical experimental data had been corrupted again.",
      "The team was outraged by the negligent handling of the sensitive samples.",
      "Rage and frustration boiled over when the critical funding was abruptly cut.",
      "The hostile peer review process left the researchers feeling deeply wronged.",
    ],
    fear: [
      "The unknown pathogen spread fear and anxiety through the entire laboratory.",
      "Researchers were terrified of the potential catastrophic consequences of the leak.",
      "A creeping dread filled the room as the alarming results appeared on screen.",
      "The possibility of catastrophic failure haunted every single team member.",
      "She was paralyzed with worry about the completely uncontrolled chain reaction.",
    ],
  };

  const queries = {
    happiness: "joyful celebration of a successful scientific discovery",
    sadness: "grief and disappointment after a failed experiment",
    anger: "furious reaction to corrupted data and negligent handling",
    fear: "terrifying anxiety about a dangerous laboratory containment leak",
  };

  for (let i = 0; i < iterations; i++) {
    for (const sentences of Object.values(corpus)) {
      for (const s of sentences) await writeNeuron(indexId, `[iter:${i}] ${s}`);
    }
  }

  const results = {};
  for (const [label, query] of Object.entries(queries)) {
    const hits = neurons(await searchNeurons(indexId, query, 1, 5));
    const matchCount = hits.filter((neu) => {
      const c = (neu.content || "").toLowerCase();
      return corpus[label].some((s) => c.includes(s.split(" ").slice(0, 4).join(" ").toLowerCase()));
    }).length;
    results[label] = { returned: hits.length, matchInTop5: matchCount, matchRate: hits.length > 0 ? round3(matchCount / Math.min(5, hits.length)) : 0 };
  }

  const avgMatchRate = round3(Object.values(results).reduce((s, r) => s + r.matchRate, 0) / Object.keys(results).length);
  return { module: "sentiment_alignment", avgMatchRate, perLabel: results };
}

// ---------------------------------------------------------------------------
// 2. SPATIAL CLUSTERING (domain purity proxy)
// ---------------------------------------------------------------------------
async function runSpatialClustering(iterations = 1) {
  const indexId = `${INDEX_PREFIX}-spatial-${uid()}`;
  await ensureIndex(indexId);

  const domainA = [
    "Quantum entanglement enables instantaneous correlation between distant particles.",
    "Wave-particle duality is a fundamental principle of quantum mechanics.",
    "The Heisenberg uncertainty principle limits simultaneous measurement precision.",
    "Superposition allows a qubit to exist in multiple states simultaneously.",
    "Quantum tunneling permits particles to pass through classical energy barriers.",
    "Schrödinger's equation describes the time evolution of quantum wave functions.",
    "Photon polarization is exploited in quantum cryptography and key distribution.",
    "Bell's theorem experimentally rules out local hidden variable theories.",
  ];
  const domainB = [
    "Photosynthesis converts sunlight into chemical energy stored in glucose.",
    "Mitochondria generate ATP through the process of oxidative phosphorylation.",
    "DNA replication ensures genetic information is faithfully copied before cell division.",
    "Ribosomes synthesize proteins by translating messenger RNA codon sequences.",
    "Enzyme catalysis lowers the activation energy of biochemical metabolic reactions.",
    "Cell membranes regulate selective transport of ions and polar molecules.",
    "The citric acid cycle oxidizes acetyl-CoA to produce electron carrier molecules.",
    "Neurotransmitters diffuse across synaptic clefts to propagate nerve signals.",
  ];

  for (let i = 0; i < iterations; i++) {
    for (const s of domainA) await writeNeuron(indexId, `[iter:${i}] ${s}`);
    for (const s of domainB) await writeNeuron(indexId, `[iter:${i}] ${s}`);
  }

  const kwA = ["quantum", "entanglement", "qubit", "heisenberg", "superposition", "photon", "bell", "wave-particle"];
  const kwB = ["photosynthesis", "mitochondria", "atp", "dna", "ribosome", "enzyme", "cell membrane", "neurotransmitter"];

  function domainMatch(neus, kws) {
    return neus.filter((n) => kws.some((k) => (n.content || "").toLowerCase().includes(k))).length;
  }

  const hA = neurons(await searchNeurons(indexId, "quantum entanglement superposition uncertainty principle", 1, 5));
  const hB = neurons(await searchNeurons(indexId, "photosynthesis mitochondria ATP cell biology enzyme", 1, 5));

  const aCorrect = domainMatch(hA, kwA); const aCross = domainMatch(hA, kwB);
  const bCorrect = domainMatch(hB, kwB); const bCross = domainMatch(hB, kwA);
  const total = hA.length + hB.length;

  return {
    module: "spatial_clustering",
    clusterPurityPct: round3(((aCorrect + bCorrect) / Math.max(1, total)) * 100),
    crossDomainLeakPct: round3(((aCross + bCross) / Math.max(1, total)) * 100),
    domainA: { returned: hA.length, correct: aCorrect, leak: aCross },
    domainB: { returned: hB.length, correct: bCorrect, leak: bCross },
  };
}

// ---------------------------------------------------------------------------
// 3. MEMORY PERSISTENCE / DECAY
// ---------------------------------------------------------------------------
async function runMemoryPersistence(iterations = 1) {
  const indexId = `${INDEX_PREFIX}-persistence-${uid()}`;
  await ensureIndex(indexId);

  const anchors = [
    "The ancient library of Alexandria held scrolls of forgotten knowledge.",
    "Archimedes discovered the principle of buoyancy in his bathtub.",
    "Euclid's Elements laid the foundation of geometry for two millennia.",
    "Pythagoras proved the relationship between sides of a right triangle.",
    "Aristotle classified living organisms into genera and species systematically.",
    "Hippocrates established medicine as a discipline separate from philosophy.",
    "Socrates taught through questioning rather than direct instruction.",
    "Plato described the ideal state in his philosophical dialogues.",
  ].map((s) => { const tok = `anc_${uid()}`; return { sentence: `${s} [anchor:${tok}]`, token: tok }; });

  for (const { sentence } of anchors) await writeNeuron(indexId, sentence);

  // Write noise — scaled by iterations
  const noiseCount = 40 * iterations;
  for (let i = 0; i < noiseCount; i++) {
    await writeNeuron(indexId, `System log entry ${i + 1}: batch ${uid()} processed with status ${200 + (i % 5)} at timestamp ${Date.now()}.`);
  }

  let recalled = 0;
  const details = [];
  for (const { sentence, token } of anchors) {
    const query = sentence.split(" ").slice(0, 6).join(" ");
    const hits = neurons(await searchNeurons(indexId, query, 1, 10));
    const found = hits.some((n) => (n.content || "").includes(token));
    if (found) recalled++;
    details.push({ query: query.slice(0, 50), found });
  }

  return {
    module: "memory_persistence",
    anchorCount: anchors.length,
    noiseCount: 40 * iterations,
    recalled,
    recallRatePct: round3((recalled / anchors.length) * 100),
    details,
  };
}

// ---------------------------------------------------------------------------
// 4. ENERGY STATE EFFECT
// ---------------------------------------------------------------------------
async function runEnergyStateEffect(iterations = 1) {
  const indexId = `${INDEX_PREFIX}-energy-${uid()}`;
  await ensureIndex(indexId);

  const hotItems = [
    "Neural plasticity allows the brain to reorganize synaptic connections dynamically.",
    "Long-term potentiation strengthens synaptic transmission after repeated activation.",
    "Hebbian learning states that neurons that fire together wire together over time.",
  ].map((s) => { const tok = `hot_${uid()}`; return { sentence: `${s} [etok:${tok}]`, token: tok }; });

  const coldItems = [
    "The dormant circuit remained inactive for an extended and prolonged period.",
    "Unused synaptic pathways gradually weaken through synaptic pruning mechanisms.",
    "Inactive neurons lose energy and consolidate into deeper memory storage layers.",
  ].map((s) => { const tok = `cold_${uid()}`; return { sentence: `${s} [etok:${tok}]`, token: tok }; });

  for (const { sentence } of [...hotItems, ...coldItems]) await writeNeuron(indexId, sentence);

  // Fire hot neurons repeatedly via search — more iterations = more firing rounds
  for (let i = 0; i < 5 * iterations; i++) {
    for (const { sentence } of hotItems) {
      await searchNeurons(indexId, sentence.split(" ").slice(0, 5).join(" "), 0, 3);
    }
  }

  const hits = neurons(await searchNeurons(indexId, "neural synaptic memory activation energy plasticity", 1, 10));
  const hotRanks = []; const coldRanks = [];
  hits.forEach((n, idx) => {
    const c = n.content || "";
    if (hotItems.some((t) => c.includes(t.token))) hotRanks.push(idx + 1);
    if (coldItems.some((t) => c.includes(t.token))) coldRanks.push(idx + 1);
  });

  const avgHot = hotRanks.length > 0 ? round3(hotRanks.reduce((a, b) => a + b, 0) / hotRanks.length) : null;
  const avgCold = coldRanks.length > 0 ? round3(coldRanks.reduce((a, b) => a + b, 0) / coldRanks.length) : null;

  return {
    module: "energy_state_effect",
    totalReturned: hits.length,
    hotNeurons: { found: hotRanks.length, avgRank: avgHot, ranks: hotRanks },
    coldNeurons: { found: coldRanks.length, avgRank: avgCold, ranks: coldRanks },
    hotRanksHigherThanCold: avgHot !== null && avgCold !== null && avgHot < avgCold,
  };
}

// ---------------------------------------------------------------------------
// 5. LONG-FORM QUERY
// ---------------------------------------------------------------------------
async function runLongFormQuery(iterations = 1) {
  const indexId = `${INDEX_PREFIX}-longform-${uid()}`;
  await ensureIndex(indexId);

  const items = [
    {
      content: "The hippocampus plays a central role in the formation of new episodic memories and spatial navigation.",
      shortQuery: "hippocampus memory",
      longQuery: "The hippocampus is responsible for forming new episodic memories and helps with spatial navigation in the brain.",
    },
    {
      content: "Dopamine is a neurotransmitter that regulates reward, motivation, and motor control in the brain.",
      shortQuery: "dopamine reward",
      longQuery: "Dopamine acts as a neurotransmitter in the brain and plays a key role in regulating reward pathways, motivation, and motor control.",
    },
    {
      content: "The prefrontal cortex is involved in executive functions such as planning, decision making, and impulse control.",
      shortQuery: "prefrontal cortex decisions",
      longQuery: "The prefrontal cortex handles executive functions including planning ahead, making complex decisions, and controlling impulsive behavior.",
    },
    {
      content: "Neurogenesis in the adult brain occurs primarily in the hippocampus and olfactory bulb.",
      shortQuery: "adult neurogenesis",
      longQuery: "In adult humans, new neurons are generated mainly in the hippocampus and the olfactory bulb through a process called neurogenesis.",
    },
    {
      content: "Sleep consolidates memories by replaying neural activity patterns from waking experience.",
      shortQuery: "sleep memory consolidation",
      longQuery: "During sleep the brain consolidates memories by replaying the neural activity patterns that occurred during waking experience, strengthening important connections.",
    },
  ].map((item) => { const tok = `lf_${uid()}`; return { ...item, token: tok, stored: `${item.content} [lf:${tok}]` }; });

  for (let i = 0; i < iterations; i++) {
    for (const item of items) await writeNeuron(indexId, i === 0 ? item.stored : `[iter:${i}] ${item.stored}`);
  }

  let shortCorrect = 0; let longCorrect = 0;
  const details = [];
  for (const item of items) {
    const sHits = neurons(await searchNeurons(indexId, item.shortQuery, 1, 5));
    const lHits = neurons(await searchNeurons(indexId, item.longQuery, 1, 5));
    const sf = sHits.some((n) => (n.content || "").includes(item.token));
    const lf = lHits.some((n) => (n.content || "").includes(item.token));
    if (sf) shortCorrect++; if (lf) longCorrect++;
    details.push({ shortQuery: item.shortQuery, shortFound: sf, longFound: lf });
  }

  return {
    module: "longform_query",
    total: items.length,
    shortQueryAccuracyPct: round3((shortCorrect / items.length) * 100),
    longQueryAccuracyPct: round3((longCorrect / items.length) * 100),
    longformAdvantage: longCorrect >= shortCorrect,
    details,
  };
}

// ---------------------------------------------------------------------------
// 6. CONTEXTUAL DOMAIN COHERENCE
// ---------------------------------------------------------------------------
function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1;
  const inter = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : inter.size / union.size;
}

async function runContextualCoherence(iterations = 1) {
  const indexId = `${INDEX_PREFIX}-context-${uid()}`;
  await ensureIndex(indexId);

  const corpus = [
    "Agatha Christie wrote over seventy detective novels featuring Hercule Poirot.",
    "Miss Marple solves crimes in the village of St Mary Mead using keen observation.",
    "The murder mystery genre relies on clues, red herrings, and a final revelation.",
    "Crime fiction explores the psychology of both detective and criminal mind.",
    "Whodunit stories keep readers guessing until the final chapter reveals the killer.",
    "Suspense thrillers build tension through pacing, plot twists, and unreliable narrators.",
    "The golden age of detective fiction produced Christie, Sayers, and Ngaio Marsh.",
    "Poirot's little grey cells represent the power of logical deduction over brute force.",
    // Out-of-domain noise
    "The quarterly earnings report showed a 12% increase in revenue year over year.",
    "Stock market volatility increased following the central bank interest rate decision.",
    "Financial analysts revised price targets after the disappointing forward guidance.",
    "The balance sheet revealed significant goodwill impairment in the technology segment.",
  ];

  for (let i = 0; i < iterations; i++) {
    for (const s of corpus) await writeNeuron(indexId, i === 0 ? s : `[iter:${i}] ${s}`);
  }

  const chain = [
    "Agatha Christie detective novels mystery",
    "murder mystery crime fiction whodunit",
    "Hercule Poirot Miss Marple detective stories",
    "crime thriller suspense plot twist",
  ];

  // Domain-label Jaccard: label each returned neuron as "mystery" or "other" based on content.
  // Jaccard then measures whether consecutive queries pull from the same domain distribution,
  // independent of which specific neuron object (ID) was returned — robust under iterations.
  const mysteryKwSet = ["agatha", "christie", "poirot", "marple", "mystery", "detective",
    "whodunit", "crime", "thriller", "suspense", "murder", "golden age", "sayers", "ngaio"];

  function domainLabelSet(neus) {
    const s = new Set();
    for (let idx = 0; idx < neus.length; idx++) {
      const c = (neus[idx].content || "").toLowerCase();
      const isMystery = mysteryKwSet.some((k) => c.includes(k));
      s.add(isMystery ? `mystery:${idx}` : `other:${idx}`);
    }
    return s;
  }

  const chainSets = [];
  for (const query of chain) {
    const hits = neurons(await searchNeurons(indexId, query, 1, 5));
    const mysteryCount = hits.filter((n) =>
      mysteryKwSet.some((k) => (n.content || "").toLowerCase().includes(k))
    ).length;
    chainSets.push({
      query: query.slice(0, 50),
      count: hits.length,
      mysteryCount,
      domainPct: hits.length > 0 ? round3(mysteryCount / hits.length) : 0,
      labels: domainLabelSet(hits),
    });
  }

  const jScores = [];
  for (let i = 1; i < chainSets.length; i++) {
    jScores.push(round3(jaccard(chainSets[i - 1].labels, chainSets[i].labels)));
  }

  const oodHits = neurons(await searchNeurons(indexId, "quarterly earnings report stock market financial analysis", 1, 5));
  const mysteryKw = ["agatha", "christie", "poirot", "marple", "mystery", "detective", "whodunit", "crime fiction"];
  const leak = oodHits.filter((n) => mysteryKw.some((k) => (n.content || "").toLowerCase().includes(k))).length;

  return {
    module: "contextual_coherence",
    chainSteps: chainSets.map((r) => ({ query: r.query, returned: r.count, mysteryCount: r.mysteryCount, domainPct: r.domainPct })),
    consecutiveJaccardScores: jScores,
    avgChainJaccardPct: round3((jScores.reduce((a, b) => a + b, 0) / Math.max(1, jScores.length)) * 100),
    outOfDomainReturned: oodHits.length,
    domainLeakCount: leak,
    domainLeakPct: round3((leak / Math.max(1, oodHits.length)) * 100),
  };
}

// ---------------------------------------------------------------------------
// 7. FRACTAL TOPOLOGY
// ---------------------------------------------------------------------------
async function runFractalTopology(iterations = 1) {
  const indexId = `${INDEX_PREFIX}-fractal-${uid()}`;
  await ensureIndex(indexId);

  const corpus = [
    "Fractals exhibit self-similarity at every scale of magnification.",
    "The Mandelbrot set is generated by iterating a simple complex function.",
    "Coastlines display fractal geometry with detail at every zoom level.",
    "Branching patterns in trees and rivers follow fractal scaling laws.",
    "Neural networks in the brain exhibit small-world topology properties.",
    "Scale-free networks have degree distributions following a power law.",
    "Hebbian learning creates preferential attachment in synaptic networks.",
    "Hub neurons with many connections dominate information flow pathways.",
    "Synaptic pruning removes weak connections while strengthening strong ones.",
    "The brain's connectome shows hierarchical modular organization.",
    "Criticality in neural systems maximizes information transmission capacity.",
    "Avalanche dynamics in cortical networks follow power-law size distributions.",
    "Self-organized criticality emerges without external tuning in neural tissue.",
    "Long-range correlations in brain activity span multiple spatial scales.",
    "Recursive memory structures mirror the fractal organization of experience.",
    "Attractor states in recurrent networks encode stable memory patterns.",
    "Chaotic dynamics at the edge of order enable flexible neural computation.",
    "Synchronization across brain regions coordinates distributed processing.",
    "Phase transitions in neural activity separate ordered from disordered states.",
    "Emergent complexity arises from simple local rules in neural assemblies.",
  ];

  for (let i = 0; i < iterations; i++) {
    for (const s of corpus) await writeNeuron(indexId, i === 0 ? s : `[iter:${i}] ${s}`);
  }

  // Trigger synapse formation
  const queries = [
    "fractal self-similarity scale",
    "neural network topology hub",
    "power law degree distribution",
    "hebbian learning synaptic",
    "criticality avalanche dynamics",
  ];
  for (const q of queries) await searchNeurons(indexId, q, 2, 10);

  const stats = await getBrainStats(indexId);

  const neuronCount = stats?.neuron_count ?? stats?.neurons ?? null;
  const synapseCount = stats?.synapse_count ?? stats?.synapses ?? null;
  const synapseRatio = (neuronCount && synapseCount) ? round3(synapseCount / neuronCount) : null;

  // Power-law proxy: if synapse weights are available, compute log-log R²
  let powerLawR2 = null;
  const weights = stats?.synapse_weights || stats?.weights || null;
  if (Array.isArray(weights) && weights.length > 4) {
    const sorted = [...weights].sort((a, b) => a - b);
    const n = sorted.length;
    // Rank-frequency: log(rank) vs log(weight) — Zipf/power-law check
    const logRank = sorted.map((_, i) => Math.log(i + 1));
    const logW = sorted.map((w) => Math.log(Math.max(1e-9, w)));
    const meanLR = logRank.reduce((a, b) => a + b, 0) / n;
    const meanLW = logW.reduce((a, b) => a + b, 0) / n;
    const num = logRank.reduce((s, lr, i) => s + (lr - meanLR) * (logW[i] - meanLW), 0);
    const denA = Math.sqrt(logRank.reduce((s, lr) => s + (lr - meanLR) ** 2, 0));
    const denB = Math.sqrt(logW.reduce((s, lw) => s + (lw - meanLW) ** 2, 0));
    const r = (denA * denB) === 0 ? 0 : num / (denA * denB);
    powerLawR2 = round3(r * r);
  }

  return {
    module: "fractal_topology",
    neuronCount,
    synapseCount,
    synapsesPerNeuronRatio: synapseRatio,
    powerLawR2,
    interpretation: powerLawR2 !== null
      ? (powerLawR2 > 0.85 ? "strong power-law (scale-free)" : powerLawR2 > 0.6 ? "moderate power-law" : "weak power-law")
      : "weight data not exposed by stats endpoint",
    note: "Scale-free networks (R²>0.85) indicate fractal-like preferential attachment topology.",
  };
}

// ---------------------------------------------------------------------------
// Report helpers
// ---------------------------------------------------------------------------
function percentile(arr, p) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
}

function buildMarkdown(runId, timestamp, results) {
  const lines = [
    `# QubicDB Biology Benchmark`,
    `- **Run ID:** ${runId}`,
    `- **Timestamp (UTC):** ${timestamp}`,
    `- **Server:** ${cfg.baseUrl}`,
    ``,
  ];

  for (const r of results) {
    lines.push(`## ${r.module.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`);
    if (r.error) {
      lines.push(`> ERROR: ${r.error}`);
    } else {
      lines.push("```json");
      lines.push(JSON.stringify(r, null, 2));
      lines.push("```");
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function run() {
  console.log(`[biology] waiting for health at ${cfg.baseUrl}`);
  await waitForHealth();
  console.log(`[biology] server healthy`);

  const runId = `bio-${Date.now().toString(36)}`;
  const timestamp = new Date().toISOString();

  const { iterations } = cfg;
  console.log(`[biology] iterations: ${iterations}`);

  const modules = [
    { name: "sentiment_alignment", fn: runSentimentAlignment },
    { name: "spatial_clustering", fn: runSpatialClustering },
    { name: "memory_persistence", fn: runMemoryPersistence },
    { name: "energy_state_effect", fn: runEnergyStateEffect },
    { name: "longform_query", fn: runLongFormQuery },
    { name: "contextual_coherence", fn: runContextualCoherence },
    { name: "fractal_topology", fn: runFractalTopology },
  ];

  const results = [];
  for (const mod of modules) {
    console.log(`[biology] running module: ${mod.name}`);
    const t0 = performance.now();
    try {
      const result = await mod.fn(iterations);
      const elapsed = round3(performance.now() - t0);
      results.push({ ...result, elapsedMs: elapsed });
      console.log(`[biology]   done in ${elapsed}ms`);
    } catch (err) {
      console.error(`[biology]   FAILED: ${err.message}`);
      results.push({ module: mod.name, error: err.message });
    }
  }

  const outDir = path.join(__dirname, "results");
  await mkdir(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "last-run.json");
  const mdPath = path.join(outDir, "last-run.md");

  const report = { runId, timestamp, baseUrl: cfg.baseUrl, modules: results };
  await writeFile(jsonPath, JSON.stringify(report, null, 2));
  await writeFile(mdPath, buildMarkdown(runId, timestamp, results));

  console.log(`[biology] JSON report: ${jsonPath}`);
  console.log(`[biology] Markdown report: ${mdPath}`);
  console.log(`[biology] Done.`);
}

run().catch((err) => {
  console.error(`[biology] Fatal: ${err.message}`);
  process.exit(1);
});
