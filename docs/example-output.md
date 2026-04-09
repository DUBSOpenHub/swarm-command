# 📋 Example Output

This is a **representative** excerpt of what a completed Swarm Command run can look like in the Copilot CLI.

> Note: Exact timings, commander IDs, and output ordering may vary by deployment scale (SS-50 / SS-100 / SS-250) and the task.

## Representative CLI transcript (SS-100)

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

## What you typically get

A successful run usually produces:

- A synthesized, operator-friendly final bundle (not raw agent logs)
- A consensus tier per major finding (**CONSENSUS / MAJORITY / CONFLICT / UNIQUE**)
- A Shadow Score result (sealed acceptance criteria validation)

If you changed the output format, please keep this page in sync so README excerpts remain accurate.
