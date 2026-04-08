# Architecture

Swarm Command implements a 5-layer hierarchical multi-agent architecture derived from the SwarmSpeed 250 protocol. This document covers the full architecture with layer descriptions, signal flow, and timing.

---

## Layer Topology

```
                          ┌─────────────────┐
                    L0    │     NEXUS (1)    │  Model: claude-opus-4.6
                          │  128K ctx budget │  Type: general-purpose
                          └────────┬────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                     │
        ┌─────┴─────┐      ┌─────┴─────┐        ┌─────┴─────┐
  L1    │ CMD-A (1)  │      │ CMD-B (1)  │  ...   │ CMD-E (1)  │  × 5 Commanders
        │ 64K ctx    │      │ 64K ctx    │        │ 64K ctx    │  Type: general-purpose
        └─────┬──────┘      └─────┬──────┘        └─────┬──────┘  Model: mixed
              │                    │                     │
     ┌────────┼────────┐          │                     │
     │        │        │          │                     │
  ┌──┴──┐ ┌──┴──┐ ┌──┴──┐
  L2  │SQ-1│ │SQ-2│ ... │SQ-10│   × 10 per Commander = 50 Squad Leads
      │32K │ │32K │     │32K │    Type: general-purpose (can_launch=true)
      └──┬──┘ └──┬──┘   └──┬──┘  Model: claude-haiku-4.5
         │        │          │
      ┌──┴──┐ ┌──┴──┐   ┌──┴──┐
  L3  │W×5  │ │W×5  │   │W×5  │  × 5 per Squad Lead = 250 Workers
      │ 8K  │ │ 8K  │   │ 8K  │  Type: explore | task (LEAF — no spawning)
      └─────┘ └─────┘   └─────┘  Model: claude-haiku-4.5 | gpt-5.4-mini

                    ┌──────────────┐
              L4    │ REVIEWERS×10 │  Cross-review mesh
                    │    16K ctx   │  Type: general-purpose (can_launch=false)
                    └──────────────┘  Model: mixed (cross-family pairs)

              +     ┌──────────────┐
                    │ SHADOW × 3   │  Hidden criteria validators
                    │   16K ctx    │  Type: explore (LEAF)
                    └──────────────┘  Model: different from main pipeline
```

**Total agents for SS-250: 1 + 5 + 50 + 250 + 10 + 3 = 319**

---

## Layer Descriptions

### L0 — Nexus (1 agent)

| Property | Value |
|---|---|
| Agent type | `general-purpose` |
| Model | `claude-opus-4.6` |
| Context budget | 128K tokens |
| `can_launch` | `true` |
| Responsibilities | Task decomposition, commander assignment, reviewer dispatch, shadow validator dispatch, final synthesis, circuit breaker authority |
| Spawns | 5 Commanders + 10 Reviewers + 3 Shadow Validators |

The Nexus is the brain of the swarm. It receives the user's task, decomposes it into 5 domains, creates Context Capsules for each Commander, monitors the swarm, and synthesizes the final output from all bundles and review scores.

### L1 — Commanders (5 agents)

| Property | Value |
|---|---|
| Agent type | `general-purpose` |
| Model | Mixed: `claude-sonnet-4.6`, `gpt-5.4`, `gpt-5.2`, `claude-sonnet-4.5` (alternating) |
| Context budget | 64K tokens |
| `can_launch` | `true` |
| Max children | 10 Squad Leads each |
| Responsibilities | Domain decomposition, squad lead dispatch, canary verification, result merging within domain |

**Domain assignments:**

| Commander | Domain | Focus |
|---|---|---|
| CMD-ARCH | Architecture & Structure | Patterns, interfaces, module boundaries |
| CMD-IMPL | Implementation & Logic | Core logic, algorithms, data flow |
| CMD-TEST | Testing & Validation | Test cases, edge cases, validation |
| CMD-DOCS | Documentation & Examples | Docs, comments, examples, guides |
| CMD-INTG | Integration & Review | Cross-cutting concerns, glue code, API contracts |

### L2 — Squad Leads (50 agents)

| Property | Value |
|---|---|
| Agent type | `general-purpose` |
| Model | `claude-haiku-4.5` or `gpt-5.4-mini` (alternating) |
| Context budget | 32K tokens |
| `can_launch` | `true` |
| Max children | 5 Workers each |
| Responsibilities | Micro-task decomposition, canary deployment, worker dispatch, atom collection, local consensus |

### L3 — Workers (250 agents)

| Property | Value |
|---|---|
| Agent type | `explore` or `task` |
| Model | `claude-haiku-4.5` or `gpt-5.4-mini` (mixed within pod) |
| Context budget | 8K tokens |
| `can_launch` | `false` — **STRUCTURALLY ENFORCED** |
| Responsibilities | Execute single atomic task, emit structured JSON atom |

**Pod composition per Squad Lead:**

| Role | Count | Agent Type | Purpose |
|---|---|---|---|
| Canary | 1 | `explore` | Pre-flight check before full pod |
| Scout | 3 | `explore` | Research, search, read files |
| Executor | 1 | `task` | Run commands, build, test |

### L4 — Cross-Reviewers (10 agents)

| Property | Value |
|---|---|
| Agent type | `general-purpose` |
| Model | Mixed cross-family pairs |
| Context budget | 16K tokens |
| `can_launch` | `false` |
| Responsibilities | Cross-domain scoring, conflict detection, consensus voting |

### Shadow Validators (3 agents)

| Property | Value |
|---|---|
| Agent type | `explore` |
| Model | Different models from main pipeline |
| Context budget | 16K tokens |
| `can_launch` | `false` |
| Responsibilities | Hidden criteria scoring, divergence detection |

---

## Time-Flow Architecture

```
T+0s     T+2s       T+5s         T+12s       T+45s      T+65s    T+80s   T+90s
  │        │          │             │           │          │        │       │
  ▼        ▼          ▼             ▼           ▼          ▼        ▼       ▼
┌────┐  ┌──────┐  ┌─────────┐  ┌──────────┐ ┌────────┐ ┌───────┐ ┌────┐ ┌────┐
│NEXUS│→ │CMDs  │→ │SQUAD    │→ │WORKERS   │ │REVIEW  │ │MERGE  │ │VOTE│ │EMIT│
│BOOT │  │SPAWN │  │LEADS    │  │EXECUTE   │ │MESH    │ │RESULTS│ │    │ │    │
│     │  │      │  │+ CANARY │  │(parallel)│ │(overlap│ │       │ │    │ │    │
│     │  │      │  │VERIFY   │  │          │ │start)  │ │       │ │    │ │    │
└────┘  └──────┘  └─────────┘  └──────────┘ └────────┘ └───────┘ └────┘ └────┘
  2s       3s         7s           33s          20s        15s      10s    5s

  ◄──── LAUNCH PHASE ────►◄── EXECUTION ──►◄──── CONVERGENCE PHASE ────────►
         (~12s)               (~33s)                  (~45s)
```

**Key insight: Pipeline overlap.** Cross-reviewers start at T+45s before all workers complete. The review mesh begins as soon as the first two commander bundles arrive. This overlaps review with execution, saving ~20 seconds on the critical path.

---

## Signal Flow — Token Compression

```
           CONTEXT DOWN (shrinking)              RESULTS UP (compressing)
           ========================              ========================

  L0  Full Task Brief    ─── 4K tokens ───►  Final Report     ◄── 4K tokens
                 │                                    ▲
  L1  Context Capsule    ─── 2K tokens ───►  Bundle           ◄── 1K tokens
                 │                                    ▲
  L2  Shard              ─── 512 tokens ──►  Atom Set         ◄── 512 tokens
                 │                                    ▲
  L3  Micro-Brief        ─── 128 tokens ──►  Atom             ◄── 256 tokens
                 │                                    ▲
  L4  Review Capsule     ─── 1K tokens ───►  Score Card       ◄── 512 tokens
```

**Compression ratio: 1024:1** — From 128K tokens at Nexus to 128 tokens at Worker level.

### Compression Rules (Context Down)

1. **Strip rationale at each layer** — Children don't need to know *why*, only *what*
2. **File scope narrows monotonically** — A child's scope is always a subset of its parent's
3. **Constraints tighten monotonically** — Timeouts and token limits can only decrease
4. **Parent context is one sentence** — At most 50 tokens

### Aggregation Rules (Results Up)

1. **Conflicts bubble up** — Disagreements preserved with both positions until higher layer resolves
2. **Confidence is geometric mean** — (c₁ × c₂ × ... × cₙ)^(1/n)
3. **Failed atoms are replaced** — Squad Lead re-dispatches once (retry budget = 1)
4. **Deduplication is content-hash based** — Identical atoms merged, confidence boosted

---

## Cross-Model Pairing Matrix

For maximum insight diversity, models from different families are paired within the same pod:

| Pod Role | Primary Model | Alternate Model | When to Alternate |
|---|---|---|---|
| Commander | claude-sonnet-4.6 | gpt-5.4 | Every other commander |
| Squad Lead | claude-haiku-4.5 | gpt-5.4-mini | Alternate within same commander |
| Scout Worker | claude-haiku-4.5 | gpt-5.4-mini | Mix within same pod |
| Executor Worker | claude-haiku-4.5 | gpt-5.1 | Use GPT for build/test tasks |
| Reviewer | claude-sonnet-4.6 | gpt-5.4 | Cross-family pairs (always) |

---

## Design Principles

1. **Parent-controlled spawning** — The parent determines if a child `can_launch`; the child never decides for itself
2. **Signal compression at every layer** — Context shrinks going down, results compress going up
3. **Canary-before-swarm** — Deploy 1 canary worker per pod before full deployment
4. **Fail parsably** — Every output is JSON Schema-validated; failures are structured, never silent
5. **Pipeline overlap** — Cross-reviewers start as soon as the first commander pair completes

---

## Sub-Linear Scaling

```
Agents     Wall-Clock     Ratio vs SS-50
  50         ~30s           1.0×
 100         ~42s           1.4×
 250         ~65s           2.2×
 500         ~85s           2.8×
1000        ~110s           3.7×

Scaling exponent ≈ 0.45 (vs 1.0 for linear)
```

Sub-linear scaling comes from: parallel execution dominates. Only serial bottlenecks are Nexus decomposition (~2s), canary verification (~3s), and final synthesis (~10s).
