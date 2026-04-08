# Scaling Variants

Swarm Command supports 4 scaling configurations, from SS-50 (starter) to SS-1000 (experimental enterprise). This document details each variant with full agent counts, cost estimates, and deployment recommendations.

---

## Scaling Overview

| Scale | Total Agents | Commanders | Squad Leads | Workers | Reviewers | Wall-Clock | Cost Range |
|---|---|---|---|---|---|---|---|
| **SS-50** | ~52 | 3 | 15 | 45 | 3 | ~30s | $1.50–$3.50 |
| **SS-100** | ~83 | 3 | 18 | 72 | 6 | ~45s | $3.50–$8.00 |
| **SS-250** | ~268 | 5 | 50 | 250 | 10 | ~65–90s | $8.00–$16.22 |
| **SS-1000** ⚠️ | ~896 | 10 | 100 | 800 | 20 | ~110s | $25–$50 |

Default: **SS-100**. Use `swarm command ss-250` for full or `swarm command ss-50` for quick.

---

## SS-50 — Starter

Best for: Single-file refactors, focused investigations, quick code analysis.

```
L0: 1 Nexus (opus)
L1: 3 Commanders (sonnet)
L2: 15 Squad Leads (haiku)   — 5 per commander
L3: 45 Workers (haiku/mini)  — 3 per squad lead
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
| Squad Leads per Commander | 5 |
| Workers per Squad Lead | 3 |
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
L1: 3 Commanders (sonnet)
L2: 18 Squad Leads (haiku)   — 6 per commander
L3: 72 Workers (haiku/mini)  — 4 per squad lead
L4: 6 Reviewers (sonnet)
    Shadow Scoring (Nexus-internal, sealed criteria)
──────────────────────────
Total: ~83 agents
Cost:  $3.50 – $8.00
Time:  ~45s wall-clock
```

### SS-100 Configuration

| Parameter | Value |
|---|---|
| Commanders | 3 |
| Domains covered | 3 of 5 (auto-selected by task type) |
| Squad Leads per Commander | 6 |
| Workers per Squad Lead | 4 |
| Reviewers | 6 (3 pairs) |
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
Total: ~268 agents
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

## SS-1000 — Enterprise (Experimental)

> ⚠️ **Experimental**: SS-1000 is a speculative variant. It currently violates Law 4 (workers-per-squad-lead cap exceeds 5) and totals 991, not 1000. Use SS-250 for production deployments.

Best for: Entire codebase migrations, multi-repo operations (when stable).

```
L0: 1 Nexus (opus)
L1: 10 Commanders (sonnet)        — 2 per domain (redundancy)
L2: 100 Squad Leads (haiku)       — 10 per commander
L3: 800 Workers (haiku/mini)      — 8 per squad lead ⚠️
L4: 20 Reviewers (sonnet)         — 4 review meshes
L5: 5 Meta-Reviewers (opus)       — review the reviewers
    Shadow Scoring (Nexus-internal, sealed criteria, 6 meta-criteria)
──────────────────────────────
Total: ~896 agents
Cost:  $25 – $50
Time:  ~110s wall-clock
```

### SS-1000 Known Issues

1. **Law 4 violation**: Workers per Squad Lead (8) exceeds the cap of 5 defined in Depth Guard Law 4
2. **Not exactly 1000**: Actual count is ~896 agents
3. **Adds L5 layer**: Introduces Meta-Reviewers, increasing depth beyond the standard 3-layer limit
4. **Commander redundancy**: 2 Commanders per domain adds complexity for conflict resolution
5. **Cost unpredictable**: $25-$50 range is a rough estimate

### SS-1000 Mitigations (Future Work)

- Increase Squad Lead count to 200 (5 workers each = 1000 workers within Law 4)
- Add formal L5 protocol to Depth Guard
- Implement commander pair reconciliation protocol
- Add more granular cost tracking per domain

---

## Sub-Linear Scaling Proof

```
Agents     Wall-Clock     Ratio vs SS-50
  50         ~30s           1.0×
 100         ~42s           1.4×
 250         ~65s           2.2×
 500         ~85s           2.8×
1000        ~110s           3.7×

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
| SS-1000 | $50.00 | $38.00 | $30.00 | $25.00 |

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

Are you migrating an entire codebase or multiple repos?
  → SS-1000 (experimental — test with SS-250 first)
```

### Decision Matrix

| Task Complexity | Files Touched | Domains Needed | Recommended Scale |
|---|---|---|---|
| Simple refactor | 1-2 | 1-2 | SS-50 |
| Module feature | 3-10 | 2-3 | SS-100 |
| Cross-module feature | 10-50 | 3-5 | SS-250 |
| Repo-wide migration | 50+ | 5 | SS-250 or SS-1000 |
| Multi-repo operation | 100+ | 5 | SS-1000 |
