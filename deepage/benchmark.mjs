#!/usr/bin/env node

import { performance } from "node:perf_hooks";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const TOPICS = [
  {
    id: "distributed-systems",
    canonical: "distributed systems",
    synonyms: ["replica coordination", "quorum agreement", "cluster consensus"],
    related: ["raft", "leader election", "state machine replication"],
  },
  {
    id: "neural-memory",
    canonical: "neural memory",
    synonyms: ["adaptive recall", "context memory", "memory consolidation"],
    related: ["hebbian linkage", "depth decay", "activation trail"],
  },
  {
    id: "database-indexing",
    canonical: "database indexing",
    synonyms: ["query indexing", "lookup acceleration", "storage indexing"],
    related: ["btree", "hash key", "cardinality"],
  },
  {
    id: "observability",
    canonical: "system observability",
    synonyms: ["telemetry tracking", "runtime monitoring", "signal tracing"],
    related: ["latency histogram", "trace span", "error budget"],
  },
  {
    id: "ml-pipelines",
    canonical: "machine learning pipelines",
    synonyms: ["model workflow", "feature pipeline", "training pipeline"],
    related: ["feature store", "batch scoring", "drift detection"],
  },
  {
    id: "privacy-security",
    canonical: "privacy security",
    synonyms: ["data protection", "privacy guardrails", "security hardening"],
    related: ["least privilege", "token rotation", "audit trail"],
  },
  {
    id: "edge-computing",
    canonical: "edge computing",
    synonyms: ["edge runtime", "near-device processing", "on-prem inference"],
    related: ["latency locality", "edge cache", "offline mode"],
  },
  {
    id: "reliability",
    canonical: "service reliability",
    synonyms: ["fault tolerance", "resilience strategy", "availability planning"],
    related: ["graceful degradation", "circuit breaker", "retry budget"],
  },
  {
    id: "semantic-search",
    canonical: "semantic search",
    synonyms: ["meaning based retrieval", "hybrid retrieval", "vector search"],
    related: ["embedding distance", "cosine similarity", "relevance score"],
  },
  {
    id: "event-streaming",
    canonical: "event streaming",
    synonyms: ["stream processing", "event-driven flow", "message streaming"],
    related: ["consumer lag", "offset commit", "window aggregation"],
  },
];

const MOVIE_CATALOG = [
  {
    title: "Inception",
    actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
    topics: ["dream invasion", "memory layers", "corporate espionage"],
  },
  {
    title: "Interstellar",
    actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    topics: ["space travel", "time dilation", "planet survival"],
  },
  {
    title: "The Matrix",
    actors: ["Keanu Reeves", "Carrie-Anne Moss", "Laurence Fishburne"],
    topics: ["simulated reality", "awakening", "machine resistance"],
  },
  {
    title: "Blade Runner 2049",
    actors: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
    topics: ["identity", "implanted memory", "dystopian investigation"],
  },
  {
    title: "Arrival",
    actors: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
    topics: ["linguistics", "alien contact", "nonlinear time"],
  },
  {
    title: "The Godfather",
    actors: ["Marlon Brando", "Al Pacino", "James Caan"],
    topics: ["family loyalty", "organized crime", "power transition"],
  },
  {
    title: "Parasite",
    actors: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
    topics: ["class divide", "deception", "social satire"],
  },
  {
    title: "The Dark Knight",
    actors: ["Christian Bale", "Heath Ledger", "Gary Oldman"],
    topics: ["justice", "chaos", "moral compromise"],
  },
  {
    title: "Mad Max Fury Road",
    actors: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult"],
    topics: ["wasteland survival", "rebellion", "resource scarcity"],
  },
  {
    title: "Her",
    actors: ["Joaquin Phoenix", "Scarlett Johansson", "Amy Adams"],
    topics: ["human ai relationship", "loneliness", "digital intimacy"],
  },
  {
    title: "Ex Machina",
    actors: ["Alicia Vikander", "Domhnall Gleeson", "Oscar Isaac"],
    topics: ["ai ethics", "manipulation", "consciousness"],
  },
  {
    title: "The Social Network",
    actors: ["Jesse Eisenberg", "Andrew Garfield", "Rooney Mara"],
    topics: ["startup conflict", "ambition", "betrayal"],
  },
  {
    title: "The Prestige",
    actors: ["Hugh Jackman", "Christian Bale", "Scarlett Johansson"],
    topics: ["rivalry", "illusion", "sacrifice"],
  },
  {
    title: "Oppenheimer",
    actors: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr"],
    topics: ["science ethics", "war politics", "historical accountability"],
  },
  {
    title: "Everything Everywhere All at Once",
    actors: ["Michelle Yeoh", "Ke Huy Quan", "Stephanie Hsu"],
    topics: ["multiverse", "family pressure", "identity"],
  },
  {
    title: "Whiplash",
    actors: ["Miles Teller", "J K Simmons", "Melissa Benoist"],
    topics: ["perfectionism", "mentorship", "obsession"],
  },
  {
    title: "Moneyball",
    actors: ["Brad Pitt", "Jonah Hill", "Philip Seymour Hoffman"],
    topics: ["sports analytics", "undervalued talent", "strategy"],
  },
  {
    title: "The Imitation Game",
    actors: ["Benedict Cumberbatch", "Keira Knightley", "Matthew Goode"],
    topics: ["cryptography", "war intelligence", "secrecy"],
  },
  {
    title: "Spirited Away",
    actors: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"],
    topics: ["coming of age", "spirit world", "identity"],
  },
  {
    title: "The Grand Budapest Hotel",
    actors: ["Ralph Fiennes", "Tony Revolori", "Saoirse Ronan"],
    topics: ["friendship", "nostalgia", "crime comedy"],
  },
];

const BOOK_CATALOG = [
  {
    title: "Dune",
    author: "Frank Herbert",
    topics: ["desert ecology", "prophecy", "empire politics"],
  },
  {
    title: "1984",
    author: "George Orwell",
    topics: ["surveillance", "authoritarianism", "language control"],
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    topics: ["class", "marriage", "social expectations"],
  },
  {
    title: "The Hobbit",
    author: "J R R Tolkien",
    topics: ["adventure", "friendship", "courage"],
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    topics: ["justice", "racism", "empathy"],
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    topics: ["human evolution", "culture", "cooperation"],
  },
  {
    title: "Neuromancer",
    author: "William Gibson",
    topics: ["cyberspace", "hacking", "ai influence"],
  },
  {
    title: "The Left Hand of Darkness",
    author: "Ursula K Le Guin",
    topics: ["gender", "diplomacy", "political tension"],
  },
  {
    title: "The Three-Body Problem",
    author: "Liu Cixin",
    topics: ["physics", "civilization conflict", "strategy"],
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    topics: ["behavior systems", "habit loops", "incremental change"],
  },
  {
    title: "The Catcher in the Rye",
    author: "J D Salinger",
    topics: ["adolescence", "alienation", "identity"],
  },
  {
    title: "The Brothers Karamazov",
    author: "Fyodor Dostoevsky",
    topics: ["faith", "morality", "family conflict"],
  },
  {
    title: "Beloved",
    author: "Toni Morrison",
    topics: ["memory", "trauma", "motherhood"],
  },
  {
    title: "The Road",
    author: "Cormac McCarthy",
    topics: ["survival", "fatherhood", "apocalypse"],
  },
  {
    title: "Thinking Fast and Slow",
    author: "Daniel Kahneman",
    topics: ["cognitive bias", "decision making", "psychology"],
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    topics: ["cosmology", "black holes", "physics"],
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    topics: ["destiny", "journey", "symbolism"],
  },
  {
    title: "The Martian",
    author: "Andy Weir",
    topics: ["science survival", "problem solving", "space"],
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    topics: ["first contact", "friendship", "space engineering"],
  },
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    topics: ["magic", "memory", "storytelling"],
  },
];

const ACTORS = [
  "the platform team",
  "a reliability engineer",
  "an autonomous agent",
  "the storage subsystem",
  "a data scientist",
  "the orchestration layer",
  "an integration test suite",
  "a benchmark harness",
  "the indexing daemon",
  "a production rollout",
  "a data governance lead",
  "the edge gateway",
  "a stream processing job",
  "the semantic ranking pipeline",
  "an observability analyst",
  "a feature engineering cluster",
  "the release automation bot",
  "a runtime policy evaluator",
  "a query optimizer",
  "the memory compaction worker",
  "a fault injection test",
  "the indexing coordinator",
  "an API contract checker",
  "the disaster recovery planner",
  "a synthetic traffic generator",
  "an adaptive load balancer",
  "the schema migration process",
  "a privacy compliance scanner",
  "a hybrid retrieval evaluator",
  "the backlog replay worker",
];

const VERBS = [
  "maps",
  "evaluates",
  "rechecks",
  "stabilizes",
  "profiles",
  "observes",
  "amplifies",
  "reduces",
  "documents",
  "validates",
  "correlates",
  "benchmarks",
  "triangulates",
  "diagnoses",
  "reconstructs",
  "normalizes",
  "decomposes",
  "contextualizes",
  "prioritizes",
  "reconciles",
  "isolates",
  "stress-tests",
  "rebalances",
  "replays",
  "instrumentalizes",
  "cross-checks",
  "backfills",
  "re-scores",
  "compresses",
  "annotates",
];

const OBJECTS = [
  "runtime behavior",
  "search outcomes",
  "latency drift",
  "consistency boundaries",
  "query intent",
  "memory traces",
  "error surfaces",
  "throughput variance",
  "depth transitions",
  "semantic overlap",
  "index isolation",
  "vector-lexical balance",
  "token budget pressure",
  "neuron activation history",
  "cross-region replication signals",
  "write amplification side effects",
  "cache eviction dynamics",
  "saturation thresholds",
  "cold-start penalties",
  "query fan-out patterns",
  "response quality regressions",
  "anomaly clusters",
  "failure-domain boundaries",
  "capacity planning assumptions",
  "retrieval confidence deltas",
  "concurrency edge cases",
  "error budget burn rate",
  "dependency ripple effects",
  "lifecycle transition timing",
  "ranking stability under noise",
];

const FILLER_PHRASES = [
  "while balancing short, medium, and long context windows",
  "under realistic write-read-search pressure",
  "with randomized English content and controlled anchors",
  "to compare top-k retrieval quality against expected topics",
  "without introducing deterministic repetition artifacts",
  "while tracking depth-aware retrieval behavior",
  "to check if related vocabulary remains discoverable",
  "with strict timing capture for every operation",
  "to verify index isolation and cross-index consistency",
  "without relying on synthetic single-word prompts",
  "while preserving index-level statistical comparability",
  "to emulate bursty ingestion shaped by sinusoidal intervals",
  "with distractor terms blended into the same paragraph",
  "so similarity-based ranking cannot memorize one rigid phrase",
  "while rotating lexical style between formal and conversational tones",
  "so repeated runs retain semantic intent but not exact phrasing",
  "with neighboring topic hints that challenge shallow keyword matches",
  "to surface borderline retrieval scenarios instead of only perfect matches",
  "while continuously changing clause order and narrative shape",
  "to force the engine to rank by relevance, not by template identity",
];

const TRANSITIONS = [
  "Meanwhile",
  "In parallel",
  "After that",
  "At the same time",
  "In the same experiment",
  "During this cycle",
  "For the next interval",
  "Under the same constraints",
  "Across repeated runs",
  "Within the current phase",
  "In a separate replay window",
  "With a fresh random seed",
  "On the following checkpoint",
  "During the validation pass",
  "As the load profile shifts",
  "Across a new burst segment",
  "Within the same synthetic storyline",
  "During comparative probing",
  "As the memory graph grows",
  "When interval pressure increases",
];

const QUALIFIERS = [
  "carefully",
  "incrementally",
  "aggressively",
  "methodically",
  "selectively",
  "safely",
  "adaptively",
  "deterministically",
  "heuristically",
  "probabilistically",
  "iteratively",
  "systematically",
  "predictably",
  "resiliently",
  "semantically",
  "lexically",
  "contextually",
  "observably",
  "transparently",
  "continuously",
];

const LOCATIONS = [
  "in Stockholm",
  "in Toronto",
  "in Frankfurt",
  "in Singapore",
  "in São Paulo",
  "in Seoul",
  "in Madrid",
  "in Cape Town",
  "in Melbourne",
  "in Helsinki",
  "in Istanbul",
  "in Montréal",
  "in Dublin",
  "in Zurich",
  "in Taipei",
];

const DATA_POINTS = [
  "queue depth",
  "tail latency",
  "token drift",
  "retrieval confidence",
  "error skew",
  "topic bleed",
  "document freshness",
  "index pressure",
  "branch entropy",
  "result volatility",
  "activation spread",
  "relevance variance",
  "cache churn",
  "write jitter",
  "read amplification",
  "search fan-out",
  "ranking entropy",
  "recall sharpness",
  "consistency gap",
  "schema pressure",
];

const TIME_WINDOWS = [
  "for the last 90 seconds",
  "during a 3-minute surge",
  "across a 15-minute replay",
  "inside a rolling 7-minute window",
  "over a 45-second burst",
  "within two back-to-back intervals",
  "throughout the evening test batch",
  "while overnight maintenance traffic is replayed",
  "in a low-traffic morning run",
  "during a noisy canary slice",
  "across two consecutive benchmark epochs",
  "inside a mixed-latency scenario",
];

const CONNECTORS = ["and", "while", "because", "although", "unless", "so that", "whereas", "before", "after", "once"];

const ID_PREFIXES = ["alpha", "beta", "gamma", "delta", "omega", "theta", "sigma", "kappa", "atlas", "nova", "pulse", "ion"];

const DEFAULTS = {
  baseUrl: process.env.QUBICDB_BASE_URL || "http://localhost:6060",
  iterationsPerIndex: intFromEnv("BENCH_ITERATIONS", 500),
  searchQueriesPerIndex: intFromEnv("BENCH_SEARCH_QUERIES", 750),
  timeoutMs: intFromEnv("BENCH_HTTP_TIMEOUT_MS", 15000),
  maxHttpRetries: intFromEnv("BENCH_HTTP_RETRIES", 6),
  retryBackoffMs: intFromEnv("BENCH_HTTP_RETRY_BACKOFF_MS", 1000),
  searchLimit: intFromEnv("BENCH_SEARCH_LIMIT", 10),
  indexPrefix: process.env.BENCH_INDEX_PREFIX || "deepage",
};

function intFromEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseArgs() {
  const config = { ...DEFAULTS, skipReadmeUpdate: false };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--base-url=")) {
      config.baseUrl = arg.slice("--base-url=".length);
    } else if (arg.startsWith("--iterations=")) {
      config.iterationsPerIndex = Number.parseInt(arg.slice("--iterations=".length), 10) || config.iterationsPerIndex;
    } else if (arg.startsWith("--queries=")) {
      config.searchQueriesPerIndex = Number.parseInt(arg.slice("--queries=".length), 10) || config.searchQueriesPerIndex;
    } else if (arg.startsWith("--timeout-ms=")) {
      config.timeoutMs = Number.parseInt(arg.slice("--timeout-ms=".length), 10) || config.timeoutMs;
    } else if (arg.startsWith("--http-retries=")) {
      config.maxHttpRetries = Math.max(0, Number.parseInt(arg.slice("--http-retries=".length), 10) || config.maxHttpRetries);
    } else if (arg.startsWith("--retry-backoff-ms=")) {
      config.retryBackoffMs =
        Math.max(100, Number.parseInt(arg.slice("--retry-backoff-ms=".length), 10) || config.retryBackoffMs);
    } else if (arg.startsWith("--index-prefix=")) {
      config.indexPrefix = arg.slice("--index-prefix=".length);
    } else if (arg === "--skip-readme-update") {
      config.skipReadmeUpdate = true;
    }
  }

  if (config.iterationsPerIndex < 10) {
    throw new Error(`--iterations must be at least 10, got ${config.iterationsPerIndex}`);
  }

  return config;
}

function createRng(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let z = t;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng, min, maxInclusive) {
  return min + Math.floor(rng() * (maxInclusive - min + 1));
}

function sample(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function marker(tag, value) {
  return `[${tag}:${slugify(value)}]`;
}

function buildPlan(iterations) {
  const plan = [];
  for (let i = 0; i < iterations; i += 1) {
    const topic = TOPICS[i % TOPICS.length];
    const wave = Math.sin((i / iterations) * Math.PI * 5) + 0.4 * Math.sin((i / iterations) * Math.PI * 17);

    const bucket = wave < -0.35 ? "short" : wave < 0.45 ? "medium" : "long";
    const targetWordCount =
      bucket === "short"
        ? 18 + Math.round(((wave + 1.35) / 1.0) * 10)
        : bucket === "medium"
          ? 34 + Math.round(((wave + 0.35) / 0.8) * 18)
          : 62 + Math.round(((wave - 0.45) / 0.95) * 40);

    plan.push({
      iteration: i,
      topic,
      bucket,
      targetWordCount,
      canonicalQuery: topic.canonical,
      synonymQuery: topic.synonyms[i % topic.synonyms.length],
      relatedQuery: topic.related[i % topic.related.length],
    });
  }
  return plan;
}

function randomSyntheticToken(rng, minSyllables = 2, maxSyllables = 4) {
  const syllables = [
    "al",
    "tor",
    "mi",
    "zen",
    "qua",
    "rio",
    "vak",
    "len",
    "dri",
    "sol",
    "nar",
    "pex",
    "lum",
    "cai",
    "tri",
    "vor",
    "shi",
    "pra",
    "tek",
    "mur",
  ];

  const parts = [];
  const count = randInt(rng, minSyllables, maxSyllables);
  for (let i = 0; i < count; i += 1) {
    parts.push(sample(rng, syllables));
  }
  return parts.join("");
}

function randomRefCode(rng) {
  return `${sample(rng, ID_PREFIXES)}-${randomSyntheticToken(rng, 2, 3)}-${randInt(rng, 1000, 9999)}`;
}

function sentence(rng, planItem, indexLabel, sentenceIndex) {
  const topic = planItem.topic;
  const actor = sample(rng, ACTORS);
  const verb = sample(rng, VERBS);
  const object = sample(rng, OBJECTS);
  const qualifier = sample(rng, QUALIFIERS);
  const location = sample(rng, LOCATIONS);
  const filler = sample(rng, FILLER_PHRASES);
  const dataPointA = sample(rng, DATA_POINTS);
  const dataPointB = sample(rng, DATA_POINTS);
  const connector = sample(rng, CONNECTORS);
  const timeWindow = sample(rng, TIME_WINDOWS);
  const crossTopic = sample(rng, TOPICS.filter((t) => t.id !== topic.id));
  const ref = randomRefCode(rng);
  const ratio = `${randInt(rng, 7, 93)}:${randInt(rng, 5, 99)}`;

  const templates = [
    () =>
      `${actor} ${qualifier} ${verb} ${object} ${filler}, and keeps ${topic.canonical} connected to ${topic.synonyms[sentenceIndex % topic.synonyms.length]} through ${topic.related[sentenceIndex % topic.related.length]}.`,
    () =>
      `${sample(rng, TRANSITIONS)} ${location}, ${actor} ${verb} ${dataPointA} ${timeWindow}, ${connector} the run cross-checks ${topic.canonical} against ${crossTopic.canonical} with marker ${ref}.`,
    () =>
      `Field note ${ref}: ${actor} ${verb} ${object} using ratio ${ratio}; this paragraph mentions ${topic.canonical}, ${topic.related[(sentenceIndex + 1) % topic.related.length]}, and ${topic.synonyms[(sentenceIndex + 1) % topic.synonyms.length]} to avoid rigid phrasing.`,
    () =>
      `"${topic.canonical} should stay retrievable even when phrasing drifts," wrote ${actor}, who then ${verb} ${dataPointB} ${timeWindow} ${connector} compared it with ${crossTopic.synonyms[sentenceIndex % crossTopic.synonyms.length]}.`,
    () =>
      `Operational checklist ${ref} records ${dataPointA}, ${dataPointB}, and ${sample(rng, DATA_POINTS)}; ${actor} ${qualifier} ${verb} ${object} ${filler}.`,
    () =>
      `If a query asks about ${topic.related[(sentenceIndex + 2) % topic.related.length]}, the benchmark still expects memory of ${topic.canonical}; therefore ${actor} ${verb} ${object} ${timeWindow}.`,
    () =>
      `Comparative segment ${randInt(rng, 2, 11)} links ${topic.canonical} with ${topic.synonyms[(sentenceIndex + 2) % topic.synonyms.length]} while intentionally injecting neighbor terms like ${crossTopic.related[(sentenceIndex + 2) % crossTopic.related.length]} and ${randomSyntheticToken(rng)}.`,
    () =>
      `${sample(rng, TRANSITIONS)}, ${actor} ${verb} ${object} ${connector} annotates ${dataPointA}; in this turn the content embeds ${topic.canonical}, ${topic.synonyms[sentenceIndex % topic.synonyms.length]}, and the synthetic tag ${indexLabel}-${randomSyntheticToken(rng)}.`,
  ];

  return sample(rng, templates)();
}

function buildKnowledgeBundle(rng, planItem) {
  const movie = sample(rng, MOVIE_CATALOG);
  const book = sample(rng, BOOK_CATALOG);

  const actorFocus = sample(rng, movie.actors);
  const movieTopicFocus = sample(rng, movie.topics);
  const bookTopicFocus = sample(rng, book.topics);

  const contextQuestionTemplates = [
    () => `Which actor is associated with ${movie.title} and which author wrote ${book.title}?`,
    () => `How does ${movieTopicFocus} in ${movie.title} relate to ${bookTopicFocus} in ${book.title}?`,
    () => `Who appears in ${movie.title} and what core topic does ${book.title} discuss?`,
    () => `Compare ${movie.title} (${actorFocus}) with ${book.title} by ${book.author} using their main themes.`,
  ];

  return {
    movie,
    book,
    actorFocus,
    movieTopicFocus,
    bookTopicFocus,
    contextQuestion: sample(rng, contextQuestionTemplates)(),
    markers: {
      movie: marker("movie", movie.title),
      actorFocus: marker("actor", actorFocus),
      book: marker("book", book.title),
      author: marker("author", book.author),
      movieTopic: marker("movie-topic", movieTopicFocus),
      bookTopic: marker("book-topic", bookTopicFocus),
    },
  };
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function createContent(planItem, indexLabel, rng) {
  const uniqueToken = `${indexLabel}-${planItem.iteration}-${randInt(rng, 100000, 999999)}-${randomSyntheticToken(rng)}`;
  const topicMarker = `[topic:${planItem.topic.id}]`;
  const knowledge = buildKnowledgeBundle(rng, planItem);

  const intro = `${sample(rng, TRANSITIONS)}, this record focuses on ${planItem.topic.canonical}, references ${planItem.synonymQuery}, links ${planItem.relatedQuery}, and intentionally varies structure to reduce template overfitting pressure.`;
  const body = [intro];
  body.push(
    `Film list item: "${knowledge.movie.title}" starring ${knowledge.movie.actors.join(", ")} explores ${knowledge.movie.topics.join(", ")}.`
  );
  body.push(
    `Book list item: "${knowledge.book.title}" by ${knowledge.book.author} discusses ${knowledge.book.topics.join(", ")}.`
  );
  body.push(`Context prompt: ${knowledge.contextQuestion}`);

  const minSentenceCount = planItem.bucket === "short" ? 5 : planItem.bucket === "medium" ? 7 : 10;
  let sentenceIndex = 0;

  while (sentenceIndex < minSentenceCount || wordCount(body.join(" ")) < planItem.targetWordCount) {
    body.push(sentence(rng, planItem, indexLabel, sentenceIndex));

    if (sentenceIndex > 0 && sentenceIndex % 3 === 0) {
      const distractor = sample(rng, TOPICS.filter((t) => t.id !== planItem.topic.id));
      body.push(
        `Context drift sample ${randomRefCode(rng)} adds neighboring vocabulary such as ${distractor.canonical}, ${distractor.synonyms[sentenceIndex % distractor.synonyms.length]}, and ${distractor.related[sentenceIndex % distractor.related.length]} to challenge shallow keyword matching.`
      );
    }

    sentenceIndex += 1;
  }

  while (wordCount(body.join(" ")) < planItem.targetWordCount) {
    body.push(sentence(rng, planItem, indexLabel, sentenceIndex));
    sentenceIndex += 1;
  }

  body.push(
    `Unique marker ${uniqueToken} ${topicMarker} canonical:${planItem.topic.canonical} synonym:${planItem.synonymQuery} related:${planItem.relatedQuery}.`
  );
  body.push(
    `Knowledge markers ${knowledge.markers.movie} ${knowledge.markers.actorFocus} ${knowledge.markers.book} ${knowledge.markers.author} ${knowledge.markers.movieTopic} ${knowledge.markers.bookTopic}.`
  );
  return {
    content: body.join(" "),
    uniqueToken,
    topicMarker,
    knowledge,
  };
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function summarizeLatency(values) {
  if (values.length === 0) {
    return { min: 0, avg: 0, p50: 0, p95: 0, p99: 0, max: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

  return {
    min: round3(min),
    avg: round3(avg),
    p50: round3(percentile(values, 50)),
    p95: round3(percentile(values, 95)),
    p99: round3(percentile(values, 99)),
    max: round3(max),
  };
}

function round3(v) {
  return Math.round(v * 1000) / 1000;
}

function inferTopicId(contentLower) {
  for (const topic of TOPICS) {
    if (contentLower.includes(`[topic:${topic.id}]`)) {
      return topic.id;
    }
  }
  return "unknown";
}

function relevantForTopic(contentLower, topicId) {
  return contentLower.includes(`[topic:${topicId}]`);
}

function relevantForMarkers(contentLower, expectedMarkers) {
  if (!expectedMarkers || expectedMarkers.length === 0) return false;
  return expectedMarkers.every((m) => contentLower.includes(String(m).toLowerCase()));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(config, method, endpoint, options = {}) {
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  let body;

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const started = performance.now();
  const maxRetries = Number.isInteger(options.maxRetries) ? Math.max(0, options.maxRetries) : config.maxHttpRetries;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    let response;
    try {
      response = await fetch(`${config.baseUrl}${endpoint}`, {
        method,
        headers,
        body,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      const elapsed = performance.now() - started;
      if (attempt < maxRetries) {
        const waitMs = Math.min(10000, config.retryBackoffMs * (attempt + 1));
        await sleep(waitMs);
        continue;
      }
      throw new Error(`${method} ${endpoint} failed after ${round3(elapsed)}ms: ${String(err)}`);
    }

    clearTimeout(timeout);

    let parsed;
    const text = await response.text();
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
      }
    } else {
      parsed = {};
    }

    if (response.ok) {
      const elapsedMs = performance.now() - started;
      return { data: parsed, elapsedMs };
    }

    if (response.status === 429 && attempt < maxRetries) {
      const retryAfterSec = Number.parseInt(response.headers.get("Retry-After") || "", 10);
      const waitMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
        ? retryAfterSec * 1000
        : Math.min(60000, config.retryBackoffMs * (attempt + 1));

      console.log(
        `[deepage] Rate limited on ${method} ${endpoint}; retrying in ${Math.round(waitMs / 1000)}s (${attempt + 1}/${maxRetries})`
      );
      await sleep(waitMs);
      continue;
    }

    throw new Error(`${method} ${endpoint} -> ${response.status}: ${JSON.stringify(parsed)}`);
  }

  const elapsedMs = performance.now() - started;
  throw new Error(`${method} ${endpoint} failed after ${round3(elapsedMs)}ms: exhausted retries`);
}

async function waitForHealth(config) {
  const deadline = Date.now() + 120000;
  let lastErr = "";

  while (Date.now() < deadline) {
    try {
      const { data } = await requestJson(config, "GET", "/health");
      if (data && String(data.status).toLowerCase().includes("healthy")) {
        return;
      }
      lastErr = `unexpected health response: ${JSON.stringify(data)}`;
    } catch (err) {
      lastErr = String(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error(`Health check timed out for ${config.baseUrl}. Last error: ${lastErr}`);
}

async function ensureIndexRegistered(config, indexId, metadata = {}) {
  const { data } = await requestJson(config, "POST", "/v1/registry/find-or-create", {
    body: {
      uuid: indexId,
      metadata,
    },
  });

  return {
    uuid: data?.uuid || indexId,
    created: Boolean(data?.created),
  };
}

function operationSummary(successes, failures, latencies, durationMs) {
  const count = successes + failures;
  return {
    count,
    success: successes,
    failed: failures,
    successRate: count === 0 ? 0 : round3((successes / count) * 100),
    throughputPerSec: durationMs <= 0 ? 0 : round3((count * 1000) / durationMs),
    latencyMs: summarizeLatency(latencies),
  };
}

async function runIndexBenchmark(config, runInfo, indexLabel, indexId, plan, seed) {
  await ensureIndexRegistered(config, indexId, {
    source: "deepage-benchmark",
    runId: runInfo.runId,
    indexLabel,
  });

  const rng = createRng(seed);
  const writeLatencies = [];
  const readLatencies = [];
  const searchLatencies = [];

  let writeSuccess = 0;
  let writeFailed = 0;
  let readSuccess = 0;
  let readFailed = 0;
  let searchSuccess = 0;
  let searchFailed = 0;

  let readContentMatches = 0;
  let top1Correct = 0;
  let top5Hit = 0;
  let precisionAt5Sum = 0;
  let mrrSum = 0;
  let searchNonEmpty = 0;

  let top1DepthSum = 0;
  let top1DepthCount = 0;
  let relevantDepthSum = 0;
  let relevantDepthCount = 0;
  let top1WithinQueryDepth = 0;
  let contextualQueryCount = 0;
  let contextualTop1Correct = 0;
  let contextualTop5Hit = 0;

  const records = [];
  const queryObservations = [];

  const writeStart = performance.now();
  for (const planItem of plan) {
    const rendered = createContent(planItem, indexLabel, rng);

    try {
      const writeRes = await requestJson(config, "POST", "/v1/write", {
        headers: { "X-Index-ID": indexId },
        body: { content: rendered.content },
      });
      writeLatencies.push(writeRes.elapsedMs);
      writeSuccess += 1;

      const neuronId = writeRes.data?._id || writeRes.data?.id;
      if (!neuronId) {
        throw new Error(`Write response missing neuron id: ${JSON.stringify(writeRes.data)}`);
      }

      records.push({
        neuronId,
        topicId: planItem.topic.id,
        content: rendered.content,
        querySpecs: [
          {
            kind: "topic-canonical",
            query: planItem.canonicalQuery,
            expectedMarkers: [rendered.topicMarker],
          },
          {
            kind: "topic-synonym",
            query: planItem.synonymQuery,
            expectedMarkers: [rendered.topicMarker],
          },
          {
            kind: "topic-related",
            query: planItem.relatedQuery,
            expectedMarkers: [rendered.topicMarker],
          },
          {
            kind: "movie-title",
            query: rendered.knowledge.movie.title,
            expectedMarkers: [rendered.knowledge.markers.movie],
          },
          {
            kind: "movie-actor",
            query: rendered.knowledge.actorFocus,
            expectedMarkers: [rendered.knowledge.markers.movie, rendered.knowledge.markers.actorFocus],
          },
          {
            kind: "movie-topic",
            query: rendered.knowledge.movieTopicFocus,
            expectedMarkers: [rendered.knowledge.markers.movie, rendered.knowledge.markers.movieTopic],
          },
          {
            kind: "book-title",
            query: rendered.knowledge.book.title,
            expectedMarkers: [rendered.knowledge.markers.book],
          },
          {
            kind: "book-author",
            query: rendered.knowledge.book.author,
            expectedMarkers: [rendered.knowledge.markers.book, rendered.knowledge.markers.author],
          },
          {
            kind: "book-topic",
            query: rendered.knowledge.bookTopicFocus,
            expectedMarkers: [rendered.knowledge.markers.book, rendered.knowledge.markers.bookTopic],
          },
          {
            kind: "context-question",
            query: rendered.knowledge.contextQuestion,
            expectedMarkers: [rendered.knowledge.markers.movie, rendered.knowledge.markers.book],
          },
        ],
      });

      const readRes = await requestJson(config, "GET", `/v1/read/${encodeURIComponent(neuronId)}`, {
        headers: { "X-Index-ID": indexId },
      });
      readLatencies.push(readRes.elapsedMs);
      readSuccess += 1;

      if ((readRes.data?.content || "") === rendered.content) {
        readContentMatches += 1;
      }
    } catch (err) {
      if (String(err).includes("/v1/read/")) {
        readFailed += 1;
      } else {
        writeFailed += 1;
      }
    }
  }
  const writeDurationMs = performance.now() - writeStart;

  const queryStart = performance.now();
  for (let q = 0; q < config.searchQueriesPerIndex; q += 1) {
    const record = records[q % records.length];
    if (!record) break;

    const querySpec = record.querySpecs[q % record.querySpecs.length];
    const query = querySpec.query;
    const isContextualQuery =
      querySpec.kind.startsWith("movie-") || querySpec.kind.startsWith("book-") || querySpec.kind === "context-question";

    if (isContextualQuery) {
      contextualQueryCount += 1;
    }

    const queryDepth = Math.max(1, Math.min(8, Math.round(1 + ((Math.sin(q / 31) + 1) / 2) * 7)));

    try {
      const searchRes = await requestJson(config, "POST", "/v1/search", {
        headers: { "X-Index-ID": indexId },
        body: {
          query,
          depth: queryDepth,
          limit: config.searchLimit,
        },
      });

      searchLatencies.push(searchRes.elapsedMs);
      searchSuccess += 1;

      const results = Array.isArray(searchRes.data?.results) ? searchRes.data.results : [];
      if (results.length > 0) {
        searchNonEmpty += 1;
      }

      const inferredTopTopics = new Set();
      let firstRelevantRank = 0;
      let relevantInTop5 = 0;

      for (let i = 0; i < Math.min(5, results.length); i += 1) {
        const r = results[i];
        const contentLower = String(r?.content || "").toLowerCase();
        const inferredTopic = inferTopicId(contentLower);
        inferredTopTopics.add(inferredTopic);

        const isRelevant =
          relevantForMarkers(contentLower, querySpec.expectedMarkers) || relevantForTopic(contentLower, record.topicId);
        if (isRelevant) {
          relevantInTop5 += 1;
          if (firstRelevantRank === 0) {
            firstRelevantRank = i + 1;
          }
        }

        if (typeof r?.depth === "number" && Number.isFinite(r.depth) && isRelevant) {
          relevantDepthSum += r.depth;
          relevantDepthCount += 1;
        }
      }

      const top1 = results[0];
      if (top1 && typeof top1.depth === "number") {
        top1DepthSum += top1.depth;
        top1DepthCount += 1;
        if (top1.depth <= queryDepth) {
          top1WithinQueryDepth += 1;
        }
      }

      if (firstRelevantRank === 1) {
        top1Correct += 1;
        if (isContextualQuery) {
          contextualTop1Correct += 1;
        }
      }
      if (firstRelevantRank > 0) {
        top5Hit += 1;
        mrrSum += 1 / firstRelevantRank;
        if (isContextualQuery) {
          contextualTop5Hit += 1;
        }
      }

      precisionAt5Sum += relevantInTop5 / 5;

      queryObservations.push({
        query,
        queryKind: querySpec.kind,
        queryDepth,
        expectedTopicId: record.topicId,
        inferredTopTopics: [...inferredTopTopics],
      });
    } catch {
      searchFailed += 1;
    }
  }
  const queryDurationMs = performance.now() - queryStart;

  let recall = null;
  let brainStats = null;
  try {
    const recallRes = await requestJson(config, "GET", "/v1/recall", {
      headers: { "X-Index-ID": indexId },
    });
    recall = {
      count: Number(recallRes.data?.count || 0),
      latencyMs: round3(recallRes.elapsedMs),
    };
  } catch {
    recall = { count: 0, latencyMs: 0 };
  }

  try {
    const statsRes = await requestJson(config, "GET", "/v1/brain/stats", {
      headers: { "X-Index-ID": indexId },
    });
    brainStats = statsRes.data;
  } catch {
    brainStats = null;
  }

  const totalQueries = Math.max(1, searchSuccess + searchFailed);

  return {
    indexId,
    writes: operationSummary(writeSuccess, writeFailed, writeLatencies, writeDurationMs),
    reads: {
      ...operationSummary(readSuccess, readFailed, readLatencies, writeDurationMs),
      exactContentMatchRate: readSuccess === 0 ? 0 : round3((readContentMatches / readSuccess) * 100),
    },
    searches: {
      ...operationSummary(searchSuccess, searchFailed, searchLatencies, queryDurationMs),
      nonEmptyRate: round3((searchNonEmpty / totalQueries) * 100),
      top1Accuracy: round3((top1Correct / totalQueries) * 100),
      top5HitRate: round3((top5Hit / totalQueries) * 100),
      precisionAt5: round3((precisionAt5Sum / totalQueries) * 100),
      mrr: round3((mrrSum / totalQueries) * 100),
      contextualQueryCount,
      contextualTop1Accuracy: contextualQueryCount === 0 ? 0 : round3((contextualTop1Correct / contextualQueryCount) * 100),
      contextualTop5HitRate: contextualQueryCount === 0 ? 0 : round3((contextualTop5Hit / contextualQueryCount) * 100),
    },
    depthMetrics: {
      avgTop1Depth: top1DepthCount === 0 ? 0 : round3(top1DepthSum / top1DepthCount),
      avgRelevantDepthTop5: relevantDepthCount === 0 ? 0 : round3(relevantDepthSum / relevantDepthCount),
      top1WithinQueryDepthRate: top1DepthCount === 0 ? 0 : round3((top1WithinQueryDepth / top1DepthCount) * 100),
    },
    recall,
    brainStats,
    queryObservations,
    methodology: {
      iterations: plan.length,
      searchQueries: config.searchQueriesPerIndex,
      searchLimit: config.searchLimit,
      queryTypesPerRecord: records[0]?.querySpecs?.length || 0,
    },
    runInfo,
  };
}

function jaccard(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);

  if (setA.size === 0 && setB.size === 0) return 1;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection += 1;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function compareIndexes(indexA, indexB) {
  const metricDeltas = {
    top1AccuracyDelta: round3(Math.abs(indexA.searches.top1Accuracy - indexB.searches.top1Accuracy)),
    top5HitRateDelta: round3(Math.abs(indexA.searches.top5HitRate - indexB.searches.top5HitRate)),
    precisionAt5Delta: round3(Math.abs(indexA.searches.precisionAt5 - indexB.searches.precisionAt5)),
    mrrDelta: round3(Math.abs(indexA.searches.mrr - indexB.searches.mrr)),
    writeSuccessRateDelta: round3(Math.abs(indexA.writes.successRate - indexB.writes.successRate)),
    readMatchRateDelta: round3(Math.abs(indexA.reads.exactContentMatchRate - indexB.reads.exactContentMatchRate)),
  };

  const pairedCount = Math.min(indexA.queryObservations.length, indexB.queryObservations.length);
  let jaccardSum = 0;
  for (let i = 0; i < pairedCount; i += 1) {
    jaccardSum += jaccard(indexA.queryObservations[i].inferredTopTopics, indexB.queryObservations[i].inferredTopTopics);
  }

  const avgQueryJaccard = pairedCount === 0 ? 0 : round3((jaccardSum / pairedCount) * 100);
  const deltaValues = Object.values(metricDeltas);
  const avgDelta = deltaValues.length === 0 ? 0 : deltaValues.reduce((sum, v) => sum + v, 0) / deltaValues.length;
  const consistencyScore = round3(Math.max(0, 100 - ((avgDelta + (100 - avgQueryJaccard)) / 2)));

  return {
    pairedQueries: pairedCount,
    avgQueryTopicalJaccard: avgQueryJaccard,
    metricDeltas,
    consistencyScore,
  };
}

function buildMarkdownReport(results) {
  const a = results.indexes[0];
  const b = results.indexes[1];
  const c = results.crossIndexConsistency;

  return [
    `### Latest Benchmark Run`,
    `- **Run ID:** ${results.runId}`,
    `- **Timestamp (UTC):** ${results.finishedAt}`,
    `- **Server URL:** ${results.config.baseUrl}`,
    `- **Iterations per index:** ${results.config.iterationsPerIndex}`,
    `- **Search queries per index:** ${results.config.searchQueriesPerIndex}`,
    `- **Total writes:** ${results.config.iterationsPerIndex * results.indexes.length}`,
    "",
    `#### Per-Index Performance`,
    `| Metric | ${a.indexId} | ${b.indexId} |`,
    `|---|---:|---:|`,
    `| Write success rate | ${a.writes.successRate}% | ${b.writes.successRate}% |`,
    `| Read exact-content match | ${a.reads.exactContentMatchRate}% | ${b.reads.exactContentMatchRate}% |`,
    `| Search non-empty rate | ${a.searches.nonEmptyRate}% | ${b.searches.nonEmptyRate}% |`,
    `| Top-1 accuracy | ${a.searches.top1Accuracy}% | ${b.searches.top1Accuracy}% |`,
    `| Top-5 hit rate | ${a.searches.top5HitRate}% | ${b.searches.top5HitRate}% |`,
    `| Precision@5 | ${a.searches.precisionAt5}% | ${b.searches.precisionAt5}% |`,
    `| MRR | ${a.searches.mrr}% | ${b.searches.mrr}% |`,
    `| Context Top-1 (movie/book actor/author/topic) | ${a.searches.contextualTop1Accuracy}% | ${b.searches.contextualTop1Accuracy}% |`,
    `| Context Top-5 hit (movie/book actor/author/topic) | ${a.searches.contextualTop5HitRate}% | ${b.searches.contextualTop5HitRate}% |`,
    `| Avg Top-1 depth | ${a.depthMetrics.avgTop1Depth} | ${b.depthMetrics.avgTop1Depth} |`,
    `| Top-1 within requested depth | ${a.depthMetrics.top1WithinQueryDepthRate}% | ${b.depthMetrics.top1WithinQueryDepthRate}% |`,
    "",
    `#### Latency (ms)`,
    `| Operation | ${a.indexId} p50 / p95 / p99 | ${b.indexId} p50 / p95 / p99 |`,
    `|---|---:|---:|`,
    `| Write | ${a.writes.latencyMs.p50} / ${a.writes.latencyMs.p95} / ${a.writes.latencyMs.p99} | ${b.writes.latencyMs.p50} / ${b.writes.latencyMs.p95} / ${b.writes.latencyMs.p99} |`,
    `| Read | ${a.reads.latencyMs.p50} / ${a.reads.latencyMs.p95} / ${a.reads.latencyMs.p99} | ${b.reads.latencyMs.p50} / ${b.reads.latencyMs.p95} / ${b.reads.latencyMs.p99} |`,
    `| Search | ${a.searches.latencyMs.p50} / ${a.searches.latencyMs.p95} / ${a.searches.latencyMs.p99} | ${b.searches.latencyMs.p50} / ${b.searches.latencyMs.p95} / ${b.searches.latencyMs.p99} |`,
    "",
    `#### Cross-Index Consistency`,
    `- **Consistency score:** ${c.consistencyScore}/100`,
    `- **Average top-topic Jaccard (paired queries):** ${c.avgQueryTopicalJaccard}% over ${c.pairedQueries} query pairs`,
    `- **Top-1 accuracy delta:** ${c.metricDeltas.top1AccuracyDelta}%`,
    `- **Top-5 hit rate delta:** ${c.metricDeltas.top5HitRateDelta}%`,
    `- **Precision@5 delta:** ${c.metricDeltas.precisionAt5Delta}%`,
    `- **MRR delta:** ${c.metricDeltas.mrrDelta}%`,
    `- **Read exact-match delta:** ${c.metricDeltas.readMatchRateDelta}%`,
    "",
  ].join("\n");
}

async function updateReadme(readmePath, markdownSection) {
  const startMarker = "<!-- BENCHMARK_RESULTS_START -->";
  const endMarker = "<!-- BENCHMARK_RESULTS_END -->";
  const current = await readFile(readmePath, "utf8");

  const block = `${startMarker}\n${markdownSection}\n${endMarker}`;

  if (current.includes(startMarker) && current.includes(endMarker)) {
    const next = current.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "m"), block);
    await writeFile(readmePath, next, "utf8");
    return;
  }

  const next = `${current.trimEnd()}\n\n${block}\n`;
  await writeFile(readmePath, next, "utf8");
}

async function run() {
  const config = parseArgs();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const resultsDir = path.join(__dirname, "results");
  const readmePath = path.join(__dirname, "README.md");

  await mkdir(resultsDir, { recursive: true });

  await waitForHealth(config);

  const runId = `${config.indexPrefix}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const startedAt = new Date().toISOString();
  const plan = buildPlan(config.iterationsPerIndex);

  const indexA = `${config.indexPrefix}-a-${Date.now().toString(36)}`;
  const indexB = `${config.indexPrefix}-b-${(Date.now() + 1).toString(36)}`;

  const runInfo = { runId, startedAt };

  console.log(`[deepage] Starting benchmark run ${runId}`);
  console.log(`[deepage] Using indexes: ${indexA}, ${indexB}`);

  const a = await runIndexBenchmark(config, runInfo, "alpha", indexA, plan, 42);
  const b = await runIndexBenchmark(config, runInfo, "beta", indexB, plan, 1337);

  const crossIndexConsistency = compareIndexes(a, b);
  const finishedAt = new Date().toISOString();

  const results = {
    runId,
    startedAt,
    finishedAt,
    config,
    indexes: [a, b],
    crossIndexConsistency,
  };

  const jsonPath = path.join(resultsDir, "last-run.json");
  const markdownPath = path.join(resultsDir, "last-run.md");

  const markdownSection = buildMarkdownReport(results);

  await writeFile(jsonPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, `${markdownSection}\n`, "utf8");

  if (!config.skipReadmeUpdate) {
    await updateReadme(readmePath, markdownSection);
  }

  console.log("[deepage] Benchmark finished.");
  console.log(`[deepage] JSON report: ${jsonPath}`);
  console.log(`[deepage] Markdown report: ${markdownPath}`);
  console.log(`[deepage] Consistency score: ${crossIndexConsistency.consistencyScore}/100`);
}

run().catch((err) => {
  console.error(`[deepage] Benchmark failed: ${err.stack || err}`);
  process.exit(1);
});
