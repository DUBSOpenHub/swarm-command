# Copilot Instructions — Swarm Command

This repository contains **Swarm Command**, a GitHub Copilot CLI skill that orchestrates multi-model agent swarms with consensus scoring and shadow validation.

## File map

| File/Dir | Purpose |
|---|---|
| `skills/swarm-command/SKILL.md` | Nexus orchestrator prompt (the brain) |
| `agents/swarm-command.agent.md` | Standalone agent version |
| `templates/*.md` | Prompt templates (Commander, Worker, Reviewer, Squad Lead) |
| `protocols/*.md` | Protocol invariants (Depth Guard, Circuit Breaker, Context Capsule) |
| `config.yml` | Tunables (models, thresholds, timeouts, scaling) |
| `catalog.yml` | Skill metadata + file references |
| `docs/*.md` | Architecture, consensus, shadow scoring, scaling docs |

## Non-negotiables

1. **Depth Guard is sacred.** Workers are ALWAYS leaf nodes (`explore`/`task`). They MUST NOT use the `task` tool. Three enforcement layers: prompt-level, contract-level, config-level.
2. **Config is the source of truth.** Never hardcode model names, thresholds, or tunables inside prompts.
3. **All outputs are strict JSON.** Every layer boundary uses schema-validated JSON. No prose parsing.
4. **Just a skill.** Do not add runtime code, package managers, telemetry, dashboards, or plugin systems.
5. **Parent controls spawning.** The parent computes `can_launch` for every child. The child never decides for itself.
6. **Sealed criteria are hidden.** Shadow scoring uses the [Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec) sealed-envelope protocol. Sealed acceptance criteria are generated before commanders execute and must never appear in any agent prompt. Only the Nexus sees them during Phase 6 validation.
7. **Context compresses monotonically.** 128K → 2K → 512 → 128 tokens. File scope narrows at every layer.

## Prohibited actions

- Spawning `general-purpose` agents at the worker level (depth 3+)
- Setting `can_launch = true` for Workers and Reviewers (depth 3+) is prohibited. Squad Leads at depth 2 MAY have `can_launch=true` (they spawn leaf workers only).
- Passing full context (128K) to workers — compress to 128 tokens
- Exposing shadow scoring criteria to workers or reviewers
- Hardcoding model names in prompt templates (use placeholders)

## PR requirements

Before opening a PR:

- Ensure all templates have complete DEPTH LOCK blocks for leaf agents
- Ensure `catalog.yml` references are valid
- Ensure YAML parses (`config.yml`, `catalog.yml`)
- Verify depth guard audit checklist passes (protocols/depth-guard.md)
- Verify all JSON schemas in protocols/context-capsule.md are valid draft-07
