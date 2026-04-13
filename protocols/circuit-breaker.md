# Circuit Breaker Protocol

The Circuit Breaker is a three-state finite state machine (FSM) that prevents cascading failures in the swarm. When too many agents fail at any layer, the circuit breaker trips and halts further spawning, preventing resource waste and cost overruns.

---

## Three-State FSM

```
                    failure_count >= threshold
         ┌─────────────────────────────────────────┐
         │                                         ▼
    ┌─────────┐                              ┌──────────┐
    │ CLOSED  │◄────── probe succeeds ───────│   OPEN   │
    │ (normal)│                              │  (halt)  │
    └─────────┘                              └────┬─────┘
         ▲                                        │
         │            cooldown expires            │
         │                                        ▼
         │                                  ┌───────────┐
         └────────── probe succeeds ────────│ HALF-OPEN │
                                            │  (probe)  │
                                            └───────────┘
                     probe fails ──────────► back to OPEN
```

### State Definitions

| State | Description | Behavior |
|---|---|---|
| **CLOSED** | Normal operation | All spawning allowed. Failure counter incrementing. |
| **OPEN** | Halt — too many failures | No new agents spawned. Cooldown timer running. Existing agents continue. Auto-recovery strategy selected. |
| **HALF-OPEN** | Probing — testing recovery | One probe agent dispatched using selected recovery strategy. If it succeeds → CLOSED. If it fails → escalate strategy, back to OPEN. |

---

## Auto-Recovery Strategy Matrix

When a circuit breaker trips to OPEN, select a recovery strategy based on the **failure signature** — do NOT default to simple retry:

| Failure Signature | Recovery Strategy | Implementation |
|---|---|---|
| `failure_class: "rate_limited"` on any agent | **Wave Throttle** — extend inter-wave delay and reduce wave size | Increase delay to 8s, reduce next wave size by 50%, switch to lighter models |
| `status: "timeout"` on ≥50% of agents | **Model Downgrade** — switch to a faster/lighter model | Replace `claude-opus` → `claude-haiku-4.5`; replace `gpt-5.4` → `gpt-5.4-mini` |
| `status: "failed"` with unparseable output | **Prompt Simplification** — reduce instruction complexity | Strip context to bare minimum; replace compound instructions with single atomic tasks |
| `status: "failed"` with out-of-scope errors | **Scope Reduction** — narrow file scope | Remove all but the 2 most critical files from file_scope; mark removed scope as `skipped` |
| Mixed failures (timeout + failed + partial) | **Task Splitting** — decompose further | Split failing task into 2 smaller tasks; spawn each as a fresh canary |
| All failures are `status: "partial"` | **Confidence Floor Lift** — accept partials | Lower acceptance threshold to `confidence ≥ 0.2`; proceed with partial atoms |

The recovery strategy is embedded in the probe agent's context shard as `recovery_mode: "<strategy>"`.

### Recovery Probe Design

The HALF-OPEN probe MUST:
1. Use a **different model** than the failed agents (at minimum — see matrix above for full strategy)
2. Include `recovery_mode` in its context shard
3. Have a **40% shorter timeout** than the original agents (prevents probe from consuming the full cooldown window)
4. Report both task result AND `recovery_diagnostics` in its output

```json
{
  "recovery_diagnostics": {
    "recovery_mode": "model_downgrade | prompt_simplification | scope_reduction | task_splitting | confidence_floor_lift",
    "original_failure_count": <integer>,
    "original_failure_types": ["timeout", "failed", "partial"],
    "probe_model": "<model used in probe>",
    "probe_timeout_s": <integer>
  }
}
```

---

## Circuit Breaker Per Layer

| Layer | Agents | Threshold to OPEN | Cooldown | Probe Size |
|---|---|---|---|---|
| **Nexus (L0)** | Monitors 5 Commanders | 3/5 commanders fail (60%) | 10s | 1 commander re-dispatch |
| **Commander (L1)** | Monitors 10 Squad Leads | 5/10 squad leads fail (50%) | 5s | 1 squad lead re-dispatch |
| **Squad Lead (L2)** | Monitors 5 Workers | 3/5 workers fail (50%) | 3s | 1 canary worker |
| **Reviewer (L4)** | Monitors review mesh | 3/5 reviews fail (50%) | 5s | 1 review re-dispatch |

### Failure Definitions

An agent is considered "failed" when:
- It returns `status: "failed"` in its JSON output
- It returns `status: "timeout"` (exceeded its timeout from the cascade)
- It returns unparseable output (not valid JSON)
- It does not respond within its allocated timeout
- Its output violates the expected schema

An agent is considered "partially failed" when:
- It returns `status: "partial"` — counts as 0.5 failure for threshold calculation

---

## Five-Level Recovery Escalation

When a circuit breaker trips (enters OPEN state), escalate through these levels in order:

| Level | Action | Trigger | Recovery Strategy |
|---|---|---|---|
| **L1: Retry** | Re-send same prompt to same model | First failure of an agent | Wait 2s, retry identical prompt |
| **L2: Simplify** | Reduce task complexity | Retry failed | Split the task in half, retry each half independently |
| **L3: Model Swap** | Switch to a different model | Simplify failed | `haiku → sonnet`, `gpt-5.4-mini → gpt-5.4`, upgrade to a more capable model from the commander pool |
| **L4: Scope Reduce** | Narrow file scope or skip sub-task | Model swap failed | Mark sub-task as "best-effort", reduce scope to core files only |
| **L5: Graceful Degrade** | Return partial results with explicit gaps | Scope reduce failed | Emit `status: partial` with a detailed gap report |

### Escalation Flow

```
Agent fails
    │
    ▼
L1: Retry (same prompt, same model, 2s wait)
    │ ── success ──► resume normal
    │ ── fail ──────┐
    ▼               │
L2: Simplify (split task, retry halves)
    │ ── success ──► resume normal
    │ ── fail ──────┐
    ▼               │
L3: Model Swap (upgrade model tier)
    │ ── success ──► resume normal
    │ ── fail ──────┐
    ▼               │
L4: Scope Reduce (narrow scope, skip optional sub-tasks)
    │ ── success ──► resume with reduced scope
    │ ── fail ──────┐
    ▼               │
L5: Graceful Degrade (emit partial results + gap report)
    │
    ▼
Parent receives partial result with explicit gaps documented
```

---

## Failure Classification

Every agent failure MUST be classified into one of these categories. The classification determines which recovery strategy and wave gate logic applies:

| Failure Class | Detection | Examples |
|---|---|---|
| `rate_limited` | Output contains "429", "rate limit", "too many requests", "secondary rate limit", or "abuse detection" | Platform throttling the request |
| `timeout` | Agent did not respond within its allocated timeout | Slow model, overloaded infrastructure |
| `unparseable` | Agent returned output that is not valid JSON | Prompt confusion, model hallucination |
| `scope_error` | Agent returned `status: "failed"` with out-of-scope errors | Task beyond agent capability |
| `unknown` | Any other failure not matching the above | Unexpected errors |

### Classification in Output

Failed agents MUST include `failure_class` in their output when possible:

```json
{
  "status": "failed",
  "failure_class": "rate_limited | timeout | unparseable | scope_error | unknown",
  "failure_detail": "<brief description>"
}
```

Parents classifying child failures SHOULD inspect error messages for rate-limit keywords even when the child reports `status: "timeout"`, since rate-limited requests may surface as timeouts.

---

## Wave Deployment Protocol

Wave deployment prevents concentrated bursts of agent launches that can trigger platform rate limits. Instead of launching all children simultaneously, agents deploy in progressive waves with health gates between them.

### Wave Strategy: Canary → Probe → Remainder

| Wave | Size | Purpose | Gate to Next |
|---|---|---|---|
| **Wave 1 (Canary)** | 1 agent | Validate task feasibility | Canary returns `success` or `partial` with confidence ≥ 0.3 |
| **Wave 2 (Probe)** | min(3, remaining) agents | Test for rate limits and bulk feasibility | `failure_rate < 0.50` AND `rate_limited_count == 0` |
| **Wave 3 (Remainder)** | All remaining agents | Full deployment | N/A — final wave |

### Inter-Wave Delay

| Condition | Delay |
|---|---|
| Normal (no failures) | 2 seconds base |
| Any `failure_class: timeout` in previous wave | 4 seconds |
| Any `failure_class: rate_limited` in previous wave | 8 seconds + reduce Wave 3 size by 50% |

### Scale-Specific Wave Rules

| Scale | Nexus → Commanders | Commander → Children | Squad Lead → Workers |
|---|---|---|---|
| **SS-50** | Launch all in parallel (2-3 commanders) | Canary → Probe(3) → Rest | Canary → Rest (3-5 workers, too small for 3 waves) |
| **SS-100** | Launch all in parallel (3-5 commanders) | Canary → Probe(3) → Rest | Canary → Rest |
| **SS-250** | Wave 1: 2 commanders → Wave 2: 3 commanders | Canary → Probe(3) → Rest | Canary → Rest + random 0-2s jitter before pod launch |

### SS-250 Jitter (Anti-Synchronization)

At SS-250 scale, many Squad Leads may complete their canary at similar times and launch their full pods simultaneously — creating a secondary burst. To prevent this:

- After canary success, each Squad Lead adds a **random delay of 0–2 seconds** before launching the remaining workers
- This spreads the worker launch window across ~2 seconds instead of a single burst

### Wave Gate Logic

Between waves, the parent checks:

```
CAN_PROCEED = (
  failures_in_wave / launched_in_wave < 0.50
  AND rate_limited_count_in_wave == 0
  AND circuit_breaker_state == CLOSED
)
```

If `CAN_PROCEED` is false:
1. If `rate_limited_count > 0` → wait `adaptive_delay` (8s), reduce next wave size by 50%
2. If `failure_rate ≥ 0.50` → trigger circuit breaker (enter OPEN state)
3. If `circuit_breaker_state != CLOSED` → do not launch next wave

### Wave Deployment Display

```
🐝 PHASE 3 — COMMANDER DEPLOYMENT (wave mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Wave 1 (canary):  CMD-ARCH ▸ claude-opus-4.6  ✅ healthy
  ── gate check: 0 failures, 0 rate-limited ──
  Wave 2 (probe):   CMD-IMPL ▸ gpt-5.4  ✅ | CMD-TEST ▸ claude-sonnet-4.6  ✅
  ── gate check: 0 failures, 0 rate-limited ──
  Wave 3 (full):    CMD-DOCS ▸ gpt-5.2  ✅ | CMD-INTG ▸ claude-sonnet-4.5  ✅

  All commanders deployed: 5/5
```

---

## Timeout Cascade

Each layer in the spawn chain has a strictly decreasing timeout. Children MUST always finish before their parents. Reviewers are a separate Nexus-spawned track outside the spawn chain:

| Layer | Timeout | Rationale |
|---|---|---|
| Nexus (L0) | 90 seconds | Needs time to collect from all children + synthesize |
| Commander (L1) | 60 seconds | Needs time to collect from squad leads + merge |
| Squad Lead (L2) | 40 seconds | Needs time to deploy canary + collect from workers |
| Worker (L3) | 30 seconds | Atomic task execution only |
| Reviewer (L4) | 45 seconds | Scoring and analysis of bundle pairs |

**Rule**: A parent's timeout MUST be greater than the sum of its child deployment time + child timeout + merge time. This ensures children always complete before parents time out.

---

## Resource Guards

Six resource guards running at all times during a swarm deployment:

| Guard | Limit | Action on Breach |
|---|---|---|
| **Timeout Guard** | Per-layer cascade (90/60/40/30s) | Kill agent, return timeout atom |
| **Token Ceiling** | 128K/64K/32K/8K per layer | Truncate output, preserve JSON structure |
| **Output Size Cap** | 4K/1K/512/256 tokens per layer | Truncate, preserve JSON structure |
| **Retry Budget** | Workers: 0 (no retries). Squad Leads: 1 (re-launch one replacement worker). | Skip on budget exhaustion |
| **Concurrent Agent Cap** | Max 50 agents launching simultaneously | Queue remaining, launch as slots free |
| **Cost Ceiling** | $20 hard cap per run (SS-250) | Kill all agents, emit partial results |

### Cost Ceiling Enforcement

The cost ceiling is the ultimate circuit breaker. When approached:

1. At **80% of ceiling** ($16 for SS-250): Log warning, stop launching new agents
2. At **90% of ceiling** ($18 for SS-250): Kill all workers, keep only commanders and reviewers
3. At **100% of ceiling** ($20 for SS-250): Kill ALL agents, emit whatever results are available

### Cost Estimates by Scale

| Scale | Optimistic | Typical | Worst Case | Hard Cap |
|---|---|---|---|---|
| SS-50 | $1.50 | $2.50 | $3.50 | $5.00 |
| SS-100 | $3.50 | $5.50 | $8.00 | $10.00 |
| SS-250 | $4.32 | $10.00 | $16.22 | $20.00 |

---

## Circuit Breaker Integration Points

### In SKILL.md (Nexus Level)

```
After launching all 5 Commanders:
  - Track: commanders_completed, commanders_failed
  - If commanders_failed >= 3: CIRCUIT OPEN
    → Stop launching reviewers
    → Return partial results from successful commanders
    → Include gap report for failed domains
```

### In Commander Template

```
After launching Squad Leads:
  - Track: squads_completed, squads_failed
  - If squads_failed >= 5 (of 10): CIRCUIT OPEN
    → Stop launching more squad leads
    → Merge results from successful squads
    → Report status: "partial" with failed squad IDs
```

### In Squad Lead Template

```
After launching workers:
  - If canary fails after retry: CIRCUIT OPEN
    → Do NOT deploy remaining 4 workers
    → Report failure upward immediately
  - If 3+ of 5 workers fail: CIRCUIT OPEN
    → Report partial results from surviving workers
```

---

## Monitoring & Observability

During a swarm deployment, the following metrics should be tracked:

| Metric | Source | Alert Threshold |
|---|---|---|
| Agent failure rate | All layers | > threshold per layer (60% commanders, 50% workers) |
| Wall-clock time | Nexus | > 90s total |
| Estimated cost | Token counters | > $16 (80% of cap) |
| Circuit breaker state | Each layer | Any layer enters OPEN |
| Timeout count | All layers | > 5 timeouts total |
| Unparseable output count | All layers | > 3 unparseable outputs |
| Recovery strategy invocations | HALF-OPEN probes | > 2 recovery cycles at same layer |
| Depth budget utilization | Commander layer | > 90% of allocated squads used |

### Telemetry Aggregation (Nexus-Level)

At run completion, the Nexus MUST emit a `run_telemetry` block in the Final Report:

```json
{
  "run_telemetry": {
    "run_id": "<run-id>",
    "scale": "ss-50 | ss-100 | ss-250",
    "personality_mode": "<mode>",
    "total_agents_spawned": <integer>,
    "total_tool_calls": <integer>,
    "total_wall_clock_s": <number>,
    "total_tokens_consumed": <integer>,
    "estimated_cost_usd": <number>,
    "circuit_breaker_trips": <integer>,
    "recovery_strategies_used": ["<strategy1>", "<strategy2>"],
    "depth_budget_utilization": <0.0-1.0>,
    "shadow_score_final": <0-100>,
    "consensus_tier_distribution": {
      "CONSENSUS": <integer>,
      "MAJORITY": <integer>,
      "CONFLICT": <integer>,
      "UNIQUE": <integer>
    },
    "model_usage": {
      "<model_name>": <integer>
    }
  }
}
```
