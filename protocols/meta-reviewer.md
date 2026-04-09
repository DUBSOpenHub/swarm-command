# Meta-Reviewer Protocol

The Meta-Reviewer is a Nexus-internal quality gate that evaluates the reviewers themselves. It runs after Phase 5 (Cross-Review) and before Phase 7 (Consensus Synthesis). Its purpose: detect reviewer drift, inflation bias, adversarial depth failures, and inter-reviewer inconsistency before those scores corrupt the consensus pipeline.

> **This is Nexus-internal.** No separate meta-reviewer agent is spawned. The Nexus evaluates reviewer outputs directly using this protocol.

---

## Why Meta-Review Exists

Cross-reviewers can fail in subtle ways that look like normal output:

| Failure Mode | Symptom | Impact on Consensus |
|---|---|---|
| **Score inflation** | All reviewers score 8+, even weak bundles | Weak bundles pass consensus gate |
| **Score deflation** | All reviewers score ≤5, even strong bundles | Good work quarantined |
| **Adversarial shallowness** | Adversarial axis always scores 7-9, no findings reported | Flaws pass undetected |
| **Reviewer drift** | Two reviewers of the same bundle pair differ by >3 on same axis | Consensus tier unreliable |
| **Rubber-stamping** | Reviewer scores match confidence from bundle exactly | Reviewer not adding value |
| **Empty adversarial findings** | `adversarial_findings` is empty despite low adversarial score | Invalid self-contradiction |

---

## Meta-Review Algorithm

Run after all reviewer outputs are collected (end of Phase 5):

### Step 1 — Inter-Reviewer Reliability (IRR)

For each bundle that was scored by multiple reviewers:

```
For each scoring axis A:
  scores_A = [reviewer_1.scores.bundle_X.A, reviewer_2.scores.bundle_X.A, ...]
  range_A = max(scores_A) - min(scores_A)
  IRR_A = 1 - (range_A / 10)
```

**IRR Alert Thresholds:**

| IRR Score | Level | Action |
|---|---|---|
| ≥ 0.80 | Good | Proceed normally |
| 0.60 – 0.79 | Marginal | Attach IRR warning to bundle, Nexus notes discrepancy |
| < 0.60 | Poor | Flag bundle for Nexus arbitration — reviewer scores too inconsistent to trust |

### Step 2 — Adversarial Depth Check

For each reviewer output, check:

1. Is `adversarial` score < 7 AND `adversarial_findings` is empty?
   → **Invalid** — score cannot be low without reported findings. Force `adversarial = 5` and log the correction.

2. Is `adversarial` score ≥ 8 AND `adversarial_findings` is empty?
   → **Shallow review** — reviewer claims thorough adversarial check but found nothing AND reported nothing. Flag as `adversarial_depth: "surface"`.

3. Are `adversarial_findings` non-empty and substantive?
   → Mark `adversarial_depth: "deep"` — findings are real, reviewer did the work.

### Step 3 — Score Distribution Analysis

Compute distribution statistics across all reviewer weighted_total scores:

```
mean_score = mean(all weighted_totals)
std_dev = standard_deviation(all weighted_totals)
```

| Condition | Flag | Action |
|---|---|---|
| `mean_score > 8.5` | Score inflation likely | Apply 0.9× deflation multiplier to all weighted totals |
| `mean_score < 3.5` | Score deflation likely | Apply 1.1× inflation multiplier to all weighted totals |
| `std_dev < 0.5` | Herding detected | Reviewers converged — may indicate groupthink; add 0.05 uncertainty to confidence |
| `std_dev > 3.5` | Wild variance | Reviewers deeply disagree; escalate all MAJORITY-tier to CONFLICT |

### Step 4 — Rubber-Stamp Detection

For each reviewer, compare their weighted_total to the bundle's own `confidence` field:

```
delta = abs(reviewer.weighted_total/10 - bundle.confidence)
```

If `delta < 0.05` for 3+ reviewers of the same bundle → **rubber-stamp suspected**.
Action: Nexus re-scores the bundle using shadow scoring criteria only, ignoring reviewer scores.

---

## Meta-Review Output

The Nexus records meta-review results in its internal state (never exposed to reviewers):

```json
{
  "meta_review": {
    "irr_by_bundle": {
      "<bundle_id>": {
        "irr_score": <0.0-1.0>,
        "irr_level": "good | marginal | poor",
        "axis_ranges": {
          "correctness": <range>,
          "completeness": <range>,
          "consistency": <range>,
          "clarity": <range>,
          "adversarial": <range>
        }
      }
    },
    "adversarial_depth_by_reviewer": {
      "<reviewer_id>": "surface | moderate | deep"
    },
    "score_distribution": {
      "mean": <float>,
      "std_dev": <float>,
      "inflation_flag": <boolean>,
      "deflation_flag": <boolean>,
      "herding_flag": <boolean>
    },
    "rubber_stamp_suspects": ["<bundle_id>"],
    "corrections_applied": [
      {
        "type": "adversarial_score_forced | deflation_multiplier | inflation_multiplier | consensus_escalation",
        "reviewer_id": "<reviewer_id>",
        "bundle_id": "<bundle_id>",
        "original_value": <any>,
        "corrected_value": <any>,
        "reason": "<one sentence>"
      }
    ]
  }
}
```

---

## Integration with Phase 7 — Consensus Synthesis

After meta-review corrections are applied, Phase 7 uses the **corrected** reviewer scores, not the raw scores. The corrections are transparent in the Final Report under `meta_review_corrections`.

### Meta-Review Quality Gate

Before proceeding to Phase 7, check:

| Condition | Action |
|---|---|
| ≥ 3 bundles have IRR < 0.60 | Nexus re-dispatches 2 tiebreaker reviewers for those bundles |
| ≥ 2 reviewers flagged as rubber-stamps | Those reviewer scores are excluded from consensus |
| Score inflation corrected by >10% | Log in Final Report under "Quality Flags" |
| All adversarial findings are empty | Add "Shadow Gap: adversarial review not performed" to Final Report |

---

## Configuration

Meta-review is controlled in `config.yml`:

```yaml
meta_review:
  enabled: true
  irr_alert_threshold: 0.60
  inflation_detection_threshold: 8.5
  deflation_detection_threshold: 3.5
  herding_std_dev_threshold: 0.5
  rubber_stamp_delta_threshold: 0.05
  rubber_stamp_min_reviewers: 3
```

Set `enabled: false` to skip meta-review (not recommended for SS-250).

---

## Anti-Patterns This Protocol Prevents

| # | Anti-Pattern | Detection Method |
|---|---|---|
| 1 | **Reviewer collusion / herding** | IRR std_dev < 0.5 |
| 2 | **Adversarial axis as rubber stamp** | Empty findings + high score |
| 3 | **Score mirroring from bundle confidence** | Rubber-stamp delta < 0.05 |
| 4 | **Systematic optimism bias** | Mean score > 8.5 |
| 5 | **Systematic pessimism bias** | Mean score < 3.5 |
| 6 | **IRR collapse on hard bundles** | Per-bundle IRR < 0.60 |
