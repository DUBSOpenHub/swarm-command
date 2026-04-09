# Architecture

Swarm Command implements a 5-layer hierarchical multi-agent architecture derived from the SwarmSpeed 250 protocol. This document explains the system at two levels: a fast mental model first, then the full layer-by-layer breakdown.

---

## 30-Second Overview

If you only remember four things, remember these:

1. **Nexus decomposes the mission** into domain-level work.
2. **Commanders own domains** and turn them into smaller shards.
3. **Workers stay atomic** — leaf nodes never spawn more agents.
4. **Review + Shadow Score decide quality** before Nexus emits a final bundle.

```text
Mission
  ↓
Nexus
  ↓
Commanders
  ↓
Squad Leads
  ↓
Workers
  ↓
Reviewers + Shadow Score
  ↓
Final synthesis
```

**Read this doc when:** you want the system model.
**Jump to:** [architecture diagrams](architecture-diagrams.md) for visuals, [consensus](consensus.md) for merge mechanics, and [scaling](scaling.md) for deployment choices.

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

              + SHADOW SCORING (Nexus-internal, sealed acceptance criteria, Shadow Score Spec L2)
```

**Total agents for SS-250: ~316**

> Agent counts include all deployed agents across all layers: Nexus + Commanders + Squad Leads + Workers + Reviewers.

---

## Why This Shape Works

| Design choice | What it buys you |
|---|---|
| **Single Nexus at the top** | One decomposition authority and one final synthesis point |
| **Domain-owning Commanders** | Parallel workstreams without losing task ownership |
| **Squad Leads between Commanders and Workers** | Controlled fan-out and better task compression |
| **Leaf-node Workers** | Strict depth control and predictable cost |
| **Independent Reviewers** | Scoring from outside the execution path |
| **Nexus-internal Shadow Score** | Hidden validation without revealing the acceptance rubric |

---

## Layer Descriptions

### L0 — Nexus (1 agent)

| Property | Value |
|---|---|
| Agent type | `general-purpose` |
| Model | `claude-opus-4.6` |
| Context budget | 128K tokens |
| `can_launch` | `true` |
| Responsibilities | Task decomposition, commander assignment, reviewer dispatch, sealed criteria generation (Phase 1.5), shadow score validation (Phase 6), final synthesis, circuit breaker authority |
| Spawns | 5 Commanders + 10 Reviewers |

The Nexus is the brain of the swarm. It receives the user's task, decomposes it into domains, creates Context Capsules for each Commander, monitors the swarm, and synthesizes the final output from bundles plus review scores.

### L1 — Commanders (5 agents)

| Property | Value |
|---|---|
| Agent type | `general-purpose` |
| Model | Commander pool (10): `claude-opus-4.6`, `claude-opus-4.5`, `claude-opus-4.6-1m`, `claude-sonnet-4.6`, `claude-sonnet-4.5`, `claude-sonnet-4`, `gpt-5.4`, `gpt-5.2`, `gpt-5.1`, `goldeneye` |
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
| Model | Worker pool (6): `claude-haiku-4.5`, `gpt-5.4-mini`, `gpt-5-mini`, `gpt-4.1`, `gpt-5.3-codex`, `gpt-5.2-codex` |
| Context budget | 8K tokens |
| `can_launch` | `false` — structurally enforced |
| Responsibilities | Execute one atomic task, emit structured JSON atom |

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

### Shadow Scoring ([Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec) L2)

Shadow scoring is Nexus-internal — no separate validator agents are spawned. The Nexus generates sealed acceptance criteria in Phase 1.5 and validates commander outputs against them in Phase 6.

| Property | Value |
|---|---|
| Implementation | Nexus-internal sealed-envelope protocol |
| Criteria | 10 binary pass/fail acceptance criteria |
| Formula | `Shadow Score = (failures / total) × 100` |
| Hardening | 1 cycle if score > 15% |
| Conformance | Shadow Score Spec L2 |

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

**Key insight: pipeline overlap.** Reviewers start before every worker is done. The review mesh begins as soon as the first commander pair completes, which removes review time from the critical path.

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

**Compression ratio: 1024:1** — from 128K tokens at Nexus down to 128 tokens at Worker level.

### Compression Rules (Context Down)

1. **Strip rationale at each layer** — children need the task, not the history
2. **File scope narrows monotonically** — a child scope is always a subset of its parent
3. **Constraints tighten monotonically** — timeouts and token caps can only decrease
4. **Parent context stays short** — at most ~50 tokens of “why this matters”

### Aggregation Rules (Results Up)

1. **Conflicts bubble up** — disagreements survive until a higher layer resolves them
2. **Confidence is geometric mean** — `(c₁ × c₂ × ... × cₙ)^(1/n)`
3. **Failed atoms are replaced once** — retry budget = 1
4. **Deduplication is content-hash based** — identical atoms merge and confidence rises

---

## Cross-Model Pairing Matrix

For maximum insight diversity, models from different families are paired within the same pod:

| Pod Role | Primary Model | Alternate Model | Why alternate |
|---|---|---|---|
| Commander | claude-opus-4.6 | gpt-5.4, gpt-5.2, gpt-5.1, goldeneye | Reduce same-family blind spots |
| Squad Lead | claude-haiku-4.5 | gpt-5.4-mini | Keep fan-out cheap while mixing reasoning styles |
| Scout Worker | claude-haiku-4.5 | gpt-5.4-mini, gpt-5-mini, gpt-4.1 | Increase search and interpretation diversity |
| Executor Worker | gpt-5.3-codex | gpt-5.2-codex | Prefer code execution specialists for build/test |
| Reviewer | 8 cross-family pairs | — | Final scoring should not be self-referential |

---

## Design Principles

1. **Parent-controlled spawning** — children never decide whether they can launch descendants
2. **Signal compression at every layer** — context shrinks going down, results compress going up
3. **Canary-before-swarm** — deploy one canary worker before the whole pod
4. **Fail parsably** — structured outputs, structured failures, no silent collapse
5. **Pipeline overlap** — review starts before total execution finishes

---

## Sub-Linear Scaling

```text
Agents     Wall-Clock     Ratio vs SS-50
  50         ~30s           1.0×
 100         ~42s           1.4×
 250         ~65s           2.2×
 500         ~85s           2.8×
1000        ~110s           3.7×

Scaling exponent ≈ 0.45 (vs 1.0 for linear)
```

Sub-linear scaling comes from one idea: the expensive part is parallel, not serial. The main serial bottlenecks are Nexus decomposition, canary verification, and final synthesis.
