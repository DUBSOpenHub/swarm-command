# 🐝 Swarm Command SS-50: The 10 Best Use Cases

*~52 agents · 3 commanders · 45 workers · ~30 seconds · $1.50–$3.50*

---

## 1. 🔥 The Stack Trace Whisperer

**Prompt:**
```
swarm command ss-50 "Diagnose this error and give me the 3 most likely root causes with fixes:
[paste stack trace / error log]"
```

**Why SS-50:** A single error has a bounded solution space. You don't need 250 agents debating — you need 3 fast expert panels (runtime analysis, dependency conflicts, environment issues) racing to the answer. Speed is everything when prod is down.

**What happens:**
- **Commander 1 (Language/Runtime):** 15 workers parse the stack trace, match against known runtime error patterns, analyze frame ordering, and check for version-specific bugs.
- **Commander 2 (Dependency/Config):** 15 workers investigate package version conflicts, missing env vars, config mismatches, and transitive dependency issues suggested by the trace.
- **Commander 3 (Logic/State):** 15 workers analyze the code path implied by the trace — race conditions, null states, type coercion traps, off-by-one errors.
- All 3 commanders synthesize into a ranked diagnosis in ~25 seconds.

**Example output:**
```
🔴 ROOT CAUSE #1 (87% confidence, 38/45 workers agree):
   Race condition in ConnectionPool.acquire() — the async lock on L142 doesn't
   cover the validation check on L147. Under load, a stale connection escapes
   the pool before health-check completes.
   → FIX: Extend the lock scope to wrap lines 142-151, or use acquire_with_check().

🟡 ROOT CAUSE #2 (64% confidence, 29/45 workers):
   PostgreSQL idle_in_transaction_session_timeout (default 0) is letting zombie
   connections persist. The pool recycles them but pg has already marked them dead.
   → FIX: SET idle_in_transaction_session_timeout = '30s' in your pg config.

🟠 ROOT CAUSE #3 (41% confidence, 18/45 workers):
   The asyncpg v0.29.0 → 0.30.0 upgrade changed connection cleanup semantics.
   Your pool config assumes the old behavior.
   → FIX: Pin asyncpg==0.29.0 or update pool teardown to call .terminate() not .close().
```

---

## 2. 🧪 Test Gap Sniper

**Prompt:**
```
swarm command ss-50 "Analyze src/auth/ and tell me exactly what's not tested,
ranked by risk. Here's the module: [paste or reference files]"
```

**Why SS-50:** A single module has finite surface area. 3 commanders can cover the three testing dimensions (unit/integration/edge-case) simultaneously. You don't need massive consensus — you need fast, thorough enumeration.

**What happens:**
- **Commander 1 (Happy Path Gaps):** 15 workers map every public function/method against existing tests, flagging any function with zero coverage or only trivial assertions.
- **Commander 2 (Edge Case & Error Path):** 15 workers analyze every branch, throw/catch, boundary condition, and null-check — then cross-reference against test suites for missing negative tests.
- **Commander 3 (Integration & Security):** 15 workers examine cross-module calls, auth flows, input validation, and data flow boundaries that need integration-level testing.
- Merged into a single prioritized punch list.

**Example output:**
```
🧪 TEST GAP ANALYSIS: src/auth/ (14 files, 847 lines)
   Coverage estimate: 61% line, 43% branch

   🔴 CRITICAL (write these today):
   1. refreshToken() — zero tests. Handles token rotation, revocation, and
      race conditions. 12 code paths, 0 tested. Risk: token reuse attacks.
   2. validateSession() L89-L103 — the Redis timeout fallback path is never
      exercised. If Redis is down, this silently returns `true` for all sessions.
   3. hashPassword() — tested with valid input only. No tests for: empty string,
      unicode passwords, strings > 72 bytes (bcrypt truncation).

   🟡 HIGH (this sprint):
   4. middleware/requireAuth.js — tested in isolation but never with expired tokens.
   5. OAuth callback handler — no test for state parameter mismatch (CSRF vector).
```

---

## 3. 📦 Dependency Danger Scan

**Prompt:**
```
swarm command ss-50 "Audit this package.json for security risks, bloat, and
better alternatives: [paste package.json]"
```

**Why SS-50:** A typical package.json has 20-60 dependencies — well within scope for 45 workers to each deeply analyze 1-3 packages. You want speed because you're evaluating this *before* you `npm install`, not after.

**What happens:**
- **Commander 1 (Security):** 15 workers each take a subset of packages and check for known CVEs, unmaintained status (last publish > 12 months), suspicious install scripts, and supply-chain risk indicators.
- **Commander 2 (Bloat & Overlap):** 15 workers analyze bundle size impact, identify packages that duplicate functionality (e.g., `lodash` + `underscore`), flag dev dependencies incorrectly in `dependencies`, and spot packages with massive transitive trees.
- **Commander 3 (Better Alternatives):** 15 workers evaluate each dependency against modern alternatives — smaller, faster, better-maintained, or natively supported in your Node version.
- Final report: a single prioritized action list.

**Example output:**
```
📦 DEPENDENCY AUDIT: 47 packages analyzed in 28 seconds

   🔴 REMOVE NOW:
   • event-stream@3.3.6 — compromised package (CVE-2018-16396), flatmap-stream
     malware. You're pulling it transitively via [email protected].
     → FIX: Upgrade ps-tree to ^1.2.0 or switch to tree-kill.

   🟡 SWAP THESE:
   • moment@2.29.4 (324KB) → dayjs@1.11.10 (7KB). Drop-in API compatible.
     You use: .format(), .diff(), .add(). All supported in dayjs.
   • request@2.88.2 — DEPRECATED since Feb 2020. 49 transitive deps.
     → Use native fetch() (Node 18+) or undici. You're already on Node 20.

   🟢 NICE-TO-HAVE:
   • lodash@4.17.21 — you import 3 functions. Replace with lodash-es individual
     imports to save ~68KB from your bundle.
```

---

## 4. 🏗️ Migration Micro-Plan

**Prompt:**
```
swarm command ss-50 "Plan the migration of src/utils/ from JavaScript to
TypeScript. Give me the exact file order, type definitions needed, and
breaking changes. [paste directory listing + key files]"
```

**Why SS-50:** One directory. Bounded scope. You need a precise execution plan, not a philosophical debate about TypeScript. 3 commanders can cover files, types, and downstream impact in parallel.

**What happens:**
- **Commander 1 (File Dependency Graph):** 15 workers trace imports/exports across every file in src/utils/, build a dependency DAG, and determine the exact migration order (leaves first) to avoid circular type issues.
- **Commander 2 (Type Inference):** 15 workers analyze each function signature, return type, and usage pattern to draft the type definitions needed — interfaces, enums, generics, union types.
- **Commander 3 (Breaking Changes):** 15 workers scan every consumer of src/utils/ across the codebase, identifying call sites that will break with strict types — implicit `any`, wrong argument counts, duck-typed objects.
- Merged into a step-by-step execution plan.

**Example output:**
```
📋 MIGRATION PLAN: src/utils/ (23 files, JS → TS)
   Estimated effort: 4-6 hours for a senior dev

   PHASE 1 — Leaf nodes (no internal imports, migrate first):
     1. src/utils/constants.js → .ts (trivial, just add `as const`)
     2. src/utils/formatters.js → .ts (needs: DateFormat enum, Currency type)
     3. src/utils/validators.js → .ts (needs: ValidationResult interface)

   PHASE 2 — Mid-tier (import from Phase 1 only):
     4. src/utils/api-helpers.js → .ts (needs: RequestConfig, ApiResponse<T> generic)
     ...

   ⚠️ BREAKING CHANGES (7 found):
   • parseConfig() returns `any` — 14 call sites assume different shapes.
     → Define: interface AppConfig { db: DbConfig; cache: CacheConfig; ... }
   • formatDate() accepts (string | Date | number) implicitly — 3 call sites
     pass epoch-millisecond numbers, which will fail strict Date typing.
```

---

## 5. 🔍 "Explain Like I Own It"

**Prompt:**
```
swarm command ss-50 "I just inherited this codebase. Explain the architecture
of src/core/ — what does each piece do, how do they connect, and where are
the landmines? [paste directory tree + key files]"
```

**Why SS-50:** Understanding, not building. You need fast multi-angle analysis of a bounded codebase area. Perfect for onboarding onto a new team or repo. 30 seconds beats 3 hours of reading.

**What happens:**
- **Commander 1 (Structure & Flow):** 15 workers map the module architecture — entry points, data flow, control flow, dependency relationships. Produces a mental model.
- **Commander 2 (Patterns & Conventions):** 15 workers identify the design patterns in use (factory, observer, middleware chain, etc.), the coding conventions, and any framework-specific idioms. Explains *why* the code is shaped this way.
- **Commander 3 (Landmines & Tech Debt):** 15 workers hunt for: TODO/FIXME/HACK comments, dead code, circular dependencies, implicit assumptions, global state mutations, brittle coupling, and undocumented side effects.
- Synthesized into a "new developer briefing."

**Example output:**
```
🏛️ ARCHITECTURE BRIEF: src/core/ (31 files)

   MENTAL MODEL:
   Request → Router → Middleware Chain → Controller → Service → Repository → DB
   (classic layered architecture, but Services also emit events via EventBus)

   KEY INSIGHT: The EventBus (src/core/events.js) is the hidden backbone.
   7 of 12 services publish events, and 4 subscribe. Nothing documents which
   events exist. grep for `bus.emit(` to find them — there are 23 event types.

   🚨 LANDMINES:
   1. UserService.delete() doesn't emit 'user.deleted' — but BillingService
      subscribes to it. Deleting a user leaves orphaned billing records.
   2. src/core/cache.js uses a module-level Map() — this is process-local.
      In production with 4 workers, each has a different cache. This explains
      the "stale data" bugs in the issue tracker.
   3. DatabasePool (L47) silently swallows connection errors and returns null.
      Every repository has `if (!conn) return undefined` — callers don't check.
```

---

## 6. ⚡ Performance Profiler's Shortcut

**Prompt:**
```
swarm command ss-50 "Find the performance bottlenecks in this file and give me
optimized versions with expected improvement: [paste hot-path file, ~200-500 lines]"
```

**Why SS-50:** One file. Performance analysis is inherently parallelizable — each worker can independently analyze a different function or pattern. You want this *before* breaking out the flame graph.

**What happens:**
- **Commander 1 (Algorithmic):** 15 workers analyze time complexity of every loop, recursion, and data structure operation. Flags O(n²) hidden inside O(n) loops, unnecessary re-computation, missing memoization.
- **Commander 2 (Runtime/Engine):** 15 workers check for JS engine deopt triggers, memory allocation patterns, GC pressure points, unnecessary closures, megamorphic call sites, and hidden class transitions.
- **Commander 3 (I/O & Async):** 15 workers examine database queries inside loops, sequential awaits that could be parallel, unbatched API calls, missing connection pooling, and stream backpressure issues.
- Each bottleneck gets a before/after code snippet with estimated improvement.

**Example output:**
```
⚡ PERFORMANCE ANALYSIS: processOrders.js (387 lines, 6 bottlenecks found)

   🔴 #1 — O(n²) hidden in getMatchingProducts() [L145-L162]
   You're calling products.find() inside an orders.forEach(). With 10K orders
   and 5K products, that's 50M comparisons.
   → FIX: Build a Map<productId, Product> before the loop. O(n) → O(1) lookup.
   → EXPECTED: 10K orders drops from ~1200ms to ~15ms (80x improvement).

   🔴 #2 — Sequential DB queries in enrichOrderData() [L201-L230]
   You await 3 queries in sequence: getUser(), getShipping(), getPayment().
   These are independent.
   → FIX: Promise.all([getUser(id), getShipping(id), getPayment(id)])
   → EXPECTED: ~300ms → ~110ms (latency of slowest query, not sum).
```

---

## 7. 📝 PR Description Ghostwriter

**Prompt:**
```
swarm command ss-50 "Write a comprehensive PR description for this diff.
Include: summary, motivation, what changed, testing notes, and risks.
[paste git diff or provide branch ref]"
```

**Why SS-50:** A single diff is bounded content. 3 commanders can analyze the *what*, *why*, and *risk* simultaneously. You're blocking on PR review — 30 seconds to a perfect description unblocks the whole team.

**What happens:**
- **Commander 1 (What Changed):** 15 workers decompose the diff file-by-file, categorize changes (new feature, refactor, bugfix, config), identify the key behavioral changes vs. cosmetic changes.
- **Commander 2 (Why & Context):** 15 workers infer motivation from the changes — what bug was this fixing? what feature does this enable? what tech debt does this address? Cross-references patterns against common scenarios.
- **Commander 3 (Risk & Testing):** 15 workers identify: what could break, what needs manual testing, what edge cases exist, what rollback would look like, and what monitoring to watch post-deploy.
- Synthesized into a copy-paste-ready PR description.

**Example output:**
```
## Summary
Replaces the synchronous file-processing pipeline in `ImportService` with a
streaming architecture using Node.js Transform streams. Eliminates the 512MB
memory spike on large CSV imports (fixes #847).

## What Changed
- **src/services/import.js**: Rewrote `processFile()` from `readFileSync` +
  array operations to a `pipeline(createReadStream, csvParser, transformer,
  dbWriter)` chain. Memory usage is now O(1) regardless of file size.
- **src/services/import.test.js**: Added 3 tests for backpressure handling,
  malformed row recovery, and stream error propagation.
- **package.json**: Added `csv-parser@3.0.0` (4KB, no transitive deps).

## Risks
- ⚠️ Error semantics changed: previously, a bad row aborted the entire import.
  Now it skips bad rows and logs them. Verify this matches product requirements.
- The `onComplete` callback now fires asynchronously — check if any callers
  depend on synchronous completion.
```

---

## 8. 🛡️ Single-File Security Audit

**Prompt:**
```
swarm command ss-50 "Deep security audit of this file. Find every vulnerability,
injection vector, and auth bypass. Be paranoid. [paste auth.js or similar critical file]"
```

**Why SS-50:** One file, maximum depth. You want 45 paranoid security reviewers examining every line from different attack perspectives — but the bounded scope means you don't need 250. Speed matters because this is blocking your deploy.

**What happens:**
- **Commander 1 (Injection & Input):** 15 workers examine every input path — SQL injection, XSS, command injection, path traversal, SSRF, template injection, header injection. Tests each input for sanitization completeness.
- **Commander 2 (Auth & Access):** 15 workers trace every authentication check, authorization gate, session handling pattern, token validation, and privilege escalation path. Looks for: IDOR, broken access control, JWT misuse, timing attacks.
- **Commander 3 (Crypto & Data):** 15 workers audit cryptographic usage (weak algorithms, hardcoded secrets, predictable randomness), sensitive data handling (logging PII, missing encryption at rest), and information leakage (verbose errors, stack traces in responses).
- Findings rated by CVSS-like severity.

**Example output:**
```
🛡️ SECURITY AUDIT: auth.js (247 lines, 5 findings)

   🔴 CRITICAL — JWT Secret in Environment Without Fallback [L12]
   `const SECRET = process.env.JWT_SECRET || 'development-secret'`
   If JWT_SECRET is unset in production, every token is signed with a known key.
   → FIX: Throw on startup if JWT_SECRET is missing in production.
   → IMPACT: Full authentication bypass. Any attacker can forge valid tokens.

   🔴 HIGH — Timing Attack on Token Comparison [L89]
   `if (token === storedToken)` uses JS string equality (short-circuits on
   first different byte). Vulnerable to timing-based brute force.
   → FIX: Use crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken))

   🟡 MEDIUM — No Rate Limiting on /auth/reset-password [L156]
   Endpoint accepts email, triggers password reset. No rate limit = email bombing
   and account enumeration via response timing differences.
```

---

## 9. 📊 "What Does This Regex Actually Do?"

**Prompt:**
```
swarm command ss-50 "Explain this regex, find the edge cases it misses, and
give me a better version with tests:
/^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/"
```

**Why SS-50:** Regex is the *perfect* SS-50 task. Bounded input, high complexity, embarrassingly parallelizable analysis. Each worker can independently test different input categories. 45 workers generate hundreds of test cases in seconds.

**What happens:**
- **Commander 1 (Explanation):** 15 workers decompose the regex into a human-readable explanation, annotate each capture group, quantifier, and alternation. Produces both a plain-English summary and a railroad diagram description.
- **Commander 2 (Edge Cases):** 15 workers independently generate adversarial inputs — leading zeros, overflow values, unicode digits, whitespace injection, IPv4-mapped IPv6, CIDR notation, surrounding text, ReDoS patterns. Each worker attacks from a different angle.
- **Commander 3 (Better Version):** 15 workers each write an improved regex (or suggest using a library), then the commander picks the best one, adds named groups, and generates a test suite.
- Merged into a complete "regex dossier."

**Example output:**
```
🔍 REGEX ANALYSIS: IPv4 Address Validator

   PLAIN ENGLISH: Matches strings that look like four decimal octets (0-255)
   separated by dots. Anchored to start/end so no surrounding text is allowed.

   ❌ EDGE CASES IT MISSES (11 found):
   • "01.02.03.04" → MATCHES (but leading zeros are technically illegal in
     strict IPv4 — they indicate octal in some parsers. 0177.0.0.1 = 127.0.0.1)
   • "255.255.255.255 " → correctly rejects (trailing space)
   • ReDoS risk: LOW (no nested quantifiers, linear backtracking)

   ✅ IMPROVED VERSION:
   /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/
   Changes: Rejects leading zeros. Clearer alternation ordering.

   🧪 TEST SUITE (22 cases): [attached]
```

---

## 10. 🎯 API Contract Reviewer

**Prompt:**
```
swarm command ss-50 "Review this API endpoint design for consistency, REST best
practices, edge cases, and DX issues. Suggest the ideal request/response contract.
[paste route handler, OpenAPI spec, or endpoint description]"
```

**Why SS-50:** One endpoint = bounded scope. But API design has many dimensions (naming, status codes, pagination, error format, versioning, idempotency) that parallelize beautifully across 45 workers. You want this *before* anyone builds a client against it.

**What happens:**
- **Commander 1 (REST & Standards):** 15 workers audit against REST conventions — HTTP method semantics, status code correctness, content-type headers, URL naming (plural nouns, no verbs), idempotency guarantees, HATEOAS links.
- **Commander 2 (Edge Cases & Errors):** 15 workers probe: what happens with empty body? duplicate request? partial failure? huge payload? missing auth? wrong content-type? Each worker constructs a specific failure scenario the endpoint should handle.
- **Commander 3 (Developer Experience):** 15 workers evaluate from the client dev's perspective — is the response shape predictable? are error messages actionable? is pagination cursor-based or offset-based? are fields consistently named (camelCase vs snake_case)? is the endpoint discoverable?
- Merged into a single "API design review" with a suggested ideal contract.

**Example output:**
```
🎯 API REVIEW: POST /api/users/search

   🔴 ISSUE: POST for a read operation violates REST semantics.
   → Use GET /api/users?q=term&role=admin&page=2 for simple searches.
   → If the query body is genuinely too complex for query params (nested
     filters, saved searches), POST /api/users/search is acceptable — but
     document why and make it idempotent.

   🟡 ISSUES:
   • Response returns raw DB rows (includes `password_hash`, `internal_notes`).
     → Define a UserSummary DTO: { id, name, email, role, createdAt }
   • Error response is { error: true, message: "..." } — not machine-parseable.
     → Use RFC 7807: { type, title, status, detail, instance }
   • No pagination metadata. Clients can't know if there are more results.
     → Add: { data: [...], meta: { total, page, perPage, nextCursor } }

   ✅ SUGGESTED CONTRACT:
   GET /api/v1/users?q=jane&role=admin&limit=20&cursor=eyJpZCI6MTAw
   → 200: { data: UserSummary[], meta: { total, nextCursor, prevCursor } }
   → 400: { type: "/errors/invalid-query", title: "Bad Request", detail: "..." }
```

---

## Summary: The SS-50 Sweet Spot

| # | Use Case | Time | Cost | Key Insight |
|---|----------|------|------|-------------|
| 1 | Stack Trace Whisperer | ~25s | ~$1.50 | 3 diagnostic angles simultaneously |
| 2 | Test Gap Sniper | ~30s | ~$2.00 | Enumerate every untested path fast |
| 3 | Dependency Danger Scan | ~28s | ~$2.50 | 1 worker per package = perfect parallelism |
| 4 | Migration Micro-Plan | ~30s | ~$2.00 | Files + types + breakage in parallel |
| 5 | Explain Like I Own It | ~25s | ~$1.50 | Onboard to a module in 30 seconds |
| 6 | Performance Profiler | ~30s | ~$2.50 | Algo + engine + I/O analysis at once |
| 7 | PR Description Ghostwriter | ~20s | ~$1.50 | Unblocks review, perfect every time |
| 8 | Single-File Security Audit | ~30s | ~$3.00 | 45 paranoid reviewers, one file |
| 9 | Regex Whisperer | ~25s | ~$1.50 | Embarrassingly parallel test generation |
| 10 | API Contract Reviewer | ~28s | ~$2.00 | REST + edge cases + DX in parallel |

**The pattern:** SS-50 excels when the *input is bounded* but the *analysis dimensions are many*. One file, but 45 perspectives. One error, but 3 diagnostic frameworks. One regex, but hundreds of edge cases. That's where 52 agents in 30 seconds beats one agent in 5 minutes.