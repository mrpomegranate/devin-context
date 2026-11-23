# NGC Devin Context: Positioning and Integration

## Purpose

NGC Devin Context is a clean-room, Devin-native persistent context and
knowledge layer. It addresses a recurring limitation of coding-agent work:
important project understanding is lost between sessions, repositories, and
handoffs.

The product should not be an OpenContext rebrand or a generic agent-memory
system. It should provide trusted, evidence-backed context to Devin before
work begins, then preserve validated knowledge after work is complete.

## The Core Problem

Specifications describe a proposed change, but they do not consistently retain
the operational and architectural knowledge Devin discovers while doing the
work. That information includes:

- Architectural tradeoffs and prior decisions
- Repository-specific conventions and constraints
- Known failure modes and debugging lessons
- Required validation commands and test limitations
- Evidence from Git commits, tests, pull requests, and source files
- Work state required for a reliable handoff to a new Devin session

Without a durable layer, a new Devin session must rediscover this material,
risks making incorrect assumptions, and can repeat work that has already been
done.

## Relationship to OpenSpec and Spec-Kitty

OpenSpec and Spec-Kitty are expected to be spec-driven development tools: they
organize the intent, requirements, design, implementation plan, and acceptance
criteria for a specific feature or change.

NGC Devin Context is complementary. It should use those spec artifacts as
authoritative inputs rather than copying or replacing them.

| Tool | Primary unit | Primary question | Typical lifetime |
| --- | --- | --- | --- |
| OpenSpec / Spec-Kitty | Feature, change, or task | What should be built, and how should this change be executed? | The change lifecycle |
| Devin CLI | Active working session | How should the requested work be investigated, implemented, and validated now? | One session or task |
| NGC Devin Context | Durable project and team knowledge | What must Devin know to work correctly, and what should be retained for future work? | Across sessions, specifications, and repositories |

### What NGC Devin Context Solves

NGC Devin Context provides capabilities that are usually outside the scope of a
feature-specification workflow:

1. **Cross-session continuity**  
   Preserve debugging discoveries, architecture tradeoffs, deployment caveats,
   and validated implementation knowledge after a Devin session ends.

2. **Cross-specification knowledge**  
   Store decisions about concerns such as authentication, telemetry,
   interfaces, data handling, and test conventions that affect multiple
   future changes.

3. **Task-aware context retrieval**  
   Give Devin the smallest useful Context Pack before work begins, rather than
   requiring it to read an entire documentation or specification library.

4. **Evidence and staleness tracking**  
   Link durable records to source files, line ranges, Git SHAs, test results,
   pull requests, and owners. Flag records when the implementation they cite
   has changed.

5. **Safe, human-approved learning**  
   Let Devin propose a lesson, decision, runbook, or handoff. Require a person
   to approve the proposal before it becomes persistent team guidance.

6. **Operational and governance knowledge**  
   Track runbooks, known failures, validation environments, security
   constraints, data-handling guidance, and ownership information that do not
   naturally belong in a single feature specification.

## Integration Model

OpenSpec or Spec-Kitty remains the source of truth for the feature
requirements, design, plan, and task list. NGC Devin Context resolves
additional project knowledge and produces a concise task-specific Context Pack
for Devin.

```text
OpenSpec / Spec-Kitty
  proposal, requirements, design, task list
             |
             | task identifier and stable artifact links
             v
NGC Devin Context
  project knowledge, decisions, handoffs, evidence, and risks
             |
             | Context Pack
             v
Devin CLI
  investigate, implement, validate, and report
             |
             | proposed durable knowledge
             v
NGC Devin Context
  handoff, decision, runbook, lesson, and validation evidence
             |
             v
Human review and approval
```

### Start-of-Task Workflow

For a request such as `OPS-184 telemetry retry policy`:

1. OpenSpec or Spec-Kitty supplies the authoritative requirements, design,
   tasks, and acceptance criteria.
2. `ndc brief --spec OPS-184` resolves:
   - Stable links to the specification artifacts
   - Related architecture decisions
   - Prior handoffs and operational lessons
   - Relevant source paths and recent Git changes
   - Required validation commands
   - Known risks, constraints, and owners
3. Devin receives a compact Context Pack such as:

   ```text
   Task: OPS-184 telemetry retry policy
   Authoritative spec: openspec/changes/ops-184/
   Relevant decisions: D-012 retry ownership; D-031 telemetry delivery semantics
   Constraints: no duplicate events; preserve offline behavior
   Existing risks: telemetry test fixture is flaky on Windows
   Validation: npm test -- telemetry; integration replay test
   ```

The specification remains the answer to “what.” The Context Pack adds the
relevant “what else must Devin know before acting?”

### End-of-Task Workflow

When Devin discovers reusable knowledge, it creates a proposal rather than
silently updating team memory. For example:

```markdown
# Decision: Client owns telemetry retry state

- Related spec: OPS-184
- Decision: Keep retry state in the client, not the backend queue.
- Rationale: Backend queue replay can duplicate events during reconnect.
- Evidence: commit `<sha>`, integration test `<path>`, investigation notes
- Applies to: all telemetry producers
- Owner: <team>
- Review by: <date>
```

After human approval, this decision can be retrieved for unrelated future
changes. It does not duplicate the feature specification; it captures a
durable rule proven during implementation.

## Product Principles

1. **Devin-native, not multi-agent by default**  
   Optimize for how Devin starts, performs, validates, and concludes work.

2. **Markdown-first and Git-reviewable**  
   Keep knowledge records portable, readable, diffable, and reviewable. Use a
   local database only for metadata and search indexing, not as the source of
   truth.

3. **Evidence before assertion**  
   Durable records should reference verifiable sources whenever practical.

4. **Least-context retrieval**  
   Return only the material needed for the current task to reduce cost, noise,
   and incorrect agent assumptions.

5. **Human approval for durable writes**  
   Treat agent-generated memory as a proposal until the appropriate owner
   approves it.

6. **Local-first and security-aware**  
   Default to local storage. Support repository, owner, sensitivity, and
   review metadata before adding organization-wide synchronization.

7. **No duplication of specification sources**  
   Store stable links and concise, approved interpretations of OpenSpec or
   Spec-Kitty artifacts. Do not copy requirements, plans, or task lists that
   already have an authoritative home.

## Proposed MVP

Build a CLI-first MVP in this repository. Avoid a desktop application,
automatic writes, external embedding services, and broad multi-agent support
until the core workflow has proven value.

### Commands

```text
ndc init
ndc brief --spec <spec-id>
ndc context pack --task "<task summary>"
ndc decision create "<title>"
ndc handoff create
ndc closeout
ndc search "<query>"
ndc status
```

### MVP Capabilities

- Initialize a managed NGC Devin Context block in project `AGENTS.md` without
  overwriting existing project guidance
- Create and retrieve task-specific Context Packs
- Store Markdown records for project profile, decisions, handoffs, runbooks,
  and lessons
- Perform local keyword and filename search
- Attach evidence references to source paths, line ranges, Git SHAs, tests,
  and specification artifacts
- Generate human-reviewable closeout proposals
- Warn about missing context, stale evidence, and unresolved handoff items

### Suggested Local Layout

```text
.ngc-devin/
  config.yaml
  knowledge/
    project-profile.md
    decisions/
    handoffs/
    runbooks/
    lessons/
  index.sqlite
  audit/
```

## Future Differentiators

- Permission-aware hybrid search across approved local content
- Context budgets that rank and limit retrieved material
- Automatic staleness detection for records whose referenced files or commits
  have changed
- Git and pull-request evidence integration
- Team ownership and review-date workflows
- Optional organization synchronization after local-first security and
  governance requirements are established

## Product Positioning

> NGC Devin Context is the trusted, governed memory and context layer for
> Devin. It connects specifications to repository evidence and carries
> validated knowledge from one Devin task to the next.

This product creates value only if it prevents repeated rediscovery, improves
the reliability of autonomous work, and preserves reviewed knowledge without
duplicating existing specification systems.
