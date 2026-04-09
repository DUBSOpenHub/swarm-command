# Learning Path

This guide gives Swarm Command readers a sane order to follow instead of dropping straight into deep protocol docs.

---

## Path 1 — I just want to try it (5 minutes)

1. Read the **30-Second Overview** in the [README](../README.md)
2. Copy the install command from the README
3. Run the **Quick Demo** prompt
4. Skim [use-cases.md](use-cases.md) for your next prompt

**Best for:** first-time users, evaluators, demos.

---

## Path 2 — I want to use it well (15 minutes)

1. Read the [README](../README.md)
2. Read [scaling.md](scaling.md)
3. Read [use-cases.md](use-cases.md)
4. Skim [architecture.md](architecture.md)
5. Return to the README FAQ when questions come up

**Best for:** operators, engineers deciding between SS-50 / SS-100 / SS-250.

---

## Path 3 — I want to understand the system design (25 minutes)

1. Read the architecture summary in the [README](../README.md)
2. Read [architecture.md](architecture.md)
3. Open [architecture-diagrams.md](architecture-diagrams.md)
4. Read [consensus.md](consensus.md)
5. Read [shadow-scoring.md](shadow-scoring.md)
6. Finish with [scaling.md](scaling.md)

**Best for:** architects, contributors, people adapting the pattern to another swarm system.

---

## Path 4 — I want the origin story

1. Read **How It Was Built** in the [README](../README.md)
2. Read the motivation section in [shadow-scoring.md](shadow-scoring.md)
3. Read [architecture.md](architecture.md) with the failure modes in mind

**Best for:** people who care how the system evolved, not just what it does.

---

## Suggested reading order by persona

| Persona | Start | Next | Finish |
|---|---|---|---|
| New user | README | use-cases.md | scaling.md |
| Operator | README | scaling.md | FAQ + architecture.md |
| Architect | architecture.md | consensus.md | shadow-scoring.md |
| Contributor | README | architecture.md | templates/ + protocols/ |

---

## One-sentence summaries for each doc

| Doc | Why it exists |
|---|---|
| `README.md` | The best single-page overview |
| `architecture.md` | The system model in prose |
| `architecture-diagrams.md` | The visual version of the architecture |
| `scaling.md` | How to choose a scale and what it costs |
| `use-cases.md` | Prompts that make the swarm feel concrete |
| `consensus.md` | How outputs are merged and scored |
| `shadow-scoring.md` | How hidden validation catches false confidence |
