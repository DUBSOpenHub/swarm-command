# Depth Guard Protocol

The Depth Guard is the single most critical safety mechanism in Swarm Command. It prevents runaway agent spawning through **THREE independent enforcement layers** and is governed by **5 immutable laws**.

---

## Depth Budget Allocation

The **depth budget** is Nexus-assigned and controls how many squad leads each Commander may spawn. It prevents uniform over-allocation (every commander getting max squads) and ensures harder domains get more resources.

### Default Budget Table

| Domain | Commander | Default Squads | Complexity | Rationale |
|---|---|---|---|---|
| Architecture | CMD-ARCH | 10 | High | Structural analysis is deeply interconnected; many sub-areas |
| Implementation | CMD-IMPL | 10 | High | Logic and data flow require exhaustive tracing |
| Testing | CMD-TEST | 7 | Medium | Well-scoped but needs breadth across test categories |
| Integration | CMD-INTG | 7 | Medium | Cross-cutting but narrower than ARCH/IMPL |
| Documentation | CMD-DOCS | 5 | Low | Constrained output format; parallelization less valuable |

### Budget Override Rules

1. **Commander may request +2 squads** if the micro-task reveals unexpected complexity. Include `budget_request: { "squads_requested": N, "justification": "..." }` in the bundle output.
2. **Nexus approves budget requests** between Phase 3 and Phase 5 only — no new squads after Phase 5.
3. **Budget CANNOT decrease mid-run** — if squads are already launched, they run to completion.
4. **Total squad cap per run: 60** (SS-250) / 40 (SS-100) / 20 (SS-50) — regardless of individual budgets.

### Budget in Context Capsule

```json
{
  "depth_budget": {
    "squads_allocated": 10,
    "complexity_tier": "high",
    "rationale": "Architecture domain — high interdependency, many module boundaries"
  }
}
```

The Commander reads `depth_budget.squads_allocated` and uses it in place of the generic `{{SQUAD_COUNT}}` placeholder. If `depth_budget` is absent, default to 10 (SS-250), 8 (SS-100), 5 (SS-50).

---

## The 5 Laws of Depth Guard

| Law | Statement | Enforcement |
|---|---|---|
| **Law 1** | Only `general-purpose` agents may spawn children | Structural: `explore` and `task` agents lack the `task` tool |
| **Law 2** | `explore` and `task` agents are structurally leaf nodes | Structural: Agent type definition prevents spawning |
| **Law 3** | Maximum spawn depth varies by scale: 3 for SS-250 (Nexus[0] → Commander[1] → Squad Lead[2] → Worker[3]), 2 for SS-50/SS-100 (Nexus[0] → Commander[1] → Worker[2], no squad leads). Workers are always leaf nodes at the deepest level. | Config: `depth_config.max_depth` set per scale (2 or 3) in every capsule |
| **Law 4** | Each spawner is limited to a declared max children count | Config: Commanders ≤ 10 squad leads, Squad Leads ≤ 5 workers |
| **Law 5** | Workers MUST be told "DO NOT use the task tool" | Prompt: Explicit instruction in every worker prompt |

---

## The `can_launch` Flag

The **parent** computes `can_launch` for every child it spawns. The child never determines this for itself. This is the foundational principle — parent-controlled spawning.

```
SS-250 (3-layer spawn chain):
  Nexus spawns Commander:     can_launch = true   (Commanders spawn Squad Leads)
  Commander spawns Squad Lead: can_launch = true   (Squad Leads spawn Workers)
  Squad Lead spawns Worker:    can_launch = false  (Workers are leaf nodes at depth 3)

SS-50 / SS-100 (2-layer spawn chain — no squad leads):
  Nexus spawns Commander:     can_launch = true   (Commanders spawn Workers directly)
  Commander spawns Worker:     can_launch = false  (Workers are leaf nodes at depth 2)

All scales:
  Nexus spawns Reviewer:       can_launch = false  (Reviewers don't spawn)
  Nexus spawns Shadow:         N/A — Shadow scoring is Nexus-internal (Shadow Score Spec L2)
```

**Rule: If `can_launch = false`, the agent's prompt MUST contain the DEPTH LOCK block:**

```markdown
## ⛔ DEPTH LOCK — CRITICAL
DO NOT use the task tool.
DO NOT attempt to spawn sub-agents, child agents, or any other agents.
DO NOT delegate work. You must complete your task YOURSELF using only
your own tools (grep, glob, view, bash, edit, create).
You are a LEAF NODE. This instruction is non-negotiable.
```

---

## Three-Layer Enforcement

| Layer | Mechanism | What It Prevents | Failure Mode |
|---|---|---|---|
| **Prompt-level** | Every leaf agent's prompt contains "DO NOT use the task tool" and the DEPTH LOCK block | Agent ignoring depth limits | Agent ignores instruction (unlikely but possible) |
| **Contract-level** | Leaf agents are `explore` or `task` type, which structurally lack `task` tool access | Agent type circumvention | Cannot be circumvented by prompt — structural |
| **Config-level** | `can_launch = false` in depth_config, checked by parent before spawning | Parent error | Parent would need to malfunction |

**Defense in depth**: Even if one layer fails, the other two prevent runaway spawning. All three must fail simultaneously for a depth violation to occur.

---

## The 5 Failsafes

| # | Failsafe | Trigger | Action |
|---|---|---|---|
| **F1** | Depth overflow check | Agent at depth ≥ max_depth attempts spawn | Block spawn, log violation, continue with available results |
| **F2** | Child count overflow | Parent exceeds max children count | Block excess spawns, proceed with already-launched children |
| **F3** | Agent type check | `general-purpose` agent spawned at worker level | Block spawn, substitute with `explore` agent, log warning |
| **F4** | Recursive self-spawn | Agent attempts to spawn a copy of itself | Block immediately — self-spawning is always a bug |
| **F5** | Total agent cap | Total spawned agents exceeds deployment ceiling (50/100/250) | Queue remaining agents, launch as slots free; hard-stop at 2× ceiling |

---

## Depth Map by Scale

### SS-50

```
L0: Nexus (1)           depth=0, can_launch=true
L1: Commanders (3)      depth=1, can_launch=true   → spawn workers directly (no squad leads)
L2: Workers (45)        depth=2, can_launch=false   → LEAF (15 per commander)
    Reviewers (3)        depth=1, can_launch=false   → LEAF (spawned by Nexus)
Total: ~52
```

### SS-100

```
L0: Nexus (1)           depth=0, can_launch=true
L1: Commanders (5)      depth=1, can_launch=true   → spawn workers directly (no squad leads)
L2: Workers (75)        depth=2, can_launch=false   → LEAF (15 per commander)
    Reviewers (8)        depth=1, can_launch=false   → LEAF (spawned by Nexus)
    Shadow scoring       Nexus-internal (sealed criteria, no agents spawned)
Total: ~89
```

### SS-250

```
L0: Nexus (1)           depth=0, can_launch=true
L1: Commanders (5)      depth=1, can_launch=true
L2: Squad Leads (50)    depth=2, can_launch=true   → spawn workers
L3: Workers (250)        depth=3, can_launch=false  → LEAF
L4: Reviewers (10)       depth=1, can_launch=false  → LEAF
    Shadow scoring         Nexus-internal (sealed criteria, no agents spawned)
Total: ~316
```

> Agent counts include ALL deployed agents across all layers (Nexus + Commanders + Squad Leads + Workers + Reviewers).

---

## Depth Audit Checklist

Before deploying any swarm, verify ALL items:

- [ ] Nexus prompt sets `max_depth` per scale (3 for SS-250, 2 for SS-50/SS-100) in all capsules
- [ ] SS-250: Commander prompts include Squad Lead spawning rules with depth_config
- [ ] SS-50/SS-100: Commander prompts include direct Worker spawning rules (no squad leads)
- [ ] Squad Lead prompts (SS-250 only) specify worker agent types as `explore` or `task` only
- [ ] All worker prompts contain the complete DEPTH LOCK block
- [ ] All reviewer prompts contain the complete DEPTH LOCK block
- [ ] Shadow scoring is Nexus-internal — no shadow validator agents spawned (Shadow Score Spec L2)
- [ ] No agent at max depth has `can_launch = true` (workers are always leaf nodes)
- [ ] No `general-purpose` agent is spawned at the worker level (depth 2 for SS-50/SS-100, depth 3 for SS-250)
- [ ] Commander max children ≤ 10
- [ ] Squad Lead max children ≤ 5
- [ ] Total agent count does not exceed scale ceiling

---

## Anti-Patterns to Watch For

| # | Anti-Pattern | Why It's Bad | Correct Pattern |
|---|---|---|---|
| 1 | **Recursive self-spawning** | Infinite agent explosion | Use `can_launch = false` on leaf nodes |
| 2 | **Child decides depth** | Child can lie or miscalculate | Parent precomputes `can_launch` for each child |
| 3 | **Explore agents spawning** | Type violation | Enforce agent type = `explore`/`task` for workers |
| 4 | **Depth=0 workers** | Nexus drowns in 250 atoms | Use Commander (+ Squad Lead at SS-250) intermediaries |
| 5 | **Unrestricted fan-out** | Exceeds concurrent agent limits | Max 10 children per spawner |

---

## Enforcement in the SKILL.md

The skill implements depth guard enforcement at every spawning point:

1. **Nexus level**: Sets `depth_config` in every Context Capsule with `current_depth=1, max_depth=<scale_max>, can_launch=true`
2. **Commander level (SS-250)**: Passes Shards to Squad Leads with `current_depth=2, max_depth=3, can_launch=true`
3. **Commander level (SS-50/SS-100)**: Passes Micro-Briefs directly to Workers with `can_launch=false` and DEPTH LOCK in prompt (no squad leads at these scales)
4. **Squad Lead level (SS-250 only)**: Passes Micro-Briefs to Workers with `can_launch=false` and DEPTH LOCK in prompt
5. **Reviewer level**: Spawned by Nexus with `can_launch=false` and DEPTH LOCK in prompt

No agent at any level can bypass these controls because they are enforced at the parent level, the agent type level, and the prompt level simultaneously.
