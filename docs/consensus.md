# Consensus Algorithm

Swarm Command uses a 4-stage consensus algorithm to merge the best work from hundreds of agents into a coherent final output. The algorithm uses a gate-then-rank approach: first classify agreement level (tier), then score within each tier.

---

## Overview

```
  Workers (250)          Squad Leads (50)       Commanders (5)        Nexus (1)
  ┌─────────┐           ┌──────────┐           ┌──────────┐        ┌─────────┐
  │ atom +   │──────────►│ local    │──────────►│ domain   │───────►│ cross-  │
  │ self_score│  group   │ merge    │  trimmed  │ merge    │ median │ domain  │
  │ + conf   │  by task  │ + tier   │  mean     │ + formula│ of 3   │ synth   │
  └─────────┘           └──────────┘           └──────────┘        └─────────┘
                             ▲                       ▲
                         5 atoms                 10 atom-sets          5 bundles
                         per squad               per commander        + 10 reviews
```

---

## Stage 1 — Worker Self-Score (L3)

Each worker emits a `self_score` (0–10) and `confidence` (0.0–1.0) with its Result Atom.

### Self-Score Interpretation

| Range | Meaning | Usage |
|---|---|---|
| 0–3 | Low confidence — task unclear, results may be wrong | De-prioritized during merge |
| 4–6 | Medium confidence — reasonable but with caveats | Standard weighting |
| 7–8 | High confidence — solid result with evidence | Prioritized during merge |
| 9–10 | Very high confidence — complete and verified | Strongest weight during merge |

### Usage in Consensus

- Self-score is used for initial weighting during Squad Lead merge
- Low self-score atoms are de-prioritized but NOT discarded (they may still be correct)
- Self-scores are weighted at 0.3× compared to cross-review scores (workers tend to overestimate — Dunning-Kruger effect)

---

## Stage 2 — Squad Lead Local Merge (L2)

Each Squad Lead collects 5 atoms from its workers and performs local consensus:

### Algorithm

```
For each sub-task addressed by multiple workers:
  1. Group atoms by sub-task (based on brief_id)
  2. Compare content of grouped atoms:
     a. If all atoms agree → CONSENSUS
        - Auto-merge into single atom
        - Boost confidence: merged_conf = min(1.0, original_conf × 1.2)
     b. If majority agree → MAJORITY
        - Merge the majority view into primary atom
        - Attach minority view as dissent note
        - Confidence = geometric_mean of majority atoms
     c. If no majority → CONFLICT
        - Preserve ALL atoms with conflict flag
        - Forward all to Commander for higher-level resolution
  3. Compute merged_confidence = geometric_mean(atom_confidences)
     geometric_mean = (c₁ × c₂ × ... × cₙ)^(1/n)
  4. Deduplicate by content hash
     - Identical results from different workers → merge, boost confidence
```

### Deduplication

Two atoms are considered duplicates when their `content` fields produce the same SHA-256 hash after normalization (lowercase, strip whitespace). Duplicate atoms are merged into one, with confidence boosted:

```
boosted_confidence = min(1.0, original_confidence × (1 + 0.1 × duplicate_count))
```

---

## Stage 3 — Commander Domain Merge (L1)

Each Commander collects atom-sets from 10 Squad Leads and performs cross-squad consensus:

### Algorithm

```
For each overlapping result across squads:
  1. Apply trimmed mean: discard highest and lowest scores, average the rest
  2. Weight by squad-level confidence
  3. Apply consensus formula:
     score = 0.40 × confidence + 0.30 × evidence + 0.15 × scope + 0.15 × coverage
             − min(0.10, conflict_rate × 0.10)
  4. Classify into tier (CONSENSUS / MAJORITY / CONFLICT / UNIQUE)
  5. For UNIQUE results: keep only if evidence score ≥ 7/10
```

### Consensus Scoring Formula

```
score = 0.40 × confidence + 0.30 × evidence + 0.15 × scope + 0.15 × coverage
        − min(0.10, conflict_rate × 0.10)
```

**Variables:**

| Variable | Definition | Range |
|---|---|---|
| `confidence` | Geometric mean of atom confidence scores | 0.0–1.0 |
| `evidence` | (atoms with ≥1 evidence file) / (total atoms) | 0.0–1.0 |
| `scope` | (addressed sub-tasks) / (assigned sub-tasks) | 0.0–1.0 |
| `coverage` | (unique aspects addressed) / (total aspects identified) | 0.0–1.0 |
| `conflict_rate` | unresolved_conflicts / total_atoms | 0.0–1.0 |

**Properties:**
- Positive coefficients sum to 1.0
- Conflict penalty is capped at 0.10 (prevents single conflict from dominating)
- Final score bounded [0.0, 1.0]

### Consensus Tiers

| Tier | Condition | Action |
|---|---|---|
| **CONSENSUS** | Score ≥ 0.70 | Auto-accept. Bundle is high-quality with strong agreement. |
| **MAJORITY** | Score ≥ 0.50 | Accept with dissent note. Most atoms agree but some disagree. |
| **CONFLICT** | Score < 0.50 | Flag for Nexus arbitration. Significant disagreement exists. |
| **UNIQUE** | No overlapping results | Keep only if evidence score ≥ 7/10. Novel finding by single squad. |

### Trimmed Mean

For overlapping results scored by 3+ squads, use trimmed mean instead of arithmetic mean:

```
Given scores: [s₁, s₂, s₃, ..., sₙ] sorted ascending
trimmed_mean = mean(s₂, s₃, ..., sₙ₋₁)  // drop lowest and highest
```

This is more resistant to outlier scores than arithmetic mean.

---

## Stage 4 — Nexus Cross-Domain Synthesis (L0)

The Nexus collects 5 bundles from Commanders + 10 review score-cards from Cross-Reviewers + shadow validation results.

### Algorithm

```
For each bundle:
  1. Compute final_score = mean(reviewer_weighted_totals) for that bundle
  2. Apply median-of-3 judging:
     - If 3+ reviewers scored it, use median (not mean)
     - This prevents one extreme score from skewing the result
  3. Rank bundles by final_score
  4. For CONFLICT-tier items:
     - Nexus makes final call using full context
     - May re-dispatch to a single reviewer for tiebreaking
  5. For CONSENSUS-tier items:
     - Auto-include in final output
  6. For MAJORITY-tier items:
     - Include with dissent notes attached
  7. Check shadow validation:
     - If shadow divergence > 0.15: attach warning
     - If shadow critical divergence > 0.30: re-review with shadow findings
  8. Emit final report with:
     - Attribution (which domains contributed)
     - Confidence intervals (per-domain and overall)
     - Gap report (any uncovered sub-tasks)
```

### Median-of-3 Judging

When 3 or more reviewers score a bundle, use the median score rather than the mean:

```
Given reviewer scores: [7.2, 8.5, 3.1]
Median = 7.2 (not mean = 6.27)
```

The median is robust against a single bad review dragging down a good bundle (or a single inflated review boosting a weak bundle).

---

## Consensus Flow Example

Consider a task "Refactor authentication module" being processed by SS-100 (100 agents):

### Stage 1: Workers
- 72 workers each produce a Result Atom with self-score and confidence
- Example: Worker W-01 finds 12 exported functions, confidence 0.92, self-score 8

### Stage 2: Squad Lead Merge
- 18 Squad Leads each collect 4 atoms
- SQ-01: 3 of 4 workers agree auth has 12 exports → MAJORITY (one worker found 11)
- SQ-02: All 4 workers agree middleware has 3 patterns → CONSENSUS
- SQ-03: Workers disagree on data flow direction → CONFLICT (preserved for Commander)

### Stage 3: Commander Domain Merge
- CMD-ARCH collects from 6 Squad Leads
- Applies trimmed mean across overlapping results
- Consensus formula score: 0.82 → CONSENSUS tier
- One CONFLICT from SQ-03 preserved and forwarded to Nexus

### Stage 4: Nexus Synthesis
- Receives 3 bundles + 6 review score-cards
- CMD-ARCH scored 8.2 by median-of-3 reviewers → auto-include
- CMD-IMPL scored 7.5 → auto-include
- CMD-TEST scored 4.8 → CONFLICT tier → Nexus arbitrates using full context
- Shadow validators confirm no critical divergence
- Final report emitted with overall confidence 0.79

---

## Anti-Patterns

| # | Anti-Pattern | Why It's Bad | Correct Pattern |
|---|---|---|---|
| 1 | **Winner-take-all** | Loses minority insights | Use tiered consensus |
| 2 | **Arithmetic mean scoring** | One outlier skews everything | Use trimmed mean or median-of-3 |
| 3 | **No conflict preservation** | Real conflicts hidden | Preserve and bubble up |
| 4 | **Self-score trust** | Workers overestimate | Weight self-scores at 0.3× |
| 5 | **Binary consensus** | Loses nuance | Use 4-tier system with scores |
