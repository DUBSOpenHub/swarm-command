# 🐝 Swarm Command

**Multi-model consensus swarm orchestration for the Copilot CLI. Launch 50–250+ AI agents across 16 models with Shadow Score Spec L2 validation — from one command.**

[![GitHub](https://img.shields.io/badge/GitHub-Copilot_CLI-blue?logo=github)](https://github.com/features/copilot)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy-brightgreen?logo=github)](SECURITY.md)

> ### ⚡ One Command. That's It.
>
> **Never used the CLI before? No problem.**
>
> 1. Open your terminal
> 2. Paste this:
>    ```bash
>    curl -fsSL https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/quickstart.sh | bash
>    ```
> 3. When Copilot opens, type: `swarm command`
>
> *Requires an active [Copilot subscription](https://github.com/features/copilot/plans).*

---

## 🚀 30-Second Overview

**Swarm Command** is for tasks that are too big, risky, or cross-cutting for one model:

- **Need one answer from many perspectives?** It fans your task out across a layered swarm.
- **Need confidence, not vibes?** It uses cross-review + consensus scoring.
- **Need hidden quality checks?** It validates bundles with sealed acceptance criteria.
- **Need speed at scale?** Designed for parallel execution — agents work simultaneously, not sequentially.
- **Need zero setup?** No servers, no API keys, no build step.

If your task spans **architecture + implementation + testing + docs + integration**, this is exactly what Swarm Command is built for.

---

## 🎬 Quick Demo

### Representative CLI transcript

```text
$ copilot

> swarm command ss-100 "Document the auth system, add missing tests, and flag rollout risks"

[NEXUS] Booting SS-100 swarm...
[NEXUS] Sealing acceptance criteria (8 checks)
[CMD-ARCH] Mapping auth boundaries and module ownership
[CMD-IMPL] Tracing token issuance, refresh, and revocation flows
[CMD-TEST] Enumerating missing happy-path, edge-case, and failure-path tests
[CMD-DOCS] Drafting operator-facing docs and examples
[CMD-INTG] Checking rollout risks across API, web, DB, and monitoring
[REVIEW] Cross-family review mesh started
[SHADOW] 1 criterion failed on first pass → hardening cycle triggered
[SHADOW] Re-validated bundle: 0 critical failures remaining

✅ Final bundle ready in 47s

Top outputs:
1. Auth architecture brief with module boundaries
2. Ranked test-gap list with highest-risk paths first
3. Rollout checklist covering cookies, refresh tokens, and observability
4. Updated docs outline for onboarding + operations

Consensus: CONSENSUS on 3/4 major findings
Shadow Score: 12.5% → hardened and accepted
```

**Good first prompt:**

```text
swarm command "Map this repo, explain how the major systems fit together, and list the 5 highest-risk gaps"
```

---

## 🤔 What Is This?

**Swarm Command** is a multi-model swarm orchestration skill for the [Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli) that launches **50 to 250+ AI agents** across **16 different models** to solve complex tasks through hierarchical fan-out, cross-family review, and consensus-gated synthesis.

Give it a task — architecture, refactoring, testing, docs, or integration — and it decomposes the mission into domains, dispatches commanders, squad leads, and workers, validates outputs against sealed acceptance criteria, and synthesizes a final answer from collective intelligence instead of single-model intuition.

### 💬 The Problem

One model gives you **one perspective**.

For small tasks, that's perfect. For high-stakes tasks, it's fragile:

- the model may miss cross-cutting risks,
- the task may exceed one context window,
- the output may sound confident without being complete,
- and you have no independent check that the answer actually satisfies the mission.

Swarm Command solves that by turning one request into a **structured swarm process**: split, parallelize, review, validate, converge.

---

## 🥊 Swarm Command vs. Stampede vs. Havoc

These systems are complementary — not competitors.

| If you need to... | Use | Why |
|---|---|---|
| Solve **one complex task** with layered consensus inside your current Copilot CLI session | **Swarm Command** | Best when you want decomposition, cross-model review, shadow validation, and one synthesized answer |
| Run **parallel coding workstreams** across terminals or branches | **Stampede** | Best when the goal is execution throughput across independent task lanes |
| Run a **many-model tournament** to pressure-test ideas and rank options | **Havoc Hackathon** | Best when you want competitive ideation, elimination rounds, and judged synthesis |

**Rule of thumb:**
- Choose **Swarm Command** for **consensus execution**.
- Choose **Stampede** for **parallel implementation**.
- Choose **Havoc** for **idea tournaments and comparative judging**.

---

## ⚡ What Makes It Different

- 🐝 **True swarm** — 50 to 250+ agents, not 3–5
- 🏗️ **5-layer hierarchy** — Nexus → Commander → Squad Lead → Worker → Reviewer
- 🔀 **Cross-model diversity** — Claude + GPT families mixed within every pod
- 🗳️ **Consensus scoring** — 4-stage gate-then-rank with CONSENSUS / MAJORITY / CONFLICT tiers
- 👻 **Shadow Score** — [Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec) L2 conformance. Sealed acceptance criteria generated before commanders execute, validated after, hardened on failure.
- 🛡️ **Depth Guard** — 5 laws + 3-layer enforcement prevent runaway agent spawning
- ⚡ **Circuit breaker** — 3-state FSM with 5-level recovery escalation
- 📉 **Parallel by design** — agents execute concurrently with hierarchical fan-out and pipeline overlap
- 📦 **Zero infrastructure** — no servers, no API keys, no build step

---

## 🧠 30-Second Architecture

Before the full diagrams, here's the mental model:

1. **Nexus** reads the mission and splits it into domains.
2. **Commanders** own each domain and dispatch sub-work.
3. **Workers** do tiny atomic tasks in parallel.
4. **Reviewers + Shadow Score** decide what survives into the final answer.

```text
You ask one question
        ↓
Nexus decomposes the mission
        ↓
Commanders split by domain
        ↓
Workers execute atomic tasks in parallel
        ↓
Reviewers score + Shadow Score validates
        ↓
Nexus emits one final bundle
```

If you want the visual deep dive, jump to [docs/architecture.md](docs/architecture.md) or [docs/architecture-diagrams.md](docs/architecture-diagrams.md).

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

| Scale | Agents | Commanders | Workers | Reviewers | Best For | Wall-Clock |
|---|---|---|---|---|---|---|
| **SS-50** | ~52 | 3 | 45 | 3 | Fast bounded tasks | ~30s |
| **SS-100** | ~89 | 5 | 75 | 8 | Multi-file features and reviews | ~45s |
| **SS-250** | ~316 | 5 | 250 | 10 | Repo-wide or high-stakes work | ~65–90s |

### 10-Second Decision Tree

```text
Do you need a fast second opinion on 1–2 files?
→ SS-50

Do you need a serious answer for a multi-file feature or subsystem?
→ SS-100

Do you need repo-wide coverage, compliance-grade review, or maximum consensus?
→ SS-250
```

Default is **SS-100**. Say `swarm command ss-250` for full deployment or `swarm command ss-50` for quick tasks.

See [docs/scaling.md](docs/scaling.md) for cost breakdowns, chooser guidance, and a deeper decision matrix.

---

## 🎯 Use Cases

Curated highlights — see [docs/use-cases.md](docs/use-cases.md) for the full gallery.

### SS-50 — Fast Expert Panels (~30s)

**🔥 Stack Trace Whisperer**
```text
swarm command ss-50 "Diagnose this error — 3 most likely root causes with fixes: [paste error]"
```
> Three fast expert panels race on runtime, dependency, and logic hypotheses. You get ranked diagnoses, not a single guess.

**🔍 Explain Like I Own It**
```text
swarm command ss-50 "I just inherited this codebase. Explain src/core/ — what does each piece do, where are the landmines?"
```
> Great for onboarding: architecture map, event flow, and hidden footguns in one brief.

**⚡ Performance Profiler's Shortcut**
```text
swarm command ss-50 "Find the performance bottlenecks in this file with optimized versions: [paste hot-path file]"
```
> Ideal when you need a prioritized hit list before opening a profiler.

### SS-100 — Full Swarm, Default Scale (~45s)

**🔐 Zero-Downtime Auth Rewrite**
```text
swarm command "Migrate our session auth to JWT + refresh tokens across API, web app, DB, and tests"
```
> Architecture, implementation, testing, docs, and rollout risk all get separate ownership before synthesis.

**🏗️ Legacy Service Extraction**
```text
swarm command "Extract the billing module from our monolith into a service with minimal downtime"
```
> Produces migration phases, interface boundaries, contract tests, and rollback paths.

**📱 Offline Sync Feature**
```text
swarm command "Design offline-first sync for our field app: local cache, conflict resolution, API changes, UX, and tests"
```
> Covers data model, UX states, conflict semantics, and integration testing in parallel.

### SS-250 — Maximum Intelligence (~65–90s)

**🛡️ Zero-Day Security Sweep**
```text
swarm command ss-250 "Full security audit: every file, every dependency, every injection surface — CVSS-scored vulnerability report"
```
> Best for broad-surface analysis where missing even one category matters.

**⚖️ Compliance Fortress**
```text
swarm command ss-250 "Audit for GDPR, HIPAA, SOC2, PCI-DSS compliance — every gap, every control, remediation tickets"
```
> Turns a giant policy problem into parallel control checks with one synthesized risk summary.

**🗺️ Living Runbook Generator**
```text
swarm command ss-250 "Read every service, every pipeline, every config — generate the complete operations manual"
```
> Excellent when tribal knowledge has to become documentation fast.

### ❌ When NOT to Swarm

- **"What's the CLI flag for X?"** → Ask a single agent
- **Rename one variable** → Manual edit or single agent
- **Prod is down and seconds matter** → Follow the human runbook first
- **Writing a single-voice email** → One persona is better than a committee
- **Step-through debugging** → Sequential work beats consensus here

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

**Verify integrity (optional):**

```bash
# macOS
shasum -a 256 ~/.copilot/skills/swarm-command/SKILL.md
shasum -a 256 ~/.copilot/agents/swarm-command.agent.md

# Linux
sha256sum ~/.copilot/skills/swarm-command/SKILL.md
sha256sum ~/.copilot/agents/swarm-command.agent.md
```

> Compare the output against the checksums published on the [latest release page](https://github.com/DUBSOpenHub/swarm-command/releases/latest).

> 💡 **Security note:** We recommend [inspecting quickstart.sh](https://github.com/DUBSOpenHub/swarm-command/blob/main/quickstart.sh) before piping to bash. You can also use the manual install above instead.

### Clone & Explore

```bash
git clone https://github.com/DUBSOpenHub/swarm-command.git
cd swarm-command
chmod +x quickstart.sh && ./quickstart.sh
```

---

## 🧭 Reading Order / Learning Path

If you're new, read in this order:

1. **This README** — what it is, when to use it, and how to run it
2. [**docs/learning-path.md**](docs/learning-path.md) — beginner, operator, and architect reading tracks
3. [**docs/architecture.md**](docs/architecture.md) — the conceptual system model
4. [**docs/scaling.md**](docs/scaling.md) — which scale to choose and what it costs
5. [**docs/use-cases.md**](docs/use-cases.md) — vivid prompts and expected outcomes
6. [**docs/consensus.md**](docs/consensus.md) + [**docs/shadow-scoring.md**](docs/shadow-scoring.md) — the deep mechanics

### Fast paths

- **I just want to try it:** README → install → quick demo
- **I want to operate it well:** README → learning path → scaling → use cases
- **I want to understand the design:** README → architecture → consensus → shadow scoring

---

## ❓ FAQ

### Do I need API keys or infrastructure?
No. Swarm Command runs through your active Copilot subscription. No separate servers, queues, or key management required.

### When should I use SS-50, SS-100, or SS-250?
Use **SS-50** for bounded, fast tasks. Use **SS-100** for most real software work. Use **SS-250** when the task is repo-wide, high-stakes, or needs maximum coverage and consensus.

### Why mix Claude and GPT models?
Because diversity helps. Different model families catch different failure modes. Swarm Command intentionally mixes them so agreement means more than self-consistency.

### What happens when agents disagree?
Disagreement is preserved, scored, and escalated. Squad Leads and Commanders mark results as **CONSENSUS**, **MAJORITY**, **CONFLICT**, or **UNIQUE**, then Nexus arbitrates the unresolved pieces.

### What is Shadow Score in one sentence?
It is a hidden acceptance test: criteria are generated before execution, kept sealed from the swarm, then used to validate outputs afterward.

### Will this write code automatically?
It can produce plans, analyses, patches, documentation, tests, and rollout guidance depending on how you invoke it — but the point is not blind automation. The point is **reviewable, consensus-backed output**.

### When should I avoid using it?
Avoid it for tiny edits, urgent incident response where every second matters, or tasks that need one strong voice rather than many perspectives.

---

## 🛠️ How It Was Built

Swarm Command came out of a simple question: **what if one Copilot CLI session could behave less like one assistant and more like a disciplined organization?**

The design evolved from **SwarmSpeed 250** experiments into a layered system with:

- a single **Nexus** orchestrator,
- domain-owning **Commanders**,
- decomposing **Squad Leads**,
- leaf-node **Workers**,
- and independent **Reviewers**.

The turning point was a self-analysis run later documented in [docs/shadow-scoring.md](docs/shadow-scoring.md): sealed judges rated a design highly **even though it contained critical arithmetic errors**. That exposed a core truth of multi-agent systems: **review alone is not validation**.

That failure drove the big ideas that now define this repo:

- **Shadow scoring** so hidden criteria can catch what the swarm forgot to optimize for
- **Depth Guard** so recursion never turns into agent explosion
- **Token compression** so higher-level intent survives while lower layers stay cheap
- **Cross-family review** so agreement means more than “the same model said it twice”

In other words: Swarm Command is not just a big swarm. It is a swarm that learned from its own failure modes.

---

## 📋 Example Output

See what a completed swarm run looks like → **[Example Output](docs/example-output.md)**

```
🐝 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   S W A R M   C O M P L E T E
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Results Summary
- Domains completed: 5/5
- Consensus tier: CONSENSUS (4) · MAJORITY (1)
- Overall confidence: 0.77
- Agents deployed: 123
- Wall-clock time: 4m 32s
- Shadow Score: 80% GREEN (10 pass · 3 warn · 2 fail)
```

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

**Sealed-envelope protocol:**
1. **Phase 1.5** — Nexus generates sealed acceptance criteria from the task
2. **Phases 2–5** — Commanders execute without seeing those criteria
3. **Phase 6** — Validate outputs, compute Shadow Score, produce Gap Report
4. **Hardening** — If score > 15%, share failure messages only for one fix cycle

See [docs/shadow-scoring.md](docs/shadow-scoring.md) for the full protocol.

---

## 🗳️ Consensus Algorithm

A 4-stage consensus pipeline merges the best work from hundreds of agents:

1. **Worker Self-Score** — Each worker emits confidence + self-score with its atom
2. **Squad Lead Local Merge** — Groups atoms by sub-task, classifies as CONSENSUS / MAJORITY / CONFLICT
3. **Commander Domain Merge** — Trimmed mean across squads, applies the consensus formula
4. **Nexus Cross-Domain Synthesis** — Median-of-3 judging and final arbitration

**Consensus formula:**
```text
score = 0.40 × confidence + 0.30 × evidence + 0.15 × scope + 0.15 × coverage − min(0.10, conflict_rate × 0.10)
```

| Tier | Condition | Action |
|---|---|---|
| **CONSENSUS** | ≥ 70% agreement | Auto-accept |
| **MAJORITY** | ≥ 50% agreement | Accept with dissent note |
| **CONFLICT** | < 50% agreement | Nexus arbitration |
| **UNIQUE** | No overlap | Keep if evidence ≥ 7/10 |

See [docs/consensus.md](docs/consensus.md) for the full mechanics.

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
  timeout_cascade: [90, 60, 40, 30]

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
|---|---|
| **Nexus** | claude-opus-4.6 |
| **Commanders** (pool: 10) | claude-opus-4.6, claude-opus-4.5, claude-opus-4.6-1m, claude-sonnet-4.6, claude-sonnet-4.5, claude-sonnet-4, gpt-5.4, gpt-5.2, gpt-5.1, goldeneye |
| **Squad Leads** | claude-haiku-4.5, gpt-5.4-mini |
| **Workers** (pool: 6) | claude-haiku-4.5, gpt-5.4-mini, gpt-5-mini, gpt-4.1, gpt-5.3-codex, gpt-5.2-codex |
| **Reviewers** (8 pairs) | claude-opus-4.6↔gpt-5.4, claude-opus-4.5↔gpt-5.2, claude-opus-4.6-1m↔gpt-5.1, claude-sonnet-4.6↔gpt-5.3-codex, claude-sonnet-4.5↔gpt-5.2-codex, claude-sonnet-4↔gpt-5.4-mini, claude-haiku-4.5↔gpt-5-mini, goldeneye↔gpt-4.1 |

---

## 📁 Repository Structure

```text
swarm-command/
├── README.md                           # Overview, install, quick demo, FAQ
├── AGENTS.md                           # Agent/skill descriptions
├── CONTRIBUTING.md                     # Contribution guidelines
├── catalog.yml                         # Skill metadata
├── config.yml                          # All tunables
├── LICENSE                             # MIT
├── SECURITY.md                         # Security policy
├── quickstart.sh                       # One-line installer
├── .github/
│   ├── copilot-instructions.md         # AI agent instructions for this repo
│   ├── workflows/ci.yml               # CI: YAML lint + SKILL.md sync check
│   └── skills/swarm-command/SKILL.md   # Skill discovery path
├── agents/
│   └── swarm-command.agent.md          # Standalone agent version
├── skills/swarm-command/
│   └── SKILL.md                        # Core skill
├── templates/
│   ├── commander.md                    # Commander prompt template
│   ├── worker.md                       # Worker prompt template
│   ├── reviewer.md                     # Cross-reviewer prompt template
│   └── squad-lead.md                   # Squad lead prompt template
├── protocols/
│   ├── depth-guard.md                  # 5 Laws + 3-layer enforcement
│   ├── circuit-breaker.md              # 3-state FSM + 5-level recovery
│   ├── context-capsule.md              # JSON schemas for data structures
│   └── meta-reviewer.md                # Meta-review protocol
└── docs/
    ├── architecture.md                 # Architecture overview
    ├── architecture-diagrams.md        # Mermaid diagrams
    ├── consensus.md                    # Consensus algorithm deep dive
    ├── example-output.md               # Sample completed swarm run output
    ├── learning-path.md                # Recommended reading order
    ├── scaling.md                      # Scale chooser + cost estimates
    ├── shadow-scoring.md               # Shadow scoring protocol
    └── use-cases.md                    # Expanded prompt gallery
```

---

## 📄 License

[MIT](LICENSE) — use it, fork it, build on it.

---

## 🛡️ Spec Conformance

This project implements **[Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec) L2** — sealed acceptance criteria generated before execution, validated after, hardened on failure.

---

🐙 Created with 💜 by [@DUBSOpenHub](https://github.com/DUBSOpenHub) with the [GitHub Copilot CLI](https://docs.github.com/copilot).
