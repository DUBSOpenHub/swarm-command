# 🐝 Swarm Command

**Multi-model consensus swarm orchestration. 50–250+ AI agents. 16 models. Shadow Score Spec L2. One command.**

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

**Swarm Command** is a multi-model swarm orchestration skill for the [Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli) that launches **50 to 250+ AI agents** across **16 different models** to solve complex tasks through hierarchical fan-out, cross-family review, and consensus-gated synthesis. Give it any task — architecture, refactoring, testing, documentation — and it decomposes it into 5 domains, dispatches commanders, squad leads, and workers in a 5-layer hierarchy, cross-reviews with model-diverse pairs, validates outputs against sealed acceptance criteria ([Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec) L2), and synthesizes the final output from collective intelligence.

### 💬 The Problem

You ask one AI model and get one perspective. Maybe it's great, maybe it's mediocre — you have no way to know. Worse, complex tasks that span architecture, implementation, testing, docs, and integration overwhelm a single context window. Swarm Command splits your task across hundreds of specialized agents, each doing one atomic thing well, then merges their work through a rigorous consensus pipeline with independent quality validation.

### ⚡ What Makes It Different

- 🐝 **True swarm** — 50 to 250+ agents, not 3–5
- 🏗️ **5-layer hierarchy** — Nexus → Commander → Squad Lead → Worker → Reviewer
- 🔀 **Cross-model diversity** — Claude + GPT families mixed within every pod
- 🗳️ **Consensus scoring** — 4-stage gate-then-rank with CONSENSUS / MAJORITY / CONFLICT tiers
- 👻 **Shadow Score** — [Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec) L2 conformance. Sealed acceptance criteria generated before commanders execute, validated after, hardened on failure.
- 🛡️ **Depth Guard** — 5 Laws + 3-layer enforcement prevent runaway agent spawning
- ⚡ **Circuit breaker** — 3-state FSM with 5-level recovery escalation
- 📉 **Sub-linear scaling** — 5× more agents ≈ 2.2× more wall-clock time (α ≈ 0.45)
- 📦 **Zero infrastructure** — no servers, no API keys, no build step
- 💰 **Cost controlled** — hard cap, timeout cascade, canary verification ([details](docs/scaling.md))

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

              + SHADOW SCORING (sealed acceptance criteria, Shadow Score Spec L2)
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

| Scale | Agents | Commanders | Workers | Reviewers | Wall-Clock |
|-------|--------|------------|---------|-----------|------------|
| **SS-50** | ~52 | 3 | 45 | 3 | ~30s |
| **SS-100** | ~89 | 5 | 75 | 8 | ~45s |
| **SS-250** | ~316 | 5 | 250 | 10 | ~65–90s |

> Agent counts include ALL deployed agents across all layers (Nexus + Commanders + Squad Leads + Workers + Reviewers).

Default is **SS-100**. Say `swarm command ss-250` for full deployment or `swarm command ss-50` for quick tasks.

See [docs/scaling.md](docs/scaling.md) for detailed scaling configuration and cost estimates.

---

## 🎯 Use Cases

Curated highlights — see [docs/use-cases.md](docs/use-cases.md) for the full gallery.

### SS-50 — Fast Expert Panels (~30s)

**🔥 Stack Trace Whisperer**
```
swarm command ss-50 "Diagnose this error — 3 most likely root causes with fixes: [paste error]"
```
> 45 workers split into runtime, dependency, and logic panels. Returns ranked diagnoses with confidence scores in ~30 seconds.

**🔍 "Explain Like I Own It"**
```
swarm command ss-50 "I just inherited this codebase. Explain src/core/ — what does each piece do, where are the landmines?"
```
> Maps architecture, identifies patterns, hunts for tech debt — your 30-second onboarding brief.

**⚡ Performance Profiler's Shortcut**
```
swarm command ss-50 "Find the performance bottlenecks in this file with optimized versions: [paste hot-path file]"
```
> Finds O(n²) loops, sequential awaits, and GC pressure points. Returns before/after code with expected improvement.

### SS-100 — Full Swarm, Default Scale (~45s)

**🔐 Zero-Downtime Auth Rewrite**
```
swarm command "Migrate our session auth to JWT + refresh tokens across API, web app, DB, and tests"
```
> 5 commanders cover architecture, implementation, testing, docs, integration. Returns rollout plan + patches + risk analysis.

**🏗️ Legacy Service Extraction**
```
swarm command "Extract the billing module from our monolith into a service with minimal downtime"
```
> Maps bounded context, generates anti-corruption layer, creates contract tests, writes 18-phase deployment sequence.

**📱 Offline Sync Feature**
```
swarm command "Design offline-first sync for our field app: local cache, conflict resolution, API changes, UX, and tests"
```
> Covers data model, UX states, conflict semantics, testing, and integration. Returns sync strategy + conflict policies.

### SS-250 — Maximum Intelligence (~65–90s)

**🛡️ Zero-Day Security Sweep**
```
swarm command ss-250 "Full security audit: every file, every dependency, every injection surface — CVSS-scored vulnerability report"
```
> 250 workers scan every file (SAST), every dependency (CVE), every secret (entropy), every auth flow (bypass). Returns prioritized findings with auto-remediation PRs.

**⚖️ Compliance Fortress**
```
swarm command ss-250 "Audit for GDPR, HIPAA, SOC2, PCI-DSS compliance — every gap, every control, remediation tickets"
```
> 4 frameworks × 200+ controls. Each worker owns one control check. Returns board-ready risk summary with remediation tickets.

**🗺️ Living Runbook Generator**
```
swarm command ss-250 "Read every service, every pipeline, every config — generate the complete operations manual"
```
> Derives documentation from actual code and infra. Produces runbooks with failure modes, recovery procedures, and dependency maps. Accurate by construction.

### 🎨 Creative Uses

**🎭 Red-Team Jury** (SS-250)
```
swarm command ss-250 "Here's our public announcement. Find ways it can be misread, exploited, or quoted out of context."
```

**🌍 Global Cringe Detector** (SS-100)
```
swarm command "Generate 30 product name candidates. Screen for pronunciation issues and negative associations across regions."
```

**🏛️ Boardroom Simulation** (SS-50)
```
swarm command ss-50 "Act as CFO, CISO, Head of Sales, Support Lead, and Skeptical Customer. Evaluate this plan. Converge on minimum-regret strategy."
```

### ❌ When NOT to Swarm

- **"What's the CLI flag for X?"** → Just ask a single agent
- **Rename one variable** → Manual edit or single agent
- **Prod is down, seconds matter** → DRI-led runbook, not consensus
- **Writing a single-voice email** → One agent in a persona
- **Step-through debugging** → Sequential by nature

---

## 👻 Shadow Scoring

Swarm Command implements **[Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec) L2 conformance** — sealed acceptance criteria generated before commanders execute, validated after, hardened on failure.

**Formula:** `Shadow Score = (sealed_failures / sealed_total) × 100`

| Shadow Score | Level | Action |
|---|---|---|
| 0% | ✅ Perfect | All sealed criteria passed |
| 1–15% | 🟢 Minor | Proceed normally |
| 16–30% | 🟡 Moderate | Attach Gap Report, warn |
| 31–50% | 🟠 Significant | Quarantine bundle, hardening cycle |
| > 50% | 🔴 Critical | Reject bundle from synthesis |

**Sealed-Envelope Protocol:**
1. **Phase 1.5** — Nexus generates sealed acceptance criteria from the task (hidden from all agents)
2. **Phases 2–5** — Commanders execute without knowledge of sealed criteria
3. **Phase 6** — Validate outputs against sealed criteria, compute Shadow Score, produce Gap Report
4. **Hardening** — If score > 15%, share failure messages only (not criteria) for one fix cycle

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

shadow_scoring:
  enabled: true
  spec_version: "1.0.0"
  conformance_level: "L2"
  sealed_criteria_count: 10
  hardening:
    enabled: true
    threshold: 15
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
├── CONTRIBUTING.md                     # Contribution guidelines
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

## 🛡️ Spec Conformance

This project implements **[Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec) L2** — sealed acceptance criteria generated before execution, validated after, hardened on failure. See [docs/shadow-scoring.md](docs/shadow-scoring.md) for implementation details.

---

> **Swarm Command v1.0.0** — Powered by the SwarmSpeed 250 Protocol
> 16 models · 316 agents · Sub-linear scaling · Consensus-gated · Shadow Score Spec L2
>
> *"The swarm is smarter than any single model."* 🐝
