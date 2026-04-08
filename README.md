# 🐝 Swarm Command

**Multi-model consensus swarm orchestration. 50–250+ AI agents. 16 models. Shadow scoring. One command.**

[![GitHub](https://img.shields.io/badge/GitHub-Copilot_CLI-blue?logo=github)](https://github.com/features/copilot)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy-brightgreen?logo=github)](SECURITY.md)

> ### ⚡ One Command. That's It.
>
> **Never used the CLI before? No problem.** Follow these 3 steps:
>
> **1. Open your terminal**
> - 🍎 **Mac:** Press `⌘ + Space`, type **Terminal**, hit Enter
> - 🪟 **Windows:** Press `Win + X`, choose **Terminal** or **PowerShell**
> - 🐧 **Linux:** Press `Ctrl + Alt + T`
>
> **2. Paste this line and press Enter:**
> ```bash
> curl -fsSL https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/quickstart.sh | bash
> ```
> *Already have the CLI? No worries — this detects it and skips straight to adding the skill.*
>
> **3. When Copilot opens, type:** `swarm command`
>
> That's it — unleash the swarm! 🐝
>
> *Requires an active [Copilot subscription](https://github.com/features/copilot/plans). [Get one here →](https://github.com/features/copilot/plans)*

---

## 🤔 What Is This?

**Swarm Command** is a multi-model swarm orchestration skill for the [Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli) that launches **50 to 250+ AI agents** across **16 different models** to solve complex tasks through hierarchical fan-out, cross-family review, and consensus-gated synthesis. Give it any task — architecture, refactoring, testing, documentation — and it decomposes it into 5 domains, dispatches commanders, squad leads, and workers in a 5-layer hierarchy, cross-reviews with model-diverse pairs, shadow-scores with hidden criteria, and synthesizes the final output from collective intelligence.

### 💬 The Problem

You ask one AI model and get one perspective. Maybe it's great, maybe it's mediocre — you have no way to know. Worse, complex tasks that span architecture, implementation, testing, docs, and integration overwhelm a single context window. Swarm Command splits your task across hundreds of specialized agents, each doing one atomic thing well, then merges their work through a rigorous consensus pipeline with independent quality validation.

### ⚡ What Makes It Different

- 🐝 **True swarm** — 50 to 250+ agents, not 3–5
- 🏗️ **5-layer hierarchy** — Nexus → Commander → Squad Lead → Worker → Reviewer
- 🔀 **Cross-model diversity** — Claude + GPT families mixed within every pod
- 🗳️ **Consensus scoring** — 4-stage gate-then-rank with CONSENSUS / MAJORITY / CONFLICT tiers
- 👻 **Shadow scoring** — Hidden criteria agents never see catch errors main scoring misses
- 🛡️ **Depth Guard** — 5 Laws + 3-layer enforcement prevent runaway agent spawning
- ⚡ **Circuit breaker** — 3-state FSM with 5-level recovery escalation
- 📉 **Sub-linear scaling** — 5× more agents ≈ 2.2× more wall-clock time (α ≈ 0.45)
- 📦 **Zero infrastructure** — no servers, no API keys, no build step
- 💰 **Cost controlled** — $20 hard cap, timeout cascade, canary verification

---

## 🏗️ How It Works

```
                          ┌─────────────────┐
                    L0    │     NEXUS (1)    │  claude-opus-4.6
                          │  128K ctx budget │  Task decomposition + final synthesis
                          └────────┬────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                     │
        ┌─────┴─────┐      ┌─────┴─────┐        ┌─────┴─────┐
  L1    │ CMD-ARCH   │      │ CMD-IMPL   │  ...   │ CMD-INTG   │  × 5 Commanders
        │ 64K ctx    │      │ 64K ctx    │        │ 64K ctx    │  Domain specialists
        └─────┬──────┘      └─────┬──────┘        └─────┬──────┘
              │                    │                     │
     ┌────────┼────────┐          │                     │
     │        │        │          │                     │
  ┌──┴──┐ ┌──┴──┐ ┌──┴──┐
  L2  │SQ-1│ │SQ-2│ ... │SQ-10│   × 10 per Commander = 50 Squad Leads
      │32K │ │32K │     │32K │    Micro-task decomposition + canary deploy
      └──┬──┘ └──┬──┘   └──┬──┘
         │        │          │
      ┌──┴──┐ ┌──┴──┐   ┌──┴──┐
  L3  │W×5  │ │W×5  │   │W×5  │  × 5 per Squad Lead = 250 Workers
      │ 8K  │ │ 8K  │   │ 8K  │  Atomic execution (LEAF — no spawning)
      └─────┘ └─────┘   └─────┘

                    ┌──────────────┐
              L4    │ REVIEWERS×10 │  Cross-review mesh (pipeline overlap)
                    │    16K ctx   │  4-axis sealed scoring + consensus tiers
                    └──────────────┘

              + 3 SHADOW VALIDATORS (hidden criteria, sealed envelope)
```

### Time-Flow Architecture

```
T+0s     T+2s       T+5s         T+12s       T+45s      T+65s    T+80s   T+90s
  │        │          │             │           │          │        │       │
  ▼        ▼          ▼             ▼           ▼          ▼        ▼       ▼
┌────┐  ┌──────┐  ┌─────────┐  ┌──────────┐ ┌────────┐ ┌───────┐ ┌────┐ ┌────┐
│NEXUS│→ │CMDs  │→ │SQUAD    │→ │WORKERS   │ │REVIEW  │ │MERGE  │ │VOTE│ │EMIT│
│BOOT │  │SPAWN │  │LEADS    │  │EXECUTE   │ │MESH    │ │RESULTS│ │    │ │    │
│     │  │      │  │+ CANARY │  │(parallel)│ │(overlap│ │       │ │    │ │    │
│     │  │      │  │VERIFY   │  │          │ │start)  │ │       │ │    │ │    │
└────┘  └──────┘  └─────────┘  └──────────┘ └────────┘ └───────┘ └────┘ └────┘
  2s       3s         7s           33s          20s        15s      10s    5s
```

### Signal Flow — Token Compression

```
           CONTEXT DOWN (shrinking)              RESULTS UP (compressing)
           ========================              ========================

  L0  Full Task Brief    ─── 4K tokens ───►  Final Report     ◄── 4K tokens
                 │                                    ▲
  L1  Context Capsule    ─── 2K tokens ───►  Bundle           ◄── 1K tokens
                 │                                    ▲
  L2  Shard              ─── 512 tokens ──►  Atom Set         ◄── 512 tokens
                 │                                    ▲
  L3  Micro-Brief        ─── 128 tokens ──►  Atom             ◄── 256 tokens
                 │                                    ▲
  L4  Review Capsule     ─── 1K tokens ───►  Score Card       ◄── 512 tokens
```

---

## 📊 Scaling Variants

| Scale | Agents | Commanders | Workers | Reviewers | Wall-Clock | Cost |
|-------|--------|------------|---------|-----------|------------|------|
| **SS-50** | ~46 | 2 | 30 | 3 | ~30s | $1.50–$3.50 |
| **SS-100** | ~100 | 3 | 72 | 6 | ~45s | $3.50–$8.00 |
| **SS-250** | ~316 | 5 | 250 | 10 | ~65–90s | $8.00–$16.22 |
| **SS-1000** ⚠️ | ~991 | 10 | 850 | 25 | ~110s | $25–$50 |

Default is **SS-100**. Say `swarm command ss-250` for full deployment or `swarm command ss-50` for quick tasks.

---

## 👻 Shadow Scoring

Shadow scoring runs parallel to the main consensus pipeline as an independent quality audit using **hidden criteria that agents never see**:

| Criterion | What It Checks | Weight |
|-----------|----------------|--------|
| `mathematical_soundness` | Formulas computable, coefficients normalized, arithmetic correct | 0.30 |
| `internal_consistency` | Claims in §X match claims in §Y, no contradictions | 0.25 |
| `executability` | Outputs parseable, templates copy-paste ready, schemas validate | 0.25 |
| `constraint_adherence` | No depth guard violations, no cap breaches, no law violations | 0.20 |

Shadow scores act as a **circuit breaker** — if shadow detects critical issues (score < 0.3 on any criterion), the bundle is quarantined and re-reviewed with shadow evidence attached.

---

## 🗳️ Consensus Algorithm

A 4-stage consensus pipeline that merges the best work from hundreds of agents:

1. **Worker Self-Score** — Each worker emits confidence + self-score with its atom
2. **Squad Lead Local Merge** — Groups atoms by sub-task, classifies as CONSENSUS/MAJORITY/CONFLICT
3. **Commander Domain Merge** — Trimmed mean across squads, applies consensus formula
4. **Nexus Cross-Domain Synthesis** — Median-of-3 judging, final arbitration

**Consensus Formula:**
```
score = 0.40 × confidence + 0.30 × evidence + 0.15 × scope + 0.15 × coverage − min(0.10, conflict_rate × 0.10)
```

**Consensus Tiers:**

| Tier | Condition | Action |
|------|-----------|--------|
| **CONSENSUS** | ≥ 70% agreement | Auto-accept |
| **MAJORITY** | ≥ 50% agreement | Accept with dissent note |
| **CONFLICT** | < 50% agreement | Nexus arbitration |
| **UNIQUE** | No overlap | Keep if evidence ≥ 7/10 |

---

## ⚙️ Configuration

All tunables live in `config.yml`. Key settings:

```yaml
consensus:
  threshold_consensus: 0.70
  threshold_majority: 0.50

depth_guard:
  max_spawn_depth: 3
  max_workers_per_squad_lead: 5

circuit_breaker:
  timeout_cascade: [90, 60, 40, 30]  # seconds per layer
  cost_ceiling_usd: 20.00

shadow_scoring:
  enabled: true
  validators: 3
  divergence_alert_threshold: 0.15
```

See [docs/scaling.md](docs/scaling.md) for full scaling configuration and cost estimates.

---

## 🤖 Models Used

| Role | Models |
|------|--------|
| **Nexus** | claude-opus-4.6 |
| **Commanders** | claude-opus-4.6, claude-sonnet-4.6, gpt-5.4, gpt-5.2, claude-sonnet-4.5 |
| **Squad Leads** | claude-haiku-4.5, gpt-5.4-mini |
| **Workers** | claude-haiku-4.5, gpt-5.4-mini, gpt-5-mini, gpt-4.1 |
| **Reviewers** | Cross-family pairs (Claude × GPT) |
| **Shadow Validators** | Different models from main pipeline |

---

## 📦 Install

### Instant Install (no clone needed) ⚡

```bash
mkdir -p ~/.copilot/skills/swarm-command ~/.copilot/agents && \
  curl -sL https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/skills/swarm-command/SKILL.md \
    -o ~/.copilot/skills/swarm-command/SKILL.md && \
  curl -sL https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/agents/swarm-command.agent.md \
    -o ~/.copilot/agents/swarm-command.agent.md && \
  echo "✅ Swarm Command installed — open Copilot CLI and type: swarm command"
```

### Clone & Explore

```bash
git clone https://github.com/DUBSOpenHub/swarm-command.git
cd swarm-command
chmod +x quickstart.sh && ./quickstart.sh
```

---

## 📁 Repository Structure

```
swarm-command/
├── README.md                           # This file
├── AGENTS.md                           # Agent/skill descriptions
├── catalog.yml                         # Skill metadata
├── config.yml                          # All tunables
├── LICENSE                             # MIT
├── SECURITY.md                         # Security policy
├── quickstart.sh                       # One-line installer
├── .github/
│   ├── copilot-instructions.md         # AI agent instructions for this repo
│   └── skills/swarm-command/SKILL.md   # Skill (GitHub discovery path)
├── agents/
│   └── swarm-command.agent.md          # Standalone agent version
├── skills/swarm-command/
│   └── SKILL.md                        # Core skill (the brain)
├── templates/
│   ├── commander.md                    # Commander prompt template
│   ├── worker.md                       # Worker prompt template
│   ├── reviewer.md                     # Cross-Reviewer prompt template
│   └── squad-lead.md                   # Squad Lead prompt template
├── protocols/
│   ├── depth-guard.md                  # 5 Laws + 3-layer enforcement
│   ├── circuit-breaker.md              # 3-state FSM + 5-level recovery
│   └── context-capsule.md              # JSON schemas for all data structures
└── docs/
    ├── architecture.md                 # Full architecture overview
    ├── consensus.md                    # Consensus algorithm deep dive
    ├── shadow-scoring.md               # Shadow scoring documentation
    └── scaling.md                      # Scaling variants + cost estimates
```

---

## 📄 License

[MIT](LICENSE) — use it, fork it, build on it.

---

> **Swarm Command v1.0.0** — Powered by the SwarmSpeed 250 Protocol
> 16 models · 316 agents · Sub-linear scaling · Consensus-gated · Shadow-validated
>
> *"The swarm is smarter than any single model."* 🐝
