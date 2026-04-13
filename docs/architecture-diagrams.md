# 🐝 Swarm Command — Architecture Diagrams

## System Overview

```mermaid
graph TB
    subgraph L0["🧠 L0 — NEXUS (1 agent)"]
        NEXUS["NEXUS ORCHESTRATOR<br/>general-purpose · Opus 4.6<br/>128K context · depth=0"]
    end

    subgraph L1["⚔️ L1 — COMMANDERS (5 agents)"]
        CMD_A["CMD-A<br/>Architecture<br/>Opus 4.6"]
        CMD_B["CMD-B<br/>Implementation<br/>Sonnet 4.6"]
        CMD_C["CMD-C<br/>Testing<br/>GPT-5.4"]
        CMD_D["CMD-D<br/>Documentation<br/>GPT-5.2"]
        CMD_E["CMD-E<br/>Integration<br/>Sonnet 4.5"]
    end

    subgraph L2["🎖️ L2 — SQUAD LEADS (50 agents)"]
        SQ1["SQ-1..10<br/>Haiku 4.5"]
        SQ2["SQ-11..20<br/>Haiku 4.5"]
        SQ3["SQ-21..30<br/>Haiku 4.5"]
        SQ4["SQ-31..40<br/>Haiku 4.5"]
        SQ5["SQ-41..50<br/>Haiku 4.5"]
    end

    subgraph L3["🐝 L3 — WORKERS (250 agents)"]
        W1["Workers 1-50<br/>explore · Haiku/Mini"]
        W2["Workers 51-100<br/>explore · Haiku/Mini"]
        W3["Workers 101-150<br/>task · Codex/Mini"]
        W4["Workers 151-200<br/>explore · Haiku/Mini"]
        W5["Workers 201-250<br/>task · Codex/Mini"]
    end

    subgraph L4["🔍 L4 — REVIEWERS (10 agents)"]
        REV["Cross-Review Mesh<br/>5 Claude↔GPT pairs<br/>general-purpose"]
    end

    subgraph SHADOW["👻 SHADOW SCORING (Nexus-internal, Shadow Score Spec L2)"]
        SHD["Sealed Acceptance Criteria<br/>Generated Phase 1.5 (Nexus)<br/>Validated Phase 6 (Nexus)<br/>No separate agents spawned"]
    end

    NEXUS -->|"Context Capsule<br/>2K tokens"| CMD_A
    NEXUS -->|"Context Capsule<br/>2K tokens"| CMD_B
    NEXUS -->|"Context Capsule<br/>2K tokens"| CMD_C
    NEXUS -->|"Context Capsule<br/>2K tokens"| CMD_D
    NEXUS -->|"Context Capsule<br/>2K tokens"| CMD_E

    CMD_A -->|"Shard · 512 tok"| SQ1
    CMD_B -->|"Shard · 512 tok"| SQ2
    CMD_C -->|"Shard · 512 tok"| SQ3
    CMD_D -->|"Shard · 512 tok"| SQ4
    CMD_E -->|"Shard · 512 tok"| SQ5

    SQ1 -->|"Micro-Brief<br/>128 tok"| W1
    SQ2 -->|"Micro-Brief<br/>128 tok"| W2
    SQ3 -->|"Micro-Brief<br/>128 tok"| W3
    SQ4 -->|"Micro-Brief<br/>128 tok"| W4
    SQ5 -->|"Micro-Brief<br/>128 tok"| W5

    W1 -->|"Atom · 256 tok"| SQ1
    W2 -->|"Atom · 256 tok"| SQ2
    W3 -->|"Atom · 256 tok"| SQ3
    W4 -->|"Atom · 256 tok"| SQ4
    W5 -->|"Atom · 256 tok"| SQ5

    SQ1 -->|"Bundle · 1K tok"| CMD_A
    SQ2 -->|"Bundle · 1K tok"| CMD_B
    SQ3 -->|"Bundle · 1K tok"| CMD_C
    SQ4 -->|"Bundle · 1K tok"| CMD_D
    SQ5 -->|"Bundle · 1K tok"| CMD_E

    CMD_A -->|"Report · 4K tok"| REV
    CMD_B -->|"Report · 4K tok"| REV
    CMD_C -->|"Report · 4K tok"| REV
    CMD_D -->|"Report · 4K tok"| REV
    CMD_E -->|"Report · 4K tok"| REV

    REV -->|"Score Cards"| NEXUS
    CMD_A -->|"Report"| NEXUS
    CMD_B -->|"Report"| NEXUS
    CMD_C -->|"Report"| NEXUS
    CMD_D -->|"Report"| NEXUS
    CMD_E -->|"Report"| NEXUS

    NEXUS -.->|"Phase 1.5:<br/>Seal criteria"| SHD
    NEXUS -.->|"Phase 6:<br/>Validate bundles<br/>against sealed criteria"| SHD
    SHD -.->|"Gap Reports<br/>+ Hardening"| NEXUS

    style L0 fill:#1a1a2e,stroke:#e94560,color:#fff
    style L1 fill:#16213e,stroke:#0f3460,color:#fff
    style L2 fill:#0f3460,stroke:#533483,color:#fff
    style L3 fill:#533483,stroke:#e94560,color:#fff
    style L4 fill:#2d4059,stroke:#ea5455,color:#fff
    style SHADOW fill:#1b1b2f,stroke:#ffd700,color:#ffd700,stroke-dasharray: 5 5,stroke-width:2px
```

## Signal Flow — Token Compression

```mermaid
graph LR
    subgraph DOWN["⬇️ CONTEXT DOWN"]
        D1["Full Brief<br/>4K tokens"] --> D2["Capsule<br/>2K tokens"]
        D2 --> D3["Shard<br/>512 tokens"]
        D3 --> D4["Micro-Brief<br/>128 tokens"]
    end

    subgraph UP["⬆️ RESULTS UP"]
        U4["Atom<br/>256 tokens"] --> U3["Atom Set<br/>512 tokens"]
        U3 --> U2["Bundle<br/>1K tokens"]
        U2 --> U1["Report<br/>4K tokens"]
    end

    style DOWN fill:#0a3d62,stroke:#3c6382,color:#fff
    style UP fill:#1e3799,stroke:#4a69bd,color:#fff
```

## Time-Flow Pipeline

```mermaid
flowchart LR
    subgraph LAUNCH["⚡ Launch (0-12s)"]
        A1["Nexus Boot<br/>2s"] --> A2["Seal Criteria<br/>3s"]
        A2 --> A3["Commander Spawn<br/>3s"]
        A3 --> A4["Squad Deploy<br/>5s"]
    end

    subgraph EXECUTE["🔨 Execute (12-45s)"]
        B1["Workers<br/>(parallel)<br/>33s"]
    end

    subgraph CONVERGE["🎯 Converge (45-90s)"]
        C1["Review Mesh<br/>15s"] --> C2["Shadow Score<br/>10s"]
        C2 --> C3["Consensus<br/>10s"]
        C3 --> C4["Emit<br/>5s"]
    end

    LAUNCH --> EXECUTE --> CONVERGE
```

## Depth Guard Model

```mermaid
graph TD
    subgraph DEPTH["Spawn Depth Hierarchy"]
        D0["Depth 0<br/>NEXUS<br/>🟢 can_launch=true"]
        D1["Depth 1<br/>COMMANDER<br/>🟢 can_launch=true"]
        D2["Depth 2<br/>SQUAD LEAD<br/>🟡 can_launch=true<br/>(explore/task only)"]
        D3["Depth 3<br/>WORKER<br/>🔴 can_launch=false<br/>LEAF NODE"]
    end

    D0 -->|"spawns general-purpose"| D1
    D1 -->|"spawns general-purpose"| D2
    D2 -->|"spawns explore/task ONLY"| D3
    D3 -.-x|"⛔ CANNOT SPAWN"| BLOCKED["DEPTH LOCK"]

    style D0 fill:#27ae60,stroke:#2ecc71,color:#fff
    style D1 fill:#27ae60,stroke:#2ecc71,color:#fff
    style D2 fill:#f39c12,stroke:#f1c40f,color:#fff
    style D3 fill:#e74c3c,stroke:#c0392b,color:#fff
    style BLOCKED fill:#c0392b,stroke:#e74c3c,color:#fff
```

## Circuit Breaker FSM

```mermaid
stateDiagram-v2
    [*] --> CLOSED
    CLOSED --> OPEN: failure_count > threshold
    OPEN --> HALF_OPEN: cooldown_expired
    HALF_OPEN --> CLOSED: probe_success
    HALF_OPEN --> OPEN: probe_failure
    
    CLOSED: ✅ Normal operation
    CLOSED: All agents launching
    CLOSED: Monitoring failure rate
    
    OPEN: 🛑 Circuit broken
    OPEN: No new agent spawns
    OPEN: Synthesize partial results
    OPEN: Wait for cooldown
    
    HALF_OPEN: 🔄 Testing recovery
    HALF_OPEN: Launch 1 probe agent
    HALF_OPEN: If success → CLOSED
    HALF_OPEN: If failure → OPEN
```

## Consensus Algorithm Flow

```mermaid
flowchart TD
    START["Collect Commander<br/>Reports"] --> GATE

    subgraph GATE["🚪 Stage 1: Gate"]
        G1["Check evidence ≥ 0.6"]
        G2["Check confidence ≥ 0.3"]
        G3["Check no critical<br/>constraint violations"]
    end

    GATE -->|"Pass"| SCORE
    GATE -->|"Fail"| QUARANTINE["🔒 Quarantine<br/>+ Re-review"]

    subgraph SCORE["📊 Stage 2: Score"]
        S1["score = 0.40×confidence<br/>+ 0.30×evidence<br/>+ 0.15×scope<br/>+ 0.15×coverage<br/>− min(0.30, conflict×0.30)"]
    end

    SCORE --> TIER

    subgraph TIER["🏷️ Stage 3: Tier"]
        T1{"Agreement<br/>≥ 70%?"}
        T2{"Agreement<br/>≥ 50%?"}
        T3["CONFLICT"]
    end

    T1 -->|"Yes"| CONSENSUS["✅ CONSENSUS<br/>Auto-accept"]
    T1 -->|"No"| T2
    T2 -->|"Yes"| MAJORITY["⚠️ MAJORITY<br/>Accept + dissent note"]
    T2 -->|"No"| T3

    T3 --> SHADOW_CHECK["🛡️ Shadow<br/>Validation"]
    CONSENSUS --> MERGE
    MAJORITY --> MERGE
    SHADOW_CHECK -->|"Shadow passes"| MERGE
    SHADOW_CHECK -->|"Shadow diverges"| ESCALATE["⬆️ Escalate<br/>to Nexus"]
    ESCALATE --> MERGE

    MERGE["🔀 Stage 4: Merge<br/>Best framework + consensus zones<br/>+ unique high-scored insights"]

    style CONSENSUS fill:#27ae60,color:#fff
    style MAJORITY fill:#f39c12,color:#fff
    style T3 fill:#e74c3c,color:#fff
    style QUARANTINE fill:#c0392b,color:#fff
```

## Scaling Variants

```mermaid
graph LR
    subgraph SS50["🐝 SS-50"]
        A50["2-3 Commanders<br/>15 Workers each<br/>3 Reviewers<br/>~36-52 agents"]
    end

    subgraph SS100["🐝🐝 SS-100"]
        A100["5 Commanders<br/>15 Workers each<br/>8 Reviewers<br/>~89 agents"]
    end

    subgraph SS250["🐝🐝🐝 SS-250"]
        A250["5 Commanders<br/>50 Squad Leads<br/>250 Workers<br/>10 Reviewers<br/>Shadow Score L2<br/>~316 agents"]
    end

    SS50 -.->|"Scale up"| SS100
    SS100 -.->|"Scale up"| SS250

    style SS50 fill:#2ecc71,stroke:#27ae60,color:#fff
    style SS100 fill:#3498db,stroke:#2980b9,color:#fff
    style SS250 fill:#9b59b6,stroke:#8e44ad,color:#fff
```
