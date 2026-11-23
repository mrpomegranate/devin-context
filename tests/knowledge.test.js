const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { getPaths } = require('../src/config/paths');
const { initializeProject } = require('../src/devin');
const { approveProposal, listRecords, writeProposal } = require('../src/knowledge');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'devin-context-knowledge-'));
  const projectRoot = path.join(root, 'project');
  const globalRoot = path.join(root, 'global');
  fs.mkdirSync(projectRoot, { recursive: true });
  return { projectRoot, env: { ...process.env, DEVIN_CONTEXT_HOME: globalRoot } };
}

test('initialization preserves existing AGENTS content and creates the Devin skill', () => {
  const { projectRoot, env } = fixture();
  const paths = getPaths(projectRoot, env);
  fs.writeFileSync(paths.agents, '# Existing guidance\n');

  initializeProject(paths, { integration: { provider: 'auto', roots: { openspec: 'openspec', specKitty: '.specify' } }, validation: { commands: [] } });

  const agents = fs.readFileSync(paths.agents, 'utf8');
  assert.match(agents, /# Existing guidance/);
  assert.match(agents, /DEVIN-CONTEXT:START/);
  assert.match(agents, /devin-context brief/);
  assert.ok(fs.existsSync(paths.projectSkill));
  assert.match(fs.readFileSync(paths.projectSkill, 'utf8'), /devin-context brief/);
});

test('project proposals require approval before becoming durable knowledge', () => {
  const { projectRoot, env } = fixture();
  const paths = getPaths(projectRoot, env);
  fs.mkdirSync(paths.projectProposals, { recursive: true });
  const proposal = writeProposal(paths, { type: 'decision', title: 'Use local evidence', body: 'Keep evidence local.' });

  assert.equal(listRecords(paths.projectKnowledge).length, 0);
  const approved = approveProposal(paths, proposal.filePath);

  assert.ok(fs.existsSync(approved.filePath));
  assert.equal(listRecords(paths.projectKnowledge).length, 1);
  assert.equal(listRecords(paths.projectKnowledge)[0].status, 'approved');
});

test('global records require explicit CLI-equivalent approval', () => {
  const { projectRoot, env } = fixture();
  const paths = getPaths(projectRoot, env);

  assert.throws(() => writeProposal(paths, { type: 'lesson', title: 'Shared guidance', scope: 'global' }), /require explicit CLI confirmation/);
  const record = writeProposal(paths, { type: 'lesson', title: 'Shared guidance', scope: 'global', approved: true });

  assert.ok(fs.existsSync(record.filePath));
  assert.equal(listRecords(paths.globalKnowledge)[0].status, 'approved');
});
