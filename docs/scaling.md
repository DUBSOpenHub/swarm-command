# Scaling Variants

Swarm Command supports 3 scaling configurations, from SS-50 (fast) to SS-250 (full consensus swarm). This document details each variant with full agent counts and deployment recommendations.

---

## Scaling Overview

| Scale | Total Agents | Commanders | Squad Leads | Workers | Reviewers | Wall-Clock |
|---|---|---|---|---|---|---|
| **SS-50** | ~52 | 3 | — | 45 | 3 | ~30s |
| **SS-100** | ~89 | 5 | — | 75 | 8 | ~45s |
| **SS-250** | ~316 | 5 | 50 | 250 | 10 | ~65–90s |

> Agent counts include ALL deployed agents across all layers (Nexus + Commanders + Squad Leads + Workers + Reviewers).

Default: **SS-100**. Use `swarm command ss-250` for full or `swarm command ss-50` for quick.

---

## SS-50 — Starter

Best for: Single-file refactors, focused investigations, quick code analysis.

```
L0: 1 Nexus (opus)
L1: 3 Commanders (sonnet)
L2: — (no Squad Leads at this scale)
L3: 45 Workers (haiku/mini)  — 15 per commander
L4: 3 Reviewers (sonnet)
──────────────────────────
Total: ~52 agents
Cost:  $1.50 – $3.50
Time:  ~30s wall-clock
```

### SS-50 Configuration

| Parameter | Value |
|---|---|
| Commanders | 3 |
| Domains covered | 2–3 of 5 (auto-selected by task type) |
| Squad Leads per Commander | — (not used) |
| Workers per Commander | 15 |
| Reviewers | 3 |
| Shadow scoring | Disabled (score computed, no hardening) |
| Cost ceiling | $5.00 |
| Timeout cascade | 60/40/30/20s |

### When to Use SS-50

- ✅ Single-file changes or analysis
- ✅ Quick code search or investigation
- ✅ Focused refactoring within one module
- ✅ Documentation updates for a specific component
- ❌ Multi-file features (use SS-100+)
- ❌ Repo-wide refactors (use SS-250)

---

## SS-100 — Standard (Default)

Best for: Multi-file features, module-level tasks, thorough code reviews.

```
L0: 1 Nexus (opus)
L1: 5 Commanders (sonnet)
L2: — (no Squad Leads at this scale)
L3: 75 Workers (haiku/mini)  — 15 per commander
L4: 8 Reviewers (sonnet)
    Shadow Scoring (Nexus-internal, sealed criteria)
──────────────────────────
Total: ~89 agents
Cost:  $3.50 – $8.00
Time:  ~45s wall-clock
```

### SS-100 Configuration

| Parameter | Value |
|---|---|
| Commanders | 5 |
| Domains covered | 3 of 5 (auto-selected by task type) |
| Squad Leads per Commander | — (not used) |
| Workers per Commander | 15 |
| Reviewers | 8 (4 pairs) |
| Shadow scoring | 8 sealed criteria, hardening at >15% |
| Cost ceiling | $10.00 |
| Timeout cascade | 75/50/35/25s |

### When to Use SS-100

- ✅ Multi-file feature implementation
- ✅ Module-level refactoring
- ✅ Comprehensive test suite generation
- ✅ API design and documentation
- ❌ Repo-wide changes (use SS-250)
- ❌ Quick lookups (use SS-50)

---

## SS-250 — Full Deployment

Best for: Repo-wide refactors, full feature implementation, comprehensive audits.

```
L0: 1 Nexus (opus)
L1: 5 Commanders (sonnet)
L2: 50 Squad Leads (haiku)   — 10 per commander
L3: 250 Workers (haiku/mini) — 5 per squad lead
L4: 10 Reviewers (sonnet)
    Shadow Scoring (Nexus-internal, sealed criteria)
──────────────────────────
Total: ~316 agents
Cost:  $8.00 – $16.22
Time:  ~65-90s wall-clock
```

### SS-250 Configuration

| Parameter | Value |
|---|---|
| Commanders | 5 |
| Domains covered | All 5 (architecture, implementation, testing, docs, integration) |
| Squad Leads per Commander | 10 |
| Workers per Squad Lead | 5 |
| Reviewers | 10 (5 cross-family pairs) |
| Shadow scoring | 10 sealed criteria, hardening at >15% (Shadow Score Spec L2) |
| Cost ceiling | $20.00 |
| Timeout cascade | 90/60/40/30s |

### When to Use SS-250

- ✅ Repo-wide refactoring
- ✅ Full feature implementation across all modules
- ✅ Comprehensive security audit
- ✅ Complete documentation overhaul
- ✅ Multi-service architecture analysis
- ❌ Simple tasks (overkill — use SS-50 or SS-100)

### SS-250 Cost Breakdown

| Layer | Agents | Model | Tokens In (avg) | Tokens Out (avg) | Cost |
|---|---|---|---|---|---|
| Nexus (L0) | 1 | opus | 50K | 8K | $1.35 |
| Commanders (L1) | 5 | sonnet | 30K × 5 | 4K × 5 | $0.75 |
| Squad Leads (L2) | 50 | haiku | 8K × 50 | 2K × 50 | $0.72 |
| Workers (L3) | 250 | haiku/mini | 2K × 250 | 0.5K × 250 | $0.90 |
| Reviewers (L4) | 10 | sonnet | 10K × 10 | 2K × 10 | $0.60 |
| **Total** | **316** | | | | **$4.32** (optimistic) |

---

## Sub-Linear Scaling Proof

```
Agents     Wall-Clock     Ratio vs SS-50
  50         ~30s           1.0×
 100         ~42s           1.4×
 250         ~65s           2.2×

Scaling exponent ≈ 0.45 (vs 1.0 for linear)
```

Sub-linear scaling comes from parallel execution dominance. Serial bottlenecks are limited to:
- Nexus decomposition: ~2s
- Canary verification: ~3s
- Final synthesis: ~10s

Everything else runs in parallel.

---

## Cost Optimization Strategies

| # | Strategy | Impact | Description |
|---|---|---|---|
| 1 | Use `explore`/`task` workers | 60% cheaper | `explore` and `task` agents are significantly cheaper than `general-purpose` |
| 2 | Haiku/Mini at L3 | 10× cheaper | Use cheapest/fastest models for atomic worker tasks |
| 3 | Micro-brief compression | ~15% savings | Fewer input tokens at worker level = lower cost at scale |
| 4 | Wave deployment | ~20% savings on failure | Catch bad tasks early before wasting all 250 agents |
| 5 | Canary verification | ~5% savings on failure | 1 cheap canary prevents 49 expensive failures |
| 6 | Timeout cascade | Cost protection | Kill slow agents instead of letting them burn tokens |
| 7 | Cost ceiling | Absolute protection | $20 kill-switch prevents runaway bills |

### Cost by Model Mix

| Config | All-Claude | Mixed Claude+GPT | All-GPT | Budget (explore-heavy) |
|---|---|---|---|---|
| SS-50 | $3.50 | $2.80 | $2.50 | $1.50 |
| SS-100 | $8.00 | $6.50 | $5.50 | $3.50 |
| SS-250 | $16.22 | $12.50 | $10.00 | $8.00 |

Budget configuration uses 60% `explore` (cheapest) + 30% `task` + 10% `general-purpose`.

---

## Choosing the Right Scale

```
Is your task about 1-2 files?
  → SS-50

Is your task about a module or feature (3-10 files)?
  → SS-100

Does your task span the entire repo or multiple modules?
  → SS-250
```

### Decision Matrix

| Task Complexity | Files Touched | Domains Needed | Recommended Scale |
|---|---|---|---|
| Simple refactor | 1-2 | 1-2 | SS-50 |
| Module feature | 3-10 | 2-3 | SS-100 |
| Cross-module feature | 10-50 | 3-5 | SS-250 |
| Repo-wide migration | 50+ | 5 | SS-250 |
