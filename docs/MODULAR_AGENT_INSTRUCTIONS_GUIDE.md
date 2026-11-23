# Modular Agent Instructions Architecture: A Complete Guide

A practical tutorial and recommendation guide for structuring AI agent guidelines, coding standards, and project memory across software repositories.

---

## 1. The Core Problem: "Prompt Bloat" vs. "Agent Amnesia"

When collaborating with AI coding agents (like Devin), teams typically encounter two opposing traps:

```text
 ┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
 │         Trap 1: The Monolith         │     │         Trap 2: The Vacuum           │
 │       (Massive Single AGENTS.md)     │     │         (No Structured Rules)        │
 ├──────────────────────────────────────┤     ├──────────────────────────────────────┤
 │ • 500+ lines loaded in every prompt  │     │ • Agent guesses architectural styles │
 │ • Context window dilution & high cost│     │ • Re-invents different conventions   │
 │ • Agent misses critical rules in wall│     │ • Forgets yesterday's blockers and   │
 │   of irrelevant text                 │     │   debugging discoveries              │
 └──────────────────────────────────────┘     └──────────────────────────────────────┘
```

### The Solution: The "Hub-and-Spoke" Architecture

Instead of dumping everything into one huge file or leaving the agent without context, divide agent knowledge into **four distinct tiers based on frequency and scope**:

```text
                                  ┌──────────────────┐
                                  │    AGENTS.md     │
                                  │ (Tier 1: Hub)    │  <-- Universal Inviolable Rules
                                  │ Loaded in EVERY  │      (~30-50 lines)
                                  │ session prompt   │
                                  └────────┬─────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  Nested Rules    │             │      docs/       │             │ .devin-context/  │
│ (Tier 2: Scoped) │             │ (Tier 3: Deep)   │             │ (Tier 4: Memory) │
├──────────────────┤             ├──────────────────┤             ├──────────────────┤
│ src/<mod>/       │             │ Deep reference   │             │ Dynamic, evolving│
│ AGENTS.md        │             │ docs read only   │             │ decisions and    │
│                  │             │ on-demand        │             │ session handoffs │
└──────────────────┘             └──────────────────┘             └──────────────────┘
```

---

## 2. The Four-Tier Knowledge Model

| Tier | File / Location | When It Loads | Best Used For |
| :--- | :--- | :--- | :--- |
| **Tier 1: Root Hub** | `AGENTS.md` | **Every single session** | Core check commands, language versions, non-negotiable safety rules. |
| **Tier 2: Scoped Module Rules** | `src/<module>/AGENTS.md` | **When working inside that module** | Colocated domain rules (e.g. telemetry formulas, API schemas, DB rules). |
| **Tier 3: Deep Guides** | `docs/*.md` | **On-demand** (referenced by agent) | Architecture maps, repo setup guide, glossary, complex algorithms. |
| **Tier 4: Dynamic Memory** | `.devin-context/knowledge/` | **Retrieved via `devin-context brief`** | Evolving team decisions, debugging lessons, daily handoffs. |

---

## 3. Implementation Breakdown & Concrete Examples

---

### Tier 1: The Root Hub (`AGENTS.md`)

**Rule:** Keep this file under 50 lines. It acts as the gateway, enforces universal guardrails, and instructs the agent how to discover and update nested module files.

```markdown
# Repository Agent Guidelines

## 1. Stack & Environment
- **Python**: `>=3.11` (managed via `uv`)
- **Node.js**: `>=20`
- **Verification Command**: `uv run pytest -m unit && uv run ruff check .`

## 2. Non-Negotiable Core Rules
1. **Never weaken checks**: No `# type: ignore`, `# noqa`, or deleting failing assertions to get green.
2. **Write minimum code**: No speculative layers, unused helpers, or single-use interfaces.
3. **Fail fast (no silent fallbacks)**: Fail immediately on invalid state or missing config; never swallow errors or return dummy defaults.
4. **Pure core, validated boundaries**: Validate at API/file boundaries; keep internal domain logic pure.
5. **Context retrieval**: For non-trivial tasks, run `devin-context brief --task "<summary>"` before modifying code.
6. **Nested module rules**: Before modifying files in any subpackage, check if `src/<module>/AGENTS.md` exists and follow its domain rules. Root safety rules always take precedence.
7. **Creating & updating module rules**: When establishing a permanent rule or constraint for a subpackage, create `src/<module>/AGENTS.md` (or update it if it exists) to document its ownership, allowed imports, and domain constraints, and record an accompanying decision via `devin-context decision create`.

## 3. Deep Reference Guides
Read these files when working on relevant tasks:
- **Repo Setup & Tooling**: `docs/AGENTIC_REPO_SETUP_GUIDE.md`
- **Module Ownership & Architecture**: `docs/architecture.md`
- **Coding Standards & Boundary Rules**: `docs/CODING_STANDARDS.md`
```

---

### Tier 2: Scoped Module Rules (`src/<module>/AGENTS.md`)

**Why this matters:** Colocating an `AGENTS.md` inside a specific subpackage (e.g. `src/telemetry/AGENTS.md`) allows domain rules to travel with the source code and stay version-controlled alongside the files they govern.

#### Rule Precedence Hierarchy

$$\text{Root AGENTS.md (Inviolable Guardrails)} \;\;>\;\; \text{Nested Module AGENTS.md (Domain Specializations)}$$

- **Root Rules Win:** A nested module rule can specialize behavior (e.g., *"All functions must be vectorized"*), but it **can never weaken root rules** (e.g., it cannot permit disabling linters or skipping tests).

#### Example A: Telemetry Module (`src/telemetry/AGENTS.md`)
```markdown
# Telemetry Module Guidelines

## 1. Ownership & Scope
- Owns raw telemetry ingestion, sensor range decoding, EWMA filtering, and anomaly labeling.
- **Allowed Imports**: `src/config/`, `src/common/`. (Never import from `src/api/` or `src/alerting/`).

## 2. Math & Algorithm Rules
- All transformations must be vectorized using Polars expressions or NumPy arrays. Never use Python `for` loops across series data.
- Clocks and timestamps must be passed in as UTC arguments from the boundary. Never call `datetime.now()` in filter logic.
- Mathematical equations in docstrings must follow LaTeX format (`$$...$$` for block math, `$...$` for inline math).
```

#### Example B: API Routes Module (`src/api/AGENTS.md`)
```markdown
# API Module Guidelines

## 1. Ownership & Boundaries
- Owns HTTP routing, request parsing, authentication enforcement, and serialization.
- **Allowed Imports**: `src/config/`, `src/services/`, `src/schemas/`.

## 2. Endpoint Rules
- Always validate request bodies using Pydantic schemas.
- All list endpoints must support `limit` and `offset` query parameters (cap max `limit` at 100).
- Return explicit HTTP error status codes (400 for bad input, 404 for missing items, 409 for conflicts).
```

---

### Pairing Module `AGENTS.md` with Devin Context Decisions (The Pair Pattern)

When Devin discovers or establishes a new rule for a module during a task:

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 1. You prompt Devin in chat:                                           │
 │    "Update the telemetry rules to require 5s timeouts on all polling"  │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 2. Devin creates `src/telemetry/AGENTS.md` (or updates it if present) │
 │    directly in the PR diff with ownership, imports, & constraints     │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 3. Devin records the rationale with Devin Context:                     │
 │     $ devin-context decision create "poll timeout" ...                 │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 4. Review the PR, run `devin-context approve`, and merge!              │
 └────────────────────────────────────────────────────────────────────────┘
```

#### Zero Conflicts with Spec-Kitty or Devin Context
- **Spec-Kitty**: Only modifies `.kittify/` and the `spec-kitty:orientation` block in the **root** `AGENTS.md`. It never touches `src/<module>/AGENTS.md`.
- **Devin Context (`devin-context`)**: Only manages its own block in the root `AGENTS.md` and indexes knowledge in `.devin-context/knowledge/`.
- **Module `AGENTS.md`**: Stays purely in your version-controlled source tree.

---

### Tier 3: Deep Domain Documentation (`docs/`)

**Why this matters:** Lengthy tutorials, architectural diagrams, and glossaries should live in `docs/` so they don't bloat prompt tokens. Devin will read them automatically when asked or when referenced by `AGENTS.md`.

* **`docs/architecture.md`**: Contains the module ownership map and dependency flow rules.
* **`docs/AGENTIC_REPO_SETUP_GUIDE.md`**: Contains `uv` virtualenv setup, CI/CD pipeline, and pre-commit configurations.
* **`docs/AGENTIC_CODING_GUIDE.md`**: Detailed software craftsmanship guidelines (Spec-Kitty interview rules, boundary validation).

---

### Tier 4: Evolving Team Memory (`.devin-context/`)

**Why this matters:** Static `.md` files should not be edited on the fly during coding sessions. For decisions made during implementation (e.g., *"We chose Redis over Memcached for token caching"*), use **`devin-context`**.

```text
  Developer Prompt / Implementation Discovery
                       │
                       ▼
         devin-context decision create "Use Redis"
                       │
                       ▼
       Human Review: devin-context approve <file>
                       │
                       ▼
   .devin-context/knowledge/decisions/2026-11-22-use-redis.md
                       │
                       ▼
   Permanently searchable by future Devin sessions!
```

---

## 4. Practical Comparison: Monolith vs. Modular

```text
┌────────────────────────┬──────────────────────────────────┬──────────────────────────────────┐
│ Attribute              │ Monolithic (One Big AGENTS.md)   │ Modular Hub-and-Spoke (4 Tiers) │
├────────────────────────┼──────────────────────────────────┼──────────────────────────────────┤
│ Token Cost per Prompt  │ High (Entire file loaded always) │ Minimal (~30 lines loaded)       │
│ Agent Focus / Accuracy │ Medium (Noise causes confusion)  │ High (Only relevant rules load)  │
│ Ease of Maintenance   │ Hard (One giant, messy file)     │ Clean (Domain-specific files)    │
│ Multi-Session Memory   │ Weak (Manual prompt re-typing)   │ Strong (Automatic)              │
│ Scalability across PRs │ Degrades over time               │ Scales indefinitely              │
└────────────────────────┴──────────────────────────────────┴──────────────────────────────────┘
```

---

## 5. Summary Checklist for New Repositories

When creating a new repository:
1. **`AGENTS.md`**: Add the concise ~40-line root hub with verification commands and the nested module directive.
2. **`src/<module>/AGENTS.md`**: Add domain-specific rules inside subpackages where needed.
3. **`docs/`**: Add deep reference guides (`AGENTIC_REPO_SETUP_GUIDE.md`, `architecture.md`).
4. **`devin-context init`**: Initialize Devin Context for dynamic decision-making and handoffs.
