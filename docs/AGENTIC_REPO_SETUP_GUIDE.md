# Standard Agentic Repository Setup Guide

A complete blueprint for setting up new software repositories optimized for **team collaboration with AI coding agents (such as Devin)**.

---

## The Agentic Repository Blueprint

```text
my-new-repo/
├── .devin/
│   └── skills/                   # Repository-specific Devin skills
├── .github/
│   ├── workflows/
│   │   └── ci.yml                # Automated CI test & lint pipeline
│   ├── CODEOWNERS                # Mandatory human review on sensitive code
│   └── pull_request_template.md  # Standardized PR checklist & evidence format
├── .devin-context/               # Devin Context (durable memory & decisions)
│   ├── config.yaml
│   ├── knowledge/
│   └── proposals/
├── .gitignore                    # Includes secrets, virtualenvs, & personal overrides
├── .pre-commit-config.yaml       # Fast local secret scanning & linting hooks
├── .python-version               # Pinned Python version (e.g. 3.11)
├── AGENTS.md                     # Root operating instructions for AI agents
├── README.md                     # Project overview, installation, and quickstart
├── pyproject.toml                # Dependencies, dev groups, & build configuration
└── uv.lock                       # Deterministic lockfile for reproducible environments
```

---

## 1. Root Agent Operating Instructions (`AGENTS.md`)

`AGENTS.md` is the first file Devin reads when starting a session. It contains concise, deterministic operating rules and dependency classification instructions so Devin knows exactly how to work.

### Template: `AGENTS.md`
```markdown
# Repository Agent Guidelines

## 1. Environment & Tooling
- **Python**: `>=3.10` (use `uv` for package & virtualenv management)
- **Node.js**: `>=20` (if applicable)

## 2. Dependency Management Rules (uv)
When adding any new package, categorize it strictly:
- **Production (`uv add <pkg>`)**: Only packages directly imported by application runtime code in `src/` (e.g., `polars`, `pydantic`, `fastapi`).
- **Development (`uv add --dev <pkg>`)**: All test libraries (`pytest`, `pytest-mock`, `responses`), linters/formatters (`ruff`), type checkers (`mypy`), build tools (`build`, `twine`), and `pre-commit`. Never add test or lint tools to production dependencies.
- **Optional Extras (`uv add --optional <group> <pkg>`)**: Heavy or situational dependencies (e.g., `matplotlib` under `plot`, `sphinx` under `docs`, `torch-cuda` under `gpu`).

## 3. Fast Verification Commands
Run verification tests before finishing any task:
- Unit tests: `uv run pytest -m unit` (or `npm test`)
- Lint & formatting: `uv run ruff check . && uv run ruff format --check`
- Type checking: `uv run mypy src/`

## 4. Engineering & Architecture Rules
- Follow existing directory structure and patterns in `src/`.
- Check for nested module rules: Before modifying files in any subpackage, check if `src/<module>/AGENTS.md` exists and follow its domain rules. Root safety rules always take precedence.
- Creating & updating module rules: When establishing a permanent rule or constraint for a subpackage, create `src/<module>/AGENTS.md` (or update it if it exists) and record an accompanying decision via `devin-context decision create`.
- Fail fast: Fail immediately on invalid state or missing configuration; never write silent fallbacks or swallow exceptions.
- Never hardcode credentials, tokens, passwords, or PII.
- Keep unit tests hermetic (mock all external network requests using fixtures).
- For non-trivial work, run `devin-context brief --task "<summary>"` before modifying code.
- Record any lasting technical or business decisions using `devin-context decision create`.

## 5. Git & PR Conventions
- Work in dedicated feature branches (`feat/`, `fix/`).
- Never force-push or commit directly to `main`.
```

### Personal Overrides in `.gitignore`
Allow individual developers to have local-only preferences without dirtying Git commits:
```gitignore
# .gitignore
*.local.md
AGENTS.local.md
.devin/*.local.*
.env
.venv/
dist/
build/
```

---

## 2. Python Environment & Dependency Management with `uv`

`uv` is the standard package and environment manager for modern Python projects. It provides sub-second virtualenv creation, deterministic locking, and clean separation between production, development, and optional dependencies.

### 1. Pinning Python Version & Creating Virtual Environment
Pin the Python version for all teammates and agents:
```bash
# Pin version in .python-version file
echo "3.11" > .python-version

# Create virtual environment (.venv)
uv venv
```

---

### 2. Dependency Classification Decision Framework (Agent Decision Tree)

When Devin or a developer introduces a new package, use this 3-question decision tree to determine its exact category:

```text
                     Is this package imported in `src/` 
                     for the core application to run?
                               │
                ┌──────────────┴──────────────┐
               YES                            NO
                │                             │
    Is it only needed for             Is it a tool for testing,
   heavy optional features?           linting, typing, or building?
   (e.g., GPU, Docs, Plots)                   │
        │             │               ┌───────┴───────┐
       YES            NO             YES              NO
        │             │               │               │
  ┌───────────┐ ┌───────────┐   ┌───────────┐   ┌───────────┐
  │ OPTIONAL  │ │PRODUCTION │   │DEVELOPMENT│   │  REJECT/  │
  │  EXTRAS   │ │DEPENDENCY │   │ TOOLING   │   │ UNNEEDED  │
  └───────────┘ └───────────┘   └───────────┘   └───────────┘
```

#### Detailed Category Breakdown

| Category | In `pyproject.toml` | How to Add | When to Use | Common Examples |
| :--- | :--- | :--- | :--- | :--- |
| **Production** | `[project.dependencies]` | `uv add <pkg>` | **Mandatory runtime code.** Without this package, `import <pkg>` in `src/` will fail with `ModuleNotFoundError` when deployed. | `polars`, `pandas`, `pydantic`, `fastapi`, `sqlalchemy`, `requests`, `pyyaml` |
| **Development** | `[dependency-groups.dev]` | `uv add --dev <pkg>` | **Developer & agent tools.** Required for tests, formatting, linting, type-checking, or building packages. Never shipped to end users. | `pytest`, `pytest-cov`, `pytest-mock`, `responses`, `ruff`, `mypy`, `pre-commit`, `build`, `twine` |
| **Optional Extras** | `[project.optional-dependencies]` | `uv add --optional <group> <pkg>` | **Situational features.** Heavy libraries only needed by users who opt into specific submodules (e.g. plotting, docs, cloud backends). | `matplotlib`, `seaborn` (`[plot]`), `sphinx`, `furo` (`[docs]`), `boto3` (`[s3]`), `torch-cuda` (`[gpu]`) |

---

### 3. Example `pyproject.toml` with `uv` Dependency Groups

```toml
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-project"
version = "0.1.0"
description = "High-performance telemetry service."
readme = "README.md"
requires-python = ">=3.10"

# 1. Production Dependencies (Required at runtime)
dependencies = [
    "polars>=0.20.0",
    "pydantic>=2.5.0",
    "pyyaml>=6.0",
]

# 2. Development & Agent Tooling (PEP 735 Standard)
[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "pytest-cov>=4.1.0",
    "pytest-mock>=3.12.0",
    "responses>=0.25.0",
    "ruff>=0.3.0",
    "mypy>=1.8.0",
    "pre-commit>=3.6.0",
    "build>=1.1.0",
    "twine>=5.0.0",
]

# 3. Optional Feature Sets (Installed on demand: pip install my-project[docs,plot])
[project.optional-dependencies]
docs = [
    "sphinx>=7.0.0",
    "furo>=2024.1.29",
]
plot = [
    "matplotlib>=3.8.0",
    "seaborn>=0.13.0",
]
```

---

### 4. Deterministic Syncing & Lockfile Usage

```bash
# 1. Update/generate deterministic lockfile (uv.lock)
uv lock

# 2. Local Development & Devin Sessions (Installs prod + dev tools)
uv sync

# 3. Production Deployments / Docker Containers (Installs ONLY production packages)
uv sync --no-dev

# 4. Install with specific optional groups
uv sync --group docs --extra plot
```

### 5. Running Commands Without Activating Venv
Devin and teammates can run any tool directly inside the managed environment:
```bash
uv run pytest
uv run ruff check .
uv run mypy src/
```

---

## 3. Persistent Context & Memory (`devin-context`)

Prevent **"Agent Amnesia"** across sessions by initializing Devin Context:

### Step 1: Initialize Devin Context
```bash
devin-context init
```
This automatically configures `.devin-context/config.yaml`, sets up knowledge folders (`decisions/`, `handoffs/`, `lessons/`), and installs the Devin project skill.

### Step 2: Configure Validation in `.devin-context/config.yaml`
```yaml
version: 1
integration:
  provider: auto
validation:
  commands:
    - uv run pytest -m unit
    - uv run ruff check .
```

---

## 4. Pre-Commit Hooks (Local Guardrails)

Pre-commit hooks catch secret leaks and syntax errors **before** commits leave the developer's or Devin's machine.

### Template: `.pre-commit-config.yaml`
```yaml
repos:
  # 1. Secret Scanning (Mandatory)
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.2
    hooks:
      - id: gitleaks

  # 2. Fast Python Linting & Formatting (Sub-second)
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.3.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  # 3. Standard File Hygiene
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: ['--maxkb=1000']
```

Install hooks locally once:
```bash
uv run pre-commit install
```

---

## 5. GitHub Actions CI/CD Pipeline

Automated checks ensure that pull requests satisfy all test, typing, and build standards before merging.

### Template: `.github/workflows/ci.yml`
```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Lint, Typecheck & Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up uv
        uses: astral-sh/setup-uv@v3
        with:
          version: "latest"
          enable-cache: true

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version-file: ".python-version"

      - name: Install Dependencies
        run: uv sync

      - name: Run Linters & Secret Scanner
        run: |
          uv run ruff check .
          uv run ruff format --check .

      - name: Run Type Checks
        run: |
          uv run mypy src/

      - name: Run Test Suite
        run: |
          uv run pytest --cov=src --cov-report=term-missing

      - name: Verify Package Build Artifacts (if publishing)
        run: |
          uv run python -m build
          uv run twine check dist/*
```

---

## 6. Pull Request Templates & Governance

Enforce structured pull requests so both humans and agents provide clear evidence and decision records.

### Template: `.github/pull_request_template.md`
```markdown
## Summary of Changes
<!-- Provide 2-3 bullet points describing what changed and why -->

## Motivation & Context
<!-- Why is this change necessary? Links to Jira / GitHub Issue / Spec ID -->

## Architectural Decisions Recorded
<!-- List any .devin-context/knowledge/ decisions, handoffs, or lessons added -->
- [ ] No new architectural decisions required
- [ ] Recorded decision: `.devin-context/knowledge/decisions/...`

## Verification & Testing Evidence
- [ ] Unit tests pass locally (`uv run pytest`)
- [ ] Added test coverage for new edge cases
- [ ] Verified no sensitive credentials/tokens in diff

## Checklist
- [ ] Code follows project formatting and style guidelines
- [ ] Self-reviewed the diff against `main`
```

### Template: `.github/CODEOWNERS`
Ensure critical areas require human approval:
```text
# Global fallback
* @my-team-leads

# Sensitive architecture, configuration, and CI
/.github/workflows/   @lead-architect
/src/config/          @lead-architect
/.devin-context/          @lead-architect
```

---

## 7. One-Shot Prompt to Set Up Any New Repository

When you create a brand-new repository, you can paste this exact prompt to Devin to set everything up in one turn:

```text
"Devin, please set up this new repository according to our standard agentic repository guidelines:
1. Create .python-version pinned to 3.11.
2. Create pyproject.toml with production dependencies in [project.dependencies], dev tools (pytest, ruff, mypy, pre-commit, build, twine) in [dependency-groups.dev], and optional extras in [project.optional-dependencies].
3. Run `uv venv` and `uv lock && uv sync` to create the environment and lockfile.
4. Create a clean AGENTS.md with explicit dependency classification rules and uv run verification commands.
5. Initialize Devin Context by running `devin-context init` and configuring test commands in `.devin-context/config.yaml`.
6. Add .pre-commit-config.yaml with gitleaks, ruff, and pre-commit-hooks.
7. Add .github/pull_request_template.md and .github/CODEOWNERS.
8. Add .github/workflows/ci.yml using astral-sh/setup-uv for automated testing and package verification.
9. Update .gitignore to include *.local.md, AGENTS.local.md, .venv/, .env, and build artifacts.
10. Run validation (uv run pytest, uv run ruff check) to verify everything passes."
```
