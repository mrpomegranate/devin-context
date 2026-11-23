# ngc-devin-context
<img width="110" alt="NGC Devin Context Mascot" src="docs/images/mascot.png" />

Persistent, evidence-backed memory for Devin across sessions, specifications, and repositories.

---

## Why Devin Context Matters

AI coding agents like Devin start every new session with a blank slate (**"Agent Amnesia"**). Without persistent context, Devin frequently:
- **Forgets team conventions**: Re-invents different pagination styles, database query patterns, or folder structures across files.
- **Loses session continuity**: Doesn't know what was completed yesterday, what blockers exist, or where to resume.
- **Repeats past mistakes**: Forgets critical subtleties discovered during previous debugging sessions (e.g., API timeouts, required test flags).

**`ngc-devin-context` (`ndc`)** gives Devin durable, project-specific memory:
- **Local-first & Git-Reviewable**: Decisions, handoffs, and lessons are stored in clean Markdown files directly in your repository (`.ngc-devin/`).
- **Automated Chat Retrieval**: When you prompt Devin with a task, Devin automatically gathers relevant rules, specs, and validation commands in the background before touching code.
- **Specification Bridge**: Unifies requirements from **OpenSpec** or **Spec-Kitty** with repository-level architectural decisions and test runbooks.
- **Zero Data Leakage**: Runs completely locally without sending your code or prompts to any external third-party service.

---

## How It Compares to Devin Local Customizations

Devin's built-in [Local Customizations](https://docs.devin.ai/desktop/devin-local/customizations) (`AGENTS.md`, `.devin/rules/`) are **static instruction files**, whereas NGC Devin Context is a **dynamic, governed knowledge engine**.

| Feature / Concern | Devin Local Customizations (`AGENTS.md`, `.devin/rules/`) | NGC Devin Context (`ndc`) |
| :--- | :--- | :--- |
| **Storage Model** | Static text files loaded directly into the system prompt. | Structured Markdown knowledge base (`decisions/`, `handoffs/`, `lessons/`). |
| **Prompt Size & Scaling** | **Grows linearly**; dumping all team rules into `AGENTS.md` causes prompt bloat and context dilution. | **Dynamic & Compact**: `ndc brief` retrieves *only* the specific records relevant to the current task. |
| **Governance & Safety** | No approval workflow. Any edit to `AGENTS.md` immediately changes Devin's behavior without review. | **Proposals First**: Devin creates proposals in `.ngc-devin/proposals/`. They require human review (`ndc approve`) before becoming durable team rules. |
| **Session Handoffs** | None. Work state from yesterday's session is lost unless manually written into a prompt. | **Structured Handoffs**: `ndc handoff create` saves exact work state, blockers, and next steps for tomorrow's session. |
| **Specification Integration** | None. Manual referencing of spec documents. | **Automated Spec Bridge**: Connects change IDs from **OpenSpec** or **Spec-Kitty** with content hashes and requirement tracking. |
| **Scoping** | Repository-only (`AGENTS.md` in root). | **Two-Tier Scoping**: `project` (committed to Git for the team) and `global` (private to your user account across all repos). |

### How They Work Together

NGC Devin Context actually **enhances** Devin Local Customizations:
1. `ndc init` adds a lightweight, managed ~10-line block to **`AGENTS.md`**.
2. It installs a **Devin Skill** in `.devin/skills/ngc-devin-context/SKILL.md`.
3. This empowers Devin to dynamically query the `.ngc-devin/knowledge/` database in the background whenever you chat, keeping your system prompt clean and focused.

---

## Installation

### From Enterprise Nexus (Recommended for internal teams)

```bash
pip install ngc-devin-context --index-url https://nexus-repository.northgrum.com/repository/pypi-ng-releases/simple/
```

If using `uv`:
```bash
# Add as a project dependency
uv add ngc-devin-context --index-url https://nexus-repository.northgrum.com/repository/pypi-ng-releases/simple/

# Or install in active virtual environment
uv pip install ngc-devin-context --index-url https://nexus-repository.northgrum.com/repository/pypi-ng-releases/simple/
```

#### Persistent Windows `pip` Configuration

To configure the Nexus repository once for all of your Windows Python projects, create or edit `%AppData%\pip\pip.ini` (or `~/.pip/pip.conf` on Linux):

```ini
[global]
index-url = https://nexus-repository.northgrum.com/repository/pypi-ng-releases/simple/
```

After saving the file, install internal packages normally:
```bash
pip install ngc-devin-context
```

### For Local Development

```bash
git clone https://github.northgrum.com/J68862/ng-devin-context.git
cd ng-devin-context
npm install
pip install -e .
```

---

## Quickstart

1. **Initialize your repository once:**
   ```bash
   ndc init
   ```
   *(Or simply tell Devin in chat: **"Devin, please initialize NGC Devin Context in this repo"**)*

2. **Work normally with Devin in chat:**
   Assign tasks to Devin as you normally do:
   > *"Devin, please add pagination and filtering to the /devices endpoint."*

   Devin automatically retrieves matching project rules, prior decisions, and test commands via `ndc brief` in the background before writing code.

---

## Detailed Usage Guide

For complete, step-by-step guides, visual flowcharts, chat prompting examples, PR workflows, and specification integrations (Standalone, OpenSpec, Spec-Kitty), see:

**[Complete Usage Guide](docs/usage-guide.md)**

---

## Author

**Syed Rumman**  
Sr. Principal AI Engineer Systems Architect

## Acknowledgements

- Built with Devin as the coding assistant.
- Product direction was inspired by [OpenContext](https://github.com/0xranx/OpenContext). NGC Devin Context is a clean-room, Devin-focused implementation.
