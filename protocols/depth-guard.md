# Depth Guard Protocol

The Depth Guard is the single most critical safety mechanism in Swarm Command. It prevents runaway agent spawning through **THREE independent enforcement layers** and is governed by **5 immutable laws**.

---

## The 5 Laws of Depth Guard

| Law | Statement | Enforcement |
|---|---|---|
| **Law 1** | Only `general-purpose` agents may spawn children | Structural: `explore` and `task` agents lack the `task` tool |
| **Law 2** | `explore` and `task` agents are structurally leaf nodes | Structural: Agent type definition prevents spawning |
| **Law 3** | Maximum spawn depth = 3 (Nexus[0] → Commander[1] → Squad Lead[2] → Worker[3]). Workers are leaf nodes at depth 3. | Config: `depth_config.max_depth = 3` in every capsule |
| **Law 4** | Each spawner is limited to a declared max children count | Config: Commanders ≤ 10 squad leads, Squad Leads ≤ 5 workers |
| **Law 5** | Workers MUST be told "DO NOT use the task tool" | Prompt: Explicit instruction in every worker prompt |

---

## The `can_launch` Flag

The **parent** computes `can_launch` for every child it spawns. The child never determines this for itself. This is the foundational principle — parent-controlled spawning.

```
Nexus spawns Commander:     can_launch = true   (Commanders spawn Squad Leads)
Commander spawns Squad Lead: can_launch = true   (Squad Leads spawn Workers)
Squad Lead spawns Worker:    can_launch = false  (Workers are leaf nodes)
Nexus spawns Reviewer:       can_launch = false  (Reviewers don't spawn)
Nexus spawns Shadow:         can_launch = false  (Shadow validators don't spawn)
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
L1: Commanders (3)      depth=1, can_launch=true
L2: Squad Leads (15)    depth=2, can_launch=true   → spawn workers
L3: Workers (45)         depth=3, can_launch=false  → LEAF
L4: Reviewers (3)        depth=1, can_launch=false  → LEAF
Total: ~52
```

### SS-100

```
L0: Nexus (1)           depth=0, can_launch=true
L1: Commanders (3)      depth=1, can_launch=true
L2: Squad Leads (18)    depth=2, can_launch=true   → spawn workers
L3: Workers (72)         depth=3, can_launch=false  → LEAF
L4: Reviewers (6)        depth=1, can_launch=false  → LEAF
    Shadow (2)           depth=1, can_launch=false  → LEAF
Total: ~83
```

### SS-250

```
L0: Nexus (1)           depth=0, can_launch=true
L1: Commanders (5)      depth=1, can_launch=true
L2: Squad Leads (50)    depth=2, can_launch=true   → spawn workers
L3: Workers (250)        depth=3, can_launch=false  → LEAF
L4: Reviewers (10)       depth=1, can_launch=false  → LEAF
    Shadow (3)           depth=1, can_launch=false  → LEAF
Total: ~268
```

---

## Depth Audit Checklist

Before deploying any swarm, verify ALL items:

- [ ] Nexus prompt sets `max_depth = 3` in all capsules sent to Commanders
- [ ] Commander prompts include Squad Lead spawning rules with depth_config
- [ ] Squad Lead prompts specify worker agent types as `explore` or `task` only
- [ ] All worker prompts contain the complete DEPTH LOCK block
- [ ] All reviewer prompts contain the complete DEPTH LOCK block
- [ ] All shadow validator prompts contain the complete DEPTH LOCK block
- [ ] No agent at depth 2+ has `can_launch = true` (only Squad Leads at depth 2 may, for spawning workers)
- [ ] No `general-purpose` agent is spawned at the worker level (depth 3)
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
| 4 | **Depth=0 workers** | Nexus drowns in 250 atoms | Always use Commander + Squad Lead intermediaries |
| 5 | **Unrestricted fan-out** | Exceeds concurrent agent limits | Max 10 children per spawner |

---

## Enforcement in the SKILL.md

The skill implements depth guard enforcement at every spawning point:

1. **Nexus level**: Sets `depth_config` in every Context Capsule with `current_depth=1, max_depth=3, can_launch=true`
2. **Commander level**: Passes Shards to Squad Leads with `current_depth=2, max_depth=3, can_launch=true`
3. **Squad Lead level**: Passes Micro-Briefs to Workers with `can_launch=false` and DEPTH LOCK in prompt
4. **Reviewer level**: Spawned by Nexus with `can_launch=false` and DEPTH LOCK in prompt

No agent at any level can bypass these controls because they are enforced at the parent level, the agent type level, and the prompt level simultaneously.
