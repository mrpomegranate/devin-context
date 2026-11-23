# Spec-Driven Development (SDD) for Agentic Coding

> **Core Principle**: Agentic coding makes implementation faster. Spec-Driven Development ensures that speed remains aligned with the correct problem, scope, constraints, and definition of done.

---

## The Manufacturing Analogy: CNC Machining vs. Casual Prompts

Imagine telling a robotic 5-axis CNC milling machine: *"Fabricate an aluminum bracket for the satellite propulsion module."*

The robot will cut metal at blinding speed. But without an engineering blueprint specifying **tolerances (±0.002 mm)**, **alloy grade (Al 7075-T6)**, and **load test criteria**, the resulting part is scrap metal.

**AI coding agents are high-speed software machines. Specifications are the digital engineering blueprints that guarantee flight-readiness.**

---

## 1. The Problem: Fast Code ≠ Right Code

Autonomous coding agents (like Devin) can generate multi-file diffs, run tests, and iterate on failures in minutes. The primary engineering bottleneck has changed:
- **Old Question:** *"Can we write this code fast enough?"*
- **New Question:** *"Did the agent build the exact required behavior within strict boundary constraints, and can we prove it?"*

### Where Prompts Fail vs. How SDD Protects Quality

| Casual Prompting (High Risk) | Spec-Driven Development (SDD) |
| :--- | :--- |
| **Ambiguous Requirements**: Agent invents unverified assumptions | **Explicit Contract**: Scope defines what is included and excluded |
| **Scope Creep**: Agent refactors neighboring code unnecessarily | **Boundary Enforcement**: Agent only edits modules mapped to the spec |
| **Weak Tests**: Agent writes tests confirming its own code | **Acceptance Criteria**: Pre-defined tests govern completion |
| **Hidden Constraints**: Security & safety limits omitted in chat | **Audit Trail**: Specifications are version-controlled in Git |

---

## 2. Tooling: How OpenSpec and Spec-Kitty Power SDD

Spec-Driven Development relies on structured tooling to bridge human intent with autonomous agent execution:

### OpenSpec: The Specification and Change Artifact Framework
OpenSpec provides a standardized, version-controlled format for capturing system requirements and proposed changes in Git (`openspec/changes/<id>/`).

**How OpenSpec Helps SDD:**
- **Separates "What" from "How"**: Focuses on desired system behavior, scenarios, and constraints rather than prescribing low-level code implementation.
- **Traceable Change Artifacts**: Organizes work into `spec.md` (requirements and scenarios), `design.md` (architecture), and `tasks.md` (verifiable task roadmap).
- **Reviewable Engineering Contracts**: Gives team leads and reviewers a focused artifact to evaluate and approve before code generation begins.

### Spec-Kitty: The Human-Agent Workflow Orchestrator
Spec-Kitty operationalizes SDD by guiding developers and agents through a disciplined step-by-step development sequence.

**How Spec-Kitty Helps SDD:**
- **Deep Specification Interviews**: Interrogates the engineer upfront to uncover hidden assumptions, boundary conditions, and mathematical limits before coding starts.
- **Dual-Design Planning**: Sketches module boundaries and compares alternative architectural designs for minimal complexity and clean interfaces.
- **Isolated Work Packages (WPs)**: Decomposes specifications into self-contained, verifiable tasks that keep agents focused strictly inside the change scope.
- **Automated Diff Auditing**: Checks generated code against acceptance criteria, ensuring no silent fallbacks, unmanaged I/O, or rule violations are introduced.

---

## 3. The 5-Step SDD Workflow in Practice

1. **Specify (Deep Interview)**: Spec-Kitty interviews the engineer to clarify telemetry inputs, sampling rates, failure modes, and mathematical tolerances before writing code.
2. **Plan (Design Twice)**: The agent sketches function signatures and module boundaries in `plan.md`, comparing alternative designs for minimal complexity.
3. **Work Packages (Focused Execution)**: The change is broken into atomic, isolated Work Packages (WPs). The agent writes code strictly inside WP boundaries.
4. **Review (Spec Compliance Audit)**: Human reviewer checks the diff against the spec's acceptance criteria, checking for scope creep, missing timeouts, or silent fallbacks.
5. **Retrospective (Preserve Lessons)**: Post-merge discoveries are captured permanently so future sessions inherit the validated knowledge.

---

## 4. Real-World Manufacturing Telemetry Example

### The Ambiguous Prompt (High Risk)
> *"Devin, add anomaly detection for torque telemetry on the solar array assembly line."*
> 
> *(Outcome: Devin guesses default thresholds, uses arbitrary sliding windows, misses factory shift schedules, and writes unit tests validating its own guesses).*

---

### The OpenSpec & Spec-Kitty Change Contract (Deterministic Outcome)

```markdown
# Change Spec: Torque Telemetry Anomaly Detection (MFG-204)

## 1. Intent & Scope
- Monitor torque telemetry from Assembly Station 4 (Solar Array Hinge Drive).
- Detect mechanical binding and thread-stripping events in real time.
- Excluded: Calibrating torque wrench hardware.

## 2. Behavioral Requirements & Constraints
- Algorithm: Exponentially Weighted Moving Average (EWMA) with smoothing factor alpha = 0.2.
- Sampling rate: 100 Hz streams.
- Safety Threshold: Flag anomaly if torque exceeds 12.5 N·m or rate-of-change > 4.0 N·m/sec.
- Clocks & Time: All timestamps must be in UTC; passed into functions, never generated internally.

## 3. Boundary & Error Handling (Fail Fast)
- Out-of-range sensor readings (< 0 N·m or > 25 N·m) indicate disconnect; raise SensorFaultError immediately.
- Never return dummy 0.0 N·m values or swallow telemetry socket disconnects.

## 4. Acceptance Criteria
- [ ] Synthetic anomaly test suite validates detection of step shifts and linear drift.
- [ ] Processing latency is under 5ms per 1,000 telemetry samples.
- [ ] 100% of unit tests pass with hermetic mock sensor streams.
```

---

## Summary Principle

> **Agentic coding accelerates delivery. Spec-Driven Development ensures it accelerates the *right* delivery.**
