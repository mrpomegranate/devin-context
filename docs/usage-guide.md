# NGC Devin Context: Complete Usage Guide

**NGC Devin Context (`ndc`)** gives Devin durable memory across coding sessions, specification workflows, and repositories.

---

## How It Works in Your Chat Session

You interact with Devin normally in this chat window using natural language. You do **not** need to open a terminal or run CLI commands manually to give Devin context.

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 1. You prompt Devin in chat:                                           │
 │    "Devin, please add pagination and filtering to /devices endpoint"   │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 2. Devin runs in the background:                                       │
 │    $ ndc brief --task "Add pagination and filtering to /devices"       │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 3. Devin reads the retrieved Context Pack:                             │
 │    • Team rules: "Use offset-limit pagination, max limit 100"          │
 │    • Specification: Authoritative requirement docs & task roadmap      │
 │    • Validation: Exact test commands (e.g. pytest, npm test)           │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 4. Devin writes code adhering to your rules, then creates a handoff:   │
 │    "I finished the backend pagination. Here is a handoff proposal      │
 │     recording where we left off for tomorrow."                         │
 └────────────────────────────────────────────────────────────────────────┘
```

### How Does Devin Know to Use `ndc`?

When you initialize your repository with `ndc init`, it sets up two mechanisms that instruct Devin:

1. **`AGENTS.md` Instructions**: Devin reads `AGENTS.md` automatically at the start of every session. `ndc init` inserts rules telling Devin to run `ndc brief` before starting non-trivial tasks and `ndc closeout` / `ndc handoff` after finishing work.
2. **Devin Project Skill (`.devin/skills/ngc-devin-context/SKILL.md`)**: Teaches Devin the exact syntax for creating proposals and recording decisions.

Because Devin has terminal access, it translates your conversational requests (*"record a decision..."*, *"leave a handoff..."*) into the appropriate `ndc` background commands automatically.

---

## 1. Installation

### Prerequisites
- **Python**: `>=3.8`
- **Node.js**: `>=20` (installed and available in `PATH`)
- **Windows System Certificates** (recommended on NGC machines):
  ```bash
  pip install pip-system-certs
  ```

### Install from Enterprise Nexus PyPI

#### Option A: Using `pip`
```bash
pip install ngc-devin-context --index-url https://nexus-repository.northgrum.com/repository/pypi-ng-releases/simple/
```

To configure `pip` globally so you don't need `--index-url` each time, add to `C:\Users\<Your_ID>\pip\pip.ini` (or `~/.pip/pip.conf` on Linux):
```ini
[global]
index-url = https://nexus-repository.northgrum.com/repository/pypi-ng-releases/simple/
```

#### Option B: Using `uv`
```bash
# Add as a project dependency
uv add ngc-devin-context --index-url https://nexus-repository.northgrum.com/repository/pypi-ng-releases/simple/

# Or install in the active environment
uv pip install ngc-devin-context --index-url https://nexus-repository.northgrum.com/repository/pypi-ng-releases/simple/
```

#### Option C: Local Source Checkout
```bash
git clone https://github.northgrum.com/J68862/ng-devin-context.git
cd ng-devin-context
npm install
pip install -e .
```

Verify your installation:
```bash
ndc help
```

---

## 2. Core Workflows by Specification Setup

NGC Devin Context works seamlessly whether your repository uses an external specification framework or operates as a standalone repository.

For every step below, you can interact either **via Chat (Natural Language)** or **via CLI**.

---

### Scenario A: Standalone Repositories (No OpenSpec or Spec-Kitty)

Use this setup for standard repositories where feature requirements and discussions live directly in repository issues, tickets, or code.

```text
  Session 1 (Today)                          Session 2 (Tomorrow)
┌──────────────────────┐                   ┌──────────────────────┐
│ Prompt Devin:        │                   │ Prompt Devin:        │
│ "Add /devices API"   │                   │ "Resume /devices"    │
└──────────┬───────────┘                   └──────────┬───────────┘
           │                                          │
           ▼                                          ▼
┌──────────────────────┐                   ┌──────────────────────┐
│ • Implements feature │                   │ • Reads handoff from │
│ • Saves decision:    │                   │   Session 1          │
│   "Offset-limit 50"  │                   │ • Knows exactly what │
│ • Saves handoff      │                   │   remains to be done │
└──────────┬───────────┘                   └──────────────────────┘
           │
           ▼
  .ngc-devin/knowledge/
  ├── decisions/2026-11-22-offset-limit.md
  └── handoffs/2026-11-22-devices-api.md
```

#### 1. Initialize the Project

- **💬 In Chat:** *"Devin, please initialize NGC Devin Context in this repository."*
- **💻 CLI Equivalent:**
  ```bash
  ndc init
  ```
  *(Creates `.ngc-devin/config.yaml`, `.devin/skills/`, and updates `AGENTS.md`)*

#### 2. Start Work with Devin (Automated Retrieval)

- **💬 In Chat:** *"Devin, please add pagination and filtering to the /devices endpoint."*
- **💻 What Devin runs in background:**
  ```bash
  ndc brief --task "Add pagination and filtering to the /devices endpoint"
  ```
  Devin receives matching project rules, prior decisions, validation commands, and current Git status before writing any code.

#### 3. Save Architectural Decisions

- **💬 In Chat:** *"Devin, record a decision that we use offset-limit pagination with a default limit of 50 and max limit of 100 to prevent database memory spikes."*
- **💻 What Devin runs in background:**
  ```bash
  ndc decision create "Use offset-limit pagination with a default limit of 50" \
    --body "All list endpoints must accept 'limit' and 'offset' query parameters. Cap max limit at 100 to prevent database memory spikes."
  ```
- **💬 In Chat Approval:** *"Looks good, please approve the pagination decision proposal."*
- **💻 CLI Equivalent:**
  ```bash
  ndc approve .ngc-devin/proposals/2026-11-22-use-offset-limit-pagination.md
  ```

#### 4. Leave a Session Handoff

- **💬 In Chat:** *"I'm signing off for today. Please leave a handoff summarizing what we completed and what remains for tomorrow."*
- **💻 What Devin runs in background:**
  ```bash
  ndc handoff create "Devices API pagination state" \
    --body "Database queries and backend route pagination are complete and unit tests pass. Next step: connect the frontend table pagination controls."
  ndc approve .ngc-devin/proposals/<handoff-file>.md
  ```
  Tomorrow, the next Devin session will automatically pull this handoff and resume without needing repeated context.

---

### Scenario B: Repositories Using OpenSpec

Use this setup when your team uses **OpenSpec** (`openspec/`) to define formal changes, requirements, design documents, and task lists.

```text
  OpenSpec (Requirements Authority)         NGC Devin Context (Durable Rules)
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ openspec/changes/DEV-102/       │       │ .ngc-devin/knowledge/           │
│ ├── spec.md  (Requirements)    │   +   │ ├── decisions/ (Alembic only)   │
│ └── tasks.md (Task checklist)   │       │ └── runbooks/  (Test commands)  │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                        Devin Context Pack (Unified)
```

#### 1. Setup & Verification

- **💬 In Chat:** *"Devin, check our specification setup."*
- **💻 CLI Equivalent:**
  ```bash
  ndc spec detect
  ```
  *(Outputs `"provider": "openspec"` and confirms `openspec/` is detected)*

#### 2. Starting Work on an OpenSpec Change

- **💬 In Chat:** *"Devin, please implement OpenSpec change DEV-102 (device health check endpoint)."*
- **💻 What Devin runs in background:**
  ```bash
  ndc brief --task "Implement device health check endpoint" --spec DEV-102
  ```
  Devin loads the OpenSpec requirements as the **authoritative task roadmap** while also loading your team's prior decisions and test commands.

#### 3. Post-Task Closeout

- **💬 In Chat:** *"Save a closeout lesson: health checks to external sensor services must always set an explicit 5-second timeout."*
- **💻 What Devin runs in background:**
  ```bash
  ndc closeout --title "Always set HTTP timeouts on external health checks" \
    --spec DEV-102 \
    --body "Health checks to external sensor services must specify a 5-second timeout; without it, network drops cause worker threads to hang indefinitely."
  ndc approve .ngc-devin/proposals/<closeout-file>.md
  ```

---

### Scenario C: Repositories Using Spec-Kitty

Use this setup when your team uses **Spec-Kitty** (`.specify/`) for specification-driven development.

#### 1. Setup & Verification

- **💬 In Chat:** *"Devin, detect our spec provider."*
- **💻 CLI Equivalent:**
  ```bash
  ndc spec detect
  ```
  *(Outputs `"provider": "spec-kitty"` and confirms `.specify/` is detected)*

#### 2. Starting Work on a Spec-Kitty Feature

- **💬 In Chat:** *"Devin, implement Spec-Kitty feature user-notifications (add email alerts on device disconnect)."*
- **💻 What Devin runs in background:**
  ```bash
  ndc brief --task "Add email alerts on device disconnect" --spec user-notifications
  ```

#### 3. Recording a Decision with Spec Link

- **💬 In Chat:** *"Record a decision for user-notifications that notification emails must be dispatched asynchronously via background workers."*
- **💻 What Devin runs in background:**
  ```bash
  ndc decision create "Dispatch notification emails asynchronously via background workers" \
    --spec user-notifications \
    --body "Sending emails synchronously in the HTTP request handler blocks the client response. Always enqueue email tasks."
  ndc approve .ngc-devin/proposals/<proposal-file>.md
  ```

---

## 3. USE CASES:
### 1. Pull Request (PR) Workflows with Devin & NDC

Pull Requests are where persistent context and AI assistance deliver the highest team value:
1. **When creating a PR**: You can preserve decisions and lessons so context isn't lost upon merge.
2. **When reviewing a PR**: Devin can automatically audit your colleague's PR against your team's recorded rules in `.ngc-devin/knowledge/`.

---

#### Workflow 1: Creating & Submitting a PR with Devin

When you finish a feature and want to open a Pull Request:

##### 1. Ask Devin in Chat
> **You:**  
> *"Devin, please create a new branch `feat/devices-pagination`, run the test suite, save our decisions and closeout lessons in NDC, push the branch to origin, and draft a PR description."*

##### 2. What Devin Does Behind the Scenes
1. **Branches and commits cleanly**:
   ```bash
   git checkout -b feat/devices-pagination
   git add .
   git commit -m "Implement offset-limit pagination for devices API"
   ```
2. **Records durable decisions & closeout lessons**:
   ```bash
   ndc decision create "Use offset-limit pagination with default limit of 50" --body "..."
   ndc approve .ngc-devin/proposals/2026-11-22-use-offset-limit-pagination.md
   ```
3. **Pushes branch to remote**:
   ```bash
   git push -u origin feat/devices-pagination
   ```
4. **Drafts a ready-to-paste PR description**:
   ```markdown
   ## Description
   Implements offset-limit pagination for the `/devices` endpoint with a default limit of 50 (capped at 100).

   ## Architectural Decisions Recorded
   - Added `.ngc-devin/knowledge/decisions/2026-11-22-use-offset-limit-pagination.md`

   ## Verification
   - `npm test`: 8/8 tests pass
   - `pytest tests/test_devices.py`: All 12 unit tests pass
   ```

---

#### Workflow 2: Reviewing a Colleague's PR with Devin & NDC

When a teammate opens a PR and asks you for a code review, you can ask Devin to perform a thorough, objective audit.

```text
 ┌────────────────────────────────────────────────────────┐
 │ 1. You prompt Devin in chat:                           │
 │    "Checkout branch feat/user-search and review PR"   │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. Devin inspects `git diff main...HEAD`               │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. Devin cross-references `.ngc-devin/knowledge/`:     │
 │    • Did the PR follow pagination limits?              │
 │    • Did the PR use Alembic instead of raw DDL?        │
 │    • Did the PR mock external network calls in tests?  │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. Devin executes test suites & generates review       │
 └────────────────────────────────────────────────────────┘
```

##### 1. Ask Devin in Chat
> **You:**  
> *"Devin, please fetch and check out branch `feat/user-search` (PR #14) and review the diff against `main`. Check for:*
> 1. *Adherence to our project rules in `.ngc-devin/knowledge/` (e.g. pagination limit, Alembic migrations, mocking external APIs).*
> 2. *Edge cases, input validation, and missing error handling.*
> 3. *Run all test suites.*
> 4. *Draft a constructive PR review summary with line-by-line feedback."*

##### 2. What Devin Executes Behind the Scenes
```bash
git fetch origin
git checkout feat/user-search
git diff main...HEAD
ndc brief --task "Review user search PR"
npm test
```

##### 3. What Devin Delivers in Chat
Devin generates a formatted review ready to paste directly into GitHub:

```markdown
### Summary of Changes
- Added `/devices/search` endpoint with keyword and date range filters.

### Automated Checks
- Unit tests: PASS (14/14 tests passing)
- Lint / types: PASS

### Review Feedback
1. **Adherence to Project Decisions**:
   - `src/api/routes.py:42`: Uses `limit=500` by default. Our project standard (`.ngc-devin/knowledge/decisions/2026-11-22-use-offset-limit-pagination.md`) caps maximum limit at `100` to prevent memory spikes.
2. **Edge Case / Error Handling**:
   - `src/services/search.py:88`: If `start_date > end_date`, the query returns an unhandled 500 database error instead of a 400 Bad Request.
3. **Praise**:
   - Clean test coverage with mock fixtures and thorough docstrings adhering to LaTeX equation standards.
```

---

## 4. Elaborate Command & Prompt Reference

| Action | 💬 How to Prompt in Chat | 💻 CLI Equivalent Command |
| :--- | :--- | :--- |
| **Initialize Repo** | *"Initialize NGC Devin Context here."* | `ndc init` |
| **Retrieve Context** | *(Automatic when you assign tasks)* | `ndc brief --task "Export telemetry to CSV"` |
| **Link Specification** | *"Implement OpenSpec change DEV-102."* | `ndc brief --task "Fix calibration" --spec DEV-102` |
| **Record Decision** | *"Record decision: use Alembic for DB migrations, never raw SQL."* | `ndc decision create "Use Alembic migrations" --body "..."` |
| **Global Rule** | *"Record a global rule: never log bearer tokens or PII."* | `ndc decision create "Security guidelines" --scope global --approve --body "..."` |
| **Session Handoff** | *"I'm signing off. Leave a handoff for where we left off."* | `ndc handoff create "Onboarding wizard state" --body "..."` |
| **Save Lesson** | *"Record a closeout lesson: reading CSVs >1GB requires chunksize."* | `ndc closeout --title "Pandas CSV memory overflow" --body "..."` |
| **Approve Proposal** | *"Approve the pending decision proposal."* | `ndc approve .ngc-devin/proposals/<file>.md` |
| **Search Knowledge** | *"Search context for pagination rules."* | `ndc search "pagination"` |
| **Review PR** | *"Checkout branch feat/pr-12 and review against project rules."* | `git diff main...HEAD && ndc search "..."` |
| **Check Config** | *"Show current NGC Devin Context config."* | `ndc config show --resolved` |
| **Detect Specs** | *"Check if OpenSpec or Spec-Kitty is configured."* | `ndc spec detect` |

---

## 5. Understanding Scopes: Project vs. Global

| Scope | Location | How to Specify in Chat | Storage & Sharing | Intended Use |
| :--- | :--- | :--- | :--- | :--- |
| **`project`** *(Default)* | `.ngc-devin/knowledge/` | Default (*"Record a project decision..."*) | Committed to Git and shared with teammates | Architecture decisions, repo-specific handoffs, project test rules |
| **`global`** | `~/.config/ngc-devin/knowledge/` | *"Record a **global** decision across all my repos..."* | Stored in user home directory; private to your machine | Personal standards, cross-repository business goals, general lessons |

> **Security Note**: Never store credentials, API keys, passwords, or secrets in any NGC Devin Context record.
