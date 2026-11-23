# devin-context
<img width="110" alt="Devin Context Mascot" src="docs/images/mascot.png" />

Persistent, evidence-backed memory for Devin across sessions, specifications, and repositories.

---

## Why Devin Context Matters

AI coding agents like Devin start every new session with a blank slate (**"Agent Amnesia"**). Without persistent context, Devin frequently:
- **Forgets team conventions**: Re-invents different pagination styles, database query patterns, or folder structures across files.
- **Loses session continuity**: Doesn't know what was completed yesterday, what blockers exist, or where to resume.
- **Repeats past mistakes**: Forgets critical subtleties discovered during previous debugging sessions (e.g., API timeouts, required test flags).

**The `devin-context` CLI** gives Devin durable, project-specific memory:
- **Local-first & Git-Reviewable**: Decisions, handoffs, and lessons are stored in clean Markdown files directly in your repository (`.devin-context/`).
- **Automated Chat Retrieval**: When you prompt Devin with a task, Devin automatically gathers relevant rules, specs, and validation commands in the background before touching code.
- **Specification Bridge**: Unifies requirements from **OpenSpec** or **Spec-Kitty** with repository-level architectural decisions and test runbooks.
- **Zero Data Leakage**: Runs completely locally without sending your code or prompts to any external third-party service.

---

## How It Compares to Devin Local Customizations

Devin's built-in [Local Customizations](https://docs.devin.ai/desktop/devin-local/customizations) (`AGENTS.md`, `.devin/rules/`) are **static instruction files**, whereas Devin Context is a **dynamic, governed knowledge engine**.

| Feature / Concern | Devin Local Customizations (`AGENTS.md`, `.devin/rules/`) | Devin Context (`devin-context`) |
| :--- | :--- | :--- |
| **Storage Model** | Static text files loaded directly into the system prompt. | Structured Markdown knowledge base (`decisions/`, `handoffs/`, `lessons/`). |
| **Prompt Size & Scaling** | **Grows linearly**; dumping all team rules into `AGENTS.md` causes prompt bloat and context dilution. | **Dynamic & Compact**: `devin-context brief` retrieves *only* the specific records relevant to the current task. |
| **Governance & Safety** | No approval workflow. Any edit to `AGENTS.md` immediately changes Devin's behavior without review. | **Proposals First**: Devin creates proposals in `.devin-context/proposals/`. They require human review (`devin-context approve`) before becoming durable team rules. |
| **Session Handoffs** | None. Work state from yesterday's session is lost unless manually written into a prompt. | **Structured Handoffs**: `devin-context handoff create` saves exact work state, blockers, and next steps for tomorrow's session. |
| **Specification Integration** | None. Manual referencing of spec documents. | **Automated Spec Bridge**: Connects change IDs from **OpenSpec** or **Spec-Kitty** with content hashes and requirement tracking. |
| **Scoping** | Repository-only (`AGENTS.md` in root). | **Two-Tier Scoping**: `project` (committed to Git for the team) and `global` (private to your user account across all repos). |

### How They Work Together

Devin Context actually **enhances** Devin Local Customizations:
1. `devin-context init` adds a lightweight, managed ~10-line block to **`AGENTS.md`**.
2. It installs a **Devin Skill** in `.devin/skills/devin-context/SKILL.md`.
3. This empowers Devin to dynamically query the `.devin-context/knowledge/` database in the background whenever you chat, keeping your system prompt clean and focused.

---

## Installation

### From PyPI

```bash
pip install devin-context
```

If using `uv`:
```bash
# Add as a project dependency
uv add devin-context

# Or install in active virtual environment
uv pip install devin-context
```

### For Local Development

```bash
git clone https://github.com/mrpomegranate/devin-context.git
cd devin-context
npm install
pip install -e .
```

---

## Quickstart

1. **Initialize your repository once:**
   ```bash
   devin-context init
   ```
   *(Or simply tell Devin in chat: **"Devin, please initialize Devin Context in this repo"**)*

2. **Work normally with Devin in chat:**
   Assign tasks to Devin as you normally do:
   > *"Devin, please add pagination and filtering to the /devices endpoint."*

   Devin automatically retrieves matching project rules, prior decisions, and test commands via `devin-context brief` in the background before writing code.

---

## Detailed Usage Guide

For complete, step-by-step guides, visual flowcharts, chat prompting examples, PR workflows, and specification integrations (Standalone, OpenSpec, Spec-Kitty), see:

**[Complete Usage Guide](docs/usage-guide.md)**

---

## Author

**Mr. Pomegranate**  
Sr. Principal AI Engineer Systems Architect

## Acknowledgements

- Built with Devin as the coding assistant.
- Product direction was inspired by [OpenContext](https://github.com/0xranx/OpenContext). Devin Context is a clean-room, Devin-focused implementation.
