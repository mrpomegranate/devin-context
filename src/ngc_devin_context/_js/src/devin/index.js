const fs = require('node:fs');
const path = require('node:path');
const { stringifyConfig } = require('../config');

const START = '<!-- NGC-DEVIN-CONTEXT:START -->';
const END = '<!-- NGC-DEVIN-CONTEXT:END -->';

function agentsBlock() {
  return `${START}
# NGC Devin Context

For non-trivial work, run \`ndc brief --task "<task summary>"\` before planning or editing.
If the work maps to an OpenSpec or Spec-Kitty change, include \`--spec <id>\`.
Treat resolved specification artifacts as authoritative for feature requirements.
After validation, use \`ndc closeout\` to create a reviewable knowledge proposal when work produced a reusable decision, handoff, runbook, or lesson.
Never store secrets in NGC Devin Context records.
${END}`;
}

function skillTemplate() {
  return `---
name: ngc-devin-context
description: Load NGC Devin Context before non-trivial repository work and propose reviewed knowledge after validation.
---

# NGC Devin Context Workflow

1. Start non-trivial work with \`ndc brief --task "<task summary>"\`.
2. Add \`--spec <id>\` when a change ID is known.
3. Read the Context Pack before making plans or edits.
4. Treat linked OpenSpec or Spec-Kitty files as the authority for requirements, design, and tasks.
5. After validation, run \`ndc closeout\` for reusable knowledge. It creates a proposal; do not claim it is durable until a human approves it.
6. Do not write secrets, credentials, or sensitive values to context records.
`;
}

function upsertManagedBlock(current, block) {
  const start = current.indexOf(START);
  const end = current.indexOf(END);
  if (start === -1 || end === -1 || end < start) return `${current.trimEnd()}${current.trim() ? '\n\n' : ''}${block}\n`;
  return `${current.slice(0, start)}${block}${current.slice(end + END.length)}`;
}

function initializeProject(paths, config) {
  fs.mkdirSync(paths.projectConfigRoot, { recursive: true });
  fs.mkdirSync(paths.projectKnowledge, { recursive: true });
  fs.mkdirSync(paths.projectProposals, { recursive: true });
  if (!fs.existsSync(paths.projectConfig)) {
    fs.writeFileSync(paths.projectConfig, stringifyConfig({
      version: 1,
      integration: config.integration,
      validation: config.validation
    }));
  }
  fs.mkdirSync(path.dirname(paths.projectSkill), { recursive: true });
  fs.writeFileSync(paths.projectSkill, skillTemplate());
  const currentAgents = fs.existsSync(paths.agents) ? fs.readFileSync(paths.agents, 'utf8') : '';
  fs.writeFileSync(paths.agents, upsertManagedBlock(currentAgents, agentsBlock()));
  return [paths.projectConfig, paths.projectSkill, paths.agents];
}

module.exports = { initializeProject };
