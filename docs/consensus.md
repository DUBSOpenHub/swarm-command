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
             − min(0.30, conflict_rate × 0.30)
  4. Classify into tier (CONSENSUS / MAJORITY / CONFLICT / UNIQUE)
  5. For UNIQUE results: keep only if evidence score ≥ 0.70
```

### Consensus Scoring Formula

```
score = 0.40 × confidence + 0.30 × evidence + 0.15 × scope + 0.15 × coverage
        − min(0.30, conflict_rate × 0.30)
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
- Conflict penalty is capped at 0.30 (high conflict rates meaningfully reduce scores while preventing domination)
- Final score bounded [0.0, 1.0]

**Note:** For detailed operational definitions of each term (confidence, evidence, scope, coverage, conflict_rate), see the "Formula Term Definitions" section below.

### Consensus Tiers

| Tier | Condition | Action |
|---|---|---|
| **CONSENSUS** | Score ≥ 0.70 | Auto-accept. Bundle is high-quality with strong agreement. |
| **MAJORITY** | Score ≥ 0.50 | Accept with dissent note. Most atoms agree but some disagree. |
| **CONFLICT** | Score < 0.50 | Flag for Nexus arbitration. Significant disagreement exists. |
| **UNIQUE** | No overlapping results | Keep only if evidence score ≥ 0.70. Novel finding by single squad. |

### Trimmed Mean

For overlapping results scored by 3+ squads, use trimmed mean instead of arithmetic mean:

```
Given scores: [s₁, s₂, s₃, ..., sₙ] sorted ascending
trimmed_mean = mean(s₂, s₃, ..., sₙ₋₁)  // drop lowest and highest
```

This is more resistant to outlier scores than arithmetic mean.

---

## Formula Term Definitions

This section provides detailed operational definitions for each term in the consensus scoring formula shown in Stage 3. Each definition includes how the term is computed across all 4 stages, worked examples with real numbers, edge case handling, and impact analysis.

### Confidence

**Operational Definition**: `confidence` is the geometric mean of individual atom confidence scores propagated through each consensus stage. In **Stage 1**, each worker emits a per-atom `confidence` value (0.0–1.0), computed as roughly the mean of three sub-scores: `evidence_quality`, `task_clarity`, and `output_completeness` (see `confidence_breakdown` in the Result Atom schema). In **Stage 2**, the Squad Lead computes `merged_confidence = (c₁ × c₂ × … × cₙ)^(1/n)` across grouped atoms, with two boosting rules: unanimous agreement multiplies by 1.2 (`min(1.0, conf × 1.2)`), and content-hash deduplication applies `min(1.0, conf × (1 + 0.1 × duplicate_count))`. In **Stage 3**, the Commander applies a trimmed mean across squad-level confidence values (dropping the highest and lowest), then feeds the result into the consensus formula. In **Stage 4**, the Nexus uses median-of-3 judging across reviewer-weighted totals, where confidence is already baked into each bundle's score.

**Input Data**: Worker-emitted `confidence` floats (0.0–1.0), the three `confidence_breakdown` sub-scores, duplicate counts from content-hash deduplication, and the agreement tier (CONSENSUS / MAJORITY / CONFLICT) at each merge stage.

**Computation Example** (Stage 2, 4 workers on one sub-task):

```
Worker confidences: W-01=0.92, W-02=0.85, W-03=0.78, W-04=0.88
Three agree (MAJORITY). Geometric mean of majority atoms:
  geo_mean = (0.92 × 0.85 × 0.88)^(1/3)
           = (0.6882)^(0.3333)
           ≈ 0.883
W-02 and W-04 are content-hash duplicates (duplicate_count=1):
  boosted = min(1.0, 0.883 × (1 + 0.1 × 1))
          = min(1.0, 0.883 × 1.1)
          = min(1.0, 0.971)
          = 0.971
Merged confidence for this sub-task: 0.971
```

**Edge Cases**:
- **0.0**: All workers reported zero confidence. The atom is de-prioritized but not discarded — it still flows to the Commander and may be rescued if cross-review scores are strong.
- **1.0**: Perfect confidence, only reachable via deduplication boosting (e.g., 5 identical atoms). Clamped by `min(1.0, …)` — never exceeds 1.0.
- **Clamping**: Both the 1.2× consensus boost and the deduplication boost use `min(1.0, …)` to enforce the upper bound.

**Impact on Final Score**: Coefficient **0.40** — the single largest weight in the formula. A swing from 0.5 to 1.0 in confidence shifts the final score by +0.20.

---

### Evidence

**Operational Definition**: `evidence` measures the proportion of atoms that cite at least one evidence file. In **Stage 1**, each worker includes an `evidence` array in its Result Atom listing file paths it examined (e.g., `["src/auth.ts", "tests/auth.test.ts"]`). In **Stage 2**, the Squad Lead counts atoms with `len(evidence) ≥ 1` after merging. In **Stage 3**, the Commander aggregates across all squad-level atom-sets: `evidence = (atoms with ≥1 evidence file) / (total atoms)`. Deduplication does not affect the count — merged atoms retain the union of their evidence arrays. In **Stage 4**, evidence is already embedded in the per-bundle score; the Nexus uses it indirectly through the consensus formula output.

**Input Data**: The `evidence` array from each worker's Result Atom (list of file paths or URLs the worker inspected), and the total atom count after Squad Lead deduplication.

**Computation Example** (Stage 3, Commander collecting from 3 Squad Leads):

```
SQ-01 merged atoms: 4 atoms, 3 have evidence → ratio 3/4
SQ-02 merged atoms: 5 atoms, 5 have evidence → ratio 5/5
SQ-03 merged atoms: 3 atoms, 1 has evidence  → ratio 1/3

Commander-level totals:
  atoms_with_evidence = 3 + 5 + 1 = 9
  total_atoms         = 4 + 5 + 3 = 12

  evidence = 9 / 12 = 0.75
```

**Edge Cases**:
- **0.0**: No atom cited any evidence file. This is a strong quality red flag. Combined with the 0.30 coefficient, the score loses up to 0.30 points. A UNIQUE-tier result with evidence 0.0 is automatically discarded (requires evidence ≥ 7/10 to keep).
- **1.0**: Every atom has at least one evidence file — ideal state indicating all results are grounded in source material.
- **Normalization**: The ratio is naturally bounded [0.0, 1.0]. No additional clamping is applied. Empty `evidence` arrays (`[]`) count as zero; `null` or missing fields are treated as empty.

**Impact on Final Score**: Coefficient **0.30** — the second-largest weight. A fully-evidenced result (1.0) vs. zero-evidence (0.0) produces a 0.30-point swing. Evidence also gates UNIQUE-tier acceptance (≥ 7/10 required).

---

### Scope

**Operational Definition**: `scope` measures task completion as the ratio of addressed sub-tasks to assigned sub-tasks. In **Stage 1**, the Nexus decomposes the original mission into sub-tasks, each assigned a unique `brief_id` and distributed to workers. Each worker's Result Atom includes the `brief_id` of the sub-task it addressed. In **Stage 2**, Squad Leads track which `brief_id` values appeared in their collected atoms. In **Stage 3**, the Commander aggregates: `scope = (count of unique brief_ids addressed) / (count of brief_ids assigned to this domain)`. A sub-task is "addressed" if ≥1 atom references it, regardless of quality or consensus tier. In **Stage 4**, scope is embedded in bundle scores.

**Input Data**: The set of assigned `brief_id` values for the domain (from mission decomposition), the `brief_id` field in each worker's Result Atom, and the Commander's domain assignment table.

**Computation Example** (Stage 3, Commander with 12 assigned sub-tasks):

```
Assigned brief_ids: [auth-01, auth-02, ..., auth-12] (12 total)
Atoms collected reference: auth-01, auth-02, auth-03, auth-05, auth-07, auth-08, auth-09, auth-11, auth-12 (9 unique)
Missing: auth-04, auth-06, auth-10 (3 not addressed)

  scope = 9 / 12 = 0.75
```

**Edge Cases**:
- **0.0**: No assigned sub-task was addressed. This is catastrophic — typically means agent spawn failure or total task mismatch. The 0.15 coefficient contributes zero.
- **1.0**: Every assigned sub-task was addressed by ≥1 agent. Ideal state.
- **Undefined (no assignments)**: If a domain receives zero assigned sub-tasks, scope defaults to **1.0** (vacuous truth — no work required, all work done).
- **Over-coverage**: If agents address sub-tasks outside their assignment, these are counted separately as "bonus coverage" but don't inflate scope above 1.0.

**Impact on Final Score**: Coefficient **0.15**. A complete-coverage result (1.0) vs. zero-coverage (0.0) contributes a 0.15-point swing. Combined with `coverage` (also 0.15), the two task-completion metrics together contribute 0.30 to the score.

---

### Coverage

**Operational Definition**: `coverage` measures breadth of investigation as the ratio of addressed aspects to identified aspects. An "aspect" is a facet of the problem space (e.g., "error handling", "performance", "security", "backwards compatibility") identified during mission decomposition or discovered by agents during execution. In **Stage 1**, workers may tag their atoms with `aspect_tags` (e.g., `["security", "performance"]`). In **Stage 2**, Squad Leads aggregate aspect tags. In **Stage 3**, the Commander counts: `coverage = (unique aspects referenced in ≥1 atom) / (total aspects identified for this domain)`. An aspect is "addressed" if ≥1 atom substantively discusses it (≥50 words or includes evidence files tagged with that aspect). In **Stage 4**, coverage is embedded in bundle scores.

**Input Data**: The master list of aspects for the domain (from decomposition + agent discovery), the `aspect_tags` array in each Result Atom, and the Commander's aspect tracking table.

**Computation Example** (Stage 3, Commander with 15 identified aspects):

```
Identified aspects: [security, performance, error-handling, logging, testing, 
                     documentation, backwards-compat, migration, data-validation,
                     API-design, UI-impact, monitoring, rollout, cost, legal]
                     (15 total)

Atoms collected reference: security (8 atoms), performance (5), error-handling (6),
                          testing (9), documentation (4), backwards-compat (3),
                          migration (2), monitoring (1), rollout (2)
                          (9 unique aspects substantively addressed)

Missing: logging, data-validation, API-design, UI-impact, cost, legal (6 not covered)

  coverage = 9 / 15 = 0.60
```

**Edge Cases**:
- **0.0**: No identified aspect was addressed. This indicates agents completely missed the problem space. The 0.15 coefficient contributes zero.
- **1.0**: Every identified aspect was addressed. Ideal breadth.
- **Undefined (no aspects)**: If zero aspects are identified, coverage defaults to **1.0** (no dimensions to cover).
- **Shallow coverage**: An aspect counts as "addressed" only if discussed substantively (≥50 words) or backed by evidence. A one-sentence mention doesn't count.
- **Aspect discovery**: If agents discover NEW aspects not in the original list, these are added to the denominator mid-flight, which can lower coverage scores.

**Impact on Final Score**: Coefficient **0.15**. Full coverage (1.0) vs. zero coverage (0.0) contributes a 0.15-point swing. `coverage` rewards breadth, while `scope` rewards depth (completing assigned tasks).

---

### Conflict Rate

**Operational Definition**: `conflict_rate` quantifies unresolved disagreement as a fraction of total atoms. In **Stage 2**, the Squad Lead classifies each sub-task group into CONSENSUS, MAJORITY, or CONFLICT. Atoms in the CONFLICT tier (no majority agreement) are tagged with a conflict flag and forwarded unresolved. In **Stage 3**, the Commander counts atoms still carrying the CONFLICT flag after its own trimmed-mean resolution attempt: `conflict_rate = unresolved_conflicts / total_atoms`. Unlike the positive terms, conflict_rate is applied as a **penalty**: `−min(0.30, conflict_rate × 0.30)`. In **Stage 4**, CONFLICT-tier items are escalated to the Nexus for final arbitration, which may re-dispatch to a single reviewer for tiebreaking.

**Input Data**: The CONFLICT flag set during Stage 2 local merge, the count of atoms that remain unresolved after Commander merge, and the total atom count in the Commander's domain.

**Computation Example** (Stage 3, Commander with 15 atoms):

```
Total atoms across all squads: 15
Resolved at Squad Lead level (CONSENSUS or MAJORITY): 12
Forwarded as CONFLICT: 3
Commander resolves 1 via trimmed mean, 2 remain unresolved.

  conflict_rate = 2 / 15 = 0.133

Penalty = min(0.30, 0.133 × 0.30)
        = min(0.30, 0.0399)
        = 0.0133

Score impact: −0.0133 (subtracted from the positive terms)
```

**Edge Cases**:
- **0.0**: Zero unresolved conflicts — all atoms reached CONSENSUS or MAJORITY. No penalty applied. This is the ideal state.
- **1.0**: Every atom is unresolved (catastrophic disagreement). The penalty is capped: `min(0.30, 1.0 × 0.30) = 0.30`. Even total conflict only subtracts 0.30 from the score.
- **Cap behavior**: The `min(0.30, …)` cap is critical — it prevents a single domain's conflict from dominating the final score. Even with `conflict_rate = 1.0`, the maximum penalty is 0.30 points.

**Impact on Final Score**: Penalty capped at **−0.30**. The penalty scales linearly (`conflict_rate × 0.30`) up to the cap. In practice, a conflict_rate above 0.50 (penalty = 0.15) triggers CONFLICT-tier classification (score < 0.50), which escalates the bundle to Nexus arbitration rather than auto-acceptance.

---

### Complete Formula Example

**Scenario**: Commander CMD-ARCH processing "Refactor authentication module to use JWT tokens"

**Input Data**:
- 10 atoms collected from Squad Leads
- Worker confidence scores: [0.92, 0.88, 0.85, 0.91, 0.78, 0.86, 0.89, 0.77, 0.83, 0.90]
- Evidence files: 6 atoms have ≥1 evidence file, 4 atoms have none
- Assigned sub-tasks: 12 (`auth-01` through `auth-12`)
- Sub-tasks addressed: 9 (`auth-04`, `auth-06`, `auth-10` not covered)
- Identified aspects: 15 (security, performance, error-handling, etc.)
- Aspects addressed: 13 (logging and cost not covered)
- Conflicts: 2 atoms flagged CONFLICT, 8 atoms CONSENSUS/MAJORITY

**Step 1: Compute confidence (geometric mean)**

```
confidence = (0.92 × 0.88 × 0.85 × 0.91 × 0.78 × 0.86 × 0.89 × 0.77 × 0.83 × 0.90)^(1/10)
           = (0.2749)^0.10
           ≈ 0.8775
```

**Step 2: Compute evidence**

```
evidence = (atoms with ≥1 evidence file) / (total atoms)
         = 6 / 10
         = 0.60
```

**Step 3: Compute scope**

```
scope = (addressed sub-tasks) / (assigned sub-tasks)
      = 9 / 12
      = 0.75
```

**Step 4: Compute coverage**

```
coverage = (aspects addressed) / (aspects identified)
         = 13 / 15
         ≈ 0.8667
```

**Step 5: Compute conflict penalty**

```
conflict_rate = (unresolved conflicts) / (total atoms)
              = 2 / 10
              = 0.20

penalty = min(0.30, conflict_rate × 0.30)
        = min(0.30, 0.20 × 0.30)
        = min(0.30, 0.06)
        = 0.02
```

**Step 6: Apply formula**

```
score = 0.40 × confidence + 0.30 × evidence + 0.15 × scope + 0.15 × coverage − penalty
      = 0.40 × 0.8775 + 0.30 × 0.60 + 0.15 × 0.75 + 0.15 × 0.8667 − 0.02
      = 0.3510 + 0.18 + 0.1125 + 0.1300 − 0.02
      = 0.7535
```

**Step 7: Classify tier**

```
score = 0.7535 ≥ 0.70 → CONSENSUS tier
```

**Result**: CMD-ARCH bundle is **auto-accepted** with high confidence (0.75 score, CONSENSUS tier).

**Sensitivity Analysis** (what would improve the score most):
- Raising evidence from 0.60 to 1.0 → +0.12 points (biggest single lever)
- Raising confidence from 0.88 to 1.0 → +0.049 points
- Eliminating conflicts (penalty 0.02 → 0) → +0.02 points
- Raising scope from 0.75 to 1.0 → +0.0375 points

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
  7. Check Shadow Score (sealed criteria, Shadow Score Spec L2):
     - If Shadow Score ≤ 15% (Minor): proceed normally
     - If Shadow Score 16-30% (Moderate): attach Gap Report as warning
     - If Shadow Score 31-50% (Significant): quarantine bundle, re-review
     - If Shadow Score > 50% (Critical): reject bundle from synthesis
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

Consider a task "Refactor authentication module" being processed by SS-100 (89 agents):

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
- Shadow Score (sealed criteria) confirms no critical failures
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
