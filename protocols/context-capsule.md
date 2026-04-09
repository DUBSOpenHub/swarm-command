# Context Capsule Protocol

Context Capsules are the structured JSON packages that carry information between layers of the swarm hierarchy. Every output at every layer MUST validate against the appropriate schema. This document defines all 5 data structures used in the signal flow.

---

## Signal Flow Overview

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

### Compression Rules

1. **Strip rationale at each layer** — Children don't need to know *why*, only *what*
2. **File scope narrows monotonically** — A child's scope is always a subset of its parent's
3. **Constraints tighten monotonically** — Timeouts and token limits can only decrease
4. **Parent context is one sentence** — At most 50 tokens of "you are part of X doing Y"

### Aggregation Rules (Results Upward)

1. **Conflicts bubble up** — If two atoms disagree, both are preserved with a `conflict` flag until a higher layer resolves
2. **Confidence is geometric mean** — Merged confidence = (c₁ × c₂ × ... × cₙ)^(1/n)
3. **Failed atoms are replaced** — If a worker returns `status: failed`, the Squad Lead may re-launch ONE replacement worker (using its own retry budget of 1). Workers themselves have retry budget = 0.
4. **Deduplication is content-hash based** — Identical atoms from different workers are merged, confidence boosted

---

## Schema 1: Context Capsule (L0 → L1)

Sent from Nexus to each Commander. Contains the domain-specific task and constraints.

**Max size: 2048 tokens serialized**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://swarmspeed.dev/schemas/context-capsule.json",
  "title": "ContextCapsule",
  "description": "Context passed from Nexus to Commander (max 2048 tokens serialized)",
  "type": "object",
  "required": ["capsule_id", "task_brief", "domain", "constraints", "depth_config"],
  "additionalProperties": false,
  "properties": {
    "capsule_id": {
      "type": "string",
      "pattern": "^cap-[a-z0-9]{8}$",
      "description": "Unique capsule identifier"
    },
    "task_brief": {
      "type": "string",
      "maxLength": 1500,
      "description": "Full task description for this domain"
    },
    "domain": {
      "type": "string",
      "enum": ["architecture", "implementation", "testing", "documentation", "integration"]
    },
    "constraints": {
      "type": "object",
      "required": ["timeout_s", "max_workers", "token_ceiling"],
      "properties": {
        "timeout_s": { "type": "integer", "minimum": 10, "maximum": 300 },
        "max_workers": { "type": "integer", "minimum": 1, "maximum": 50 },
        "token_ceiling": { "type": "integer", "minimum": 1000, "maximum": 100000 },
        "retry_budget": { "type": "integer", "minimum": 0, "maximum": 3, "default": 1 }
      }
    },
    "depth_config": {
      "type": "object",
      "required": ["current_depth", "max_depth", "can_launch"],
      "properties": {
        "current_depth": { "type": "integer", "minimum": 0, "maximum": 4 },
        "max_depth": { "type": "integer", "const": 3 },
        "can_launch": { "type": "boolean" }
      }
    },
    "depth_budget": {
      "type": "object",
      "description": "Squad allocation budget based on domain complexity",
      "properties": {
        "squads_allocated": { "type": "integer", "minimum": 3, "maximum": 12 },
        "complexity_tier": { "type": "string", "enum": ["high", "medium", "low"] },
        "rationale": { "type": "string", "maxLength": 200 }
      }
    },
    "personality_mode": {
      "type": "string",
      "enum": ["thorough", "fast", "creative", "cautious", "balanced"],
      "default": "balanced",
      "description": "Operating posture for this run — affects worker count, timeouts, and model selection"
    },
    "prior_run_context": {
      "type": "object",
      "description": "Optional — populated on iterative/follow-up runs. Provides context from previous execution for incremental work.",
      "properties": {
        "run_id": {
          "type": "string",
          "description": "ID of the prior run this capsule is a follow-up to"
        },
        "completed_sub_tasks": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Sub-tasks completed in the prior run — commander SHOULD NOT re-do these"
        },
        "gaps_identified": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Sub-tasks that failed or were skipped in the prior run — commander MUST prioritize these"
        },
        "prior_confidence": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.0,
          "description": "Final confidence score from the prior run for this domain"
        },
        "prior_shadow_score": {
          "type": "number",
          "minimum": 0,
          "maximum": 100,
          "description": "Shadow score from the prior run — higher means more work needed"
        },
        "prior_bundle_summary": {
          "type": "string",
          "maxLength": 500,
          "description": "Compressed 1-paragraph summary of the prior run's bundle for this domain"
        }
      }
    },
    "parent_context": {
      "type": "string",
      "maxLength": 500,
      "description": "Compressed summary of parent's understanding"
    }
  }
}
```

### Example

```json
{
  "capsule_id": "cap-a1b2c3d4",
  "task_brief": "Analyze the authentication module structure. Identify all exported interfaces, data flow patterns, and module boundaries. Map dependencies between auth components.",
  "domain": "architecture",
  "constraints": {
    "timeout_s": 60,
    "max_workers": 50,
    "token_ceiling": 64000,
    "retry_budget": 1
  },
  "depth_config": {
    "current_depth": 1,
    "max_depth": 3,
    "can_launch": true
  },
  "depth_budget": {
    "squads_allocated": 10,
    "complexity_tier": "high",
    "rationale": "Architecture domain for auth refactor — high interdependency, many module boundaries"
  },
  "personality_mode": "balanced",
  "prior_run_context": null,
  "parent_context": "Nexus: refactoring auth module for microservice extraction"
}
```

---

## Schema 2: Shard (L1 → L2)

Sent from Commander to each Squad Lead. Compressed subset of the Context Capsule.

**Max size: 512 tokens serialized**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://swarmspeed.dev/schemas/shard.json",
  "title": "Shard",
  "description": "Compressed context from Commander to Squad Lead (max 512 tokens)",
  "type": "object",
  "required": ["shard_id", "parent_capsule_id", "micro_task", "depth_config"],
  "additionalProperties": false,
  "properties": {
    "shard_id": {
      "type": "string",
      "pattern": "^shd-[a-z0-9]{8}$"
    },
    "parent_capsule_id": {
      "type": "string",
      "pattern": "^cap-[a-z0-9]{8}$"
    },
    "micro_task": {
      "type": "string",
      "maxLength": 400
    },
    "file_scope": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 10,
      "description": "Files this shard may read/write"
    },
    "depth_config": {
      "type": "object",
      "required": ["current_depth", "max_depth", "can_launch"],
      "properties": {
        "current_depth": { "type": "integer", "minimum": 1, "maximum": 4 },
        "max_depth": { "type": "integer", "const": 3 },
        "can_launch": { "type": "boolean" }
      }
    }
  }
}
```

### Example

```json
{
  "shard_id": "shd-e5f6g7h8",
  "parent_capsule_id": "cap-a1b2c3d4",
  "micro_task": "Map all exported interfaces in src/auth/. List each interface name, its file, and its public methods.",
  "file_scope": ["src/auth/index.ts", "src/auth/types.ts", "src/auth/middleware.ts"],
  "depth_config": {
    "current_depth": 2,
    "max_depth": 3,
    "can_launch": true
  }
}
```

---

## Schema 3: Micro-Brief (L2 → L3)

Sent from Squad Lead to each Worker. The most compressed context — a single atomic instruction.

**Max size: 128 tokens serialized**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://swarmspeed.dev/schemas/micro-brief.json",
  "title": "MicroBrief",
  "description": "Atomic instruction for a single worker (max 128 tokens)",
  "type": "object",
  "required": ["brief_id", "instruction", "output_format"],
  "additionalProperties": false,
  "properties": {
    "brief_id": {
      "type": "string",
      "pattern": "^mbr-[a-z0-9]{8}$"
    },
    "instruction": {
      "type": "string",
      "maxLength": 100,
      "description": "Single atomic instruction"
    },
    "output_format": {
      "type": "string",
      "enum": ["atom", "file_diff", "test_result", "doc_fragment"]
    },
    "constraints": {
      "type": "object",
      "properties": {
        "timeout_s": { "type": "integer", "default": 30 },
        "max_output_tokens": { "type": "integer", "default": 256 }
      }
    }
  }
}
```

### Example

```json
{
  "brief_id": "mbr-i9j0k1l2",
  "instruction": "List all exported functions in src/auth/index.ts with their parameter types",
  "output_format": "atom",
  "constraints": {
    "timeout_s": 30,
    "max_output_tokens": 256
  }
}
```

---

## Schema 4: Result Atom (L3 → L2)

Emitted by each Worker. The atomic unit of work result.

**Max size: 256 tokens serialized**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://swarmspeed.dev/schemas/atom.json",
  "title": "ResultAtom",
  "description": "Atomic result from a worker (max 256 tokens)",
  "type": "object",
  "required": ["atom_id", "brief_id", "status", "content"],
  "additionalProperties": false,
  "properties": {
    "atom_id": {
      "type": "string",
      "pattern": "^atm-[a-z0-9]{8}$"
    },
    "brief_id": {
      "type": "string",
      "pattern": "^mbr-[a-z0-9]{8}$"
    },
    "status": {
      "type": "string",
      "enum": ["success", "partial", "failed", "timeout"]
    },
    "content": {
      "type": "string",
      "maxLength": 200
    },
    "confidence": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0
    },
    "evidence": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 3,
      "description": "File paths or URLs supporting this result"
    },
    "self_score": {
      "type": "number",
      "minimum": 0,
      "maximum": 10,
      "description": "Worker's self-assessment (used in consensus weighting)"
    }
  }
}
```

### Example

```json
{
  "atom_id": "atm-m3n4o5p6",
  "brief_id": "mbr-i9j0k1l2",
  "status": "success",
  "content": "Found 12 exported functions: authenticateUser(credentials: Credentials), refreshToken(token: string), revokeSession(sessionId: string), ...",
  "confidence": 0.92,
  "evidence": ["src/auth/index.ts"],
  "self_score": 8
}
```

---

## Schema 5: Bundle (L1 → L0)

Emitted by each Commander. The aggregated domain-level result.

**Max size: 1024 tokens serialized**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SwarmSpeed Bundle",
  "type": "object",
  "required": ["bundle_id", "domain", "commander_id", "status", "summary", "atoms_merged", "content", "confidence"],
  "properties": {
    "bundle_id": { "type": "string", "pattern": "^bnd-" },
    "domain": { "type": "string", "enum": ["architecture", "implementation", "testing", "documentation", "integration"] },
    "commander_id": { "type": "string" },
    "status": { "type": "string", "enum": ["success", "partial", "failed"] },
    "summary": { "type": "string", "maxLength": 200 },
    "atoms_merged": { "type": "integer", "minimum": 0 },
    "squad_lead_ids": { "type": "array", "items": { "type": "string" } },
    "conflicts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
          "atom_a": { "type": "string" },
          "atom_b": { "type": "string" },
          "resolution": { "type": "string" }
        }
      }
    },
    "content": { "type": "string", "description": "Main result, max 800 tokens" },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "wall_clock_s": { "type": "number" }
  }
}
```

### Example

```json
{
  "bundle_id": "bnd-cmd-arch",
  "domain": "architecture",
  "commander_id": "cmd-arch",
  "status": "success",
  "summary": "Identified 12 interfaces, 3 data flow patterns, 5 module boundaries in auth system",
  "atoms_merged": 47,
  "squad_lead_ids": ["sq-arch-01", "sq-arch-02", "sq-arch-03"],
  "conflicts": [],
  "content": "The authentication module exports 12 interfaces across 3 files...",
  "confidence": 0.87,
  "wall_clock_s": 52.3
}
```

---

## Token Budget Summary

| Structure | Direction | Max Tokens | Layer Transition |
|---|---|---|---|
| Context Capsule | Down | 2048 | Nexus → Commander |
| Shard | Down | 512 | Commander → Squad Lead |
| Micro-Brief | Down | 128 | Squad Lead → Worker |
| Result Atom | Up | 256 | Worker → Squad Lead |
| Atom Set | Up | 512 | Squad Lead → Commander |
| Bundle | Up | 1024 | Commander → Nexus |
| Final Report | Up | 4096 | Nexus → User |
| Score Card | Up | 512 | Reviewer → Nexus |

**Compression ratio: 1024:1** — From 128K tokens at Nexus to 128 tokens at Worker level.
