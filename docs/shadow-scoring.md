# Shadow Scoring

Shadow scoring is an independent quality audit layer that runs parallel to the main consensus pipeline. It uses **hidden criteria that agents never see**, preventing Goodhart's Law — when agents optimize for visible metrics at the expense of actual quality.

---

## Why Shadow Scoring Exists

During the SwarmSpeed 250 self-analysis test run (Havoc Hackathon #48), 3 sealed judges gave scores of 44-46/50 to a document containing **critical arithmetic errors**. The judges evaluated *design quality* but never tested *internal consistency*. Shadow scoring closes this blind spot.

The core insight: **What you measure, agents optimize for. What you don't measure, they ignore.** Shadow scoring measures what you don't tell them about.

---

## Shadow Criteria (Hidden from Workers)

These criteria are NEVER shown to workers, reviewers, or commanders. Only Shadow Validators see them.

| Criterion ID | Name | What It Checks | Weight |
|---|---|---|---|
| `shd-01` | `mathematical_soundness` | All formulas are computable. Coefficients are normalized (sum to expected values). Arithmetic is correct. No division by zero. Bounds are respected. | 0.30 |
| `shd-02` | `internal_consistency` | Claims in section X match claims in section Y. No contradictions across the output. Cross-references resolve correctly. Terminology is used consistently. | 0.25 |
| `shd-03` | `executability` | Outputs can be parsed by a machine. Templates can be copy-pasted and run. JSON schemas validate against draft-07. Code snippets compile/run. | 0.25 |
| `shd-04` | `constraint_adherence` | Output doesn't violate any rules defined in the system. Depth guard laws are respected. Token caps are not exceeded. Agent type restrictions are followed. | 0.20 |

**Total weight: 1.00**

---

## Shadow Validator Deployment

Shadow validators are launched by the Nexus in parallel with Cross-Reviewers:

### Configuration

| Setting | Value |
|---|---|
| Number of validators | 3 (configurable in `config.yml`) |
| Agent type | `explore` (leaf node, can't spawn) |
| Models | Different from main pipeline (e.g., if main uses Sonnet, shadow uses GPT or vice versa) |
| Context budget | 16K tokens |
| `can_launch` | `false` |
| Timeout | 45 seconds |

### What Shadow Validators Receive

Each shadow validator receives:
- The **full output** of a Commander bundle (not compressed)
- The scoring rubric (the 4 hidden criteria above)
- Instructions to verify, not create

### What Shadow Validators Do NOT Receive

- Main reviewer scores (sealed envelope — shadow must be independent)
- Worker self-scores
- Consensus tier classifications
- Any indication of which model produced the output

### Shadow Validator Prompt Pattern

```
Score this output for correctness and consistency.

1. Check ALL arithmetic. Verify all formulas are computable. Confirm coefficients normalize correctly.
2. Check ALL cross-references. Verify claims in one section match claims in other sections.
3. Try to parse ALL structured outputs. Verify JSON schemas validate. Test templates.
4. Verify ALL rules and constraints are followed. Check depth limits, token caps, agent types.

Score each criterion 0.0 to 1.0. Provide evidence for any score below 0.6.
```

---

## Shadow Score Calculation

For each bundle, the shadow score is:

```
shadow_score = 0.30 × mathematical_soundness
             + 0.25 × internal_consistency
             + 0.25 × executability
             + 0.20 × constraint_adherence
```

With 3 validators, use the **median** shadow score (not mean) — same median-of-3 principle as main consensus.

---

## Divergence Detection

After both main reviewers and shadow validators complete, compute divergence:

```
divergence = |main_consensus_score − shadow_median_score|
```

### Alert Thresholds

| Divergence | Level | Alert | Action |
|---|---|---|---|
| ≤ 0.15 | Normal | None | Main consensus proceeds normally |
| 0.15 – 0.30 | Warning | `SHADOW DIVERGENCE — main scoring may be miscalibrated` | Escalate to Nexus for manual review. Attach shadow findings. |
| > 0.30 | Critical | `CRITICAL SHADOW DIVERGENCE — high confidence with low quality` | **HALT consensus**. Re-review bundle with shadow findings attached. |

### Critical Divergence Pattern

The most dangerous pattern is **high main score + low shadow score**:

```
if shadow_score < 0.5 AND main_score > 0.8:
    alert: "CRITICAL SHADOW DIVERGENCE — high confidence with low quality"
    action: HALT consensus for this bundle
    action: Re-review with shadow findings attached
    action: Nexus arbitrates with full evidence
```

This catches "looks good but is wrong" outputs — the most dangerous category of AI error.

---

## Shadow Score Integration

Shadow scores do NOT replace main consensus scores. They act as a **circuit breaker**:

### Integration Rules

| Shadow Result | Action |
|---|---|
| All criteria ≥ 0.6 | Main consensus proceeds normally. Shadow passes. |
| Any criterion 0.3–0.6 | Findings attached to bundle as `shadow_flags[]`. Warning level. Bundle proceeds with flags visible to Nexus. |
| Any criterion < 0.3 | Bundle is **QUARANTINED**. Removed from main consensus. Re-reviewed with shadow evidence. Nexus decides whether to include. |

### Shadow Flags

When shadow scoring identifies issues, they are attached as structured flags:

```json
{
  "shadow_flags": [
    {
      "criterion": "mathematical_soundness",
      "score": 0.4,
      "evidence": "Consensus formula coefficients sum to 1.15, not 1.0",
      "severity": "warning"
    },
    {
      "criterion": "internal_consistency",
      "score": 0.2,
      "evidence": "Section 3 claims max_depth=3, Section 9 claims max_depth=2",
      "severity": "critical"
    }
  ]
}
```

---

## What Shadow Scoring Catches vs. Main Scoring

| Bug Type | Main Scoring | Shadow Scoring |
|---|---|---|
| "Looks good but math is wrong" | ❌ Misses | ✅ `mathematical_soundness` |
| "§1 says X, §9 says Y" | ❌ Misses | ✅ `internal_consistency` |
| "Template has syntax error" | ❌ Misses | ✅ `executability` |
| "SS-1000 violates Law 4" | ❌ Misses | ✅ `constraint_adherence` |
| "Design is inelegant" | ✅ Catches | ❌ Not its job |
| "Missing a deliverable" | ✅ Catches | ⚠️ Partial (completeness) |
| "Output is unclear" | ✅ Catches (clarity axis) | ❌ Not its job |
| "Contradicts external spec" | ❌ Misses (no external context) | ❌ Misses (no external context) |

### Key Insight

Main scoring excels at **design quality** (is this good?). Shadow scoring excels at **internal correctness** (is this right?). Together they cover both dimensions. Neither alone is sufficient.

---

## Deployment Recommendations

### For SS-50 (Starter)
- Shadow scoring: **disabled** (not enough agents to justify overhead)
- Alternative: Manual spot-check of results

### For SS-100 (Standard)
- Shadow validators: **2** (one per bundle pair)
- Use different model family from commanders
- Divergence alert threshold: 0.20 (more lenient for smaller swarm)

### For SS-250 (Full)
- Shadow validators: **3** (median-of-3 for robust scoring)
- Use different model family from commanders AND reviewers
- Divergence alert threshold: 0.15
- Critical divergence threshold: 0.30

### For SS-1000 (Enterprise)
- Shadow validators: **6** (one per 2 commanders)
- Add a **Meta-Shadow** layer that reviews shadow validator consistency
- Divergence alert threshold: 0.10 (stricter for large deployments)
- Critical divergence threshold: 0.25

---

## Configuration

Shadow scoring is configured in `config.yml`:

```yaml
shadow_scoring:
  enabled: true
  validators: 3
  criteria:
    - id: "shd-01"
      name: "mathematical_soundness"
      weight: 0.30
    - id: "shd-02"
      name: "internal_consistency"
      weight: 0.25
    - id: "shd-03"
      name: "executability"
      weight: 0.25
    - id: "shd-04"
      name: "constraint_adherence"
      weight: 0.20
  divergence_alert_threshold: 0.15
  critical_divergence_threshold: 0.30
```

Set `enabled: false` to disable shadow scoring entirely (e.g., for cost-sensitive SS-50 deployments).
