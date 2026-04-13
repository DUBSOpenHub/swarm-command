# Scaling Variants

Swarm Command supports three scaling configurations, from SS-50 (fast) to SS-250 (full consensus swarm). This document helps you choose the right scale quickly, then explains the details.

---

## 10-Second Chooser

```text
Need a fast second opinion on 1–2 files?
→ SS-50

Need a strong answer for a subsystem, feature, or review?
→ SS-100

Need repo-wide coverage, maximum consensus, or high-stakes analysis?
→ SS-250
```

### Decision Tree

```text
Is the task bounded to 1–2 files or one very narrow question?
├─ Yes → SS-50
└─ No
   │
   ├─ Does it span a feature, module, or several files with real implementation risk?
   │  ├─ Yes → SS-100
   │  └─ No
   │
   └─ Does it touch many modules, policy/compliance, or require maximum coverage?
      ├─ Yes → SS-250
      └─ If unsure → start at SS-100 and scale up only when coverage matters more than speed
```

---

## Scaling Overview

| Scale | Total Agents | Commanders | Squad Leads | Workers | Reviewers | Best For | Wall-Clock |
|---|---|---|---|---|---|---|---|
| **SS-50** | ~52 | 3 | — | 45 | 3 | Fast bounded tasks | ~30s |
| **SS-100** | ~89 | 5 | — | 75 | 8 | Default for real software work | ~45s |
| **SS-250** | ~316 | 5 | 50 | 250 | 10 | Repo-wide or maximum-confidence work | ~65–90s |

> Agent counts include all deployed agents across all layers: Nexus + Commanders + Squad Leads + Workers + Reviewers.

Default: **SS-100**. Use `swarm command ss-250` for full deployment or `swarm command ss-50` for quick work.

---

## SS-50 — Starter

**Best for:** single-file refactors, focused investigations, quick code analysis, or doc updates for one component.

```text
L0: 1 Nexus (claude-opus-4.6)
L1: 3 Commanders (commander pool — 9 models)
L2: 45 Workers (worker pool — 6 models)  — 15 per commander, spawned directly
    3 Reviewers (cross-family pairs, spawned by Nexus)
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
| Squad Leads per Commander | — |
| Workers per Commander | 15 |
| Reviewers | 3 |
| Shadow scoring | Score computed, no hardening loop |
| Cost ceiling | $5.00 |
| Timeout cascade | 60/40/30/20s |

### When SS-50 feels right

- ✅ “Tell me what this stack trace most likely means”
- ✅ “Review this one file for perf or security issues”
- ✅ “Explain this subsystem quickly so I can get unstuck”
- ✅ “Update docs for this single component”
- ❌ Repo-wide or multi-module changes

---

## SS-100 — Standard (Default)

**Best for:** multi-file features, module-level refactors, comprehensive reviews, and most day-to-day engineering tasks.

```text
L0: 1 Nexus (claude-opus-4.6)
L1: 5 Commanders (commander pool — 9 models)
L2: 75 Workers (worker pool — 6 models)  — 15 per commander, spawned directly
    8 Reviewers (cross-family pairs, spawned by Nexus)
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
| Squad Leads per Commander | — |
| Workers per Commander | 15 |
| Reviewers | 8 reviewers (7 cross-family pairs) |
| Shadow scoring | 8 sealed criteria, hardening at >15% |
| Cost ceiling | $10.00 |
| Timeout cascade | 75/50/35/25s |

### When SS-100 feels right

- ✅ Multi-file feature implementation
- ✅ Module-level refactoring with tests and docs
- ✅ Architecture review + implementation plan + rollout notes
- ✅ API design, contract review, or comprehensive PR analysis
- ❌ Tiny tasks where latency matters more than coverage

---

## SS-250 — Full Deployment

**Best for:** repo-wide refactors, full-feature implementation, comprehensive audits, and documentation or compliance overhauls where missing a category is expensive.

```text
L0: 1 Nexus (claude-opus-4.6)
L1: 5 Commanders (commander pool — 9 models)
L2: 50 Squad Leads (claude-haiku-4.5 | gpt-5.4-mini)  — 10 per commander
L3: 250 Workers (worker pool — 6 models)               — 5 per squad lead
L4: 10 Reviewers (7 cross-family pairs)
    Shadow Scoring (Nexus-internal, sealed criteria)
──────────────────────────
Total: ~316 agents
Cost:  $8.00 – $16.22
Time:  ~65–90s wall-clock
```

### SS-250 Configuration

| Parameter | Value |
|---|---|
| Commanders | 5 |
| Domains covered | All 5 |
| Squad Leads per Commander | 10 |
| Workers per Squad Lead | 5 |
| Reviewers | 10 reviewers forming 7 cross-family pairs |
| Shadow scoring | 10 sealed criteria, hardening at >15% |
| Cost ceiling | $20.00 |
| Timeout cascade | 90/60/40/30s |

### When SS-250 feels right

- ✅ Repo-wide refactoring
- ✅ Full feature implementation across many modules
- ✅ Comprehensive security or compliance audit
- ✅ Complete documentation overhaul
- ✅ Multi-service architecture analysis
- ❌ Simple tasks where the swarm would be mostly overhead

### SS-250 Cost Breakdown

| Layer | Agents | Model | Tokens In (avg) | Tokens Out (avg) | Cost |
|---|---|---|---|---|---|
| Nexus (L0) | 1 | claude-opus-4.6 | 50K | 8K | $1.35 |
| Commanders (L1) | 5 | commander pool | 30K × 5 | 4K × 5 | $0.75 |
| Squad Leads (L2) | 50 | haiku / gpt-5.4-mini | 8K × 50 | 2K × 50 | $0.72 |
| Workers (L3) | 250 | worker pool | 2K × 250 | 0.5K × 250 | $0.90 |
| Reviewers (L4) | 10 | 7 cross-family pairs | 10K × 10 | 2K × 10 | $0.60 |
| **Total** | **316** | | | | **$4.32** (optimistic) |

---

## Parallel Execution Design

Wall-clock time grows slower than agent count because the expensive work runs in parallel:

```text
Agents     Wall-Clock     Ratio vs SS-50
  50         ~30s           1.0×
 100         ~42s           1.4×
 250         ~65s           2.2×
```

These are design targets, not measured benchmarks. The serial bottlenecks are limited to:

- Nexus decomposition: ~2s
- Canary verification: ~3s
- Final synthesis: ~10s

Everything else overlaps via hierarchical fan-out and pipeline overlap.

---

## Cost Optimization Strategies

| # | Strategy | Impact | Description |
|---|---|---|---|
| 1 | Use `explore` / `task` workers | 60% cheaper | Worker types are significantly cheaper than `general-purpose` |
| 2 | Haiku / Mini at L3 | 10× cheaper | Cheapest models handle the most atomic work |
| 3 | Micro-brief compression | ~15% savings | Smaller inputs reduce per-agent cost at scale |
| 4 | Wave deployment | ~20% savings on failure | Canary → Probe (max 3) → Remainder — with health gates between waves. Catches rate limits and bad tasks before full deployment. |
| 5 | Canary verification | ~5% savings on failure | One cheap canary prevents many expensive failures |
| 6 | Timeout cascade | Cost protection | Stop slow work before it burns budget |
| 7 | Cost ceiling | Absolute protection | $20 hard cap prevents runaway bills |

### Cost by Model Mix

| Config | All-Claude | Mixed Claude+GPT | All-GPT | Budget (explore-heavy) |
|---|---|---|---|---|
| SS-50 | $3.50 | $2.80 | $2.50 | $1.50 |
| SS-100 | $8.00 | $6.50 | $5.50 | $3.50 |
| SS-250 | $16.22 | $12.50 | $10.00 | $8.00 |

Budget configuration uses **60% `explore` + 30% `task` + 10% `general-purpose`**.

---

## Choosing the Right Scale

### Quick matrix

| Task Complexity | Files Touched | Domains Needed | Recommended Scale |
|---|---|---|---|
| Simple refactor | 1–2 | 1–2 | SS-50 |
| Module feature | 3–10 | 2–3 | SS-100 |
| Cross-module feature | 10–50 | 3–5 | SS-250 |
| Repo-wide migration | 50+ | 5 | SS-250 |

### Practical advice

- Start at **SS-100** when you want strong coverage but don't yet know whether you need maximum depth.
- Drop to **SS-50** when latency is the main constraint.
- Jump straight to **SS-250** when the cost of a missed class of issue is higher than the cost of waiting another 20–40 seconds.

