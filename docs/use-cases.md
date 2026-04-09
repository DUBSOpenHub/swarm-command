# 🐝 Swarm Command Use Cases

This guide turns the swarm from an impressive concept into a practical tool. Pick the outcome you want, then steal the prompt.

---

## Choose by Outcome

| If you want... | Best Scale | Start Here |
|---|---|---|
| A fast diagnosis or explanation | **SS-50** | Stack traces, single modules, one-file perf reviews |
| A serious implementation or design answer | **SS-100** | Features, refactors, architecture reviews, rollout plans |
| Maximum coverage and confidence | **SS-250** | Security, compliance, repo-wide migrations, full documentation passes |

### Reading tip

- Read **SS-50** examples if you care about speed.
- Read **SS-100** examples if you care about balanced depth.
- Read **SS-250** examples if you care about coverage and risk reduction.

---

## SS-50 — Fast Expert Panels

*~52 agents · 3 commanders · 45 workers · ~30 seconds · $1.50–$3.50*

### 1. 🔥 Stack Trace Whisperer

**Prompt:**
```text
swarm command ss-50 "Diagnose this error and give me the 3 most likely root causes with fixes:
[paste stack trace / error log]"
```

**Why it works:** one bounded failure, three parallel hypotheses, one ranked answer.

**What you get:** runtime causes, dependency/config causes, and logic/state causes synthesized into one short triage brief.

---

### 2. 🧪 Test Gap Sniper

**Prompt:**
```text
swarm command ss-50 "Analyze src/auth/ and tell me exactly what's not tested,
ranked by risk. Here's the module: [paste or reference files]"
```

**Why it works:** one module is small enough for fast parallel enumeration but large enough that single-agent coverage is often spotty.

**What you get:** a prioritized list of missing happy-path, edge-case, and integration/security tests.

---

### 3. 📦 Dependency Danger Scan

**Prompt:**
```text
swarm command ss-50 "Audit this package.json for security risks, bloat, and
better alternatives: [paste package.json]"
```

**Why it works:** the swarm can split security, overlap, and replacement analysis into parallel tracks.

**What you get:** remove-now packages, swap candidates, and “nice-to-have” simplifications.

---

### 4. 🏗️ Migration Micro-Plan

**Prompt:**
```text
swarm command ss-50 "Plan the migration of src/utils/ from JavaScript to
TypeScript. Give me the file order, type definitions needed, and breaking changes."
```

**What you get:** a dependency-ordered migration plan instead of vague advice.

---

### 5. 🔍 Explain Like I Own It

**Prompt:**
```text
swarm command ss-50 "I just inherited this codebase. Explain the architecture
of src/core/ — what does each piece do, how do they connect, and where are
the landmines?"
```

**What you get:** a new-owner briefing: structure, patterns, and hidden risks.

---

### 6. ⚡ Performance Profiler's Shortcut

**Prompt:**
```text
swarm command ss-50 "Find the performance bottlenecks in this file and give me
optimized versions with expected improvement: [paste hot-path file]"
```

**What you get:** algorithmic, runtime, and I/O bottlenecks with before/after ideas.

---

## SS-100 — Full Swarm, Default Scale

*~89 agents · 5 commanders · 75 workers · ~45 seconds · $3.50–$8.00*

### 7. 🔐 Zero-Downtime Auth Rewrite

**Prompt:**
```text
swarm command "Migrate our session auth to JWT + refresh tokens across API,
web app, DB, tests, and rollout docs"
```

**Why it works:** architecture, implementation, testing, docs, and integration each need their own owner.

**What you get:** migration plan, implementation outline, test strategy, docs changes, and rollout risks.

---

### 8. 🏗️ Legacy Service Extraction

**Prompt:**
```text
swarm command "Extract the billing module from our monolith into a service with
minimal downtime"
```

**What you get:** bounded-context map, anti-corruption layer, contract tests, and phased deployment sequence.

---

### 9. 📱 Offline Sync Feature

**Prompt:**
```text
swarm command "Design offline-first sync for our field app: local cache,
conflict resolution, API changes, UX, and tests"
```

**What you get:** data model, conflict semantics, UX states, and integration plan in one bundle.

---

### 10. 📝 PR Description Ghostwriter

**Prompt:**
```text
swarm command "Write a comprehensive PR description for this diff. Include:
summary, motivation, what changed, testing notes, and risks. [paste diff]"
```

**What you get:** a copy-paste-ready PR body with risk framing and testing guidance.

---

## SS-250 — Maximum Intelligence

*~316 agents · 5 commanders · 50 squad leads · 250 workers · ~65–90 seconds · $8.00–$16.22*

### 11. 🛡️ Zero-Day Security Sweep

**Prompt:**
```text
swarm command ss-250 "Full security audit: every file, every dependency,
every injection surface — CVSS-scored vulnerability report"
```

**What you get:** prioritized vulnerabilities, exploit paths, and remediation recommendations.

---

### 12. ⚖️ Compliance Fortress

**Prompt:**
```text
swarm command ss-250 "Audit for GDPR, HIPAA, SOC2, PCI-DSS compliance —
every gap, every control, remediation tickets"
```

**What you get:** board-ready gap summary with a remediation queue.

---

### 13. 🗺️ Living Runbook Generator

**Prompt:**
```text
swarm command ss-250 "Read every service, every pipeline, every config —
generate the complete operations manual"
```

**What you get:** runbooks, failure modes, recovery procedures, and dependency maps derived from actual artifacts.

---

## Creative Uses

### 🎭 Red-Team Jury
```text
swarm command ss-250 "Here's our public announcement. Find ways it can be misread,
exploited, or quoted out of context."
```

### 🌍 Global Name Screen
```text
swarm command "Generate 30 product name candidates. Screen for pronunciation issues
and negative associations across regions."
```

### 🏛️ Boardroom Simulation
```text
swarm command ss-50 "Act as CFO, CISO, Head of Sales, Support Lead, and a skeptical
customer. Evaluate this plan. Converge on a minimum-regret strategy."
```

---

## When NOT to Swarm

- Tiny edits with obvious answers
- Incident response where human speed beats consensus
- Tasks that demand one coherent voice instead of multiple viewpoints
- Sequential debugging sessions where the main work is interactive stepping
