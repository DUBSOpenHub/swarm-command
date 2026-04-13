# Shadow Scoring

Swarm Command implements **[Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec) L2 conformance** for independent quality validation of commander outputs. Instead of the spec's sealed *code tests*, Swarm Command generates sealed *acceptance criteria* — task-specific assertions that commander outputs must satisfy, generated before commanders execute and validated after they complete.

---

## Why Shadow Scoring Exists

During the SwarmSpeed 250 self-analysis test run (Havoc Hackathon #48), 3 sealed judges gave scores of 44-46/50 to a document containing **critical arithmetic errors**. The judges evaluated *design quality* but never tested *internal consistency*. Shadow scoring closes this blind spot using the sealed-envelope approach: criteria generated before work begins, hidden from all agents, revealed only at validation time.

The core insight: **What you measure, agents optimize for. What you don't measure, they ignore.** Shadow scoring measures what you don't tell them about.

---

## Shadow Score Spec Conformance

| Level | Requirement | Swarm Command |
|---|---|---|
| **L1** | Compute + report Shadow Score | ✅ Implemented |
| **L2** | L1 + sealed-envelope isolation + commitment hash | ✅ Implemented |
| L3 | L2 + hardening loop + velocity tracking | Partial (hardening loop ✅, velocity tracking not yet) |

**Swarm Command implements Shadow Score Spec L2 conformance.**

---

## The Formula

```
Shadow Score = (sealed_failures / sealed_total) × 100
```

A Shadow Score of 0% means all sealed criteria passed. Higher scores indicate more failures.

### Interpretation Scale

| Shadow Score | Level | Emoji | Meaning |
|---|---|---|---|
| 0% | Perfect | ✅ | All sealed criteria passed |
| 1–15% | Minor | 🟢 | Acceptable — minor gaps only |
| 16–30% | Moderate | 🟡 | Notable gaps — review recommended |
| 31–50% | Significant | 🟠 | Serious gaps — hardening required |
| > 50% | Critical | 🔴 | Fundamental failures — re-work needed |

---

## Sealed-Envelope Protocol (4 Phases)

The Shadow Score Spec defines a 4-phase sealed-envelope protocol. Here's how Swarm Command implements each phase within its swarm execution pipeline:

### Phase 1: SEAL GENERATION (Swarm Command Phase 1.5)

**When:** After task decomposition (Phase 1), before commanders execute (Phase 3).

The Nexus generates sealed acceptance criteria from the task specification:

1. Analyze the task decomposition and generate 10 binary pass/fail acceptance criteria
2. Distribute criteria across 4 categories: `happy_path`, `edge_case`, `error_handling`, `completeness`
3. Compute a SHA-256 commitment hash of the sealed criteria
4. Store the sealed envelope in Nexus memory — **never shared with any agent**

```json
{
  "sealed_envelope": {
    "generated_at": "2025-01-15T10:30:00Z",
    "task_hash": "sha256:b7e2...",
    "sealed_hash": "sha256:a3f2...",
    "criteria_count": 10,
    "criteria": [
      {
        "id": "sc-01",
        "category": "happy_path",
        "assertion": "Architecture section defines module boundaries for all 5 domains",
        "expected": "Each domain has a clearly defined module boundary"
      },
      {
        "id": "sc-02",
        "category": "edge_case",
        "assertion": "Implementation handles empty input gracefully",
        "expected": "Empty input produces a structured error, not a crash"
      }
    ]
  }
}
```

### Phase 2: IMPLEMENTATION (Swarm Command Phases 2–5)

Commanders, Squad Leads, Workers, and Reviewers execute normally. **They never see the sealed criteria.** The sealed envelope remains locked in Nexus memory throughout the entire execution pipeline.

### Phase 3: VALIDATION (Swarm Command Phase 6)

After commanders complete and cross-review finishes:

1. **Verify commitment hash** — Confirm the sealed criteria haven't drifted since Phase 1.5
2. **Run each sealed criterion** against each Commander bundle as a binary pass/fail
3. **Compute Shadow Score:** `(failures / total) × 100`
4. **Classify** using the interpretation scale
5. **Produce a Gap Report** for each bundle

### HARDENING (Swarm Command Phase 6, continued)

If Shadow Score > 15% for any bundle:

1. Share **only failure messages** with the affected Commander — never the criteria themselves
2. Commander gets 1 fix cycle to address the failures
3. Re-validate and re-compute Shadow Score
4. Record pre-hardening and post-hardening scores

**What commanders receive during hardening:**
```
SHADOW HARDENING — Fix these issues:
- [sc-07] Edge case for empty input not addressed
- [sc-09] Error response format missing HTTP status codes
```

**What commanders do NOT receive:** criteria list, scoring formula, pass/fail breakdown, or any mention of the sealed-envelope protocol.

---

## Protocol Flow Within Swarm Phases

```
Phase 0   Mission Intake
Phase 1   Task Decomposition (5 domains)
              │
Phase 1.5 ◄── SEAL GENERATION ──► Sealed criteria locked, hash recorded
              │
Phase 2   Context Capsule Construction
Phase 3   Commander Deployment (commanders never see criteria)
Phase 4   Execution & Monitoring
Phase 5   Cross-Review
              │
Phase 6   ◄── VALIDATION ──► Unseal, validate, compute Shadow Score
              │
          ◄── HARDENING ──► If score > 15%, share failure messages, one fix cycle
              │
Phase 7   Consensus Synthesis (Shadow Gate uses Shadow Score)
Phase 8   Final Output (Gap Report included)
```

---

## Gap Report Format

Each bundle receives a Gap Report in the Shadow Score Spec standard format:

```json
{
  "shadow_score_spec_version": "1.0.0",
  "report": {
    "shadow_score": 20.0,
    "level": "moderate",
    "sealed_hash": "sha256:a3f2..."
  },
  "sealed_tests": {
    "total": 10,
    "passed": 8,
    "failed": 2
  },
  "failures": [
    {
      "test_name": "sc-07",
      "category": "edge_case",
      "expected": "Output handles empty input gracefully",
      "actual": "No empty input handling found in IMPL bundle",
      "message": "Edge case for empty input not addressed"
    },
    {
      "test_name": "sc-09",
      "category": "error_handling",
      "expected": "Error responses include HTTP status codes",
      "actual": "Error format uses string messages without status codes",
      "message": "Error response format missing HTTP status codes"
    }
  ]
}
```

---

## Shadow Score Integration with Consensus

Shadow Scores act as a **quality gate** in the consensus pipeline (Phase 7, Stage 3):

| Shadow Score | Action |
|---|---|
| 0% (Perfect) or 1–15% (Minor) | Bundle proceeds normally through consensus |
| 16–30% (Moderate) | Gap Report attached to bundle, warning in output |
| 31–50% (Significant) | Bundle QUARANTINED — Nexus re-reviews with failure messages |
| > 50% (Critical) | Bundle REJECTED from synthesis |

---

## Adaptation: Acceptance Criteria vs. Code Tests

The Shadow Score Spec is designed for code-producing agents where sealed tests are executable test files. Swarm Command adapts this for general-purpose AI orchestration:

| Spec Concept | Swarm Command Adaptation |
|---|---|
| Sealed code tests | Sealed acceptance criteria (natural-language assertions) |
| Test runner execution | Nexus evaluates criteria against bundle content |
| Test pass/fail | Binary assertion pass/fail |
| Test suite | Criteria set across 4 categories |
| CI environment | Nexus memory (sealed, commitment-hashed) |

The math is identical: `(failures / total) × 100`. The isolation is identical: agents never see criteria. The hardening is identical: only failure messages shared. The adaptation is in *what* gets tested — acceptance criteria instead of code assertions.

---

## Configuration

Shadow scoring is configured in `config.yml`:

```yaml
shadow_scoring:
  enabled: true
  spec_version: "1.0.0"
  conformance_level: "L2"
  sealed_criteria_count: 10  # max; per-scale: SS-50=6, SS-100=8, SS-250=10
  hardening:
    enabled: true  # SS-50 overrides to disabled
    max_cycles: 1
    threshold: 15
  categories:
    - happy_path
    - edge_case
    - error_handling
    - completeness
```

Set `enabled: false` to disable shadow scoring entirely (e.g., for cost-sensitive SS-50 deployments).

---

## Scale-Specific Behavior

| Scale | Sealed Criteria | Hardening | Notes |
|---|---|---|---|
| **SS-50** | 6 (reduced) | Disabled | Shadow Score computed but no fix cycle |
| **SS-100** | 8 | 1 cycle if > 15% | Moderate hardening |
| **SS-250** | 10 (full) | 1 cycle if > 15% | Full hardening |

---

## Transparency Note — What the Hash Does and Doesn't Provide

The SHA-256 commitment hash in the sealed-envelope protocol serves as a **self-discipline mechanism**, not a cryptographic security boundary.

### What it provides

- **Commitment device:** The Nexus commits to specific acceptance criteria *before* commanders execute, preventing unconscious criteria drift during validation.
- **Drift detection:** If the criteria are accidentally modified between Phase 1.5 (generation) and Phase 6 (validation), the hash mismatch surfaces the error immediately.
- **Audit trail:** The recorded hash creates a verifiable record that criteria were locked before execution began.

### What it does NOT provide

- **Cross-domain tamper resistance:** The Nexus generates the criteria, holds them in its own context, computes the hash, and validates against it — all within the same LLM session. There is no separate trust domain, so the hash provides zero protection against an adversarial or compromised Nexus.
- **Cryptographic security guarantees:** In a traditional sealed-envelope protocol, the seal is held by an independent party. Here, the same agent is both sealer and validator. The "sealed envelope" is a useful metaphor for the *workflow pattern*, not a literal security boundary.

### Why we keep it

Even without cross-domain guarantees, the commitment hash is valuable. It enforces a strict temporal separation between criteria generation and criteria evaluation. Without it, the Nexus could unconsciously shift its acceptance bar after seeing commander outputs — a subtle form of confirmation bias. The hash makes that impossible by turning any drift into an explicit, detectable mismatch.
