# Agents

## Overview

Swarm Command ships one Copilot CLI skill and one standalone agent. The **skill** (`swarm-command`) is the primary entry point — it orchestrates the full multi-model consensus swarm. The **agent** (`swarm-command.agent.md`) is a standalone agent version of the same capability for use when you prefer the agent selector over skill triggers.

## Available Agents

### swarm-command (Skill)

- **Purpose**: Multi-model swarm orchestrator with consensus scoring and shadow validation. Launches 50–250+ AI agents across 16 models in a 5-layer hierarchy (Nexus → Commander → Squad Lead → Worker → Reviewer), performs cross-family review, applies shadow scoring with hidden criteria, and synthesizes the final output through a 4-stage consensus algorithm.
- **Trigger**: `swarm command`
- **Usage**: Install via Copilot CLI, then invoke with natural language:
  ```
  swarm command                           # Default SS-100 deployment
  swarm command ss-250                    # Full 250+ agent deployment
  swarm command ss-50                     # Quick 50-agent deployment
  swarm command ss-250 "refactor auth"    # With specific task
  ```
- **Model**: Dispatches to 16 models across Claude and GPT families
- **Install**:
  ```bash
  mkdir -p ~/.copilot/skills/swarm-command && \
    curl -sL https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/skills/swarm-command/SKILL.md \
      -o ~/.copilot/skills/swarm-command/SKILL.md
  ```
- **Location**: `skills/swarm-command/SKILL.md`

### swarm-command (Agent)

- **Purpose**: Standalone agent version of the swarm orchestrator. Same orchestration logic as the skill but framed as a named agent for use in the Copilot CLI agent selector. Use when you want to invoke swarm orchestration via the `@swarm-command` mention or agent picker rather than the `swarm command` trigger phrase.
- **Usage**: After installing `~/.copilot/agents/swarm-command.agent.md`, invoke via the agent selector in Copilot CLI.
- **Install**:
  ```bash
  mkdir -p ~/.copilot/agents && \
    curl -sL https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/agents/swarm-command.agent.md \
      -o ~/.copilot/agents/swarm-command.agent.md
  ```
- **Location**: `agents/swarm-command.agent.md`

## File Ownership

| File/Directory | Owner | Purpose |
|---|---|---|
| `skills/swarm-command/SKILL.md` | Skill | Core orchestration logic |
| `agents/swarm-command.agent.md` | Agent | Standalone agent wrapper |
| `templates/commander.md` | Skill (reference) | Commander prompt template |
| `templates/worker.md` | Skill (reference) | Worker prompt template |
| `templates/reviewer.md` | Skill (reference) | Cross-Reviewer prompt template |
| `templates/squad-lead.md` | Skill (reference) | Squad Lead prompt template |
| `protocols/depth-guard.md` | Skill (reference) | Depth Guard protocol |
| `protocols/circuit-breaker.md` | Skill (reference) | Circuit Breaker protocol |
| `protocols/context-capsule.md` | Skill (reference) | Context Capsule schemas |
| `config.yml` | Both | Shared configuration |
| `catalog.yml` | Meta | Skill metadata for discovery |
| `docs/*.md` | Documentation | Architecture, consensus, scaling |

## Configuration

- **No API keys required** — all models are accessed through your active Copilot subscription
- **No servers or infrastructure** — swarm state lives in memory during the session
- **Scaling modes**: SS-50 (starter), SS-100 (default), SS-250 (full consensus swarm)
- **Consensus threshold**: 70% for auto-accept, 50% for majority, below 50% for Nexus arbitration
- **Shadow scoring**: 3 independent validators with hidden criteria running in parallel
- **Cost ceiling**: $20 hard cap with automatic kill-switch
- **Timeout cascade**: 90s → 60s → 40s → 30s per layer (children always finish before parents)

## Agent Prompt Rules

1. **Depth Guard is non-negotiable** — Workers MUST be told "DO NOT use the task tool. You are a leaf node." Workers are ALWAYS `explore` or `task` agent type, never `general-purpose`.
2. **Parent controls spawning** — The parent computes `can_launch` for every child. The child never decides for itself.
3. **Context compresses at every layer** — 128K → 2K → 512 → 128 tokens. Strip rationale, keep only the task.
4. **All outputs are strict JSON** — No prose, no markdown, just schema-validated JSON at every layer boundary.
5. **Pipeline overlap** — Reviewers start as soon as the first 2 commander bundles arrive, don't wait for all 5.
6. **Canary before swarm** — Deploy 1 canary worker per pod before full deployment to verify task feasibility.
7. **Fail parsably** — Every failure is a structured JSON object with status, reason, and diagnostics.
